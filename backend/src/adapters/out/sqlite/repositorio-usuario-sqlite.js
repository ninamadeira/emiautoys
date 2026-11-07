import { criarUsuario } from '../../../application/domain/usuario.js';

function paraUsuario(registro) {
  return criarUsuario({
    id: registro.id,
    nome: registro.nome,
    email: registro.email,
    hashSenha: registro.hash_senha,
    criadoEm: new Date(registro.criado_em),
  });
}

export class RepositorioUsuarioSqlite {
  #banco;

  constructor(banco) {
    this.#banco = banco;
  }

  async buscarPorId(usuarioId) {
    const registro = this.#banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuarioId);
    return registro ? paraUsuario(registro) : undefined;
  }

  async buscarPorEmail(email) {
    const registro = this.#banco.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    return registro ? paraUsuario(registro) : undefined;
  }

  async salvar(usuario) {
    this.#banco
      .prepare(
        `INSERT INTO usuarios (id, nome, email, hash_senha, criado_em) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, email = excluded.email,
           hash_senha = excluded.hash_senha`,
      )
      .run(usuario.id, usuario.nome, usuario.email, usuario.hashSenha, usuario.criadoEm.toISOString());
  }

  async excluirPorId(usuarioId) {
    this.#banco.prepare('DELETE FROM usuarios WHERE id = ?').run(usuarioId);
  }
}
