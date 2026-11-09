import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SeletorQuantidade } from './seletor-quantidade';

@Component({
  selector: 'app-hospedeiro',
  imports: [SeletorQuantidade],
  template: `
    <app-seletor-quantidade
      [valor]="valor()"
      rotulo="Bolinha"
      idCampo="qtd-bolinha"
      [maximo]="3"
      (alterada)="valor.set($event)"
    />
  `,
})
class Hospedeiro {
  readonly valor = signal(1);
}

function exigir<T>(valor: T | null | undefined, descricao: string): T {
  if (valor === null || valor === undefined) {
    throw new Error(`${descricao} não encontrado`);
  }
  return valor;
}

function montar() {
  const fixture = TestBed.createComponent(Hospedeiro);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const botao = (rotulo: string) => exigir(root.querySelector<HTMLButtonElement>(`button[aria-label^="${rotulo}"]`), rotulo);
  const campo = () => exigir(root.querySelector<HTMLInputElement>('#qtd-bolinha'), 'campo');
  return { fixture, botao, campo };
}

describe('SeletorQuantidade', () => {
  it('aumenta e diminui a quantidade pelos botões', () => {
    const { fixture, botao, campo } = montar();
    botao('Aumentar').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.valor()).toBe(2);
    expect(campo().value).toBe('2');
    botao('Diminuir').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.valor()).toBe(1);
  });

  it('desabilita "diminuir" no mínimo e "aumentar" no máximo', () => {
    const { fixture, botao } = montar();
    expect(botao('Diminuir').disabled).toBe(true);
    fixture.componentInstance.valor.set(3);
    fixture.detectChanges();
    expect(botao('Aumentar').disabled).toBe(true);
  });

  it('limita o valor digitado ao máximo', () => {
    const { fixture, campo } = montar();
    campo().value = '9';
    campo().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.valor()).toBe(3);
  });

  it('descarta valor digitado inválido e mantém a quantidade', () => {
    const { fixture, campo } = montar();
    campo().value = '1.5';
    campo().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.valor()).toBe(1);
    expect(campo().value).toBe('1');
  });

  it('rotula o campo com o nome do produto', () => {
    const { fixture } = montar();
    const label = (fixture.nativeElement as HTMLElement).querySelector('label[for="qtd-bolinha"]');
    expect((label?.textContent ?? '').trim()).toBe('Quantidade de Bolinha');
  });
});
