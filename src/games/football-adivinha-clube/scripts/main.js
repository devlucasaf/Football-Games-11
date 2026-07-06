import { estado } from "./core.js";
import { carregarDados, sortear, normalizar, obterDicas } from "./data.js";

const els = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    pontos:         document.getElementById("pontos"),
    dicasGrid:      document.getElementById("dicasGrid"),
    guessInput:     document.getElementById("guessInput"),
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

// --- RENDERIZA AS SUGESTÕES DE CLUBES ---
function renderizarSugestoes() {
    const termo = normalizar(els.guessInput.value.trim());
    els.suggestions.innerHTML = "";
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const encontrados = estado.times
        .filter(time => normalizar(time.nome).includes(termo))
        .slice(0, 8);

    if (encontrados.length === 0) {
        esconderSugestoes();
        return;
    }

    encontrados.forEach((time) => {
        const item = document.createElement("li");
        item.className = "suggestion-item";

        const escudo = time.escudo
            ? `
            <img 
                class="suggestion-escudo" 
                src="${time.escudo}" 
                alt="" loading="lazy" 
                onerror="this.outerHTML='
                <i class=\\'fas fa-shield-halved\\'></i>'"
            >`
            : `<i class="fas fa-shield-halved"></i>`;

        item.innerHTML = `${escudo}<span>${time.nome}</span>`;
        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            selecionarSugestao(time.nome);
        });
        els.suggestions.appendChild(item);
    });

    els.suggestions.classList.remove("hidden");
}

// --- SELECIONA UMA SUGESTÃO E ENVIA O PALPITE ---
function selecionarSugestao(nome) {
    els.guessInput.value = nome;
    esconderSugestoes();
    verificarPalpite();
}

// --- ESCONDE A LISTA DE SUGESTÕES ---
function esconderSugestoes() {
    els.suggestions.classList.add("hidden");
    els.suggestions.innerHTML = "";
    sugestaoAtiva = -1;
}

// --- ATUALIZA O ITEM DESTACADO NA NAVEGAÇÃO POR TECLADO ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, i) => item.classList.toggle("active", i === sugestaoAtiva));
    if (itens[sugestaoAtiva]) {
        itens[sugestaoAtiva].scrollIntoView({ block: "nearest" });
    }
}

// --- MOSTRA A RODADA ATUAL ---
function mostrarRodada() {
    const time = estado.sorteados[estado.rodadaAtual];
    dicasAtuais = obterDicas(time);
    estado.dicasReveladas = 1;

    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.guessInput.value = "";
    els.guessFeedback.classList.add("hidden");
    esconderSugestoes();
    els.gameArea.classList.remove("hidden");
    els.roundResult.classList.add("hidden");
    renderizarDicas();
    els.guessInput.focus();
}

// --- RENDERIZA AS DICAS NA TELA ---
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

// --- REVELA UMA DICA ESPECÍFICA ---
function revelarDica(index) {
    if (index < estado.dicasReveladas) {
        return;
    }
    estado.dicasReveladas = index + 1;
    renderizarDicas();
}

// --- CALCULA OS PONTOS BASEADOS NAS DICAS REVELADAS ---
function calcularPontos() {
    const base = 6 - estado.dicasReveladas;
    return Math.max(base, 1);
}

// --- VERIFICA O PALPITE ---
function verificarPalpite() {
    const palpite = els.guessInput.value.trim();
    if (!palpite) {
        return;
    }

    const time = estado.sorteados[estado.rodadaAtual];
    const acertou = normalizar(palpite) === normalizar(time.nome);

    if (acertou) {
        const pts = calcularPontos();
        estado.pontos += pts;
        els.pontos.textContent = estado.pontos;
        estado.historico.push({
            time: time.nome,
            acertou: true,
            dicas: estado.dicasReveladas,
            pontos: pts
        });
        mostrarResultado(true, time);
    } else {
        els.guessFeedback.textContent = `"${palpite}" não é o time. Tente novamente!`;
        els.guessFeedback.className = "guess-feedback wrong";
        els.guessFeedback.classList.remove("hidden");
        els.guessInput.value = "";
        esconderSugestoes();
        els.guessInput.focus();

        if (estado.dicasReveladas < estado.maxDicas) {
            estado.dicasReveladas++;
            renderizarDicas();
        }
    }
}

// --- PULA A RODADA ATUAL ---
function pular() {
    const time = estado.sorteados[estado.rodadaAtual];
    estado.historico.push({
        time: time.nome,
        acertou: false,
        dicas: estado.dicasReveladas,
        pontos: 0
    });
    mostrarResultado(false, time);
}

// --- MOSTRA O RESULTADO DA RODADA ---
function mostrarResultado(acertou, time) {
    els.gameArea.classList.add("hidden");
    els.roundResult.classList.remove("hidden");

    if (acertou) {
        els.roundIcon.className = "round-icon correct";
        els.roundIcon.innerHTML = "<i class=\"fas fa-check-circle\"></i>";
        els.roundText.textContent = `Correto! +${calcularPontos()} pontos`;
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }

        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-adivinha-clube", {
                venceu: true,
                bucket: estado.dicasReveladas - 1,
                tamanho: estado.maxDicas
            });
        }
    } else {
        els.roundIcon.className = "round-icon wrong";
        els.roundIcon.innerHTML = "<i class=\"fas fa-times-circle\"></i>";
        els.roundText.textContent = "Não acertou desta vez!";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
        
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-adivinha-clube", {
                venceu: false,
                tamanho: estado.maxDicas
            });
        }
    }

    els.roundAnswer.textContent = `Resposta: ${time.nome}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").innerHTML = "<i class=\"fas fa-flag-checkered\"></i> Ver Resultado";
    }
}

// --- AVANÇA PARA A PRÓXIMA RODADA OU MOSTRA O RESULTADO FINAL ---
function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- MOSTRA O RESULTADO FINAL DO JOGO ---
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
        msg = "Especialista em clubes!";
    } else if (pct >= 50) {
        msg = "Bom conhecimento sobre times!";
    } else if (pct >= 30) {
        msg = "Precisa torcer mais!";
    } else {
        msg = "Tente novamente!";
    }

    els.finalDetails.innerHTML = `<p>${msg}</p><p>Acertos: ${acertos}/${estado.totalRodadas}</p>`;

    if (window.FG11Stats) {
        const rotulos = Array.from({ length: estado.maxDicas }, (_, i) => String(i + 1));
        window.FG11Stats.mostrarModal("football-adivinha-clube", {
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
    els.pontos.textContent = "0";
    els.finalResult.classList.add("hidden");
    els.gameInfo.classList.remove("hidden");
    sortear();
    mostrarRodada();
}

// --- INICIALIZA O JOGO ---
async function init() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnSkip").addEventListener("click", pular);
    document.getElementById("btnNext").addEventListener("click", proxima);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.getElementById("guessInput").addEventListener("keydown", (e) => {
        const itens = [...els.suggestions.querySelectorAll(".suggestion-item")];

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

    els.guessInput.addEventListener("input", renderizarSugestoes);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-autocomplete")) {
            esconderSugestoes();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-acerta-time";

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
