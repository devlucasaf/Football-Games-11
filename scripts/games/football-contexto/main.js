import estado from "./core.js";
import { carregarDados, sortearSecreto, buscarJogador, obterNomes, calcularSimilaridade, normalizar } from "./data.js";

const els = {
    palpiteInput:       document.getElementById("palpiteInput"),
    autocompleteList:   document.getElementById("autocompleteList"),
    palpitesList:       document.getElementById("palpitesList"),
    numPalpites:        document.getElementById("numPalpites"),
    gameArea:           document.getElementById("gameArea"),
    finalResult:        document.getElementById("finalResult"),
    finalTentativas:    document.getElementById("finalTentativas"),
    finalPlayer:        document.getElementById("finalPlayer"),
    finalMessage:       document.getElementById("finalMessage"),
    gameInfo:           document.getElementById("gameInfo"),
    guessFeedback:      document.getElementById("guessFeedback")
};

let nomes = [];

function renderizarPalpites() {
    const ordenados = [...estado.palpites].sort((a, b) => b.score - a.score);

    els.palpitesList.innerHTML = "";
    ordenados.forEach((p, idx) => {
        const div = document.createElement("div");
        div.className = `palpite-item ${p.score === 100 ? "correto" : ""}`;

        const posicao = idx + 1;
        const barWidth = Math.max(p.score, 2);

        let barClass = "bar-cold";
        if (p.score >= 80) {
            barClass = "bar-hot";
        } else if (p.score >= 50) {
            barClass = "bar-warm";
        } else if (p.score >= 25) {
            barClass = "bar-cool";
        }

        div.innerHTML = `
            <div class="palpite-rank">
                #${posicao}
            </div>
            <div class="palpite-nome">
                ${p.nome}
            </div>
            <div class="palpite-bar-wrapper">
                <div class="palpite-bar ${barClass}" style="width: ${barWidth}%"></div>
            </div>
            <div class="palpite-score">
                ${p.score}
            </div>
        `;
        els.palpitesList.appendChild(div);
    });
}

function verificarPalpite(nome) {
    if (!nome) {
        return;
    }

    if (estado.palpites.some(p => normalizar(p.nome) === normalizar(nome))) {
        els.guessFeedback.textContent = `Você já tentou "${nome}"!`;
        els.guessFeedback.className = "guess-feedback duplicado";
        els.guessFeedback.classList.remove("hidden");
        return;
    }

    const jogador = buscarJogador(nome);
    if (!jogador) {
        els.guessFeedback.textContent = `Jogador não encontrado!`;
        els.guessFeedback.className = "guess-feedback wrong";
        els.guessFeedback.classList.remove("hidden");
        return;
    }

    els.guessFeedback.classList.add("hidden");

    const score = calcularSimilaridade(jogador);
    estado.palpites.push({ 
        nome: jogador.nome, 
        score 
    });
    els.numPalpites.textContent = estado.palpites.length;

    renderizarPalpites();

    if (score === 100) {
        estado.encontrou = true;
        setTimeout(() => mostrarFinal(true), 600);
    } else if (estado.palpites.length >= estado.maxPalpites) {
        setTimeout(() => mostrarFinal(false), 600);
    }

    els.palpiteInput.value = "";
    els.palpiteInput.focus();
}

function mostrarFinal(acertou) {
    els.gameArea.classList.add("hidden");
    els.gameInfo.classList.add("hidden");
    els.finalResult.classList.remove("hidden");

    els.finalPlayer.textContent = estado.secreto.nome;
    els.finalTentativas.textContent = estado.palpites.length;

    if (acertou) {
        const tentativas = estado.palpites.length;
        if (tentativas <= 3) {
            els.finalMessage.textContent = "Inacreditável! Você é um gênio!";
        } else if (tentativas <= 8) {
            els.finalMessage.textContent = "Excelente! Ótimo conhecimento!";
        } else if (tentativas <= 15) {
            els.finalMessage.textContent = "Muito bem! Conseguiu!";
        } else {
            els.finalMessage.textContent = "Acertou no limite!";
        }
    } else {
        els.finalMessage.textContent = "Não conseguiu desta vez!";
    }
}

function iniciarJogo() {
    estado.palpites = [];
    estado.encontrou = false;
    estado.secreto = null;
    els.numPalpites.textContent = "0";
    els.palpitesList.innerHTML = "";
    els.palpiteInput.value = "";
    els.guessFeedback.classList.add("hidden");
    els.finalResult.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.gameInfo.classList.remove("hidden");
    sortearSecreto();
    els.palpiteInput.focus();
}

// --- AUTOCOMPLETE ---
function atualizarAutocomplete(val) {
    const list = els.autocompleteList;
    list.innerHTML = "";

    if (val.length < 2) {
        list.classList.add("hidden");
        return;
    }

    const jaUsados = estado.palpites.map(p => normalizar(p.nome));
    const filtrados = nomes.filter(n =>
        normalizar(n).includes(normalizar(val)) && !jaUsados.includes(normalizar(n))
    );

    if (filtrados.length === 0) {
        list.classList.add("hidden");
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const li = document.createElement("li");
        li.textContent = nome;
        li.addEventListener("click", () => {
            verificarPalpite(nome);
            list.classList.add("hidden");
        });
        list.appendChild(li);
    });

    list.classList.remove("hidden");
}

// --- EVENTS ---
els.palpiteInput.addEventListener("input", (e) => {
    atualizarAutocomplete(e.target.value);
});

els.palpiteInput.addEventListener("keydown", (e) => {
    const list = els.autocompleteList;
    const items = list.querySelectorAll("li");
    const active = list.querySelector("li.active");

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!active && items.length > 0) {
            items[0].classList.add("active");
        } else if (active && active.nextElementSibling) {
            active.classList.remove("active");
            active.nextElementSibling.classList.add("active");
        }
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active && active.previousElementSibling) {
            active.classList.remove("active");
            active.previousElementSibling.classList.add("active");
        }
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (active) {
            verificarPalpite(active.textContent);
            list.classList.add("hidden");
        } else if (items.length > 0) {
            verificarPalpite(items[0].textContent);
            list.classList.add("hidden");
        }
    } else if (e.key === "Escape") {
        list.classList.add("hidden");
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-wrapper")) {
        els.autocompleteList.classList.add("hidden");
    }
});

document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../index.html";
});

document.getElementById("btnDesistir").addEventListener("click", () => {
    mostrarFinal(false);
});

// --- TUTORIAL ---
const tutorialOverlay = document.getElementById("tutorialOverlay");
const gameKey = tutorialOverlay?.dataset.game;

if (gameKey && localStorage.getItem(`tutorial_${gameKey}`) === "skip") {
    tutorialOverlay.classList.add("hidden");
} 

document.getElementById("tutorialStartBtn")?.addEventListener("click", () => {
    tutorialOverlay.classList.add("hidden");
});

document.getElementById("tutorialSkipBtn")?.addEventListener("click", () => {
    localStorage.setItem(`tutorial_${gameKey}`, "skip");
    tutorialOverlay.classList.add("hidden");
});

document.getElementById("tutorialHelpBtn")?.addEventListener("click", () => {
    tutorialOverlay.classList.remove("hidden");
});

// --- INIT ---
async function init() {
    await carregarDados();
    nomes = obterNomes();
    iniciarJogo();
}

init();
