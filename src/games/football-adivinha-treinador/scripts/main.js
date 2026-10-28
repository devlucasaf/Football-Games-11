import { estado } from "./core.js";
import { carregarDados, sortearTreinadoresRodadas, normalizarTextoComparacao, obterDicas } from "./data.js";

const elementosInterface = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    pontos:         document.getElementById("pontos"),
    dicasGrid:      document.getElementById("dicasGrid"),
    campoPalpite:     document.getElementById("guessInput"),
    guessFeedback:  document.getElementById("guessFeedback"),
    suggestions:    document.getElementById("suggestions"),
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
let sugestaoAtiva = -1;

// --- RENDERIZA AS SUGESTÕES DE TREINADORES ---
function renderizarSugestoes() {
    const termo = normalizarTextoComparacao(elementosInterface.campoPalpite.value.trim());
    elementosInterface.suggestions.innerHTML = "";
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const encontrados = estado.treinadores
        .filter(treinador => normalizarTextoComparacao(treinador.nome).includes(termo))
        .slice(0, 8);

    if (encontrados.length === 0) {
        esconderSugestoes();
        return;
    }

    encontrados.forEach((treinador) => {
        const item = document.createElement("li");
        item.className = "suggestion-item";
        item.innerHTML = `<i class="fas fa-user-tie"></i><span>${treinador.nome}</span>`;
        item.addEventListener("mousedown", (eventoSelecao) => {
            eventoSelecao.preventDefault();
            selecionarSugestao(treinador.nome);
        });
        elementosInterface.suggestions.appendChild(item);
    });

    elementosInterface.suggestions.classList.remove("hidden");
}

// --- SELECIONA UMA SUGESTÃO E ENVIA O PALPITE ---
function selecionarSugestao(nome) {
    elementosInterface.campoPalpite.value = nome;
    esconderSugestoes();
    verificarPalpite();
}

// --- ESCONDE A LISTA DE SUGESTÕES ---
function esconderSugestoes() {
    elementosInterface.suggestions.classList.add("hidden");
    elementosInterface.suggestions.innerHTML = "";
    sugestaoAtiva = -1;
}

// --- ATUALIZA O ITEM DESTACADO NA NAVEGAÇÃO POR TECLADO ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, indiceSugestao) => item.classList.toggle("active", indiceSugestao === sugestaoAtiva));
    if (itens[sugestaoAtiva]) {
        itens[sugestaoAtiva].scrollIntoView({ block: "nearest" });
    }
}

// --- MOSTRA A RODADA ATUAL ---
function mostrarRodada() {
    const treinador = estado.sorteados[estado.rodadaAtual];
    dicasAtuais = obterDicas(treinador);
    estado.dicasReveladas = 1;

    elementosInterface.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosInterface.campoPalpite.value = "";
    elementosInterface.guessFeedback.classList.add("hidden");
    esconderSugestoes();
    elementosInterface.gameArea.classList.remove("hidden");
    elementosInterface.roundResult.classList.add("hidden");
    renderizarDicas();
    elementosInterface.campoPalpite.focus();
}

// --- RENDERIZA AS DICAS NA TELA ---
function renderizarDicas() {
    elementosInterface.dicasGrid.innerHTML = "";
    elementosInterface.dicasCount.textContent = `${estado.dicasReveladas}/${estado.maxDicas}`;

    dicasAtuais.forEach((dica, indiceDica) => {
        const cartaoDica = document.createElement("div");
        cartaoDica.className = "dica-card";

        if (indiceDica < estado.dicasReveladas) {
            cartaoDica.classList.add("revealed");
            cartaoDica.innerHTML = `<span class="dica-label">${dica.rotulo}</span><span class="dica-valor">${dica.valor}</span>`;
        } else {
            cartaoDica.classList.add("hidden-dica");
            cartaoDica.innerHTML = `<span class="dica-label">Dica ${indiceDica + 1}</span><span class="dica-valor"><i class="fas fa-lock"></i></span>`;
            cartaoDica.addEventListener("click", () => revelarDica(indiceDica));
        }

        elementosInterface.dicasGrid.appendChild(cartaoDica);
    });
}

// --- REVELA UMA DICA ESPECÍFICA ---
function revelarDica(indiceDica) {
    if (indiceDica < estado.dicasReveladas) {
        return;
    }
    estado.dicasReveladas = indiceDica + 1;
    renderizarDicas();
}

// --- CALCULA OS PONTOS BASEADOS NAS DICAS REVELADAS ---
function calcularPontos() {
    const base = 6 - estado.dicasReveladas;
    return Math.max(base, 1);
}

// --- VERIFICA O PALPITE ---
function verificarPalpite() {
    const palpite = elementosInterface.campoPalpite.value.trim();
    if (!palpite) {
        return;
    }

    const treinador = estado.sorteados[estado.rodadaAtual];
    const acertou = normalizarTextoComparacao(palpite) === normalizarTextoComparacao(treinador.nome);

    if (acertou) {
        const pontosRodada = calcularPontos();
        estado.pontos += pontosRodada;
        elementosInterface.pontos.textContent = estado.pontos;
        estado.historico.push({ 
            treinador: treinador.nome, 
            acertou: true, 
            dicas: estado.dicasReveladas, 
            pontos: pontosRodada 
        });
        mostrarResultado(true, treinador);
    } else {
        elementosInterface.guessFeedback.textContent = `"${palpite}" não é o treinador. Tente novamente!`;
        elementosInterface.guessFeedback.className = "guess-feedback wrong";
        elementosInterface.guessFeedback.classList.remove("hidden");
        elementosInterface.campoPalpite.value = "";
        esconderSugestoes();
        elementosInterface.campoPalpite.focus();

        if (estado.dicasReveladas < estado.maxDicas) {
            estado.dicasReveladas++;
            renderizarDicas();
        }
    }
}

// --- PULA A RODADA ATUAL ---
function pularRodada() {
    const treinador = estado.sorteados[estado.rodadaAtual];
    estado.historico.push({ 
        treinador: treinador.nome, 
        acertou: false, 
        dicas: estado.dicasReveladas, 
        pontos: 0 
    });
    mostrarResultado(false, treinador);
}

// --- MOSTRA O RESULTADO DA RODADA ---
function mostrarResultado(acertou, treinador) {
    elementosInterface.gameArea.classList.add("hidden");
    elementosInterface.roundResult.classList.remove("hidden");

    if (acertou) {
        elementosInterface.roundIcon.className = "round-icon correct";
        elementosInterface.roundIcon.innerHTML = "<i class=\"fas fa-check-circle\"></i>";
        elementosInterface.roundText.textContent = `Correto! +${calcularPontos()} pontos`;
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }

        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-adivinha-treinador", {
                venceu: true,
                bucket: estado.dicasReveladas - 1,
                tamanho: estado.maxDicas
            });
        }
    } else {
        elementosInterface.roundIcon.className = "round-icon wrong";
        elementosInterface.roundIcon.innerHTML = "<i class=\"fas fa-times-circle\"></i>";
        elementosInterface.roundText.textContent = "Não acertou desta vez!";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
        
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-adivinha-treinador", {
                venceu: false,
                tamanho: estado.maxDicas
            });
        }
    }

    elementosInterface.roundAnswer.textContent = `Resposta: ${treinador.nome}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnAvancarRodada").innerHTML = "<i class=\"fas fa-flag-checkered\"></i> Ver Resultado";
    }
}

// --- AVANÇA PARA A PRÓXIMA RODADA OU MOSTRA O RESULTADO FINAL ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- MOSTRA O RESULTADO FINAL DO JOGO ---
function mostrarFinal() {
    elementosInterface.gameArea.classList.add("hidden");
    elementosInterface.roundResult.classList.add("hidden");
    elementosInterface.gameInfo.classList.add("hidden");
    elementosInterface.finalResult.classList.remove("hidden");
    elementosInterface.finalPoints.textContent = estado.pontos;

    const pontuacaoMaxima = estado.totalRodadas * 5;
    const porcentagemAcertos = Math.round((estado.pontos / pontuacaoMaxima) * 100);
    const acertos = estado.historico.filter(resultadoRodada => resultadoRodada.acertou).length;

    let mensagemResultado = "";
    if (porcentagemAcertos >= 80) {
        mensagemResultado = "Especialista em treinadores!";
    } else if (porcentagemAcertos >= 50) {
        mensagemResultado = "Bom conhecimento tático!";
    } else if (porcentagemAcertos >= 30) {
        mensagemResultado = "Precisa estudar mais os bastidores!";
    } else {
        mensagemResultado = "Tente novamente!";
    }

    elementosInterface.finalDetails.innerHTML = `<p>${mensagemResultado}</p><p>Acertos: ${acertos}/${estado.totalRodadas}</p>`;

    if (window.FG11Stats) {
        const rotulos = Array.from({ length: estado.maxDicas }, (valorNaoUtilizado, indiceDica) => String(indiceDica + 1));
        window.FG11Stats.mostrarModal("football-adivinha-treinador", {
            venceu: acertos >= estado.totalRodadas / 2,
            titulo: "Fim de jogo!",
            resposta: `Você acertou ${acertos} de ${estado.totalRodadas} · ${estado.pontos} pontos`,
            tamanho: estado.maxDicas,
            rotulos,
            tituloGrafico: "Vitórias por dicas reveladas",
            bucketAtual: -1,
            onReiniciar: iniciarJogo,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- INICIA O JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.pontos = 0;
    estado.historico = [];
    elementosInterface.pontos.textContent = "0";
    elementosInterface.finalResult.classList.add("hidden");
    elementosInterface.gameInfo.classList.remove("hidden");
    sortearTreinadoresRodadas();
    mostrarRodada();
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoAdivinhaTreinador() {
    await carregarDados();

    document.getElementById("btnEnviarPalpite").addEventListener("click", verificarPalpite);
    document.getElementById("btnPularRodada").addEventListener("click", pularRodada);
    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnReiniciarPartida").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        const itens = [...elementosInterface.suggestions.querySelectorAll(".suggestion-item")];

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "Enter") {
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                selecionarSugestao(itens[sugestaoAtiva].querySelector("span").textContent);
            } else {
                verificarPalpite();
            }
        } else if (e.key === "Escape") {
            esconderSugestoes();
        }
    });

    elementosInterface.campoPalpite.addEventListener("input", renderizarSugestoes);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-autocomplete")) {
            esconderSugestoes();
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

inicializarJogoAdivinhaTreinador();
