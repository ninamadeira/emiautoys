import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Produto } from '../../../application/domain/modelos';
import { ObterDetalhesProduto } from '../../../application/use-cases/obter-detalhes-produto';
import { formatarBrl } from '../formatadores/formatar-brl';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_FAIXA_ETARIA, ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { SeletorQuantidade } from './seletor-quantidade';
import { BotaoAdicionarAoCarrinho } from './botao-adicionar-ao-carrinho';

const QUANTIDADE_MAXIMA_POR_ITEM = 10;

@Component({
  selector: 'app-pagina-detalhe-produto',
  imports: [RouterLink, BotaoAdicionarAoCarrinho, SeletorQuantidade],
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
            <app-seletor-quantidade
              [valor]="quantidade()"
              [rotulo]="item.nome"
              idCampo="quantidade"
              [maximo]="limiteDe(item)"
              [desabilitado]="item.estoque === 0"
              (alterada)="quantidade.set($event)"
            />
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

  protected readonly produto = signal<Produto | undefined>(undefined);
  protected readonly quantidade = signal(1);
  protected readonly erro = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.produto.set(await this.obterDetalhesProduto.executar(this.produtoId()));
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }

  protected limiteDe(item: Produto): number {
    return Math.min(QUANTIDADE_MAXIMA_POR_ITEM, item.estoque);
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
