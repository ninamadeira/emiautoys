import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina-nao-encontrada',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner estreito">
      <h1>Página não encontrada</h1>
      <p>Esse gatinho fugiu! <a routerLink="/loja">Voltar para a loja</a></p>
    </section>
  `,
})
export class PaginaNaoEncontrada {}
