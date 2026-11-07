import { ErroProdutoNaoEncontrado } from '../domain/erros.js';
import { adicionarItem } from '../domain/carrinho.js';
import { garantirEstoqueDisponivel } from '../domain/produto.js';

export class AdicionarItemAoCarrinho {
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
    const carrinho = adicionarItem(await this.#repositorioCarrinho.buscarPorUsuarioId(usuarioId), { produtoId, quantidade });
    const unidadesSolicitadas = carrinho.itens.find((item) => item.produtoId === produtoId).quantidade;
    garantirEstoqueDisponivel(produto, unidadesSolicitadas);
    await this.#repositorioCarrinho.salvar(carrinho);
    return this.#obterCarrinho.executar({ usuarioId });
  }
}
