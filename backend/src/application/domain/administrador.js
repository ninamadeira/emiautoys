import { ErroAcessoProibido } from './erros.js';

export function garantirAdministrador(usuario, emailsAdministradores) {
  if (!usuario || !emailsAdministradores.includes(usuario.email)) {
    throw new ErroAcessoProibido();
  }
}
