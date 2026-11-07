import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ErroCarrinhoVazio,
  ErroCupomInvalido,
  ErroEstoqueInsuficiente,
  ErroPagamentoRecusado,
  ErroValidacao,
} from '../../../src/application/domain/erros.js';
import { montarAmbiente, dadoCupom, dadoProduto } from '../../suporte/ambiente.js';
import { montarPropsEnderecoEntrega } from '../../suporte/montadores.js';

const USUARIO_ID = 'user-1';
const CEP_SUL = '90010-000';

async function ambienteComCarrinho({ estoque = 10, precoCentavos = 5000, quantidade = 2 } = {}) {
  const ambiente = montarAmbiente();
  await dadoProduto(ambiente, { id: 'a', estoque, precoCentavos });
  await ambiente.adicionarItemAoCarrinho.executar({ usuarioId: USUARIO_ID, produtoId: 'a', quantidade });
  return ambiente;
}

function comandoFinalizacao(sobrescritas = {}) {
  return {
    usuarioId: USUARIO_ID,
    enderecoEntrega: montarPropsEnderecoEntrega(),
    meioPagamento: 'PIX',
    ...sobrescritas,
  };
}

describe('cotar pedido', () => {
  it('soma subtotal, desconto e frete', async () => {
    const ambiente = await ambienteComCarrinho({ precoCentavos: 5000, quantidade: 2 });
    await dadoCupom(ambiente, { codigo: 'MIAU10', percentualDesconto: 10 });
    const cotacao = await ambiente.cotarPedido.executar({ usuarioId: USUARIO_ID, cep: CEP_SUL, codigoCupom: 'miau10' });
    assert.equal(cotacao.subtotalCentavos, 10000);
    assert.equal(cotacao.descontoCentavos, 1000);
    assert.equal(cotacao.totalCentavos, 10000 - 1000 + cotacao.freteCentavos);
  });

  it('rejeita carrinho vazio', async () => {
    const ambiente = montarAmbiente();
    const consulta = { usuarioId: USUARIO_ID, cep: CEP_SUL };
    await assert.rejects(ambiente.cotarPedido.executar(consulta), ErroCarrinhoVazio);
  });

  it('rejeita cupom desconhecido', async () => {
    const ambiente = await ambienteComCarrinho();
    const consulta = { usuarioId: USUARIO_ID, cep: CEP_SUL, codigoCupom: 'INEXISTENTE' };
    await assert.rejects(ambiente.cotarPedido.executar(consulta), ErroCupomInvalido);
  });

  it('concede frete grátis quando o subtotal com desconto atinge o limite', async () => {
    const ambiente = await ambienteComCarrinho({ precoCentavos: 8000, quantidade: 2 });
    const cotacao = await ambiente.cotarPedido.executar({ usuarioId: USUARIO_ID, cep: CEP_SUL });
    assert.equal(cotacao.freteCentavos, 0);
  });
});

describe('finalizar pedido', () => {
  it('cria um pedido pago, baixa o estoque e esvazia o carrinho', async () => {
    const ambiente = await ambienteComCarrinho({ estoque: 5, quantidade: 2 });
    const pedido = await ambiente.finalizarPedido.executar(comandoFinalizacao());
    assert.equal(pedido.status, 'PAGO');
    assert.equal((await ambiente.repositorioProduto.buscarPorId('a')).estoque, 3);
    assert.equal((await ambiente.repositorioCarrinho.buscarPorUsuarioId(USUARIO_ID)).itens.length, 0);
    assert.equal((await ambiente.obterPedidos.executar({ usuarioId: USUARIO_ID })).length, 1);
  });

  it('cobra o total cotado pelo gateway de pagamento', async () => {
    const ambiente = await ambienteComCarrinho({ precoCentavos: 1000, quantidade: 1 });
    const pedido = await ambiente.finalizarPedido.executar(comandoFinalizacao());
    assert.equal(ambiente.gatewayPagamento.cobrancas[0].valorCentavos, pedido.totalCentavos);
  });

  it('libera o estoque reservado e mantém o carrinho quando o pagamento é recusado', async () => {
    const ambiente = await ambienteComCarrinho({ estoque: 5, quantidade: 2 });
    ambiente.gatewayPagamento.aprovado = false;
    await assert.rejects(ambiente.finalizarPedido.executar(comandoFinalizacao()), ErroPagamentoRecusado);
    assert.equal((await ambiente.repositorioProduto.buscarPorId('a')).estoque, 5);
    assert.equal((await ambiente.repositorioCarrinho.buscarPorUsuarioId(USUARIO_ID)).itens.length, 1);
    assert.equal((await ambiente.obterPedidos.executar({ usuarioId: USUARIO_ID })).length, 0);
  });

  it('falha quando o estoque acabou depois de o item entrar no carrinho', async () => {
    const ambiente = await ambienteComCarrinho({ estoque: 5, quantidade: 3 });
    const produto = await ambiente.repositorioProduto.buscarPorId('a');
    await ambiente.repositorioProduto.salvar({ ...produto, estoque: 1 });
    await assert.rejects(ambiente.finalizarPedido.executar(comandoFinalizacao()), ErroEstoqueInsuficiente);
    assert.equal(ambiente.gatewayPagamento.cobrancas.length, 0);
  });

  it('rejeita endereço ou meio de pagamento inválido antes de cobrar', async () => {
    const ambiente = await ambienteComCarrinho();
    const enderecoInvalido = comandoFinalizacao({ enderecoEntrega: montarPropsEnderecoEntrega({ cep: '1' }) });
    const meioInvalido = comandoFinalizacao({ meioPagamento: 'ESCAMBO' });
    await assert.rejects(ambiente.finalizarPedido.executar(enderecoInvalido), ErroValidacao);
    await assert.rejects(ambiente.finalizarPedido.executar(meioInvalido), ErroValidacao);
    assert.equal(ambiente.gatewayPagamento.cobrancas.length, 0);
  });
});
