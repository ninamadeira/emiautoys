import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derivarChave = promisify(scrypt);

const ROTULO_ALGORITMO = 'scrypt';
const BYTES_SAL = 16;
const BYTES_CHAVE = 64;
const SEPARADOR_CAMPOS = '$';
const CAMPOS_ESPERADOS = 3;

export class GeradorHashSenhaScrypt {
  async hash(senhaEmTextoPuro) {
    const salt = randomBytes(BYTES_SAL);
    const key = await derivarChave(senhaEmTextoPuro, salt, BYTES_CHAVE);
    return [ROTULO_ALGORITMO, salt.toString('base64'), key.toString('base64')].join(SEPARADOR_CAMPOS);
  }

  async verificar({ senhaEmTextoPuro, hashSenha }) {
    const campos = String(hashSenha).split(SEPARADOR_CAMPOS);
    if (campos.length !== CAMPOS_ESPERADOS || campos[0] !== ROTULO_ALGORITMO) {
      return false;
    }
    const expectedKey = Buffer.from(campos[2], 'base64');
    const chaveReal = await derivarChave(senhaEmTextoPuro, Buffer.from(campos[1], 'base64'), expectedKey.length);
    return timingSafeEqual(chaveReal, expectedKey);
  }
}
