# ADR 0001 — Arquitetura Hexagonal no back-end e no front-end

**Status:** aceita

**Contexto.** O Artigo XII exige portas e adaptadores, e o Artigo XI exige SOLID (em especial inversão de dependência).

**Decisão.** Três pacotes de primeiro nível em ambos os projetos: `application` (domain, use-cases, ports), `adapters` (in, out) e `config` (raiz de composição). Casos de uso recebem portas pelo construtor. No front-end, `application` é TypeScript puro (sem Angular nem RxJS); as portas são classes abstratas que também servem de *token* de injeção, e os casos de uso são ligados em `config/provedores.ts` com `useFactory`.

**Verificação.** Testes de arquitetura (`testes/arquitetura`) executados no `npm test`/`npm run test:arquitetura`, e configuração do dependency-cruiser (`.dependency-cruiser.cjs`) para o CI. Um teste de contrato roda contra `*EmMemoria` e `*Sqlite` (Liskov).

**Consequências.** Mais arquivos pequenos; em troca, trocar SQLite por PostgreSQL ou `node:http` por Express exige somente novos adaptadores e uma linha na raiz de composição.
