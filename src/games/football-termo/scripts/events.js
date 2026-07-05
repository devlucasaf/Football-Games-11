import { normalizar }                   from "./utils.js";
import { inserirLetra, apagarLetra }    from "./input.js";
import { confirmarTentativa }           from "./logic.js";

// --- CONFIGURAÇÃO DOS EVENTOS DO JOGO ---
export function configurarEventos(reiniciarJogo) {
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();                 
            confirmarTentativa();               
        } else if (e.key === "Backspace") {
            e.preventDefault();                 
            apagarLetra();                      
        } else if (e.key === " ") {
            e.preventDefault();                 
            inserirLetra(" ");                  
        } else {
            const letra = e.key.toUpperCase();
            if (/^[A-Z]$/.test(letra)) {
                inserirLetra(normalizar(letra)); 
            }
        }
    });

    // --- TECLADO VIRTUAL ---
    document.getElementById("keyboard").addEventListener("click", (e) => {
        const tecla = e.target.closest(".key");
        if (!tecla) {
            return;                             
        }

        const key = tecla.dataset.key;
        if (key === "ENTER") {
            confirmarTentativa();
        } else if (key === "BACKSPACE") {
            apagarLetra();
        } else if (key === " ") {
            inserirLetra(" ");
        } else {
            inserirLetra(normalizar(key));      
        }
    });

    document.getElementById("newGameBtn").addEventListener("click", () => {
        reiniciarJogo();                        
    });

    document.getElementById("messageCloseBtn").addEventListener("click", () => {
        reiniciarJogo();                        
    });
}