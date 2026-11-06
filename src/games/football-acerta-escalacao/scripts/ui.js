import { estado }                           from "./core.js";
import { obterPosicao, obterRotuloPosicao } from "./data.js";

const elementos = {
    valorCronometro:            document.getElementById("timer"),
    areaCronometro:             document.getElementById("gameTimerArea"),
    informacoesJogo:            document.getElementById("gameInfo"),
    informacoesPartida:         document.getElementById("matchInfo"),
    acertos:                    document.getElementById("acertos"),
    camadaJogadores:            document.getElementById("playersLayer"),
    campoPalpite:               document.getElementById("guessInput"),
    listaSugestoesJogadores:    document.getElementById("autocompleteList"),
    resultadoFinal:             document.getElementById("finalResult"),
    pontosFinais:               document.getElementById("finalPoints"),
    detalhesResultadoFinal:     document.getElementById("finalDetails"),
    recipienteCampo:            document.querySelector(".field-wrapper"),
    areaCampoPalpite:           document.querySelector(".guess-input-area"),
    areaDesistirPartida:        document.querySelector(".give-up-area"),
    selecaoModo:                document.getElementById("modeSelect")
};

let tratarSelecaoJogadorAtual = null;
let nomesJogadoresDisponiveis    = [];

// --- RENDERIZAÇÃO DO CAMPO ---
export function renderizarCampo(escalacao) {
    elementos.camadaJogadores.innerHTML = "";
    elementos.informacoesPartida.textContent = `${escalacao.time} — ${escalacao.evento} (${escalacao.formacao})`;

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

        elementos.camadaJogadores.appendChild(posicaoJogador);
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
    elementos.valorCronometro.textContent = `${minutosRestantes}:${segundosRestantes.toString().padStart(2, "0")}`;

    if (estado.tempoRestante <= 30) {
        elementos.areaCronometro.classList.add("danger");
    } else {
        elementos.areaCronometro.classList.remove("danger");
    }
}

// --- ATUALIZAÇÃO DOS ACERTOS ---
export function atualizarAcertos() {
    elementos.acertos.textContent = estado.acertos;
}

// --- ESCONDER TIMER ---
export function esconderCronometro() {
    elementos.areaCronometro.classList.add("hidden");
}

// --- MOSTRAR SELEÇÃO DE MODO ---
export function mostrarSelecaoModoJogo() {
    elementos.selecaoModo.classList.remove("hidden");
    elementos.informacoesJogo.classList.add("hidden");
    elementos.recipienteCampo.classList.add("hidden");
    elementos.areaCampoPalpite.classList.add("hidden");
    elementos.areaDesistirPartida.classList.add("hidden");
    elementos.resultadoFinal.classList.add("hidden");
}

// --- ESCONDER SELEÇÃO DE MODO ---
export function esconderSelecaoModoJogo() {
    elementos.selecaoModo.classList.add("hidden");
    elementos.informacoesJogo.classList.remove("hidden");
    elementos.recipienteCampo.classList.remove("hidden");
    elementos.areaCampoPalpite.classList.remove("hidden");
    elementos.areaDesistirPartida.classList.remove("hidden");
    elementos.areaCronometro.classList.remove("hidden");
}

// --- ATUALIZAÇÃO DA LISTA DE AUTOCOMPLETE ---
function atualizarListaSugestoes(valorPalpite) {
    const listaSugestoes = elementos.listaSugestoesJogadores;
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
            elementos.campoPalpite.value = "";
            listaSugestoes.classList.add("hidden");
        });
        listaSugestoes.appendChild(itemSugestao);
    });

    listaSugestoes.classList.remove("hidden");
}

// --- CONFIGURAÇÃO DO AUTOCOMPLETE ---
export function configurarSugestoesJogadores(nomes, tratarSelecaoJogador) {
    nomesJogadoresDisponiveis = nomes;
    tratarSelecaoJogadorAtual = tratarSelecaoJogador;

    const campoPalpite = elementos.campoPalpite;
    const listaSugestoes = elementos.listaSugestoesJogadores;

    const novoCampoPalpite = campoPalpite.cloneNode(true);
    campoPalpite.parentNode.replaceChild(novoCampoPalpite, campoPalpite);
    elementos.campoPalpite = novoCampoPalpite;

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
    elementos.campoPalpite.focus();
}

// --- TEXTO TRADUZIDO ---
function obterTextoTraduzido(chaveTraducao, textoAlternativo) {
    const lingua = localStorage.getItem("preferredLanguage") || "traducoes";
    if (window.traducoesIdiomas && window.traducoesIdiomas[lingua] && window.traducoesIdiomas[lingua][chaveTraducao]) {
        return window.traducoesIdiomas[lingua][chaveTraducao];
    }
    return textoAlternativo;
}

// --- EXIBIR RESULTADO FINAL ---
export function mostrarResultadoFinal() {
    elementos.recipienteCampo.classList.add("hidden");
    elementos.areaCampoPalpite.classList.add("hidden");
    elementos.areaDesistirPartida.classList.add("hidden");
    elementos.resultadoFinal.classList.remove("hidden");

    elementos.pontosFinais.textContent = estado.acertos;

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
    elementos.detalhesResultadoFinal.innerHTML = detalhes;
}

// --- REINICIAR INTERFACE ---
export function reiniciarInterfaceJogo() {
    elementos.resultadoFinal.classList.add("hidden");
    elementos.recipienteCampo.classList.remove("hidden");
    elementos.areaCampoPalpite.classList.remove("hidden");
    elementos.areaDesistirPartida.classList.remove("hidden");
    elementos.campoPalpite.value = "";
    elementos.listaSugestoesJogadores.classList.add("hidden");
    elementos.areaCronometro.classList.remove("danger");
}
