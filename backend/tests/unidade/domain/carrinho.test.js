import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUANTIDADE_MAXIMA_POR_ITEM,
  adicionarItem,
  contarUnidades,
  criarCarrinhoVazio,
  precificarCarrinho,
  removerItem,
  definirQuantidadeItem,
} from '../../../src/application/domain/carrinho.js';
import { criarProduto } from '../../../src/application/domain/produto.js';
import { ErroProdutoNaoEncontrado, ErroValidacao } from '../../../src/application/domain/erros.js';
import { montarPropsProduto } from '../../suporte/montadores.js';

const USUARIO_ID = 'user-1';

describe('carrinho', () => {
  it('acumula a quantidade quando o mesmo produto é adicionado duas vezes', () => {
    let carrinho = criarCarrinhoVazio(USUARIO_ID);
    carrinho = adicionarItem(carrinho, { produtoId: 'a', quantidade: 1 });
    carrinho = adicionarItem(carrinho, { produtoId: 'a', quantidade: 2 });
    assert.deepEqual(carrinho.itens, [{ produtoId: 'a', quantidade: 3 }]);
  });

  it('rejeita quantidades acima do limite por item', () => {
    const carrinho = criarCarrinhoVazio(USUARIO_ID);
    const command = { produtoId: 'a', quantidade: QUANTIDADE_MAXIMA_POR_ITEM + 1 };
    assert.throws(() => adicionarItem(carrinho, command), ErroValidacao);
  });

  it('rejeita quantidades zero, negativas e fracionárias', () => {
    const carrinho = criarCarrinhoVazio(USUARIO_ID);
    for (const quantidade of [0, -1, 1.5]) {
      assert.throws(() => adicionarItem(carrinho, { produtoId: 'a', quantidade }), ErroValidacao);
    }
  });

  it('substitui a quantidade de um item existente mantendo sua posição', () => {
    let carrinho = adicionarItem(criarCarrinhoVazio(USUARIO_ID), { produtoId: 'a', quantidade: 1 });
    carrinho = adicionarItem(carrinho, { produtoId: 'b', quantidade: 1 });
    carrinho = definirQuantidadeItem(carrinho, { produtoId: 'a', quantidade: 4 });
    assert.deepEqual(carrinho.itens.map((item) => item.produtoId), ['a', 'b']);
    assert.equal(contarUnidades(carrinho), 5);
  });

  it('remove um item e tolera remover um item ausente', () => {
    let carrinho = adicionarItem(criarCarrinhoVazio(USUARIO_ID), { produtoId: 'a', quantidade: 1 });
    carrinho = removerItem(carrinho, 'a');
    assert.equal(removerItem(carrinho, 'a').itens.length, 0);
  });

  it('precifica o carrinho com totais por linha e subtotal', () => {
    const wand = criarProduto(montarPropsProduto({ id: 'a', precoCentavos: 1000 }));
    const ball = criarProduto(montarPropsProduto({ id: 'b', precoCentavos: 550 }));
    let carrinho = adicionarItem(criarCarrinhoVazio(USUARIO_ID), { produtoId: 'a', quantidade: 2 });
    carrinho = adicionarItem(carrinho, { produtoId: 'b', quantidade: 1 });
    const precificado = precificarCarrinho(carrinho, [wand, ball]);
    assert.equal(precificado.subtotalCentavos, 2550);
    assert.equal(precificado.linhas[0].totalLinhaCentavos, 2000);
  });

  it('falha ao precificar um carrinho que referencia produto desconhecido', () => {
    const carrinho = adicionarItem(criarCarrinhoVazio(USUARIO_ID), { produtoId: 'fantasma', quantidade: 1 });
    assert.throws(() => precificarCarrinho(carrinho, []), ErroProdutoNaoEncontrado);
  });
});
