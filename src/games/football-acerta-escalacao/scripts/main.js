import { estado } from "./core.js";
import { carregarDados, escolherEscalacao } from "./data.js";
import {
    renderizarCampo,
    revelarJogador,
    revelarNaoAcertado,
    atualizarCronometro,
    atualizarAcertos,
    configurarSugestoesJogadores,
    focarCampoPalpite,
    mostrarResultadoFinal,
    reiniciarInterfaceJogo,
    mostrarSelecaoModoJogo,
    esconderSelecaoModoJogo,
    esconderCronometro
} from "./ui.js";

// --- NORMALIZA TEXTO PARA COMPARAÇÃO ---
function normalizarTexto(textoComparacao) {
    return textoComparacao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- VERIFICA O PALPITE ---
function verificarPalpite(nome) {
    if (!estado.jogoAtivo) {
        return;
    }

    const indiceJogador = estado.escalacaoAtual.jogadores.findIndex(jogadorEscalacao => {
        const nomeCorresponde = normalizarTexto(jogadorEscalacao.nome) === normalizarTexto(nome);
        const jaRevelado = !estado.jogadoresRestantes.some(jogadorRestante => normalizarTexto(jogadorRestante.nome) === normalizarTexto(jogadorEscalacao.nome));
        return nomeCorresponde && !jaRevelado;
    });

    if (indiceJogador === -1) {
        return;
    }

    const jogador = estado.escalacaoAtual.jogadores[indiceJogador];
    estado.jogadoresRestantes = estado.jogadoresRestantes.filter(
        jogadorRestante => normalizarTexto(jogadorRestante.nome) !== normalizarTexto(jogador.nome)
    );
    estado.acertos++;
    atualizarAcertos();
    revelarJogador(indiceJogador, jogador.nome);

    if (estado.acertos >= 11) {
        finalizarJogo();
    }

    focarCampoPalpite();
}

// --- FINALIZA A PARTIDA ---
function finalizarJogo() {
    estado.jogoAtivo = false;
    clearInterval(estado.identificadorIntervaloCronometro);

    estado.escalacaoAtual.jogadores.forEach((jogadorEscalacao, indiceJogador) => {
        const posicaoJogador = document.getElementById(`slot-${indiceJogador}`);
        if (posicaoJogador && !posicaoJogador.classList.contains("revealed")) {
            revelarNaoAcertado(indiceJogador, jogadorEscalacao.nome);
        }
    });

    setTimeout(() => {
        mostrarResultadoFinal();
        if (window.FG11Stats) {
            const venceu = estado.acertos >= 11;
            const rotulos = Array.from({ length: 12 }, (valorNaoUtilizado, indicePontuacao) => String(indicePontuacao));
            window.FG11Stats.registrar("football-acerta-escalacao", {
                venceu,
                bucket: estado.acertos,
                tamanho: 12
            });
            
            window.FG11Stats.mostrarModal("football-acerta-escalacao", {
                venceu,
                titulo: venceu ? "Escalação completa!" : "Fim de jogo!",
                resposta: `Você acertou ${estado.acertos} de 11 jogadores`,
                tamanho: 12,
                rotulos,
                tituloGrafico: "Jogadores acertados por partida",
                bucketAtual: estado.acertos,
                onReiniciar: iniciarJogo,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }
    }, 1500);
}

// --- INICIA O CRONÔMETRO ---
function iniciarCronometro() {
    estado.tempoRestante = 300;
    atualizarCronometro();

    estado.identificadorIntervaloCronometro = setInterval(() => {
        estado.tempoRestante--;
        atualizarCronometro();

        if (estado.tempoRestante <= 0) {
            finalizarJogo();
        }
    }, 1000);
}

// --- INICIA UMA NOVA PARTIDA ---
function iniciarJogo() {
    reiniciarInterfaceJogo();
    esconderSelecaoModoJogo();
    estado.acertos = 0;
    estado.jogoAtivo = true;
    atualizarAcertos();

    estado.escalacaoAtual = escolherEscalacao();
    estado.jogadoresRestantes = [...estado.escalacaoAtual.jogadores];

    const nomesEscalacao = estado.escalacaoAtual.jogadores.map(jogadorEscalacao => jogadorEscalacao.nome);
    const extras = estado.escalacaoAtual.extras || [];
    const nomesSugestoes = [...nomesEscalacao, ...extras];

    configurarSugestoesJogadores(nomesSugestoes, verificarPalpite);
    renderizarCampo(estado.escalacaoAtual);

    if (estado.modoComTempo) {
        iniciarCronometro();
    } else {
        esconderCronometro();
    }

    focarCampoPalpite();
}

// --- SELECIONA O MODO E INICIA ---
function selecionarModo(comTempo) {
    estado.modoComTempo = comTempo;
    iniciarJogo();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoAcertaEscalacao() {
    await carregarDados();

    document.getElementById("btnSelecionarModoSemTempo").addEventListener("click", () => selecionarModo(false));
    document.getElementById("btnSelecionarModoComTempo").addEventListener("click", () => selecionarModo(true));

    document.getElementById("btnDesistirPartida").addEventListener("click", finalizarJogo);
    document.getElementById("btnReiniciarPartida").addEventListener("click", () => mostrarSelecaoModoJogo());
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const gameKey = tutorialOverlay?.dataset.game;
    const skipKey = gameKey ? `tutorial_skip_${gameKey}` : null;

    if (skipKey && localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        mostrarSelecaoModoJogo();
    } else if (tutorialOverlay) {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            tutorialOverlay.classList.add("hidden");
            mostrarSelecaoModoJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            if (skipKey) {
                localStorage.setItem(skipKey, "true");
            }
            tutorialOverlay.classList.add("hidden");
            mostrarSelecaoModoJogo();
        });
    } else {
        mostrarSelecaoModoJogo();
    }
}

inicializarJogoAcertaEscalacao();
