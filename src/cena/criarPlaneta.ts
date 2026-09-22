import * as THREE from 'three';
import type { DadosPlaneta, IdPlaneta } from '../tipos';
import { calcularIncrementoAngular } from '../utilitarios/simulacao';
import type { MultiplicadorTempo } from '../tipos';
import { GerenciadorTexturas } from './GerenciadorTexturas';

export interface CorpoPlaneta {
  dados: DadosPlaneta;
  grupoOrbital: THREE.Group;
  suporte: THREE.Group;
  malha: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  objetosSelecionaveis: THREE.Object3D[];
  atualizar: (deltaTime: number, multiplicador: MultiplicadorTempo) => void;
  obterPosicaoMundo: (alvo?: THREE.Vector3) => THREE.Vector3;
}

function prepararAnelParaTexturaRadial(
  geometria: THREE.RingGeometry,
  raioInterno: number,
  raioExterno: number,
): void {
  const posicoes = geometria.getAttribute('position');
  const uvs = geometria.getAttribute('uv');

  for (let indice = 0; indice < posicoes.count; indice += 1) {
    const x = posicoes.getX(indice);
    const y = posicoes.getY(indice);
    const distancia = Math.sqrt(x * x + y * y);
    const coordenadaRadial = (distancia - raioInterno) / (raioExterno - raioInterno);
    uvs.setXY(indice, coordenadaRadial, 0.5);
  }

  uvs.needsUpdate = true;
}

function identificarObjeto(objeto: THREE.Object3D, id: IdPlaneta): void {
  objeto.userData.idPlaneta = id;
}

export function criarPlaneta(
  dados: DadosPlaneta,
  geometriaEsfera: THREE.SphereGeometry,
  texturas: GerenciadorTexturas,
  sombrasAtivas: boolean,
): CorpoPlaneta {
  const grupoOrbital = new THREE.Group();
  grupoOrbital.name = `Órbita de ${dados.nome}`;
  grupoOrbital.rotation.y = dados.faseInicial;

  const suporte = new THREE.Group();
  suporte.name = `Posição de ${dados.nome}`;
  suporte.position.x = dados.distanciaOrbitalVisual;
  grupoOrbital.add(suporte);

  const grupoInclinacao = new THREE.Group();
  grupoInclinacao.rotation.z = THREE.MathUtils.degToRad(dados.inclinacaoAxialGraus);
  suporte.add(grupoInclinacao);

  const texturaPrincipal = texturas.carregar(dados.texturaAlta, dados.texturaBaixa);
  const material = new THREE.MeshStandardMaterial({
    map: texturaPrincipal,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0,
  });
  const malha = new THREE.Mesh(geometriaEsfera, material);
  malha.name = dados.nome;
  malha.scale.setScalar(dados.raioVisual);
  malha.castShadow = sombrasAtivas;
  malha.receiveShadow = sombrasAtivas;
  identificarObjeto(malha, dados.id);
  grupoInclinacao.add(malha);

  const objetosSelecionaveis: THREE.Object3D[] = [malha];
  let nuvens: THREE.Mesh | undefined;
  let grupoLua: THREE.Group | undefined;
  let lua: THREE.Mesh | undefined;

  if (dados.atmosfera) {
    const materialAtmosfera = new THREE.MeshBasicMaterial({
      color: dados.atmosfera.cor,
      transparent: true,
      opacity: dados.atmosfera.opacidade,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmosfera = new THREE.Mesh(geometriaEsfera, materialAtmosfera);
    atmosfera.name = `Atmosfera de ${dados.nome}`;
    atmosfera.scale.setScalar(dados.raioVisual * dados.atmosfera.escala);
    grupoInclinacao.add(atmosfera);
  }

  if (dados.nuvens) {
    const texturaNuvens = texturas.carregar(dados.nuvens.texturaAlta, dados.nuvens.texturaBaixa);
    const materialNuvens = new THREE.MeshStandardMaterial({
      map: texturaNuvens,
      alphaMap: texturaNuvens,
      transparent: true,
      opacity: 0.52,
      roughness: 1,
      depthWrite: false,
    });
    nuvens = new THREE.Mesh(geometriaEsfera, materialNuvens);
    nuvens.name = 'Nuvens da Terra';
    nuvens.scale.setScalar(dados.raioVisual * 1.018);
    grupoInclinacao.add(nuvens);
  }

  if (dados.aneis) {
    const raioInterno = dados.raioVisual * dados.aneis.raioInterno;
    const raioExterno = dados.raioVisual * dados.aneis.raioExterno;
    const geometriaAneis = new THREE.RingGeometry(raioInterno, raioExterno, 160);
    prepararAnelParaTexturaRadial(geometriaAneis, raioInterno, raioExterno);
    const texturaAneis = texturas.carregar(dados.aneis.textura, dados.aneis.textura);
    const materialAneis = new THREE.MeshStandardMaterial({
      map: texturaAneis,
      alphaMap: texturaAneis,
      color: 0xffffff,
      transparent: true,
      opacity: dados.aneis.opacidade,
      roughness: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const aneis = new THREE.Mesh(geometriaAneis, materialAneis);
    aneis.name = 'Anéis de Saturno';
    aneis.rotation.x = Math.PI / 2;
    aneis.castShadow = sombrasAtivas;
    identificarObjeto(aneis, dados.id);
    grupoInclinacao.add(aneis);
    objetosSelecionaveis.push(aneis);
  }

  if (dados.lua) {
    grupoLua = new THREE.Group();
    grupoLua.name = 'Órbita da Lua';
    grupoLua.rotation.y = 1.1;
    suporte.add(grupoLua);

    const materialLua = new THREE.MeshStandardMaterial({
      map: texturas.carregar(dados.lua.texturaAlta, dados.lua.texturaBaixa),
      color: 0xbfc2c5,
      roughness: 1,
    });
    lua = new THREE.Mesh(geometriaEsfera, materialLua);
    lua.name = 'Lua';
    lua.position.x = dados.lua.distanciaOrbital;
    lua.scale.setScalar(dados.lua.raioVisual);
    lua.castShadow = sombrasAtivas;
    lua.receiveShadow = sombrasAtivas;
    grupoLua.add(lua);
  }

  return {
    dados,
    grupoOrbital,
    suporte,
    malha,
    objetosSelecionaveis,
    atualizar(deltaTime, multiplicador) {
      grupoOrbital.rotation.y += calcularIncrementoAngular(dados.velocidadeOrbital, deltaTime, multiplicador);
      malha.rotation.y += calcularIncrementoAngular(dados.velocidadeRotacao, deltaTime, multiplicador);

      if (nuvens && dados.nuvens) {
        nuvens.rotation.y += calcularIncrementoAngular(
          dados.nuvens.velocidadeRotacao,
          deltaTime,
          multiplicador,
        );
      }

      if (grupoLua && lua && dados.lua) {
        grupoLua.rotation.y += calcularIncrementoAngular(
          dados.lua.velocidadeOrbital,
          deltaTime,
          multiplicador,
        );
        lua.rotation.y += calcularIncrementoAngular(0.18, deltaTime, multiplicador);
      }
    },
    obterPosicaoMundo(alvo = new THREE.Vector3()) {
      return malha.getWorldPosition(alvo);
    },
  };
}
