import type { Sessao, Usuario } from '../../domain/modelos';

export interface Credenciais {
  readonly email: string;
  readonly senha: string;
}

export interface Cadastro extends Credenciais {
  readonly nome: string;
}

export abstract class GatewayAutenticacao {
  abstract cadastrar(cadastro: Cadastro): Promise<Usuario>;
  abstract entrar(credenciais: Credenciais): Promise<Sessao>;
}
