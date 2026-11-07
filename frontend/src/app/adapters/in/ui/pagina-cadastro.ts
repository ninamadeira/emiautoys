import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { EstadoSessao } from '../estado/sessao.estado';
import { valueOf } from './eventos-dom';

@Component({
  selector: 'app-pagina-cadastro',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner estreito">
      <h1>Criar conta</h1>
      <form (submit)="submit($event)" novalidate>
        <div class="campo">
          <label for="nome">Nome</label>
          <input id="nome" type="text" autocomplete="name" required [value]="nome()" (input)="nome.set(value($event))" />
        </div>
        <div class="campo">
          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="email" required [value]="email()" (input)="email.set(value($event))" />
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input id="senha" type="password" autocomplete="new-password" required aria-describedby="senha-ajuda" [value]="senha()" (input)="senha.set(value($event))" />
          <p id="senha-ajuda" class="ajuda">Mínimo de 8 caracteres, com letras e números.</p>
        </div>
        <p class="ajuda">
          Usamos seus dados apenas para processar pedidos (LGPD). Você pode excluir sua conta a qualquer momento em
          "Minha conta".
        </p>
        @if (erro()) {
          <p class="alerta" role="alert">{{ erro() }}</p>
        }
        <button type="submit" class="botao" [disabled]="ocupado()">Criar conta</button>
      </form>
      <p>Já tem conta? <a routerLink="/entrar">Entrar</a></p>
    </section>
  `,
})
export class PaginaCadastro {
  private readonly sessao = inject(EstadoSessao);
  private readonly roteador = inject(Router);

  protected readonly nome = signal('');
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
      await this.sessao.cadastrar({ nome: this.nome(), email: this.email(), senha: this.senha() });
      await this.roteador.navigateByUrl('/loja');
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }
}
