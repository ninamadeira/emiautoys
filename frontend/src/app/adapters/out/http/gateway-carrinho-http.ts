import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Carrinho } from '../../../application/domain/modelos';
import { GatewayCarrinho } from '../../../application/ports/out/gateway-carrinho';
import { URL_BASE_API } from './url-base-api';
import { enviarRequisicao } from './enviar-requisicao';

@Injectable()
export class GatewayCarrinhoHttp extends GatewayCarrinho {
  private readonly http = inject(HttpClient);
  private readonly urlBase = inject(URL_BASE_API);

  obter(): Promise<Carrinho> {
    return enviarRequisicao(this.http.get<Carrinho>(`${this.urlBase}/carrinho`));
  }

  adicionar(produtoId: string, quantidade: number): Promise<Carrinho> {
    return enviarRequisicao(this.http.post<Carrinho>(`${this.urlBase}/carrinho/itens`, { produtoId, quantidade }));
  }

  atualizar(produtoId: string, quantidade: number): Promise<Carrinho> {
    return enviarRequisicao(this.http.put<Carrinho>(this.urlItem(produtoId), { quantidade }));
  }

  remover(produtoId: string): Promise<Carrinho> {
    return enviarRequisicao(this.http.delete<Carrinho>(this.urlItem(produtoId)));
  }

  private urlItem(produtoId: string): string {
    return `${this.urlBase}/carrinho/itens/${encodeURIComponent(produtoId)}`;
  }
}
