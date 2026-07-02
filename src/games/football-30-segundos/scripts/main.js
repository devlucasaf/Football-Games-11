import { estado } from "./core.js";
import { carregarDados, sortearCategoria, encontrarResposta } from "./data.js";

const els = {
    gameArea:      document.getElementById("gameArea"),
    timerValue:    document.getElementById("timerValue"),
    timerBox:      document.getElementById("timerBox"),
    timerFill:     document.getElementById("timerFill"),
    acertosCount:  document.getElementById("acertosCount"),
    totalPossivel: document.getElementById("totalPossivel"),
    perguntaTexto: document.getElementById("perguntaTexto"),
    guessInput:    document.getElementById("guessInput"),
    guessFeedback: document.getElementById("guessFeedback"),
    hitsList:      document.getElementById("hitsList"),
    finalResult:   document.getElementById("finalResult"),
    finalPoints:   document.getElementById("finalPoints"),
    finalLabel:    document.getElementById("finalLabel"),
    finalQuestion: document.getElementById("finalQuestion"),
    finalHits:     document.getElementById("finalHits"),
    finalMisses:   document.getElementById("finalMisses")
};

// --- MOSTRA FEEDBACK RÁPIDO NO CAMPO ---
let feedbackTimeout = null;
function mostrarFeedback(texto, tipo) {
    els.guessFeedback.textContent = texto;
    els.guessFeedback.className = `guess-feedback ${tipo}`;
    els.guessFeedback.classList.remove("hidden");

    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        els.guessFeedback.classList.add("hidden");
    }, 1200);
}

// --- RENDERIZA UM ACERTO NA LISTA ---
function adicionarAcertoVisual(nome) {
    const chip = document.createElement("div");
    chip.className = "s30-hit-chip";
    chip.innerHTML = `<i class="fas fa-check"></i> ${nome}`;
    els.hitsList.prepend(chip);
    els.acertosCount.textContent = estado.acertos.length;
}

// --- VERIFICA O PALPITE ---
function verificarPalpite() {
    if (!estado.jogando) {
        return;
    }

    const palpite = els.guessInput.value.trim();
    if (!palpite) {
        return;
    }

    const resposta = encontrarResposta(palpite);
    els.guessInput.value = "";

    if (!resposta) {
        mostrarFeedback("Não está na lista!", "wrong");
        return;
    }

    if (estado.acertos.includes(resposta.nome)) {
        mostrarFeedback("Você já disse esse!", "hint");
        return;
    }

    estado.acertos.push(resposta.nome);
    adicionarAcertoVisual(resposta.nome);
    mostrarFeedback("Correto!", "correct");
}

// --- ATUALIZA O RELÓGIO ---
function atualizarTimer() {
    els.timerValue.textContent = estado.tempoRestante;
    const pct = (estado.tempoRestante / estado.tempoTotal) * 100;
    els.timerFill.style.width = `${pct}%`;

    if (estado.tempoRestante <= 10) {
        els.timerBox.classList.add("urgente");
    } else {
        els.timerBox.classList.remove("urgente");
    }
}

// --- TICK DO RELÓGIO ---
function tick() {
    estado.tempoRestante--;
    atualizarTimer();

    if (estado.tempoRestante <= 0) {
        finalizar();
    }
}

// --- FINALIZA A PARTIDA ---
function finalizar() {
    clearInterval(estado.timerId);
    estado.jogando = false;
    els.guessInput.disabled = true;

    const total = estado.categoriaAtual.respostas.length;
    els.finalPoints.textContent = estado.acertos.length;
    els.finalLabel.textContent = ` / ${total}`;
    els.finalQuestion.textContent = estado.categoriaAtual.pergunta;

    els.finalHits.innerHTML = "";
    els.finalMisses.innerHTML = "";

    estado.categoriaAtual.respostas.forEach((r) => {
        const item = document.createElement("div");
        item.className = "s30-final-item";
        item.textContent = r.nome;

        if (estado.acertos.includes(r.nome)) {
            item.classList.add("hit");
            els.finalHits.appendChild(item);
        } else {
            item.classList.add("miss");
            els.finalMisses.appendChild(item);
        }
    });

    if (els.finalHits.childElementCount === 0) {
        els.finalHits.innerHTML = "<span class=\"s30-empty\">—</span>";
    }
    
    if (els.finalMisses.childElementCount === 0) {
        els.finalMisses.innerHTML = "<span class=\"s30-empty\">—</span>";
    }

    els.gameArea.classList.add("hidden");
    els.finalResult.classList.remove("hidden");
}

// --- INICIA O JOGO ---
function iniciarJogo() {
    clearInterval(estado.timerId);

    sortearCategoria();
    estado.tempoRestante = estado.tempoTotal;
    estado.acertos = [];
    estado.jogando = true;

    els.perguntaTexto.textContent = estado.categoriaAtual.pergunta;
    els.totalPossivel.textContent = `/${estado.categoriaAtual.respostas.length}`;
    els.acertosCount.textContent = "0";
    els.hitsList.innerHTML = "";
    els.guessFeedback.classList.add("hidden");
    els.guessInput.value = "";
    els.guessInput.disabled = false;

    atualizarTimer();

    els.finalResult.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.guessInput.focus();

    estado.timerId = setInterval(tick, 1000);
}

// --- INICIALIZA O JOGO ---
async function init() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    els.guessInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            verificarPalpite();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-30-segundos";

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            tutorialOverlay.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(skipKey, "true");
            tutorialOverlay.classList.add("hidden");
            iniciarJogo();
        });
    }
}

init();
