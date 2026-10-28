import estado from "./core.js";
import { carregarDados, sortearCategoria, obterNivelDoJogador, calcularAcertos, obterPosicoesDoNivel } from "./data.js";

const elementosJogo = {
    modeSelect:     document.getElementById("modeSelect"),
    gameArea:       document.getElementById("gameArea"),
    finalResult:    document.getElementById("finalResult"),
    categoria:      document.getElementById("categoria"),
    jogadorNome:    document.getElementById("jogadorNome"),
    jogadorInfo:    document.getElementById("jogadorInfo"),
    tierHint:       document.getElementById("tierHint"),
    piramideGrid:   document.getElementById("piramideGrid"),
    progresso:      document.getElementById("progresso"),
    btnAjuda:       document.getElementById("btnAjuda"),
    finalScore:     document.getElementById("finalScore"),
    finalMessage:   document.getElementById("finalMessage"),
    finalCorrect:   document.getElementById("finalCorrect"),
    gameInfo:       document.getElementById("gameInfo")
};

// --- RENDERIZAÇÃO DA PIRÂMIDE ---
function renderizarPiramide() {
    elementosJogo.piramideGrid.innerHTML = "";

    const niveis = [
        { nivel: 1, posicoes: [0] },
        { nivel: 2, posicoes: [1, 2] },
        { nivel: 3, posicoes: [3, 4, 5] },
        { nivel: 4, posicoes: [6, 7, 8, 9] }
    ];

    niveis.forEach(({ nivel, posicoes }) => {
        const linhaNivel = document.createElement("div");
        linhaNivel.className = `piramide-row tier-${nivel}`;

        posicoes.forEach(indicePosicao => {
            const elementoPosicao = document.createElement("div");
            elementoPosicao.className = "piramide-slot";
            elementoPosicao.dataset.indicePosicao = indicePosicao;

            if (estado.piramide[indicePosicao]) {
                elementoPosicao.classList.add("filled");
                elementoPosicao.innerHTML = `<span class="slot-nome">${estado.piramide[indicePosicao].nome}</span>`;
            } else {
                elementoPosicao.innerHTML = `<span class="slot-number">${indicePosicao + 1}º</span>`;
                elementoPosicao.classList.add("empty");
                elementoPosicao.addEventListener("click", () => colocarJogador(indicePosicao));
            }

            linhaNivel.appendChild(elementoPosicao);
        });

        elementosJogo.piramideGrid.appendChild(linhaNivel);
    });
}

// --- EXIBIÇÃO DO JOGADOR ATUAL ---
function mostrarJogadorAtual() {
    if (estado.indiceJogadorAtual >= estado.jogadoresEmbaralhados.length) {
        finalizarJogo();
        return;
    }

    const jogador = estado.jogadoresEmbaralhados[estado.indiceJogadorAtual];
    elementosJogo.jogadorNome.textContent = jogador.nome;
    elementosJogo.progresso.textContent = `${estado.indiceJogadorAtual + 1}/10`;

    if (estado.modo === "facil") {
        const nivel = obterNivelDoJogador(jogador);
        elementosJogo.tierHint.textContent = `Nível ${nivel}`;
        elementosJogo.tierHint.className = `tier-hint tier-${nivel}-hint`;
        elementosJogo.tierHint.classList.remove("hidden");
        
        destacarPosicoesDoNivel(nivel);
    } else {
        elementosJogo.tierHint.classList.add("hidden");
    }
}

// --- DESTAQUE DE SLOTS POR TIER ---
function destacarPosicoesDoNivel(nivel) {
    const elementosPosicoes = elementosJogo.piramideGrid.querySelectorAll(".piramide-slot");
    const posicoesValidas = obterPosicoesDoNivel(nivel);
    
    elementosPosicoes.forEach(elementoPosicao => {
        elementoPosicao.classList.remove("highlighted");
        const indicePosicao = parseInt(elementoPosicao.dataset.indicePosicao);
        if (posicoesValidas.includes(indicePosicao) && !estado.piramide[indicePosicao]) {
            elementoPosicao.classList.add("highlighted");
        }
    });
}

// --- COLOCAR JOGADOR NO SLOT ---
function colocarJogador(indicePosicao) {
    if (estado.piramide[indicePosicao]) {
        return;
    }

    if (estado.indiceJogadorAtual >= estado.jogadoresEmbaralhados.length) {
        return;
    }

    const jogador = estado.jogadoresEmbaralhados[estado.indiceJogadorAtual];

    if (estado.modo === "facil") {
        const nivelCorreto = obterNivelDoJogador(jogador);
        const posicoesValidas = obterPosicoesDoNivel(nivelCorreto);
        if (!posicoesValidas.includes(indicePosicao)) {
            return; 
        }
    }

    estado.piramide[indicePosicao] = jogador;
    estado.indiceJogadorAtual++;

    renderizarPiramide();

    if (estado.indiceJogadorAtual >= estado.jogadoresEmbaralhados.length) {
        setTimeout(finalizarJogo, 400);  
    } else {
        mostrarJogadorAtual();
    }
}

// --- USAR AJUDA ---
function usarAjuda() {
    if (estado.ajudaUsada) {
        return;
    }
    estado.ajudaUsada = true;
    elementosJogo.btnAjuda.disabled = true;
    elementosJogo.btnAjuda.classList.add("used");

    const posicoesPreenchidas = elementosJogo.piramideGrid.querySelectorAll(".piramide-slot.filled");
    posicoesPreenchidas.forEach(elementoPosicao => {
        const indicePosicao = parseInt(elementoPosicao.dataset.indicePosicao);
        const jogador = estado.piramide[indicePosicao];
        if (jogador) {
            const correto = estado.jogadoresOrdenados[indicePosicao];
            if (jogador.nome === correto.nome) {
                elementoPosicao.classList.add("correct-reveal");
            } else {
                elementoPosicao.classList.add("wrong-reveal");
            }
        }
    });

    setTimeout(() => {
        const posicoesPiramide = elementosJogo.piramideGrid.querySelectorAll(".piramide-slot");
        posicoesPiramide.forEach(elementoPosicao => {
            elementoPosicao.classList.remove("correct-reveal", "wrong-reveal");
        });
    }, 3000);
}

// --- FINALIZAÇÃO DO JOGO ---
function finalizarJogo() {
    const acertos = calcularAcertos();

    elementosJogo.gameArea.classList.add("hidden");
    elementosJogo.gameInfo.classList.add("hidden");
    elementosJogo.finalResult.classList.remove("hidden");

    elementosJogo.finalScore.textContent = acertos;

    let conteudoResultado = '<div class="final-piramide">';
    const niveis = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9]];

    niveis.forEach((posicoes, indiceNivel) => {
        conteudoResultado += `<div class="final-row tier-${indiceNivel + 1}">`;
        posicoes.forEach(indicePosicao => {
            const correto = estado.jogadoresOrdenados[indicePosicao];
            const colocado = estado.piramide[indicePosicao];
            const acertou = colocado && colocado.nome === correto.nome;

            conteudoResultado += `<div class="final-slot ${acertou ? "acertou" : "errou"}">
                <span class="final-slot-rank">
                    ${indicePosicao + 1}º
                </span>
                <span class="final-slot-nome">
                    ${correto.nome}
                </span>
                <span class="final-slot-valor">
                    ${correto.valor}
                </span>
            </div>`;
        });
        conteudoResultado += "</div>";
    });
    conteudoResultado += "</div>";

    elementosJogo.finalCorrect.innerHTML = conteudoResultado;

    if (acertos === 10) {
        elementosJogo.finalMessage.textContent = "Perfeito! Você é um gênio do futebol!";
    } else if (acertos >= 7) {
        elementosJogo.finalMessage.textContent = "Ótimo! Conhecimento impressionante!";
    } else if (acertos >= 4) {
        elementosJogo.finalMessage.textContent = "Bom, mas pode melhorar!";
    } else {
        elementosJogo.finalMessage.textContent = "Precisa estudar mais estatísticas!";
    }

    if (acertos >= 5) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    if (window.FG11Stats) {
        const venceu = acertos >= 5;
        const rotulos = Array.from({ length: 11 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-piramide", {
            venceu,
            bucket: acertos,
            tamanho: 11
        });
        window.FG11Stats.mostrarModal("football-piramide", {
            venceu,
            titulo: acertos === 10 ? "Pirâmide perfeita!" : "Fim de jogo!",
            resposta: `Você acertou ${acertos} de 10 posições`,
            tamanho: 11,
            rotulos,
            tituloGrafico: "Acertos por partida",
            bucketAtual: acertos,
            onReiniciar: () => iniciarJogo(estado.modo),
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- INÍCIO DO JOGO ---
function iniciarJogo(modo) {
    estado.modo = modo;
    estado.piramide = [null, null, null, null, null, null, null, null, null, null];
    estado.indiceJogadorAtual = 0;
    estado.ajudaUsada = false;
    estado.acertos = 0;

    elementosJogo.btnAjuda.disabled = false;
    elementosJogo.btnAjuda.classList.remove("used");

    sortearCategoria();
    elementosJogo.categoria.textContent = estado.categoriaAtual.titulo;

    elementosJogo.modeSelect.classList.add("hidden");
    elementosJogo.finalResult.classList.add("hidden");
    elementosJogo.gameArea.classList.remove("hidden");
    elementosJogo.gameInfo.classList.remove("hidden");

    renderizarPiramide();
    mostrarJogadorAtual();
}

// --- EVENTOS DOS BOTÕES ---
document.getElementById("btnFacil").addEventListener("click", () => iniciarJogo("facil"));
document.getElementById("btnNormal").addEventListener("click", () => iniciarJogo("normal"));
elementosJogo.btnAjuda.addEventListener("click", usarAjuda);

document.getElementById("btnRetry").addEventListener("click", () => {
    elementosJogo.finalResult.classList.add("hidden");
    elementosJogo.modeSelect.classList.remove("hidden");
});

document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../../../index.html";
});

// --- TUTORIAL ---
const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
const chaveJogo = sobreposicaoTutorial?.dataset.game;

if (chaveJogo && localStorage.getItem(`tutorial_${chaveJogo}`) === "skip") {
    sobreposicaoTutorial.classList.add("hidden");
}

document.getElementById("tutorialStartBtn")?.addEventListener("click", () => {
    sobreposicaoTutorial.classList.add("hidden");
});

document.getElementById("tutorialSkipBtn")?.addEventListener("click", () => {
    localStorage.setItem(`tutorial_${chaveJogo}`, "skip");
    sobreposicaoTutorial.classList.add("hidden");
});

document.getElementById("tutorialHelpBtn")?.addEventListener("click", () => {
    sobreposicaoTutorial.classList.remove("hidden");
});

async function inicializarJogoPiramide() {
    await carregarDados();
}

inicializarJogoPiramide();