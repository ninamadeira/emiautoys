import { erroValidacao } from '../domain/erro-da-aplicacao';
import type { Usuario } from '../domain/modelos';
import { estaEmBranco, emailEhValido } from '../domain/validacao';
import type { GatewayAutenticacao, Credenciais } from '../ports/out/gateway-autenticacao';
import type { ArmazenamentoSessao } from '../ports/out/armazenamento-sessao';

export class Entrar {
  constructor(
    private readonly gatewayAutenticacao: GatewayAutenticacao,
    private readonly armazenamentoSessao: ArmazenamentoSessao,
  ) {}

  async executar(credenciais: Credenciais): Promise<Usuario> {
    if (!emailEhValido(credenciais.email)) throw erroValidacao('email', 'FORMATO_INVALIDO');
    if (estaEmBranco(credenciais.senha)) throw erroValidacao('senha', 'OBRIGATORIO');
    const sessao = await this.gatewayAutenticacao.entrar(credenciais);
    this.armazenamentoSessao.salvar(sessao);
    return sessao.usuario;
  }
}
