import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, type Observable } from 'rxjs';
import { ErroDaAplicacao } from '../../../application/domain/erro-da-aplicacao';

const CODIGO_ERRO_DE_REDE = 'ERRO_DE_REDE';
const CODIGO_ERRO_DESCONHECIDO = 'DESCONHECIDO';

interface CorpoErroApi {
  readonly erro?: { readonly codigo?: string; readonly detalhes?: Record<string, unknown> };
}

export function paraErroDaAplicacao(erro: unknown): ErroDaAplicacao {
  if (erro instanceof ErroDaAplicacao) return erro;
  if (!(erro instanceof HttpErrorResponse)) return new ErroDaAplicacao(CODIGO_ERRO_DESCONHECIDO);
  if (erro.status === 0) return new ErroDaAplicacao(CODIGO_ERRO_DE_REDE);
  const body = erro.error as CorpoErroApi | null;
  return new ErroDaAplicacao(body?.erro?.codigo ?? CODIGO_ERRO_DESCONHECIDO, body?.erro?.detalhes ?? {});
}

export async function enviarRequisicao<T>(requisicao$: Observable<T>): Promise<T> {
  try {
    return await firstValueFrom(requisicao$);
  } catch (erro) {
    throw paraErroDaAplicacao(erro);
  }
}
