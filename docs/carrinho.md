# Carrinho — funções e serviços

Referência do módulo de carrinho, do domínio até a tela. Todos os caminhos são relativos a `backend/` ou `frontend/`.

## Visão geral

```
Tela (PaginaCarrinho, BotaoAdicionarAoCarrinho)
   └─ EstadoCarrinho (Signals) ─ casos de uso do front ─ GatewayCarrinho ─ GatewayCarrinhoHttp
                                                                      │  HTTP /api/carrinho*
Rotas HTTP (cart-routes.js)  ◄────────────────────────────────────────┘
   └─ casos de uso (ObterCarrinho, AdicionarItemAoCarrinho, AtualizarItemDoCarrinho, RemoverItemDoCarrinho)
         ├─ domínio puro (carrinho.js, produto.js)
         └─ porta RepositorioCarrinho ─ RepositorioCarrinhoSqlite | RepositorioCarrinhoEmMemoria
```

O carrinho pertence a **uma pessoa autenticada** e fica salvo no servidor. Não existe carrinho de visitante: quem não está logada e clica em "Adicionar ao carrinho" é levada para `/entrar` e volta à página de origem depois do login.

## Regras de negócio

| Regra | Onde é aplicada |
|-------|-----------------|
| Quantidade é um inteiro maior que zero | `adicionarItem`, `definirQuantidadeItem` (domínio) e casos de uso do front (validação antecipada) |
| Máximo de **10 unidades por item** (`QUANTIDADE_MAXIMA_POR_ITEM`) | `substituirQuantidade` no domínio; acumula ao somar |
| Não pode ultrapassar o estoque | `AdicionarItemAoCarrinho`, `AtualizarItemDoCarrinho` (via `garantirEstoqueDisponivel`) e de novo em `CotarPedido` |
| Adicionar um produto já presente **soma** a quantidade | `adicionarItem` |
| A ordem dos itens é preservada | `substituirQuantidade` e `RepositorioCarrinhoSqlite` (coluna `posicao`) |
| Remover um item que não está no carrinho **não é erro** | `removerItem` (idempotente) |
| O preço **não é gravado** no carrinho: é lido do produto a cada consulta | `precificarCarrinho` |
| Após pagamento aprovado o carrinho é esvaziado; se o pagamento falha, é mantido | `FinalizarPedido` |

## Back-end

### Domínio — `src/application/domain/carrinho.js`

Funções puras e imutáveis (o carrinho devolvido é sempre um novo objeto congelado). Um carrinho tem a forma `{ usuarioId, itens: [{ produtoId, quantidade }] }`.

| Função | Descrição | Erros |
|--------|-----------|-------|
| `criarCarrinhoVazio(usuarioId)` | Carrinho vazio. | — |
| `criarCarrinho({ usuarioId, itens })` | Reconstrói um carrinho (usado pelos repositórios). | — |
| `adicionarItem(carrinho, { produtoId, quantidade })` | Soma `quantidade` à quantidade atual do produto, ou adiciona o item no fim. | `ErroValidacao` (`quantidade`: `INTEIRO_POSITIVO_OBRIGATORIO` ou `ACIMA_DO_MAXIMO`) |
| `definirQuantidadeItem(carrinho, { produtoId, quantidade })` | Define a quantidade (substitui). Se o item não existir, é adicionado. | mesmos de `adicionarItem` |
| `removerItem(carrinho, produtoId)` | Remove o item. Sem efeito se ausente. | — |
| `contarUnidades(carrinho)` | Total de unidades (soma das quantidades). | — |
| `precificarCarrinho(carrinho, produtos)` | Devolve `{ linhas, subtotalCentavos }`; cada linha tem `produtoId`, `nome`, `precoUnitarioCentavos`, `quantidade`, `totalLinhaCentavos`. | `ErroProdutoNaoEncontrado` se algum item referencia um produto que não está em `produtos` |

Constante: `QUANTIDADE_MAXIMA_POR_ITEM = 10`.

Apoio em `produto.js`: `garantirEstoqueDisponivel(produto, quantidade)` lança `ErroEstoqueInsuficiente` com `{ produtoId, solicitada, disponivel }`.

### Porta de saída — `ports/out/repositorio-carrinho.js`

| Método | Contrato |
|--------|----------|
| `buscarPorUsuarioId(usuarioId)` | **Sempre** devolve um carrinho; vazio se a pessoa ainda não tem um. |
| `salvar(carrinho)` | Substitui todos os itens do carrinho, mantendo a ordem. |
| `limpar(usuarioId)` | Remove todos os itens. Não afeta outras pessoas. |

Implementações: `RepositorioCarrinhoEmMemoria` (testes) e `RepositorioCarrinhoSqlite` (tabela `itens_carrinho`, `salvar` dentro de transação). Ambas passam pelos mesmos testes de contrato (`testes/contrato`).

### Casos de uso — `src/application/use-cases/`

Todos recebem as dependências por objeto no construtor e expõem `executar(comando)`. Os três que alteram o carrinho devolvem a **visão completa já precificada** chamando `ObterCarrinho`.

| Caso de uso | Entrada | O que faz | Erros |
|-------------|---------|-----------|-------|
| `ObterCarrinho` | `{ usuarioId }` | Carrega o carrinho e os produtos e devolve `{ linhas, subtotalCentavos, totalUnidades }`. | `PRODUTO_NAO_ENCONTRADO` (ver limitações) |
| `AdicionarItemAoCarrinho` | `{ usuarioId, produtoId, quantidade }` | Confere que o produto existe, soma a quantidade, valida o limite e o **total acumulado** contra o estoque, salva. | `PRODUTO_NAO_ENCONTRADO`, `VALIDACAO_FALHOU`, `ESTOQUE_INSUFICIENTE` |
| `AtualizarItemDoCarrinho` | `{ usuarioId, produtoId, quantidade }` | Define a nova quantidade, valida estoque, salva. | os mesmos |
| `RemoverItemDoCarrinho` | `{ usuarioId, produtoId }` | Remove o item e salva. | — |

Ordem das validações em `AdicionarItemAoCarrinho`: produto existe → quantidade válida e dentro do limite (400) → estoque (409). Por isso pedir 11 unidades de um produto com estoque 10 responde `VALIDACAO_FALHOU`, não `ESTOQUE_INSUFICIENTE`.

**Consumidores do carrinho no checkout.** `CotarPedido` relê o carrinho, rejeita carrinho vazio (`CARRINHO_VAZIO`) e confere o estoque de novo (ele pode ter mudado desde que o item foi adicionado). `FinalizarPedido` reserva o estoque, cobra e só então esvazia o carrinho (`RepositorioCarrinho.limpar`). Ver ADR 0004.

### API HTTP — `src/adapters/in/http/rotas/rotas-carrinho.js`

Todas exigem `Authorization: Bearer <token>`; sem ele a resposta é `401 NAO_AUTORIZADO`. Todas respondem `200` com a visão do carrinho.

| Método e rota | Corpo | Observações |
|---------------|-------|-------------|
| `GET /api/carrinho` | — | Carrinho atual. |
| `POST /api/carrinho/itens` | `{ "produtoId": "varinha-pena", "quantidade": 2 }` | Soma à quantidade existente. |
| `PUT /api/carrinho/itens/:produtoId` | `{ "quantidade": 3 }` | Substitui a quantidade. |
| `DELETE /api/carrinho/itens/:produtoId` | — | Remove o item. |

Resposta:

```json
{
  "linhas": [
    { "produtoId": "varinha-pena", "nome": "Varinha de penas naturais",
      "precoUnitarioCentavos": 2990, "quantidade": 2, "totalLinhaCentavos": 5980 }
  ],
  "subtotalCentavos": 5980,
  "totalUnidades": 2
}
```

Erros (formato `{ "erro": { "codigo", "mensagem", "detalhes" } }`, mensagem em pt-BR):

| Status | `codigo` | Quando |
|:---:|--------|--------|
| 400 | `VALIDACAO_FALHOU` | quantidade inválida ou acima de 10 (`detalhes.campo = "quantidade"`) |
| 401 | `NAO_AUTORIZADO` | token ausente, inválido ou expirado |
| 404 | `PRODUTO_NAO_ENCONTRADO` | produto inexistente |
| 409 | `ESTOQUE_INSUFICIENTE` | sem estoque (`detalhes.disponivel` traz o disponível) |

## Front-end

### Casos de uso — `src/app/application/use-cases/` (TypeScript puro)

| Caso de uso | Método | Validação antecipada |
|-------------|--------|----------------------|
| `CarregarCarrinho` | `executar()` | — |
| `AdicionarAoCarrinho` | `executar(produtoId, quantidade)` | inteiro > 0, senão `VALIDACAO_FALHOU` sem chamar o servidor |
| `AlterarQuantidadeItemCarrinho` | `executar(produtoId, quantidade)` | idem |
| `RemoverDoCarrinho` | `executar(produtoId)` | — |

Todos dependem só da porta `GatewayCarrinho` (`get`, `add`, `update`, `remove`), implementada por `GatewayCarrinhoHttp` (`adapters/out/http`). O gateway usa `encodeURIComponent` no `produtoId` e converte falhas HTTP em `ErroDaAplicacao` com o `codigo` da API (ou `ERRO_DE_REDE` / `DESCONHECIDO`). O interceptor `interceptadorAutenticacao` anexa o token às chamadas de `/api`.

### Estado — `adapters/in/estado/carrinho.estado.ts` (`EstadoCarrinho`)

Serviço raiz com Signals. A tela só lê `carrinho()` e chama os métodos.

| Membro | Descrição |
|--------|-----------|
| `carrinho` | Signal somente leitura com `{ linhas, subtotalCentavos, totalUnidades }`. |
| `refresh()` | Recarrega do servidor. |
| `add(produtoId, quantidade)` | Chama `AdicionarAoCarrinho` e atualiza `carrinho`. |
| `definirQuantidade(produtoId, quantidade)` | Chama `AlterarQuantidadeItemCarrinho`. |
| `remove(produtoId)` | Chama `RemoverDoCarrinho`. |
| `limparLocal()` | Zera só o estado local (usado após o pedido ser pago). |

Um `effect` no construtor observa `EstadoSessao.estaAutenticado()`: ao entrar, carrega o carrinho; ao sair, zera o estado local. Os métodos **propagam** `ErroDaAplicacao`; quem mostra a mensagem é a tela.

### Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `BotaoAdicionarAoCarrinho` | Se a pessoa não está logada, navega para `/entrar?retorno=<url atual>`. Se está, chama `EstadoCarrinho.add` e anuncia o resultado numa região `aria-live="polite"`. Desabilitado quando o produto está esgotado. |
| `PaginaCarrinho` (`/carrinho`, protegida por `guardaAutenticacao`) | Lista linhas, altera quantidade (`change` no campo numérico), remove e mostra o subtotal. Erros aparecem em `role="alert"` traduzidos por `descreverErro`. |
| App shell | Mostra a contagem de itens com `aria-label` "Carrinho, N item(ns)". |

Mensagens de erro (`mensagens/mensagens-de-erro.pt-BR.ts`): `ESTOQUE_INSUFICIENTE` → "Estoque insuficiente. Unidades disponíveis: N."; `ACIMA_DO_MAXIMO` → "A quantidade máxima por item é 10."; quantidade inválida → "Informe um número inteiro maior que zero em "Quantidade".".

## Fluxo: adicionar um item

1. `BotaoAdicionarAoCarrinho` verifica a sessão (se anônima, vai para o login).
2. `EstadoCarrinho.add` → `AdicionarAoCarrinho` valida a quantidade → `GatewayCarrinhoHttp` faz `POST /api/carrinho/itens`.
3. A rota extrai `usuarioId` do token e chama `AdicionarItemAoCarrinho`.
4. O caso de uso confere produto, soma, limite e estoque, salva no repositório e devolve o carrinho precificado.
5. `EstadoCarrinho` atualiza o Signal; o cabeçalho e a página reagem.

## Limitações conhecidas

- **Produto removido do catálogo:** `ObterCarrinho` falha com `PRODUTO_NAO_ENCONTRADO` e o carrinho inteiro fica ilegível. Hoje o sistema não tem operação para apagar produtos, então não é alcançável, mas precisará de tratamento (ignorar a linha e avisar) quando existir.
- **Concorrência:** adicionar é "ler, alterar, gravar". Duas requisições simultâneas da mesma pessoa podem se sobrescrever. O estoque em si está protegido (reserva atômica no checkout).
- **Preço não é congelado no carrinho:** se o preço mudar (um administrador pode alterá-lo por `PUT /api/produtos/:produtoId`), o carrinho mostra o novo valor, sem aviso à pessoa. O pedido, sim, guarda os preços do momento da compra.
- **Estoque não é reservado ao adicionar ao carrinho**, apenas na finalização da compra.

## Onde estão os testes

| Camada | Arquivo |
|--------|---------|
| Domínio | `backend/testes/unidade/domain/carrinho.test.js` |
| Casos de uso | `backend/testes/unidade/use-cases/catalogo-e-carrinho.test.js` e `finalizacao.test.js` |
| Repositórios (memória e SQLite) | `backend/testes/contrato/contratos-repositorios.js` |
| API de ponta a ponta | `backend/testes/e2e/jornada-de-compra.e2e.test.js` |
| Casos de uso do front | `frontend/testes/application/casos-de-uso.test.ts` |
| Componente `PaginaCarrinho` | `frontend/src/app/adapters/in/ui/pagina-carrinho.spec.ts` |
| Interface de ponta a ponta | `frontend/e2e/compra.spec.js` |
