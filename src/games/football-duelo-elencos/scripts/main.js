import { estado } from "./core.js";
import { carregarDados, escolherDuelo, obterPosicaoAtual } from "./data.js";
import {
    configurarDuelo,
    mostrarEscolha,
    registrarEscolha,
    colocarJogadorNoCampo,
    mostrarResultadoFinal
} from "./ui.js";

// --- REGISTRAR ESCOLHA DO JOGADOR ---
function verificarEscolha(escolha) {
    if (estado.respondido) {
        return;
    }
    estado.respondido = true;

    const posicao = obterPosicaoAtual();
    let time;
    let jogador;
    if (escolha === "A") {
        time = estado.dueloAtual.timeA;
        jogador = posicao.jogadorA;
    } else {
        time = estado.dueloAtual.timeB;
        jogador = posicao.jogadorB;
    }

    estado.escolhas.push({
        posicao: posicao.posicao,
        jogadorA: posicao.jogadorA,
        jogadorB: posicao.jogadorB,
        escolha,
        jogador,
        time: time.nome,
        temporada: time.temporada,
        escudo: time.escudo
    });

    registrarEscolha(escolha);
    colocarJogadorNoCampo(estado.indicePosicao, jogador, escolha);

    setTimeout(() => {
        estado.indicePosicao++;
        if (estado.indicePosicao >= estado.totalPosicoes) {
            finalizarDuelo();
        } else {
            proximaPosicao();
        }
    }, 700);
}

// --- PRÓXIMA POSIÇÃO ---
function proximaPosicao() {
    estado.respondido = false;
    const posicao = obterPosicaoAtual();
    mostrarEscolha(posicao);
}

// --- FINALIZAR ---
function finalizarDuelo() {
    mostrarResultadoFinal();
}

// --- INICIAR DUELO ---
function iniciarDuelo() {
    estado.indicePosicao = 0;
    estado.respondido = false;
    estado.escolhas = [];

    estado.dueloAtual = escolherDuelo();
    if (!estado.dueloAtual) {
        estado.duelosUsados = [];
        estado.dueloAtual = escolherDuelo();
    }

    configurarDuelo(estado.dueloAtual);
    proximaPosicao();
}

// --- INIT ---
async function inicializarDuelo() {
    await carregarDados();

    document.getElementById("btnEscolherJogadorTimeA").addEventListener("click", () => verificarEscolha("A"));
    document.getElementById("btnEscolherJogadorTimeB").addEventListener("click", () => verificarEscolha("B"));
    document.getElementById("btnIniciarNovoDuelo").addEventListener("click", () => {
        document.getElementById("finalResult").classList.add("hidden");
        iniciarDuelo();
    });
    
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const sobreposicaoTutorial = document.getElementById("sobreposicaoTutorial");
    const chaveJogo = sobreposicaoTutorial?.dataset.game;
    const chaveDispensaTutorial = chaveJogo ? `tutorial_skip_${chaveJogo}` : null;

    if (chaveDispensaTutorial && localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarDuelo();
    } else if (sobreposicaoTutorial) {
        document.getElementById("btnIniciarJogoTutorial").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarDuelo();
        });
        document.getElementById("btnOcultarTutorial").addEventListener("click", () => {
            if (chaveDispensaTutorial) {
                localStorage.setItem(chaveDispensaTutorial, "true");
            }
            sobreposicaoTutorial.classList.add("hidden");
            iniciarDuelo();
        });
    } else {
        iniciarDuelo();
    }
}

inicializarDuelo();
