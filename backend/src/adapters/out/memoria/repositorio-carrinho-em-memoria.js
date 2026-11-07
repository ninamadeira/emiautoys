import { criarCarrinhoVazio } from '../../../application/domain/carrinho.js';

export class RepositorioCarrinhoEmMemoria {
  #carrinhosPorUsuarioId = new Map();

  async buscarPorUsuarioId(usuarioId) {
    return this.#carrinhosPorUsuarioId.get(usuarioId) ?? criarCarrinhoVazio(usuarioId);
  }

  async salvar(carrinho) {
    this.#carrinhosPorUsuarioId.set(carrinho.usuarioId, carrinho);
  }

  async limpar(usuarioId) {
    this.#carrinhosPorUsuarioId.delete(usuarioId);
  }
}
