import estado from "./core.js";

export function criarBoard() {
    const board = document.getElementById("termoBoard");
    board.innerHTML = "";

    const tamanho = estado.secretoNormalizado.length;

    for (let i = 0; i < estado.MAX_TENTATIVAS; i++) {
        const row = document.createElement("div");
        row.className = "termo-row";
        row.dataset.row = i;

        for (let j = 0; j < tamanho; j++) {
            const cell = document.createElement("div");
            cell.className = "termo-cell";
            cell.dataset.row = i;
            cell.dataset.col = j;
            row.appendChild(cell);
        }
        board.appendChild(row);
    }

    // --- DICA ---
    document.getElementById("hintText").textContent =
        `O nome do jogador tem ${tamanho} letras`;
}

export function getCelulasLinha(linha) {
    return Array.from(
        document.querySelectorAll(`.termo-cell[data-row="${linha}"]`)
    );
}
