import * as THREE from 'three';
import { CONFIGURACAO_CENA } from '../configuracao';
import { ControladorCamera } from '../controles/ControladorCamera';
import { ControladorSelecao } from '../controles/ControladorSelecao';
import { PLANETAS } from '../dados/planetas';
import type { IdPlaneta, MultiplicadorTempo, PerfilGrafico } from '../tipos';
import { calcularIncrementoAngular } from '../utilitarios/simulacao';
import { criarCampoDeEstrelas, criarHaloSolar, criarOrbita } from './criarAmbiente';
import { criarPlaneta, type CorpoPlaneta } from './criarPlaneta';
import { GerenciadorTexturas } from './GerenciadorTexturas';

interface EventosSistemaSolar {
  aoSelecionar: (id: IdPlaneta) => void;
  aoPairar: (id: IdPlaneta | null, posicao?: { x: number; y: number }) => void;
  aoAlterarTransicao: (emTransicao: boolean) => void;
}

export class SistemaSolar {
  readonly #canvas: HTMLCanvasElement;
  readonly #movimentoReduzido: boolean;
  readonly #cena = new THREE.Scene();
  readonly #renderer: THREE.WebGLRenderer;
  readonly #camera: ControladorCamera;
  readonly #selecao: ControladorSelecao;
  readonly #texturas: GerenciadorTexturas;
  readonly #corpos = new Map<IdPlaneta, CorpoPlaneta>();
  readonly #orbitas = new THREE.Group();
  readonly #campoEstrelas: THREE.Group;
  readonly #sol: THREE.Mesh;
  readonly #temporizador = new THREE.Timer();
  #multiplicadorTempo: MultiplicadorTempo = 1;
  #quadroAnimacao: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    manager: THREE.LoadingManager,
    perfil: PerfilGrafico,
    movimentoReduzido: boolean,
    eventos: EventosSistemaSolar,
  ) {
    this.#canvas = canvas;
    this.#movimentoReduzido = movimentoReduzido;
    this.#texturas = new GerenciadorTexturas(manager, perfil);

    this.#renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: perfil === 'alto',
      powerPreference: perfil === 'alto' ? 'high-performance' : 'default',
      alpha: false,
    });
    this.#renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.#renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.#renderer.toneMappingExposure = 1.08;
    this.#renderer.setClearColor(CONFIGURACAO_CENA.corFundo, 1);
    this.#renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONFIGURACAO_CENA.limitePixelRatio[perfil]),
    );
    this.#renderer.shadowMap.enabled = perfil === 'alto';
    this.#renderer.shadowMap.type = THREE.PCFShadowMap;

    this.#camera = new ControladorCamera(canvas, movimentoReduzido, eventos.aoAlterarTransicao);
    this.#campoEstrelas = criarCampoDeEstrelas(CONFIGURACAO_CENA.quantidadeEstrelas[perfil]);
    this.#cena.add(this.#campoEstrelas);

    const segmentos = CONFIGURACAO_CENA.segmentosEsfera[perfil];
    const geometriaEsfera = new THREE.SphereGeometry(1, segmentos, segmentos / 2);
    this.#sol = this.#criarSol(geometriaEsfera);
    this.#cena.add(this.#sol, criarHaloSolar(CONFIGURACAO_CENA.raioSol));
    this.#configurarIluminacao();

    const objetosSelecionaveis: THREE.Object3D[] = [];

    for (const dados of PLANETAS) {
      const corpo = criarPlaneta(
        dados,
        geometriaEsfera,
        this.#texturas,
        this.#renderer.shadowMap.enabled,
      );
      this.#corpos.set(dados.id, corpo);
      this.#cena.add(corpo.grupoOrbital);
      objetosSelecionaveis.push(...corpo.objetosSelecionaveis);
      this.#orbitas.add(criarOrbita(dados.distanciaOrbitalVisual));
    }

    this.#orbitas.name = 'Trajetórias orbitais';
    this.#cena.add(this.#orbitas);

    this.#selecao = new ControladorSelecao(
      canvas,
      this.#camera.camera,
      objetosSelecionaveis,
      eventos.aoSelecionar,
      eventos.aoPairar,
    );

    this.#redimensionar();
    this.#temporizador.connect(document);
    window.addEventListener('resize', this.#redimensionar);
  }

  iniciar(): void {
    if (this.#quadroAnimacao !== null) {
      return;
    }

    this.#temporizador.reset();
    this.#quadroAnimacao = requestAnimationFrame(this.#animar);
  }

  apresentar(): void {
    if (this.#movimentoReduzido) {
      return;
    }

    this.#camera.camera.position.set(0, 62, 110);
    this.#camera.voltarParaVisaoGeral();
  }

  selecionarPlaneta(id: IdPlaneta): void {
    const corpo = this.#corpos.get(id);

    if (!corpo) {
      return;
    }

    this.#camera.focar(
      () => corpo.obterPosicaoMundo(),
      corpo.dados.aneis ? corpo.dados.raioVisual * corpo.dados.aneis.raioExterno : corpo.dados.raioVisual,
    );
  }

  voltarParaVisaoGeral(): void {
    this.#camera.voltarParaVisaoGeral();
  }

  definirMultiplicadorTempo(multiplicador: MultiplicadorTempo): void {
    this.#multiplicadorTempo = multiplicador;
  }

  definirOrbitasVisiveis(visiveis: boolean): void {
    this.#orbitas.visible = visiveis;
  }

  liberar(): void {
    if (this.#quadroAnimacao !== null) {
      cancelAnimationFrame(this.#quadroAnimacao);
    }
    window.removeEventListener('resize', this.#redimensionar);
    this.#selecao.liberar();
    this.#texturas.liberar();
    this.#temporizador.dispose();
    this.#renderer.dispose();
  }

  #criarSol(geometria: THREE.SphereGeometry): THREE.Mesh {
    const textura = this.#texturas.carregar('sol-2k.jpg', 'sol-1k.jpg');
    const material = new THREE.MeshBasicMaterial({
      map: textura,
      color: 0xffd07a,
    });
    const sol = new THREE.Mesh(geometria, material);
    sol.name = 'Sol';
    sol.scale.setScalar(CONFIGURACAO_CENA.raioSol);

    const corona = new THREE.Mesh(
      geometria,
      new THREE.MeshBasicMaterial({
        color: 0xff8a2a,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    corona.name = 'Corona solar';
    corona.scale.setScalar(1.055);
    sol.add(corona);

    return sol;
  }

  #configurarIluminacao(): void {
    const luzSolar = new THREE.PointLight(
      0xfff1cf,
      CONFIGURACAO_CENA.intensidadeLuzSolar,
      CONFIGURACAO_CENA.distanciaLuzSolar,
      1.55,
    );
    luzSolar.name = 'Luz do Sol';
    luzSolar.castShadow = this.#renderer.shadowMap.enabled;
    luzSolar.shadow.mapSize.set(512, 512);
    luzSolar.shadow.camera.near = 1;
    luzSolar.shadow.camera.far = 90;
    luzSolar.shadow.bias = -0.0005;
    this.#cena.add(luzSolar);

    const preenchimento = new THREE.AmbientLight(0x20385f, 0.065);
    preenchimento.name = 'Luz ambiente mínima';
    this.#cena.add(preenchimento);
  }

  #animar = (agoraMs: number): void => {
    this.#temporizador.update(agoraMs);
    const deltaTime = Math.min(this.#temporizador.getDelta(), 0.05);

    for (const corpo of this.#corpos.values()) {
      corpo.atualizar(deltaTime, this.#multiplicadorTempo);
    }

    this.#sol.rotation.y += calcularIncrementoAngular(0.035, deltaTime, this.#multiplicadorTempo);

    if (!this.#movimentoReduzido) {
      this.#campoEstrelas.rotation.y += deltaTime * 0.0008;
      this.#campoEstrelas.rotation.x = Math.sin(agoraMs * 0.00004) * 0.008;
    }

    this.#camera.atualizar(agoraMs);
    this.#renderer.render(this.#cena, this.#camera.camera);
    this.#quadroAnimacao = requestAnimationFrame(this.#animar);
  };

  #redimensionar = (): void => {
    const largura = this.#canvas.clientWidth || window.innerWidth;
    const altura = this.#canvas.clientHeight || window.innerHeight;
    this.#renderer.setSize(largura, altura, false);
    this.#camera.redimensionar(largura, altura);
  };
}
