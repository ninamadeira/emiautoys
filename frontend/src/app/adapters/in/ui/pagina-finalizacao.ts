import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEIOS_PAGAMENTO, type Pedido, type MeioPagamento, type Cotacao } from '../../../application/domain/modelos';
import { RealizarPedido } from '../../../application/use-cases/realizar-pedido';
import { CotarPedido } from '../../../application/use-cases/cotar-pedido';
import { formatarBrl } from '../formatadores/formatar-brl';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_PAGAMENTO } from '../mensagens/rotulos.pt-BR';
import { EstadoCarrinho } from '../estado/carrinho.estado';
import { valueOf } from './eventos-dom';

type CampoEndereco = 'nomeDestinatario' | 'cep' | 'rua' | 'numero' | 'complemento' | 'cidade' | 'estado';

const CAMPOS_ENDERECO: readonly { campo: CampoEndereco; label: string; autocomplete: string; required: boolean }[] = [
  { campo: 'nomeDestinatario', label: 'Nome do destinatário', autocomplete: 'name', required: true },
  { campo: 'cep', label: 'CEP', autocomplete: 'postal-code', required: true },
  { campo: 'rua', label: 'Rua', autocomplete: 'address-line1', required: true },
  { campo: 'numero', label: 'Número', autocomplete: 'off', required: true },
  { campo: 'complemento', label: 'Complemento (opcional)', autocomplete: 'address-line2', required: false },
  { campo: 'cidade', label: 'Cidade', autocomplete: 'address-level2', required: true },
  { campo: 'estado', label: 'UF', autocomplete: 'address-level1', required: true },
];

@Component({
  selector: 'app-pagina-finalizacao',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner estreito">
      <h1>Finalizar compra</h1>
      @if (pedidoConfirmado(); as pedido) {
        <div class="cartao" role="status">
          <h2>Pedido confirmado!</h2>
          <p>Pedido <strong>{{ pedido.id }}</strong> pago. Total: {{ money(pedido.totalCentavos) }}.</p>
          <a routerLink="/conta" class="botao">Ver meus pedidos</a>
        </div>
      } @else if (estadoCarrinho.carrinho().linhas.length === 0) {
        <p>Seu carrinho está vazio. <a routerLink="/loja">Ver brinquedos</a></p>
      } @else {
        <form (submit)="submit($event)" novalidate>
          <fieldset>
            <legend>Endereço de entrega</legend>
            @for (item of camposEndereco; track item.campo) {
              <div class="campo">
                <label [for]="'endereco-' + item.campo">{{ item.label }}</label>
                <input
                  [id]="'endereco-' + item.campo"
                  type="text"
                  [attr.autocomplete]="item.autocomplete"
                  [required]="item.required"
                  [value]="endereco()[item.campo]"
                  (input)="definirEndereco(item.campo, value($event))"
                />
              </div>
            }
          </fieldset>

          <fieldset>
            <legend>Cupom e frete</legend>
            <div class="campo">
              <label for="cupom">Cupom de desconto (opcional)</label>
              <input id="cupom" type="text" [value]="cupom()" (input)="cupom.set(value($event))" />
            </div>
            <button type="button" class="botao botao-secundario" (click)="calcular()">Calcular frete e total</button>
          </fieldset>

          <fieldset>
            <legend>Forma de pagamento</legend>
            @for (method of methods; track method) {
              <label class="opcao">
                <input type="radio" name="pagamento" [value]="method" [checked]="meioPagamento() === method" (change)="meioPagamento.set(method)" />
                {{ labels[method] }}
              </label>
            }
            <p class="ajuda">Pagamento simulado: nenhum dado de cartão é coletado ou armazenado.</p>
          </fieldset>

          @if (cotacao(); as q) {
            <dl class="resumo" aria-live="polite">
              <dt>Subtotal</dt><dd>{{ money(q.subtotalCentavos) }}</dd>
              <dt>Desconto</dt><dd>− {{ money(q.descontoCentavos) }}</dd>
              <dt>Frete</dt><dd>{{ q.freteCentavos === 0 ? 'Grátis' : money(q.freteCentavos) }}</dd>
              <dt>Total</dt><dd><strong>{{ money(q.totalCentavos) }}</strong></dd>
            </dl>
          }
          @if (erro()) {
            <p class="alerta" role="alert">{{ erro() }}</p>
          }
          <button type="submit" class="botao" [disabled]="ocupado()">Pagar pedido</button>
        </form>
      }
    </section>
  `,
})
export class PaginaFinalizacao {
  protected readonly estadoCarrinho = inject(EstadoCarrinho);
  private readonly cotarPedido = inject(CotarPedido);
  private readonly realizarPedido = inject(RealizarPedido);

  protected readonly camposEndereco = CAMPOS_ENDERECO;
  protected readonly methods = MEIOS_PAGAMENTO;
  protected readonly labels = ROTULOS_PAGAMENTO;
  protected readonly money = formatarBrl;
  protected readonly value = valueOf;

  protected readonly endereco = signal<Record<CampoEndereco, string>>({
    nomeDestinatario: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
  });
  protected readonly cupom = signal('');
  protected readonly meioPagamento = signal<MeioPagamento>('PIX');
  protected readonly cotacao = signal<Cotacao | undefined>(undefined);
  protected readonly pedidoConfirmado = signal<Pedido | undefined>(undefined);
  protected readonly erro = signal('');
  protected readonly ocupado = signal(false);

  protected definirEndereco(campo: CampoEndereco, novoValor: string): void {
    this.endereco.update((atual) => ({ ...atual, [campo]: novoValor }));
    this.cotacao.set(undefined);
  }

  protected async calcular(): Promise<void> {
    await this.run(async () => {
      this.cotacao.set(await this.cotarPedido.executar({ cep: this.endereco().cep, codigoCupom: this.cupom() }));
    });
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    await this.run(async () => {
      const pedido = await this.realizarPedido.executar({
        enderecoEntrega: this.endereco(),
        meioPagamento: this.meioPagamento(),
        codigoCupom: this.cupom(),
      });
      this.pedidoConfirmado.set(pedido);
      this.estadoCarrinho.limparLocal();
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.ocupado.set(true);
    this.erro.set('');
    try {
      await action();
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    } finally {
      this.ocupado.set(false);
    }
  }
}
