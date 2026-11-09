import { ErroProdutoNaoEncontrado } from '../domain/erros.js';
import { criarProduto } from '../domain/produto.js';
import { garantirAdministrador } from '../domain/administrador.js';

const CAMPOS_ALTERAVEIS = Object.freeze([
  'nome',
  'descricao',
  'categoria',
  'precoCentavos',
  'estoque',
  'faixaEtariaIndicada',
  'avisoSeguranca',
  'urlImagem',
  'rotulosRisco',
]);

function camposInformados(dados) {
  const entradas = CAMPOS_ALTERAVEIS.filter((campo) => dados[campo] !== undefined).map((campo) => [campo, dados[campo]]);
  return Object.fromEntries(entradas);
}

export class AlterarProduto {
  #repositorioProduto;
  #repositorioUsuario;
  #emailsAdministradores;

  constructor({ repositorioProduto, repositorioUsuario, emailsAdministradores = [] }) {
    this.#repositorioProduto = repositorioProduto;
    this.#repositorioUsuario = repositorioUsuario;
    this.#emailsAdministradores = emailsAdministradores;
  }

  async executar({ usuarioId, produtoId, dados }) {
    garantirAdministrador(await this.#repositorioUsuario.buscarPorId(usuarioId), this.#emailsAdministradores);
    const atual = await this.#repositorioProduto.buscarPorId(produtoId);
    if (!atual) {
      throw new ErroProdutoNaoEncontrado(produtoId);
    }
    const produto = criarProduto({ ...atual, ...camposInformados(dados), id: atual.id });
    await this.#repositorioProduto.salvar(produto);
    return produto;
  }
}
