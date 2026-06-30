import estado from "./core.js";
import { carregarDados, escolherJogador } from "./data.js";
import { criarBoard } from "./board.js";
import { esconderMensagem } from "./ui.js";
import { configurarEventos } from "./events.js";

function reiniciarJogo() {
    estado.tentativaAtual = 0;
    estado.colunaAtual = 0;
    estado.jogoAtivo = true;
    estado.estadoTeclas.clear();

    // --- RESETAR TECLADO ---
    document.querySelectorAll(".key").forEach((k) => {
        k.classList.remove("key-correct", "key-present", "key-absent");
    });

    esconderMensagem();
    escolherJogador();
    criarBoard();
}

async function iniciar() {
    try {
        await carregarDados();
        escolherJogador();
        criarBoard();
        configurarEventos(reiniciarJogo);
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao iniciar o jogo: ${erro.message}`);
    }
}

iniciar();
