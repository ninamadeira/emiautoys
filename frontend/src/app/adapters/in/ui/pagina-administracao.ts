import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import type { Produto } from '../../../application/domain/modelos';
import { ConsultarCatalogo } from '../../../application/use-cases/consultar-catalogo';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { FormularioNovoProduto } from './formulario-novo-produto';
import { LinhaProdutoAdministracao } from './linha-produto-administracao';

@Component({
  selector: 'app-pagina-administracao',
  imports: [FormularioNovoProduto, LinhaProdutoAdministracao],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner">
      <h1>Administração de produtos</h1>
      <p class="destaque">Cadastre novos produtos e altere o preço e o estoque dos que já existem.</p>
      <app-formulario-novo-produto (cadastrado)="incluir($event)" />
      <h2>Produtos cadastrados</h2>
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      }
      <ul class="linhas-carrinho">
        @for (produto of produtos(); track produto.id) {
          <li><app-linha-produto-administracao [produto]="produto" /></li>
        }
      </ul>
    </section>
  `,
})
export class PaginaAdministracao implements OnInit {
  private readonly consultarCatalogo = inject(ConsultarCatalogo);

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly erro = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.produtos.set(await this.consultarCatalogo.executar());
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }

  protected incluir(produto: Produto): void {
    this.produtos.update((atuais) => [produto, ...atuais]);
  }
}
