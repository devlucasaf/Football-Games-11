import estado from "./core.js";
import { carregarDados, sortear, verificarResposta, obterNomesUnicos, normalizar } from "./data.js";

const els = {
    rodadaAtual:        document.getElementById("rodadaAtual"),
    acertos:            document.getElementById("acertos"),
    tentativas:         document.getElementById("tentativas"),
    dicasList:          document.getElementById("dicasList"),
    palpiteInput:       document.getElementById("palpiteInput"),
    autocompleteList:   document.getElementById("autocompleteList"),
    guessFeedback:      document.getElementById("guessFeedback"),
    gameArea:           document.getElementById("gameArea"),
    roundResult:        document.getElementById("roundResult"),
    roundIcon:          document.getElementById("roundIcon"),
    roundText:          document.getElementById("roundText"),
    roundAnswer:        document.getElementById("roundAnswer"),
    finalResult:        document.getElementById("finalResult"),
    finalPoints:        document.getElementById("finalPoints"),
    finalDetails:       document.getElementById("finalDetails"),
    gameInfo:           document.getElementById("gameInfo")
};

let nomes = [];

function mostrarRodada() {
    const gol = estado.sorteados[estado.rodadaAtual];
    estado.dicasReveladas = 1;

    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.tentativas.textContent = estado.maxDicas;
    els.palpiteInput.value = "";
    els.guessFeedback.classList.add("hidden");
    els.autocompleteList.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.roundResult.classList.add("hidden");

    renderizarDicas(gol);
    els.palpiteInput.focus();
}

function renderizarDicas(gol) {
    els.dicasList.innerHTML = "";
    for (let i = 0; i < estado.dicasReveladas; i++) {
        const li = document.createElement("li");
        li.className = "dica-item";
        li.innerHTML = `<span class="dica-number">${i + 1}</span><span class="dica-text">${gol.dicas[i]}</span>`;
        els.dicasList.appendChild(li);
    }
}

function verificarPalpite(palpite) {
    if (!palpite) {
        return;
    }

    const gol = estado.sorteados[estado.rodadaAtual];
    const acertou = verificarResposta(palpite, gol);

    if (acertou) {
        estado.acertos++;
        els.acertos.textContent = estado.acertos;
        estado.historico.push({ 
            resposta: gol.resposta, 
            acertou: true, 
            tentativas: estado.dicasReveladas 
        });
        mostrarResultado(true, gol);
    } else {
        estado.dicasReveladas++;
        const restantes = estado.maxDicas - estado.dicasReveladas + 1;
        els.tentativas.textContent = restantes;

        if (estado.dicasReveladas > estado.maxDicas) {
            estado.historico.push({ 
                resposta: gol.resposta, 
                acertou: false, 
                tentativas: estado.maxDicas 
            });
            mostrarResultado(false, gol);
        } else {
            els.guessFeedback.textContent = `"${palpite}" não é o jogador!`;
            els.guessFeedback.className = "guess-feedback wrong";
            els.guessFeedback.classList.remove("hidden");
            renderizarDicas(gol);
            els.palpiteInput.value = "";
            els.palpiteInput.focus();
        }
    }
}

function mostrarResultado(acertou, gol) {
    els.gameArea.classList.add("hidden");
    els.roundResult.classList.remove("hidden");

    if (acertou) {
        els.roundIcon.className = "round-icon correct";
        els.roundIcon.innerHTML = "<i class='fas fa-futbol'></i>";
        els.roundText.textContent = "Goool! Você acertou!";
    } else {
        els.roundIcon.className = "round-icon wrong";
        els.roundIcon.innerHTML = "<i class='fas fa-times-circle'></i>";
        els.roundText.textContent = "Não acertou desta vez!";
    }

    els.roundAnswer.textContent = `Resposta: ${gol.resposta}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    }
}

function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

function mostrarFinal() {
    els.gameArea.classList.add("hidden");
    els.roundResult.classList.add("hidden");
    els.gameInfo.classList.add("hidden");
    els.finalResult.classList.remove("hidden");
    els.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / estado.totalRodadas) * 100);
    let mensagem = "";
    if (pct === 100) {
        mensagem = "Craque absoluto! Memória enciclopédica!";
    } else if (pct >= 70) {
        mensagem = "Ótimo conhecimento de gols históricos!";
    } else if (pct >= 40) {
        mensagem = "Bom, mas pode melhorar!";
    } else {
        mensagem = "Precisa assistir mais jogos!";
    }

    els.finalDetails.innerHTML = `<p>${mensagem}</p>`;
}

function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    estado.historico = [];
    els.acertos.textContent = "0";
    els.finalResult.classList.add("hidden");
    els.gameInfo.classList.remove("hidden");
    sortear();
    mostrarRodada();
}

// --- AUTOCOMPLETE ---
function atualizarAutocomplete(val) {
    const list = els.autocompleteList;
    list.innerHTML = "";

    if (val.length < 2) {
        list.classList.add("hidden");
        return;
    }

    const filtrados = nomes.filter(n => normalizar(n).includes(normalizar(val)));

    if (filtrados.length === 0) {
        list.classList.add("hidden");
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const li = document.createElement("li");
        li.textContent = nome;
        li.addEventListener("click", () => {
            verificarPalpite(nome);
            els.palpiteInput.value = "";
            list.classList.add("hidden");
        });
        list.appendChild(li);
    });

    list.classList.remove("hidden");
}

function configurarInput() {
    els.palpiteInput.addEventListener("input", () => {
        const val = els.palpiteInput.value.trim();
        atualizarAutocomplete(val);
    });

    els.palpiteInput.addEventListener("keydown", (e) => {
        const items = els.autocompleteList.querySelectorAll("li");
        const activeItem = els.autocompleteList.querySelector("li.active");

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!activeItem && items.length > 0) {
                items[0].classList.add("active");
            } else if (activeItem) {
                activeItem.classList.remove("active");
                const next = activeItem.nextElementSibling || items[0];
                next.classList.add("active");
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove("active");
                const prev = activeItem.previousElementSibling || items[items.length - 1];
                prev.classList.add("active");
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeItem) {
                verificarPalpite(activeItem.textContent);
                els.palpiteInput.value = "";
                els.autocompleteList.classList.add("hidden");
            } else if (els.palpiteInput.value.trim()) {
                verificarPalpite(els.palpiteInput.value.trim());
                els.palpiteInput.value = "";
                els.autocompleteList.classList.add("hidden");
            }
        } else if (e.key === "Escape") {
            els.autocompleteList.classList.add("hidden");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".autocomplete-wrapper")) {
            els.autocompleteList.classList.add("hidden");
        }
    });
}

// --- INIT ---
async function init() {
    await carregarDados();
    nomes = obterNomesUnicos();
    configurarInput();

    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-gol-a-gol";

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
