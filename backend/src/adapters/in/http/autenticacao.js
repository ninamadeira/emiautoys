import { ErroNaoAutorizado } from '../../../application/domain/erros.js';

const PREFIXO_BEARER = 'Bearer ';

export function criarAutenticador({ verificarSessao }) {
  return async function autenticar(requisicao) {
    const header = requisicao.headers.authorization ?? '';
    if (!header.startsWith(PREFIXO_BEARER)) {
      throw new ErroNaoAutorizado();
    }
    const { usuarioId } = await verificarSessao.executar({ token: header.slice(PREFIXO_BEARER.length) });
    return usuarioId;
  };
}
