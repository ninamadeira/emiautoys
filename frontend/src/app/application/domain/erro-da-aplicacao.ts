export type DetalhesErro = Readonly<Record<string, unknown>>;

export class ErroDaAplicacao extends Error {
  constructor(
    readonly codigo: string,
    readonly detalhes: DetalhesErro = {},
  ) {
    super(codigo);
    this.name = 'ErroDaAplicacao';
  }
}

export function erroValidacao(campo: string, motivo: string): ErroDaAplicacao {
  return new ErroDaAplicacao('VALIDACAO_FALHOU', { campo, motivo });
}
