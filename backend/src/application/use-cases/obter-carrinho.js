import { precificarCarrinho, contarUnidades } from '../domain/carrinho.js';

export class ObterCarrinho {
  #repositorioCarrinho;
  #repositorioProduto;

  constructor({ repositorioCarrinho, repositorioProduto }) {
    this.#repositorioCarrinho = repositorioCarrinho;
    this.#repositorioProduto = repositorioProduto;
  }

  async executar({ usuarioId }) {
    const carrinho = await this.#repositorioCarrinho.buscarPorUsuarioId(usuarioId);
    const produtoIds = carrinho.itens.map((item) => item.produtoId);
    const produtos = await this.#repositorioProduto.buscarPorIds(produtoIds);
    return { ...precificarCarrinho(carrinho, produtos), totalUnidades: contarUnidades(carrinho) };
  }
}
