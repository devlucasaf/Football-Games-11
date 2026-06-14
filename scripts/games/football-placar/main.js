import { estado } from "./core.js";
import { carregarDados, sortearPartidas, obterPartidaAtual } from "./data.js";

const els = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    pontos:         document.getElementById("pontos"),
    competicao:     document.getElementById("competicao"),
    mandante:       document.getElementById("mandante"),
    visitante:      document.getElementById("visitante"),
    inputMandante:  document.getElementById("inputMandante"),
    inputVisitante: document.getElementById("inputVisitante"),
    matchCard:      document.getElementById("matchCard"),
    resultFeedback: document.getElementById("resultFeedback"),
    feedbackIcon:   document.getElementById("feedbackIcon"),
    feedbackText:   document.getElementById("feedbackText"),
    feedbackScore:  document.getElementById("feedbackScore"),
    finalResult:    document.getElementById("finalResult"),
    finalPoints:    document.getElementById("finalPoints"),
    finalDetails:   document.getElementById("finalDetails"),
    gameInfo:       document.getElementById("gameInfo")
};

// --- MOSTRAR PARTIDA ---
function mostrarPartida() {
    const partida = obterPartidaAtual();
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.competicao.textContent = partida.competicao;
    els.mandante.textContent = partida.mandante;
    els.visitante.textContent = partida.visitante;
    els.inputMandante.value = 0;
    els.inputVisitante.value = 0;
    els.matchCard.classList.remove("hidden");
    els.resultFeedback.classList.add("hidden");
    els.inputMandante.focus();
}

// --- CALCULAR PONTOS ---
function calcularPontos(palpiteMandante, palpiteVisitante, partida) {
    const exato = palpiteMandante === partida.placarMandante && palpiteVisitante === partida.placarVisitante;
    if (exato) {
        return 3;
    }

    const vencedorReal = Math.sign(partida.placarMandante - partida.placarVisitante);
    const vencedorPalpite = Math.sign(palpiteMandante - palpiteVisitante);
    if (vencedorReal === vencedorPalpite) {
        return 1;
    }

    return 0;
}

// --- CONFIRMAR PALPITE ---
function confirmar() {
    const partida = obterPartidaAtual();
    const pm = parseInt(els.inputMandante.value) || 0;
    const pv = parseInt(els.inputVisitante.value) || 0;
    const pts = calcularPontos(pm, pv, partida);

    estado.pontos += pts;
    estado.historico.push({ 
        partida, 
        palpite: [pm, pv], 
        pontos: pts 
    });

    els.pontos.textContent = estado.pontos;
    els.matchCard.classList.add("hidden");
    els.resultFeedback.classList.remove("hidden");

    const placarReal = `${partida.placarMandante} × ${partida.placarVisitante}`;
    const detalhe = partida.detalhe ? ` (${partida.detalhe})` : "";

    if (pts === 3) {
        els.feedbackIcon.className = "feedback-icon perfect";
        els.feedbackIcon.innerHTML = "<i class='fas fa-check-circle'></i>";
        els.feedbackText.textContent = "Placar Exato! +3 pontos";
    } else if (pts === 1) {
        els.feedbackIcon.className = "feedback-icon partial";
        els.feedbackIcon.innerHTML = "<i class='fas fa-minus-circle'></i>";
        els.feedbackText.textContent = "Vencedor correto! +1 ponto";
    } else {
        els.feedbackIcon.className = "feedback-icon miss";
        els.feedbackIcon.innerHTML = "<i class='fas fa-times-circle'></i>";
        els.feedbackText.textContent = "Errou! 0 pontos";
    }

    els.feedbackScore.textContent = `Placar real: ${placarReal}${detalhe}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").textContent = "Ver Resultado";
    }
}

// --- PRÓXIMA RODADA ---
function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarPartida();
    }
}

// --- MOSTRAR RESULTADO FINAL ---
function mostrarFinal() {
    els.matchCard.classList.add("hidden");
    els.resultFeedback.classList.add("hidden");
    els.gameInfo.classList.add("hidden");
    els.finalResult.classList.remove("hidden");
    els.finalPoints.textContent = estado.pontos;

    const pct = Math.round((estado.pontos / 30) * 100);
    let msg = "";

    if (pct >= 80) {
        msg = "Memória enciclopédica!";
    } else if (pct >= 50) {
        msg = "Bom conhecimento de placares!";
    } else if (pct >= 30) {
        msg = "Precisa estudar mais os clássicos!";
    } else {
        msg = "Tente novamente!";
    }

    const exatos = estado.historico.filter(h => h.pontos === 3).length;
    els.finalDetails.innerHTML = `<p>${msg}</p><p>Placares exatos: ${exatos}/${estado.totalRodadas}</p>`;
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.pontos = 0;
    estado.historico = [];
    els.pontos.textContent = "0";
    els.finalResult.classList.add("hidden");
    els.gameInfo.classList.remove("hidden");
    sortearPartidas();
    mostrarPartida();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    document.getElementById("btnConfirmar").addEventListener("click", confirmar);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../index.html";
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (!els.matchCard.classList.contains("hidden")) {
                confirmar();
            } else if (!els.resultFeedback.classList.contains("hidden")) {
                proxima();
            }
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-placar-exato";

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
