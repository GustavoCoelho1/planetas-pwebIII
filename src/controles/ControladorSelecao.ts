import * as THREE from 'three';
import type { IdPlaneta } from '../tipos';

interface PosicaoPonteiro {
  x: number;
  y: number;
}

export class ControladorSelecao {
  readonly #canvas: HTMLCanvasElement;
  readonly #camera: THREE.Camera;
  readonly #raycaster = new THREE.Raycaster();
  readonly #ponteiroNormalizado = new THREE.Vector2();
  readonly #objetos: THREE.Object3D[];
  readonly #aoSelecionar: (id: IdPlaneta) => void;
  readonly #aoPairar: (id: IdPlaneta | null, posicao?: PosicaoPonteiro) => void;
  #inicioPressao: PosicaoPonteiro | null = null;
  #ultimoPlaneta: IdPlaneta | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    objetos: THREE.Object3D[],
    aoSelecionar: (id: IdPlaneta) => void,
    aoPairar: (id: IdPlaneta | null, posicao?: PosicaoPonteiro) => void,
  ) {
    this.#canvas = canvas;
    this.#camera = camera;
    this.#objetos = objetos;
    this.#aoSelecionar = aoSelecionar;
    this.#aoPairar = aoPairar;

    canvas.addEventListener('pointermove', this.#tratarMovimento);
    canvas.addEventListener('pointerdown', this.#tratarInicioPressao);
    canvas.addEventListener('pointerup', this.#tratarFimPressao);
    canvas.addEventListener('pointerleave', this.#tratarSaida);
  }

  liberar(): void {
    this.#canvas.removeEventListener('pointermove', this.#tratarMovimento);
    this.#canvas.removeEventListener('pointerdown', this.#tratarInicioPressao);
    this.#canvas.removeEventListener('pointerup', this.#tratarFimPressao);
    this.#canvas.removeEventListener('pointerleave', this.#tratarSaida);
  }

  #tratarMovimento = (evento: PointerEvent): void => {
    const id = this.#identificarPlaneta(evento.clientX, evento.clientY);

    if (id !== this.#ultimoPlaneta || id !== null) {
      this.#ultimoPlaneta = id;
      this.#aoPairar(id, { x: evento.clientX, y: evento.clientY });
    }
  };

  #tratarInicioPressao = (evento: PointerEvent): void => {
    this.#inicioPressao = { x: evento.clientX, y: evento.clientY };
  };

  #tratarFimPressao = (evento: PointerEvent): void => {
    if (!this.#inicioPressao) {
      return;
    }

    const distancia = Math.hypot(
      evento.clientX - this.#inicioPressao.x,
      evento.clientY - this.#inicioPressao.y,
    );
    this.#inicioPressao = null;

    if (distancia > 7) {
      return;
    }

    const id = this.#identificarPlaneta(evento.clientX, evento.clientY);

    if (id) {
      this.#aoSelecionar(id);
    }
  };

  #tratarSaida = (): void => {
    this.#ultimoPlaneta = null;
    this.#aoPairar(null);
  };

  #identificarPlaneta(clientX: number, clientY: number): IdPlaneta | null {
    const area = this.#canvas.getBoundingClientRect();
    this.#ponteiroNormalizado.x = ((clientX - area.left) / area.width) * 2 - 1;
    this.#ponteiroNormalizado.y = -((clientY - area.top) / area.height) * 2 + 1;
    this.#raycaster.setFromCamera(this.#ponteiroNormalizado, this.#camera);

    const intersecoes = this.#raycaster.intersectObjects(this.#objetos, false);
    const id = intersecoes[0]?.object.userData.idPlaneta as IdPlaneta | undefined;
    return id ?? null;
  }
}
