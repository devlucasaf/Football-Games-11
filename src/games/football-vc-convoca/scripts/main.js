import { estado, reiniciarConvocados, obterTotalConvocados, LIMITES } from "./core.js";
import { carregarDados, obterSelecoes, obterConvocadosOficiais, obterBandeira } from "./data.js";
import { renderizarGruposPosicoes, atualizarContadorConvocados, abrirModalJogadores, fecharModalJogadores, renderizarResultadosConvocacao } from "./ui.js";

const secaoSelecaoModo = document.getElementById("modeSelection");
const secaoSelecaoTime = document.getElementById("teamSelection");
const secaoMontagemConvocacao = document.getElementById("squadBuilder");
const secaoResultados = document.getElementById("results");

function mostrarSecao(secao) {
    [secaoSelecaoModo, secaoSelecaoTime, secaoMontagemConvocacao, secaoResultados].forEach(secaoJogo => secaoJogo.classList.add("hidden"));
    secao.classList.remove("hidden");
}

// --- SELEÇÃO DE MODO ---
document.querySelectorAll(".mode-card").forEach(cartaoModo => {
    cartaoModo.addEventListener("click", () => {
        estado.modo = cartaoModo.dataset.mode;
        document.getElementById("modeLabel").textContent =
            estado.modo === "copa2026" ? "Copa do Mundo 2026" : "Melhor de Todos os Tempos";
        renderizarTimes();
        mostrarSecao(secaoSelecaoTime);
    });
});

// --- RENDERIZAR TIMES ---
function renderizarTimes() {
    const gradeSelecoes = document.getElementById("teamsGrid");
    gradeSelecoes.innerHTML = "";
    const selecoes = obterSelecoes();
    selecoes.forEach(selecao => {
        const btnSelecionarSelecao = document.createElement("button");
        btnSelecionarSelecao.className = "team-card";
        btnSelecionarSelecao.innerHTML = `<img class="flag" src="${selecao.bandeira}" alt="${selecao.nome}" loading="lazy"><span class="team-name">${selecao.nome}</span>`;
        btnSelecionarSelecao.addEventListener("click", () => iniciarConvocacao(selecao.chaveSelecao));
        gradeSelecoes.appendChild(btnSelecionarSelecao);
    });
}

// --- INICIAR CONVOCAÇÃO ---
function iniciarConvocacao(chaveSelecao) {
    estado.selecao = chaveSelecao;
    reiniciarConvocados();

    document.getElementById("selectedFlag").innerHTML = `<img src="${obterBandeira()}" alt="">`;
    document.getElementById("selectedTeamName").textContent =
        chaveSelecao.charAt(0).toUpperCase() + chaveSelecao.slice(1);

    renderizarGruposPosicoes(abrirSelecaoJogador);
    atualizarContadorConvocados();
    mostrarSecao(secaoMontagemConvocacao);
}

// --- ABRIR SELEÇÃO DE JOGADOR PARA UMA POSIÇÃO ---
function abrirSelecaoJogador(posicao) {
    if (estado.convocados[posicao].length >= LIMITES[posicao]) {
        return;
    }
    abrirModalJogadores(posicao, adicionarJogador);
}

// --- ADICIONAR JOGADOR ---
function adicionarJogador(posicao, nome) {
    if (estado.convocados[posicao].length >= LIMITES[posicao]) {
        return;
    }

    if (Object.values(estado.convocados).flat().includes(nome)) {
        return;
    }

    estado.convocados[posicao].push(nome);
    renderizarGruposPosicoes(abrirSelecaoJogador);
    atualizarContadorConvocados();
}

// --- REMOVER JOGADOR ---
document.getElementById("positionGroups").addEventListener("click", (eventoClique) => {
    const btnRemoverConvocado = eventoClique.target.closest(".slot-remove");
    if (!btnRemoverConvocado) {
        return;
    }

    const { posicao, indiceJogador } = btnRemoverConvocado.dataset;
    estado.convocados[posicao].splice(Number(indiceJogador), 1);
    renderizarGruposPosicoes(abrirSelecaoJogador);
    atualizarContadorConvocados();
});

// --- FECHAR MODAL ---
document.getElementById("modalClose").addEventListener("click", fecharModalJogadores);
document.getElementById("playerModal").addEventListener("click", (eventoClique) => {
    if (eventoClique.target === eventoClique.currentTarget) {
        fecharModalJogadores();
    }
});

// --- CONFIRMAR CONVOCAÇÃO ---
document.getElementById("btnConfirm").addEventListener("click", () => {
    if (obterTotalConvocados() < 26) {
        return;
    }
    const oficiais = obterConvocadosOficiais();
    renderizarResultadosConvocacao(estado.convocados, oficiais);
    mostrarSecao(secaoResultados);
});

// --- BOTÕES DE NAVEGAÇÃO ---
document.getElementById("btnBackMode").addEventListener("click", () => mostrarSecao(secaoSelecaoModo));
document.getElementById("btnBackTeam").addEventListener("click", () => mostrarSecao(secaoSelecaoTime));
document.getElementById("btnRetry").addEventListener("click", () => {
    reiniciarConvocados();
    mostrarSecao(secaoSelecaoTime);
});
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../../../index.html";
});

async function inicializarJogoConvocacao() {
    await carregarDados();
}

inicializarJogoConvocacao();
