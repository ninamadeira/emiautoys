import { criarCupom } from '../../../application/domain/cupom.js';

function paraCupom(registro) {
  return criarCupom({
    codigo: registro.codigo,
    percentualDesconto: registro.percentual_desconto,
    expiraEm: registro.expira_em ? new Date(registro.expira_em) : undefined,
    ativo: registro.ativo === 1,
  });
}

export class RepositorioCupomSqlite {
  #banco;

  constructor(banco) {
    this.#banco = banco;
  }

  async buscarPorCodigo(codigo) {
    const registro = this.#banco.prepare('SELECT * FROM cupons WHERE codigo = ?').get(codigo);
    return registro ? paraCupom(registro) : undefined;
  }

  async salvar(cupom) {
    this.#banco
      .prepare(
        `INSERT INTO cupons (codigo, percentual_desconto, expira_em, ativo) VALUES (?, ?, ?, ?)
         ON CONFLICT(codigo) DO UPDATE SET percentual_desconto = excluded.percentual_desconto,
           expira_em = excluded.expira_em, ativo = excluded.ativo`,
      )
      .run(
        cupom.codigo,
        cupom.percentualDesconto,
        cupom.expiraEm ? cupom.expiraEm.toISOString() : null,
        cupom.ativo ? 1 : 0,
      );
  }
}
