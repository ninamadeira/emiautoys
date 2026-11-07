export class ErroHttp extends Error {
  constructor(codigo) {
    super(codigo);
    this.name = 'ErroHttp';
    this.codigo = codigo;
    this.detalhes = {};
  }
}
