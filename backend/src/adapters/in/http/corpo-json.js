import { ErroHttp } from './erro-http.js';

export const MAX_BYTES_CORPO = 100 * 1024;

function analisarObjeto(texto) {
  if (texto === '') {
    return {};
  }
  try {
    const analisado = JSON.parse(texto);
    if (analisado === null || typeof analisado !== 'object' || Array.isArray(analisado)) {
      throw new ErroHttp('JSON_INVALIDO');
    }
    return analisado;
  } catch (erro) {
    throw erro instanceof ErroHttp ? erro : new ErroHttp('JSON_INVALIDO');
  }
}

function coletarCorpo(requisicao) {
  return new Promise((resolve, reject) => {
    const trechos = [];
    let bytesRecebidos = 0;
    requisicao.on('data', (trecho) => {
      bytesRecebidos += trecho.length;
      if (bytesRecebidos <= MAX_BYTES_CORPO) {
        trechos.push(trecho);
      }
    });
    requisicao.on('error', reject);
    requisicao.on('end', () =>
      resolve({ texto: Buffer.concat(trechos).toString('utf8'), grandeDemais: bytesRecebidos > MAX_BYTES_CORPO }),
    );
  });
}

export async function lerCorpoJson(requisicao) {
  const { texto, grandeDemais } = await coletarCorpo(requisicao);
  if (grandeDemais) {
    throw new ErroHttp('CORPO_GRANDE_DEMAIS');
  }
  return analisarObjeto(texto);
}
