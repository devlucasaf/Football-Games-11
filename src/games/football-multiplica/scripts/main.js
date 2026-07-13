import { estado } from "./core.js";
import { carregarDados, sortearDesafio, sortearJogadores, jogadorAtual, valorDoJogador } from "./data.js";
import {
    exibirDesafio,
    atualizarRodada,
    atualizarPulos,
    exibirJogador,
    renderizarMultiplicadores,
    mostrarFinal,
    resetarUI
} from "./ui.js";

// --- MOSTRAR RODADA ---
function mostrarRodada() {
    const jogador = jogadorAtual();
    if (!jogador) {
        return;
    }

    const valor = valorDoJogador(jogador);
    atualizarRodada();
    exibirJogador(jogador, valor);
    renderizarMultiplicadores(selecionarMultiplicador);
}

// --- SELECIONAR MULTIPLICADOR ---
function selecionarMultiplicador(idx, mult) {
    const jogador = jogadorAtual();
    const valor = valorDoJogador(jogador);
    const resultado = valor * mult;

    estado.multiplicadoresUsados[idx] = jogador.nome;
    estado.totalAcumulado += resultado;
    atualizarRodada();
    proxima();
}

// --- PULAR JOGADOR ---
function pularJogador() {
    if (estado.pulosRestantes <= 0) {
        return;
    }
    estado.pulosRestantes--;
    estado.indiceSorteados++;
    atualizarPulos();
    mostrarRodada();
}

// --- PRÓXIMA RODADA ---
function proxima() {
    estado.rodadaAtual++;
    estado.indiceSorteados++;
    if (estado.rodadaAtual >= estado.desafioAtual.rodadas) {
        const venceu = estado.totalAcumulado >= estado.desafioAtual.meta;
        mostrarFinal(venceu);
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-multiplica", {
                venceu,
                bucket: 0,
                tamanho: 1
            });
            
            window.FG11Stats.mostrarModal("football-multiplica", {
                venceu,
                titulo: venceu ? "Meta batida!" : "Não foi dessa vez!",
                resposta: `Total: ${estado.totalAcumulado} · Meta: ${estado.desafioAtual.meta}`,
                tamanho: 1,
                rotulos: ["Vitórias"],
                tituloGrafico: "Desafios vencidos",
                bucketAtual: venceu ? 0 : -1,
                onReiniciar: iniciarJogo,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }
    } else {
        mostrarRodada();
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.indiceSorteados = 0;
    estado.totalAcumulado = 0;
    estado.pulosRestantes = estado.maxPulos;
    estado.multiplicadoresUsados = {};
    resetarUI();
    sortearDesafio();
    sortearJogadores();
    exibirDesafio();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById("btnProximo").addEventListener("click", proxima);
    document.getElementById("btnPular").addEventListener("click", pularJogador);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-multiplica";

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
