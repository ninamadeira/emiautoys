import { ErroProdutoNaoEncontrado } from '../../../application/domain/erros.js';
import { garantirEstoqueDisponivel } from '../../../application/domain/produto.js';

export class RepositorioProdutoEmMemoria {
  #produtosPorId = new Map();

  async buscarTodos() {
    return [...this.#produtosPorId.values()];
  }

  async buscarPorId(produtoId) {
    return this.#produtosPorId.get(produtoId);
  }

  async buscarPorIds(produtoIds) {
    return produtoIds.map((id) => this.#produtosPorId.get(id)).filter(Boolean);
  }

  async salvar(produto) {
    this.#produtosPorId.set(produto.id, produto);
  }

  async reservarEstoque({ produtoId, quantidade }) {
    const produto = this.#produtosPorId.get(produtoId);
    if (!produto) {
      throw new ErroProdutoNaoEncontrado(produtoId);
    }
    garantirEstoqueDisponivel(produto, quantidade);
    this.#produtosPorId.set(produtoId, { ...produto, estoque: produto.estoque - quantidade });
  }

  async liberarEstoque({ produtoId, quantidade }) {
    const produto = this.#produtosPorId.get(produtoId);
    if (!produto) {
      return;
    }
    this.#produtosPorId.set(produtoId, { ...produto, estoque: produto.estoque + quantidade });
  }
}

