export class RepositorioPedidoEmMemoria {
  #pedidos = [];

  async salvar(pedido) {
    this.#pedidos.push(pedido);
  }

  async buscarPorUsuarioId(usuarioId) {
    return this.#pedidos.filter((pedido) => pedido.usuarioId === usuarioId);
  }

  async excluirPorUsuarioId(usuarioId) {
    this.#pedidos = this.#pedidos.filter((pedido) => pedido.usuarioId !== usuarioId);
  }
}
