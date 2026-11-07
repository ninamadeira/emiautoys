import { DatabaseSync } from 'node:sqlite';

const COMANDOS_ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS produtos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    preco_centavos INTEGER NOT NULL CHECK (preco_centavos > 0),
    estoque INTEGER NOT NULL CHECK (estoque >= 0),
    faixa_etaria_indicada TEXT NOT NULL,
    aviso_seguranca TEXT NOT NULL,
    url_imagem TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hash_senha TEXT NOT NULL,
    criado_em TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS itens_carrinho (
    usuario_id TEXT NOT NULL,
    produto_id TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    posicao INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, produto_id)
  )`,
  `CREATE TABLE IF NOT EXISTS cupons (
    codigo TEXT PRIMARY KEY,
    percentual_desconto INTEGER NOT NULL,
    expira_em TEXT,
    ativo INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    status TEXT NOT NULL,
    subtotal_centavos INTEGER NOT NULL,
    desconto_centavos INTEGER NOT NULL,
    frete_centavos INTEGER NOT NULL,
    total_centavos INTEGER NOT NULL,
    codigo_cupom TEXT,
    meio_pagamento TEXT NOT NULL,
    transacao_id TEXT NOT NULL,
    endereco_entrega_json TEXT NOT NULL,
    linhas_json TEXT NOT NULL,
    criado_em TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_orders_user ON pedidos (usuario_id)',
];

export function abrirBanco({ nomeArquivo }) {
  const banco = new DatabaseSync(nomeArquivo);
  banco.exec('PRAGMA journal_mode = WAL');
  for (const comando of COMANDOS_ESQUEMA) {
    banco.exec(comando);
  }
  return banco;
}
