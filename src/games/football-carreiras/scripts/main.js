import { carregarDados, escolherJogador } from "./data.js";
import { criarGradeClubesCarreira } from "./grid.js";
import { esconderResultado, esconderSugestoes, mostrarSugestoes } from "./ui.js";
import { tratarPalpite, pularRodadaCarreira } from "./logic.js";

// -- NOVO JOGO ---
function novoJogo() {
    esconderResultado();
    escolherJogador();
    criarGradeClubesCarreira();
    document.getElementById("playerInput").value = "";
    document.getElementById("playerInput").focus();
    esconderSugestoes();
}

window.carreirasProxima = novoJogo;

// --- CONFIGURAR EVENTOS ---
function configurarEventos() {
    const campoPalpite = document.getElementById("playerInput");
    const btnEnviarPalpite = document.getElementById("btnEnviarPalpite");
    const btnPularRodada = document.getElementById("btnPularRodada");
    const btnIniciarNovaPartida = document.getElementById("btnIniciarNovaPartida");
    const btnFecharResultado = document.getElementById("btnFecharResultado");

    btnEnviarPalpite?.addEventListener("click", () => tratarPalpite());

    campoPalpite?.addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.key === "Enter") {
            eventoTeclado.preventDefault();
            tratarPalpite();
        }
    });

    campoPalpite?.addEventListener("input", () => {
        mostrarSugestoes(campoPalpite.value, () => tratarPalpite());
    });

    document.addEventListener("click", (eventoClique) => {
        if (!eventoClique.target.closest(".input-container") && !eventoClique.target.closest(".suggestions-container")) {
            esconderSugestoes();
        }
    });

    btnPularRodada?.addEventListener("click", () => pularRodadaCarreira());
    btnIniciarNovaPartida?.addEventListener("click", () => novoJogo());
    btnFecharResultado?.addEventListener("click", () => novoJogo());
}

// --- INICIALIZAR ---
async function iniciar() {
    try {
        await carregarDados();
        escolherJogador();
        criarGradeClubesCarreira();
        configurarEventos();
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao iniciar: ${erro.message}`);
    }
}

iniciar();
