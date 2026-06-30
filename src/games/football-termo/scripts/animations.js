import { esperar } from "./utils.js";

// --- ANIMA A REVELAÇÃO DE UMA LINHA COM EFEITO DE FLIP ---
export async function revelarLinha(celulas, chute, cores) {
    for (let i = 0; i < celulas.length; i++) {
        const celula = celulas[i];
        const cor = cores[i];

        await new Promise((resolve) => {
            celula.classList.add("flip");

            setTimeout(() => {
                celula.classList.add(cor);
                celula.classList.remove("flip");
                resolve();
            }, 250);
        });

        await esperar(100);
    }
}

// --- ANIMA EFEITO DE PULO NAS CÉLULAS DE VITÓRIA ---
export async function animarVitoria(celulas) {
    for (let i = 0; i < celulas.length; i++) {
        celulas[i].classList.add("bounce");
        await esperar(120);
    }
}

// --- ANIMA EFEITO DE SACUDIR EM UMA LINHA ---
export function shakeRow(linha) {
    const row = document.querySelector(`.termo-row[data-row="${linha}"]`);
    if (row) {
        row.classList.add("shake");
        setTimeout(() => row.classList.remove("shake"), 500);
    }
}
