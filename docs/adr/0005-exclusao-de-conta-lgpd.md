# ADR 0005 — Exclusão de conta apaga dados pessoais e pedidos

**Contexto.** O Artigo VI permite que a pessoa usuária solicite a exclusão da conta.

**Decisão.** `ExcluirConta` remove usuário, carrinho **e pedidos** (os pedidos contêm endereço e nome do destinatário).

**Ponto para validação jurídica.** Uma loja real costuma precisar reter dados fiscais por prazo legal. Se for o caso, a alternativa é anonimizar os pedidos (manter valores e itens, remover nome e endereço) em vez de apagá-los: basta trocar `RepositorioPedido.excluirPorUsuarioId` por um método de anonimização.
