import { ErroDaAplicacao } from '../../../application/domain/erro-da-aplicacao';

const ROTULOS_CAMPOS: Readonly<Record<string, string>> = {
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  cep: 'CEP',
  nomeDestinatario: 'Nome do destinatário',
  rua: 'Rua',
  numero: 'Número',
  cidade: 'Cidade',
  estado: 'UF',
  quantidade: 'Quantidade',
  codigoCupom: 'Cupom',
};

const MENSAGENS: Readonly<Record<string, string>> = {
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  NAO_AUTORIZADO: 'Sua sessão expirou. Entre novamente para continuar.',
  EMAIL_JA_CADASTRADO: 'Este e-mail já está cadastrado.',
  PRODUTO_NAO_ENCONTRADO: 'Produto não encontrado.',
  CUPOM_INVALIDO: 'Cupom inválido ou expirado.',
  CARRINHO_VAZIO: 'Seu carrinho está vazio.',
  PAGAMENTO_RECUSADO: 'Pagamento recusado. Tente outro meio de pagamento.',
  PRODUTO_INSEGURO: 'Este produto não pode ser vendido por apresentar risco para os gatos.',
  ERRO_DE_REDE: 'Não foi possível conectar ao servidor. Verifique sua internet.',
  ERRO_INTERNO: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  DESCONHECIDO: 'Algo deu errado. Tente novamente.',
};

function descreverValidacao(detalhes: ErroDaAplicacao['detalhes']): string {
  const campo = ROTULOS_CAMPOS[String(detalhes['campo'])] ?? 'campo';
  switch (detalhes['motivo']) {
    case 'OBRIGATORIO':
      return `Preencha o campo "${campo}".`;
    case 'FRACA_DEMAIS':
      return 'A senha precisa ter ao menos 8 caracteres, com letras e números.';
    case 'ACIMA_DO_MAXIMO':
      return 'A quantidade máxima por item é 10.';
    case 'INTEIRO_POSITIVO_OBRIGATORIO':
      return `Informe um número inteiro maior que zero em "${campo}".`;
    default:
      return `O campo "${campo}" está em um formato inválido.`;
  }
}

function descreverEstoqueInsuficiente(detalhes: ErroDaAplicacao['detalhes']): string {
  const disponivel = detalhes['disponivel'];
  return typeof disponivel === 'number'
    ? `Estoque insuficiente. Unidades disponíveis: ${disponivel}.`
    : 'Estoque insuficiente para a quantidade solicitada.';
}

/** Traduz um erro (código em português) para a mensagem exibida ao usuário. */
export function descreverErro(erro: unknown): string {
  if (!(erro instanceof ErroDaAplicacao)) return MENSAGENS['DESCONHECIDO'];
  if (erro.codigo === 'VALIDACAO_FALHOU') return descreverValidacao(erro.detalhes);
  if (erro.codigo === 'ESTOQUE_INSUFICIENTE') return descreverEstoqueInsuficiente(erro.detalhes);
  return MENSAGENS[erro.codigo] ?? MENSAGENS['DESCONHECIDO'];
}
