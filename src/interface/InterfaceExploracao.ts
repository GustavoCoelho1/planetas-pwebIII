import { PLANETAS, PLANETAS_POR_ID, obterPlaneta } from '../dados/planetas';
import type { EstadoDaSimulacao, IdPlaneta, MultiplicadorTempo } from '../tipos';

interface AcoesInterface {
  aoSelecionar: (id: IdPlaneta) => void;
  aoVoltar: () => void;
  aoAlterarVelocidade: (multiplicador: MultiplicadorTempo) => void;
  aoAlterarOrbitas: (visiveis: boolean) => void;
  aoResetarCamera: () => void;
}

const FORMATADOR_NUMEROS = new Intl.NumberFormat('pt-BR');
const SEQUENCIA_EASTER_EGG: readonly IdPlaneta[] = ['terra', 'jupiter', 'marte', 'urano'];

function obterElemento<T extends HTMLElement>(seletor: string): T {
  const elemento = document.querySelector<T>(seletor);

  if (!elemento) {
    throw new Error(`Elemento obrigatório não encontrado: ${seletor}`);
  }

  return elemento;
}

export class InterfaceExploracao {
  readonly #acoes: AcoesInterface;
  readonly #estado: EstadoDaSimulacao;
  readonly #carregamento = obterElemento<HTMLDivElement>('#carregamento');
  readonly #barraCarregamento = obterElemento<HTMLSpanElement>('#barra-carregamento');
  readonly #porcentagemCarregamento = obterElemento<HTMLSpanElement>('#porcentagem-carregamento');
  readonly #progressoCarregamento = obterElemento<HTMLDivElement>('[role="progressbar"]');
  readonly #orientacao = obterElemento<HTMLElement>('#orientacao');
  readonly #listaPlanetas = obterElemento<HTMLDivElement>('#lista-planetas');
  readonly #painel = obterElemento<HTMLElement>('#painel-planeta');
  readonly #botaoPausa = obterElemento<HTMLButtonElement>('#alternar-pausa');
  readonly #seletorVelocidade = obterElemento<HTMLSelectElement>('#velocidade');
  readonly #botaoOrbitas = obterElemento<HTMLButtonElement>('#alternar-orbitas');
  readonly #botaoInformacoes = obterElemento<HTMLButtonElement>('#alternar-informacoes');
  readonly #rotuloHover = obterElemento<HTMLDivElement>('#rotulo-hover');
  readonly #notificacao = obterElemento<HTMLDivElement>('#notificacao');
  readonly #anuncio = obterElemento<HTMLParagraphElement>('#anuncio');
  readonly #fallback = obterElemento<HTMLElement>('#fallback-webgl');
  #temporizadorOrientacao: number | null = null;
  #temporizadorNotificacao: number | null = null;
  #progressoEasterEgg = 0;

  constructor(acoes: AcoesInterface, movimentoReduzido: boolean) {
    this.#acoes = acoes;
    this.#estado = {
      planetaSelecionado: null,
      multiplicadorTempo: movimentoReduzido ? 0 : 1,
      multiplicadorAnterior: 1,
      orbitasVisiveis: true,
      informacoesVisiveis: true,
      emTransicao: false,
    };

    this.#criarNavegacao();
    this.#configurarEventos();
    this.#atualizarControleDeTempo();

    this.#temporizadorOrientacao = window.setTimeout(() => this.#ocultarOrientacao(), 8_000);
  }

  get multiplicadorTempo(): MultiplicadorTempo {
    return this.#estado.multiplicadorTempo;
  }

  atualizarCarregamento(carregados: number, total: number): void {
    const progresso = total > 0 ? Math.round((carregados / total) * 100) : 0;
    this.#barraCarregamento.style.width = `${progresso}%`;
    this.#porcentagemCarregamento.textContent = `${progresso}%`;
    this.#progressoCarregamento.setAttribute('aria-valuenow', String(progresso));
  }

  concluirCarregamento(): void {
    this.atualizarCarregamento(1, 1);
    document.body.classList.add('experiencia-pronta');
    window.setTimeout(() => {
      this.#carregamento.hidden = true;
    }, 850);
  }

  avisarFalhaDeAsset(): void {
    this.exibirNotificacao('Alguns detalhes visuais não foram carregados; a exploração continuará.');
  }

  mostrarFallbackWebGL(): void {
    this.#carregamento.hidden = true;
    this.#fallback.hidden = false;
    document.body.classList.add('modo-fallback', 'experiencia-pronta');
    this.#anuncio.textContent = 'A visualização tridimensional não está disponível neste navegador.';
  }

  selecionarPlaneta(id: IdPlaneta): void {
    const planeta = obterPlaneta(id);
    this.#estado.planetaSelecionado = id;
    this.#estado.informacoesVisiveis = true;
    this.#painel.setAttribute('aria-hidden', 'false');
    this.#painel.classList.add('painel-planeta--visivel');
    this.#painel.classList.remove('painel-planeta--oculto');
    this.#botaoInformacoes.disabled = false;
    this.#botaoInformacoes.setAttribute('aria-pressed', 'true');
    document.body.classList.add('planeta-selecionado');

    obterElemento('#planeta-ordem').textContent = `${PLANETAS.findIndex((item) => item.id === id) + 1}º planeta a partir do Sol`;
    obterElemento('#planeta-nome').textContent = planeta.nome;
    obterElemento('#planeta-tipo').textContent = planeta.tipo;
    obterElemento('#planeta-descricao').textContent = planeta.descricao;
    obterElemento('#planeta-diametro').textContent = `${FORMATADOR_NUMEROS.format(planeta.diametroKm)} km`;
    obterElemento('#planeta-distancia').textContent = this.#formatarDistancia(planeta.distanciaMediaSolKm);
    obterElemento('#planeta-gravidade').textContent = `${FORMATADOR_NUMEROS.format(planeta.gravidadeMs2)} m/s²`;
    obterElemento('#planeta-temperatura').textContent = `${planeta.temperaturaMediaC} °C`;
    obterElemento('#planeta-dia').textContent = planeta.duracaoDia;
    obterElemento('#planeta-ano').textContent = planeta.duracaoAno;
    obterElemento('#planeta-luas').textContent = String(planeta.numeroDeLuas);
    obterElemento('#planeta-curiosidade').textContent = planeta.curiosidade;

    const fonte = obterElemento<HTMLAnchorElement>('#planeta-fonte');
    fonte.href = planeta.fonte;
    document.documentElement.style.setProperty('--cor-planeta', planeta.corDestaque);

    this.#listaPlanetas.querySelectorAll<HTMLButtonElement>('button').forEach((botao) => {
      const ativo = botao.dataset.planeta === id;
      botao.classList.toggle('navegacao-planetas__item--ativo', ativo);
      if (ativo) {
        botao.setAttribute('aria-current', 'true');
      } else {
        botao.removeAttribute('aria-current');
      }
    });

    this.#anuncio.textContent = `${planeta.nome} selecionado. ${planeta.descricao}`;
    this.#ocultarOrientacao();
    this.#verificarEasterEgg(id);
  }

  voltarParaVisaoGeral(): void {
    this.#estado.planetaSelecionado = null;
    this.#painel.setAttribute('aria-hidden', 'true');
    this.#painel.classList.remove('painel-planeta--visivel', 'painel-planeta--oculto');
    this.#botaoInformacoes.disabled = true;
    document.body.classList.remove('planeta-selecionado');
    document.documentElement.style.removeProperty('--cor-planeta');
    this.#listaPlanetas.querySelectorAll('button').forEach((botao) => {
      botao.classList.remove('navegacao-planetas__item--ativo');
      botao.removeAttribute('aria-current');
    });
    this.#anuncio.textContent = 'Visão geral do Sistema Solar.';
    this.ocultarRotuloHover();
  }

  definirEstadoDeTransicao(emTransicao: boolean): void {
    this.#estado.emTransicao = emTransicao;
    document.body.classList.toggle('camera-em-transicao', emTransicao);
  }

  mostrarRotuloHover(id: IdPlaneta | null, posicao?: { x: number; y: number }): void {
    if (!id || !posicao) {
      this.ocultarRotuloHover();
      return;
    }

    const planeta = PLANETAS_POR_ID.get(id);

    if (!planeta) {
      return;
    }

    this.#rotuloHover.textContent = planeta.nome;
    this.#rotuloHover.style.transform = `translate3d(${posicao.x + 16}px, ${posicao.y + 16}px, 0)`;
    this.#rotuloHover.classList.add('rotulo-hover--visivel');
    document.body.classList.add('planeta-sob-ponteiro');
  }

  ocultarRotuloHover(): void {
    this.#rotuloHover.classList.remove('rotulo-hover--visivel');
    document.body.classList.remove('planeta-sob-ponteiro');
  }

  exibirNotificacao(mensagem: string): void {
    if (this.#temporizadorNotificacao !== null) {
      window.clearTimeout(this.#temporizadorNotificacao);
    }

    this.#notificacao.textContent = mensagem;
    this.#notificacao.classList.add('notificacao--visivel');
    this.#temporizadorNotificacao = window.setTimeout(() => {
      this.#notificacao.classList.remove('notificacao--visivel');
    }, 3_800);
  }

  #criarNavegacao(): void {
    for (const planeta of PLANETAS) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'navegacao-planetas__item';
      botao.dataset.planeta = planeta.id;
      botao.textContent = planeta.nome;
      botao.addEventListener('click', () => this.#acoes.aoSelecionar(planeta.id));
      this.#listaPlanetas.append(botao);
    }
  }

  #configurarEventos(): void {
    obterElemento<HTMLButtonElement>('#voltar-visao-geral').addEventListener('click', this.#acoes.aoVoltar);
    obterElemento<HTMLButtonElement>('#resetar-camera').addEventListener('click', this.#acoes.aoResetarCamera);
    obterElemento<HTMLButtonElement>('#marca').addEventListener('click', this.#acoes.aoVoltar);

    this.#botaoPausa.addEventListener('click', () => {
      if (this.#estado.multiplicadorTempo === 0) {
        this.#estado.multiplicadorTempo = this.#estado.multiplicadorAnterior;
      } else {
        this.#estado.multiplicadorAnterior = this.#estado.multiplicadorTempo;
        this.#estado.multiplicadorTempo = 0;
      }

      this.#atualizarControleDeTempo();
      this.#acoes.aoAlterarVelocidade(this.#estado.multiplicadorTempo);
      this.#ocultarOrientacao();
    });

    this.#seletorVelocidade.addEventListener('change', () => {
      const valor = Number(this.#seletorVelocidade.value) as MultiplicadorTempo;
      this.#estado.multiplicadorTempo = valor;
      this.#estado.multiplicadorAnterior = valor as Exclude<MultiplicadorTempo, 0>;
      this.#atualizarControleDeTempo();
      this.#acoes.aoAlterarVelocidade(valor);
      this.#ocultarOrientacao();
    });

    this.#botaoOrbitas.addEventListener('click', () => {
      this.#estado.orbitasVisiveis = !this.#estado.orbitasVisiveis;
      this.#botaoOrbitas.setAttribute('aria-pressed', String(this.#estado.orbitasVisiveis));
      this.#acoes.aoAlterarOrbitas(this.#estado.orbitasVisiveis);
    });

    this.#botaoInformacoes.addEventListener('click', () => {
      this.#estado.informacoesVisiveis = !this.#estado.informacoesVisiveis;
      this.#botaoInformacoes.setAttribute('aria-pressed', String(this.#estado.informacoesVisiveis));
      this.#painel.classList.toggle('painel-planeta--oculto', !this.#estado.informacoesVisiveis);
      this.#painel.setAttribute('aria-hidden', String(!this.#estado.informacoesVisiveis));
    });

    window.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && this.#estado.planetaSelecionado) {
        this.#acoes.aoVoltar();
      }
    });
  }

  #atualizarControleDeTempo(): void {
    const pausado = this.#estado.multiplicadorTempo === 0;
    this.#botaoPausa.setAttribute('aria-pressed', String(pausado));
    this.#botaoPausa.classList.toggle('controle--ativo', pausado);
    this.#botaoPausa.querySelector('.sr-only')!.textContent = pausado
      ? 'Retomar simulação'
      : 'Pausar simulação';
    this.#botaoPausa.querySelector('.icone-pausa')?.classList.toggle('icone-pausa--reproduzir', pausado);

    if (!pausado) {
      this.#seletorVelocidade.value = String(this.#estado.multiplicadorTempo);
    }
  }

  #ocultarOrientacao(): void {
    if (this.#temporizadorOrientacao !== null) {
      window.clearTimeout(this.#temporizadorOrientacao);
      this.#temporizadorOrientacao = null;
    }
    this.#orientacao.classList.add('orientacao--oculta');
  }

  #formatarDistancia(valorKm: number): string {
    if (valorKm >= 1_000_000_000) {
      return `${FORMATADOR_NUMEROS.format(valorKm / 1_000_000_000)} bilhões km`;
    }

    return `${FORMATADOR_NUMEROS.format(valorKm / 1_000_000)} milhões km`;
  }

  #verificarEasterEgg(id: IdPlaneta): void {
    const esperado = SEQUENCIA_EASTER_EGG[this.#progressoEasterEgg];

    if (id === esperado) {
      this.#progressoEasterEgg += 1;
    } else {
      this.#progressoEasterEgg = id === SEQUENCIA_EASTER_EGG[0] ? 1 : 0;
    }

    if (this.#progressoEasterEgg === SEQUENCIA_EASTER_EGG.length) {
      this.#progressoEasterEgg = 0;
      this.exibirNotificacao('Exploração iniciada em 2022 · O mesmo universo, visto de um novo jeito.');
    }
  }
}
