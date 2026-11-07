import { ErroProdutoNaoEncontrado } from '../domain/erros.js';

export class ObterProduto {
  #repositorioProduto;

  constructor({ repositorioProduto }) {
    this.#repositorioProduto = repositorioProduto;
  }

  async executar({ produtoId }) {
    const produto = await this.#repositorioProduto.buscarPorId(produtoId);
    if (!produto) {
      throw new ErroProdutoNaoEncontrado(produtoId);
    }
    return produto;
  }
}
