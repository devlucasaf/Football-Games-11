import { estado } from './core.js';
import { carregarDados, escolherClube, obterDica } from './data.js';
import {
    renderizarCores,
    renderizarDica,
    renderizarOpcoes,
    mostrarFeedbackCorreto,
    mostrarFeedbackErrado,
    atualizarInfo,
    resetarRodada,
    desabilitarOpcoes,
    desabilitarHint,
    revelarEscudo,
    mostrarResultadoFinal
} from './ui.js';

function calcularPontos() {
    const pontos = Math.max(2, 12 - (estado.nivelAtual * 2));
    return pontos;
}

function verificarResposta(nome, btn) {
    if (estado.respondido) {
        return;
    }
    estado.respondido = true;

    const correto = nome === estado.clubeAtual.nome;

    if (correto) {
        btn.classList.add('correct');
        const pontos = calcularPontos();
        estado.pontuacao += pontos;
        estado.historico.push({ 
            clube:   estado.clubeAtual.nome, 
            dicas:   estado.nivelAtual, 
            acertou: true 
        });
        desabilitarOpcoes(estado.clubeAtual.nome);
        revelarEscudo();
        setTimeout(() => mostrarFeedbackCorreto(pontos), 500);
    } else {
        btn.classList.add('wrong');
        estado.historico.push({ 
            clube:   estado.clubeAtual.nome, 
            dicas:   estado.nivelAtual, 
            acertou: false 
        });
        desabilitarOpcoes(estado.clubeAtual.nome);
        revelarEscudo();
        setTimeout(() => mostrarFeedbackErrado(), 500);
    }

    atualizarInfo();
}

function revelarProximaDica() {
    if (estado.nivelAtual >= 5) {
        return;
    }
    estado.nivelAtual++;
    const dica = obterDica(estado.nivelAtual);
    if (dica) {
        renderizarDica(dica);
    }

    if (estado.nivelAtual >= 5) {
        desabilitarHint();
    }
}

function iniciarRodada() {
    estado.rodada++;
    estado.nivelAtual = 1;
    estado.respondido = false;

    resetarRodada();
    atualizarInfo();

    estado.clubeAtual = escolherClube();

    renderizarCores();
    const dica1 = obterDica(1);
    if (dica1) {
        renderizarDica(dica1);
    }

    renderizarOpcoes(estado.clubeAtual.opcoes, verificarResposta);
}

function proximaRodada() {
    if (estado.rodada >= estado.totalRodadas) {
        mostrarResultadoFinal();
    } else {
        iniciarRodada();
    }
}

async function init() {
    await carregarDados();

    document.getElementById('btnHint').addEventListener('click', revelarProximaDica);
    document.getElementById('btnNext').addEventListener('click', proximaRodada);
    document.getElementById('btnRetry').addEventListener('click', () => {
        estado.clubesUsados = [];
        estado.rodada = 0;
        estado.pontuacao = 0;
        estado.historico = [];
        document.getElementById('finalResult').classList.add('hidden');
        iniciarRodada();
    });
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Tutorial
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const gameKey = tutorialOverlay?.dataset.game;
    const skipKey = gameKey ? `tutorial_skip_${gameKey}` : null;

    if (skipKey && localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add('hidden');
        iniciarRodada();
    } else if (tutorialOverlay) {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            iniciarRodada();
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            if (skipKey) {
                localStorage.setItem(skipKey, 'true');
            }
            tutorialOverlay.classList.add('hidden');
            iniciarRodada();
        });
    } else {
        iniciarRodada();
    }
}

init();
