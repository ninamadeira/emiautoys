import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ErroEmailJaCadastrado,
  ErroCredenciaisInvalidas,
  ErroNaoAutorizado,
  ErroValidacao,
} from '../../../src/application/domain/erros.js';
import { montarAmbiente, dadoProduto } from '../../suporte/ambiente.js';
import { SENHA_VALIDA } from '../../suporte/montadores.js';

const CADASTRO = { nome: 'Maria', email: 'maria@example.com', senha: SENHA_VALIDA };

describe('contas', () => {
  it('cadastra um usuário sem expor o hash da senha', async () => {
    const ambiente = montarAmbiente();
    const usuario = await ambiente.cadastrarUsuario.executar(CADASTRO);
    assert.deepEqual(Object.keys(usuario).sort(), ['email', 'id', 'nome']);
  });

  it('guarda apenas o hash da senha', async () => {
    const ambiente = montarAmbiente();
    const usuario = await ambiente.cadastrarUsuario.executar(CADASTRO);
    const stored = await ambiente.repositorioUsuario.buscarPorId(usuario.id);
    assert.notEqual(stored.hashSenha, SENHA_VALIDA);
  });

  it('rejeita e-mail duplicado independentemente de maiúsculas', async () => {
    const ambiente = montarAmbiente();
    await ambiente.cadastrarUsuario.executar(CADASTRO);
    const duplicado = { ...CADASTRO, email: 'MARIA@example.com' };
    await assert.rejects(ambiente.cadastrarUsuario.executar(duplicado), ErroEmailJaCadastrado);
  });

  it('rejeita senhas fracas', async () => {
    const ambiente = montarAmbiente();
    await assert.rejects(
      ambiente.cadastrarUsuario.executar({ ...CADASTRO, senha: 'fraca' }),
      ErroValidacao,
    );
  });

  it('autentica com credenciais corretas e devolve um token', async () => {
    const ambiente = montarAmbiente();
    await ambiente.cadastrarUsuario.executar(CADASTRO);
    const sessao = await ambiente.autenticarUsuario.executar({ email: 'maria@example.com', senha: SENHA_VALIDA });
    assert.ok(sessao.token);
    assert.equal(sessao.usuario.email, 'maria@example.com');
  });

  it('dá o mesmo erro para e-mail desconhecido e senha errada', async () => {
    const ambiente = montarAmbiente();
    await ambiente.cadastrarUsuario.executar(CADASTRO);
    const senhaIncorreta = { email: 'maria@example.com', senha: 'wrong1234' };
    const emailDesconhecido = { email: 'nobody@example.com', senha: SENHA_VALIDA };
    await assert.rejects(ambiente.autenticarUsuario.executar(senhaIncorreta), ErroCredenciaisInvalidas);
    await assert.rejects(ambiente.autenticarUsuario.executar(emailDesconhecido), ErroCredenciaisInvalidas);
  });

  it('resolve uma sessão válida e rejeita um token inválido', async () => {
    const ambiente = montarAmbiente();
    const usuario = await ambiente.cadastrarUsuario.executar(CADASTRO);
    const { token } = await ambiente.autenticarUsuario.executar({ email: usuario.email, senha: SENHA_VALIDA });
    assert.equal((await ambiente.verificarSessao.executar({ token })).usuarioId, usuario.id);
    await assert.rejects(ambiente.verificarSessao.executar({ token: 'garbage' }), ErroNaoAutorizado);
  });

  it('exclui a conta com seu carrinho e pedidos (eliminação LGPD)', async () => {
    const ambiente = montarAmbiente();
    const usuario = await ambiente.cadastrarUsuario.executar(CADASTRO);
    const produto = await dadoProduto(ambiente);
    await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: usuario.id, produtoId: produto.id, quantidade: 1 });
    await ambiente.excluirConta.executar({ usuarioId: usuario.id });
    assert.equal(await ambiente.repositorioUsuario.buscarPorId(usuario.id), undefined);
    assert.equal((await ambiente.repositorioCarrinho.buscarPorUsuarioId(usuario.id)).itens.length, 0);
    assert.deepEqual(await ambiente.obterPedidos.executar({ usuarioId: usuario.id }), []);
  });
});
