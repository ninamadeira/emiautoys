import { ErroEstoqueInsuficiente, ErroProdutoInseguro } from './erros.js';
import {
  exigirInteiroNaoNegativo,
  exigirUmDe,
  exigirInteiroPositivo,
  exigirTexto,
} from './validacao.js';

export const CATEGORIAS_PRODUTO = Object.freeze([
  'VARINHA',
  'BOLINHA',
  'ARRANHADOR',
  'TUNEL',
  'CATNIP',
  'INTERATIVO',
]);

export const FAIXAS_ETARIAS_GATO = Object.freeze(['FILHOTE', 'ADULTO', 'IDOSO', 'TODAS_AS_IDADES']);

export const ROTULOS_RISCO_PROIBIDOS = Object.freeze(['FIO_SOLTO_LONGO', 'PENAS_TINGIDAS_TOXICAS']);

function garantirSemRiscoProibido(rotulosRisco) {
  const rotuloProibido = rotulosRisco.find((tag) => ROTULOS_RISCO_PROIBIDOS.includes(tag));
  if (rotuloProibido) {
    throw new ErroProdutoInseguro(rotuloProibido);
  }
}

export function criarProduto(propriedades) {
  garantirSemRiscoProibido(propriedades.rotulosRisco ?? []);
  return Object.freeze({
    id: exigirTexto(propriedades.id, 'id'),
    nome: exigirTexto(propriedades.nome, 'nome'),
    descricao: exigirTexto(propriedades.descricao, 'descricao'),
    categoria: exigirUmDe(propriedades.categoria, CATEGORIAS_PRODUTO, 'categoria'),
    precoCentavos: exigirInteiroPositivo(propriedades.precoCentavos, 'precoCentavos'),
    estoque: exigirInteiroNaoNegativo(propriedades.estoque, 'estoque'),
    faixaEtariaIndicada: exigirUmDe(propriedades.faixaEtariaIndicada, FAIXAS_ETARIAS_GATO, 'faixaEtariaIndicada'),
    avisoSeguranca: exigirTexto(propriedades.avisoSeguranca, 'avisoSeguranca'),
    urlImagem: exigirTexto(propriedades.urlImagem, 'urlImagem'),
  });
}

export function garantirEstoqueDisponivel(produto, quantidade) {
  if (produto.estoque < quantidade) {
    throw new ErroEstoqueInsuficiente({
      produtoId: produto.id,
      solicitada: quantidade,
      disponivel: produto.estoque,
    });
  }
}
