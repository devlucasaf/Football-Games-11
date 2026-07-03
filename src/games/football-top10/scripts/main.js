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

// --- REFERÊNCIAS AOS ELEMENTOS DOM ---
const $confirmarBtn = document.getElementById("confirmarBtn");
const $desistirBtn = document.getElementById("desistirBtn");
const $proximaRodadaBtn = document.getElementById("proximaRodadaBtn");
const $input = document.getElementById("palpiteInput");

// --- INÍCIO DE UMA NOVA RODADA ---
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

// --- VERIFICAÇÃO DO PALPITE DO USUÁRIO ---
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

// --- FUNÇÃO PARA DESISTIR DA RODADA ---
function desistir() {
    if (!estado.jogoAtivo) return;
    revelarTodos();
    finalizarRodada();
}

// --- FINALIZAÇÃO DA RODADA ---
function finalizarRodada() {
    estado.jogoAtivo = false;
    desabilitarInput();

    const total = estado.listaAtual.itens.length;
    const acertos = estado.acertosRodada;
    const pontos = acertos * 10 + (acertos === total ? 20 : 0);

    mostrarResultado(acertos, total, pontos);
}

// --- EVENTOS DOS BOTÕES ---
$confirmarBtn.addEventListener("click", verificarPalpite);

// --- EVENTO DE TECLA ENTER NO INPUT ---
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

// --- INICIALIZAÇÃO DO JOGO ---
async function init() {
    await carregarDados();
    iniciarRodada();
}

init();