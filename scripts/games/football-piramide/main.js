import estado from "./core.js";
import { carregarDados, sortearCategoria, obterTierDoJogador, calcularAcertos, obterSlotsDoTier } from "./data.js";

const els = {
    modeSelect:     document.getElementById("modeSelect"),
    gameArea:       document.getElementById("gameArea"),
    finalResult:    document.getElementById("finalResult"),
    categoria:      document.getElementById("categoria"),
    jogadorNome:    document.getElementById("jogadorNome"),
    jogadorInfo:    document.getElementById("jogadorInfo"),
    tierHint:       document.getElementById("tierHint"),
    piramideGrid:   document.getElementById("piramideGrid"),
    progresso:      document.getElementById("progresso"),
    btnAjuda:       document.getElementById("btnAjuda"),
    finalScore:     document.getElementById("finalScore"),
    finalMessage:   document.getElementById("finalMessage"),
    finalCorrect:   document.getElementById("finalCorrect"),
    gameInfo:       document.getElementById("gameInfo")
};

function renderizarPiramide() {
    els.piramideGrid.innerHTML = "";

    const tiers = [
        { tier: 1, slots: [0] },
        { tier: 2, slots: [1, 2] },
        { tier: 3, slots: [3, 4, 5] },
        { tier: 4, slots: [6, 7, 8, 9] }
    ];

    tiers.forEach(({ tier, slots }) => {
        const row = document.createElement("div");
        row.className = `piramide-row tier-${tier}`;

        slots.forEach(slotIdx => {
            const slot = document.createElement("div");
            slot.className = "piramide-slot";
            slot.dataset.index = slotIdx;

            if (estado.piramide[slotIdx]) {
                slot.classList.add("filled");
                slot.innerHTML = `<span class="slot-nome">${estado.piramide[slotIdx].nome}</span>`;
            } else {
                slot.innerHTML = `<span class="slot-number">${slotIdx + 1}º</span>`;
                slot.classList.add("empty");
                slot.addEventListener("click", () => colocarJogador(slotIdx));
            }

            row.appendChild(slot);
        });

        els.piramideGrid.appendChild(row);
    });
}

function mostrarJogadorAtual() {
    if (estado.jogadorAtualIdx >= estado.jogadoresEmbaralhados.length) {
        finalizarJogo();
        return;
    }

    const jogador = estado.jogadoresEmbaralhados[estado.jogadorAtualIdx];
    els.jogadorNome.textContent = jogador.nome;
    els.progresso.textContent = `${estado.jogadorAtualIdx + 1}/10`;

    if (estado.modo === "facil") {
        const tier = obterTierDoJogador(jogador);
        els.tierHint.textContent = `Tier ${tier}`;
        els.tierHint.className = `tier-hint tier-${tier}-hint`;
        els.tierHint.classList.remove("hidden");
        
        // Highlight available slots
        destacarSlotsDoTier(tier);
    } else {
        els.tierHint.classList.add("hidden");
    }
}

function destacarSlotsDoTier(tier) {
    const slots = els.piramideGrid.querySelectorAll(".piramide-slot");
    const slotsValidos = obterSlotsDoTier(tier);
    
    slots.forEach(slot => {
        slot.classList.remove("highlighted");
        const idx = parseInt(slot.dataset.index);
        if (slotsValidos.includes(idx) && !estado.piramide[idx]) {
            slot.classList.add("highlighted");
        }
    });
}

function colocarJogador(slotIdx) {
    if (estado.piramide[slotIdx]) {
        return;
    }

    if (estado.jogadorAtualIdx >= estado.jogadoresEmbaralhados.length) {
        return;
    }

    const jogador = estado.jogadoresEmbaralhados[estado.jogadorAtualIdx];

    if (estado.modo === "facil") {
        const tierCorreto = obterTierDoJogador(jogador);
        const slotsValidos = obterSlotsDoTier(tierCorreto);
        if (!slotsValidos.includes(slotIdx)) {
            return;
        }
    }

    estado.piramide[slotIdx] = jogador;
    estado.jogadorAtualIdx++;

    renderizarPiramide();

    if (estado.jogadorAtualIdx >= estado.jogadoresEmbaralhados.length) {
        setTimeout(finalizarJogo, 400);
    } else {
        mostrarJogadorAtual();
    }
}

function usarAjuda() {
    if (estado.ajudaUsada) {
        return;
    }
    estado.ajudaUsada = true;
    els.btnAjuda.disabled = true;
    els.btnAjuda.classList.add("used");

    const slots = els.piramideGrid.querySelectorAll(".piramide-slot.filled");
    slots.forEach(slot => {
        const idx = parseInt(slot.dataset.index);
        const jogador = estado.piramide[idx];
        if (jogador) {
            const correto = estado.jogadoresOrdenados[idx];
            if (jogador.nome === correto.nome) {
                slot.classList.add("correct-reveal");
            } else {
                slot.classList.add("wrong-reveal");
            }
        }
    });

    setTimeout(() => {
        const slots = els.piramideGrid.querySelectorAll(".piramide-slot");
        slots.forEach(s => {
            s.classList.remove("correct-reveal", "wrong-reveal");
        });
    }, 3000);
}

function finalizarJogo() {
    const acertos = calcularAcertos();

    els.gameArea.classList.add("hidden");
    els.gameInfo.classList.add("hidden");
    els.finalResult.classList.remove("hidden");

    els.finalScore.textContent = acertos;

    // Mostra a pirâmide correta
    let html = '<div class="final-piramide">';
    const tiers = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9]];

    tiers.forEach((slots, tierIdx) => {
        html += `<div class="final-row tier-${tierIdx + 1}">`;
        slots.forEach(slotIdx => {
            const correto = estado.jogadoresOrdenados[slotIdx];
            const colocado = estado.piramide[slotIdx];
            const acertou = colocado && colocado.nome === correto.nome;

            html += `<div class="final-slot ${acertou ? "acertou" : "errou"}">
                <span class="final-slot-rank">${slotIdx + 1}º</span>
                <span class="final-slot-nome">${correto.nome}</span>
                <span class="final-slot-valor">${correto.valor}</span>
            </div>`;
        });
        html += "</div>";
    });
    html += "</div>";

    els.finalCorrect.innerHTML = html;

    if (acertos === 10) {
        els.finalMessage.textContent = "Perfeito! Você é um gênio do futebol!";
    } else if (acertos >= 7) {
        els.finalMessage.textContent = "Ótimo! Conhecimento impressionante!";
    } else if (acertos >= 4) {
        els.finalMessage.textContent = "Bom, mas pode melhorar!";
    } else {
        els.finalMessage.textContent = "Precisa estudar mais estatísticas!";
    }
}

function iniciarJogo(modo) {
    estado.modo = modo;
    estado.piramide = [null, null, null, null, null, null, null, null, null, null];
    estado.jogadorAtualIdx = 0;
    estado.ajudaUsada = false;
    estado.acertos = 0;

    els.btnAjuda.disabled = false;
    els.btnAjuda.classList.remove("used");

    sortearCategoria();
    els.categoria.textContent = estado.categoriaAtual.titulo;

    els.modeSelect.classList.add("hidden");
    els.finalResult.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.gameInfo.classList.remove("hidden");

    renderizarPiramide();
    mostrarJogadorAtual();
}

// --- EVENTS ---
document.getElementById("btnFacil").addEventListener("click", () => iniciarJogo("facil"));
document.getElementById("btnNormal").addEventListener("click", () => iniciarJogo("normal"));
els.btnAjuda.addEventListener("click", usarAjuda);

document.getElementById("btnRetry").addEventListener("click", () => {
    els.finalResult.classList.add("hidden");
    els.modeSelect.classList.remove("hidden");
});

document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../index.html";
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
}

init();
