import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Produto } from '../../../application/domain/modelos';
import { formatarBrl } from '../formatadores/formatar-brl';
import { ROTULOS_FAIXA_ETARIA, ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { BotaoAdicionarAoCarrinho } from './botao-adicionar-ao-carrinho';
import { SeletorQuantidade } from './seletor-quantidade';

const QUANTIDADE_MAXIMA_POR_ITEM = 10;

@Component({
  selector: 'app-cartao-produto',
  imports: [RouterLink, BotaoAdicionarAoCarrinho, SeletorQuantidade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="cartao cartao-produto">
      <a [routerLink]="['/loja', produto().id]" class="cartao-produto__link-imagem">
        <img
          [src]="produto().urlImagem"
          [alt]="produto().nome + ' — brinquedo para gatos'"
          width="600"
          height="600"
          loading="lazy"
        />
      </a>
      <div class="cartao-produto__corpo">
        <p class="selo">{{ rotuloCategoria() }} · {{ rotuloFaixaEtaria() }}</p>
        <h3>
          <a [routerLink]="['/loja', produto().id]">{{ produto().nome }}</a>
        </h3>
        <p class="preco">{{ preco() }}</p>
        <p class="nota" role="note"><strong>Segurança:</strong> {{ produto().avisoSeguranca }}</p>
        <app-seletor-quantidade
          [valor]="quantidade()"
          [rotulo]="produto().nome"
          [idCampo]="'qtd-card-' + produto().id"
          [maximo]="limite()"
          [desabilitado]="produto().estoque === 0"
          (alterada)="quantidade.set($event)"
        />
        <app-botao-adicionar-ao-carrinho
          [produtoId]="produto().id"
          [nomeProduto]="produto().nome"
          [quantidade]="quantidade()"
          [disabled]="produto().estoque === 0"
        />
      </div>
    </article>
  `,
})
export class CartaoProduto {
  readonly produto = input.required<Produto>();
  protected readonly quantidade = signal(1);

  protected limite(): number {
    return Math.min(QUANTIDADE_MAXIMA_POR_ITEM, this.produto().estoque);
  }

  protected rotuloCategoria(): string {
    return ROTULOS_CATEGORIA[this.produto().categoria];
  }

  protected rotuloFaixaEtaria(): string {
    return ROTULOS_FAIXA_ETARIA[this.produto().faixaEtariaIndicada];
  }

  protected preco(): string {
    return formatarBrl(this.produto().precoCentavos);
  }
}
