import { describe, expect, it } from 'vitest';
import { calcularIncrementoAngular } from './simulacao';

describe('cálculo do tempo da simulação', () => {
  it('escala o movimento com delta time e multiplicador global', () => {
    expect(calcularIncrementoAngular(0.5, 0.2, 2)).toBeCloseTo(0.2);
  });

  it('interrompe o movimento quando a simulação está pausada', () => {
    expect(calcularIncrementoAngular(0.5, 0.2, 0)).toBe(0);
  });

  it('ignora deltas inválidos ou nulos', () => {
    expect(calcularIncrementoAngular(0.5, 0, 1)).toBe(0);
    expect(calcularIncrementoAngular(0.5, -1, 1)).toBe(0);
  });
});
