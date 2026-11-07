import { precificarCarrinho } from '../domain/carrinho.js';
import { calcularDescontoCentavos, normalizarCodigoCupom } from '../domain/cupom.js';
import { ErroCarrinhoVazio, ErroCupomInvalido } from '../domain/erros.js';
import { garantirEstoqueDisponivel } from '../domain/produto.js';
import { calcularCustoFrete } from '../domain/frete.js';

export class CotarPedido {
  #repositorioCarrinho;
  #repositorioProduto;
  #repositorioCupom;
  #clock;

  constructor({ repositorioCarrinho, repositorioProduto, repositorioCupom, clock }) {
    this.#repositorioCarrinho = repositorioCarrinho;
    this.#repositorioProduto = repositorioProduto;
    this.#repositorioCupom = repositorioCupom;
    this.#clock = clock;
  }

  async executar({ usuarioId, cep, codigoCupom }) {
    const { linhas, subtotalCentavos } = await this.#precificarCarrinhoDisponivel(usuarioId);
    const descontoCentavos = await this.#descontoPara({ codigoCupom, subtotalCentavos });
    const freteCentavos = calcularCustoFrete({
      subtotalCentavos: subtotalCentavos - descontoCentavos,
      cep,
    });
    return {
      linhas,
      subtotalCentavos,
      descontoCentavos,
      freteCentavos,
      totalCentavos: subtotalCentavos - descontoCentavos + freteCentavos,
      codigoCupom: codigoCupom ? normalizarCodigoCupom(codigoCupom) : undefined,
    };
  }

  async #precificarCarrinhoDisponivel(usuarioId) {
    const carrinho = await this.#repositorioCarrinho.buscarPorUsuarioId(usuarioId);
    if (carrinho.itens.length === 0) {
      throw new ErroCarrinhoVazio();
    }
    const produtos = await this.#repositorioProduto.buscarPorIds(carrinho.itens.map((item) => item.produtoId));
    const precificado = precificarCarrinho(carrinho, produtos);
    this.#garantirEstoque(carrinho, produtos);
    return precificado;
  }

  #garantirEstoque(carrinho, produtos) {
    for (const item of carrinho.itens) {
      const produto = produtos.find((candidato) => candidato.id === item.produtoId);
      garantirEstoqueDisponivel(produto, item.quantidade);
    }
  }

  async #descontoPara({ codigoCupom, subtotalCentavos }) {
    if (!codigoCupom) {
      return 0;
    }
    const cupom = await this.#repositorioCupom.buscarPorCodigo(normalizarCodigoCupom(codigoCupom));
    if (!cupom) {
      throw new ErroCupomInvalido('NAO_ENCONTRADO');
    }
    return calcularDescontoCentavos({ cupom, subtotalCentavos, agora: this.#clock.agora() });
  }
}
