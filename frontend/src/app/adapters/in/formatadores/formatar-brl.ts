const CENTAVOS_POR_REAL = 100;

const FORMATO_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata centavos como `R$ 1.234,56`. */
export function formatarBrl(cents: number): string {
  return FORMATO_BRL.format(cents / CENTAVOS_POR_REAL);
}
