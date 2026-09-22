import * as THREE from 'three';
import { detectarPerfilGrafico, prefereMovimentoReduzido } from './configuracao';
import { SistemaSolar } from './cena/SistemaSolar';
import { InterfaceExploracao } from './interface/InterfaceExploracao';
import type { IdPlaneta } from './tipos';
import './estilos/global.css';
import './estilos/interface.css';
import './estilos/responsivo.css';

const canvas = document.querySelector<HTMLCanvasElement>('#cena-3d');

if (!canvas) {
  throw new Error('Canvas principal não encontrado.');
}

const canvasPrincipal = canvas;

const movimentoReduzido = prefereMovimentoReduzido();
const perfilGrafico = detectarPerfilGrafico();
let sistemaSolar: SistemaSolar | null = null;

const interfaceExploracao = new InterfaceExploracao(
  {
    aoSelecionar: selecionarPlaneta,
    aoVoltar: voltarParaVisaoGeral,
    aoAlterarVelocidade: (multiplicador) => sistemaSolar?.definirMultiplicadorTempo(multiplicador),
    aoAlterarOrbitas: (visiveis) => sistemaSolar?.definirOrbitasVisiveis(visiveis),
    aoResetarCamera: voltarParaVisaoGeral,
  },
  movimentoReduzido,
);

function selecionarPlaneta(id: IdPlaneta): void {
  interfaceExploracao.selecionarPlaneta(id);
  sistemaSolar?.selecionarPlaneta(id);
}

function voltarParaVisaoGeral(): void {
  interfaceExploracao.voltarParaVisaoGeral();
  sistemaSolar?.voltarParaVisaoGeral();
}

function iniciarExperiencia(): void {
  const manager = new THREE.LoadingManager();
  let houveFalhaDeAsset = false;

  manager.onProgress = (_url, carregados, total) => {
    interfaceExploracao.atualizarCarregamento(carregados, total);
  };

  manager.onError = () => {
    houveFalhaDeAsset = true;
  };

  manager.onLoad = () => {
    interfaceExploracao.concluirCarregamento();
    if (houveFalhaDeAsset) {
      interfaceExploracao.avisarFalhaDeAsset();
    }
    sistemaSolar?.apresentar();
  };

  try {
    sistemaSolar = new SistemaSolar(canvasPrincipal, manager, perfilGrafico, movimentoReduzido, {
      aoSelecionar: selecionarPlaneta,
      aoPairar: (id, posicao) => interfaceExploracao.mostrarRotuloHover(id, posicao),
      aoAlterarTransicao: (emTransicao) => interfaceExploracao.definirEstadoDeTransicao(emTransicao),
    });
    sistemaSolar.definirMultiplicadorTempo(interfaceExploracao.multiplicadorTempo);
    sistemaSolar.iniciar();
  } catch (erro) {
    console.error('Não foi possível iniciar a experiência WebGL.', erro);
    interfaceExploracao.mostrarFallbackWebGL();
  }
}

iniciarExperiencia();
