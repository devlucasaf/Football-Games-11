import estado from "./core.js";
import { carregarDados, selecionarGrid, selecionarFila, jogadorAtual, proximoJogador, jogadorCorresponde } from "./data.js";
import { renderizarGrid, exibirJogador, mostrarBotaoProximo, atualizarPlacar, mostrarResultado, esconderResultado, verificarBingos } from "./ui.js";

// --- SELECIONAR/DESSELECIONAR CÉLULA ---
function alternarCelula(cell) {
    const idx = parseInt(cell.dataset.indice);

    // --- NÃO PERMITIR EM CÉLULAS JÁ TRAVADAS ---
    if (cell.classList.contains("locked")) {
        return;
    }

    cell.classList.toggle("selecionado");
}

// --- CONFIRMAR MARCAÇÕES DO JOGADOR ATUAL ---
function confirmarMarcacoes() {
    const jogador = jogadorAtual();
    if (!jogador) {
        return;
    }

    const cells = document.querySelectorAll(".bingo-cell");
    let acertosRodada = 0;
    let errosRodada = 0;

    cells.forEach((cell, idx) => {
        if (cell.classList.contains("locked")) {
            return;
        }

        const selecionado   = cell.classList.contains("selecionado");
        const cat           = estado.gridCategorias[idx];
        const corresponde   = jogadorCorresponde(jogador, cat);

        if (selecionado && corresponde) {
            cell.classList.remove("selecionado");
            cell.classList.add("correto", "locked");
            estado.celulasMarcadas.add(idx);
            acertosRodada++;
        } else if (selecionado && !corresponde) {
            cell.classList.remove("selecionado");
            cell.classList.add("errado");
            errosRodada++;
            setTimeout(() => cell.classList.remove("errado"), 600);
        }
    });

    estado.acertos += acertosRodada;
    estado.erros += errosRodada;

    verificarBingos();
    atualizarPlacar();
    mostrarBotaoProximo();
}

// --- AVANÇAR PARA PRÓXIMO JOGADOR ---
function avancarJogador() {
    const jogador = proximoJogador();
    if (!jogador) {
        const total = estado.acertos + estado.erros;
        const pct = total > 0 ? Math.round((estado.acertos / total) * 100) : 0;
        mostrarResultado(
            estado.bingos > 0 ? "BINGO!" : "Fim de Jogo!",
            `${estado.acertos} acertos, ${estado.erros} erros (${pct}%). Bingos: ${estado.bingos}.`,
            estado.bingos > 0 ? '<i class="fas fa-trophy" style="color:#f1c40f"></i>' : '<i class="fas fa-flag-checkered" style="color:var(--text-secondary)"></i>'
        );
        return;
    }

    exibirJogador(jogador);
    atualizarPlacar();
    renderizarGrid();
    configurarGridEventos();
}

// --- CONFIGURAR CLIQUE NAS CÉLULAS ---
function configurarGridEventos() {
    document.querySelectorAll(".bingo-cell").forEach(cell => {
        cell.addEventListener("click", () => alternarCelula(cell));
    });
}

// --- NOVO JOGO ---
async function novoJogo() {
    estado.acertos = 0;
    estado.erros = 0;
    estado.bingos = 0;
    estado.celulasMarcadas.clear();

    esconderResultado();

    const modo = localStorage.getItem("bingo_modo") || "mundial";
    await carregarDados(modo);

    selecionarGrid();
    selecionarFila();

    renderizarGrid();
    configurarGridEventos();
    exibirJogador(jogadorAtual());
    atualizarPlacar();
}

// --- CONFIGURAR EVENTOS GLOBAIS ---
function configurarEventos() {
    document.getElementById("confirmarBtn").addEventListener("click",   () => confirmarMarcacoes());
    document.getElementById("proximoBtn").addEventListener("click",     () => avancarJogador());
    document.getElementById("novoJogoBtn").addEventListener("click",    () => novoJogo());
    document.getElementById("resultCloseBtn").addEventListener("click", () => novoJogo());
}

// --- INICIALIZAR ---
async function iniciar(modo = "mundial") {
    try {
        await carregarDados(modo);
        selecionarGrid();
        selecionarFila();
        renderizarGrid();
        configurarGridEventos();
        exibirJogador(jogadorAtual());
        atualizarPlacar();
        configurarEventos();
    } catch (erro) {
        console.error("Erro ao carregar dados do bingo:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-bingo";
    const modoSalvo = localStorage.getItem("bingo_modo") || "mundial";

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        iniciar(modoSalvo);
    } else {
        document.getElementById("btnModoMundial").addEventListener("click", () => {
            localStorage.setItem("bingo_modo", "mundial");
            tutorialOverlay.classList.add("hidden");
            iniciar("mundial");
        });

        document.getElementById("btnModoBrasileiro").addEventListener("click", () => {
            localStorage.setItem("bingo_modo", "brasileiro");
            tutorialOverlay.classList.add("hidden");
            iniciar("brasileiro");
        });

        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(skipKey, "true");
            localStorage.setItem("bingo_modo", "mundial");
            tutorialOverlay.classList.add("hidden");
            iniciar("mundial");
        });
    }
});
