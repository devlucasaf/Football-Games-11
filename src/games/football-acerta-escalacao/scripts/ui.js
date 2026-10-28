import { estado } from "./core.js";
import { obterPosicao, obterRotuloPosicao } from "./data.js";

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

let tratarSelecaoJogadorAtual = null;
let nomesJogadoresDisponiveis    = [];

// --- RENDERIZAÇÃO DO CAMPO ---
export function renderizarCampo(escalacao) {
    elementos.playersLayer.innerHTML = "";
    elementos.matchInfo.textContent = `${escalacao.time} — ${escalacao.evento} (${escalacao.formacao})`;

    escalacao.jogadores.forEach((jogador, indiceJogador) => {
        const coordenadasPosicao = obterPosicao(jogador.posicao, escalacao.formacao);
        const rotuloPosicao = obterRotuloPosicao(jogador.posicao);

        const posicaoJogador = document.createElement("div");
        posicaoJogador.className = "player-slot";
        posicaoJogador.id = `slot-${indiceJogador}`;
        posicaoJogador.style.top = `${coordenadasPosicao.top}%`;
        posicaoJogador.style.left = `${coordenadasPosicao.left}%`;

        posicaoJogador.innerHTML = `
            <div class="player-circle">${rotuloPosicao}</div>
            <span class="player-label">?</span>
        `;

        elementos.playersLayer.appendChild(posicaoJogador);
    });
}

// --- REVELAR JOGADOR ACERTADO ---
export function revelarJogador(indiceJogador, nome) {
    const posicaoJogador = document.getElementById(`slot-${indiceJogador}`);
    if (!posicaoJogador) {
        return;
    }
    posicaoJogador.classList.add("revealed");
    posicaoJogador.querySelector(".player-circle").innerHTML = "<i class='fas fa-check'></i>";
    posicaoJogador.querySelector(".player-label").textContent = nome;
}

// --- REVELAR JOGADOR NÃO ACERTADO ---
export function revelarNaoAcertado(indiceJogador, nome) {
    const posicaoJogador = document.getElementById(`slot-${indiceJogador}`);
    if (!posicaoJogador) {
        return;
    }
    posicaoJogador.classList.add("missed");
    posicaoJogador.querySelector(".player-circle").innerHTML = "<i class='fas fa-times'></i>";
    posicaoJogador.querySelector(".player-label").textContent = nome;
}

// --- ATUALIZAÇÃO DO TIMER ---
export function atualizarCronometro() {
    const minutosRestantes = Math.floor(estado.tempoRestante / 60);
    const segundosRestantes = estado.tempoRestante % 60;
    elementos.timer.textContent = `${minutosRestantes}:${segundosRestantes.toString().padStart(2, "0")}`;

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
export function esconderCronometro() {
    elementos.gameTimerArea.classList.add("hidden");
}

// --- MOSTRAR SELEÇÃO DE MODO ---
export function mostrarSelecaoModoJogo() {
    elementos.modeSelect.classList.remove("hidden");
    elementos.gameInfo.classList.add("hidden");
    elementos.fieldWrapper.classList.add("hidden");
    elementos.guessInputArea.classList.add("hidden");
    elementos.giveUpArea.classList.add("hidden");
    elementos.finalResult.classList.add("hidden");
}

// --- ESCONDER SELEÇÃO DE MODO ---
export function esconderSelecaoModoJogo() {
    elementos.modeSelect.classList.add("hidden");
    elementos.gameInfo.classList.remove("hidden");
    elementos.fieldWrapper.classList.remove("hidden");
    elementos.guessInputArea.classList.remove("hidden");
    elementos.giveUpArea.classList.remove("hidden");
    elementos.gameTimerArea.classList.remove("hidden");
}

// --- ATUALIZAÇÃO DA LISTA DE AUTOCOMPLETE ---
function atualizarListaSugestoes(valorPalpite) {
    const listaSugestoes = elementos.autocompleteList;
    listaSugestoes.innerHTML = "";

    if (valorPalpite.length < 2) {
        listaSugestoes.classList.add("hidden");
        return;
    }

    const normalizarNomeJogador = nomeJogador => nomeJogador.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const extras = estado.escalacaoAtual?.extras || [];
    const filtrados = nomesJogadoresDisponiveis.filter(nomeJogador => {
        if (!normalizarNomeJogador(nomeJogador).includes(normalizarNomeJogador(valorPalpite))) {
            return false;
        }

        if (extras.some(nomeAlternativo => normalizarNomeJogador(nomeAlternativo) === normalizarNomeJogador(nomeJogador))) {
            return true;
        }
        return estado.jogadoresRestantes.some(jogadorRestante => normalizarNomeJogador(jogadorRestante.nome) === normalizarNomeJogador(nomeJogador));
    });

    if (filtrados.length === 0) {
        listaSugestoes.classList.add("hidden");
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const itemSugestao = document.createElement("li");
        itemSugestao.textContent = nome;
        itemSugestao.addEventListener("click", () => {
            tratarSelecaoJogadorAtual(nome);
            elementos.guessInput.value = "";
            listaSugestoes.classList.add("hidden");
        });
        listaSugestoes.appendChild(itemSugestao);
    });

    listaSugestoes.classList.remove("hidden");
}

// --- CONFIGURAÇÃO DO AUTOCOMPLETE ---
export function configurarSugestoesJogadores(nomes, tratarSelecaoJogador) {
    nomesJogadoresDisponiveis    = nomes;
    tratarSelecaoJogadorAtual = tratarSelecaoJogador;

    const campoPalpite = elementos.guessInput;
    const listaSugestoes = elementos.autocompleteList;

    const novoCampoPalpite = campoPalpite.cloneNode(true);
    campoPalpite.parentNode.replaceChild(novoCampoPalpite, campoPalpite);
    elementos.guessInput = novoCampoPalpite;

    novoCampoPalpite.addEventListener("input", () => {
        atualizarListaSugestoes(novoCampoPalpite.value.trim().toLowerCase());
    });

    novoCampoPalpite.addEventListener("keydown", (eventoTeclado) => {
        const itensSugestoes = listaSugestoes.querySelectorAll("li");
        const sugestaoAtiva = listaSugestoes.querySelector("li.active");

        if (eventoTeclado.key === "ArrowDown") {
            eventoTeclado.preventDefault();
            if (!sugestaoAtiva && itensSugestoes.length > 0) {
                itensSugestoes[0].classList.add("active");
            } else if (sugestaoAtiva) {
                sugestaoAtiva.classList.remove("active");
                const proximaSugestao = sugestaoAtiva.nextElementSibling || itensSugestoes[0];
                proximaSugestao.classList.add("active");
                proximaSugestao.scrollIntoView({ 
                    block: "nearest" 
                });
            }
        } else if (eventoTeclado.key === "ArrowUp") {
            eventoTeclado.preventDefault();
            if (sugestaoAtiva) {
                sugestaoAtiva.classList.remove("active");
                const sugestaoAnterior = sugestaoAtiva.previousElementSibling || itensSugestoes[itensSugestoes.length - 1];
                sugestaoAnterior.classList.add("active");
                sugestaoAnterior.scrollIntoView({ 
                    block: "nearest" 
                });
            } else if (itensSugestoes.length > 0) {
                itensSugestoes[itensSugestoes.length - 1].classList.add("active");
            }
        } else if (eventoTeclado.key === "ArrowRight") {
            if (sugestaoAtiva) {
                eventoTeclado.preventDefault();
                tratarSelecaoJogadorAtual(sugestaoAtiva.textContent);
                novoCampoPalpite.value = "";
                listaSugestoes.classList.add("hidden");
            }
        } else if (eventoTeclado.key === "Enter") {
            eventoTeclado.preventDefault();
            if (sugestaoAtiva) {
                tratarSelecaoJogadorAtual(sugestaoAtiva.textContent);
                novoCampoPalpite.value = "";
                listaSugestoes.classList.add("hidden");
            } else if (novoCampoPalpite.value.trim()) {
                tratarSelecaoJogadorAtual(novoCampoPalpite.value.trim());
                novoCampoPalpite.value = "";
                listaSugestoes.classList.add("hidden");
            }
        } else if (eventoTeclado.key === "Escape") {
            listaSugestoes.classList.add("hidden");
        }
    });

    document.addEventListener("click", (eventoClique) => {
        if (!eventoClique.target.closest(".autocomplete-wrapper")) {
            listaSugestoes.classList.add("hidden");
        }
    });
}

// --- FOCAR NO INPUT ---
export function focarCampoPalpite() {
    elementos.guessInput.focus();
}

// --- HELPER DE TRADUÇÃO ---
function obterTextoTraduzido(chaveTraducao, textoAlternativo) {
    const lingua = localStorage.getItem("preferredLanguage") || "traducoes";
    if (window.translations && window.translations[lingua] && window.translations[lingua][chaveTraducao]) {
        return window.translations[lingua][chaveTraducao];
    }
    return textoAlternativo;
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
        mensagem = obterTextoTraduzido("acerta-result-perfect", "Perfeito! Você lembrou de todos!");
    } else if (porcentagem >= 80) {
        mensagem = obterTextoTraduzido("acerta-result-great", "Memória quase perfeita!");
    } else if (porcentagem >= 50) {
        mensagem = obterTextoTraduzido("acerta-result-good", "Bom conhecimento!");
    } else {
        mensagem = obterTextoTraduzido("acerta-result-try-again", "Tente novamente!");
    }

    let detalhes = `<p>${mensagem}</p>`;
    if (estado.modoComTempo) {
        const tempoUsado = 300 - estado.tempoRestante;
        const minutosUsados = Math.floor(tempoUsado / 60);
        const segundosUsados = tempoUsado % 60;
        detalhes += `<p>${obterTextoTraduzido("acerta-time-label", "Tempo")}: ${minutosUsados}:${segundosUsados.toString().padStart(2, "0")}</p>`;
    } else {
        detalhes += `<p>${obterTextoTraduzido("acerta-mode-no-time-result", "Modo: Sem Tempo")}</p>`;
    }
    detalhes += `<p><strong>${estado.escalacaoAtual.time}</strong> — ${estado.escalacaoAtual.evento}</p>`;
    elementos.finalDetails.innerHTML = detalhes;
}

// --- RESETAR INTERFACE ---
export function reiniciarInterfaceJogo() {
    elementos.finalResult.classList.add("hidden");
    elementos.fieldWrapper.classList.remove("hidden");
    elementos.guessInputArea.classList.remove("hidden");
    elementos.giveUpArea.classList.remove("hidden");
    elementos.guessInput.value = "";
    elementos.autocompleteList.classList.add("hidden");
    elementos.gameTimerArea.classList.remove("danger");
}
