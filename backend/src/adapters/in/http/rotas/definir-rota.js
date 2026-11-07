export function rotaPublica(method, path, tratador) {
  return { method, path, tratador };
}

export function rotaAutenticada(method, path, tratador) {
  return { method, path, tratador, exigeAutenticacao: true };
}
