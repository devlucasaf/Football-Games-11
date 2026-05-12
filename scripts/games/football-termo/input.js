import estado from "./core.js";
import { getCelulasLinha } from "./board.js";

export function inserirLetra(letra) {
    if (!estado.jogoAtivo) {
        return;
    }

    const tamanho = estado.secretoNormalizado.length;
    if (estado.colunaAtual >= tamanho) {
        return;
    }

    const celulas = getCelulasLinha(estado.tentativaAtual);
    const celula = celulas[estado.colunaAtual];
    celula.textContent = letra;
    celula.classList.add("filled");
    estado.colunaAtual++;
}

export function apagarLetra() {
    if (!estado.jogoAtivo) {
        return;
    }

    if (estado.colunaAtual <= 0) {
        return;
    }

    estado.colunaAtual--;
    const celulas = getCelulasLinha(estado.tentativaAtual);
    const celula = celulas[estado.colunaAtual];
    celula.textContent = "";
    celula.classList.remove("filled");
}
