export class RepositorioCupomEmMemoria {
  #cuponsPorCodigo = new Map();

  async buscarPorCodigo(codigo) {
    return this.#cuponsPorCodigo.get(codigo);
  }

  async salvar(cupom) {
    this.#cuponsPorCodigo.set(cupom.codigo, cupom);
  }
}
