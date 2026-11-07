const TAMANHO_PREENCHIMENTO = 2;

/** Formata uma data ISO como `dd/MM/yyyy` (fuso do navegador). */
export function formatarData(dataIso: string): string {
  const date = new Date(dataIso);
  const day = String(date.getDate()).padStart(TAMANHO_PREENCHIMENTO, '0');
  const month = String(date.getMonth() + 1).padStart(TAMANHO_PREENCHIMENTO, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}
