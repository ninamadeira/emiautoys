import { criarCarrinho } from '../../../application/domain/carrinho.js';
import { executarEmTransacao } from './executar-em-transacao.js';

export class RepositorioCarrinhoSqlite {
  #banco;

  constructor(banco) {
    this.#banco = banco;
  }

  async buscarPorUsuarioId(usuarioId) {
    const registros = this.#banco
      .prepare('SELECT produto_id, quantidade FROM itens_carrinho WHERE usuario_id = ? ORDER BY posicao')
      .all(usuarioId);
    const itens = registros.map((registro) => ({ produtoId: registro.produto_id, quantidade: registro.quantidade }));
    return criarCarrinho({ usuarioId, itens });
  }

  async salvar(carrinho) {
    executarEmTransacao(this.#banco, () => {
      this.#excluirItens(carrinho.usuarioId);
      carrinho.itens.forEach((item, posicao) => this.#inserirItem({ carrinho, item, posicao }));
    });
  }

  async limpar(usuarioId) {
    this.#excluirItens(usuarioId);
  }

  #excluirItens(usuarioId) {
    this.#banco.prepare('DELETE FROM itens_carrinho WHERE usuario_id = ?').run(usuarioId);
  }

  #inserirItem({ carrinho, item, posicao }) {
    this.#banco
      .prepare('INSERT INTO itens_carrinho (usuario_id, produto_id, quantidade, posicao) VALUES (?, ?, ?, ?)')
      .run(carrinho.usuarioId, item.produtoId, item.quantidade, posicao);
  }
}
