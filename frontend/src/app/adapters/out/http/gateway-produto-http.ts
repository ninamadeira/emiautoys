import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AlteracaoProduto, DadosProduto, Produto } from '../../../application/domain/modelos';
import { GatewayProduto } from '../../../application/ports/out/gateway-produto';
import { URL_BASE_API } from './url-base-api';
import { enviarRequisicao } from './enviar-requisicao';

@Injectable()
export class GatewayProdutoHttp extends GatewayProduto {
  private readonly http = inject(HttpClient);
  private readonly urlBase = inject(URL_BASE_API);

  async listar(categoria?: string): Promise<Produto[]> {
    const params = categoria ? new HttpParams().set('categoria', categoria) : new HttpParams();
    const resposta = await enviarRequisicao(this.http.get<{ produtos: Produto[] }>(`${this.urlBase}/produtos`, { params }));
    return resposta.produtos;
  }

  async obter(produtoId: string): Promise<Produto> {
    const url = `${this.urlBase}/produtos/${encodeURIComponent(produtoId)}`;
    return (await enviarRequisicao(this.http.get<{ produto: Produto }>(url))).produto;
  }

  async cadastrar(dados: DadosProduto): Promise<Produto> {
    return (await enviarRequisicao(this.http.post<{ produto: Produto }>(`${this.urlBase}/produtos`, dados))).produto;
  }

  async alterar(produtoId: string, alteracao: AlteracaoProduto): Promise<Produto> {
    const url = `${this.urlBase}/produtos/${encodeURIComponent(produtoId)}`;
    return (await enviarRequisicao(this.http.put<{ produto: Produto }>(url, alteracao))).produto;
  }
}
