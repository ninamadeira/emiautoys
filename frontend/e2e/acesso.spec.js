import { expect, test } from '@playwright/test';
import { SENHA, cadastrarPelaInterface, emailUnico } from './support.js';

test.describe('Acesso, privacidade e acessibilidade básica', () => {
  test('visitante é levado ao login e volta ao carrinho depois de entrar', async ({ page }) => {
    const email = emailUnico('retorno');
    await cadastrarPelaInterface(page, { email });
    await page.getByRole('button', { name: 'Sair' }).click();

    await page.goto('/carrinho');
    await expect(page).toHaveURL(/\/entrar\?retorno=%2Fcarrinho/);

    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(SENHA);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/carrinho$/);
  });

  test('adicionar ao carrinho sem login leva à tela de entrada', async ({ page }) => {
    await page.goto('/loja');
    await page.getByRole('button', { name: /Adicionar ao carrinho/ }).first().click();
    await expect(page).toHaveURL(/\/entrar\?retorno=/);
  });

  test('credenciais erradas mostram mensagem em português', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill('ninguem@example.com');
    await page.getByLabel('Senha').fill('qualquer123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
  });

  test('senha fraca é recusada no cadastro', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByLabel('Nome', { exact: true }).fill('Maria');
    await page.getByLabel('E-mail').fill(emailUnico('fraca'));
    await page.getByLabel('Senha', { exact: true }).fill('fraca');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByRole('alert')).toContainText('ao menos 8 caracteres');
  });

  test('exclusão de conta (LGPD) encerra a sessão e impede novo login', async ({ page }) => {
    const email = emailUnico('exclusao');
    await cadastrarPelaInterface(page, { email });
    await page.getByRole('link', { name: 'Minha conta' }).click();
    await page.getByRole('button', { name: 'Excluir minha conta' }).click();
    await page.getByRole('button', { name: 'Sim, excluir minha conta' }).click();
    await expect(page).toHaveURL(/\/loja$/);
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();

    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(SENHA);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
  });

  test('catálogo: imagens têm texto alternativo e carregamento lazy; filtro por categoria funciona', async ({ page }) => {
    await page.goto('/loja');
    const images = page.locator('app-cartao-produto img');
    await expect(images.first()).toBeVisible();
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('alt', /brinquedo para gatos/);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('width', '600');
    }
    await page.getByRole('button', { name: 'Bolinhas', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Bolinhas', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('2 produto(s) encontrado(s).')).toBeVisible();
  });

  test('todo produto exibe faixa etária e aviso de segurança (Art. IX)', async ({ page }) => {
    await page.goto('/loja');
    const cards = page.locator('app-cartao-produto');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    for (let indice = 0; indice < total; indice += 1) {
      await expect(cards.nth(indice).getByRole('note')).toContainText('Segurança:');
      await expect(cards.nth(indice).locator('.selo')).toContainText(/Todas as idades|Gatos adultos|Filhotes|Gatos idosos/);
    }
  });

  test('funciona em 320 px sem rolagem horizontal e oferece link para pular ao conteúdo', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/loja');
    await expect(page.getByRole('heading', { name: 'Brinquedos para gatos' })).toBeVisible();
    const transborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(transborda).toBe(false);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  });
});
