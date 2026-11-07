export class ErroDeDominio extends Error {
  constructor(codigo, detalhes = {}) {
    super(codigo);
    this.name = new.target.name;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export class ErroValidacao extends ErroDeDominio {
  constructor(campo, motivo) {
    super('VALIDACAO_FALHOU', { campo, motivo });
  }
}

export class ErroProdutoNaoEncontrado extends ErroDeDominio {
  constructor(produtoId) {
    super('PRODUTO_NAO_ENCONTRADO', { produtoId });
  }
}

export class ErroEstoqueInsuficiente extends ErroDeDominio {
  constructor({ produtoId, solicitada, disponivel }) {
    super('ESTOQUE_INSUFICIENTE', { produtoId, solicitada, disponivel });
  }
}

export class ErroProdutoInseguro extends ErroDeDominio {
  constructor(rotuloRisco) {
    super('PRODUTO_INSEGURO', { rotuloRisco });
  }
}

export class ErroEmailJaCadastrado extends ErroDeDominio {
  constructor() {
    super('EMAIL_JA_CADASTRADO');
  }
}

export class ErroCredenciaisInvalidas extends ErroDeDominio {
  constructor() {
    super('CREDENCIAIS_INVALIDAS');
  }
}

export class ErroNaoAutorizado extends ErroDeDominio {
  constructor() {
    super('NAO_AUTORIZADO');
  }
}

export class ErroCupomInvalido extends ErroDeDominio {
  constructor(motivo) {
    super('CUPOM_INVALIDO', { motivo });
  }
}

export class ErroCarrinhoVazio extends ErroDeDominio {
  constructor() {
    super('CARRINHO_VAZIO');
  }
}

export class ErroPagamentoRecusado extends ErroDeDominio {
  constructor() {
    super('PAGAMENTO_RECUSADO');
  }
}
