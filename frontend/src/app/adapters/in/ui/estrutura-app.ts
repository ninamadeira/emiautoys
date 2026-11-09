import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EstadoCarrinho } from '../estado/carrinho.estado';
import { EstadoSessao } from '../estado/sessao.estado';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="link-pular" href="#conteudo">Pular para o conteúdo</a>
    <header class="cabecalho-site">
      <a routerLink="/loja" class="marca" aria-label="eMiauToys — página inicial">
        <img src="favicon.svg" width="32" height="32" alt="" />
        <span>eMiauToys</span>
      </a>
      <nav aria-label="Principal">
        <a routerLink="/loja" routerLinkActive="ativo">Loja</a>
        <a routerLink="/carrinho" routerLinkActive="ativo" [attr.aria-label]="rotuloCarrinho()">
          Carrinho <span class="contagem" aria-hidden="true">{{ carrinho.carrinho().totalUnidades }}</span>
        </a>
        @if (sessao.usuario()?.administrador) {
          <a routerLink="/administracao" routerLinkActive="ativo">Administração</a>
        }
        @if (sessao.estaAutenticado()) {
          <a routerLink="/conta" routerLinkActive="ativo">Minha conta</a>
          <button type="button" class="botao-link" (click)="sair()">Sair</button>
        } @else {
          <a routerLink="/entrar" routerLinkActive="ativo">Entrar</a>
        }
      </nav>
    </header>
    <main id="conteudo" tabindex="-1">
      <router-outlet />
    </main>
    <footer class="rodape-site">
      <p>eMiauToys — brinquedos seguros para gatos felizes. Pagamentos simulados neste projeto.</p>
    </footer>
  `,
})
export class Aplicacao {
  protected readonly sessao = inject(EstadoSessao);
  protected readonly carrinho = inject(EstadoCarrinho);
  private readonly roteador = inject(Router);

  protected readonly rotuloCarrinho = computed(() => {
    const units = this.carrinho.carrinho().totalUnidades;
    return `Carrinho, ${units} ${units === 1 ? 'item' : 'itens'}`;
  });

  protected async sair(): Promise<void> {
    this.sessao.sair();
    await this.roteador.navigateByUrl('/loja');
  }
}
