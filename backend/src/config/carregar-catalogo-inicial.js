import { criarCupom } from '../application/domain/cupom.js';
import { criarProduto } from '../application/domain/produto.js';
import { CUPONS_INICIAIS, PRODUTOS_INICIAIS } from './dados-iniciais.js';

export async function carregarCatalogoInicial({ repositorioProduto, repositorioCupom }) {
  if ((await repositorioProduto.buscarTodos()).length > 0) {
    return;
  }
  for (const propriedades of PRODUTOS_INICIAIS) {
    await repositorioProduto.salvar(criarProduto({ ...propriedades, urlImagem: `/imagens/${propriedades.id}.webp` }));
  }
  for (const propriedades of CUPONS_INICIAIS) {
    await repositorioCupom.salvar(criarCupom(propriedades));
  }
}
