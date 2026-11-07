const CABECALHOS_SEGURANCA = Object.freeze({
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'cache-control': 'no-store',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
});

export function aplicarCabecalhosSeguranca(resposta, origemCors) {
  for (const [nome, value] of Object.entries(CABECALHOS_SEGURANCA)) {
    resposta.setHeader(nome, value);
  }
  resposta.setHeader('access-control-allow-origin', origemCors);
  resposta.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  resposta.setHeader('access-control-allow-headers', 'content-type,authorization');
  resposta.setHeader('vary', 'Origin');
}
