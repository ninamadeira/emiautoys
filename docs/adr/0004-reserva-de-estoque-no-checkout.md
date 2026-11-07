# ADR 0004 — Reserva de estoque e compensação no checkout

**Decisão.** `FinalizarPedido` reserva o estoque de cada linha (`reservarEstoque`, atômico: no SQLite é um `UPDATE … WHERE estoque >= ?`), depois cobra. Se a reserva de alguma linha ou a cobrança falhar, o estoque já reservado é devolvido (`liberarEstoque`) e o carrinho é preservado. O carrinho só é esvaziado após o pedido ser gravado.

**Limitação conhecida.** Se a gravação do pedido falhar *depois* de o pagamento ser aprovado, não há estorno automático. Com um provedor de pagamento real isso exige uma porta de estorno e uma unidade de trabalho transacional; não foi implementado porque o pagamento é simulado.
