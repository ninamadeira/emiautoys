import type { Pedido, MeioPagamento, Cotacao, EnderecoEntrega } from '../../domain/modelos';

export interface RequisicaoCotacao {
  readonly cep: string;
  readonly codigoCupom?: string;
}

export interface RequisicaoRealizarPedido {
  readonly enderecoEntrega: EnderecoEntrega;
  readonly meioPagamento: MeioPagamento;
  readonly tokenPagamento?: string;
  readonly codigoCupom?: string;
}

export abstract class GatewayFinalizacao {
  abstract cotacao(requisicao: RequisicaoCotacao): Promise<Cotacao>;
  abstract realizar(requisicao: RequisicaoRealizarPedido): Promise<Pedido>;
  abstract listarPedidos(): Promise<Pedido[]>;
}
