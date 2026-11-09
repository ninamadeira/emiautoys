import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { numeroDe } from './eventos-dom';

@Component({
  selector: 'app-seletor-quantidade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seletor-quantidade">
      <label class="visualmente-oculto" [for]="idCampo()">Quantidade de {{ rotulo() }}</label>
      <button
        type="button"
        class="seletor-quantidade__botao"
        [disabled]="desabilitado() || valor() <= minimo()"
        [attr.aria-label]="'Diminuir a quantidade de ' + rotulo()"
        (click)="alterar(valor() - 1)"
      >
        −
      </button>
      <input
        [id]="idCampo()"
        type="number"
        inputmode="numeric"
        [min]="minimo()"
        [max]="maximo()"
        [value]="valor()"
        [disabled]="desabilitado()"
        (change)="digitado($event)"
      />
      <button
        type="button"
        class="seletor-quantidade__botao"
        [disabled]="desabilitado() || valor() >= maximo()"
        [attr.aria-label]="'Aumentar a quantidade de ' + rotulo()"
        (click)="alterar(valor() + 1)"
      >
        +
      </button>
    </div>
  `,
})
export class SeletorQuantidade {
  readonly valor = input.required<number>();
  readonly rotulo = input.required<string>();
  readonly idCampo = input.required<string>();
  readonly minimo = input(1);
  readonly maximo = input(10);
  readonly desabilitado = input(false);
  readonly alterada = output<number>();

  protected alterar(quantidade: number): void {
    const limitada = Math.min(this.maximo(), Math.max(this.minimo(), quantidade));
    if (Number.isInteger(limitada) && limitada !== this.valor()) {
      this.alterada.emit(limitada);
    }
  }

  protected digitado(evento: Event): void {
    this.alterar(numeroDe(evento));
    (evento.target as HTMLInputElement).value = String(this.valor());
  }
}
