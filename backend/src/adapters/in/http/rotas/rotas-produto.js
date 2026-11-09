import { criado, ok } from '../respostas.js';
import { rotaAutenticada } from './definir-rota.js';

export function rotasProduto({ listarProdutos, obterProduto, cadastrarProduto, alterarProduto }) {
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
    rotaAutenticada('POST', '/api/produtos', async ({ usuarioId, body }) =>
      criado({ produto: await cadastrarProduto.executar({ usuarioId, dados: body }) }),
    ),
    rotaAutenticada('PUT', '/api/produtos/:produtoId', async ({ usuarioId, parametros, body }) =>
      ok({ produto: await alterarProduto.executar({ usuarioId, produtoId: parametros.produtoId, dados: body }) }),
    ),
  ];
}
