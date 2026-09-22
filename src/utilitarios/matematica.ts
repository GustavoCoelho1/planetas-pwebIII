export function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

export function suavizarPasso(progresso: number): number {
  const valor = limitar(progresso, 0, 1);
  return valor * valor * (3 - 2 * valor);
}

export function criarAleatorioDeterministico(sementeInicial: number): () => number {
  let semente = sementeInicial >>> 0;

  return () => {
    semente += 0x6d2b79f5;
    let valor = semente;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4_294_967_296;
  };
}
