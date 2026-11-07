import type { ArmazenamentoSessao } from '../ports/out/armazenamento-sessao';

export class Sair {
  constructor(private readonly armazenamentoSessao: ArmazenamentoSessao) {}

  executar(): void {
    this.armazenamentoSessao.limpar();
  }
}
