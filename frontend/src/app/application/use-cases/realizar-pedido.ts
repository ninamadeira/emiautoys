import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { Pedido, MeioPagamento, EnderecoEntrega } from '../domain/modelos';
import { estaEmBranco, normalizarCep } from '../domain/validacao';
import type { GatewayFinalizacao } from '../ports/out/gateway-finalizacao';

// Neste projeto o pagamento é simulado: nenhum dado de cartão é coletado ou enviado.
const TOKEN_CARTAO_SIMULADO = 'tok_simulado';
const CAMPOS_ENDERECO_OBRIGATORIOS = ['nomeDestinatario', 'rua', 'numero', 'cidade', 'estado'] as const;

export interface ComandoRealizarPedido {
  readonly enderecoEntrega: EnderecoEntrega;
  readonly meioPagamento: MeioPagamento;
  readonly codigoCupom?: string;
}

export class RealizarPedido {
  constructor(private readonly gatewayFinalizacao: GatewayFinalizacao) {}

  async executar(command: ComandoRealizarPedido): Promise<Pedido> {
    const cep = this.cepValidado(command.enderecoEntrega);
    return this.gatewayFinalizacao.realizar({
      enderecoEntrega: { ...command.enderecoEntrega, cep },
      meioPagamento: command.meioPagamento,
      tokenPagamento: command.meioPagamento === 'CARTAO' ? TOKEN_CARTAO_SIMULADO : undefined,
      codigoCupom: command.codigoCupom?.trim() || undefined,
    });
  }

  private cepValidado(endereco: EnderecoEntrega): string {
    for (const campo of CAMPOS_ENDERECO_OBRIGATORIOS) {
      if (estaEmBranco(endereco[campo])) throw erroValidacao(campo, 'OBRIGATORIO');
    }
    const cep = normalizarCep(endereco.cep);
    if (!cep) throw erroValidacao('cep', 'FORMATO_INVALIDO');
    return cep;
  }
}
