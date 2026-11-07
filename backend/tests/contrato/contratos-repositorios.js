import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adicionarItem, criarCarrinhoVazio } from '../../src/application/domain/carrinho.js';
import { criarCupom } from '../../src/application/domain/cupom.js';
import { criarEnderecoEntrega } from '../../src/application/domain/endereco.js';
import { ErroEstoqueInsuficiente, ErroProdutoNaoEncontrado } from '../../src/application/domain/erros.js';
import { criarPedido } from '../../src/application/domain/pedido.js';
import { criarProduto } from '../../src/application/domain/produto.js';
import { criarUsuario } from '../../src/application/domain/usuario.js';
import { garantirQueImplementaPorta } from '../../src/application/ports/definir-porta.js';
import { RepositorioCarrinho } from '../../src/application/ports/out/repositorio-carrinho.js';
import { RepositorioCupom } from '../../src/application/ports/out/repositorio-cupom.js';
import { RepositorioPedido } from '../../src/application/ports/out/repositorio-pedido.js';
import { RepositorioProduto } from '../../src/application/ports/out/repositorio-produto.js';
import { RepositorioUsuario } from '../../src/application/ports/out/repositorio-usuario.js';
import { montarPropsProduto, montarPropsEnderecoEntrega } from '../suporte/montadores.js';

const CRIADO_EM = new Date('2026-11-06T12:00:00Z');

function montarUsuario(sobrescritas = {}) {
  return criarUsuario({
    id: 'u1',
    nome: 'Maria',
    email: 'maria@example.com',
    hashSenha: 'hash',
    criadoEm: CRIADO_EM,
    ...sobrescritas,
  });
}

function montarPedido(sobrescritas = {}) {
  return criarPedido({
    id: 'o1',
    usuarioId: 'u1',
    linhas: [{ produtoId: 'a', nome: 'Wand', precoUnitarioCentavos: 1000, quantidade: 2, totalLinhaCentavos: 2000 }],
    subtotalCentavos: 2000,
    descontoCentavos: 0,
    freteCentavos: 1290,
    codigoCupom: undefined,
    enderecoEntrega: criarEnderecoEntrega(montarPropsEnderecoEntrega()),
    pagamento: { method: 'PIX', transacaoId: 'tx-1' },
    criadoEm: CRIADO_EM,
    ...sobrescritas,
  });
}

export function executarContratoRepositorioProduto(nome, criarRepositorio) {
  describe(`contrato de RepositorioProduto: ${nome}`, () => {
    it('implementa a porta', async () => {
      garantirQueImplementaPorta(RepositorioProduto, await criarRepositorio());
    });

    it('salva, encontra e lista produtos', async () => {
      const repositorio = await criarRepositorio();
      const produto = criarProduto(montarPropsProduto({ id: 'a' }));
      await repositorio.salvar(produto);
      assert.deepEqual(await repositorio.buscarPorId('a'), produto);
      assert.equal((await repositorio.buscarTodos()).length, 1);
      assert.equal(await repositorio.buscarPorId('fantasma'), undefined);
    });

    it('atualiza um produto existente ao salvar', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'a', precoCentavos: 1000 })));
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'a', precoCentavos: 2000 })));
      assert.equal((await repositorio.buscarPorId('a')).precoCentavos, 2000);
      assert.equal((await repositorio.buscarTodos()).length, 1);
    });

    it('encontra vários produtos por id ignorando ids desconhecidos', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'a' })));
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'b' })));
      const encontrados = await repositorio.buscarPorIds(['a', 'fantasma', 'b']);
      assert.deepEqual(encontrados.map((produto) => produto.id).sort(), ['a', 'b']);
      assert.deepEqual(await repositorio.buscarPorIds([]), []);
    });

    it('reserva e libera estoque', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'a', estoque: 5 })));
      await repositorio.reservarEstoque({ produtoId: 'a', quantidade: 2 });
      assert.equal((await repositorio.buscarPorId('a')).estoque, 3);
      await repositorio.liberarEstoque({ produtoId: 'a', quantidade: 2 });
      assert.equal((await repositorio.buscarPorId('a')).estoque, 5);
    });

    it('recusa reservar mais que o estoque disponível', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(criarProduto(montarPropsProduto({ id: 'a', estoque: 1 })));
      await assert.rejects(repositorio.reservarEstoque({ produtoId: 'a', quantidade: 2 }), ErroEstoqueInsuficiente);
      assert.equal((await repositorio.buscarPorId('a')).estoque, 1);
    });

    it('recusa reservar estoque de produto desconhecido', async () => {
      const repositorio = await criarRepositorio();
      await assert.rejects(repositorio.reservarEstoque({ produtoId: 'fantasma', quantidade: 1 }), ErroProdutoNaoEncontrado);
    });
  });
}

export function executarContratoRepositorioUsuario(nome, criarRepositorio) {
  describe(`contrato de RepositorioUsuario: ${nome}`, () => {
    it('implementa a porta', async () => {
      garantirQueImplementaPorta(RepositorioUsuario, await criarRepositorio());
    });

    it('salva e encontra usuários por id e e-mail', async () => {
      const repositorio = await criarRepositorio();
      const usuario = montarUsuario();
      await repositorio.salvar(usuario);
      assert.deepEqual(await repositorio.buscarPorId('u1'), usuario);
      assert.deepEqual(await repositorio.buscarPorEmail('maria@example.com'), usuario);
      assert.equal(await repositorio.buscarPorEmail('nobody@example.com'), undefined);
    });

    it('exclui usuários', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(montarUsuario());
      await repositorio.excluirPorId('u1');
      assert.equal(await repositorio.buscarPorId('u1'), undefined);
    });
  });
}

export function executarContratoRepositorioCarrinho(nome, criarRepositorio) {
  describe(`contrato de RepositorioCarrinho: ${nome}`, () => {
    it('implementa a porta', async () => {
      garantirQueImplementaPorta(RepositorioCarrinho, await criarRepositorio());
    });

    it('devolve carrinho vazio para usuário sem carrinho', async () => {
      const repositorio = await criarRepositorio();
      const carrinho = await repositorio.buscarPorUsuarioId('u1');
      assert.deepEqual(carrinho.itens, []);
    });

    it('salva um carrinho substituindo os itens anteriores e mantendo a ordem', async () => {
      const repositorio = await criarRepositorio();
      let carrinho = adicionarItem(criarCarrinhoVazio('u1'), { produtoId: 'a', quantidade: 1 });
      carrinho = adicionarItem(carrinho, { produtoId: 'b', quantidade: 2 });
      await repositorio.salvar(carrinho);
      await repositorio.salvar(adicionarItem(criarCarrinhoVazio('u1'), { produtoId: 'c', quantidade: 3 }));
      assert.deepEqual((await repositorio.buscarPorUsuarioId('u1')).itens, [{ produtoId: 'c', quantidade: 3 }]);
    });

    it('limpa um carrinho sem afetar outros usuários', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(adicionarItem(criarCarrinhoVazio('u1'), { produtoId: 'a', quantidade: 1 }));
      await repositorio.salvar(adicionarItem(criarCarrinhoVazio('u2'), { produtoId: 'a', quantidade: 1 }));
      await repositorio.limpar('u1');
      assert.equal((await repositorio.buscarPorUsuarioId('u1')).itens.length, 0);
      assert.equal((await repositorio.buscarPorUsuarioId('u2')).itens.length, 1);
    });
  });
}

export function executarContratoRepositorioCupom(nome, criarRepositorio) {
  describe(`contrato de RepositorioCupom: ${nome}`, () => {
    it('implementa a porta', async () => {
      garantirQueImplementaPorta(RepositorioCupom, await criarRepositorio());
    });

    it('salva e encontra cupons, incluindo a expiração', async () => {
      const repositorio = await criarRepositorio();
      const expiraEm = new Date('2027-01-01T00:00:00Z');
      await repositorio.salvar(criarCupom({ codigo: 'MIAU10', percentualDesconto: 10, expiraEm }));
      await repositorio.salvar(criarCupom({ codigo: 'SEMPRE', percentualDesconto: 5 }));
      assert.deepEqual((await repositorio.buscarPorCodigo('MIAU10')).expiraEm, expiraEm);
      assert.equal((await repositorio.buscarPorCodigo('SEMPRE')).expiraEm, undefined);
      assert.equal(await repositorio.buscarPorCodigo('INEXISTENTE'), undefined);
    });

    it('mantém o indicador de ativo', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(criarCupom({ codigo: 'OFF', percentualDesconto: 5, ativo: false }));
      assert.equal((await repositorio.buscarPorCodigo('OFF')).ativo, false);
    });
  });
}

export function executarContratoRepositorioPedido(nome, criarRepositorio) {
  describe(`contrato de RepositorioPedido: ${nome}`, () => {
    it('implementa a porta', async () => {
      garantirQueImplementaPorta(RepositorioPedido, await criarRepositorio());
    });

    it('salva pedidos e os lista por usuário', async () => {
      const repositorio = await criarRepositorio();
      const pedido = montarPedido();
      await repositorio.salvar(pedido);
      await repositorio.salvar(montarPedido({ id: 'o2', usuarioId: 'u2' }));
      assert.deepEqual(await repositorio.buscarPorUsuarioId('u1'), [pedido]);
    });

    it('exclui todos os pedidos de um usuário', async () => {
      const repositorio = await criarRepositorio();
      await repositorio.salvar(montarPedido());
      await repositorio.salvar(montarPedido({ id: 'o2', usuarioId: 'u2' }));
      await repositorio.excluirPorUsuarioId('u1');
      assert.equal((await repositorio.buscarPorUsuarioId('u1')).length, 0);
      assert.equal((await repositorio.buscarPorUsuarioId('u2')).length, 1);
    });
  });
}
