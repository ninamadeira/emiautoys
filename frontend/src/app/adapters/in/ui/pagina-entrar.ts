import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { EstadoSessao } from '../estado/sessao.estado';
import { urlRetornoSegura, valueOf } from './eventos-dom';

@Component({
  selector: 'app-pagina-entrar',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner estreito">
      <h1>Entrar</h1>
      <form (submit)="submit($event)" novalidate>
        <div class="campo">
          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="email" required [value]="email()" (input)="email.set(value($event))" />
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input id="senha" type="password" autocomplete="current-password" required [value]="senha()" (input)="senha.set(value($event))" />
        </div>
        @if (erro()) {
          <p class="alerta" role="alert">{{ erro() }}</p>
        }
        <button type="submit" class="botao" [disabled]="ocupado()">Entrar</button>
      </form>
      <p>Ainda não tem conta? <a routerLink="/cadastro">Cadastre-se</a></p>
    </section>
  `,
})
export class PaginaEntrar {
  readonly retorno = input<string>();

  private readonly sessao = inject(EstadoSessao);
  private readonly roteador = inject(Router);

  protected readonly email = signal('');
  protected readonly senha = signal('');
  protected readonly erro = signal('');
  protected readonly ocupado = signal(false);
  protected readonly value = valueOf;

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.ocupado.set(true);
    this.erro.set('');
    try {
      await this.sessao.entrar({ email: this.email(), senha: this.senha() });
      await this.roteador.navigateByUrl(urlRetornoSegura(this.retorno()));
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }
}
