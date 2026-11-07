export class ExcluirConta {
  #repositorioUsuario;
  #repositorioCarrinho;
  #repositorioPedido;

  constructor({ repositorioUsuario, repositorioCarrinho, repositorioPedido }) {
    this.#repositorioUsuario = repositorioUsuario;
    this.#repositorioCarrinho = repositorioCarrinho;
    this.#repositorioPedido = repositorioPedido;
  }

  async executar({ usuarioId }) {
    await this.#repositorioPedido.excluirPorUsuarioId(usuarioId);
    await this.#repositorioCarrinho.limpar(usuarioId);
    await this.#repositorioUsuario.excluirPorId(usuarioId);
  }
}
