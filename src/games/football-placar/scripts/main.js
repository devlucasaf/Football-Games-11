import { estado } from "./core.js";
import { carregarDados, sortearPartidas, obterPartidaAtual } from "./data.js";

const elementosJogo = {
    rodadaAtual:            document.getElementById("rodadaAtual"),
    pontos:                 document.getElementById("pontos"),
    competicao:             document.getElementById("competicao"),
    mandante:               document.getElementById("mandante"),
    visitante:              document.getElementById("visitante"),
    campoGolsMandante:      document.getElementById("inputMandante"),
    campoGolsVisitante:     document.getElementById("inputVisitante"),
    cartaoPartida:          document.getElementById("matchCard"),
    resultadoPalpite:       document.getElementById("resultFeedback"),
    iconeResultadoPalpite:  document.getElementById("feedbackIcon"),
    textoResultadoPalpite:  document.getElementById("feedbackText"),
    placarResultadoPalpite: document.getElementById("feedbackScore"),
    resultadoFinal:         document.getElementById("finalResult"),
    pontosFinais:           document.getElementById("finalPoints"),
    detalhesResultadoFinal: document.getElementById("finalDetails"),
    informacoesJogo:        document.getElementById("gameInfo")
};

// --- MOSTRAR PARTIDA ---
function mostrarPartida() {
    const partida = obterPartidaAtual();
    elementosJogo.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosJogo.competicao.textContent = partida.competicao;
    elementosJogo.mandante.textContent = partida.mandante;
    elementosJogo.visitante.textContent = partida.visitante;
    elementosJogo.campoGolsMandante.value = 0;
    elementosJogo.campoGolsVisitante.value = 0;
    elementosJogo.cartaoPartida.classList.remove("hidden");
    elementosJogo.resultadoPalpite.classList.add("hidden");
    elementosJogo.campoGolsMandante.focus();
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
    const palpiteMandante = parseInt(elementosJogo.campoGolsMandante.value) || 0;
    const palpiteVisitante = parseInt(elementosJogo.campoGolsVisitante.value) || 0;
    const pontosRodada = calcularPontos(palpiteMandante, palpiteVisitante, partida);

    estado.pontos += pontosRodada;
    estado.historico.push({ 
        partida, 
        palpite: [palpiteMandante, palpiteVisitante],
        pontos: pontosRodada
    });

    elementosJogo.pontos.textContent = estado.pontos;
    elementosJogo.cartaoPartida.classList.add("hidden");
    elementosJogo.resultadoPalpite.classList.remove("hidden");

    const placarReal = `${partida.placarMandante} × ${partida.placarVisitante}`;
    const detalhe = partida.detalhe ? ` (${partida.detalhe})` : "";

    if (pontosRodada === 3) {
        elementosJogo.iconeResultadoPalpite.className = "feedback-icon perfect";
        elementosJogo.iconeResultadoPalpite.innerHTML = "<i class='fas fa-check-circle'></i>";
        elementosJogo.textoResultadoPalpite.textContent = "Placar Exato! +3 pontos";
    } else if (pontosRodada === 1) {
        elementosJogo.iconeResultadoPalpite.className = "feedback-icon partial";
        elementosJogo.iconeResultadoPalpite.innerHTML = "<i class='fas fa-minus-circle'></i>";
        elementosJogo.textoResultadoPalpite.textContent = "Vencedor correto! +1 ponto";
    } else {
        elementosJogo.iconeResultadoPalpite.className = "feedback-icon miss";
        elementosJogo.iconeResultadoPalpite.innerHTML = "<i class='fas fa-times-circle'></i>";
        elementosJogo.textoResultadoPalpite.textContent = "Errou! 0 pontos";
    }

    elementosJogo.placarResultadoPalpite.textContent = `Placar real: ${placarReal}${detalhe}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnAvancarRodada").textContent = "Ver Resultado";
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
    elementosJogo.cartaoPartida.classList.add("hidden");
    elementosJogo.resultadoPalpite.classList.add("hidden");
    elementosJogo.informacoesJogo.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.remove("hidden");
    elementosJogo.pontosFinais.textContent = estado.pontos;

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
    elementosJogo.detalhesResultadoFinal.innerHTML = `<p>${mensagemResultado}</p><p>Placares exatos: ${exatos}/${estado.totalRodadas}</p>`;

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
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.informacoesJogo.classList.remove("hidden");
    sortearPartidas();
    mostrarPartida();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoPlacar() {
    await carregarDados();

    document.getElementById("btnConfirmarPalpite").addEventListener("click", confirmarPalpitePlacar);
    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnReiniciarPartida").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.key === "Enter") {
            if (!elementosJogo.cartaoPartida.classList.contains("hidden")) {
                confirmarPalpitePlacar();
            } else if (!elementosJogo.resultadoPalpite.classList.contains("hidden")) {
                avancarRodada();
            }
        }
    });

    const sobreposicaoTutorial = document.getElementById("sobreposicaoTutorial");
    const chaveDispensaTutorial = "tutorial_skip_football-placar-exato";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("btnIniciarJogoTutorial").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("btnOcultarTutorial").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
    }
}

inicializarJogoPlacar();
