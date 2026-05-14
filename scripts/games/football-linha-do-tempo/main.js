import { estado } from './core.js';
import { carregarDados, sortear, embaralhar } from './data.js';
import {
    renderizarLista,
    atualizarRodada,
    atualizarTema,
    atualizarPontos,
    mostrarTimelineCard,
    mostrarRoundResult,
    mostrarFinal,
    resetarUI
} from './ui.js';

function mostrarRodada() {
    const rodada = estado.sorteadas[estado.rodadaAtual];
    atualizarRodada();
    atualizarTema(rodada.tema);
    estado.ordemAtual = embaralhar(rodada.eventos);
    mostrarTimelineCard();
    renderizarLista();
}

function confirmar() {
    const rodada = estado.sorteadas[estado.rodadaAtual];
    const ordemCorreta = [...rodada.eventos].sort((a, b) => a.ano - b.ano);

    let corretos = 0;
    estado.ordemAtual.forEach((evento, idx) => {
        if (evento.ano === ordemCorreta[idx].ano) {
            corretos++;
        }
    });

    estado.pontos += corretos;
    atualizarPontos();
    mostrarRoundResult(corretos, ordemCorreta);
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
    estado.pontos = 0;
    resetarUI();
    sortear();
    mostrarRodada();
}

async function init() {
    await carregarDados();

    document.getElementById('btnConfirmar').addEventListener('click', confirmar);
    document.getElementById('btnNext').addEventListener('click', proxima);
    document.getElementById('btnRetry').addEventListener('click', iniciarJogo);
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipKey = 'tutorial_skip_football-linha-do-tempo';

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
