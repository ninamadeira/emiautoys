import type { Sessao } from '../../domain/modelos';

export abstract class ArmazenamentoSessao {
  abstract carregar(): Sessao | undefined;
  abstract salvar(sessao: Sessao): void;
  abstract limpar(): void;
}
