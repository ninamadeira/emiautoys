import { randomBytes } from 'node:crypto';

const PORTA_PADRAO = 3000;
const TTL_PADRAO_TOKEN_SEGUNDOS = 2 * 60 * 60;
const BYTES_SEGREDO_DESENVOLVIMENTO = 32;
const PRODUCAO = 'production';

function resolverSegredoToken(env) {
  if (env.SEGREDO_TOKEN) {
    return env.SEGREDO_TOKEN;
  }
  if (env.NODE_ENV === PRODUCAO) {
    throw new Error('A variável de ambiente SEGREDO_TOKEN é obrigatória em produção');
  }
  return randomBytes(BYTES_SEGREDO_DESENVOLVIMENTO).toString('hex');
}

export function carregarConfiguracao(env) {
  const ehProducao = env.NODE_ENV === PRODUCAO;
  return Object.freeze({
    porta: Number(env.PORT ?? PORTA_PADRAO),
    arquivoBanco: env.ARQUIVO_BANCO ?? './dados/emiautoys.sqlite',
    segredoToken: resolverSegredoToken(env),
    ttlTokenSegundos: Number(env.TTL_TOKEN_SEGUNDOS ?? TTL_PADRAO_TOKEN_SEGUNDOS),
    origemCors: env.ORIGEM_CORS ?? 'http://localhost:4200',
    carregarCatalogoInicial: env.CARREGAR_CATALOGO_INICIAL ? env.CARREGAR_CATALOGO_INICIAL === 'true' : !ehProducao,
  });
}
