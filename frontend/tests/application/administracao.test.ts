import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { centavosParaReais, numeroDigitado, reaisParaCentavos } from '../../src/app/application/domain/dinheiro';
import type { DadosProduto } from '../../src/app/application/domain/modelos';
import { AlterarProduto } from '../../src/app/application/use-cases/alterar-produto';
import { CadastrarProduto, IMAGEM_PADRAO } from '../../src/app/application/use-cases/cadastrar-produto';
import { GatewayProdutoFalso } from './falsos';

const DADOS_VALIDOS: DadosProduto = {
  nome: 'Rato de crochê',
  descricao: 'Feito à mão',
  categoria: 'BOLINHA',
  precoCentavos: 1890,
  estoque: 12,
  faixaEtariaIndicada: 'ADULTO',
  avisoSeguranca: 'Use com supervisão',
  urlImagem: '',
};

async function motivoDe(execucao: () => Promise<unknown>): Promise<string> {
  try {
    await execucao();
  } catch (erro) {
    const detalhes = (erro as { detalhes?: Record<string, unknown> }).detalhes ?? {};
    return `${String(detalhes['campo'])}:${String(detalhes['motivo'])}`;
  }
  return 'sem erro';
}

describe('dinheiro', () => {
  it('converte reais digitados em centavos inteiros', () => {
    assert.equal(reaisParaCentavos('29,90'), 2990);
    assert.equal(reaisParaCentavos('R$ 29.9'), 2990);
    assert.equal(reaisParaCentavos('15'), 1500);
  });

  it('recusa valores que não são reais', () => {
    assert.equal(reaisParaCentavos(''), undefined);
    assert.equal(reaisParaCentavos('abc'), undefined);
    assert.equal(reaisParaCentavos('1,999'), undefined);
    assert.equal(reaisParaCentavos('-5'), undefined);
  });

  it('mostra centavos em reais e trata campo vazio como NaN', () => {
    assert.equal(centavosParaReais(2990), '29,90');
    assert.ok(Number.isNaN(numeroDigitado('  ')));
    assert.equal(numeroDigitado('7'), 7);
  });
});

describe('casos de uso de administração de produtos', () => {
  it('cadastra o produto e usa a imagem padrão quando nenhuma é informada', async () => {
    const gateway = new GatewayProdutoFalso();
    const produto = await new CadastrarProduto(gateway).executar(DADOS_VALIDOS);
    assert.equal(produto.urlImagem, IMAGEM_PADRAO);
    assert.equal(gateway.cadastrados.length, 1);
  });

  it('valida os campos antes de chamar o servidor', async () => {
    const gateway = new GatewayProdutoFalso();
    const cadastrar = new CadastrarProduto(gateway);
    assert.equal(await motivoDe(() => cadastrar.executar({ ...DADOS_VALIDOS, nome: ' ' })), 'nome:OBRIGATORIO');
    assert.equal(await motivoDe(() => cadastrar.executar({ ...DADOS_VALIDOS, precoCentavos: Number.NaN })), 'precoCentavos:INTEIRO_POSITIVO_OBRIGATORIO');
    assert.equal(await motivoDe(() => cadastrar.executar({ ...DADOS_VALIDOS, estoque: -1 })), 'estoque:INTEIRO_NAO_NEGATIVO_OBRIGATORIO');
    assert.equal(gateway.cadastrados.length, 0);
  });

  it('altera preço e estoque pelo gateway', async () => {
    const gateway = new GatewayProdutoFalso();
    const produto = await new AlterarProduto(gateway).executar('p1', { precoCentavos: 3490, estoque: 8 });
    assert.equal(produto.precoCentavos, 3490);
    assert.deepEqual(gateway.alteracoes, [{ produtoId: 'p1', alteracao: { precoCentavos: 3490, estoque: 8 } }]);
  });

  it('recusa preço e estoque inválidos sem chamar o servidor', async () => {
    const gateway = new GatewayProdutoFalso();
    const alterar = new AlterarProduto(gateway);
    assert.equal(await motivoDe(() => alterar.executar('p1', { precoCentavos: 0 })), 'precoCentavos:INTEIRO_POSITIVO_OBRIGATORIO');
    assert.equal(await motivoDe(() => alterar.executar('p1', { estoque: 1.5 })), 'estoque:INTEIRO_NAO_NEGATIVO_OBRIGATORIO');
    assert.equal(gateway.alteracoes.length, 0);
  });
});
