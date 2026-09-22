import type { MultiplicadorTempo } from '../tipos';

export function calcularIncrementoAngular(
  velocidade: number,
  deltaTime: number,
  multiplicador: MultiplicadorTempo,
): number {
  if (deltaTime <= 0 || multiplicador === 0) {
    return 0;
  }

  return velocidade * deltaTime * multiplicador;
}
