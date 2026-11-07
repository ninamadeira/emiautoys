import { Injectable } from '@angular/core';
import type { Sessao } from '../../../application/domain/modelos';
import { ArmazenamentoSessao } from '../../../application/ports/out/armazenamento-sessao';

const CHAVE_ARMAZENAMENTO = 'emiautoys.sessao';

@Injectable()
export class ArmazenamentoSessaoLocalStorage extends ArmazenamentoSessao {
  carregar(): Sessao | undefined {
    try {
      const raw = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      return raw ? (JSON.parse(raw) as Sessao) : undefined;
    } catch {
      this.limpar();
      return undefined;
    }
  }

  salvar(sessao: Sessao): void {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(sessao));
  }

  limpar(): void {
    localStorage.removeItem(CHAVE_ARMAZENAMENTO);
  }
}
