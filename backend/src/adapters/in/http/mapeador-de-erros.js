import { ErroDeDominio } from '../../../application/domain/erros.js';
import { ErroHttp } from './erro-http.js';
import { MENSAGENS_PT_BR } from './mensagens.pt-BR.js';

const CODIGO_ERRO_INTERNO = 'ERRO_INTERNO';

const STATUS_POR_CODIGO = Object.freeze({
  VALIDACAO_FALHOU: 400,
  JSON_INVALIDO: 400,
  NAO_AUTORIZADO: 401,
  CREDENCIAIS_INVALIDAS: 401,
  PAGAMENTO_RECUSADO: 402,
  ACESSO_PROIBIDO: 403,
  PRODUTO_NAO_ENCONTRADO: 404,
  ROTA_NAO_ENCONTRADA: 404,
  METODO_NAO_PERMITIDO: 405,
  ESTOQUE_INSUFICIENTE: 409,
  EMAIL_JA_CADASTRADO: 409,
  CORPO_GRANDE_DEMAIS: 413,
  CUPOM_INVALIDO: 422,
  CARRINHO_VAZIO: 422,
  PRODUTO_INSEGURO: 422,
  [CODIGO_ERRO_INTERNO]: 500,
});

function ehErroConhecido(erro) {
  return (erro instanceof ErroDeDominio || erro instanceof ErroHttp) && erro.codigo in STATUS_POR_CODIGO;
}

export function mapearErroParaResposta(erro) {
  const codigo = ehErroConhecido(erro) ? erro.codigo : CODIGO_ERRO_INTERNO;
  return {
    status: STATUS_POR_CODIGO[codigo],
    body: {
      erro: {
        codigo,
        mensagem: MENSAGENS_PT_BR[codigo],
        detalhes: codigo === CODIGO_ERRO_INTERNO ? {} : erro.detalhes,
      },
    },
  };
}

export function ehErroInterno(erro) {
  return !ehErroConhecido(erro);
}
