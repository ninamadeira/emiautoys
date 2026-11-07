import { criado, ok } from '../respostas.js';

export function rotasAutenticacao({ cadastrarUsuario, autenticarUsuario }) {
  return [
    {
      method: 'POST',
      path: '/api/autenticacao/cadastrar',
      tratador: async ({ body }) => {
        const usuario = await cadastrarUsuario.executar({ nome: body.nome, email: body.email, senha: body.senha });
        return criado({ usuario });
      },
    },
    {
      method: 'POST',
      path: '/api/autenticacao/entrar',
      tratador: async ({ body }) => ok(await autenticarUsuario.executar({ email: body.email, senha: body.senha })),
    },
  ];
}
