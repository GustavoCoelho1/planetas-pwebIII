import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIGURACAO_CENA } from '../configuracao';
import { suavizarPasso } from '../utilitarios/matematica';

type ProvedorPosicao = () => THREE.Vector3;

interface TransicaoCamera {
  inicioMs: number;
  duracaoMs: number;
  posicaoInicial: THREE.Vector3;
  alvoInicial: THREE.Vector3;
  obterAlvo: ProvedorPosicao;
  deslocamentoFinal: THREE.Vector3;
  aoConcluir?: () => void;
}

export class ControladorCamera {
  readonly camera: THREE.PerspectiveCamera;
  readonly controles: OrbitControls;
  readonly #movimentoReduzido: boolean;
  #transicao: TransicaoCamera | null = null;
  #alvoAcompanhado: ProvedorPosicao | null = null;
  #ultimaPosicaoAlvo = new THREE.Vector3();
  #aoAlterarTransicao: (emTransicao: boolean) => void;

  constructor(
    canvas: HTMLCanvasElement,
    movimentoReduzido: boolean,
    aoAlterarTransicao: (emTransicao: boolean) => void,
  ) {
    this.#movimentoReduzido = movimentoReduzido;
    this.#aoAlterarTransicao = aoAlterarTransicao;
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 320);
    this.camera.position.fromArray(CONFIGURACAO_CENA.posicaoCameraInicial);

    this.controles = new OrbitControls(this.camera, canvas);
    this.controles.enableDamping = true;
    this.controles.dampingFactor = 0.055;
    this.controles.enablePan = false;
    this.controles.minDistance = 2;
    this.controles.maxDistance = 115;
    this.controles.minPolarAngle = 0.08;
    this.controles.maxPolarAngle = Math.PI - 0.08;
    this.controles.target.fromArray(CONFIGURACAO_CENA.alvoCameraInicial);
    this.controles.update();
  }

  focar(
    obterAlvo: ProvedorPosicao,
    raioVisual: number,
    aoConcluir?: () => void,
  ): void {
    const alvo = obterAlvo();
    const direcao = this.camera.position.clone().sub(alvo).normalize();
    direcao.y = Math.max(direcao.y, 0.2);
    direcao.normalize();

    this.#alvoAcompanhado = obterAlvo;
    this.#ultimaPosicaoAlvo.copy(alvo);
    this.#iniciarTransicao(
      obterAlvo,
      direcao.multiplyScalar(Math.max(raioVisual * 4.1, 3.8)),
      aoConcluir,
    );
  }

  voltarParaVisaoGeral(aoConcluir?: () => void): void {
    this.#alvoAcompanhado = null;
    const posicaoFinal = new THREE.Vector3().fromArray(CONFIGURACAO_CENA.posicaoCameraInicial);
    const alvoFinal = new THREE.Vector3().fromArray(CONFIGURACAO_CENA.alvoCameraInicial);
    this.#iniciarTransicao(
      () => alvoFinal.clone(),
      posicaoFinal.sub(alvoFinal),
      aoConcluir,
    );
  }

  atualizar(agoraMs: number): void {
    if (this.#transicao) {
      this.#atualizarTransicao(agoraMs);
    } else if (this.#alvoAcompanhado) {
      const posicaoAtual = this.#alvoAcompanhado();
      const deslocamento = posicaoAtual.clone().sub(this.#ultimaPosicaoAlvo);
      this.camera.position.add(deslocamento);
      this.controles.target.add(deslocamento);
      this.#ultimaPosicaoAlvo.copy(posicaoAtual);
    }

    this.controles.update();
  }

  redimensionar(largura: number, altura: number): void {
    this.camera.aspect = largura / Math.max(altura, 1);
    this.camera.updateProjectionMatrix();
  }

  #iniciarTransicao(
    obterAlvo: ProvedorPosicao,
    deslocamentoFinal: THREE.Vector3,
    aoConcluir?: () => void,
  ): void {
    this.controles.enabled = false;
    this.#aoAlterarTransicao(true);
    this.#transicao = {
      inicioMs: performance.now(),
      duracaoMs: (this.#movimentoReduzido ? 0.12 : CONFIGURACAO_CENA.duracaoTransicaoCamera) * 1000,
      posicaoInicial: this.camera.position.clone(),
      alvoInicial: this.controles.target.clone(),
      obterAlvo,
      deslocamentoFinal,
      aoConcluir,
    };
  }

  #atualizarTransicao(agoraMs: number): void {
    const transicao = this.#transicao;

    if (!transicao) {
      return;
    }

    const progresso = Math.min((agoraMs - transicao.inicioMs) / transicao.duracaoMs, 1);
    const suavizado = suavizarPasso(progresso);
    const alvoFinal = transicao.obterAlvo();
    const posicaoFinal = alvoFinal.clone().add(transicao.deslocamentoFinal);

    this.camera.position.lerpVectors(transicao.posicaoInicial, posicaoFinal, suavizado);
    this.controles.target.lerpVectors(transicao.alvoInicial, alvoFinal, suavizado);

    if (progresso >= 1) {
      this.#ultimaPosicaoAlvo.copy(alvoFinal);
      this.#transicao = null;
      this.controles.enabled = true;
      this.#aoAlterarTransicao(false);
      transicao.aoConcluir?.();
    }
  }
}
