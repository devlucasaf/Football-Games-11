import { estado } from "./core.js";
import { carregarDados, sortear, normalizar, obterDicas } from "./data.js";

const els = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    pontos:         document.getElementById("pontos"),
    dicasGrid:      document.getElementById("dicasGrid"),
    guessInput:     document.getElementById("guessInput"),
    guessFeedback:  document.getElementById("guessFeedback"),
    gameArea:       document.getElementById("gameArea"),
    roundResult:    document.getElementById("roundResult"),
    roundIcon:      document.getElementById("roundIcon"),
    roundText:      document.getElementById("roundText"),
    roundAnswer:    document.getElementById("roundAnswer"),
    finalResult:    document.getElementById("finalResult"),
    finalPoints:    document.getElementById("finalPoints"),
    finalDetails:   document.getElementById("finalDetails"),
    gameInfo:       document.getElementById("gameInfo"),
    dicasCount:     document.getElementById("dicasCount")
};

let dicasAtuais = [];

function mostrarRodada() {
    const treinador = estado.sorteados[estado.rodadaAtual];
    dicasAtuais = obterDicas(treinador);
    estado.dicasReveladas = 1;

    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.guessInput.value = "";
    els.guessFeedback.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
    els.roundResult.classList.add("hidden");
    renderizarDicas();
    els.guessInput.focus();
}

function renderizarDicas() {
    els.dicasGrid.innerHTML = "";
    els.dicasCount.textContent = `${estado.dicasReveladas}/${estado.maxDicas}`;

    dicasAtuais.forEach((dica, i) => {
        const card = document.createElement("div");
        card.className = "dica-card";

        if (i < estado.dicasReveladas) {
            card.classList.add("revealed");
            card.innerHTML = `<span class="dica-label">${dica.label}</span><span class="dica-valor">${dica.valor}</span>`;
        } else {
            card.classList.add("hidden-dica");
            card.innerHTML = `<span class="dica-label">Dica ${i + 1}</span><span class="dica-valor"><i class="fas fa-lock"></i></span>`;
            card.addEventListener("click", () => revelarDica(i));
        }

        els.dicasGrid.appendChild(card);
    });
}

function revelarDica(index) {
    if (index < estado.dicasReveladas) {
        return;
    }
    estado.dicasReveladas = index + 1;
    renderizarDicas();
}

function calcularPontos() {
    const base = 6 - estado.dicasReveladas;
    return Math.max(base, 1);
}

function verificarPalpite() {
    const palpite = els.guessInput.value.trim();
    if (!palpite) {
        return;
    }

    const treinador = estado.sorteados[estado.rodadaAtual];
    const acertou = normalizar(palpite) === normalizar(treinador.nome);

    if (acertou) {
        const pts = calcularPontos();
        estado.pontos += pts;
        els.pontos.textContent = estado.pontos;
        estado.historico.push({ 
            treinador: treinador.nome, 
            acertou: true, 
            dicas: estado.dicasReveladas, 
            pontos: pts 
        });
        mostrarResultado(true, treinador);
    } else {
        els.guessFeedback.textContent = `"${palpite}" não é o treinador. Tente novamente!`;
        els.guessFeedback.className = "guess-feedback wrong";
        els.guessFeedback.classList.remove("hidden");
        els.guessInput.value = "";
        els.guessInput.focus();

        if (estado.dicasReveladas < estado.maxDicas) {
            estado.dicasReveladas++;
            renderizarDicas();
        }
    }
}

function pular() {
    const treinador = estado.sorteados[estado.rodadaAtual];
    estado.historico.push({ 
        treinador: treinador.nome, 
        acertou: false, 
        dicas: estado.dicasReveladas, 
        pontos: 0 
    });
    mostrarResultado(false, treinador);
}

function mostrarResultado(acertou, treinador) {
    els.gameArea.classList.add("hidden");
    els.roundResult.classList.remove("hidden");

    if (acertou) {
        els.roundIcon.className = "round-icon correct";
        els.roundIcon.innerHTML = "<i class=\"fas fa-check-circle\"></i>";
        els.roundText.textContent = `Correto! +${calcularPontos()} pontos`;
    } else {
        els.roundIcon.className = "round-icon wrong";
        els.roundIcon.innerHTML = "<i class=\"fas fa-times-circle\"></i>";
        els.roundText.textContent = "Não acertou desta vez!";
    }

    els.roundAnswer.textContent = `Resposta: ${treinador.nome}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").innerHTML = "<i class=\"fas fa-flag-checkered\"></i> Ver Resultado";
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
    els.finalPoints.textContent = estado.pontos;

    const maxPts = estado.totalRodadas * 5;
    const pct = Math.round((estado.pontos / maxPts) * 100);
    const acertos = estado.historico.filter(h => h.acertou).length;

    let msg = "";
    if (pct >= 80) {
        msg = "Especialista em treinadores!";
    } else if (pct >= 50) {
        msg = "Bom conhecimento tático!";
    } else if (pct >= 30) {
        msg = "Precisa estudar mais os bastidores!";
    } else {
        msg = "Tente novamente!";
    }

    els.finalDetails.innerHTML = `<p>${msg}</p><p>Acertos: ${acertos}/${estado.totalRodadas}</p>`;
}

function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.pontos = 0;
    estado.historico = [];
    els.pontos.textContent = "0";
    els.finalResult.classList.add("hidden");
    els.gameInfo.classList.remove("hidden");
    sortear();
    mostrarRodada();
}

async function init() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnSkip").addEventListener("click", pular);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../index.html";
    });

    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            verificarPalpite();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-acerta-treinador";

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
