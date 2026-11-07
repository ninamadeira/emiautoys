import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import type { Carrinho } from '../../../application/domain/modelos';
import { AdicionarAoCarrinho } from '../../../application/use-cases/adicionar-ao-carrinho';
import { AlterarQuantidadeItemCarrinho } from '../../../application/use-cases/alterar-quantidade-item-carrinho';
import { CarregarCarrinho } from '../../../application/use-cases/carregar-carrinho';
import { RemoverDoCarrinho } from '../../../application/use-cases/remover-do-carrinho';
import { EstadoSessao } from './sessao.estado';

const CARRINHO_VAZIO: Carrinho = { linhas: [], subtotalCentavos: 0, totalUnidades: 0 };

@Injectable({ providedIn: 'root' })
export class EstadoCarrinho {
  private readonly sessao = inject(EstadoSessao);
  private readonly carregarCarrinho = inject(CarregarCarrinho);
  private readonly adicionarAoCarrinho = inject(AdicionarAoCarrinho);
  private readonly alterarQuantidade = inject(AlterarQuantidadeItemCarrinho);
  private readonly removerDoCarrinho = inject(RemoverDoCarrinho);

  private readonly carrinhoAtual = signal<Carrinho>(CARRINHO_VAZIO);
  readonly carrinho = this.carrinhoAtual.asReadonly();

  constructor() {
    effect(() => {
      const estaAutenticado = this.sessao.estaAutenticado();
      untracked(() => (estaAutenticado ? void this.refresh().catch(() => undefined) : this.carrinhoAtual.set(CARRINHO_VAZIO)));
    });
  }

  async refresh(): Promise<void> {
    this.carrinhoAtual.set(await this.carregarCarrinho.executar());
  }

  async add(produtoId: string, quantidade: number): Promise<void> {
    this.carrinhoAtual.set(await this.adicionarAoCarrinho.executar(produtoId, quantidade));
  }

  async definirQuantidade(produtoId: string, quantidade: number): Promise<void> {
    this.carrinhoAtual.set(await this.alterarQuantidade.executar(produtoId, quantidade));
  }

  async remove(produtoId: string): Promise<void> {
    this.carrinhoAtual.set(await this.removerDoCarrinho.executar(produtoId));
  }

  limparLocal(): void {
    this.carrinhoAtual.set(CARRINHO_VAZIO);
  }
}
