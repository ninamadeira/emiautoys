import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Sessao, Usuario } from '../../../application/domain/modelos';
import { GatewayAutenticacao, type Credenciais, type Cadastro } from '../../../application/ports/out/gateway-autenticacao';
import { URL_BASE_API } from './url-base-api';
import { enviarRequisicao } from './enviar-requisicao';

@Injectable()
export class GatewayAutenticacaoHttp extends GatewayAutenticacao {
  private readonly http = inject(HttpClient);
  private readonly urlBase = inject(URL_BASE_API);

  async cadastrar(cadastro: Cadastro): Promise<Usuario> {
    const resposta = await enviarRequisicao(this.http.post<{ usuario: Usuario }>(`${this.urlBase}/autenticacao/cadastrar`, cadastro));
    return resposta.usuario;
  }

  entrar(credenciais: Credenciais): Promise<Sessao> {
    return enviarRequisicao(this.http.post<Sessao>(`${this.urlBase}/autenticacao/entrar`, credenciais));
  }
}
