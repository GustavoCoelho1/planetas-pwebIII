import * as THREE from 'three';
import { criarAleatorioDeterministico } from '../utilitarios/matematica';

function criarCamadaDeEstrelas(
  quantidade: number,
  raioMinimo: number,
  raioMaximo: number,
  tamanho: number,
  semente: number,
): THREE.Points {
  const aleatorio = criarAleatorioDeterministico(semente);
  const posicoes = new Float32Array(quantidade * 3);
  const cores = new Float32Array(quantidade * 3);
  const cor = new THREE.Color();

  for (let indice = 0; indice < quantidade; indice += 1) {
    const raio = THREE.MathUtils.lerp(raioMinimo, raioMaximo, aleatorio());
    const theta = aleatorio() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.lerp(-1, 1, aleatorio()));
    const base = indice * 3;

    posicoes[base] = raio * Math.sin(phi) * Math.cos(theta);
    posicoes[base + 1] = raio * Math.cos(phi);
    posicoes[base + 2] = raio * Math.sin(phi) * Math.sin(theta);

    const tom = aleatorio();
    cor.setHSL(THREE.MathUtils.lerp(0.54, 0.68, tom), 0.2, THREE.MathUtils.lerp(0.68, 1, aleatorio()));
    cores[base] = cor.r;
    cores[base + 1] = cor.g;
    cores[base + 2] = cor.b;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));

  const material = new THREE.PointsMaterial({
    size: tamanho,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometria, material);
}

export function criarCampoDeEstrelas(quantidade: number): THREE.Group {
  const grupo = new THREE.Group();
  grupo.name = 'Campo de estrelas';

  grupo.add(
    criarCamadaDeEstrelas(Math.round(quantidade * 0.78), 76, 118, 0.2, 1_992),
    criarCamadaDeEstrelas(Math.round(quantidade * 0.22), 108, 152, 0.42, 2_022),
  );

  return grupo;
}

export function criarOrbita(raio: number): THREE.LineLoop {
  const pontos: THREE.Vector3[] = [];
  const segmentos = 160;

  for (let indice = 0; indice < segmentos; indice += 1) {
    const angulo = (indice / segmentos) * Math.PI * 2;
    pontos.push(new THREE.Vector3(Math.cos(angulo) * raio, 0, Math.sin(angulo) * raio));
  }

  const geometria = new THREE.BufferGeometry().setFromPoints(pontos);
  const material = new THREE.LineBasicMaterial({
    color: 0x6f8db5,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const orbita = new THREE.LineLoop(geometria, material);
  orbita.name = `Órbita ${raio}`;

  return orbita;
}

function criarTexturaDeHalo(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const contexto = canvas.getContext('2d');

  if (!contexto) {
    throw new Error('Não foi possível criar a textura do halo solar.');
  }

  const gradiente = contexto.createRadialGradient(128, 128, 12, 128, 128, 126);
  gradiente.addColorStop(0, 'rgba(255, 245, 184, 1)');
  gradiente.addColorStop(0.18, 'rgba(255, 184, 72, 0.72)');
  gradiente.addColorStop(0.48, 'rgba(255, 115, 24, 0.22)');
  gradiente.addColorStop(1, 'rgba(255, 72, 0, 0)');
  contexto.fillStyle = gradiente;
  contexto.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

export function criarHaloSolar(raioSol: number): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: criarTexturaDeHalo(),
    color: 0xffc266,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Sprite(material);
  halo.name = 'Halo solar';
  halo.scale.setScalar(raioSol * 4.15);

  return halo;
}
