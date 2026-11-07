import { ErroProdutoNaoEncontrado } from '../domain/erros.js';
import { definirQuantidadeItem } from '../domain/carrinho.js';
import { garantirEstoqueDisponivel } from '../domain/produto.js';

export class AtualizarItemDoCarrinho {
  #repositorioCarrinho;
  #repositorioProduto;
  #obterCarrinho;

  constructor({ repositorioCarrinho, repositorioProduto, obterCarrinho }) {
    this.#repositorioCarrinho = repositorioCarrinho;
    this.#repositorioProduto = repositorioProduto;
    this.#obterCarrinho = obterCarrinho;
  }

  async executar({ usuarioId, produtoId, quantidade }) {
    const produto = await this.#repositorioProduto.buscarPorId(produtoId);
    if (!produto) {
      throw new ErroProdutoNaoEncontrado(produtoId);
    }
    const carrinho = definirQuantidadeItem(await this.#repositorioCarrinho.buscarPorUsuarioId(usuarioId), { produtoId, quantidade });
    garantirEstoqueDisponivel(produto, quantidade);
    await this.#repositorioCarrinho.salvar(carrinho);
    return this.#obterCarrinho.executar({ usuarioId });
  }
}
