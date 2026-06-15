import { estado, resetConvocados, totalConvocados, LIMITES } from "./core.js";
import { carregarDados, obterSelecoes, obterConvocadosOficiais, obterBandeira } from "./data.js";
import { renderizarGrupos, atualizarContador, abrirModal, fecharModal, renderizarResultados } from "./ui.js";

const modeSection = document.getElementById("modeSelection");
const teamSection = document.getElementById("teamSelection");
const builderSection = document.getElementById("squadBuilder");
const resultsSection = document.getElementById("results");

function mostrarSecao(secao) {
    [modeSection, teamSection, builderSection, resultsSection].forEach(s => s.classList.add("hidden"));
    secao.classList.remove("hidden");
}

// --- SELEÇÃO DE MODO ---
document.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
        estado.modo = card.dataset.mode;
        document.getElementById("modeLabel").textContent =
            estado.modo === "copa2026" ? "Copa do Mundo 2026" : "Melhor de Todos os Tempos";
        renderizarTimes();
        mostrarSecao(teamSection);
    });
});

// --- RENDERIZAR TIMES ---
function renderizarTimes() {
    const grid = document.getElementById("teamsGrid");
    grid.innerHTML = "";
    const selecoes = obterSelecoes();
    selecoes.forEach(s => {
        const btn = document.createElement("button");
        btn.className = "team-card";
        btn.innerHTML = `<span class="flag">${s.bandeira}</span><span class="team-name">${s.nome}</span>`;
        btn.addEventListener("click", () => iniciarConvocacao(s.key));
        grid.appendChild(btn);
    });
}

// --- INICIAR CONVOCAÇÃO ---
function iniciarConvocacao(key) {
    estado.selecao = key;
    resetConvocados();

    document.getElementById("selectedFlag").textContent = obterBandeira();
    document.getElementById("selectedTeamName").textContent =
        key.charAt(0).toUpperCase() + key.slice(1);

    renderizarGrupos(abrirSelecao);
    atualizarContador();
    mostrarSecao(builderSection);
}

// --- ABRIR SELEÇÃO DE JOGADOR PARA UMA POSIÇÃO ---
function abrirSelecao(pos) {
    if (estado.convocados[pos].length >= LIMITES[pos]) {
        return;
    }
    abrirModal(pos, adicionarJogador);
}

// --- ADICIONAR JOGADOR ---
function adicionarJogador(pos, nome) {
    if (estado.convocados[pos].length >= LIMITES[pos]) {
        return;
    }

    if (Object.values(estado.convocados).flat().includes(nome)) {
        return;
    }

    estado.convocados[pos].push(nome);
    renderizarGrupos(abrirSelecao);
    atualizarContador();
}

// --- REMOVER JOGADOR (delegação de evento) ---
document.getElementById("positionGroups").addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".slot-remove");
    if (!removeBtn) {
        return;
    }

    const { pos, index } = removeBtn.dataset;
    estado.convocados[pos].splice(Number(index), 1);
    renderizarGrupos(abrirSelecao);
    atualizarContador();
});

// --- FECHAR MODAL ---
document.getElementById("modalClose").addEventListener("click", fecharModal);
document.getElementById("playerModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        fecharModal();
    }
});

// --- CONFIRMAR CONVOCAÇÃO ---
document.getElementById("btnConfirm").addEventListener("click", () => {
    if (totalConvocados() < 26) {
        return;
    }
    const oficiais = obterConvocadosOficiais();
    renderizarResultados(estado.convocados, oficiais);
    mostrarSecao(resultsSection);
});

// --- BOTÕES DE NAVEGAÇÃO ---
document.getElementById("btnBackMode").addEventListener("click", () => mostrarSecao(modeSection));
document.getElementById("btnBackTeam").addEventListener("click", () => mostrarSecao(teamSection));
document.getElementById("btnRetry").addEventListener("click", () => {
    resetConvocados();
    mostrarSecao(teamSection);
});
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../index.html";
});

async function init() {
    await carregarDados();
}

init();
