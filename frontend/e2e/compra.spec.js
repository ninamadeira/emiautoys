import { expect, test } from '@playwright/test';
import {
  adicionarPrimeiroProdutoAoCarrinho,
  preencherEnderecoEntrega,
  cadastrarPelaInterface,
  emailUnico,
} from './support.js';

test.describe('P1 — comprar pela interface', () => {
  test('cadastro, carrinho, cupom, frete, pagamento e pedido', async ({ page }) => {
    await cadastrarPelaInterface(page, { email: emailUnico('compra') });

    await expect(page.getByRole('heading', { name: 'Brinquedos para gatos' })).toBeVisible();
    await adicionarPrimeiroProdutoAoCarrinho(page);
    await expect(page.getByRole('link', { name: 'Carrinho, 1 item' })).toBeVisible();

    await page.getByRole('link', { name: /^Carrinho/ }).click();
    await expect(page.getByRole('heading', { name: 'Seu carrinho' })).toBeVisible();
    await expect(page.getByText(/Subtotal:/)).toBeVisible();

    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await preencherEnderecoEntrega(page);
    await page.getByLabel('Cupom de desconto (opcional)').fill('miau10');
    await page.getByRole('button', { name: 'Calcular frete e total' }).click();
    await expect(page.getByText('Desconto', { exact: true })).toBeVisible();
    await expect(page.getByText('Frete', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Pagar pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Carrinho, 0 itens/ })).toBeVisible();

    await page.getByRole('link', { name: 'Ver meus pedidos' }).click();
    await expect(page.getByText(/Pedido de \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
    await expect(page.getByText(/Pix/)).toBeVisible();
  });

  test('altera a quantidade e remove o item no carrinho', async ({ page }) => {
    await cadastrarPelaInterface(page, { email: emailUnico('carrinho') });
    await adicionarPrimeiroProdutoAoCarrinho(page);

    await page.goto('/carrinho');
    const quantidade = page.getByLabel(/^Quantidade de /);
    await quantidade.fill('3');
    await quantidade.dispatchEvent('change');
    await expect(page.getByRole('link', { name: 'Carrinho, 3 itens' })).toBeVisible();

    await page.getByRole('button', { name: /^Remover/ }).click();
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  });

  test('mostra erro em português quando falta o endereço', async ({ page }) => {
    await cadastrarPelaInterface(page, { email: emailUnico('endereco') });
    await adicionarPrimeiroProdutoAoCarrinho(page);
    await page.goto('/finalizar-compra');
    await page.getByRole('button', { name: 'Pagar pedido' }).click();
    await expect(page.getByRole('alert')).toContainText('Preencha o campo');
  });
});
