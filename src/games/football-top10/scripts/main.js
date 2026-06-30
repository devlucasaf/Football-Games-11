import estado from "./core.js";
import { normalizar } from "./utils.js";
import { carregarDados, escolherLista } from "./data.js";
import {
    renderizarTema,
    renderizarLista,
    revelarItem,
    revelarTodos,
    atualizarPlacar,
    mostrarFeedback,
    mostrarResultado,
    fecharResultado,
    inicializarSugestoes,
    limparInput,
    focarInput,
    desabilitarInput,
    habilitarInput
} from "./ui.js";

// --- ELEMENTOS ---
const $confirmarBtn = document.getElementById("confirmarBtn");
const $desistirBtn = document.getElementById("desistirBtn");
const $proximaRodadaBtn = document.getElementById("proximaRodadaBtn");
const $input = document.getElementById("palpiteInput");

function iniciarRodada() {
    const lista = escolherLista();

    estado.acertosRodada = 0;
    estado.vidas = 3;
    estado.jogoAtivo = true;
    estado.itensAcertados = new Set();
    estado.totalRodadas++;

    renderizarTema(lista);
    renderizarLista(lista);
    atualizarPlacar();
    habilitarInput();
    limparInput();
    focarInput();
    fecharResultado();
}

function verificarPalpite() {
    if (!estado.jogoAtivo) {
        return;
    }

    const valor = $input.value.trim();
    if (!valor) {
        return;
    }

    const valorN = normalizar(valor);
    const itens  = estado.listaAtual.itens;

    const matches = [];
    itens.forEach((item, idx) => {
        if (estado.itensAcertados.has(idx)) {
            return;
        }

        if (normalizar(item.nome) === valorN) {
            matches.push(idx);
        }
    });

    if (matches.length > 0) {
        matches.forEach(idx => {
            estado.itensAcertados.add(idx);
            estado.acertosRodada++;
            revelarItem(idx);
        });

        const pontosGanhos = 10 * matches.length;
        estado.pontosTotal += pontosGanhos;

        atualizarPlacar();
        mostrarFeedback("acerto", `Acertou! +${pontosGanhos} pts`);
        limparInput();
        focarInput();

        if (estado.acertosRodada >= itens.length) {
            const bonus = 20;
            estado.pontosTotal += bonus;
            atualizarPlacar();
            finalizarRodada();
        }
    } else {
        estado.vidas--;
        atualizarPlacar();
        mostrarFeedback("erro", `Errou! Vidas restantes: ${estado.vidas}`);
        limparInput();
        focarInput();

        if (estado.vidas <= 0) {
            revelarTodos();
            finalizarRodada();
        }
    }
}

function desistir() {
    if (!estado.jogoAtivo) return;
    revelarTodos();
    finalizarRodada();
}

function finalizarRodada() {
    estado.jogoAtivo = false;
    desabilitarInput();

    const total = estado.listaAtual.itens.length;
    const acertos = estado.acertosRodada;
    const pontos = acertos * 10 + (acertos === total ? 20 : 0);

    mostrarResultado(acertos, total, pontos);
}

$confirmarBtn.addEventListener("click", verificarPalpite);

const $sugestoes = document.getElementById("sugestoesLista");
$input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const temSugestaoAtiva = $sugestoes.querySelector(".sugestao-item.ativa");
        if (!temSugestaoAtiva) {
            e.preventDefault();
            verificarPalpite();
        }
    }
});

$desistirBtn.addEventListener("click", desistir);

$proximaRodadaBtn.addEventListener("click", iniciarRodada);

inicializarSugestoes(verificarPalpite);

async function init() {
    await carregarDados();
    iniciarRodada();
}

init();
