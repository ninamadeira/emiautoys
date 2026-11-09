import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { ErroDaAplicacao } from '../../../application/domain/erro-da-aplicacao';
import type { Carrinho, Pedido, Cotacao } from '../../../application/domain/modelos';
import { RealizarPedido } from '../../../application/use-cases/realizar-pedido';
import { CotarPedido } from '../../../application/use-cases/cotar-pedido';
import { EstadoCarrinho } from '../estado/carrinho.estado';
import { PaginaFinalizacao } from './pagina-finalizacao';

const CARRINHO: Carrinho = {
  linhas: [{ produtoId: 'p1', nome: 'Varinha de penas', precoUnitarioCentavos: 2990, quantidade: 2, totalLinhaCentavos: 5980 }],
  subtotalCentavos: 5980,
  totalUnidades: 2,
};
const CARRINHO_VAZIO: Carrinho = { linhas: [], subtotalCentavos: 0, totalUnidades: 0 };

const COTACAO: Cotacao = {
  linhas: CARRINHO.linhas,
  subtotalCentavos: 5980,
  descontoCentavos: 598,
  freteCentavos: 1290,
  totalCentavos: 6672,
  codigoCupom: 'MIAU10',
};
const PEDIDO = { id: 'order-1', totalCentavos: 6672 } as Pedido;

function textoVisivel(element: HTMLElement): string {
  return (element.textContent ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function configure(carrinho: Carrinho) {
  const estadoCarrinho = { carrinho: signal(carrinho), limparLocal: vi.fn() };
  const cotarPedido = { executar: vi.fn().mockResolvedValue(COTACAO) };
  const realizarPedido = { executar: vi.fn().mockResolvedValue(PEDIDO) };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: EstadoCarrinho, useValue: estadoCarrinho },
      { provide: CotarPedido, useValue: cotarPedido },
      { provide: RealizarPedido, useValue: realizarPedido },
    ],
  });
  return { estadoCarrinho, cotarPedido, realizarPedido };
}

async function estabilizar(fixture: ComponentFixture<PaginaFinalizacao>): Promise<void> {
  await fixture.whenStable();
  fixture.detectChanges();
}

async function render(): Promise<{ fixture: ComponentFixture<PaginaFinalizacao>; root: HTMLElement }> {
  const fixture = TestBed.createComponent(PaginaFinalizacao);
  fixture.detectChanges();
  await estabilizar(fixture);
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

function exigir<T>(valor: T | null | undefined, descricao: string): T {
  if (valor === null || valor === undefined) {
    throw new Error(`${descricao} não encontrado`);
  }
  return valor;
}

function digitarEm(root: HTMLElement, selector: string, value: string): void {
  const input = exigir(root.querySelector<HTMLInputElement>(selector), `campo ${selector}`);
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function preencherEndereco(root: HTMLElement): void {
  digitarEm(root, '#endereco-nomeDestinatario', 'Maria Silva');
  digitarEm(root, '#endereco-cep', '90010-000');
  digitarEm(root, '#endereco-rua', 'Rua dos Andradas');
  digitarEm(root, '#endereco-numero', '100');
  digitarEm(root, '#endereco-cidade', 'Porto Alegre');
  digitarEm(root, '#endereco-estado', 'RS');
}

function clicarBotao(root: HTMLElement, label: string): void {
  const button = [...root.querySelectorAll('button')].find((candidato) => textoVisivel(candidato) === label);
  exigir(button, `botão "${label}"`).click();
}

function enviarFormulario(root: HTMLElement): void {
  exigir(root.querySelector('form'), 'formulário').dispatchEvent(new Event('submit', { cancelable: true }));
}

function selecionarMeioPagamento(root: HTMLElement, method: string): void {
  const radio = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find((item) => item.value === method);
  exigir(radio, `meio de pagamento ${method}`).dispatchEvent(new Event('change'));
}

describe('PaginaFinalizacao', () => {
  it('pede para voltar à loja quando o carrinho está vazio', async () => {
    configure(CARRINHO_VAZIO);
    const { root } = await render();
    expect(textoVisivel(root)).toContain('Seu carrinho está vazio');
    expect(root.querySelector('form')).toBeNull();
  });

  it('cota o frete com o CEP e o cupom digitados e mostra o total', async () => {
    const { cotarPedido } = configure(CARRINHO);
    const { fixture, root } = await render();
    digitarEm(root, '#endereco-cep', '90010-000');
    digitarEm(root, '#cupom', 'MIAU10');
    clicarBotao(root, 'Calcular frete e total');
    await estabilizar(fixture);
    expect(cotarPedido.executar).toHaveBeenCalledWith({ cep: '90010-000', codigoCupom: 'MIAU10' });
    const summary = textoVisivel(root.querySelector('dl') as HTMLElement);
    expect(summary).toContain('R$ 66,72');
    expect(summary).toContain('− R$ 5,98');
  });

  it('mostra o frete grátis como "Grátis"', async () => {
    const { cotarPedido } = configure(CARRINHO);
    cotarPedido.executar.mockResolvedValue({ ...COTACAO, freteCentavos: 0, totalCentavos: 5382 });
    const { fixture, root } = await render();
    digitarEm(root, '#endereco-cep', '90010-000');
    clicarBotao(root, 'Calcular frete e total');
    await estabilizar(fixture);
    expect(textoVisivel(root.querySelector('dl') as HTMLElement)).toContain('Grátis');
  });

  it('descarta a cotação exibida quando o endereço muda', async () => {
    configure(CARRINHO);
    const { fixture, root } = await render();
    digitarEm(root, '#endereco-cep', '90010-000');
    clicarBotao(root, 'Calcular frete e total');
    await estabilizar(fixture);
    expect(root.querySelector('dl')).not.toBeNull();
    digitarEm(root, '#endereco-rua', 'Outra rua');
    await estabilizar(fixture);
    expect(root.querySelector('dl')).toBeNull();
  });

  it('realiza o pedido pagando com Pix por padrão e o confirma', async () => {
    const { realizarPedido, estadoCarrinho } = configure(CARRINHO);
    const { fixture, root } = await render();
    preencherEndereco(root);
    enviarFormulario(root);
    await estabilizar(fixture);
    expect(realizarPedido.executar).toHaveBeenCalledWith(
      expect.objectContaining({
        meioPagamento: 'PIX',
        enderecoEntrega: expect.objectContaining({ nomeDestinatario: 'Maria Silva', cep: '90010-000', estado: 'RS' }),
      }),
    );
    expect(textoVisivel(root)).toContain('Pedido confirmado!');
    expect(textoVisivel(root)).toContain('R$ 66,72');
    expect(estadoCarrinho.limparLocal).toHaveBeenCalled();
  });

  it('envia CARD quando a opção de cartão é selecionada', async () => {
    const { realizarPedido } = configure(CARRINHO);
    const { fixture, root } = await render();
    preencherEndereco(root);
    selecionarMeioPagamento(root, 'CARTAO');
    enviarFormulario(root);
    await estabilizar(fixture);
    expect(realizarPedido.executar).toHaveBeenCalledWith(expect.objectContaining({ meioPagamento: 'CARTAO' }));
  });

  it('mostra o erro de validação traduzido e mantém o carrinho', async () => {
    const { realizarPedido, estadoCarrinho } = configure(CARRINHO);
    realizarPedido.executar.mockRejectedValue(new ErroDaAplicacao('VALIDACAO_FALHOU', { campo: 'rua', motivo: 'OBRIGATORIO' }));
    const { fixture, root } = await render();
    enviarFormulario(root);
    await estabilizar(fixture);
    expect(textoVisivel(root.querySelector('[role="alert"]') as HTMLElement)).toBe('Preencha o campo "Rua".');
    expect(estadoCarrinho.limparLocal).not.toHaveBeenCalled();
    expect(textoVisivel(root)).not.toContain('Pedido confirmado!');
  });

  it('mostra a mensagem de pagamento recusado', async () => {
    const { realizarPedido } = configure(CARRINHO);
    realizarPedido.executar.mockRejectedValue(new ErroDaAplicacao('PAGAMENTO_RECUSADO'));
    const { fixture, root } = await render();
    preencherEndereco(root);
    enviarFormulario(root);
    await estabilizar(fixture);
    expect(textoVisivel(root.querySelector('[role="alert"]') as HTMLElement)).toBe(
      'Pagamento recusado. Tente outro meio de pagamento.',
    );
  });

  it('informa que nenhum dado de cartão é coletado', async () => {
    configure(CARRINHO);
    const { root } = await render();
    expect(textoVisivel(root)).toContain('nenhum dado de cartão é coletado');
  });
});
