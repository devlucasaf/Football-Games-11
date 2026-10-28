import { estado }                                                           from "./core.js";
import { carregarDados, sortearCategoria, encontrarResposta, obterNomes }   from "./data.js";

const elementosInterface = {
    areaJogo:               document.getElementById("gameArea"),
    valorCronometro:        document.getElementById("timerValue"),
    recipienteCronometro:   document.getElementById("timerBox"),
    barraTempoRestante:     document.getElementById("timerFill"),
    contadorAcertos:        document.getElementById("acertosCount"),
    totalPossivel:          document.getElementById("totalPossivel"),
    perguntaTexto:          document.getElementById("perguntaTexto"),
    campoPalpite:           document.getElementById("guessInput"),
    mensagemPalpite:        document.getElementById("guessFeedback"),
    listaSugestoes:         document.getElementById("suggestions"),
    listaAcertos:           document.getElementById("hitsList"),
    resultadoFinal:         document.getElementById("finalResult"),
    pontuacaoFinal:         document.getElementById("finalPoints"),
    rotuloPontuacaoFinal:   document.getElementById("finalLabel"),
    perguntaResultadoFinal: document.getElementById("finalQuestion"),
    acertosResultadoFinal:  document.getElementById("finalHits"),
    respostasNaoAcertadas:  document.getElementById("finalMisses")
};

// --- AUTOCOMPLETE ---
let nomesDisponiveis = [];
let sugestaoAtiva = -1;

function esconderSugestoes() {
    elementosInterface.listaSugestoes.classList.add("hidden");
    elementosInterface.listaSugestoes.innerHTML = "";
    sugestaoAtiva = -1;
}

function selecionarSugestao(nome) {
    elementosInterface.campoPalpite.value = nome;
    esconderSugestoes();
    elementosInterface.campoPalpite.focus();
}

function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, indiceSugestao) => {
        item.classList.toggle("active", indiceSugestao === sugestaoAtiva);
        if (indiceSugestao === sugestaoAtiva) {
            item.scrollIntoView({ block: "nearest" });
        }
    });
}

function renderizarSugestoes() {
    const termo = elementosInterface.campoPalpite.value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const filtrados = nomesDisponiveis
        .filter((nome) => nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(termo))
        .slice(0, 8);

    if (filtrados.length === 0) {
        esconderSugestoes();
        return;
    }

    elementosInterface.listaSugestoes.innerHTML = "";
    filtrados.forEach((nome) => {
        const itemSugestao = document.createElement("li");
        itemSugestao.className = "suggestion-item";
        itemSugestao.innerHTML = `<i class="fas fa-user"></i><span>${nome}</span>`;
        itemSugestao.addEventListener("mousedown", (eventoSelecao) => {
            eventoSelecao.preventDefault();
            selecionarSugestao(nome);
        });
        elementosInterface.listaSugestoes.appendChild(itemSugestao);
    });
    elementosInterface.listaSugestoes.classList.remove("hidden");
}

// --- MOSTRA FEEDBACK RÁPIDO NO CAMPO ---
let identificadorOcultacaoMensagem = null;
function mostrarMensagemPalpite(texto, tipo) {
    elementosInterface.mensagemPalpite.textContent = texto;
    elementosInterface.mensagemPalpite.className = `guess-feedback ${tipo}`;
    elementosInterface.mensagemPalpite.classList.remove("hidden");

    clearTimeout(identificadorOcultacaoMensagem);
    identificadorOcultacaoMensagem = setTimeout(() => {
        elementosInterface.mensagemPalpite.classList.add("hidden");
    }, 1200);
}

// --- RENDERIZA UM ACERTO NA LISTA ---
function adicionarAcertoVisual(nome) {
    const marcadorAcerto = document.createElement("div");
    marcadorAcerto.className = "s30-hit-chip";
    marcadorAcerto.innerHTML = `<i class="fas fa-check"></i> ${nome}`;
    elementosInterface.listaAcertos.prepend(marcadorAcerto);
    elementosInterface.contadorAcertos.textContent = estado.acertos.length;
}

// --- VERIFICA O PALPITE ---
function verificarPalpite() {
    if (!estado.jogando) {
        return;
    }

    const palpite = elementosInterface.campoPalpite.value.trim();
    if (!palpite) {
        return;
    }

    const resposta = encontrarResposta(palpite);
    elementosInterface.campoPalpite.value = "";
    esconderSugestoes();

    if (!resposta) {
        mostrarMensagemPalpite("Não está na lista!", "wrong");
        return;
    }

    if (estado.acertos.includes(resposta.nome)) {
        mostrarMensagemPalpite("Você já disse esse!", "hint");
        return;
    }

    estado.acertos.push(resposta.nome);
    adicionarAcertoVisual(resposta.nome);
    mostrarMensagemPalpite("Correto!", "correct");
}

// --- ATUALIZA O RELÓGIO ---
function atualizarCronometro() {
    elementosInterface.valorCronometro.textContent = estado.tempoRestante;
    const porcentagemTempoRestante = (estado.tempoRestante / estado.tempoTotal) * 100;
    elementosInterface.barraTempoRestante.style.width = `${porcentagemTempoRestante}%`;

    if (estado.tempoRestante <= 10) {
        elementosInterface.recipienteCronometro.classList.add("urgente");
    } else {
        elementosInterface.recipienteCronometro.classList.remove("urgente");
    }
}

// --- TICK DO RELÓGIO ---
function descontarSegundoCronometro() {
    estado.tempoRestante--;
    atualizarCronometro();

    if (estado.tempoRestante <= 0) {
        finalizarPartida();
    }
}

// --- FINALIZA A PARTIDA ---
function finalizarPartida() {
    clearInterval(estado.identificadorIntervaloCronometro);
    estado.jogando = false;
    elementosInterface.campoPalpite.disabled = true;

    const total = estado.categoriaAtual.respostas.length;

    if (estado.acertos.length >= Math.ceil(total / 2)) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    elementosInterface.pontuacaoFinal.textContent = estado.acertos.length;
    elementosInterface.rotuloPontuacaoFinal.textContent = ` / ${total}`;
    elementosInterface.perguntaResultadoFinal.textContent = estado.categoriaAtual.pergunta;

    elementosInterface.acertosResultadoFinal.innerHTML = "";
    elementosInterface.respostasNaoAcertadas.innerHTML = "";

    estado.categoriaAtual.respostas.forEach((respostaCategoria) => {
        const item = document.createElement("div");
        item.className = "s30-final-item";
        item.textContent = respostaCategoria.nome;

        if (estado.acertos.includes(respostaCategoria.nome)) {
            item.classList.add("hit");
            elementosInterface.acertosResultadoFinal.appendChild(item);
        } else {
            item.classList.add("miss");
            elementosInterface.respostasNaoAcertadas.appendChild(item);
        }
    });

    if (elementosInterface.acertosResultadoFinal.childElementCount === 0) {
        elementosInterface.acertosResultadoFinal.innerHTML = "<span class=\"s30-empty\">—</span>";
    }
    
    if (elementosInterface.respostasNaoAcertadas.childElementCount === 0) {
        elementosInterface.respostasNaoAcertadas.innerHTML = "<span class=\"s30-empty\">—</span>";
    }

    elementosInterface.areaJogo.classList.add("hidden");
    elementosInterface.resultadoFinal.classList.remove("hidden");

    if (window.FG11Stats) {
        const acertos = estado.acertos.length;
        const venceu = acertos >= Math.ceil(total / 2);
        const rotulos = Array.from({ length: total + 1 }, (valorNaoUtilizado, indicePontuacao) => String(indicePontuacao));
        window.FG11Stats.registrar("football-30-segundos", {
            venceu,
            bucket: acertos,
            tamanho: total + 1
        });
        window.FG11Stats.mostrarModal("football-30-segundos", {
            venceu,
            titulo: "Tempo esgotado!",
            resposta: `Você citou ${acertos} de ${total}`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Acertos por partida",
            bucketAtual: acertos,
            onReiniciar: iniciarJogo,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- INICIA O JOGO ---
function iniciarJogo() {
    clearInterval(estado.identificadorIntervaloCronometro);

    sortearCategoria();
    estado.tempoRestante = estado.tempoTotal;
    estado.acertos = [];
    estado.jogando = true;

    elementosInterface.perguntaTexto.textContent = estado.categoriaAtual.pergunta;
    elementosInterface.totalPossivel.textContent = `/${estado.categoriaAtual.respostas.length}`;
    elementosInterface.contadorAcertos.textContent = "0";
    elementosInterface.listaAcertos.innerHTML = "";
    elementosInterface.mensagemPalpite.classList.add("hidden");
    elementosInterface.campoPalpite.value = "";
    elementosInterface.campoPalpite.disabled = false;
    esconderSugestoes();

    atualizarCronometro();

    elementosInterface.resultadoFinal.classList.add("hidden");
    elementosInterface.areaJogo.classList.remove("hidden");
    elementosInterface.campoPalpite.focus();

    estado.identificadorIntervaloCronometro = setInterval(descontarSegundoCronometro, 1000);
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoTrintaSegundos() {
    await carregarDados();
    nomesDisponiveis = obterNomes();

    document.getElementById("btnEnviarPalpite").addEventListener("click", verificarPalpite);
    document.getElementById("btnReiniciarPartida").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    elementosInterface.campoPalpite.addEventListener("input", renderizarSugestoes);
    elementosInterface.campoPalpite.addEventListener("keydown", (eventoTeclado) => {
        const itens = [...elementosInterface.listaSugestoes.querySelectorAll(".suggestion-item")];

        if (eventoTeclado.key === "ArrowDown" && itens.length > 0) {
            eventoTeclado.preventDefault();
            sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "ArrowUp" && itens.length > 0) {
            eventoTeclado.preventDefault();
            sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "Enter") {
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                eventoTeclado.preventDefault();
                selecionarSugestao(itens[sugestaoAtiva].querySelector("span").textContent);
            } else {
                verificarPalpite();
            }
        } else if (eventoTeclado.key === "Escape") {
            esconderSugestoes();
        }
    });

    document.addEventListener("click", (eventoClique) => {
        if (!eventoClique.target.closest(".input-autocomplete")) {
            esconderSugestoes();
        }
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-30-segundos";

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

inicializarJogoTrintaSegundos();
