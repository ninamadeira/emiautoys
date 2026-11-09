# ADR 0007 — Administração de produtos por e-mail configurado

**Decisão.** `CadastrarProduto` e `AlterarProduto` só aceitam usuários cujo e-mail esteja em `EMAILS_ADMINISTRADORES` (lista separada por vírgulas, normalizada em minúsculas na configuração). A regra fica no domínio (`garantirAdministrador`); os casos de uso buscam o usuário pela porta `RepositorioUsuario` e a aplicam. Quem não é administrador recebe `ACESSO_PROIBIDO` (403). A alteração reaproveita `criarProduto`, então preço (inteiro positivo, em centavos), categoria e risco proibido são validados como no cadastro.

**Por quê.** O projeto não tinha papéis de usuário. Configurar a lista de e-mails evita mudar o banco e o cadastro de contas para atender ao caso de uso, e mantém a regra testável sem HTTP.

**Consequências.** O preço lido pelo carrinho passa a poder mudar (ver `docs/carrinho.md`); os pedidos já feitos guardam o preço da compra. O login passa a devolver `usuario.administrador`, e o front-end usa esse dado para mostrar a página `/administracao` (cadastro de produtos e alteração de preço e estoque) apenas a administradores; a proteção real continua no back-end (403). Não há papel persistido, auditoria de alterações nem remoção de produtos. Se surgirem mais perfis, o próximo passo é guardar o papel na conta.
