import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Pedido, Cotacao } from '../../../application/domain/modelos';
import {
  GatewayFinalizacao,
  type RequisicaoRealizarPedido,
  type RequisicaoCotacao,
} from '../../../application/ports/out/gateway-finalizacao';
import { URL_BASE_API } from './url-base-api';
import { enviarRequisicao } from './enviar-requisicao';

@Injectable()
export class GatewayFinalizacaoHttp extends GatewayFinalizacao {
  private readonly http = inject(HttpClient);
  private readonly urlBase = inject(URL_BASE_API);

  cotacao(requisicao: RequisicaoCotacao): Promise<Cotacao> {
    return enviarRequisicao(this.http.post<Cotacao>(`${this.urlBase}/finalizacao/cotacao`, requisicao));
  }

  async realizar(requisicao: RequisicaoRealizarPedido): Promise<Pedido> {
    const resposta = await enviarRequisicao(this.http.post<{ pedido: Pedido }>(`${this.urlBase}/finalizacao`, requisicao));
    return resposta.pedido;
  }

  async listarPedidos(): Promise<Pedido[]> {
    return (await enviarRequisicao(this.http.get<{ pedidos: Pedido[] }>(`${this.urlBase}/pedidos`))).pedidos;
  }
}
