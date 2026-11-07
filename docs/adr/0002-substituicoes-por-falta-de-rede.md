# ADR 0002 — Substituições feitas por indisponibilidade de pacotes

**Status:** aceita (revisar assim que houver acesso ao registro npm)

**Contexto.** O ambiente em que o projeto foi gerado não permitia instalar pacotes. Express, Angular, bcrypt/argon2, ESLint, Prettier e dependency-cruiser não estavam disponíveis.

| Pretendido (Art. IV/VI/VIII) | Usado agora | Como migrar |
|---|---|---|
| Express | `node:http` com roteador próprio (`adapters/in/http`) | Criar um adaptador de entrada Express usando os mesmos casos de uso; só `config/raiz-de-composicao.js` muda |
| bcrypt/argon2 | `scrypt` do `node:crypto` (KDF aprovado, com sal e comparação em tempo constante) | Nova classe que implementa a porta `GeradorHashSenha` |
| SQLite (lib) | `node:sqlite` (nativo do Node 22, ainda marcado experimental) | Repositórios já isolados na porta; trocar por `better-sqlite3` ou PostgreSQL |
| dependency-cruiser no CI | Testes próprios de arquitetura (já rodam) **e** `.dependency-cruiser.cjs` pronto | `npm i -D dependency-cruiser && npm run arquitetura` |
| ESLint/Prettier | Configurações escritas, **não executadas** | `npm i && npm run lint && npm run format:check` |
| Angular | Código-fonte escrito, **não compilado** | `cd frontend && npm i && npm start` |

**Consequência.** O back-end e a camada `application` do front-end foram executados e testados. O código Angular (adaptadores e `config`) foi escrito mas ainda não foi compilado nem testado no navegador.
