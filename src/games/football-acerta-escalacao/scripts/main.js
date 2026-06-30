import { estado } from "./core.js";
import { carregarDados, escolherEscalacao } from "./data.js";
import {
    renderizarCampo,
    revelarJogador,
    revelarNaoAcertado,
    atualizarTimer,
    atualizarAcertos,
    configurarAutocomplete,
    focarInput,
    mostrarResultadoFinal,
    resetarUI,
    mostrarModeSelect,
    esconderModeSelect,
    esconderTimer
} from "./ui.js";

// --- NORMALIZA TEXTO PARA COMPARAÇÃO ---
function normalizarTexto(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- VERIFICA O PALPITE ---
function verificarPalpite(nome) {
    if (!estado.jogoAtivo) {
        return;
    }

    const idx = estado.escalacaoAtual.jogadores.findIndex((j, i) => {
        const match = normalizarTexto(j.nome) === normalizarTexto(nome);
        const jaRevelado = !estado.jogadoresRestantes.some(r => normalizarTexto(r.nome) === normalizarTexto(j.nome));
        return match && !jaRevelado;
    });

    if (idx === -1) {
        return;
    }

    const jogador = estado.escalacaoAtual.jogadores[idx];
    estado.jogadoresRestantes = estado.jogadoresRestantes.filter(
        j => normalizarTexto(j.nome) !== normalizarTexto(jogador.nome)
    );
    estado.acertos++;
    atualizarAcertos();
    revelarJogador(idx, jogador.nome);

    if (estado.acertos >= 11) {
        finalizarJogo();
    }

    focarInput();
}

// --- FINALIZA A PARTIDA ---
function finalizarJogo() {
    estado.jogoAtivo = false;
    clearInterval(estado.timerInterval);

    estado.escalacaoAtual.jogadores.forEach((j, idx) => {
        const slot = document.getElementById(`slot-${idx}`);
        if (slot && !slot.classList.contains("revealed")) {
            revelarNaoAcertado(idx, j.nome);
        }
    });

    setTimeout(() => mostrarResultadoFinal(), 1500);
}

// --- INICIA O CRONÔMETRO ---
function iniciarTimer() {
    estado.tempoRestante = 300;
    atualizarTimer();

    estado.timerInterval = setInterval(() => {
        estado.tempoRestante--;
        atualizarTimer();

        if (estado.tempoRestante <= 0) {
            finalizarJogo();
        }
    }, 1000);
}

// --- INICIA UMA NOVA PARTIDA ---
function iniciarJogo() {
    resetarUI();
    esconderModeSelect();
    estado.acertos = 0;
    estado.jogoAtivo = true;
    atualizarAcertos();

    estado.escalacaoAtual = escolherEscalacao();
    estado.jogadoresRestantes = [...estado.escalacaoAtual.jogadores];

    const nomesEscalacao = estado.escalacaoAtual.jogadores.map(j => j.nome);
    const extras = estado.escalacaoAtual.extras || [];
    const nomesAutocomplete = [...nomesEscalacao, ...extras];

    configurarAutocomplete(nomesAutocomplete, verificarPalpite);
    renderizarCampo(estado.escalacaoAtual);

    if (estado.modoComTempo) {
        iniciarTimer();
    } else {
        esconderTimer();
    }

    focarInput();
}

// --- SELECIONA O MODO E INICIA ---
function selecionarModo(comTempo) {
    estado.modoComTempo = comTempo;
    iniciarJogo();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById("btnModeSemTempo").addEventListener("click", () => selecionarModo(false));
    document.getElementById("btnModeComTempo").addEventListener("click", () => selecionarModo(true));

    document.getElementById("btnGiveUp").addEventListener("click", finalizarJogo);
    document.getElementById("btnRetry").addEventListener("click", () => mostrarModeSelect());
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const gameKey = tutorialOverlay?.dataset.game;
    const skipKey = gameKey ? `tutorial_skip_${gameKey}` : null;

    if (skipKey && localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        mostrarModeSelect();
    } else if (tutorialOverlay) {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            tutorialOverlay.classList.add("hidden");
            mostrarModeSelect();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            if (skipKey) {
                localStorage.setItem(skipKey, "true");
            }
            tutorialOverlay.classList.add("hidden");
            mostrarModeSelect();
        });
    } else {
        mostrarModeSelect();
    }
}

init();
