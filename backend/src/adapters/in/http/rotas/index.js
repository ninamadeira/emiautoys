import { rotasConta } from './rotas-conta.js';
import { rotasAutenticacao } from './rotas-autenticacao.js';
import { rotasCarrinho } from './rotas-carrinho.js';
import { rotasFinalizacao } from './rotas-finalizacao.js';
import { rotasProduto } from './rotas-produto.js';
import { rotasSistema } from './rotas-sistema.js';

export function montarRotas(casosDeUso) {
  return [
    ...rotasSistema(),
    ...rotasProduto(casosDeUso),
    ...rotasAutenticacao(casosDeUso),
    ...rotasCarrinho(casosDeUso),
    ...rotasFinalizacao(casosDeUso),
    ...rotasConta(casosDeUso),
  ];
}
