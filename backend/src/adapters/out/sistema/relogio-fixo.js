export class RelogioFixo {
  #atual;

  constructor(dataInicial) {
    this.#atual = dataInicial;
  }

  agora() {
    return new Date(this.#atual);
  }

  avancarSegundos(seconds) {
    this.#atual = new Date(this.#atual.getTime() + seconds * 1000);
  }
}
