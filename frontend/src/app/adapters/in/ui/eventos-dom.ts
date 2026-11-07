export function valueOf(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

export function numeroDe(event: Event): number {
  return Number(valueOf(event));
}

/** Aceita apenas caminhos internos como destino de retorno (evita redirecionamento aberto). */
export function urlRetornoSegura(candidato: string | undefined): string {
  const ehCaminhoInterno = !!candidato && candidato.startsWith('/') && !candidato.startsWith('//');
  return ehCaminhoInterno ? candidato : '/loja';
}
