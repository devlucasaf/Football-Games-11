import estado from "./core.js";

// --- CRIAÇÃO DO TABULEIRO DO TERMO ---
export function criarTabuleiroTermo() {
    const tabuleiro = document.getElementById("tabuleiroTermo");
    tabuleiro.innerHTML = "";

    const tamanho = estado.secretoNormalizado.length; 

    for (let indiceLinha = 0; indiceLinha < estado.MAXIMO_TENTATIVAS; indiceLinha++) {
        const linha = document.createElement("div");
        linha.className = "termo-linha";
        linha.dataset.linha = indiceLinha;

        for (let indiceColuna = 0; indiceColuna < tamanho; indiceColuna++) {
            const celula = document.createElement("div");
            celula.className = "termo-celula";
            celula.dataset.linha = indiceLinha;
            celula.dataset.coluna = indiceColuna;
            linha.appendChild(celula);
        }
        tabuleiro.appendChild(linha);
    }

    document.getElementById("textoDicaJogador").textContent =
        `O nome do jogador tem ${tamanho} letras`;
}

// --- OBTENÇÃO DAS CÉLULAS DE UMA LINHA ESPECÍFICA ---
export function obterCelulasLinha(linha) {
    return Array.from(
        document.querySelectorAll(`.termo-celula[data-linha="${linha}"]`)
    );
}