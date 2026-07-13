import { estado } from "./core.js";
import { carregarDados, sortearCategoria, encontrarResposta, obterNomes } from "./data.js";

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
    suggestions:   document.getElementById("suggestions"),
    hitsList:      document.getElementById("hitsList"),
    finalResult:   document.getElementById("finalResult"),
    finalPoints:   document.getElementById("finalPoints"),
    finalLabel:    document.getElementById("finalLabel"),
    finalQuestion: document.getElementById("finalQuestion"),
    finalHits:     document.getElementById("finalHits"),
    finalMisses:   document.getElementById("finalMisses")
};

// --- AUTOCOMPLETE ---
let nomesDisponiveis = [];
let sugestaoAtiva = -1;

function esconderSugestoes() {
    els.suggestions.classList.add("hidden");
    els.suggestions.innerHTML = "";
    sugestaoAtiva = -1;
}

function selecionarSugestao(nome) {
    els.guessInput.value = nome;
    esconderSugestoes();
    els.guessInput.focus();
}

function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, i) => {
        item.classList.toggle("active", i === sugestaoAtiva);
        if (i === sugestaoAtiva) {
            item.scrollIntoView({ block: "nearest" });
        }
    });
}

function renderizarSugestoes() {
    const termo = els.guessInput.value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const filtrados = nomesDisponiveis
        .filter((nome) => nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(termo))
        .slice(0, 8);

    if (filtrados.length === 0) {
        esconderSugestoes();
        return;
    }

    els.suggestions.innerHTML = "";
    filtrados.forEach((nome) => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.innerHTML = `<i class="fas fa-user"></i><span>${nome}</span>`;
        li.addEventListener("mousedown", (e) => {
            e.preventDefault();
            selecionarSugestao(nome);
        });
        els.suggestions.appendChild(li);
    });
    els.suggestions.classList.remove("hidden");
}

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
    esconderSugestoes();

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

    if (estado.acertos.length >= Math.ceil(total / 2)) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

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

    if (window.FG11Stats) {
        const acertos = estado.acertos.length;
        const venceu = acertos >= Math.ceil(total / 2);
        const rotulos = Array.from({ length: total + 1 }, (_, i) => String(i));
        window.FG11Stats.registrar("football-30-segundos", {
            venceu,
            bucket: acertos,
            tamanho: total + 1
        });
        window.FG11Stats.mostrarModal("football-30-segundos", {
            venceu,
            titulo: "Tempo esgotado!",
            resposta: `Você citou ${acertos} de ${total}`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Acertos por partida",
            bucketAtual: acertos,
            onReiniciar: iniciarJogo,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
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
    esconderSugestoes();

    atualizarTimer();

    els.finalResult.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.guessInput.focus();

    estado.timerId = setInterval(tick, 1000);
}

// --- INICIALIZA O JOGO ---
async function init() {
    await carregarDados();
    nomesDisponiveis = obterNomes();

    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    els.guessInput.addEventListener("input", renderizarSugestoes);
    els.guessInput.addEventListener("keydown", (e) => {
        const itens = [...els.suggestions.querySelectorAll(".suggestion-item")];

        if (e.key === "ArrowDown" && itens.length > 0) {
            e.preventDefault();
            sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (e.key === "ArrowUp" && itens.length > 0) {
            e.preventDefault();
            sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (e.key === "Enter") {
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                e.preventDefault();
                selecionarSugestao(itens[sugestaoAtiva].querySelector("span").textContent);
            } else {
                verificarPalpite();
            }
        } else if (e.key === "Escape") {
            esconderSugestoes();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-autocomplete")) {
            esconderSugestoes();
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
