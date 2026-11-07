import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { EstadoCarrinho } from '../estado/carrinho.estado';
import { EstadoSessao } from '../estado/sessao.estado';

@Component({
  selector: 'app-botao-adicionar-ao-carrinho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="botao" [disabled]="disabled() || ocupado()" (click)="add()">
      {{ disabled() ? 'Indisponível' : 'Adicionar ao carrinho' }}
      <span class="visualmente-oculto"> — {{ nomeProduto() }}</span>
    </button>
    <p class="situacao" role="status" aria-live="polite">{{ mensagem() }}</p>
  `,
})
export class BotaoAdicionarAoCarrinho {
  readonly produtoId = input.required<string>();
  readonly nomeProduto = input.required<string>();
  readonly quantidade = input(1);
  readonly disabled = input(false);

  private readonly sessao = inject(EstadoSessao);
  private readonly carrinho = inject(EstadoCarrinho);
  private readonly roteador = inject(Router);

  protected readonly ocupado = signal(false);
  protected readonly mensagem = signal('');

  protected async add(): Promise<void> {
    if (!this.sessao.estaAutenticado()) {
      await this.roteador.navigate(['/entrar'], { queryParams: { retorno: this.roteador.url } });
      return;
    }
    this.ocupado.set(true);
    try {
      await this.carrinho.add(this.produtoId(), this.quantidade());
      this.mensagem.set(`${this.nomeProduto()} foi adicionado ao carrinho.`);
    } catch (erro) {
      this.mensagem.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }
}
