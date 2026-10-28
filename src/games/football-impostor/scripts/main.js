import { carregarDados, escolherRodada }        from "./data.js";
import { criarCartoesJogadores }                 from "./game.js";
import { atualizarPlacar, esconderResultado }   from "./ui.js";

// --- PRÓXIMA RODADA ---
function proximaRodada() {
    esconderResultado();                              
    escolherRodada();                                 
    criarCartoesJogadores();
}

// --- INICIALIZAÇÃO DO JOGO ---
async function inicializarJogoImpostor() {
    try {
        await carregarDados();                        
        escolherRodada();                             
        criarCartoesJogadores();
        atualizarPlacar();                            

        document.getElementById("btnAvancarRodada").addEventListener("click", () => proximaRodada());
    } catch (erro) {
        console.error("Erro ao inicializar Football Impostor:", erro);
    }
}

// --- EXECUÇÃO QUANDO O DOM ESTIVER PRONTO ---
document.addEventListener("DOMContentLoaded", () => inicializarJogoImpostor());