const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 8;
const TAMANHO_CEP = 8;

export function emailEhValido(email: string): boolean {
  return PADRAO_EMAIL.test(email.trim());
}

export function senhaEhForte(senha: string): boolean {
  return senha.length >= TAMANHO_MINIMO_SENHA && /[A-Za-z]/.test(senha) && /\d/.test(senha);
}

export function normalizarCep(cep: string): string | undefined {
  const digits = cep.replace(/\D/g, '');
  return digits.length === TAMANHO_CEP ? digits : undefined;
}

export function estaEmBranco(value: string): boolean {
  return value.trim() === '';
}
