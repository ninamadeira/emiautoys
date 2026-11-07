# ADR 0006 — Código-fonte em português

**Contexto.** O Artigo XIII previa documentação em pt-BR e identificadores de código em inglês. A pessoa responsável pelo projeto pediu que tudo que fosse possível ficasse em português, inclusive nomes de classes, funções, rotas e banco de dados.

**Decisão.** Esta decisão abre uma exceção consciente ao "código em inglês" do Artigo XIII. Passam a estar em português:

- identificadores (classes, funções, variáveis, constantes, tipos, portas, casos de uso), nomes de arquivos e das pastas de suporte (`memoria`, `sqlite`, `pagamento`, `seguranca`…);
- rotas da API (`/api/carrinho/itens`, `/api/finalizacao/cotacao`, `/api/autenticacao/entrar`…) e campos JSON (`produtoId`, `quantidade`, `precoCentavos`…);
- tabelas e colunas do SQLite (`produtos`, `itens_carrinho`, `preco_centavos`…), variáveis de ambiente (`SEGREDO_TOKEN`, `ARQUIVO_BANCO`, `ORIGEM_CORS`…), códigos de erro (`ESTOQUE_INSUFICIENTE`, `VALIDACAO_FALHOU`…), ids dos produtos de exemplo, classes e propriedades CSS, descrições de testes e mensagens de log.

**O que permanece em inglês, de propósito.** As pastas das camadas da Arquitetura Hexagonal (`application/{domain,use-cases,ports}`, `adapters/{in,out}`, `config`) mantêm os nomes do padrão, por pedido da pessoa responsável. Também ficam em inglês os nomes definidos por tecnologias externas, que não podem ser alterados sem quebrar o funcionamento:

- APIs e palavras-chave de JavaScript/TypeScript, Node.js, Angular, RxJS, Vitest e Playwright (`Object.entries`, `HttpClient`, `params`, `localStorage.removeItem`, `.first()`, `Error.name`/`message`/`stack`…);
- vocabulário do protocolo HTTP (`method`, `headers`, `body`, `status`, `Authorization`, `Bearer`, `Content-Type`) e valores padronizados de HTML/ARIA (`type="password"`, `role="alert"`, `autocomplete="name"`);
- `NODE_ENV` e `PORT`, por serem convenções reconhecidas por plataformas de hospedagem;
- termos técnicos já usados em português (`gateway`, `token`, `hash`, `login` em textos para o usuário) e o seletor raiz `app-root`.

**Consequências.**

- Quebra de compatibilidade: a API, o esquema do banco e a chave do `localStorage` mudaram. Bancos antigos (`backend/data/*.sqlite`) devem ser apagados; sessões abertas precisam entrar de novo.
- O glossário domínio ↔ código em `docs/spec.md` passa a mostrar os nomes em português.
- Os testes de arquitetura continuam impondo a regra da dependência com os rótulos de camada (`use-cases`, `adapters-in`, `adapters-out`).
