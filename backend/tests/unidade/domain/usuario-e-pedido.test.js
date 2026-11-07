import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { garantirSenhaForte, criarUsuario, paraUsuarioPublico } from '../../../src/application/domain/usuario.js';
import { criarEnderecoEntrega } from '../../../src/application/domain/endereco.js';
import { criarPedido } from '../../../src/application/domain/pedido.js';
import { ErroValidacao } from '../../../src/application/domain/erros.js';
import { montarPropsEnderecoEntrega } from '../../suporte/montadores.js';

const CRIADO_EM = new Date('2026-11-06T12:00:00Z');

describe('usuário', () => {
  it('normaliza o e-mail e oculta o hash da senha na visão pública', () => {
    const usuario = criarUsuario({ id: 'u1', nome: 'Maria', email: ' Maria@Example.COM ', hashSenha: 'h', criadoEm: CRIADO_EM });
    assert.equal(usuario.email, 'maria@example.com');
    assert.deepEqual(paraUsuarioPublico(usuario), { id: 'u1', nome: 'Maria', email: 'maria@example.com' });
  });

  it('rejeita e-mails inválidos', () => {
    const propriedades = { id: 'u1', nome: 'Maria', email: 'not-an-email', hashSenha: 'h', criadoEm: CRIADO_EM };
    assert.throws(() => criarUsuario(propriedades), ErroValidacao);
  });

  it('exige senhas com ao menos oito caracteres, uma letra e um dígito', () => {
    for (const fraca of ['short1', 'onlyletters', '12345678']) {
      assert.throws(() => garantirSenhaForte(fraca), ErroValidacao);
    }
    assert.doesNotThrow(() => garantirSenhaForte('miau1234'));
  });
});

describe('endereço de entrega', () => {
  it('normaliza o CEP e o estado', () => {
    const endereco = criarEnderecoEntrega(montarPropsEnderecoEntrega({ estado: 'rs' }));
    assert.equal(endereco.cep, '90010000');
    assert.equal(endereco.estado, 'RS');
    assert.equal(endereco.complemento, '');
  });

  it('rejeita estado inválido', () => {
    assert.throws(() => criarEnderecoEntrega(montarPropsEnderecoEntrega({ estado: 'Rio' })), ErroValidacao);
  });
});

describe('pedido', () => {
  const propsBase = {
    id: 'o1',
    usuarioId: 'u1',
    linhas: [{ produtoId: 'a', nome: 'Wand', precoUnitarioCentavos: 1000, quantidade: 2, totalLinhaCentavos: 2000 }],
    subtotalCentavos: 2000,
    descontoCentavos: 200,
    freteCentavos: 1290,
    enderecoEntrega: criarEnderecoEntrega(montarPropsEnderecoEntrega()),
    pagamento: { method: 'PIX', transacaoId: 'tx-1' },
    criadoEm: CRIADO_EM,
  };

  it('calcula o total como subtotal menos desconto mais frete', () => {
    assert.equal(criarPedido(propsBase).totalCentavos, 3090);
  });

  it('rejeita pedido sem linhas', () => {
    assert.throws(() => criarPedido({ ...propsBase, linhas: [] }), ErroValidacao);
  });
});
