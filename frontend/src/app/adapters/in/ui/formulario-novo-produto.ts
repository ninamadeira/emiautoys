import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { numeroDigitado, reaisParaCentavos } from '../../../application/domain/dinheiro';
import {
  CATEGORIAS_PRODUTO,
  FAIXAS_ETARIAS_GATO,
  type CategoriaProduto,
  type FaixaEtariaGato,
  type Produto,
} from '../../../application/domain/modelos';
import { CadastrarProduto } from '../../../application/use-cases/cadastrar-produto';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_CATEGORIA, ROTULOS_FAIXA_ETARIA } from '../mensagens/rotulos.pt-BR';
import { valueOf } from './eventos-dom';

@Component({
  selector: 'app-formulario-novo-produto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="cartao" (submit)="enviar($event)">
      <h2>Novo produto</h2>
      <div class="campo">
        <label for="novo-nome">Nome</label>
        <input id="novo-nome" type="text" [value]="nome()" (input)="nome.set(texto($event))" />
      </div>
      <div class="campo">
        <label for="novo-descricao">Descrição</label>
        <input id="novo-descricao" type="text" [value]="descricao()" (input)="descricao.set(texto($event))" />
      </div>
      <div class="campo">
        <label for="novo-categoria">Categoria</label>
        <select id="novo-categoria" (change)="categoria.set(categoriaDe($event))">
          @for (item of categorias; track item) {
            <option [value]="item" [selected]="item === categoria()">{{ rotulosCategoria[item] }}</option>
          }
        </select>
      </div>
      <div class="campo">
        <label for="novo-faixa">Idade indicada</label>
        <select id="novo-faixa" (change)="faixa.set(faixaDe($event))">
          @for (item of faixas; track item) {
            <option [value]="item" [selected]="item === faixa()">{{ rotulosFaixa[item] }}</option>
          }
        </select>
      </div>
      <div class="campo">
        <label for="novo-preco">Preço (R$)</label>
        <input id="novo-preco" type="text" inputmode="decimal" [value]="preco()" (input)="preco.set(texto($event))" />
      </div>
      <div class="campo">
        <label for="novo-estoque">Estoque</label>
        <input id="novo-estoque" type="number" min="0" [value]="estoque()" (input)="estoque.set(texto($event))" />
      </div>
      <div class="campo">
        <label for="novo-aviso">Aviso de segurança</label>
        <input id="novo-aviso" type="text" [value]="aviso()" (input)="aviso.set(texto($event))" />
      </div>
      <div class="campo">
        <label for="novo-imagem">Endereço da imagem (opcional)</label>
        <input id="novo-imagem" type="text" [value]="imagem()" (input)="imagem.set(texto($event))" />
      </div>
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      }
      <button type="submit" class="botao" [disabled]="ocupado()">Cadastrar produto</button>
    </form>
  `,
})
export class FormularioNovoProduto {
  readonly cadastrado = output<Produto>();

  private readonly cadastrarProduto = inject(CadastrarProduto);

  protected readonly categorias = CATEGORIAS_PRODUTO;
  protected readonly faixas = FAIXAS_ETARIAS_GATO;
  protected readonly rotulosCategoria = ROTULOS_CATEGORIA;
  protected readonly rotulosFaixa = ROTULOS_FAIXA_ETARIA;
  protected readonly texto = valueOf;
  protected readonly nome = signal('');
  protected readonly descricao = signal('');
  protected readonly categoria = signal<CategoriaProduto>('VARINHA');
  protected readonly faixa = signal<FaixaEtariaGato>('TODAS_AS_IDADES');
  protected readonly preco = signal('');
  protected readonly estoque = signal('0');
  protected readonly aviso = signal('');
  protected readonly imagem = signal('');
  protected readonly erro = signal('');
  protected readonly ocupado = signal(false);

  protected categoriaDe(evento: Event): CategoriaProduto {
    return valueOf(evento) as CategoriaProduto;
  }

  protected faixaDe(evento: Event): FaixaEtariaGato {
    return valueOf(evento) as FaixaEtariaGato;
  }

  protected async enviar(evento: Event): Promise<void> {
    evento.preventDefault();
    this.ocupado.set(true);
    this.erro.set('');
    try {
      const produto = await this.cadastrarProduto.executar({
        nome: this.nome(),
        descricao: this.descricao(),
        categoria: this.categoria(),
        precoCentavos: reaisParaCentavos(this.preco()) ?? Number.NaN,
        estoque: numeroDigitado(this.estoque()),
        faixaEtariaIndicada: this.faixa(),
        avisoSeguranca: this.aviso(),
        urlImagem: this.imagem(),
      });
      this.cadastrado.emit(produto);
      this.limpar();
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }

  private limpar(): void {
    for (const campo of [this.nome, this.descricao, this.preco, this.aviso, this.imagem]) campo.set('');
    this.estoque.set('0');
  }
}
