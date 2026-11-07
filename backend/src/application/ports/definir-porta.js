export function definirPorta(nome, nomesMetodos) {
  return Object.freeze({ nome, nomesMetodos: Object.freeze([...nomesMetodos]) });
}

export function garantirQueImplementaPorta(porta, implementation) {
  const metodosAusentes = porta.nomesMetodos.filter(
    (nomeMetodo) => typeof implementation[nomeMetodo] !== 'function',
  );
  if (metodosAusentes.length > 0) {
    throw new TypeError(`${porta.nome} não implementa os métodos: ${metodosAusentes.join(', ')}`);
  }
}
