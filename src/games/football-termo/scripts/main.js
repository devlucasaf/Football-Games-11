import estado from "./core.js";
import { carregarDados, escolherJogador } from "./data.js";
import { criarTabuleiroTermo } from "./board.js";
import { esconderMensagem } from "./ui.js";
import { configurarEventos } from "./events.js";

// --- REINICIALIZAÇÃO COMPLETA DO JOGO ---
function reiniciarJogo() {
    estado.tentativaAtual = 0;                  
    estado.colunaAtual = 0;                     
    estado.jogoAtivo = true;                    
    estado.estadoTeclas.clear();                

    // --- RESETAR TECLADO ---
    document.querySelectorAll(".key").forEach((teclaVirtual) => {
        teclaVirtual.classList.remove("key-correct", "key-present", "key-absent");
    });

    esconderMensagem();                          
    escolherJogador();                           
    criarTabuleiroTermo();
}

// --- INICIALIZAÇÃO DO JOGO ---
async function inicializarJogoTermo() {
    try {
        await carregarDados();                   
        escolherJogador();                       
        criarTabuleiroTermo();
        configurarEventos(reiniciarJogo);        
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao iniciar o jogo: ${erro.message}`);
    }
}

inicializarJogoTermo();