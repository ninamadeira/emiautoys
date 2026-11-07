import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CATEGORIAS_PRODUTO, type Produto, type CategoriaProduto } from '../../../application/domain/modelos';
import { ConsultarCatalogo } from '../../../application/use-cases/consultar-catalogo';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_CATEGORIA } from '../mensagens/rotulos.pt-BR';
import { CartaoProduto } from './cartao-produto';

@Component({
  selector: 'app-pagina-produtos',
  imports: [CartaoProduto],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner">
      <h1>Brinquedos para gatos</h1>
      <p class="destaque">Escolha com carinho: todos os produtos mostram a idade indicada e o aviso de segurança.</p>

      <div class="filtros" role="group" aria-label="Filtrar por categoria">
        <button type="button" class="filtro" [attr.aria-pressed]="selected() === undefined" (click)="select(undefined)">
          Todos
        </button>
        @for (categoria of categorias; track categoria) {
          <button type="button" class="filtro" [attr.aria-pressed]="selected() === categoria" (click)="select(categoria)">
            {{ labels[categoria] }}
          </button>
        }
      </div>

      <p role="status" aria-live="polite" class="situacao">
        @if (loading()) { Carregando produtos… } @else if (!erro()) { {{ produtos().length }} produto(s) encontrado(s). }
      </p>
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      }
      <div class="grade">
        @for (produto of produtos(); track produto.id) {
          <app-cartao-produto [produto]="produto" />
        }
      </div>
    </section>
  `,
})
export class PaginaProdutos implements OnInit {
  private readonly consultarCatalogo = inject(ConsultarCatalogo);

  protected readonly categorias = CATEGORIAS_PRODUTO;
  protected readonly labels = ROTULOS_CATEGORIA;
  protected readonly selected = signal<CategoriaProduto | undefined>(undefined);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly loading = signal(true);
  protected readonly erro = signal('');

  ngOnInit(): void {
    void this.carregar();
  }

  protected select(categoria: CategoriaProduto | undefined): void {
    this.selected.set(categoria);
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    this.loading.set(true);
    this.erro.set('');
    try {
      this.produtos.set(await this.consultarCatalogo.executar(this.selected()));
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    } finally {
      this.loading.set(false);
    }
  }
}
