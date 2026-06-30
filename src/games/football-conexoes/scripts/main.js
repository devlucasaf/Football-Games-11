import { estado, resetPuzzle } from "./core.js";
import { carregarDados, escolherPuzzle, obterTodosJogadores, embaralhar, verificarGrupo } from "./data.js";
import { renderizarGrid, renderizarVidas, renderizarGrupoAcertado, mostrarFeedback, animarErro, animarQuaseLa, embaralharGrid, limparSelecao, mostrarResultadoFinal, resetarVisual } from "./ui.js";

// --- INICIAR PUZZLE ---
function iniciarPuzzle() {
    resetPuzzle();
    resetarVisual();

    const puzzle = escolherPuzzle();
    if (!puzzle) {
        return;
    }

    const todos = obterTodosJogadores(puzzle);
    estado.jogadoresRestantes = embaralhar(todos);

    renderizarGrid();
    renderizarVidas();
}

// --- CONFIRMAR SELEÇÃO DE GRUPO ---
function confirmarSelecao() {
    if (estado.selecionados.length !== 4 || !estado.jogoAtivo) {
        return;
    }

    const resultado = verificarGrupo(estado.selecionados, estado.puzzleAtual);

    if (resultado.acertou) {
        estado.gruposAcertados.push(resultado.grupo);
        estado.jogadoresRestantes = estado.jogadoresRestantes.filter(
            j => !resultado.grupo.jogadores.includes(j)
        );
        estado.selecionados = [];

        renderizarGrupoAcertado(resultado.grupo);
        renderizarGrid();

        if (estado.gruposAcertados.length === 4) {
            estado.jogoAtivo = false;
            setTimeout(() => mostrarResultadoFinal(true), 600);
        }
    } else {
        estado.tentativasRestantes--;
        renderizarVidas();

        if (resultado.quaseLa) {
            animarQuaseLa();
            mostrarFeedback("almost", "Quase lá! 3 de 4 estão corretos.");
        } else {
            animarErro();
            mostrarFeedback("wrong", "Não é um grupo válido.");
        }

        estado.selecionados = [];
        renderizarGrid();

        if (estado.tentativasRestantes <= 0) {
            estado.jogoAtivo = false;
            setTimeout(() => {
                estado.puzzleAtual.grupos.forEach(g => {
                    if (!estado.gruposAcertados.includes(g)) {
                        renderizarGrupoAcertado(g);
                    }
                });
                mostrarResultadoFinal(false);
            }, 800);
        }
    }
}

// --- EVENTOS DOS BOTÕES ---
document.getElementById("btnSubmit").addEventListener("click", confirmarSelecao);
document.getElementById("btnDeselect").addEventListener("click", limparSelecao);
document.getElementById("btnShuffle").addEventListener("click", embaralharGrid);
document.getElementById("btnNextPuzzle").addEventListener("click", iniciarPuzzle);
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../../../index.html";
});

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();
    estado.puzzleIndex = Math.floor(Math.random() * estado.puzzles.length);
    iniciarPuzzle();
}

init();
