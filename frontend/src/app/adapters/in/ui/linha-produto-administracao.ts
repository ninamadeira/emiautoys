import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { centavosParaReais, numeroDigitado, reaisParaCentavos } from '../../../application/domain/dinheiro';
import type { Produto } from '../../../application/domain/modelos';
import { AlterarProduto } from '../../../application/use-cases/alterar-produto';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { valueOf } from './eventos-dom';

@Component({
  selector: 'app-linha-produto-administracao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cartao linha-administracao">
      <div>
        <h2 class="linha-carrinho__nome">{{ produto().nome }}</h2>
        <p class="nota">{{ rotuloCategoria() }}</p>
      </div>
      <div class="campo">
        <label [for]="'preco-' + produto().id">Preço (R$) de {{ produto().nome }}</label>
        <input [id]="'preco-' + produto().id" type="text" inputmode="decimal" [value]="preco()" (input)="preco.set(texto($event))" />
      </div>
      <div class="campo">
        <label [for]="'estoque-' + produto().id">Estoque de {{ produto().nome }}</label>
        <input [id]="'estoque-' + produto().id" type="number" min="0" [value]="estoque()" (input)="estoque.set(texto($event))" />
      </div>
      <button type="button" class="botao" [disabled]="ocupado()" (click)="salvar()">
        Salvar <span class="visualmente-oculto">{{ produto().nome }}</span>
      </button>
      <p class="situacao" role="status" aria-live="polite">{{ mensagem() }}</p>
    </div>
  `,
})
export class LinhaProdutoAdministracao implements OnInit {
  readonly produto = input.required<Produto>();

  private readonly alterarProduto = inject(AlterarProduto);

  protected readonly preco = signal('');
  protected readonly estoque = signal('');
  protected readonly ocupado = signal(false);
  protected readonly mensagem = signal('');
  protected readonly texto = valueOf;

  ngOnInit(): void {
    this.preencher(this.produto());
  }

  protected rotuloCategoria(): string {
    return ROTULOS_CATEGORIA[this.produto().categoria];
  }

  protected async salvar(): Promise<void> {
    this.ocupado.set(true);
    this.mensagem.set('');
    try {
      const alteracao = {
        precoCentavos: reaisParaCentavos(this.preco()) ?? Number.NaN,
        estoque: numeroDigitado(this.estoque()),
      };
      this.preencher(await this.alterarProduto.executar(this.produto().id, alteracao));
      this.mensagem.set('Alterações salvas.');
    } catch (erro) {
      this.mensagem.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }

  private preencher(produto: Produto): void {
    this.preco.set(centavosParaReais(produto.precoCentavos));
    this.estoque.set(String(produto.estoque));
  }
}
