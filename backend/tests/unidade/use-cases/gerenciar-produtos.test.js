import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ErroAcessoProibido,
  ErroProdutoInseguro,
  ErroProdutoNaoEncontrado,
  ErroValidacao,
} from '../../../src/application/domain/erros.js';
import { criarUsuario } from '../../../src/application/domain/usuario.js';
import { EMAIL_ADMINISTRADOR, montarAmbiente, dadoProduto } from '../../suporte/ambiente.js';
import { montarPropsProduto } from '../../suporte/montadores.js';

async function dadoUsuario(ambiente, { id, email }) {
  await ambiente.repositorioUsuario.salvar(criarUsuario({ id, nome: 'Pessoa', email, hashSenha: 'hash' }));
  return id;
}

function montarDadosNovoProduto(sobrescritas = {}) {
  const dados = montarPropsProduto(sobrescritas);
  delete dados.id;
  return dados;
}

describe('cadastro de produtos', () => {
  it('permite ao administrador cadastrar um produto novo', async () => {
    const ambiente = montarAmbiente();
    const adminId = await dadoUsuario(ambiente, { id: 'admin', email: EMAIL_ADMINISTRADOR });
    const produto = await ambiente.cadastrarProduto.executar({ usuarioId: adminId, dados: montarDadosNovoProduto() });
    assert.ok(produto.id);
    assert.equal((await ambiente.obterProduto.executar({ produtoId: produto.id })).nome, 'Feather wand');
  });

  it('recusa quem não é administrador', async () => {
    const ambiente = montarAmbiente();
    const clienteId = await dadoUsuario(ambiente, { id: 'cliente', email: 'cliente@example.com' });
    await assert.rejects(
      ambiente.cadastrarProduto.executar({ usuarioId: clienteId, dados: montarDadosNovoProduto() }),
      ErroAcessoProibido,
    );
    assert.equal((await ambiente.listarProdutos.executar()).length, 0);
  });

  it('recusa produto com risco proibido e preço inválido', async () => {
    const ambiente = montarAmbiente();
    const adminId = await dadoUsuario(ambiente, { id: 'admin', email: EMAIL_ADMINISTRADOR });
    const perigoso = montarDadosNovoProduto({ rotulosRisco: ['FIO_SOLTO_LONGO'] });
    await assert.rejects(ambiente.cadastrarProduto.executar({ usuarioId: adminId, dados: perigoso }), ErroProdutoInseguro);
    const semPreco = montarDadosNovoProduto({ precoCentavos: 0 });
    await assert.rejects(ambiente.cadastrarProduto.executar({ usuarioId: adminId, dados: semPreco }), ErroValidacao);
  });
});

describe('alteração de produtos', () => {
  it('permite ao administrador alterar o preço e mantém os demais campos', async () => {
    const ambiente = montarAmbiente();
    const adminId = await dadoUsuario(ambiente, { id: 'admin', email: EMAIL_ADMINISTRADOR });
    await dadoProduto(ambiente, { id: 'a', precoCentavos: 1000, estoque: 5 });
    const produto = await ambiente.alterarProduto.executar({ usuarioId: adminId, produtoId: 'a', dados: { precoCentavos: 1500 } });
    assert.equal(produto.precoCentavos, 1500);
    assert.equal(produto.estoque, 5);
    assert.equal(produto.id, 'a');
  });

  it('recusa quem não é administrador e não altera o preço', async () => {
    const ambiente = montarAmbiente();
    const clienteId = await dadoUsuario(ambiente, { id: 'cliente', email: 'cliente@example.com' });
    await dadoProduto(ambiente, { id: 'a', precoCentavos: 1000 });
    await assert.rejects(
      ambiente.alterarProduto.executar({ usuarioId: clienteId, produtoId: 'a', dados: { precoCentavos: 1 } }),
      ErroAcessoProibido,
    );
    assert.equal((await ambiente.obterProduto.executar({ produtoId: 'a' })).precoCentavos, 1000);
  });

  it('falha para produto inexistente ou preço inválido', async () => {
    const ambiente = montarAmbiente();
    const adminId = await dadoUsuario(ambiente, { id: 'admin', email: EMAIL_ADMINISTRADOR });
    await dadoProduto(ambiente, { id: 'a' });
    await assert.rejects(
      ambiente.alterarProduto.executar({ usuarioId: adminId, produtoId: 'fantasma', dados: { precoCentavos: 100 } }),
      ErroProdutoNaoEncontrado,
    );
    await assert.rejects(
      ambiente.alterarProduto.executar({ usuarioId: adminId, produtoId: 'a', dados: { precoCentavos: 12.5 } }),
      ErroValidacao,
    );
  });

  it('o carrinho passa a mostrar o preço novo, pois o preço é lido do produto', async () => {
    const ambiente = montarAmbiente();
    const adminId = await dadoUsuario(ambiente, { id: 'admin', email: EMAIL_ADMINISTRADOR });
    await dadoProduto(ambiente, { id: 'a', precoCentavos: 1000 });
    await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: 'cliente', produtoId: 'a', quantidade: 2 });
    await ambiente.alterarProduto.executar({ usuarioId: adminId, produtoId: 'a', dados: { precoCentavos: 1500 } });
    assert.equal((await ambiente.obterCarrinho.executar({ usuarioId: 'cliente' })).subtotalCentavos, 3000);
  });
});
