import { carregarDados, escolherRodada }        from "./data.js";
import { criarCards }                           from "./game.js";
import { atualizarPlacar, esconderResultado }   from "./ui.js";

// --- PRÓXIMA RODADA ---
function proximaRodada() {
    esconderResultado();                              
    escolherRodada();                                 
    criarCards();                                     
}

// --- INICIALIZAÇÃO DO JOGO ---
async function init() {
    try {
        await carregarDados();                        
        escolherRodada();                             
        criarCards();                                 
        atualizarPlacar();                            

        document.getElementById("nextRoundBtn").addEventListener("click", () => proximaRodada());
    } catch (erro) {
        console.error("Erro ao inicializar Football Impostor:", erro);
    }
}

// --- EXECUÇÃO QUANDO O DOM ESTIVER PRONTO ---
document.addEventListener("DOMContentLoaded", () => init());