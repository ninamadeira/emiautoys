export class ObterPedidos {
  #repositorioPedido;

  constructor({ repositorioPedido }) {
    this.#repositorioPedido = repositorioPedido;
  }

  async executar({ usuarioId }) {
    return this.#repositorioPedido.buscarPorUsuarioId(usuarioId);
  }
}
