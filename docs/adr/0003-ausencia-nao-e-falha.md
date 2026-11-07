# ADR 0003 — Ausência não é falha

**Contexto.** O Artigo X proíbe retornar `null` para sinalizar falha.

**Decisão.** Falhas são exceções tipadas de domínio (`ErroEstoqueInsuficiente`, `ErroCredenciaisInvalidas`…), sempre com um `codigo` em português. Consultas de repositório (`buscarPorId`, `buscarPorEmail`, `buscarPorCodigo`) retornam `undefined` quando o registro simplesmente não existe, porque isso é um resultado normal e não uma falha; o caso de uso decide se a ausência vira erro (`ErroProdutoNaoEncontrado`) ou segue o fluxo (e-mail livre no cadastro). Repositórios de coleção retornam listas vazias e `RepositorioCarrinho.buscarPorUsuarioId` sempre devolve um carrinho (vazio se necessário).
