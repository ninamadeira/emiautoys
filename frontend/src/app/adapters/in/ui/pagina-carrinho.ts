import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatarBrl } from '../formatadores/formatar-brl';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { EstadoCarrinho } from '../estado/carrinho.estado';
import { numeroDe } from './eventos-dom';

const QUANTIDADE_MAXIMA_POR_ITEM = 10;

@Component({
  selector: 'app-pagina-carrinho',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner">
      <h1>Seu carrinho</h1>
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      }
      @if (estadoCarrinho.carrinho().linhas.length === 0) {
        <p>Seu carrinho está vazio. <a routerLink="/loja">Ver brinquedos</a></p>
      } @else {
        <ul class="linhas-carrinho">
          @for (linha of estadoCarrinho.carrinho().linhas; track linha.produtoId) {
            <li class="cartao linha-carrinho">
              <div>
                <h2 class="linha-carrinho__nome">{{ linha.nome }}</h2>
                <p>{{ money(linha.precoUnitarioCentavos) }} cada</p>
              </div>
              <div class="campo">
                <label [for]="'qtd-' + linha.produtoId">Quantidade de {{ linha.nome }}</label>
                <input
                  [id]="'qtd-' + linha.produtoId"
                  type="number"
                  min="1"
                  [max]="quantidadeMaxima"
                  [value]="linha.quantidade"
                  (change)="alterarQuantidade(linha.produtoId, paraNumero($event))"
                />
              </div>
              <p class="preco">{{ money(linha.totalLinhaCentavos) }}</p>
              <button type="button" class="botao botao-secundario" (click)="remove(linha.produtoId)">
                Remover <span class="visualmente-oculto">{{ linha.nome }} do carrinho</span>
              </button>
            </li>
          }
        </ul>
        <p class="resumo">Subtotal: <strong>{{ money(estadoCarrinho.carrinho().subtotalCentavos) }}</strong></p>
        <a routerLink="/finalizar-compra" class="botao">Finalizar compra</a>
      }
    </section>
  `,
})
export class PaginaCarrinho implements OnInit {
  protected readonly estadoCarrinho = inject(EstadoCarrinho);

  protected readonly quantidadeMaxima = QUANTIDADE_MAXIMA_POR_ITEM;
  protected readonly erro = signal('');
  protected readonly money = formatarBrl;
  protected readonly paraNumero = numeroDe;

  async ngOnInit(): Promise<void> {
    await this.run(() => this.estadoCarrinho.refresh());
  }

  protected alterarQuantidade(produtoId: string, quantidade: number): Promise<void> {
    return this.run(() => this.estadoCarrinho.definirQuantidade(produtoId, quantidade));
  }

  protected remove(produtoId: string): Promise<void> {
    return this.run(() => this.estadoCarrinho.remove(produtoId));
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.erro.set('');
    try {
      await action();
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }
}
