import type { Sessao } from '../domain/modelos';
import type { ArmazenamentoSessao } from '../ports/out/armazenamento-sessao';

export class RestaurarSessao {
  constructor(private readonly armazenamentoSessao: ArmazenamentoSessao) {}

  executar(): Sessao | undefined {
    return this.armazenamentoSessao.carregar();
  }
}
