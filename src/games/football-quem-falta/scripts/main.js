import { estado } from "./core.js";
import { carregarDados, sortear, normalizar } from "./data.js";
import {
    atualizarRodada,
    atualizarAcertos,
    configurarRodada,
    revelarResposta,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    resetarUI,
    getInput
} from "./ui.js";

// --- MOSTRAR RODADA ---
function mostrarRodada() {
    const desafio = estado.sorteados[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRodada = 2;
    estado.usouDica = false;
    configurarRodada(desafio);
}

// --- VERIFICAR PALPITE ---
function verificar() {
    const palpite = getInput();
    if (!palpite) {
        return;
    }

    const desafio = estado.sorteados[estado.rodadaAtual];
    const resposta = desafio.lista[desafio.escondido];

    if (normalizar(palpite) === normalizar(resposta)) {
        estado.acertos++;
        atualizarAcertos();
        revelarResposta(resposta);
        setTimeout(() => mostrarResultadoRodada(true, resposta), 800);
    } else {
        estado.tentativasRodada--;

        if (estado.tentativasRodada <= 0) {
            mostrarResultadoRodada(false, resposta);
        } else {
            mostrarFeedbackErro();
        }
    }
}

// --- PRÓXIMA RODADA ---
function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    resetarUI();
    sortear();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificar);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
    document.getElementById("btnHint").addEventListener("click", () => {
        document.getElementById("hintText").classList.remove("hidden");
        document.getElementById("btnHint").classList.add("used");
        estado.usouDica = true;
    });

    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            verificar();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-quem-falta";

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            tutorialOverlay.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(skipKey, "true");
            tutorialOverlay.classList.add("hidden");
            iniciarJogo();
        });
    }
}

init();
