import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Pedido } from '../../../application/domain/modelos';
import { ListarPedidos } from '../../../application/use-cases/listar-pedidos';
import { formatarBrl } from '../formatadores/formatar-brl';
import { formatarData } from '../formatadores/formatar-data';
import { descreverErro } from '../mensagens/mensagens-de-erro.pt-BR';
import { ROTULOS_STATUS_PEDIDO, ROTULOS_PAGAMENTO } from '../mensagens/rotulos.pt-BR';
import { EstadoSessao } from '../estado/sessao.estado';

@Component({
  selector: 'app-pagina-conta',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="conteiner estreito">
      <h1>Minha conta</h1>
      <p>{{ sessao.usuario()?.nome }} · {{ sessao.usuario()?.email }}</p>

      <h2>Meus pedidos</h2>
      @if (pedidos().length === 0) {
        <p>Você ainda não fez pedidos. <a routerLink="/loja">Ver brinquedos</a></p>
      } @else {
        <ul class="linhas-carrinho">
          @for (pedido of pedidos(); track pedido.id) {
            <li class="cartao">
              <p><strong>Pedido de {{ date(pedido.criadoEm) }}</strong> · {{ rotuloStatus(pedido) }}</p>
              <p>{{ money(pedido.totalCentavos) }} · {{ rotuloPagamento(pedido) }}</p>
            </li>
          }
        </ul>
      }

      <h2>Privacidade (LGPD)</h2>
      @if (!confirmandoExclusao()) {
        <button type="button" class="botao botao-perigo" (click)="confirmandoExclusao.set(true)">Excluir minha conta</button>
      } @else {
        <div class="cartao" role="alertdialog" aria-labelledby="excluir-titulo">
          <p id="excluir-titulo"><strong>Esta ação é permanente.</strong> Seus dados e pedidos serão removidos.</p>
          <button type="button" class="botao botao-perigo" (click)="excluirConta()">Sim, excluir minha conta</button>
          <button type="button" class="botao botao-secundario" (click)="confirmandoExclusao.set(false)">Cancelar</button>
        </div>
      }
      @if (erro()) {
        <p class="alerta" role="alert">{{ erro() }}</p>
      }
    </section>
  `,
})
export class PaginaConta implements OnInit {
  protected readonly sessao = inject(EstadoSessao);
  private readonly listarPedidos = inject(ListarPedidos);
  private readonly roteador = inject(Router);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly confirmandoExclusao = signal(false);
  protected readonly erro = signal('');
  protected readonly money = formatarBrl;
  protected readonly date = formatarData;

  async ngOnInit(): Promise<void> {
    try {
      this.pedidos.set(await this.listarPedidos.executar());
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }

  protected rotuloStatus(pedido: Pedido): string {
    return ROTULOS_STATUS_PEDIDO[pedido.status] ?? pedido.status;
  }

  protected rotuloPagamento(pedido: Pedido): string {
    return ROTULOS_PAGAMENTO[pedido.pagamento.method];
  }

  protected async excluirConta(): Promise<void> {
    try {
      await this.sessao.excluirConta();
      await this.roteador.navigateByUrl('/loja');
    } catch (erro) {
      this.erro.set(descreverErro(erro));
    }
  }
}
