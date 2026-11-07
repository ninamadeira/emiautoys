export class GeradorIdSequencial {
  #prefix;
  #counter = 0;

  constructor(prefix = 'id') {
    this.#prefix = prefix;
  }

  proximo() {
    this.#counter += 1;
    return `${this.#prefix}-${this.#counter}`;
  }
}
