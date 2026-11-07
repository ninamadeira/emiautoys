import { CATEGORIAS_PRODUTO } from '../domain/produto.js';
import { exigirUmDe } from '../domain/validacao.js';

export class ListarProdutos {
  #repositorioProduto;

  constructor({ repositorioProduto }) {
    this.#repositorioProduto = repositorioProduto;
  }

  async executar({ categoria } = {}) {
    const produtos = await this.#repositorioProduto.buscarTodos();
    if (categoria === undefined) {
      return produtos;
    }
    exigirUmDe(categoria, CATEGORIAS_PRODUTO, 'categoria');
    return produtos.filter((produto) => produto.categoria === categoria);
  }
}
