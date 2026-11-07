export class RegistradorStdout {
  informar(mensagem, contexto = {}) {
    this.#write({ level: 'informar', mensagem, ...contexto });
  }

  erro(mensagem, contexto = {}) {
    this.#write({ level: 'erro', mensagem, ...contexto });
  }

  #write(entrada) {
    process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), ...entrada })}\n`);
  }
}
