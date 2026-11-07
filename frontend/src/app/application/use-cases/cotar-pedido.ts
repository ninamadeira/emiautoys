import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { Cotacao } from '../domain/modelos';
import { estaEmBranco, normalizarCep } from '../domain/validacao';
import type { GatewayFinalizacao } from '../ports/out/gateway-finalizacao';

export interface ComandoCotarPedido {
  readonly cep: string;
  readonly codigoCupom?: string;
}

export class CotarPedido {
  constructor(private readonly gatewayFinalizacao: GatewayFinalizacao) {}

  async executar(command: ComandoCotarPedido): Promise<Cotacao> {
    const cep = normalizarCep(command.cep);
    if (!cep) throw erroValidacao('cep', 'FORMATO_INVALIDO');
    const codigoCupom = command.codigoCupom?.trim();
    return this.gatewayFinalizacao.cotacao({
      cep,
      codigoCupom: codigoCupom && !estaEmBranco(codigoCupom) ? codigoCupom : undefined,
    });
  }
}
