import estado from './core.js';
import { carregarDados, escolherGol, verificarResposta } from './data.js';
import {
    mostrarModeSelect,
    esconderModeSelect,
    atualizarRodada,
    mostrarGol,
    revelarDica,
    mostrarResultadoRodada,
    esconderResultadoRodada,
    mostrarFinal,
    configurarAutocomplete,
    focarInput
} from './ui.js';

function calcularPontos() {
    return Math.max(1, 4 - estado.dicasReveladas);
}

function tentarResposta(palpite) {
    if (!estado.jogoAtivo) return;

    estado.jogoAtivo = false;

    const acertou = verificarResposta(palpite, estado.golAtual);

    if (acertou) {
        const pts = calcularPontos();
        estado.pontos += pts;
        mostrarResultadoRodada(true, estado.golAtual.resposta, pts);
    } else {
        mostrarResultadoRodada(false, estado.golAtual.resposta, 0);
    }
}

function proximaRodada() {
    esconderResultadoRodada();
    estado.rodada++;

    if (estado.rodada > estado.totalRodadas) {
        mostrarFinal();
        return;
    }

    estado.golAtual = escolherGol();
    estado.dicasReveladas = 0;
    estado.jogoAtivo = true;

    atualizarRodada();
    mostrarGol(estado.golAtual);
    focarInput();
}

function pedirDica() {
    if (!estado.jogoAtivo) {
        return;
    }
    revelarDica();
}

function pular() {
    if (!estado.jogoAtivo) {
        return;
    }
    estado.jogoAtivo = false;
    mostrarResultadoRodada(false, estado.golAtual.resposta, 0);
}

function iniciarJogo(rodadas) {
    estado.totalRodadas = rodadas;
    estado.pontos = 0;
    estado.rodada = 0;
    estado.golsUsados = [];

    esconderModeSelect();

    const nomesUnicos = [...new Set(estado.gols.map(g => g.resposta))];
    configurarAutocomplete(nomesUnicos, tentarResposta);

    proximaRodada();
}

// --- INICIALIZAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById('btnMode5').addEventListener('click', () => iniciarJogo(5));
    document.getElementById('btnMode10').addEventListener('click', () => iniciarJogo(10));
    document.getElementById('btnMode15').addEventListener('click', () => iniciarJogo(15));

    document.getElementById('btnDica').addEventListener('click', pedirDica);
    document.getElementById('btnPular').addEventListener('click', pular);
    document.getElementById('btnProxima').addEventListener('click', proximaRodada);
    document.getElementById('btnRetry').addEventListener('click', () => mostrarModeSelect());
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const gameKey = tutorialOverlay?.dataset.game;
    const skipKey = gameKey ? `tutorial_skip_${gameKey}` : null;

    if (skipKey && localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add('hidden');
        mostrarModeSelect();
    } else if (tutorialOverlay) {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            mostrarModeSelect();
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            if (skipKey) {
                localStorage.setItem(skipKey, 'true');
            }
            tutorialOverlay.classList.add('hidden');
            mostrarModeSelect();
        });
    } else {
        mostrarModeSelect();
    }
}

init();
