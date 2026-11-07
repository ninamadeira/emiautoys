import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Produto } from '../../../application/domain/modelos';
import { ObterDetalhesProduto } from '../../../application/use-cases/obter-detalhes-produto';
import { formatarBrl } from '../formatadores/formatar-brl';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_FAIXA_ETARIA, ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { numeroDe } from './eventos-dom';
import { BotaoAdicionarAoCarrinho } from './botao-adicionar-ao-carrinho';

const QUANTIDADE_MAXIMA_POR_ITEM = 10;

@Component({
  selector: 'app-pagina-detalhe-produto',
  imports: [RouterLink, BotaoAdicionarAoCarrinho],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner">
      <p><a routerLink="/loja">← Voltar para a loja</a></p>
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      } @else if (produto(); as item) {
        <div class="detalhe">
          <img [src]="item.urlImagem" [alt]="item.nome + ' — brinquedo para gatos'" width="600" height="600" />
          <div>
            <p class="selo">{{ rotuloCategoria(item) }} · {{ rotuloFaixaEtaria(item) }}</p>
            <h1>{{ item.nome }}</h1>
            <p class="preco">{{ preco(item) }}</p>
            <p>{{ item.descricao }}</p>
            <p class="nota" role="note"><strong>Aviso de segurança:</strong> {{ item.avisoSeguranca }}</p>
            <p>{{ item.estoque > 0 ? item.estoque + ' unidade(s) em estoque' : 'Produto esgotado' }}</p>
            <div class="campo">
              <label for="quantidade">Quantidade</label>
              <input id="quantidade" type="number" min="1" [max]="quantidadeMaxima" [value]="quantidade()" (change)="quantidade.set(paraNumero($event))" />
            </div>
            <app-botao-adicionar-ao-carrinho
              [produtoId]="item.id"
              [nomeProduto]="item.nome"
              [quantidade]="quantidade()"
              [disabled]="item.estoque === 0"
            />
          </div>
        </div>
      } @else {
        <p role="status">Carregando produto…</p>
      }
    </section>
  `,
})
export class PaginaDetalheProduto implements OnInit {
  readonly produtoId = input.required<string>();

  private readonly obterDetalhesProduto = inject(ObterDetalhesProduto);

  protected readonly quantidadeMaxima = QUANTIDADE_MAXIMA_POR_ITEM;
  protected readonly produto = signal<Produto | undefined>(undefined);
  protected readonly quantidade = signal(1);
  protected readonly erro = signal('');
  protected readonly paraNumero = numeroDe;

  async ngOnInit(): Promise<void> {
    try {
      this.produto.set(await this.obterDetalhesProduto.executar(this.produtoId()));
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }

  protected rotuloCategoria(item: Produto): string {
    return ROTULOS_CATEGORIA[item.categoria];
  }

  protected rotuloFaixaEtaria(item: Produto): string {
    return ROTULOS_FAIXA_ETARIA[item.faixaEtariaIndicada];
  }

  protected preco(item: Produto): string {
    return formatarBrl(item.precoCentavos);
  }
}
