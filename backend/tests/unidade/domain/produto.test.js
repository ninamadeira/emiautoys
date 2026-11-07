import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { criarProduto, garantirEstoqueDisponivel } from '../../../src/application/domain/produto.js';
import { ErroEstoqueInsuficiente, ErroProdutoInseguro, ErroValidacao } from '../../../src/application/domain/erros.js';
import { montarPropsProduto } from '../../suporte/montadores.js';

describe('produto', () => {
  it('cria um produto com faixa etária e aviso de segurança', () => {
    const produto = criarProduto(montarPropsProduto());
    assert.equal(produto.faixaEtariaIndicada, 'TODAS_AS_IDADES');
    assert.match(produto.avisoSeguranca, /Supervisione/);
  });

  it('rejeita produto sem aviso de segurança', () => {
    assert.throws(() => criarProduto(montarPropsProduto({ avisoSeguranca: '  ' })), ErroValidacao);
  });

  it('rejeita produto sem idade recomendada válida', () => {
    assert.throws(() => criarProduto(montarPropsProduto({ faixaEtariaIndicada: 'FILHOTE_DE_CACHORRO' })), ErroValidacao);
  });

  it('rejeita produtos com risco conhecido', () => {
    const propriedades = montarPropsProduto({ rotulosRisco: ['FIO_SOLTO_LONGO'] });
    assert.throws(() => criarProduto(propriedades), ErroProdutoInseguro);
  });

  it('rejeita preços não positivos e estoque negativo', () => {
    assert.throws(() => criarProduto(montarPropsProduto({ precoCentavos: 0 })), ErroValidacao);
    assert.throws(() => criarProduto(montarPropsProduto({ estoque: -1 })), ErroValidacao);
  });

  it('lança ErroEstoqueInsuficiente quando a quantidade pedida excede o estoque', () => {
    const produto = criarProduto(montarPropsProduto({ estoque: 2 }));
    assert.throws(() => garantirEstoqueDisponivel(produto, 3), ErroEstoqueInsuficiente);
    assert.doesNotThrow(() => garantirEstoqueDisponivel(produto, 2));
  });
});
