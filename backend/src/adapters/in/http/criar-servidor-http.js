import http from 'node:http';
import { criarRoteador } from './roteador.js';
import { ehErroInterno, mapearErroParaResposta } from './mapeador-de-erros.js';
import { lerCorpoJson } from './corpo-json.js';
import { aplicarCabecalhosSeguranca } from './cabecalhos-seguranca.js';

const METODOS_COM_CORPO = Object.freeze(['POST', 'PUT']);
const STATUS_SEM_CONTEUDO = 204;
const URL_BASE_PARA_ANALISE = 'http://localhost';

function enviarJson(resposta, { status, body }) {
  if (status === STATUS_SEM_CONTEUDO) {
    resposta.writeHead(status).end();
    return;
  }
  resposta.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  resposta.end(JSON.stringify(body));
}

async function despachar(requisicao, { roteador, autenticar }) {
  const url = new URL(requisicao.url, URL_BASE_PARA_ANALISE);
  const { rota, parametros } = roteador.resolve(requisicao.method, url.pathname);
  const usuarioId = rota.exigeAutenticacao ? await autenticar(requisicao) : undefined;
  const body = METODOS_COM_CORPO.includes(requisicao.method) ? await lerCorpoJson(requisicao) : {};
  return rota.tratador({ parametros, consulta: Object.fromEntries(url.searchParams), body, usuarioId });
}

async function tratarRequisicao(requisicao, resposta, contexto) {
  aplicarCabecalhosSeguranca(resposta, contexto.origemCors);
  if (requisicao.method === 'OPTIONS') {
    enviarJson(resposta, { status: STATUS_SEM_CONTEUDO });
    return;
  }
  try {
    enviarJson(resposta, await despachar(requisicao, contexto));
  } catch (erro) {
    if (ehErroInterno(erro)) {
      contexto.logger.erro('erro não tratado na requisição', { mensagem: erro.message, pilha: erro.stack });
    }
    enviarJson(resposta, mapearErroParaResposta(erro));
  }
}

export function criarServidorHttp({ rotas, autenticar, logger, origemCors }) {
  const contexto = { roteador: criarRoteador(rotas), autenticar, logger, origemCors };
  return http.createServer((requisicao, resposta) => tratarRequisicao(requisicao, resposta, contexto));
}
