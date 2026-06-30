import { estado } from "./core.js";
import { embaralhar } from "./data.js";

// --- RENDERIZAR GRID DE JOGADORES ---
export function renderizarGrid() {
    const grid = document.getElementById("playersGrid");
    grid.innerHTML = "";

    estado.jogadoresRestantes.forEach(nome => {
        const tile = document.createElement("button");
        tile.className = "player-tile";
        tile.textContent = nome;
        tile.dataset.nome = nome;

        if (estado.selecionados.includes(nome)) {
            tile.classList.add("selected");
        }

        tile.addEventListener("click", () => toggleSelecao(nome));
        grid.appendChild(tile);
    });

    atualizarBotoes();
}

// --- ALTERNAR SELEÇÃO DE JOGADOR ---
function toggleSelecao(nome) {
    if (!estado.jogoAtivo) {
        return;
    }
    
    const idx = estado.selecionados.indexOf(nome);
    if (idx >= 0) {
        estado.selecionados.splice(idx, 1);
    } else {
        if (estado.selecionados.length >= 4) {
            return;
        }
        estado.selecionados.push(nome);
    }

    renderizarGrid();
}

// --- ATUALIZAR ESTADO DOS BOTÕES ---
export function atualizarBotoes() {
    const btnDeselect = document.getElementById("btnDeselect");
    const btnSubmit   = document.getElementById("btnSubmit");

    btnDeselect.disabled = estado.selecionados.length === 0;
    btnSubmit.disabled = estado.selecionados.length !== 4;
}

// --- RENDERIZAR VIDAS ---
export function renderizarVidas() {
    const dots = document.querySelectorAll("#livesDots .dot");
    dots.forEach((dot, i) => {
        if (i >= estado.tentativasRestantes) {
            dot.classList.add("lost");
        } else {
            dot.classList.remove("lost");
        }
    });
}

// --- RENDERIZAR GRUPO ACERTADO ---
export function renderizarGrupoAcertado(grupo) {
    const container = document.getElementById("solvedGroups");
    const div       = document.createElement("div");

    div.className = "solved-group";
    div.style.backgroundColor = grupo.cor;
    div.innerHTML = `
        <div class="group-category">${grupo.categoria}</div>
        <div class="group-players">${grupo.jogadores.join(", ")}</div>
    `;
    container.appendChild(div);
}

// --- MOSTRAR FEEDBACK ---
export function mostrarFeedback(tipo, texto) {
    const msg = document.getElementById("feedbackMsg");

    msg.textContent = texto;
    msg.className = `feedback-msg ${tipo}`;
    msg.classList.remove("hidden");

    setTimeout(() => {
        msg.classList.add("hidden");
    }, 2500);
}

// --- ANIMAR ERRO ---
export function animarErro() {
    const tiles = document.querySelectorAll(".player-tile.selected");
    tiles.forEach(t => {
        t.classList.add("shake");
        setTimeout(() => t.classList.remove("shake"), 400);
    });
}

// --- ANIMAR QUASE LÁ ---
export function animarQuaseLa() {
    const tiles = document.querySelectorAll(".player-tile.selected");
    tiles.forEach(t => {
        t.classList.add("almost");
        setTimeout(() => t.classList.remove("almost"), 600);
    });
}

// --- EMBARALHAR GRID ---
export function embaralharGrid() {
    estado.jogadoresRestantes = embaralhar(estado.jogadoresRestantes);
    renderizarGrid();
}

// --- LIMPAR SELEÇÃO ---
export function limparSelecao() {
    estado.selecionados = [];
    renderizarGrid();
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarResultadoFinal(venceu) {
    document.getElementById("playersGrid").classList.add("hidden");
    document.querySelector(".lives-area").classList.add("hidden");
    document.querySelector(".game-actions").classList.add("hidden");

    const final = document.getElementById("finalResult");
    final.classList.remove("hidden");

    const icon = document.getElementById("finalIcon");
    const title = document.getElementById("finalTitle");
    const text = document.getElementById("finalText");

    if (venceu) {
        icon.textContent = "";
        title.textContent = "Parabéns!";
        text.textContent = "Você encontrou todos os grupos!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        icon.textContent = "";
        title.textContent = "Fim de jogo!";
        text.textContent = "Suas tentativas acabaram. Veja os grupos:";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    const groupsDiv = document.getElementById("finalGroups");
    groupsDiv.innerHTML = "";
    estado.puzzleAtual.grupos.forEach(g => {
        const item = document.createElement("div");
        item.className = "final-group-item";
        item.style.backgroundColor = g.cor;
        item.innerHTML = `
            <div class="fg-cat">${g.categoria}</div>
            <div class="fg-players">${g.jogadores.join(", ")}</div>
        `;
        groupsDiv.appendChild(item);
    });
}

// --- RESETAR VISUAL ---
export function resetarVisual() {
    document.getElementById("playersGrid").classList.remove("hidden");
    document.querySelector(".lives-area").classList.remove("hidden");
    document.querySelector(".game-actions").classList.remove("hidden");
    document.getElementById("finalResult").classList.add("hidden");
    document.getElementById("solvedGroups").innerHTML = "";
    document.getElementById("feedbackMsg").classList.add("hidden");

    document.querySelectorAll("#livesDots .dot").forEach(d => d.classList.remove("lost"));
}
