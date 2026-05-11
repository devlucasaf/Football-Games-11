import estado from "./core.js";

export function renderizarJogadores() {
    const container = document.getElementById("bingoPlayers");
    container.innerHTML = "";

    estado.jogadoresSelecionados.forEach(jogador => {
        const div = document.createElement("div");

        div.className   = "bingo-player-name";
        div.textContent = jogador.nome;
        div.title       = jogador.nome;

        container.appendChild(div);
    });
}

export function renderizarGrid() {
    const grid = document.getElementById("bingoGrid");
    grid.innerHTML = "";

    estado.timesSelecionados.forEach((time, indice) => {
        const btn = document.createElement("button");

        btn.className       = "bingo-cell";
        btn.textContent     = time;
        btn.dataset.indice  = indice;
        btn.dataset.time    = time;
        btn.addEventListener("click", () => alternarCelula(btn));

        grid.appendChild(btn);
    });
}

function alternarCelula(btn) {
    btn.classList.toggle("marcado");
}
