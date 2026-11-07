import { expect } from '@playwright/test';

export const SENHA = 'miau1234';

export function emailUnico(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

export async function cadastrarPelaInterface(page, { name = 'Maria Silva', email }) {
  await page.goto('/cadastro');
  await page.getByLabel('Nome', { exact: true }).fill(name);
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(SENHA);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/loja$/);
}

export async function adicionarPrimeiroProdutoAoCarrinho(page) {
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).first().click();
  await expect(page.getByText(/foi adicionado ao carrinho/).first()).toBeVisible();
}

export async function preencherEnderecoEntrega(page) {
  await page.getByLabel('Nome do destinatário').fill('Maria Silva');
  await page.getByLabel('CEP', { exact: true }).fill('90010-000');
  await page.getByLabel('Rua', { exact: true }).fill('Rua dos Andradas');
  await page.getByLabel('Número', { exact: true }).fill('100');
  await page.getByLabel('Cidade', { exact: true }).fill('Porto Alegre');
  await page.getByLabel('UF', { exact: true }).fill('RS');
}
