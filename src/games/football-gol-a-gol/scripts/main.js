import estado from "./core.js";
import { carregarDados, sortearGols, verificarResposta, obterNomesUnicos, normalizarNomeJogador } from "./data.js";

const elementosGols = {
    rodadaAtual:        document.getElementById("rodadaAtual"),
    acertos:            document.getElementById("acertos"),
    tentativas:         document.getElementById("tentativas"),
    listaDicas:          document.getElementById("dicasList"),
    campoPalpite:       document.getElementById("palpiteInput"),
    listaSugestoesJogadores:   document.getElementById("autocompleteList"),
    mensagemPalpite:      document.getElementById("guessFeedback"),
    areaJogo:           document.getElementById("gameArea"),
    resultadoRodada:        document.getElementById("roundResult"),
    iconeRodada:          document.getElementById("roundIcon"),
    textoRodada:          document.getElementById("roundText"),
    respostaRodada:        document.getElementById("roundAnswer"),
    resultadoFinal:        document.getElementById("finalResult"),
    pontosFinais:        document.getElementById("finalPoints"),
    detalhesResultadoFinal:       document.getElementById("finalDetails"),
    informacoesJogo:           document.getElementById("gameInfo")
};

let nomes = [];

// --- EXIBIÇÃO DA RODADA ATUAL ---
function mostrarRodada() {
    const gol = estado.sorteados[estado.rodadaAtual];
    estado.dicasReveladas = 1;                            

    elementosGols.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosGols.tentativas.textContent = estado.maximoDicas;
    elementosGols.campoPalpite.value = "";
    elementosGols.mensagemPalpite.classList.add("hidden");
    elementosGols.listaSugestoesJogadores.classList.add("hidden");
    elementosGols.areaJogo.classList.remove("hidden");
    elementosGols.resultadoRodada.classList.add("hidden");

    renderizarDicas(gol);
    elementosGols.campoPalpite.focus();
}

// --- RENDERIZAÇÃO DAS DICAS ---
function renderizarDicas(gol) {
    elementosGols.listaDicas.innerHTML = "";
    for (let indiceDica = 0; indiceDica < estado.dicasReveladas; indiceDica++) {
        const elementoDica = document.createElement("li");
        elementoDica.className = "dica-item";
        elementoDica.innerHTML = `<span class="dica-number">${indiceDica + 1}</span><span class="dica-text">${gol.dicas[indiceDica]}</span>`;
        elementosGols.listaDicas.appendChild(elementoDica);
    }
}

// --- VERIFICAÇÃO DO PALPITE DO JOGADOR ---
function verificarPalpite(palpite) {
    if (!palpite) {
        return;
    }

    const gol = estado.sorteados[estado.rodadaAtual];
    const acertou = verificarResposta(palpite, gol);

    if (acertou) {
        estado.acertos++;
        elementosGols.acertos.textContent = estado.acertos;
        estado.historico.push({ 
            resposta: gol.resposta, 
            acertou: true, 
            tentativas: estado.dicasReveladas 
        });
        mostrarResultado(true, gol);
    } else {
        estado.dicasReveladas++;
        const restantes = estado.maximoDicas - estado.dicasReveladas + 1;
        elementosGols.tentativas.textContent = restantes;

        if (estado.dicasReveladas > estado.maximoDicas) {
            estado.historico.push({ 
                resposta: gol.resposta, 
                acertou: false, 
                tentativas: estado.maximoDicas
            });
            mostrarResultado(false, gol);
        } else {
            elementosGols.mensagemPalpite.textContent = `"${palpite}" não é o jogador!`;
            elementosGols.mensagemPalpite.className = "guess-feedback wrong";
            elementosGols.mensagemPalpite.classList.remove("hidden");
            renderizarDicas(gol);
            elementosGols.campoPalpite.value = "";
            elementosGols.campoPalpite.focus();
        }
    }
}

// --- EXIBIÇÃO DO RESULTADO DA RODADA ---
function mostrarResultado(acertou, gol) {
    elementosGols.areaJogo.classList.add("hidden");
    elementosGols.resultadoRodada.classList.remove("hidden");

    if (acertou) {
        elementosGols.iconeRodada.className = "round-icon correct";
        elementosGols.iconeRodada.innerHTML = "<i class='fas fa-futbol'></i>";
        elementosGols.textoRodada.textContent = "Goool! Você acertou!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        elementosGols.iconeRodada.className = "round-icon wrong";
        elementosGols.iconeRodada.innerHTML = "<i class='fas fa-times-circle'></i>";
        elementosGols.textoRodada.textContent = "Não acertou desta vez!";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    elementosGols.respostaRodada.textContent = `Resposta: ${gol.resposta}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnAvancarRodada").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    }
}

// --- AVANÇA PARA PRÓXIMA RODADA OU FINAL ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- TELA DE RESULTADO FINAL ---
function mostrarFinal() {
    elementosGols.areaJogo.classList.add("hidden");
    elementosGols.resultadoRodada.classList.add("hidden");
    elementosGols.informacoesJogo.classList.add("hidden");
    elementosGols.resultadoFinal.classList.remove("hidden");
    elementosGols.pontosFinais.textContent = estado.acertos;

    const percentualAcertos = Math.round((estado.acertos / estado.totalRodadas) * 100);
    let mensagem = "";
    if (percentualAcertos === 100) {
        mensagem = "Craque absoluto! Memória enciclopédica!";
    } else if (percentualAcertos >= 70) {
        mensagem = "Ótimo conhecimento de gols históricos!";
    } else if (percentualAcertos >= 40) {
        mensagem = "Bom, mas pode melhorar!";
    } else {
        mensagem = "Precisa assistir mais jogos!";
    }

    elementosGols.detalhesResultadoFinal.innerHTML = `<p>${mensagem}</p>`;

    if (window.FG11Stats) {
        const total = estado.totalRodadas;
        const venceu = estado.acertos >= Math.ceil(total / 2);
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-gol-a-gol", {
            venceu,
            bucket: estado.acertos,
            tamanho: total + 1
        });
        window.FG11Stats.mostrarModal("football-gol-a-gol", {
            venceu,
            titulo: "Fim de jogo!",
            resposta: `Você acertou ${estado.acertos} de ${total}`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Acertos por partida",
            bucketAtual: estado.acertos,
            onReiniciar: iniciarJogo,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- INICIALIZAÇÃO DO JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    estado.historico = [];
    elementosGols.acertos.textContent = "0";
    elementosGols.resultadoFinal.classList.add("hidden");
    elementosGols.informacoesJogo.classList.remove("hidden");
    sortearGols();
    mostrarRodada();
}

// --- AUTOCOMPLETE ---
function atualizarSugestoesJogadores(textoPalpite) {
    const listaSugestoes = elementosGols.listaSugestoesJogadores;
    listaSugestoes.innerHTML = "";

    if (textoPalpite.length < 2) {
        listaSugestoes.classList.add("hidden");
        return;
    }

    const filtrados = nomes.filter(nome => normalizarNomeJogador(nome).includes(normalizarNomeJogador(textoPalpite)));

    if (filtrados.length === 0) {
        listaSugestoes.classList.add("hidden");
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const elementoSugestao = document.createElement("li");
        elementoSugestao.textContent = nome;
        elementoSugestao.addEventListener("click", () => {
            verificarPalpite(nome);
            elementosGols.campoPalpite.value = "";
            listaSugestoes.classList.add("hidden");
        });
        listaSugestoes.appendChild(elementoSugestao);
    });

    listaSugestoes.classList.remove("hidden");
}

// --- CONFIGURAÇÃO DO CAMPO DE INPUT ---
function configurarCampoPalpite() {
    elementosGols.campoPalpite.addEventListener("input", () => {
        const textoPalpite = elementosGols.campoPalpite.value.trim();
        atualizarSugestoesJogadores(textoPalpite);
    });

    elementosGols.campoPalpite.addEventListener("keydown", (evento) => {
        const sugestoes = elementosGols.listaSugestoesJogadores.querySelectorAll("li");
        const sugestaoAtiva = elementosGols.listaSugestoesJogadores.querySelector("li.active");

        if (evento.key === "ArrowDown") {
            evento.preventDefault();
            if (!sugestaoAtiva && sugestoes.length > 0) {
                sugestoes[0].classList.add("active");
            } else if (sugestaoAtiva) {
                sugestaoAtiva.classList.remove("active");
                const proximaSugestao = sugestaoAtiva.nextElementSibling || sugestoes[0];
                proximaSugestao.classList.add("active");
            }
        } else if (evento.key === "ArrowUp") {
            evento.preventDefault();
            if (sugestaoAtiva) {
                sugestaoAtiva.classList.remove("active");
                const sugestaoAnterior = sugestaoAtiva.previousElementSibling || sugestoes[sugestoes.length - 1];
                sugestaoAnterior.classList.add("active");
            }
        } else if (evento.key === "Enter") {
            evento.preventDefault();
            if (sugestaoAtiva) {
                verificarPalpite(sugestaoAtiva.textContent);
                elementosGols.campoPalpite.value = "";
                elementosGols.listaSugestoesJogadores.classList.add("hidden");
            } else if (elementosGols.campoPalpite.value.trim()) {
                verificarPalpite(elementosGols.campoPalpite.value.trim());
                elementosGols.campoPalpite.value = "";
                elementosGols.listaSugestoesJogadores.classList.add("hidden");
            }
        } else if (evento.key === "Escape") {
            elementosGols.listaSugestoesJogadores.classList.add("hidden");
        }
    });

    document.addEventListener("click", (evento) => {
        if (!evento.target.closest(".autocomplete-wrapper")) {
            elementosGols.listaSugestoesJogadores.classList.add("hidden");
        }
    });
}

// --- INICIALIZAÇÃO DO JOGO ---
async function inicializarJogoGols() {
    await carregarDados();
    nomes = obterNomesUnicos();
    configurarCampoPalpite();

    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnJogarNovamente").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-gol-a-gol";

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

inicializarJogoGols();
