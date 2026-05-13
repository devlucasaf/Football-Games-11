import { estado } from './core.js';
import { carregarDados, escolherDuelo, embaralharJogadores } from './data.js';
import {
    configurarDuelo,
    mostrarJogador,
    mostrarQuickFeedback,
    atualizarScores,
    atualizarInfo,
    habilitarBotoes,
    desabilitarBotoes,
    mostrarResultadoDuelo,
    mostrarResultadoFinal
} from './ui.js';

let acertosA = 0;
let acertosB = 0;

function verificarEscolha(escolha) {
    if (estado.respondido) {
        return;
    }
    estado.respondido = true;
    desabilitarBotoes();

    const jogadorAtual = estado.jogadores[estado.jogadorIdx];
    const correto = jogadorAtual.time === escolha;

    if (correto) {
        estado.pontuacao += 1;
        estado.acertosRodada++;
        if (escolha === 'A') {
            acertosA++;
        } else {
            acertosB++;
        }
    } else {
        if (jogadorAtual.time === 'A') {
            acertosA++;
        } else {
            acertosB++;
        }
    }

    const timeCorreto = jogadorAtual.time === 'A'
        ? estado.dueloAtual.timeA.nome
        : estado.dueloAtual.timeB.nome;

    mostrarQuickFeedback(correto, timeCorreto);
    atualizarScores(acertosA, acertosB);
    atualizarInfo();

    setTimeout(() => {
        estado.jogadorIdx++;
        if (estado.jogadorIdx >= estado.jogadores.length) {
            finalizarDuelo();
        } else {
            proximoJogador();
        }
    }, 1000);
}

function proximoJogador() {
    estado.respondido = false;
    habilitarBotoes();
    mostrarJogador(estado.jogadores[estado.jogadorIdx]);
}

function finalizarDuelo() {
    estado.historico.push({
        timeA: estado.dueloAtual.timeA.nome,
        timeB: estado.dueloAtual.timeB.nome,
        acertos: estado.acertosRodada
    });
    mostrarResultadoDuelo(estado.acertosRodada, estado.jogadores.length);
}

function iniciarDuelo() {
    estado.rodada++;
    estado.jogadorIdx = 0;
    estado.acertosRodada = 0;
    estado.respondido = false;
    acertosA = 0;
    acertosB = 0;

    atualizarInfo();

    estado.dueloAtual = escolherDuelo();
    estado.jogadores = embaralharJogadores(estado.dueloAtual.jogadores);

    configurarDuelo(estado.dueloAtual);
    proximoJogador();
}

function proximoDuelo() {
    if (estado.rodada >= estado.totalRodadas) {
        mostrarResultadoFinal();
    } else {
        iniciarDuelo();
    }
}

async function init() {
    await carregarDados();

    // Event listeners
    document.getElementById('btnChooseA').addEventListener('click', () => verificarEscolha('A'));
    document.getElementById('btnChooseB').addEventListener('click', () => verificarEscolha('B'));
    document.getElementById('btnNext').addEventListener('click', proximoDuelo);
    document.getElementById('btnRetry').addEventListener('click', () => {
        estado.duelosUsados = [];
        estado.rodada = 0;
        estado.pontuacao = 0;
        estado.historico = [];
        document.getElementById('finalResult').classList.add('hidden');
        iniciarDuelo();
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
        iniciarDuelo();
    } else if (tutorialOverlay) {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            iniciarDuelo();
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            if (skipKey) localStorage.setItem(skipKey, 'true');
            tutorialOverlay.classList.add('hidden');
            iniciarDuelo();
        });
    } else {
        iniciarDuelo();
    }
}

init();
