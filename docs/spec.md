# eMiauToys — Especificação

Loja online para pequenos comércios que vende brinquedos para gatos (varinhas, bolinhas, arranhadores, túneis, catnip e brinquedos interativos).

## Jornadas prioritárias (P1)

| Jornada | Passos | Verificação automática |
|---------|--------|------------------------|
| **P1 — Comprar** | Ver catálogo → cadastrar-se → entrar → adicionar ao carrinho → calcular frete/cupom → pagar → ver pedido | `backend/testes/e2e/jornada-de-compra.e2e.test.js` |
| **P1 — Pagamento recusado** | Cartão recusado mantém carrinho e estoque | mesmo arquivo |
| **P1 — Privacidade** | Excluir a conta (LGPD) | mesmo arquivo |

## Regras de negócio

- **Produto:** exibe faixa etária indicada e aviso de segurança (Art. IX). Produtos com risco conhecido (`FIO_SOLTO_LONGO`, `PENAS_TINGIDAS_TOXICAS`) não podem ser criados.
- **Carrinho:** máximo de 10 unidades por item; não ultrapassa o estoque disponível.
- **Cupom:** percentual de 1% a 50%; pode estar inativo ou expirado. Códigos são normalizados em maiúsculas.
- **Frete:** tarifa por região do CEP (primeiro dígito); **grátis** quando o subtotal já com desconto atinge R$ 150,00.
- **Pedido:** `total = subtotal − desconto + frete`. Estoque é reservado de forma atômica antes do pagamento e devolvido se o pagamento for recusado.
- **Pagamento:** Pix, boleto ou cartão, sempre **simulado**. Nenhum dado de cartão é coletado; o cartão usa um token simulado (`tok_recusado` força recusa).
- **Conta:** senha com 8+ caracteres, com letras e números; armazenada somente como hash.

## API (rotas em português — ADR 0006)

| Método | Rota | Autenticação |
|--------|------|:---:|
| GET | `/api/saude` | — |
| GET | `/api/produtos?categoria=` · `/api/produtos/:produtoId` | — |
| POST | `/api/autenticacao/cadastrar` · `/api/autenticacao/entrar` | — |
| GET | `/api/carrinho` | ✔ |
| POST | `/api/carrinho/itens` | ✔ |
| PUT / DELETE | `/api/carrinho/itens/:produtoId` | ✔ |
| POST | `/api/finalizacao/cotacao` · `/api/finalizacao` | ✔ |
| GET | `/api/pedidos` | ✔ |
| DELETE | `/api/conta` | ✔ |

Erros: `{ "erro": { "codigo": "ESTOQUE_INSUFICIENTE", "mensagem": "<pt-BR>", "detalhes": {} } }`. Os códigos são em português (caixa alta); a mensagem em português vem do catálogo `mensagens.pt-BR.js`.

## URLs públicas do site (exceção documentada do Art. XIII)

`/loja`, `/loja/:produtoId`, `/carrinho`, `/entrar`, `/cadastro`, `/finalizar-compra`, `/conta`.

## Glossário (linguagem ubíqua)

| Português | Inglês (código) |
|-----------|-----------------|
| Produto | `Produto` |
| Categoria | `categoria` (`CategoriaProduto`) |
| Varinha · Bolinha · Arranhador · Túnel · Catnip · Brinquedo interativo | `VARINHA` · `BOLINHA` · `ARRANHADOR` · `TUNEL` · `CATNIP` · `INTERATIVO` |
| Faixa etária indicada | `faixaEtariaIndicada` (`FILHOTE`, `ADULTO`, `IDOSO`, `TODAS_AS_IDADES`) |
| Aviso de segurança | `avisoSeguranca` |
| Estoque | `estoque` |
| Carrinho · Item do carrinho | `Carrinho` · `ItemCarrinho` |
| Cupom | `Coupon` |
| Frete | `frete` (`calcularCustoFrete`) |
| Cotação (frete + desconto + total) | `Cotacao` |
| Endereço de entrega | `EnderecoEntrega` |
| Pedido | `Pedido` |
| Meio de pagamento | `MeioPagamento` (`PIX`, `BOLETO`, `CARTAO`) |
| Usuário · Conta | `Usuario` · `conta` |
| Sessão | `Sessao` |
| Centavos | `...Cents` (valores monetários são inteiros em centavos) |
