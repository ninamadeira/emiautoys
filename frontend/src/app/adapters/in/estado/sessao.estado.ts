import { Injectable, computed, inject, signal } from '@angular/core';
import type { Usuario } from '../../../application/domain/modelos';
import type { Credenciais, Cadastro } from '../../../application/ports/out/gateway-autenticacao';
import { CadastrarConta } from '../../../application/use-cases/cadastrar-conta';
import { RestaurarSessao } from '../../../application/use-cases/restaurar-sessao';
import { Entrar } from '../../../application/use-cases/entrar';
import { Sair } from '../../../application/use-cases/sair';
import { ExcluirConta } from '../../../application/use-cases/excluir-conta';

@Injectable({ providedIn: 'root' })
export class EstadoSessao {
  private readonly casoDeUsoEntrar = inject(Entrar);
  private readonly casoDeUsoSair = inject(Sair);
  private readonly casoDeUsoCadastrar = inject(CadastrarConta);
  private readonly casoDeUsoExcluirConta = inject(ExcluirConta);
  private readonly restaurarSessao = inject(RestaurarSessao);

  private readonly usuarioAtual = signal<Usuario | undefined>(this.restaurarSessao.executar()?.usuario);

  readonly usuario = this.usuarioAtual.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioAtual() !== undefined);

  /** Relê o armazenamento (ex.: o interceptor pode ter descartado uma sessão expirada). */
  sincronizarComArmazenamento(): void {
    this.usuarioAtual.set(this.restaurarSessao.executar()?.usuario);
  }

  async entrar(credenciais: Credenciais): Promise<void> {
    this.usuarioAtual.set(await this.casoDeUsoEntrar.executar(credenciais));
  }

  async cadastrar(cadastro: Cadastro): Promise<void> {
    await this.casoDeUsoCadastrar.executar(cadastro);
    await this.entrar({ email: cadastro.email, senha: cadastro.senha });
  }

  sair(): void {
    this.casoDeUsoSair.executar();
    this.usuarioAtual.set(undefined);
  }

  async excluirConta(): Promise<void> {
    await this.casoDeUsoExcluirConta.executar();
    this.usuarioAtual.set(undefined);
  }
}
