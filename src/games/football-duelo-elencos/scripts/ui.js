import { estado } from "./core.js";
import { obterCoordenadasPosicao, obterRotuloPosicao } from "./data.js";

const elementosDuelo = {
    posicaoAtual: () => document.getElementById("posicaoAtual"),
    timeANome:    () => document.getElementById("timeANome"),
    temporadaTimeA:    () => document.getElementById("timeATemp"),
    timeAEscudo:  () => document.getElementById("timeAEscudo"),
    timeBNome:    () => document.getElementById("timeBNome"),
    temporadaTimeB:    () => document.getElementById("timeBTemp"),
    timeBEscudo:  () => document.getElementById("timeBEscudo"),
    escolhaArea:  () => document.getElementById("escolhaArea"),
    btnEscolherJogadorTimeA:        () => document.getElementById("cardA"),
    btnEscolherJogadorTimeB:        () => document.getElementById("cardB"),
    nomeA:        () => document.getElementById("nomeA"),
    nomeB:        () => document.getElementById("nomeB"),
    rotuloPosicaoTimeA:    () => document.getElementById("posLabelA"),
    rotuloPosicaoTimeB:    () => document.getElementById("posLabelB"),
    escudoA:      () => document.getElementById("escudoA"),
    escudoB:      () => document.getElementById("escudoB"),
    camadaJogadores: () => document.getElementById("playersLayer"),
    recipienteCampo: () => document.querySelector(".field-wrapper"),
    cabecalhoDuelo:  () => document.getElementById("dueloHeader"),
    resultadoFinal:  () => document.getElementById("finalResult"),
    detalhesResultadoFinal: () => document.getElementById("finalDetails")
};

// --- DEFINE O ESCUDO EM UMA IMAGEM ---
function definirEscudo(imagemEscudo, enderecoImagem, nomeTime) {
    if (!imagemEscudo) {
        return;
    }

    if (enderecoImagem) {
        imagemEscudo.src = enderecoImagem;
        imagemEscudo.alt = nomeTime || "";
        imagemEscudo.style.display = "";
        imagemEscudo.onerror = () => {
            imagemEscudo.style.display = "none";
        };
    } else {
        imagemEscudo.removeAttribute("src");
        imagemEscudo.style.display = "none";
    }
}

// --- CONFIGURAR DUELO ---
export function configurarDuelo(duelo) {
    elementosDuelo.timeANome().textContent = duelo.timeA.nome;
    elementosDuelo.temporadaTimeA().textContent = duelo.timeA.temporada;
    elementosDuelo.timeBNome().textContent = duelo.timeB.nome;
    elementosDuelo.temporadaTimeB().textContent = duelo.timeB.temporada;
    definirEscudo(elementosDuelo.timeAEscudo(), duelo.timeA.escudo, duelo.timeA.nome);
    definirEscudo(elementosDuelo.timeBEscudo(), duelo.timeB.escudo, duelo.timeB.nome);
    elementosDuelo.cabecalhoDuelo().classList.remove("hidden");
    elementosDuelo.recipienteCampo().classList.remove("hidden");
    elementosDuelo.escolhaArea().classList.remove("hidden");
    elementosDuelo.resultadoFinal().classList.add("hidden");
    renderizarCampoVazio();
}

// --- RENDERIZAR CAMPO VAZIO COM SLOTS ---
function renderizarCampoVazio() {
    const camadaJogadores = elementosDuelo.camadaJogadores();
    camadaJogadores.innerHTML = "";

    estado.dueloAtual.posicoes.forEach((posicao, indicePosicao) => {
        const coordenadas = obterCoordenadasPosicao(posicao.posicao);
        const rotuloPosicao = obterRotuloPosicao(posicao.posicao);

        const espacoJogador = document.createElement("div");
        espacoJogador.className = "player-slot";
        espacoJogador.id = `posicao-jogador-${indicePosicao}`;
        espacoJogador.style.top = `${coordenadas.top}%`;
        espacoJogador.style.left = `${coordenadas.left}%`;

        espacoJogador.innerHTML = `
            <div class="player-circle">${rotuloPosicao}</div>
            <span class="player-label">?</span>
        `;

        camadaJogadores.appendChild(espacoJogador);
    });
}

// --- MOSTRAR POSIÇÃO PARA ESCOLHA ---
export function mostrarEscolha(posicao) {
    const rotuloPosicao = obterRotuloPosicao(posicao.posicao);
    elementosDuelo.posicaoAtual().textContent = `${estado.indicePosicao + 1}/11 — ${rotuloPosicao}`;
    elementosDuelo.nomeA().textContent = posicao.jogadorA;
    elementosDuelo.nomeB().textContent = posicao.jogadorB;
    elementosDuelo.rotuloPosicaoTimeA().textContent = `${estado.dueloAtual.timeA.nome} · ${estado.dueloAtual.timeA.temporada}`;
    elementosDuelo.rotuloPosicaoTimeB().textContent = `${estado.dueloAtual.timeB.nome} · ${estado.dueloAtual.timeB.temporada}`;
    definirEscudo(elementosDuelo.escudoA(), estado.dueloAtual.timeA.escudo, estado.dueloAtual.timeA.nome);
    definirEscudo(elementosDuelo.escudoB(), estado.dueloAtual.timeB.escudo, estado.dueloAtual.timeB.nome);

    const btnEscolherJogadorTimeA = elementosDuelo.btnEscolherJogadorTimeA();
    const btnEscolherJogadorTimeB = elementosDuelo.btnEscolherJogadorTimeB();
    btnEscolherJogadorTimeA.classList.remove("chosen", "disabled");
    btnEscolherJogadorTimeB.classList.remove("chosen", "disabled");
    btnEscolherJogadorTimeA.disabled = false;
    btnEscolherJogadorTimeB.disabled = false;
}

// --- REGISTRAR ESCOLHA ---
export function registrarEscolha(escolha) {
    const btnEscolherJogadorTimeA = elementosDuelo.btnEscolherJogadorTimeA();
    const btnEscolherJogadorTimeB = elementosDuelo.btnEscolherJogadorTimeB();
    btnEscolherJogadorTimeA.disabled = true;
    btnEscolherJogadorTimeB.disabled = true;

    if (escolha === "A") {
        btnEscolherJogadorTimeA.classList.add("chosen");
        btnEscolherJogadorTimeB.classList.add("disabled");
    } else {
        btnEscolherJogadorTimeB.classList.add("chosen");
        btnEscolherJogadorTimeA.classList.add("disabled");
    }
}

// --- COLOCAR JOGADOR ESCOLHIDO NO CAMPO ---
export function colocarJogadorNoCampo(indicePosicao, nome, escolha) {
    const espacoJogador = document.getElementById(`posicao-jogador-${indicePosicao}`);
    if (!espacoJogador) {
        return;
    }

    const timeClasse = escolha === "A" ? "time-a" : "time-b";
    espacoJogador.classList.add("revealed", timeClasse);
    espacoJogador.querySelector(".player-circle").innerHTML = "<i class=\"fas fa-check\"></i>";
    espacoJogador.querySelector(".player-label").textContent = nome;
}

// --- MOSTRAR ESCALAÇÃO FINAL ---
export function mostrarResultadoFinal() {
    elementosDuelo.escolhaArea().classList.add("hidden");
    elementosDuelo.cabecalhoDuelo().classList.add("hidden");
    elementosDuelo.resultadoFinal().classList.remove("hidden");

    let html = "<div class=\"final-lineup\">";
    estado.escolhas.forEach(escolha => {
        const timeClasse = escolha.escolha === "A" ? "lineup-a" : "lineup-b";
        const marcacaoEscudo = escolha.escudo
            ? `<img     
                    class="lineup-escudo" 
                    src="${escolha.escudo}"
                    alt="${escolha.time}"
                    onerror="this.style.display='none'"
                >`
            : "";
        html += `
            <div class="lineup-item ${timeClasse}">
                <span class="lineup-pos">${obterRotuloPosicao(escolha.posicao)}</span>
                <span class="lineup-info">
                    <span class="lineup-name">${escolha.jogador}</span>
                    <span class="lineup-meta">
                        ${marcacaoEscudo}
                        <span class="lineup-team">${escolha.time}</span>
                        <span class="lineup-year">${escolha.temporada}</span>
                    </span>
                </span>
            </div>`;
    });
    html += "</div>";

    elementosDuelo.detalhesResultadoFinal().innerHTML = html;
}
