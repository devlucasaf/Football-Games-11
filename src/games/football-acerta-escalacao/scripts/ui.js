import { estado } from "./core.js";
import { obterPosicao, obterLabelPosicao } from "./data.js";

const elementos = {
    timer:              document.getElementById("timer"),
    gameTimerArea:      document.getElementById("gameTimerArea"),
    gameInfo:           document.getElementById("gameInfo"),
    matchInfo:          document.getElementById("matchInfo"),
    acertos:            document.getElementById("acertos"),
    playersLayer:       document.getElementById("playersLayer"),
    guessInput:         document.getElementById("guessInput"),
    autocompleteList:   document.getElementById("autocompleteList"),
    finalResult:        document.getElementById("finalResult"),
    finalPoints:        document.getElementById("finalPoints"),
    finalDetails:       document.getElementById("finalDetails"),
    fieldWrapper:       document.querySelector(".field-wrapper"),
    guessInputArea:     document.querySelector(".guess-input-area"),
    giveUpArea:         document.querySelector(".give-up-area"),
    modeSelect:         document.getElementById("modeSelect")
};

let currentOnSelect = null;
let currentNomes    = [];

// --- RENDERIZAÇÃO DO CAMPO ---
export function renderizarCampo(escalacao) {
    elementos.playersLayer.innerHTML = "";
    elementos.matchInfo.textContent = `${escalacao.time} — ${escalacao.evento} (${escalacao.formacao})`;

    escalacao.jogadores.forEach((jogador, idx) => {
        const pos   = obterPosicao(jogador.posicao, escalacao.formacao);
        const label = obterLabelPosicao(jogador.posicao);

        const slot = document.createElement("div");
        slot.className = "player-slot";
        slot.id = `slot-${idx}`;
        slot.style.top = `${pos.top}%`;
        slot.style.left = `${pos.left}%`;

        slot.innerHTML = `
            <div class="player-circle">${label}</div>
            <span class="player-label">?</span>
        `;

        elementos.playersLayer.appendChild(slot);
    });
}

// --- REVELAR JOGADOR ACERTADO ---
export function revelarJogador(idx, nome) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) {
        return;
    }
    slot.classList.add("revealed");
    slot.querySelector(".player-circle").innerHTML = "<i class='fas fa-check'></i>";
    slot.querySelector(".player-label").textContent = nome;
}

// --- REVELAR JOGADOR NÃO ACERTADO ---
export function revelarNaoAcertado(idx, nome) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) {
        return;
    }
    slot.classList.add("missed");
    slot.querySelector(".player-circle").innerHTML = "<i class='fas fa-times'></i>";
    slot.querySelector(".player-label").textContent = nome;
}

// --- ATUALIZAÇÃO DO TIMER ---
export function atualizarTimer() {
    const min = Math.floor(estado.tempoRestante / 60);
    const sec = estado.tempoRestante % 60;
    elementos.timer.textContent = `${min}:${sec.toString().padStart(2, "0")}`;

    if (estado.tempoRestante <= 30) {
        elementos.gameTimerArea.classList.add("danger");
    } else {
        elementos.gameTimerArea.classList.remove("danger");
    }
}

// --- ATUALIZAÇÃO DOS ACERTOS ---
export function atualizarAcertos() {
    elementos.acertos.textContent = estado.acertos;
}

// --- ESCONDER TIMER ---
export function esconderTimer() {
    elementos.gameTimerArea.classList.add("hidden");
}

// --- MOSTRAR SELEÇÃO DE MODO ---
export function mostrarModeSelect() {
    elementos.modeSelect.classList.remove("hidden");
    elementos.gameInfo.classList.add("hidden");
    elementos.fieldWrapper.classList.add("hidden");
    elementos.guessInputArea.classList.add("hidden");
    elementos.giveUpArea.classList.add("hidden");
    elementos.finalResult.classList.add("hidden");
}

// --- ESCONDER SELEÇÃO DE MODO ---
export function esconderModeSelect() {
    elementos.modeSelect.classList.add("hidden");
    elementos.gameInfo.classList.remove("hidden");
    elementos.fieldWrapper.classList.remove("hidden");
    elementos.guessInputArea.classList.remove("hidden");
    elementos.giveUpArea.classList.remove("hidden");
    elementos.gameTimerArea.classList.remove("hidden");
}

// --- ATUALIZAÇÃO DA LISTA DE AUTOCOMPLETE ---
function atualizarLista(val) {
    const list = elementos.autocompleteList;
    list.innerHTML = "";

    if (val.length < 2) {
        list.classList.add("hidden");
        return;
    }

    const normalizar = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const extras = estado.escalacaoAtual?.extras || [];
    const filtrados = currentNomes.filter(n => {
        if (!normalizar(n).includes(normalizar(val))) {
            return false;
        }

        if (extras.some(e => normalizar(e) === normalizar(n))) {
            return true;
        }
        return estado.jogadoresRestantes.some(j => normalizar(j.nome) === normalizar(n));
    });

    if (filtrados.length === 0) {
        list.classList.add("hidden");
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const li = document.createElement("li");
        li.textContent = nome;
        li.addEventListener("click", () => {
            currentOnSelect(nome);
            elementos.guessInput.value = "";
            list.classList.add("hidden");
        });
        list.appendChild(li);
    });

    list.classList.remove("hidden");
}

// --- CONFIGURAÇÃO DO AUTOCOMPLETE ---
export function configurarAutocomplete(nomes, onSelect) {
    currentNomes    = nomes;
    currentOnSelect = onSelect;

    const input = elementos.guessInput;
    const list  = elementos.autocompleteList;

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    elementos.guessInput = newInput;

    newInput.addEventListener("input", () => {
        atualizarLista(newInput.value.trim().toLowerCase());
    });

    newInput.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll("li");
        const activeItem = list.querySelector("li.active");

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!activeItem && items.length > 0) {
                items[0].classList.add("active");
            } else if (activeItem) {
                activeItem.classList.remove("active");
                const next = activeItem.nextElementSibling || items[0];
                next.classList.add("active");
                next.scrollIntoView({ 
                    block: "nearest" 
                });
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove("active");
                const prev = activeItem.previousElementSibling || items[items.length - 1];
                prev.classList.add("active");
                prev.scrollIntoView({ 
                    block: "nearest" 
                });
            } else if (items.length > 0) {
                items[items.length - 1].classList.add("active");
            }
        } else if (e.key === "ArrowRight") {
            if (activeItem) {
                e.preventDefault();
                currentOnSelect(activeItem.textContent);
                newInput.value = "";
                list.classList.add("hidden");
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeItem) {
                currentOnSelect(activeItem.textContent);
                newInput.value = "";
                list.classList.add("hidden");
            } else if (newInput.value.trim()) {
                currentOnSelect(newInput.value.trim());
                newInput.value = "";
                list.classList.add("hidden");
            }
        } else if (e.key === "Escape") {
            list.classList.add("hidden");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".autocomplete-wrapper")) {
            list.classList.add("hidden");
        }
    });
}

// --- FOCAR NO INPUT ---
export function focarInput() {
    elementos.guessInput.focus();
}

// --- HELPER DE TRADUÇÃO ---
function t(key, fallback) {
    const lingua = localStorage.getItem("preferredLanguage") || "traducoes";
    if (window.translations && window.translations[lingua] && window.translations[lingua][key]) {
        return window.translations[lingua][key];
    }
    return fallback;
}

// --- EXIBIR RESULTADO FINAL ---
export function mostrarResultadoFinal() {
    elementos.fieldWrapper.classList.add("hidden");
    elementos.guessInputArea.classList.add("hidden");
    elementos.giveUpArea.classList.add("hidden");
    elementos.finalResult.classList.remove("hidden");

    elementos.finalPoints.textContent = estado.acertos;

    const porcentagem = Math.round((estado.acertos / 11) * 100);
    if (porcentagem === 100) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    let mensagem = "";
    if (porcentagem === 100) {
        mensagem = t("acerta-result-perfect", "Perfeito! Você lembrou de todos!");
    } else if (porcentagem >= 80) {
        mensagem = t("acerta-result-great", "Memória quase perfeita!");
    } else if (porcentagem >= 50) {
        mensagem = t("acerta-result-good", "Bom conhecimento!");
    } else {
        mensagem = t("acerta-result-try-again", "Tente novamente!");
    }

    let detalhes = `<p>${mensagem}</p>`;
    if (estado.modoComTempo) {
        const tempoUsado = 300 - estado.tempoRestante;
        const min = Math.floor(tempoUsado / 60);
        const sec = tempoUsado % 60;
        detalhes += `<p>${t("acerta-time-label", "Tempo")}: ${min}:${sec.toString().padStart(2, "0")}</p>`;
    } else {
        detalhes += `<p>${t("acerta-mode-no-time-result", "Modo: Sem Tempo")}</p>`;
    }
    detalhes += `<p><strong>${estado.escalacaoAtual.time}</strong> — ${estado.escalacaoAtual.evento}</p>`;
    elementos.finalDetails.innerHTML = detalhes;
}

// --- RESETAR INTERFACE ---
export function resetarUI() {
    elementos.finalResult.classList.add("hidden");
    elementos.fieldWrapper.classList.remove("hidden");
    elementos.guessInputArea.classList.remove("hidden");
    elementos.giveUpArea.classList.remove("hidden");
    elementos.guessInput.value = "";
    elementos.autocompleteList.classList.add("hidden");
    elementos.gameTimerArea.classList.remove("danger");
}
