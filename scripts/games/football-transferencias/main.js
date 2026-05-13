import { estado, resetEstado } from './core.js';
import { carregarDados, escolherJogador, obterNomesJogadores } from './data.js';
import { renderizarClubes, atualizarInfo, mostrarFeedback, mostrarResultadoFinal, resetarVisual, configurarAutocomplete } from './ui.js';

function normalizar(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function calcularPontos() {
    const total = estado.jogadorAtual.clubes.length;
    const revelados = estado.clubesRevelados;
    const pontos = Math.max(2, Math.round(10 * (1 - (revelados - 1) / Math.max(1, total - 1))));
    return pontos;
}

function verificarPalpite(nome) {
    if (!estado.jogoAtivo || !estado.jogadorAtual) {
        return;
    }

    const correto = normalizar(estado.jogadorAtual.nome) === normalizar(nome);

    if (correto) {
        const pontos = calcularPontos();
        estado.pontuacao += pontos;
        mostrarFeedback(true, pontos);
    } else {
        mostrarFeedback(false, 0);
    }

    atualizarInfo();
}

function revelarProximoClube() {
    if (!estado.jogadorAtual) {
        return;
    }

    if (estado.clubesRevelados >= estado.jogadorAtual.clubes.length) {
        return;
    }

    estado.clubesRevelados++;
    renderizarClubes();
}

function proximaRodada() {
    if (estado.rodada >= estado.totalRodadas) {
        mostrarResultadoFinal();
        return;
    }

    estado.rodada++;
    iniciarRodada();
}

function iniciarRodada() {
    resetarVisual();
    escolherJogador();
    renderizarClubes();
    atualizarInfo();
    document.getElementById('guessInput').focus();
}

function iniciarJogo() {
    resetEstado();
    iniciarRodada();
}

document.getElementById('btnReveal').addEventListener('click', revelarProximoClube);

document.getElementById('btnGuess').addEventListener('click', () => {
    const input = document.getElementById('guessInput');
    if (input.value.trim()) {
        verificarPalpite(input.value.trim());
    }
});

document.getElementById('btnNext').addEventListener('click', proximaRodada);
document.getElementById('btnRetry').addEventListener('click', iniciarJogo);
document.getElementById('btnHome').addEventListener('click', () => {
    window.location.href = '../index.html';
});

function setupAutocomplete() {
    const nomes = obterNomesJogadores();
    configurarAutocomplete(nomes, (nome) => {
        document.getElementById('guessInput').value = nome;
        document.getElementById('autocompleteList').classList.remove('active');
        verificarPalpite(nome);
    });
}

async function init() {
    await carregarDados();
    setupAutocomplete();
    iniciarJogo();
}

init();
