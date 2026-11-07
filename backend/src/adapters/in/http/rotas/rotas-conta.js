import { noContent } from '../respostas.js';

export function rotasConta({ excluirConta }) {
  return [
    {
      method: 'DELETE',
      path: '/api/conta',
      exigeAutenticacao: true,
      tratador: async ({ usuarioId }) => {
        await excluirConta.executar({ usuarioId });
        return noContent();
      },
    },
  ];
}
