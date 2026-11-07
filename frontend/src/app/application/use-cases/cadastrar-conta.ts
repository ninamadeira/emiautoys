import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { Usuario } from '../domain/modelos';
import { estaEmBranco, senhaEhForte, emailEhValido } from '../domain/validacao';
import type { GatewayAutenticacao, Cadastro } from '../ports/out/gateway-autenticacao';

export class CadastrarConta {
  constructor(private readonly gatewayAutenticacao: GatewayAutenticacao) {}

  async executar(cadastro: Cadastro): Promise<Usuario> {
    if (estaEmBranco(cadastro.nome)) throw erroValidacao('nome', 'OBRIGATORIO');
    if (!emailEhValido(cadastro.email)) throw erroValidacao('email', 'FORMATO_INVALIDO');
    if (!senhaEhForte(cadastro.senha)) throw erroValidacao('senha', 'FRACA_DEMAIS');
    return this.gatewayAutenticacao.cadastrar(cadastro);
  }
}
