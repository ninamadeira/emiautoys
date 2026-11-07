import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Produto } from '../../../application/domain/modelos';
import { formatarBrl } from '../formatadores/formatar-brl';
import { ROTULOS_FAIXA_ETARIA, ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { BotaoAdicionarAoCarrinho } from './botao-adicionar-ao-carrinho';

@Component({
  selector: 'app-cartao-produto',
  imports: [RouterLink, BotaoAdicionarAoCarrinho],
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
        <app-botao-adicionar-ao-carrinho
          [produtoId]="produto().id"
          [nomeProduto]="produto().nome"
          [disabled]="produto().estoque === 0"
        />
      </div>
    </article>
  `,
})
export class CartaoProduto {
  readonly produto = input.required<Produto>();

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
