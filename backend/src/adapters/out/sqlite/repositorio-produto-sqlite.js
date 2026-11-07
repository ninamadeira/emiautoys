import { ErroEstoqueInsuficiente, ErroProdutoNaoEncontrado } from '../../../application/domain/erros.js';
import { criarProduto } from '../../../application/domain/produto.js';

function paraProduto(registro) {
  return criarProduto({
    id: registro.id,
    nome: registro.nome,
    descricao: registro.descricao,
    categoria: registro.categoria,
    precoCentavos: registro.preco_centavos,
    estoque: registro.estoque,
    faixaEtariaIndicada: registro.faixa_etaria_indicada,
    avisoSeguranca: registro.aviso_seguranca,
    urlImagem: registro.url_imagem,
  });
}

const SQL_UPSERT_PRODUTO = `INSERT INTO produtos
  (id, nome, descricao, categoria, preco_centavos, estoque, faixa_etaria_indicada, aviso_seguranca, url_imagem)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    nome = excluded.nome, descricao = excluded.descricao, categoria = excluded.categoria,
    preco_centavos = excluded.preco_centavos, estoque = excluded.estoque,
    faixa_etaria_indicada = excluded.faixa_etaria_indicada, aviso_seguranca = excluded.aviso_seguranca,
    url_imagem = excluded.url_imagem`;

function paraColunas(produto) {
  return [
    produto.id,
    produto.nome,
    produto.descricao,
    produto.categoria,
    produto.precoCentavos,
    produto.estoque,
    produto.faixaEtariaIndicada,
    produto.avisoSeguranca,
    produto.urlImagem,
  ];
}

export class RepositorioProdutoSqlite {
  #banco;

  constructor(banco) {
    this.#banco = banco;
  }

  async buscarTodos() {
    return this.#banco.prepare('SELECT * FROM produtos ORDER BY nome').all().map(paraProduto);
  }

  async buscarPorId(produtoId) {
    const registro = this.#banco.prepare('SELECT * FROM produtos WHERE id = ?').get(produtoId);
    return registro ? paraProduto(registro) : undefined;
  }

  async buscarPorIds(produtoIds) {
    const encontrados = await Promise.all(produtoIds.map((id) => this.buscarPorId(id)));
    return encontrados.filter(Boolean);
  }

  async salvar(produto) {
    this.#banco.prepare(SQL_UPSERT_PRODUTO).run(...paraColunas(produto));
  }

  async reservarEstoque({ produtoId, quantidade }) {
    const resultado = this.#banco
      .prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?')
      .run(quantidade, produtoId, quantidade);
    if (resultado.changes === 1) {
      return;
    }
    const produto = await this.buscarPorId(produtoId);
    if (!produto) {
      throw new ErroProdutoNaoEncontrado(produtoId);
    }
    throw new ErroEstoqueInsuficiente({ produtoId, solicitada: quantidade, disponivel: produto.estoque });
  }

  async liberarEstoque({ produtoId, quantidade }) {
    this.#banco
      .prepare('UPDATE produtos SET estoque = estoque + ? WHERE id = ?')
      .run(quantidade, produtoId);
  }
}
