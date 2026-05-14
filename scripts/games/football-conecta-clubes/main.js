import { estado } from './core.js';
import { carregarDados, sortear, normalizar } from './data.js';
import {
    atualizarRodada,
    atualizarAcertos,
    configurarRodada,
    atualizarTentativas,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    resetarUI,
    getInput
} from './ui.js';

function mostrarRodada() {
    const conexao = estado.sorteadas[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRestantes = 3;
    configurarRodada(conexao);
}

function verificarPalpite() {
    const palpite = getInput();
    if (!palpite) return;

    const conexao = estado.sorteadas[estado.rodadaAtual];
    const acertou = conexao.respostas.some(r => normalizar(r) === normalizar(palpite));

    if (acertou) {
        estado.acertos++;
        atualizarAcertos();
        mostrarResultadoRodada(true, palpite, conexao);
    } else {
        estado.tentativasRestantes--;
        atualizarTentativas();

        if (estado.tentativasRestantes <= 0) {
            mostrarResultadoRodada(false, null, conexao);
        } else {
            mostrarFeedbackErro(palpite);
        }
    }
}

function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    resetarUI();
    sortear();
    mostrarRodada();
}

async function init() {
    await carregarDados();

    document.getElementById('btnGuess').addEventListener('click', verificarPalpite);
    document.getElementById('btnNext').addEventListener('click', proxima);
    document.getElementById('btnRetry').addEventListener('click', iniciarJogo);
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    document.getElementById('guessInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verificarPalpite();
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipKey = 'tutorial_skip_football-conecta-clubes';

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add('hidden');
        iniciarJogo();
    } else {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            iniciarJogo();
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            localStorage.setItem(skipKey, 'true');
            tutorialOverlay.classList.add('hidden');
            iniciarJogo();
        });
    }
}

init();
