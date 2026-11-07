import type { FaixaEtariaGato, MeioPagamento, CategoriaProduto } from '../../../application/domain/modelos';

export const ROTULOS_CATEGORIA: Readonly<Record<CategoriaProduto, string>> = {
  VARINHA: 'Varinhas',
  BOLINHA: 'Bolinhas',
  ARRANHADOR: 'Arranhadores',
  TUNEL: 'Túneis',
  CATNIP: 'Catnip',
  INTERATIVO: 'Interativos',
};

export const ROTULOS_FAIXA_ETARIA: Readonly<Record<FaixaEtariaGato, string>> = {
  FILHOTE: 'Filhotes',
  ADULTO: 'Gatos adultos',
  IDOSO: 'Gatos idosos',
  TODAS_AS_IDADES: 'Todas as idades',
};

export const ROTULOS_PAGAMENTO: Readonly<Record<MeioPagamento, string>> = {
  PIX: 'Pix',
  BOLETO: 'Boleto',
  CARTAO: 'Cartão de crédito (simulado)',
};

export const ROTULOS_STATUS_PEDIDO: Readonly<Record<string, string>> = {
  PAGO: 'Pago',
};
