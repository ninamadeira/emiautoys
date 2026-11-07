import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ErroEstoqueInsuficiente,
  ErroProdutoNaoEncontrado,
  ErroValidacao,
} from '../../../src/application/domain/erros.js';
import { montarAmbiente, dadoProduto } from '../../suporte/ambiente.js';

const USUARIO_ID = 'user-1';

describe('catálogo', () => {
  it('lista todos os produtos e filtra por categoria', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', categoria: 'VARINHA' });
    await dadoProduto(ambiente, { id: 'b', categoria: 'BOLINHA' });
    assert.equal((await ambiente.listarProdutos.executar()).length, 2);
    const balls = await ambiente.listarProdutos.executar({ categoria: 'BOLINHA' });
    assert.deepEqual(balls.map((produto) => produto.id), ['b']);
  });

  it('rejeita categoria desconhecida', async () => {
    const ambiente = montarAmbiente();
    await assert.rejects(ambiente.listarProdutos.executar({ categoria: 'OSSO_DE_CACHORRO' }), ErroValidacao);
  });

  it('obtém um produto por id ou falha com ErroProdutoNaoEncontrado', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a' });
    assert.equal((await ambiente.obterProduto.executar({ produtoId: 'a' })).id, 'a');
    await assert.rejects(ambiente.obterProduto.executar({ produtoId: 'fantasma' }), ErroProdutoNaoEncontrado);
  });
});

describe('casos de uso do carrinho', () => {
  it('adiciona itens e devolve o carrinho com preços', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', precoCentavos: 1000 });
    const carrinho = await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 2 });
    assert.equal(carrinho.subtotalCentavos, 2000);
    assert.equal(carrinho.totalUnidades, 2);
  });

  it('recusa adicionar mais unidades que o estoque', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', estoque: 2 });
    const command = { usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 3 };
    await assert.rejects(ambiente.adicionarItemAoCarrinho.executar(command), ErroEstoqueInsuficiente);
  });

  it('considera no estoque as unidades já presentes no carrinho', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', estoque: 3 });
    await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 2 });
    const command = { usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 2 };
    await assert.rejects(ambiente.adicionarItemAoCarrinho.executar(command), ErroEstoqueInsuficiente);
  });

  it('recusa adicionar um produto desconhecido', async () => {
    const ambiente = montarAmbiente();
    const command = { usuarioId: USUARIO_ID, produtoId: 'fantasma', quantidade: 1 };
    await assert.rejects(ambiente.adicionarItemAoCarrinho.executar(command), ErroProdutoNaoEncontrado);
  });

  it('atualiza e remove itens', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', precoCentavos: 500 });
    await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 1 });
    const updated = await ambiente.atualizarItemDoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 4 });
    assert.equal(updated.subtotalCentavos, 2000);
    const emptied = await ambiente.removerItemDoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a' });
    assert.equal(emptied.linhas.length, 0);
  });

  it('recusa atualizar além do estoque', async () => {
    const ambiente = montarAmbiente();
    await dadoProduto(ambiente, { id: 'a', estoque: 2 });
    await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 1 });
    const command = { usuarioId: USUARIO_ID, produtoId: 'a', quantidade: 5 };
    await assert.rejects(ambiente.atualizarItemDoCarrinho.executar(command), ErroEstoqueInsuficiente);
  });
});
