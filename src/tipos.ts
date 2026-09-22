export type IdPlaneta =
  | 'mercurio'
  | 'venus'
  | 'terra'
  | 'marte'
  | 'jupiter'
  | 'saturno'
  | 'urano'
  | 'netuno';

export type MultiplicadorTempo = 0 | 0.5 | 1 | 2 | 5 | 10;
export type PerfilGrafico = 'alto' | 'economico';

export interface ConfiguracaoAtmosfera {
  cor: number;
  opacidade: number;
  escala: number;
}

export interface ConfiguracaoAneis {
  raioInterno: number;
  raioExterno: number;
  textura: string;
  opacidade: number;
}

export interface DadosPlaneta {
  id: IdPlaneta;
  nome: string;
  tipo: string;
  descricao: string;
  diametroKm: number;
  distanciaMediaSolKm: number;
  gravidadeMs2: number;
  temperaturaMediaC: number;
  duracaoDia: string;
  duracaoAno: string;
  numeroDeLuas: number;
  curiosidade: string;
  fonte: string;
  texturaAlta: string;
  texturaBaixa: string;
  raioVisual: number;
  distanciaOrbitalVisual: number;
  velocidadeOrbital: number;
  velocidadeRotacao: number;
  inclinacaoAxialGraus: number;
  faseInicial: number;
  corDestaque: string;
  corFallback: number;
  atmosfera?: ConfiguracaoAtmosfera;
  aneis?: ConfiguracaoAneis;
  nuvens?: {
    texturaAlta: string;
    texturaBaixa: string;
    velocidadeRotacao: number;
  };
  lua?: {
    texturaAlta: string;
    texturaBaixa: string;
    raioVisual: number;
    distanciaOrbital: number;
    velocidadeOrbital: number;
  };
}

export interface EstadoDaSimulacao {
  planetaSelecionado: IdPlaneta | null;
  multiplicadorTempo: MultiplicadorTempo;
  multiplicadorAnterior: Exclude<MultiplicadorTempo, 0>;
  orbitasVisiveis: boolean;
  informacoesVisiveis: boolean;
  emTransicao: boolean;
}
