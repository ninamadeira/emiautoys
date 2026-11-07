import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_FONTES = resolve(dirname(fileURLToPath(import.meta.url)), '../../src');
const PADRAO_IMPORTACAO = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function listarArquivosJavaScript(directory) {
  return readdirSync(directory).flatMap((entrada) => {
    const path = join(directory, entrada);
    return statSync(path).isDirectory() ? listarArquivosJavaScript(path) : path.endsWith('.js') ? [path] : [];
  });
}

function camadaDe(path) {
  const partes = relative(RAIZ_FONTES, path).split(sep);
  if (partes[0] === 'application') {
    return partes[1] === 'domain' ? 'domain' : partes[1] === 'use-cases' ? 'use-cases' : 'ports';
  }
  if (partes[0] === 'adapters') {
    return `adapters-${partes[1]}`;
  }
  return partes[0];
}

function importacoesDe(arquivo) {
  const codigoFonte = readFileSync(arquivo, 'utf8');
  return [...codigoFonte.matchAll(PADRAO_IMPORTACAO)].map((match) => match[1] ?? match[2]);
}

function descreverImportacoes(arquivo) {
  return importacoesDe(arquivo).map((specifier) => {
    const ehRelativo = specifier.startsWith('.');
    return { arquivo, specifier, ehRelativo, camada: ehRelativo ? camadaDe(resolve(dirname(arquivo), specifier)) : 'externo' };
  });
}

const TODAS_IMPORTACOES = listarArquivosJavaScript(RAIZ_FONTES).flatMap(descreverImportacoes);

function violations({ deCamadas, camadasProibidas }) {
  return TODAS_IMPORTACOES.filter(
    (entrada) => deCamadas.includes(camadaDe(entrada.arquivo)) && camadasProibidas.includes(entrada.camada),
  ).map((entrada) => `${relative(RAIZ_FONTES, entrada.arquivo)} -> ${entrada.specifier}`);
}

describe('regra de dependência hexagonal (Artigo XII)', () => {
  it('encontra os arquivos-fonte a verificar', () => {
    assert.ok(TODAS_IMPORTACOES.length > 50);
  });

  it('regra 1: o domínio não importa nada fora do domínio', () => {
    const outside = TODAS_IMPORTACOES.filter(
      (entrada) => camadaDe(entrada.arquivo) === 'domain' && (entrada.camada !== 'domain'),
    ).map((entrada) => `${relative(RAIZ_FONTES, entrada.arquivo)} -> ${entrada.specifier}`);
    assert.deepEqual(outside, []);
  });

  it('regra 2: casos de uso dependem apenas do domínio e das ports', () => {
    const forbidden = ['use-cases', 'adapters-in', 'adapters-out', 'config', 'externo'];
    const encontrados = TODAS_IMPORTACOES.filter(
      (entrada) => camadaDe(entrada.arquivo) === 'use-cases' && forbidden.includes(entrada.camada),
    ).map((entrada) => `${relative(RAIZ_FONTES, entrada.arquivo)} -> ${entrada.specifier}`);
    assert.deepEqual(encontrados, []);
  });

  it('regra 3: a aplicação nunca importa adapters nem configuração', () => {
    const encontrados = violations({
      deCamadas: ['domain', 'use-cases', 'ports'],
      camadasProibidas: ['adapters-in', 'adapters-out', 'config'],
    });
    assert.deepEqual(encontrados, []);
  });

  it('regra 4: adapters de entrada e de saída não importam um ao outro', () => {
    assert.deepEqual(violations({ deCamadas: ['adapters-in'], camadasProibidas: ['adapters-out', 'config'] }), []);
    assert.deepEqual(violations({ deCamadas: ['adapters-out'], camadasProibidas: ['adapters-in', 'config'] }), []);
  });

  it('regra 5: somente a configuração instancia adapters concretos', () => {
    const nomesClassesAdaptadores = /new\s+(Sqlite|InMemory|Scrypt|Hmac|Simulated|System|Uuid|Stdout)\w*\(/;
    const infratores = listarArquivosJavaScript(RAIZ_FONTES)
      .filter((arquivo) => camadaDe(arquivo) !== 'config')
      .filter((arquivo) => nomesClassesAdaptadores.test(readFileSync(arquivo, 'utf8')))
      .map((arquivo) => relative(RAIZ_FONTES, arquivo));
    assert.deepEqual(infratores, []);
  });

  it('mantém os arquivos-fonte coesos (menos de 200 linhas)', () => {
    const MAX_LINHAS = 200;
    const longosDemais = listarArquivosJavaScript(RAIZ_FONTES)
      .filter((arquivo) => readFileSync(arquivo, 'utf8').split('\n').length > MAX_LINHAS)
      .map((arquivo) => relative(RAIZ_FONTES, arquivo));
    assert.deepEqual(longosDemais, []);
  });

  it('não deixa console.log esquecido', () => {
    const infratores = listarArquivosJavaScript(RAIZ_FONTES)
      .filter((arquivo) => /console\.log\(/.test(readFileSync(arquivo, 'utf8')))
      .map((arquivo) => relative(RAIZ_FONTES, arquivo));
    assert.deepEqual(infratores, []);
  });
});
