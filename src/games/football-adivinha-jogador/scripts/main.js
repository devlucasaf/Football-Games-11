import estado from "./core.js";
import { carregarDados, escolherJogador, obterNomesJogadores } from "./data.js";
import { normalizar } from "./utils.js";
import {
    preencherPistas, resetarCards, revelarCard, revelarTodos,
    atualizarContador, atualizarPlacar,
    mostrarResultado, esconderResultado,
    mostrarFeedbackErro, esconderFeedbackErro,
    limparInput, focarInput, desabilitarInput, habilitarInput,
    mostrarSugestoes, esconderSugestoes
} from "./ui.js";

// --- CALCULAR PONTOS ---
function calcularPontos() {
    return Math.max(7 - estado.pistasReveladas, 1);
}

// --- VERIFICAR PALPITE ---
function verificarPalpite(palpite) {
    if (!estado.jogoAtivo) {
        return;
    }

    const respostaNorm = normalizar(estado.jogadorAtual.nome);
    const palpiteNorm = normalizar(palpite);

    if (!palpiteNorm) {
        return;
    }

    estado.tentativas++;

    if (palpiteNorm === respostaNorm) {
        estado.jogoAtivo = false;
        estado.acertos++;
        estado.totalRodadas++;
        estado.sequencia++;
        if (estado.sequencia > estado.melhorSequencia) {
            estado.melhorSequencia = estado.sequencia;
        }

        const pts = calcularPontos();
        estado.pontos += pts;

        revelarTodos();
        desabilitarInput();
        esconderFeedbackErro();
        atualizarPlacar();

        setTimeout(() => {
            mostrarResultado(
                "Acertou!",
                `O jogador era ${estado.jogadorAtual.nome}! +${pts} pontos (${estado.pistasReveladas} pista${estado.pistasReveladas > 1 ? "s" : ""}).`,
                "<i class='fas fa-check-circle' style='color:#2ecc71'></i>"
            );
        }, 600);
    } else {
        if (estado.pistasReveladas >= 6) {
            finalizarErro();
        } else {
            mostrarFeedbackErro("Não é esse! Tente novamente ou revele mais pistas.");
            limparInput();
            focarInput();
        }
    }
}

// --- FINALIZAR COM ERRO ---
function finalizarErro() {
    estado.jogoAtivo = false;
    estado.totalRodadas++;
    estado.sequencia = 0;

    revelarTodos();
    desabilitarInput();
    esconderFeedbackErro();
    atualizarPlacar();

    setTimeout(() => {
        mostrarResultado(
            "Não foi dessa vez!",
            `O jogador era ${estado.jogadorAtual.nome}.`,
            "<i class='fas fa-times-circle' style='color:#e74c3c'></i>"
        );
    }, 600);
}

// --- PRÓXIMA RODADA ---
function proximaRodada() {
    esconderResultado();
    esconderFeedbackErro();
    escolherJogador();
    preencherPistas();
    resetarCards();
    atualizarContador();
    limparInput();
    habilitarInput();
    focarInput();
    atualizarPlacar();
}

// --- FILTRAR SUGESTÕES DO AUTOCOMPLETE ---
function filtrarSugestoes(texto) {
    if (!texto || texto.length < 2) {
        esconderSugestoes();
        return;
    }

    const norm = normalizar(texto);
    const nomes = obterNomesJogadores();
    const filtrados = nomes.filter(n => normalizar(n).includes(norm));
    mostrarSugestoes(filtrados);
}

// --- CLIQUE NO CARD DE PISTA ---
function onCardClick(e) {
    if (!estado.jogoAtivo) {
        return;
    }

    const card = e.target.closest(".pista-card");
    if (!card || !card.classList.contains("oculto")) {
        return;
    }

    const idx = parseInt(card.dataset.idx);
    revelarCard(idx);
}

// --- CONFIGURAR EVENTOS ---
function configurarEventos() {
    const input = document.getElementById("palpiteInput");
    const confirmarBtn = document.getElementById("confirmarBtn");
    const proximaBtn = document.getElementById("proximaRodadaBtn");
    const sugestoesLista = document.getElementById("sugestoesLista");
    const pistasGrid = document.getElementById("pistasGrid");

    confirmarBtn.addEventListener("click", () => {
        verificarPalpite(input.value);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            verificarPalpite(input.value);
        }
    });

    proximaBtn.addEventListener("click", () => proximaRodada());

    input.addEventListener("input", () => {
        filtrarSugestoes(input.value);
    });

    sugestoesLista.addEventListener("click", (e) => {
        const item = e.target.closest(".sugestao-item");
        if (item) {
            input.value = item.textContent;
            esconderSugestoes();
            verificarPalpite(input.value);
        }
    });

    pistasGrid.addEventListener("click", onCardClick);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            esconderSugestoes();
        }
    });
}

// --- INICIALIZAR ---
async function iniciar() {
    try {
        await carregarDados();
        escolherJogador();
        preencherPistas();
        resetarCards();
        atualizarContador();
        atualizarPlacar();
        configurarEventos();
        focarInput();
    } catch (erro) {
        console.error("Erro ao inicializar Football Adivinha Jogador:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => iniciar());
