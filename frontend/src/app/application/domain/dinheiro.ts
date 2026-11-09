const PADRAO_REAIS = /^\d+([.,]\d{1,2})?$/;
const CENTAVOS_POR_REAL = 100;

/** Converte "29,90" ou "29.90" em centavos inteiros; devolve undefined se o texto não for um valor em reais. */
export function reaisParaCentavos(texto: string): number | undefined {
  const limpo = texto.replace(/R\$|\s/g, '');
  if (!PADRAO_REAIS.test(limpo)) return undefined;
  return Math.round(Number(limpo.replace(',', '.')) * CENTAVOS_POR_REAL);
}

export function centavosParaReais(centavos: number): string {
  return (centavos / CENTAVOS_POR_REAL).toFixed(2).replace('.', ',');
}

/** Número inteiro digitado em um campo; texto vazio vira NaN para que a validação o recuse. */
export function numeroDigitado(texto: string): number {
  return texto.trim() === '' ? Number.NaN : Number(texto);
}
