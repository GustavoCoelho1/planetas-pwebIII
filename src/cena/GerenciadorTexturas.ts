import * as THREE from 'three';
import type { PerfilGrafico } from '../tipos';

export class GerenciadorTexturas {
  readonly #carregador: THREE.TextureLoader;
  readonly #cache = new Map<string, THREE.Texture>();
  readonly #perfil: PerfilGrafico;

  constructor(manager: THREE.LoadingManager, perfil: PerfilGrafico) {
    this.#carregador = new THREE.TextureLoader(manager);
    this.#perfil = perfil;
  }

  carregar(nomeAlta: string, nomeBaixa = nomeAlta, espacoCor = true): THREE.Texture {
    const nomeArquivo = this.#perfil === 'economico' ? nomeBaixa : nomeAlta;
    const existente = this.#cache.get(nomeArquivo);

    if (existente) {
      return existente;
    }

    const caminho = `${import.meta.env.BASE_URL}texturas/${nomeArquivo}`;
    const textura = this.#carregador.load(caminho);
    textura.colorSpace = espacoCor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    textura.anisotropy = this.#perfil === 'alto' ? 4 : 2;
    this.#cache.set(nomeArquivo, textura);

    return textura;
  }

  liberar(): void {
    this.#cache.forEach((textura) => textura.dispose());
    this.#cache.clear();
  }
}
