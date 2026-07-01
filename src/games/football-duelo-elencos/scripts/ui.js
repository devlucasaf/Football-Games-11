import { estado } from "./core.js";
import { obterCoordenadasPosicao, obterLabelPosicao } from "./data.js";

const els = {
    posicaoAtual: () => document.getElementById("posicaoAtual"),
    timeANome:    () => document.getElementById("timeANome"),
    timeATemp:    () => document.getElementById("timeATemp"),
    timeAEscudo:  () => document.getElementById("timeAEscudo"),
    timeBNome:    () => document.getElementById("timeBNome"),
    timeBTemp:    () => document.getElementById("timeBTemp"),
    timeBEscudo:  () => document.getElementById("timeBEscudo"),
    escolhaArea:  () => document.getElementById("escolhaArea"),
    cardA:        () => document.getElementById("cardA"),
    cardB:        () => document.getElementById("cardB"),
    nomeA:        () => document.getElementById("nomeA"),
    nomeB:        () => document.getElementById("nomeB"),
    posLabelA:    () => document.getElementById("posLabelA"),
    posLabelB:    () => document.getElementById("posLabelB"),
    escudoA:      () => document.getElementById("escudoA"),
    escudoB:      () => document.getElementById("escudoB"),
    playersLayer: () => document.getElementById("playersLayer"),
    fieldWrapper: () => document.querySelector(".field-wrapper"),
    dueloHeader:  () => document.getElementById("dueloHeader"),
    finalResult:  () => document.getElementById("finalResult"),
    finalDetails: () => document.getElementById("finalDetails")
};

// --- DEFINE O ESCUDO EM UMA IMAGEM ---
function definirEscudo(img, url, nomeTime) {
    if (!img) {
        return;
    }

    if (url) {
        img.src = url;
        img.alt = nomeTime || "";
        img.style.display = "";
        img.onerror = () => {
            img.style.display = "none";
        };
    } else {
        img.removeAttribute("src");
        img.style.display = "none";
    }
}

// --- CONFIGURAR DUELO ---
export function configurarDuelo(duelo) {
    els.timeANome().textContent = duelo.timeA.nome;
    els.timeATemp().textContent = duelo.timeA.temporada;
    els.timeBNome().textContent = duelo.timeB.nome;
    els.timeBTemp().textContent = duelo.timeB.temporada;
    definirEscudo(els.timeAEscudo(), duelo.timeA.escudo, duelo.timeA.nome);
    definirEscudo(els.timeBEscudo(), duelo.timeB.escudo, duelo.timeB.nome);
    els.dueloHeader().classList.remove("hidden");
    els.fieldWrapper().classList.remove("hidden");
    els.escolhaArea().classList.remove("hidden");
    els.finalResult().classList.add("hidden");
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
    els.posLabelA().textContent = `${estado.dueloAtual.timeA.nome} · ${estado.dueloAtual.timeA.temporada}`;
    els.posLabelB().textContent = `${estado.dueloAtual.timeB.nome} · ${estado.dueloAtual.timeB.temporada}`;
    definirEscudo(els.escudoA(), estado.dueloAtual.timeA.escudo, estado.dueloAtual.timeA.nome);
    definirEscudo(els.escudoB(), estado.dueloAtual.timeB.escudo, estado.dueloAtual.timeB.nome);

    const cardA = els.cardA();
    const cardB = els.cardB();
    cardA.classList.remove("chosen", "disabled");
    cardB.classList.remove("chosen", "disabled");
    cardA.disabled = false;
    cardB.disabled = false;
}

// --- REGISTRAR ESCOLHA ---
export function registrarEscolha(escolha) {
    const cardA = els.cardA();
    const cardB = els.cardB();
    cardA.disabled = true;
    cardB.disabled = true;

    if (escolha === "A") {
        cardA.classList.add("chosen");
        cardB.classList.add("disabled");
    } else {
        cardB.classList.add("chosen");
        cardA.classList.add("disabled");
    }
}

// --- COLOCAR JOGADOR ESCOLHIDO NO CAMPO ---
export function colocarJogadorNoCampo(idx, nome, escolha) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) {
        return;
    }

    const timeClasse = escolha === "A" ? "time-a" : "time-b";
    slot.classList.add("revealed", timeClasse);
    slot.querySelector(".player-circle").innerHTML = "<i class=\"fas fa-check\"></i>";
    slot.querySelector(".player-label").textContent = nome;
}

// --- MOSTRAR ESCALAÇÃO FINAL ---
export function mostrarResultadoFinal() {
    els.escolhaArea().classList.add("hidden");
    els.dueloHeader().classList.add("hidden");
    els.finalResult().classList.remove("hidden");

    let html = "<div class=\"final-lineup\">";
    estado.escolhas.forEach(e => {
        const timeClasse = e.escolha === "A" ? "lineup-a" : "lineup-b";
        const escudoImg = e.escudo
            ? `<img     
                    class="lineup-escudo" 
                    src="${e.escudo}" 
                    alt="${e.time}" 
                    onerror="this.style.display='none'"
                >`
            : "";
        html += `
            <div class="lineup-item ${timeClasse}">
                <span class="lineup-pos">${obterLabelPosicao(e.posicao)}</span>
                <span class="lineup-info">
                    <span class="lineup-name">${e.jogador}</span>
                    <span class="lineup-meta">
                        ${escudoImg}
                        <span class="lineup-team">${e.time}</span>
                        <span class="lineup-year">${e.temporada}</span>
                    </span>
                </span>
            </div>`;
    });
    html += "</div>";

    els.finalDetails().innerHTML = html;
}
