import { estado } from "./core.js";
import { carregarDados, sortear, normalizar, obterNomes } from "./data.js";
import {
    atualizarRodada,
    atualizarAcertos,
    configurarRodada,
    atualizarTentativas,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    resetarUI,
    getInput
} from "./ui.js";

let nomesDisponiveis = [];
let sugestaoAtiva = -1;
const guessInput = () => document.getElementById("guessInput");
const suggestions = () => document.getElementById("suggestions");

// --- ESCONDER SUGESTÕES ---
function esconderSugestoes() {
    const lista = suggestions();
    lista.classList.add("hidden");
    lista.innerHTML = "";
    sugestaoAtiva = -1;
}

// --- SELECIONAR UMA SUGESTÃO ---
function selecionarSugestao(nome) {
    guessInput().value = nome;
    esconderSugestoes();
    guessInput().focus();
}

// --- ATUALIZAR DESTAQUE DA SUGESTÃO ATIVA ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, i) => {
        item.classList.toggle("active", i === sugestaoAtiva);
        if (i === sugestaoAtiva) {
            item.scrollIntoView({ block: "nearest" });  
        }
    });
}

// --- RENDERIZAR SUGESTÕES ---
function renderizarSugestoes() {
    const termo = normalizar(guessInput().value);
    const lista = suggestions();
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const filtrados = nomesDisponiveis
        .filter(nome => normalizar(nome).includes(termo))
        .slice(0, 8);

    if (filtrados.length === 0) {
        esconderSugestoes();
        return;
    }

    lista.innerHTML = "";
    filtrados.forEach(nome => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.innerHTML = `<i class="fas fa-user"></i><span>${nome}</span>`;
        li.addEventListener("mousedown", (e) => {
            e.preventDefault();  
            selecionarSugestao(nome);
        });
        lista.appendChild(li);
    });
    lista.classList.remove("hidden");
}

// --- EXIBIR A RODADA ATUAL ---
function mostrarRodada() {
    const conexao = estado.sorteadas[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRestantes = 3;
    configurarRodada(conexao);
    esconderSugestoes();
}

// --- VERIFICAR PALPITE DO USUÁRIO ---
function verificarPalpite() {
    const palpite = getInput();
    esconderSugestoes();
    if (!palpite) {
        return;
    }

    const conexao = estado.sorteadas[estado.rodadaAtual];
    const acertou = conexao.respostas.some(r => normalizar(r) === normalizar(palpite));

    if (acertou) {
        estado.acertos++;
        atualizarAcertos();
        mostrarResultadoRodada(true, palpite, conexao);
    } else {
        estado.tentativasRestantes--;
        atualizarTentativas();

        if (estado.tentativasRestantes <= 0) {
            mostrarResultadoRodada(false, null, conexao);  
        } else {
            mostrarFeedbackErro(palpite);                  
        }
    }
}

// --- AVANÇAR PARA PRÓXIMA RODADA ---
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
    nomesDisponiveis = obterNomes();

    // --- EVENTOS DOS BOTÕES PRINCIPAIS ---
    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    // --- EVENTOS DO CAMPO DE INPUT ---
    const input = guessInput();
    input.addEventListener("input", renderizarSugestoes);  
    input.addEventListener("keydown", (e) => {
        const itens = [...suggestions().querySelectorAll(".suggestion-item")];

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
    const skipKey = "tutorial_skip_football-conecta-clubes";

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
