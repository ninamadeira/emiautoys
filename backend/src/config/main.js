import { RegistradorStdout } from '../adapters/out/sistema/registrador-stdout.js';
import { montarAplicacao } from './raiz-de-composicao.js';
import { carregarConfiguracao } from './ambiente.js';

const logger = new RegistradorStdout();
const configuracao = carregarConfiguracao(process.env);
const aplicacao = await montarAplicacao(configuracao, { logger });
await aplicacao.listen();
logger.informar('API eMiauToys escutando', { porta: aplicacao.porta() });

async function encerrarProcesso() {
  await aplicacao.close();
  process.exit(0);
}

process.on('SIGINT', encerrarProcesso);
process.on('SIGTERM', encerrarProcesso);
