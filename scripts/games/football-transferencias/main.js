import { estado, resetEstado } from "./core.js";
import { carregarDados, selecionarModo, escolherJogador, obterNomesJogadores } from "./data.js";
import { renderizarClubes, atualizarInfo, mostrarFeedback, mostrarResultadoFinal, resetarVisual, configurarAutocomplete } from "./ui.js";

function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- CALCULA OS PONTOS COM BASE NA QUANTIDADE DE CLUBES REVELADOS ---
function calcularPontos() {
    const total = estado.jogadorAtual.clubes.length;
    const revelados = estado.clubesRevelados;
    const pontos = Math.max(2, Math.round(10 * (1 - (revelados - 1) / Math.max(1, total - 1))));
    return pontos;
}

// --- VERIFICA SE O PALPITE DO USUÁRIO ESTÁ CORRETO ---
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

// --- REVELA O PRÓXIMO CLUBE DO JOGADOR ---
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

// --- AVANÇA PARA A PRÓXIMA RODADA OU MOSTRA RESULTADO FINAL ---
function proximaRodada() {
    if (estado.rodada >= estado.totalRodadas) {
        mostrarResultadoFinal();
        return;
    }

    estado.rodada++;
    iniciarRodada();
}

// --- INICIALIZA UMA NOVA RODADA DO JOGO ---
function iniciarRodada() {
    resetarVisual();
    escolherJogador();
    renderizarClubes();
    atualizarInfo();
    document.getElementById("guessInput").focus();
}

// --- INICIA UM NOVO JOGO DO ZERO ---
function iniciarJogo() {
    document.getElementById("modeSelection").classList.add("hidden");
    document.getElementById("gameInfo").classList.remove("hidden");
    document.getElementById("clubsArea").classList.remove("hidden");
    document.getElementById("guessArea").classList.remove("hidden");
    resetEstado();
    selecionarModo(estado.modoAtual);
    setupAutocomplete();
    iniciarRodada();
}

// --- SELECIONAR MODO E INICIAR ---
function selecionarModoEIniciar(modo) {
    estado.modoAtual = modo;
    iniciarJogo();
}

// --- VOLTAR À SELEÇÃO DE MODO ---
function voltarModo() {
    document.getElementById("modeSelection").classList.remove("hidden");
    document.getElementById("gameInfo").classList.add("hidden");
    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("finalResult").classList.add("hidden");
}

// --- BOTÃO DE REVELAR PRÓXIMO CLUBE ---
document.getElementById("btnReveal").addEventListener("click", revelarProximoClube);

// --- BOTÃO DE CONFIRMAR PALPITE ---
document.getElementById("btnGuess").addEventListener("click", () => {
    const input = document.getElementById("guessInput");
    if (input.value.trim()) {
        verificarPalpite(input.value.trim());
    }
});

document.getElementById("btnNext").addEventListener("click", proximaRodada);
document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../index.html";
});

// --- BOTÕES DE SELEÇÃO DE MODO ---
document.getElementById("btnMundial").addEventListener("click", () => selecionarModoEIniciar("mundial"));
document.getElementById("btnBrasileiro").addEventListener("click", () => selecionarModoEIniciar("brasileiro"));
document.getElementById("btnTrocarModo").addEventListener("click", voltarModo);

// --- CONFIGURA O AUTOCOMPLETAR COM OS NOMES DOS JOGADORES ---
function setupAutocomplete() {
    const nomes = obterNomesJogadores();
    configurarAutocomplete(nomes, (nome) => {
        document.getElementById("guessInput").value = nome;
        document.getElementById("autocompleteList").classList.remove("active");
        verificarPalpite(nome);
    });
}

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO JOGO ---
async function init() {
    await carregarDados();
}

init();
