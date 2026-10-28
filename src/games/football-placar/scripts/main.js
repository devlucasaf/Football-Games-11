import { estado } from "./core.js";
import { carregarDados, sortearPartidas, obterPartidaAtual } from "./data.js";

const elementosJogo = {
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
    elementosJogo.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosJogo.competicao.textContent = partida.competicao;
    elementosJogo.mandante.textContent = partida.mandante;
    elementosJogo.visitante.textContent = partida.visitante;
    elementosJogo.inputMandante.value = 0;
    elementosJogo.inputVisitante.value = 0;
    elementosJogo.matchCard.classList.remove("hidden");
    elementosJogo.resultFeedback.classList.add("hidden");
    elementosJogo.inputMandante.focus();
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
function confirmarPalpitePlacar() {
    const partida = obterPartidaAtual();
    const palpiteMandante = parseInt(elementosJogo.inputMandante.value) || 0;
    const palpiteVisitante = parseInt(elementosJogo.inputVisitante.value) || 0;
    const pontosRodada = calcularPontos(palpiteMandante, palpiteVisitante, partida);

    estado.pontos += pontosRodada;
    estado.historico.push({ 
        partida, 
        palpite: [palpiteMandante, palpiteVisitante],
        pontos: pontosRodada
    });

    elementosJogo.pontos.textContent = estado.pontos;
    elementosJogo.matchCard.classList.add("hidden");
    elementosJogo.resultFeedback.classList.remove("hidden");

    const placarReal = `${partida.placarMandante} × ${partida.placarVisitante}`;
    const detalhe = partida.detalhe ? ` (${partida.detalhe})` : "";

    if (pontosRodada === 3) {
        elementosJogo.feedbackIcon.className = "feedback-icon perfect";
        elementosJogo.feedbackIcon.innerHTML = "<i class='fas fa-check-circle'></i>";
        elementosJogo.feedbackText.textContent = "Placar Exato! +3 pontos";
    } else if (pontosRodada === 1) {
        elementosJogo.feedbackIcon.className = "feedback-icon partial";
        elementosJogo.feedbackIcon.innerHTML = "<i class='fas fa-minus-circle'></i>";
        elementosJogo.feedbackText.textContent = "Vencedor correto! +1 ponto";
    } else {
        elementosJogo.feedbackIcon.className = "feedback-icon miss";
        elementosJogo.feedbackIcon.innerHTML = "<i class='fas fa-times-circle'></i>";
        elementosJogo.feedbackText.textContent = "Errou! 0 pontos";
    }

    elementosJogo.feedbackScore.textContent = `Placar real: ${placarReal}${detalhe}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").textContent = "Ver Resultado";
    }
}

// --- PRÓXIMA RODADA ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarPartida();
    }
}

// --- MOSTRAR RESULTADO FINAL ---
function mostrarFinal() {
    elementosJogo.matchCard.classList.add("hidden");
    elementosJogo.resultFeedback.classList.add("hidden");
    elementosJogo.gameInfo.classList.add("hidden");
    elementosJogo.finalResult.classList.remove("hidden");
    elementosJogo.finalPoints.textContent = estado.pontos;

    const porcentagemPontuacao = Math.round((estado.pontos / 30) * 100);
    let mensagemResultado = "";

    if (porcentagemPontuacao >= 80) {
        mensagemResultado = "Memória enciclopédica!";
    } else if (porcentagemPontuacao >= 50) {
        mensagemResultado = "Bom conhecimento de placares!";
    } else if (porcentagemPontuacao >= 30) {
        mensagemResultado = "Precisa estudar mais os clássicos!";
    } else {
        mensagemResultado = "Tente novamente!";
    }

    if (porcentagemPontuacao >= 50) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    const exatos = estado.historico.filter(resultadoRodada => resultadoRodada.pontos === 3).length;
    elementosJogo.finalDetails.innerHTML = `<p>${mensagemResultado}</p><p>Placares exatos: ${exatos}/${estado.totalRodadas}</p>`;

    if (window.FG11Stats) {
        const total = estado.totalRodadas;
        const venceu = porcentagemPontuacao >= 50;
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-placar", {
            venceu,
            bucket: exatos,
            tamanho: total + 1
        });
        window.FG11Stats.mostrarModal("football-placar", {
            venceu,
            titulo: "Fim de jogo!",
            resposta: `${estado.pontos} pontos · ${exatos} placares exatos`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Placares exatos por partida",
            bucketAtual: exatos,
            onReiniciar: iniciarJogo,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.pontos = 0;
    estado.historico = [];
    elementosJogo.pontos.textContent = "0";
    elementosJogo.finalResult.classList.add("hidden");
    elementosJogo.gameInfo.classList.remove("hidden");
    sortearPartidas();
    mostrarPartida();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoPlacar() {
    await carregarDados();

    document.getElementById("btnConfirmar").addEventListener("click", confirmarPalpitePlacar);
    document.getElementById("btnNext").addEventListener("click", avancarRodada);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.key === "Enter") {
            if (!elementosJogo.matchCard.classList.contains("hidden")) {
                confirmarPalpitePlacar();
            } else if (!elementosJogo.resultFeedback.classList.contains("hidden")) {
                avancarRodada();
            }
        }
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-placar-exato";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
    }
}

inicializarJogoPlacar();
