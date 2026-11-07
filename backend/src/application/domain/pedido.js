import { ErroValidacao } from './erros.js';
import { exigirTexto } from './validacao.js';

export const STATUS_PEDIDO_PAGO = 'PAGO';

function exigirLinhas(linhas) {
  if (!Array.isArray(linhas) || linhas.length === 0) {
    throw new ErroValidacao('linhas', 'OBRIGATORIO');
  }
  return linhas;
}

export function criarPedido(propriedades) {
  const totalCentavos = propriedades.subtotalCentavos - propriedades.descontoCentavos + propriedades.freteCentavos;
  return Object.freeze({
    id: exigirTexto(propriedades.id, 'id'),
    usuarioId: exigirTexto(propriedades.usuarioId, 'usuarioId'),
    status: STATUS_PEDIDO_PAGO,
    linhas: exigirLinhas(propriedades.linhas),
    subtotalCentavos: propriedades.subtotalCentavos,
    descontoCentavos: propriedades.descontoCentavos,
    freteCentavos: propriedades.freteCentavos,
    totalCentavos,
    codigoCupom: propriedades.codigoCupom,
    enderecoEntrega: propriedades.enderecoEntrega,
    pagamento: propriedades.pagamento,
    criadoEm: propriedades.criadoEm,
  });
}
