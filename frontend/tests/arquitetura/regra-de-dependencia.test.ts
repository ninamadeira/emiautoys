import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const RAIZ_APP = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/app');
const PADRAO_IMPORTACAO = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function listarArquivosTypeScript(directory: string): string[] {
  return readdirSync(directory).flatMap((entrada) => {
    const path = join(directory, entrada);
    if (statSync(path).isDirectory()) return listarArquivosTypeScript(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

function camadaDe(path: string): string {
  const [primeiro, segundo, terceiro] = relative(RAIZ_APP, path).split(sep);
  if (primeiro === 'application') return segundo === 'domain' ? 'domain' : segundo === 'use-cases' ? 'use-cases' : 'ports';
  if (primeiro === 'adapters') return `adapters-${segundo}`;
  return primeiro === 'config' ? 'config' : `raiz-${terceiro ?? ''}`;
}

interface EntradaImportacao {
  arquivo: string;
  specifier: string;
  camada: string;
}

function importacoesDe(arquivo: string): EntradaImportacao[] {
  const codigoFonte = readFileSync(arquivo, 'utf8');
  return [...codigoFonte.matchAll(PADRAO_IMPORTACAO)].map((match) => {
    const specifier = (match[1] ?? match[2]) as string;
    const camada = specifier.startsWith('.') ? camadaDe(resolve(dirname(arquivo), specifier)) : 'externo';
    return { arquivo, specifier, camada };
  });
}

const ARQUIVOS = listarArquivosTypeScript(RAIZ_APP);
const TODAS_IMPORTACOES = ARQUIVOS.flatMap(importacoesDe);
const show = (entradas: EntradaImportacao[]): string[] => entradas.map((e) => `${relative(RAIZ_APP, e.arquivo)} -> ${e.specifier}`);
const from = (camadas: string[]) => TODAS_IMPORTACOES.filter((entrada) => camadas.includes(camadaDe(entrada.arquivo)));

describe('regra de dependência hexagonal no front-end (Artigo XII)', () => {
  it('encontra os arquivos-fonte a verificar', () => {
    assert.ok(TODAS_IMPORTACOES.length > 40);
  });

  it('a aplicação não depende de framework: sem Angular, RxJS ou qualquer importação externa', () => {
    const infratores = from(['domain', 'use-cases', 'ports']).filter((entrada) => entrada.camada === 'externo');
    assert.deepEqual(show(infratores), []);
  });

  it('o domínio não importa nada fora do domínio', () => {
    const infratores = from(['domain']).filter((entrada) => entrada.camada !== 'domain');
    assert.deepEqual(show(infratores), []);
  });

  it('casos de uso dependem apenas do domínio e das ports', () => {
    const infratores = from(['use-cases']).filter((entrada) => !['domain', 'ports'].includes(entrada.camada));
    assert.deepEqual(show(infratores), []);
  });

  it('a aplicação nunca importa adapters nem configuração', () => {
    const infratores = from(['domain', 'use-cases', 'ports']).filter((entrada) => /^(adapters|config)/.test(entrada.camada));
    assert.deepEqual(show(infratores), []);
  });

  it('adapters de entrada e de saída não importam um ao outro nem a configuração', () => {
    const infratoresEntrada = from(['adapters-in']).filter((entrada) => ['adapters-out', 'config'].includes(entrada.camada));
    const infratoresSaida = from(['adapters-out']).filter((entrada) => ['adapters-in', 'config'].includes(entrada.camada));
    assert.deepEqual(show([...infratoresEntrada, ...infratoresSaida]), []);
  });

  it('mantém arquivos coesos (menos de 200 linhas) e sem console.log', () => {
    const longosDemais = ARQUIVOS.filter((arquivo) => readFileSync(arquivo, 'utf8').split('\n').length > 200);
    const comConsole = ARQUIVOS.filter((arquivo) => /console\.log\(/.test(readFileSync(arquivo, 'utf8')));
    assert.deepEqual([...longosDemais, ...comConsole].map((arquivo) => relative(RAIZ_APP, arquivo)), []);
  });
});
