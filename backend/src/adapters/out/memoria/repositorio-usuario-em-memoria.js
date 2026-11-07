export class RepositorioUsuarioEmMemoria {
  #usuariosPorId = new Map();

  async buscarPorId(usuarioId) {
    return this.#usuariosPorId.get(usuarioId);
  }

  async buscarPorEmail(email) {
    return [...this.#usuariosPorId.values()].find((usuario) => usuario.email === email);
  }

  async salvar(usuario) {
    this.#usuariosPorId.set(usuario.id, usuario);
  }

  async excluirPorId(usuarioId) {
    this.#usuariosPorId.delete(usuarioId);
  }
}
