export function montarPropsProduto(sobrescritas = {}) {
  return {
    id: 'prod-1',
    nome: 'Feather wand',
    descricao: 'Varinha com uma pena macia na ponta',
    categoria: 'VARINHA',
    precoCentavos: 2990,
    estoque: 10,
    faixaEtariaIndicada: 'TODAS_AS_IDADES',
    avisoSeguranca: 'Supervisione o uso; contém peças pequenas',
    urlImagem: '/imagens/varinha-pena.webp',
    ...sobrescritas,
  };
}

export function montarPropsEnderecoEntrega(sobrescritas = {}) {
  return {
    nomeDestinatario: 'Maria Silva',
    cep: '90010-000',
    rua: 'Rua dos Andradas',
    numero: '100',
    cidade: 'Porto Alegre',
    estado: 'RS',
    ...sobrescritas,
  };
}

export const SENHA_VALIDA = 'miau1234';
