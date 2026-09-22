import { describe, expect, it } from 'vitest';
import { PLANETAS, PLANETAS_POR_ID } from './planetas';

describe('catálogo de planetas', () => {
  it('contém os oito planetas em ordem a partir do Sol', () => {
    expect(PLANETAS.map((planeta) => planeta.id)).toEqual([
      'mercurio',
      'venus',
      'terra',
      'marte',
      'jupiter',
      'saturno',
      'urano',
      'netuno',
    ]);
  });

  it('mantém identificadores únicos e indexados', () => {
    const ids = PLANETAS.map((planeta) => planeta.id);
    expect(new Set(ids).size).toBe(PLANETAS.length);
    expect(PLANETAS_POR_ID.size).toBe(PLANETAS.length);
  });

  it('preserva a ordem crescente das distâncias orbitais visuais', () => {
    const distancias = PLANETAS.map((planeta) => planeta.distanciaOrbitalVisual);
    expect(distancias).toEqual([...distancias].sort((a, b) => a - b));
  });

  it('mantém gigantes gasosos visualmente maiores que os planetas rochosos', () => {
    const terra = PLANETAS_POR_ID.get('terra');
    const jupiter = PLANETAS_POR_ID.get('jupiter');
    const saturno = PLANETAS_POR_ID.get('saturno');

    expect(jupiter?.raioVisual).toBeGreaterThan(terra?.raioVisual ?? 0);
    expect(saturno?.raioVisual).toBeGreaterThan(terra?.raioVisual ?? 0);
  });

  it('possui fonte e texturas locais em todos os registros', () => {
    for (const planeta of PLANETAS) {
      expect(planeta.fonte).toMatch(/^https:\/\/science\.nasa\.gov\//);
      expect(planeta.texturaAlta).not.toMatch(/^https?:\/\//);
      expect(planeta.texturaBaixa).not.toMatch(/^https?:\/\//);
    }
  });
});
