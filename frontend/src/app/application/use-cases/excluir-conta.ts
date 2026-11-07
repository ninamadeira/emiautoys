import type { GatewayConta } from '../ports/out/gateway-conta';
import type { ArmazenamentoSessao } from '../ports/out/armazenamento-sessao';

export class ExcluirConta {
  constructor(
    private readonly gatewayConta: GatewayConta,
    private readonly armazenamentoSessao: ArmazenamentoSessao,
  ) {}

  async executar(): Promise<void> {
    await this.gatewayConta.excluirConta();
    this.armazenamentoSessao.limpar();
  }
}
