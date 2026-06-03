import { estado } from './core.js';
import { carregarDados, sortear, normalizar } from './data.js';
import {
    iniciarBlur,
    pararBlur,
    revelarFoto,
    atualizarRodada,
    atualizarPontos,
    configurarRodada,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    resetarUI,
    getInput,
    limparInput
} from './ui.js';

// --- CALCULAR PONTOS ---
function calcularPontos() {
    const ratio = 1 - (estado.tempoPassado / estado.tempoMax);
    return Math.max(1, Math.round(ratio * 10));
}

// --- MOSTRAR RODADA ATUAL ---
function mostrarRodada() {
    const jogador = estado.sorteados[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRodada = 2;
    configurarRodada(jogador);
    iniciarBlur();
}

// --- VERIFICAR PALPITE ---
function verificar() {
    const palpite = getInput();
    if (!palpite) {
        return;
    }

    const jogador = estado.sorteados[estado.rodadaAtual];
    const acertou = normalizar(palpite) === normalizar(jogador.nome) ||
                    normalizar(palpite).includes(normalizar(jogador.nome)) ||
                    normalizar(jogador.nome).includes(normalizar(palpite));

    if (acertou) {
        pararBlur();
        const pts = calcularPontos();
        estado.pontos += pts;
        atualizarPontos();
        revelarFoto();
        setTimeout(() => mostrarResultadoRodada(true, jogador, pts), 500);
    } else {
        estado.tentativasRodada--;
        limparInput();

        if (estado.tentativasRodada <= 0) {
            pararBlur();
            revelarFoto();
            setTimeout(() => mostrarResultadoRodada(false, jogador, 0), 500);
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
    estado.pontos = 0;
    resetarUI();
    sortear();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById('btnGuess').addEventListener('click', verificar);
    document.getElementById('btnNext').addEventListener('click', proxima);
    document.getElementById('btnRetry').addEventListener('click', iniciarJogo);
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    document.getElementById('btnHint').addEventListener('click', () => {
        document.getElementById('hintText').classList.remove('hidden');
        document.getElementById('btnHint').classList.add('used');
    });

    document.getElementById('guessInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            verificar();
        }
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipKey = 'tutorial_skip_football-foto-borrada';

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
