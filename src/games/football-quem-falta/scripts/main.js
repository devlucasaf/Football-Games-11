import { estado } from "./core.js";
import { carregarDados, sortear, normalizar, obterNomes } from "./data.js";
import {
    atualizarRodada,
    atualizarAcertos,
    configurarRodada,
    revelarResposta,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    resetarUI,
    getInput
} from "./ui.js";

const guessInput = document.getElementById("guessInput");
const suggestions = document.getElementById("suggestions");
let sugestaoAtiva = -1;

// --- RENDERIZA AS SUGESTÕES DE NOMES ---
function renderizarSugestoes() {
    const termo = normalizar(guessInput.value.trim());
    suggestions.innerHTML = "";
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const encontrados = obterNomes()
        .filter(nome => normalizar(nome).includes(termo))
        .slice(0, 8);

    if (encontrados.length === 0) {
        esconderSugestoes();
        return;
    }

    encontrados.forEach((nome) => {
        const item = document.createElement("li");
        item.className = "suggestion-item";
        item.innerHTML = `<i class="fas fa-user"></i><span>${nome}</span>`;
        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            selecionarSugestao(nome);
        });
        suggestions.appendChild(item);
    });

    suggestions.classList.remove("hidden");
}

// --- SELECIONA UMA SUGESTÃO E ENVIA O PALPITE ---
function selecionarSugestao(nome) {
    guessInput.value = nome;
    esconderSugestoes();
    verificar();
}

// --- ESCONDE A LISTA DE SUGESTÕES ---
function esconderSugestoes() {
    suggestions.classList.add("hidden");
    suggestions.innerHTML = "";
    sugestaoAtiva = -1;
}

// --- ATUALIZA O ITEM DESTACADO NA NAVEGAÇÃO POR TECLADO ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, i) => item.classList.toggle("active", i === sugestaoAtiva));
    if (itens[sugestaoAtiva]) {
        itens[sugestaoAtiva].scrollIntoView({ block: "nearest" });
    }
}

// --- MOSTRAR RODADA ---
function mostrarRodada() {
    const desafio = estado.sorteados[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRodada = 2;
    estado.usouDica = false;
    esconderSugestoes();
    configurarRodada(desafio);
}

// --- VERIFICAR PALPITE ---
function verificar() {
    const palpite = getInput();
    if (!palpite) {
        return;
    }

    esconderSugestoes();

    const desafio = estado.sorteados[estado.rodadaAtual];
    const resposta = desafio.lista[desafio.escondido];

    if (normalizar(palpite) === normalizar(resposta)) {
        estado.acertos++;
        atualizarAcertos();
        revelarResposta(resposta);
        setTimeout(() => mostrarResultadoRodada(true, resposta), 800);
    } else {
        estado.tentativasRodada--;

        if (estado.tentativasRodada <= 0) {
            mostrarResultadoRodada(false, resposta);
        } else {
            mostrarFeedbackErro();
        }
    }
}

// --- PRÓXIMA RODADA ---
function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    resetarUI();
    sortear();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificar);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
    document.getElementById("btnHint").addEventListener("click", () => {
        document.getElementById("hintText").classList.remove("hidden");
        document.getElementById("btnHint").classList.add("used");
        estado.usouDica = true;
    });

    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        const itens = [...suggestions.querySelectorAll(".suggestion-item")];

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "Enter") {
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                selecionarSugestao(itens[sugestaoAtiva].querySelector("span").textContent);
            } else {
                verificar();
            }
        } else if (e.key === "Escape") {
            esconderSugestoes();
        }
    });

    guessInput.addEventListener("input", renderizarSugestoes);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-autocomplete")) {
            esconderSugestoes();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-quem-falta";

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
