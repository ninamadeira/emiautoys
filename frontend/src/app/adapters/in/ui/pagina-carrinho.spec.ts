import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { ErroDaAplicacao } from '../../../application/domain/erro-da-aplicacao';
import type { Carrinho } from '../../../application/domain/modelos';
import { AdicionarAoCarrinho } from '../../../application/use-cases/adicionar-ao-carrinho';
import { AlterarQuantidadeItemCarrinho } from '../../../application/use-cases/alterar-quantidade-item-carrinho';
import { CarregarCarrinho } from '../../../application/use-cases/carregar-carrinho';
import { RemoverDoCarrinho } from '../../../application/use-cases/remover-do-carrinho';
import { EstadoSessao } from '../estado/sessao.estado';
import { PaginaCarrinho } from './pagina-carrinho';

const LINHA_VARINHA = {
  produtoId: 'p1',
  nome: 'Varinha de penas',
  precoUnitarioCentavos: 2990,
  quantidade: 2,
  totalLinhaCentavos: 5980,
};
const CARRINHO_COM_VARINHA: Carrinho = { linhas: [LINHA_VARINHA], subtotalCentavos: 5980, totalUnidades: 2 };
const CARRINHO_VAZIO: Carrinho = { linhas: [], subtotalCentavos: 0, totalUnidades: 0 };

function textoVisivel(element: HTMLElement): string {
  return (element.textContent ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function configure(carrinhoInicial: Carrinho) {
  const casosDeUso = {
    carregarCarrinho: { executar: vi.fn().mockResolvedValue(carrinhoInicial) },
    alterarQuantidade: { executar: vi.fn().mockResolvedValue(carrinhoInicial) },
    removerDoCarrinho: { executar: vi.fn().mockResolvedValue(CARRINHO_VAZIO) },
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: EstadoSessao, useValue: { estaAutenticado: signal(true) } },
      { provide: CarregarCarrinho, useValue: casosDeUso.carregarCarrinho },
      { provide: AdicionarAoCarrinho, useValue: { executar: vi.fn() } },
      { provide: AlterarQuantidadeItemCarrinho, useValue: casosDeUso.alterarQuantidade },
      { provide: RemoverDoCarrinho, useValue: casosDeUso.removerDoCarrinho },
    ],
  });
  return casosDeUso;
}

async function estabilizar(fixture: ComponentFixture<PaginaCarrinho>): Promise<void> {
  await fixture.whenStable();
  fixture.detectChanges();
}

async function render(): Promise<{ fixture: ComponentFixture<PaginaCarrinho>; root: HTMLElement }> {
  const fixture = TestBed.createComponent(PaginaCarrinho);
  fixture.detectChanges();
  await estabilizar(fixture);
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

function alterarCampoQuantidade(root: HTMLElement, produtoId: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(`#qtd-${produtoId}`);
  expect(input).not.toBeNull();
  input!.value = value;
  input!.dispatchEvent(new Event('change'));
}

describe('PaginaCarrinho', () => {
  it('mostra o estado vazio quando não há itens', async () => {
    configure(CARRINHO_VAZIO);
    const { root } = await render();
    expect(textoVisivel(root)).toContain('Seu carrinho está vazio');
    expect(root.querySelector('a[href="/loja"]')).not.toBeNull();
  });

  it('lista cada linha com preços em BRL e o subtotal', async () => {
    configure(CARRINHO_COM_VARINHA);
    const { root } = await render();
    const texto = textoVisivel(root);
    expect(texto).toContain('Varinha de penas');
    expect(texto).toContain('R$ 29,90 cada');
    expect(texto).toContain('Subtotal: R$ 59,80');
  });

  it('leva à finalização quando há itens', async () => {
    configure(CARRINHO_COM_VARINHA);
    const { root } = await render();
    expect(root.querySelector('a[href="/finalizar-compra"]')).not.toBeNull();
  });

  it('rotula cada campo de quantidade com o nome do produto', async () => {
    configure(CARRINHO_COM_VARINHA);
    const { root } = await render();
    const label = root.querySelector('label[for="qtd-p1"]');
    expect(textoVisivel(label as HTMLElement)).toBe('Quantidade de Varinha de penas');
  });

  it('envia a nova quantidade quando o campo muda', async () => {
    const casosDeUso = configure(CARRINHO_COM_VARINHA);
    const { fixture, root } = await render();
    alterarCampoQuantidade(root, 'p1', '3');
    await estabilizar(fixture);
    expect(casosDeUso.alterarQuantidade.executar).toHaveBeenCalledWith('p1', 3);
  });

  it('remove uma linha e volta ao estado vazio', async () => {
    const casosDeUso = configure(CARRINHO_COM_VARINHA);
    const { fixture, root } = await render();
    const botaoRemover = [...root.querySelectorAll('button')].find((button) => textoVisivel(button).startsWith('Remover'));
    botaoRemover!.click();
    await estabilizar(fixture);
    expect(casosDeUso.removerDoCarrinho.executar).toHaveBeenCalledWith('p1');
    expect(textoVisivel(root)).toContain('Seu carrinho está vazio');
  });

  it('mostra um alerta em português quando o servidor recusa a nova quantidade', async () => {
    const casosDeUso = configure(CARRINHO_COM_VARINHA);
    casosDeUso.alterarQuantidade.executar.mockRejectedValue(new ErroDaAplicacao('ESTOQUE_INSUFICIENTE', { disponivel: 2 }));
    const { fixture, root } = await render();
    alterarCampoQuantidade(root, 'p1', '9');
    await estabilizar(fixture);
    expect(textoVisivel(root.querySelector('[role="alert"]') as HTMLElement)).toBe(
      'Estoque insuficiente. Unidades disponíveis: 2.',
    );
  });
});
