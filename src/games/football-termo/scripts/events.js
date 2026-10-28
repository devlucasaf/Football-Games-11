import { normalizar as normalizarTexto }                   from "./utils.js";
import { inserirLetra, apagarLetra }    from "./input.js";
import { confirmarTentativa }           from "./logic.js";

// --- CONFIGURAÇÃO DOS EVENTOS DO JOGO ---
export function configurarEventos(reiniciarJogo) {
    document.addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.ctrlKey || eventoTeclado.altKey || eventoTeclado.metaKey) {
            return;
        }

        if (eventoTeclado.key === "Enter") {
            eventoTeclado.preventDefault();
            confirmarTentativa();               
        } else if (eventoTeclado.key === "Backspace") {
            eventoTeclado.preventDefault();
            apagarLetra();                      
        } else if (eventoTeclado.key === " ") {
            eventoTeclado.preventDefault();
            inserirLetra(" ");                  
        } else {
            const letra = eventoTeclado.key.toUpperCase();
            if (/^[A-Z]$/.test(letra)) {
                inserirLetra(normalizarTexto(letra)); 
            }
        }
    });

    // --- TECLADO VIRTUAL ---
    document.getElementById("tecladoVirtual").addEventListener("click", (eventoClique) => {
        const tecla = eventoClique.target.closest(".key");
        if (!tecla) {
            return;                             
        }

        const valorTecla = tecla.dataset.key;
        if (valorTecla === "ENTER") {
            confirmarTentativa();
        } else if (valorTecla === "BACKSPACE") {
            apagarLetra();
        } else if (valorTecla === " ") {
            inserirLetra(" ");
        } else {
            inserirLetra(normalizarTexto(valorTecla));
        }
    });

    document.getElementById("btnIniciarNovoJogo").addEventListener("click", () => {
        reiniciarJogo();                        
    });

    document.getElementById("btnFecharMensagem").addEventListener("click", () => {
        reiniciarJogo();                        
    });
}