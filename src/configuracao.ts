import type { PerfilGrafico } from './tipos';

export const CONFIGURACAO_CENA = {
  raioSol: 5.6,
  corFundo: 0x02040b,
  posicaoCameraInicial: [0, 46, 82] as const,
  alvoCameraInicial: [0, 0, 0] as const,
  duracaoTransicaoCamera: 1.6,
  intensidadeLuzSolar: 720,
  distanciaLuzSolar: 150,
  quantidadeEstrelas: {
    alto: 1800,
    economico: 700,
  },
  limitePixelRatio: {
    alto: 1.5,
    economico: 1.25,
  },
  segmentosEsfera: {
    alto: 64,
    economico: 32,
  },
} as const;

export function detectarPerfilGrafico(): PerfilGrafico {
  const telaEstreita = window.matchMedia('(max-width: 760px)').matches;
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const poucosNucleos = (navigator.hardwareConcurrency ?? 8) <= 4;

  return telaEstreita || movimentoReduzido || poucosNucleos ? 'economico' : 'alto';
}

export function prefereMovimentoReduzido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
