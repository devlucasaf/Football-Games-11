import estado from "./core.js";
import { carregarDados, selecionarGradeCategorias, selecionarFila, jogadorAtual, proximoJogador, jogadorCorresponde } from "./data.js";
import { renderizarGradeCategorias, exibirJogador, mostrarBotaoProximo, atualizarPlacar, mostrarResultado, esconderResultado, verificarBingos } from "./ui.js";

// --- SELECIONAR/DESSELECIONAR CÉLULA ---
function alternarCelula(btnMarcarCategoria) {
    if (btnMarcarCategoria.classList.contains("locked")) {
        return;
    }

    btnMarcarCategoria.classList.toggle("selecionado");
}

// --- CONFIRMAR MARCAÇÕES DO JOGADOR ATUAL ---
function confirmarMarcacoes() {
    const jogador = jogadorAtual();
    if (!jogador) {
        return;
    }

    const botoesCategorias = document.querySelectorAll(".bingo-cell");
    let acertosRodada   = 0;
    let errosRodada     = 0;

    botoesCategorias.forEach((btnMarcarCategoria, indiceCategoria) => {
        if (btnMarcarCategoria.classList.contains("locked")) {
            return;
        }

        const selecionado = btnMarcarCategoria.classList.contains("selecionado");
        const categoria = estado.gradeCategorias[indiceCategoria];
        const corresponde = jogadorCorresponde(jogador, categoria);

        if (selecionado && corresponde) {
            btnMarcarCategoria.classList.remove("selecionado");
            btnMarcarCategoria.classList.add("correto", "locked");
            estado.celulasMarcadas.add(indiceCategoria);
            acertosRodada++;
        } else if (selecionado && !corresponde) {
            btnMarcarCategoria.classList.remove("selecionado");
            btnMarcarCategoria.classList.add("errado");
            errosRodada++;
            setTimeout(() => btnMarcarCategoria.classList.remove("errado"), 600);
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
        const porcentagemAcertos = total > 0 ? Math.round((estado.acertos / total) * 100) : 0;
        mostrarResultado(
            estado.bingos > 0 ? "BINGO!" : "Fim de Jogo!",
            `${estado.acertos} acertos, ${estado.erros} erros (${porcentagemAcertos}%). Bingos: ${estado.bingos}.`,
            estado.bingos > 0 ? "<i class='fas fa-trophy' style='color:#f1c40f'></i>" : "<i class='fas fa-flag-checkered' style='color:var(--text-secondary)'></i>"
        );

        if (estado.bingos > 0) {
            if (window.registrarVitoria) {
                window.registrarVitoria();
            }
        } else {
            if (window.registrarDerrota) {
                window.registrarDerrota();
            }
        }

        return;
    }

    exibirJogador(jogador);
    atualizarPlacar();
    renderizarGradeCategorias();
    configurarEventosGradeCategorias();
}

// --- CONFIGURAR CLIQUE NAS CÉLULAS ---
function configurarEventosGradeCategorias() {
    document.querySelectorAll(".bingo-cell").forEach(btnMarcarCategoria => {
        btnMarcarCategoria.addEventListener("click", () => alternarCelula(btnMarcarCategoria));
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

    selecionarGradeCategorias();
    selecionarFila();

    renderizarGradeCategorias();
    configurarEventosGradeCategorias();
    exibirJogador(jogadorAtual());
    atualizarPlacar();
}

// --- CONFIGURAR EVENTOS GLOBAIS ---
function configurarEventos() {
    document.getElementById("btnConfirmarMarcacoes").addEventListener("click", () => confirmarMarcacoes());
    document.getElementById("btnExibirProximoJogador").addEventListener("click", () => avancarJogador());
    document.getElementById("btnIniciarNovaPartida").addEventListener("click", () => novoJogo());
    document.getElementById("btnFecharResultado").addEventListener("click", () => novoJogo());
}

// --- INICIALIZAR ---
async function iniciar(modo = "mundial") {
    try {
        await carregarDados(modo);
        selecionarGradeCategorias();
        selecionarFila();
        renderizarGradeCategorias();
        configurarEventosGradeCategorias();
        exibirJogador(jogadorAtual());
        atualizarPlacar();
        configurarEventos();
    } catch (erro) {
        console.error("Erro ao carregar dados do bingo:", erro);
    }
}

// --- INICIAR AO CARREGAR A PÁGINA ---
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
