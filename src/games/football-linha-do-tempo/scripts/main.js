import { estado } from "./core.js";
import { carregarDados, sortearRodadas, embaralharEventos } from "./data.js";
import {
    renderizarLista,
    atualizarRodada,
    atualizarTema,
    atualizarPontos,
    mostrarCartaoLinhaTempo,
    mostrarResultadoRodada,
    mostrarFinal,
    reiniciarInterface
} from "./ui.js";

// --- MOSTRAR RODADA ATUAL ---
function mostrarRodada() {
    const rodada = estado.sorteadas[estado.rodadaAtual];
    atualizarRodada();
    atualizarTema(rodada.tema);
    estado.ordemAtual = embaralharEventos(rodada.eventos);
    mostrarCartaoLinhaTempo();
    renderizarLista();
}

// --- CONFIRMAR ORDEM ---
function confirmarOrdemEventos() {
    const rodada = estado.sorteadas[estado.rodadaAtual];
    const ordemCorreta = [...rodada.eventos].sort((eventoAnterior, eventoSeguinte) => eventoAnterior.ano - eventoSeguinte.ano);

    let corretos = 0;
    estado.ordemAtual.forEach((evento, indiceEvento) => {
        if (evento.ano === ordemCorreta[indiceEvento].ano) {
            corretos++;
        }
    });

    estado.pontos += corretos;
    if (corretos === ordemCorreta.length) {
        estado.rodadasPerfeitas++;
    }
    atualizarPontos();
    mostrarResultadoRodada(corretos, ordemCorreta);
}

// --- PRÓXIMA RODADA ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.pontos = 0;
    estado.rodadasPerfeitas = 0;
    reiniciarInterface();
    sortearRodadas();
    mostrarRodada();
}

window.linhaTempoReiniciar = iniciarJogo;

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarLinhaTempo() {
    await carregarDados();

    document.getElementById("btnConfirmarOrdemEventos").addEventListener("click", confirmarOrdemEventos);
    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnJogarNovamente").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-linha-do-tempo";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
    }
}

inicializarLinhaTempo();
