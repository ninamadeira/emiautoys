import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GatewayConta } from '../../../application/ports/out/gateway-conta';
import { URL_BASE_API } from './url-base-api';
import { enviarRequisicao } from './enviar-requisicao';

@Injectable()
export class GatewayContaHttp extends GatewayConta {
  private readonly http = inject(HttpClient);
  private readonly urlBase = inject(URL_BASE_API);

  async excluirConta(): Promise<void> {
    await enviarRequisicao(this.http.delete<void>(`${this.urlBase}/conta`));
  }
}
