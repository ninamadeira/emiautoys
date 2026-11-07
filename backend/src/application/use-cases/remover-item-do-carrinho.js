import { removerItem } from '../domain/carrinho.js';

export class RemoverItemDoCarrinho {
  #repositorioCarrinho;
  #obterCarrinho;

  constructor({ repositorioCarrinho, obterCarrinho }) {
    this.#repositorioCarrinho = repositorioCarrinho;
    this.#obterCarrinho = obterCarrinho;
  }

  async executar({ usuarioId, produtoId }) {
    const carrinho = removerItem(await this.#repositorioCarrinho.buscarPorUsuarioId(usuarioId), produtoId);
    await this.#repositorioCarrinho.salvar(carrinho);
    return this.#obterCarrinho.executar({ usuarioId });
  }
}
