import { ErroProdutoNaoEncontrado, ErroValidacao } from './erros.js';
import { exigirInteiroPositivo } from './validacao.js';

export const QUANTIDADE_MAXIMA_POR_ITEM = 10;

function congelarCarrinho(usuarioId, itens) {
  return Object.freeze({
    usuarioId,
    itens: Object.freeze(itens.map((item) => Object.freeze({ ...item }))),
  });
}

function garantirDentroDoLimite(quantidade) {
  if (quantidade > QUANTIDADE_MAXIMA_POR_ITEM) {
    throw new ErroValidacao('quantidade', 'ACIMA_DO_MAXIMO');
  }
}

function substituirQuantidade(carrinho, { produtoId, quantidade }) {
  garantirDentroDoLimite(quantidade);
  const jaNoCarrinho = carrinho.itens.some((item) => item.produtoId === produtoId);
  const itens = jaNoCarrinho
    ? carrinho.itens.map((item) => (item.produtoId === produtoId ? { produtoId, quantidade } : item))
    : [...carrinho.itens, { produtoId, quantidade }];
  return congelarCarrinho(carrinho.usuarioId, itens);
}

function quantidadeDe(carrinho, produtoId) {
  return carrinho.itens.find((item) => item.produtoId === produtoId)?.quantidade ?? 0;
}

export function criarCarrinhoVazio(usuarioId) {
  return congelarCarrinho(usuarioId, []);
}

export function criarCarrinho({ usuarioId, itens }) {
  return congelarCarrinho(usuarioId, itens);
}

export function adicionarItem(carrinho, { produtoId, quantidade }) {
  const added = exigirInteiroPositivo(quantidade, 'quantidade');
  return substituirQuantidade(carrinho, { produtoId, quantidade: quantidadeDe(carrinho, produtoId) + added });
}

export function definirQuantidadeItem(carrinho, { produtoId, quantidade }) {
  exigirInteiroPositivo(quantidade, 'quantidade');
  return substituirQuantidade(carrinho, { produtoId, quantidade });
}

export function removerItem(carrinho, produtoId) {
  return congelarCarrinho(
    carrinho.usuarioId,
    carrinho.itens.filter((item) => item.produtoId !== produtoId),
  );
}

export function contarUnidades(carrinho) {
  return carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
}

function precificarLinha(item, produtosPorId) {
  const produto = produtosPorId.get(item.produtoId);
  if (!produto) {
    throw new ErroProdutoNaoEncontrado(item.produtoId);
  }
  return {
    produtoId: produto.id,
    nome: produto.nome,
    precoUnitarioCentavos: produto.precoCentavos,
    quantidade: item.quantidade,
    totalLinhaCentavos: produto.precoCentavos * item.quantidade,
  };
}

export function precificarCarrinho(carrinho, produtos) {
  const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
  const linhas = carrinho.itens.map((item) => precificarLinha(item, produtosPorId));
  const subtotalCentavos = linhas.reduce((total, linha) => total + linha.totalLinhaCentavos, 0);
  return { linhas, subtotalCentavos };
}
