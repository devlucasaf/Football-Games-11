import { estado } from "./core.js";
import { obterCoordenadasPosicao, obterLabelPosicao } from "./data.js";

const els = {
    pontuacao:      () => document.getElementById("pontuacao"),
    posicaoAtual:   () => document.getElementById("posicaoAtual"),
    timeANome:      () => document.getElementById("timeANome"),
    timeATemp:      () => document.getElementById("timeATemp"),
    timeBNome:      () => document.getElementById("timeBNome"),
    timeBTemp:      () => document.getElementById("timeBTemp"),
    escolhaArea:    () => document.getElementById("escolhaArea"),
    cardA:          () => document.getElementById("cardA"),
    cardB:          () => document.getElementById("cardB"),
    nomeA:          () => document.getElementById("nomeA"),
    nomeB:          () => document.getElementById("nomeB"),
    posLabelA:      () => document.getElementById("posLabelA"),
    posLabelB:      () => document.getElementById("posLabelB"),
    playersLayer:   () => document.getElementById("playersLayer"),
    fieldWrapper:   () => document.querySelector(".field-wrapper"),
    dueloHeader:    () => document.getElementById("dueloHeader"),
    feedback:       () => document.getElementById("feedback"),
    feedbackText:   () => document.getElementById("feedbackText"),
    finalResult:    () => document.getElementById("finalResult"),
    finalPoints:    () => document.getElementById("finalPoints"),
    finalDetails:   () => document.getElementById("finalDetails")
};

// --- CONFIGURAR DUELO ---
export function configurarDuelo(duelo) {
    els.timeANome().textContent = duelo.timeA.nome;
    els.timeATemp().textContent = duelo.timeA.temporada;
    els.timeBNome().textContent = duelo.timeB.nome;
    els.timeBTemp().textContent = duelo.timeB.temporada;
    els.dueloHeader().classList.remove("hidden");
    els.fieldWrapper().classList.remove("hidden");
    els.escolhaArea().classList.remove("hidden");
    els.finalResult().classList.add("hidden");
    els.pontuacao().textContent = "0";
    renderizarCampoVazio();
}

// --- RENDERIZAR CAMPO VAZIO COM SLOTS ---
function renderizarCampoVazio() {
    const layer = els.playersLayer();
    layer.innerHTML = "";

    estado.dueloAtual.posicoes.forEach((pos, idx) => {
        const coord = obterCoordenadasPosicao(pos.posicao);
        const label = obterLabelPosicao(pos.posicao);

        const slot = document.createElement("div");
        slot.className = "player-slot";
        slot.id = `slot-${idx}`;
        slot.style.top = `${coord.top}%`;
        slot.style.left = `${coord.left}%`;

        slot.innerHTML = `
            <div class="player-circle">${label}</div>
            <span class="player-label">?</span>
        `;

        layer.appendChild(slot);
    });
}

// --- MOSTRAR POSIÇÃO PARA ESCOLHA ---
export function mostrarEscolha(posicao) {
    const label = obterLabelPosicao(posicao.posicao);
    els.posicaoAtual().textContent = `${estado.posicaoIdx + 1}/11 — ${label}`;
    els.nomeA().textContent = posicao.jogadorA;
    els.nomeB().textContent = posicao.jogadorB;
    els.posLabelA().textContent = estado.dueloAtual.timeA.nome;
    els.posLabelB().textContent = estado.dueloAtual.timeB.nome;

    const cardA = els.cardA();
    const cardB = els.cardB();
    cardA.classList.remove("correct", "wrong", "disabled");
    cardB.classList.remove("correct", "wrong", "disabled");
    cardA.disabled = false;
    cardB.disabled = false;
}

// --- REVELAR RESULTADO DA ESCOLHA ---
export function revelarResultado(escolha, correto, posicao) {
    const cardA = els.cardA();
    const cardB = els.cardB();
    cardA.disabled = true;
    cardB.disabled = true;

    if (escolha === "A") {
        cardA.classList.add(correto ? "correct" : "wrong");
        if (!correto) {
            cardB.classList.add("correct");
        }
    } else {
        cardB.classList.add(correto ? "correct" : "wrong");
        if (!correto) {
            cardA.classList.add("correct");
        }
    }

    const fb = els.feedback();
    fb.classList.remove("hidden", "correct", "wrong");
    fb.classList.add(correto ? "correct" : "wrong");
    els.feedbackText().textContent = correto ? "✓ Correto!" : "✗ Errado!";
    setTimeout(() => fb.classList.add("hidden"), 1200);
}

// --- COLOCAR JOGADOR NO CAMPO ---
export function colocarJogadorNoCampo(idx, nome, correto) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) {
        return;
    }

    slot.classList.add("revealed", correto ? "correct" : "wrong");
    slot.querySelector(".player-circle").innerHTML = correto
        ? "<i class=\"fas fa-check\"></i>"
        : "<i class=\"fas fa-times\"></i>";
    slot.querySelector(".player-label").textContent = nome;
}

// --- ATUALIZAR PONTUAÇÃO ---
export function atualizarPontuacao() {
    els.pontuacao().textContent = estado.acertos;
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarResultadoFinal() {
    els.escolhaArea().classList.add("hidden");
    els.dueloHeader().classList.add("hidden");
    els.finalResult().classList.remove("hidden");

    els.finalPoints().textContent = `${estado.acertos}/11`;

    const pct = Math.round((estado.acertos / 11) * 100);
    let msg = "";
    if (pct === 100) {
        msg = "Perfeito! Você é um técnico de elite!";
    } else if (pct >= 72) {
        msg = "Ótimo! Grande conhecimento tático!";
    } else if (pct >= 45) {
        msg = "Bom, mas pode melhorar!";
    } else {
        msg = "Continue praticando!";
    }

    let detalhes = `<p>${msg}</p><p>${estado.acertos}/11 acertos (${pct}%)</p>`;
    detalhes += "<div class=\"final-choices\">";
    estado.escolhas.forEach(e => {
        const icon = e.correto ? "✓" : "✗";
        const cls = e.correto ? "choice-correct" : "choice-wrong";
        const melhor = e.correto
            ? (e.escolha === "A" ? e.jogadorA : e.jogadorB)
            : (e.escolha === "A" ? e.jogadorB : e.jogadorA);
        detalhes += `<p class="${cls}">${icon} ${obterLabelPosicao(e.posicao)}: ${melhor}</p>`;
    });
    detalhes += "</div>";
    els.finalDetails().innerHTML = detalhes;
}
