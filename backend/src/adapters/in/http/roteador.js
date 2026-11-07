import { ErroHttp } from './erro-http.js';

const PADRAO_PARAMETRO = /:([A-Za-z]+)/g;

function compilarRota(rota) {
  const nomesParametros = [];
  const codigoFonte = rota.path.replace(PADRAO_PARAMETRO, (_, nome) => {
    nomesParametros.push(nome);
    return '([^/]+)';
  });
  return { ...rota, nomesParametros, regex: new RegExp(`^${codigoFonte}$`) };
}

function extrairParametros(rota, match) {
  const entradas = rota.nomesParametros.map((nome, indice) => [nome, decodeURIComponent(match[indice + 1])]);
  return Object.fromEntries(entradas);
}

export function criarRoteador(rotas) {
  const rotasCompiladas = rotas.map(compilarRota);
  return {
    resolve(method, pathname) {
      const candidatos = rotasCompiladas.filter((rota) => rota.regex.test(pathname));
      if (candidatos.length === 0) {
        throw new ErroHttp('ROTA_NAO_ENCONTRADA');
      }
      const rota = candidatos.find((candidato) => candidato.method === method);
      if (!rota) {
        throw new ErroHttp('METODO_NAO_PERMITIDO');
      }
      return { rota, parametros: extrairParametros(rota, rota.regex.exec(pathname)) };
    },
  };
}
