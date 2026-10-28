import { esperarMilissegundos } from "./utils.js";

// --- ANIMA A REVELAÇÃO DE UMA LINHA COM EFEITO DE FLIP ---
export async function revelarLinha(celulas, chute, cores) {
    for (let indiceCelula = 0; indiceCelula < celulas.length; indiceCelula++) {
        const celula = celulas[indiceCelula];
        const cor = cores[indiceCelula];

        await new Promise((concluirRevelacao) => {
            celula.classList.add("flip");

            setTimeout(() => {
                celula.classList.add(cor);
                celula.classList.remove("flip");
                concluirRevelacao();
            }, 250);
        });

        await esperarMilissegundos(100);
    }
}

// --- ANIMA EFEITO DE PULO NAS CÉLULAS DE VITÓRIA ---
export async function animarVitoria(celulas) {
    for (let indiceCelula = 0; indiceCelula < celulas.length; indiceCelula++) {
        celulas[indiceCelula].classList.add("bounce");
        await esperarMilissegundos(120);
    }
}

// --- ANIMA EFEITO DE SACUDIR EM UMA LINHA ---
export function animarLinhaIncompleta(linha) {
    const elementoLinha = document.querySelector(`.termo-linha[data-linha="${linha}"]`);
    if (elementoLinha) {
        elementoLinha.classList.add("shake");
        setTimeout(() => elementoLinha.classList.remove("shake"), 500);
    }
}
