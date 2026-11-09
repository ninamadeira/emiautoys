import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { DadosProduto, Produto } from '../domain/modelos';
import { estaEmBranco } from '../domain/validacao';
import type { GatewayProduto } from '../ports/out/gateway-produto';

export const IMAGEM_PADRAO = '/imagens/sem-imagem.svg';

const CAMPOS_DE_TEXTO = ['nome', 'descricao', 'avisoSeguranca'] as const;

export class CadastrarProduto {
  constructor(private readonly gatewayProduto: GatewayProduto) {}

  async executar(dados: DadosProduto): Promise<Produto> {
    for (const campo of CAMPOS_DE_TEXTO) {
      if (estaEmBranco(dados[campo])) throw erroValidacao(campo, 'OBRIGATORIO');
    }
    if (!Number.isInteger(dados.precoCentavos) || dados.precoCentavos <= 0) {
      throw erroValidacao('precoCentavos', 'INTEIRO_POSITIVO_OBRIGATORIO');
    }
    if (!Number.isInteger(dados.estoque) || dados.estoque < 0) {
      throw erroValidacao('estoque', 'INTEIRO_NAO_NEGATIVO_OBRIGATORIO');
    }
    const urlImagem = estaEmBranco(dados.urlImagem) ? IMAGEM_PADRAO : dados.urlImagem.trim();
    return this.gatewayProduto.cadastrar({ ...dados, urlImagem });
  }
}
