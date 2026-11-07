import { ok } from '../respostas.js';

export function rotasProduto({ listarProdutos, obterProduto }) {
  return [
    {
      method: 'GET',
      path: '/api/produtos',
      tratador: async ({ consulta }) => ok({ produtos: await listarProdutos.executar({ categoria: consulta.categoria }) }),
    },
    {
      method: 'GET',
      path: '/api/produtos/:produtoId',
      tratador: async ({ parametros }) => ok({ produto: await obterProduto.executar({ produtoId: parametros.produtoId }) }),
    },
  ];
}
