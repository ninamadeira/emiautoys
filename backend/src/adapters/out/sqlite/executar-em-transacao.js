export function executarEmTransacao(banco, operacao) {
  banco.exec('BEGIN');
  try {
    operacao();
    banco.exec('COMMIT');
  } catch (erro) {
    banco.exec('ROLLBACK');
    throw erro;
  }
}
