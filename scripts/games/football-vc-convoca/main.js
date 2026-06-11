import { estado, resetConvocados, totalConvocados } from './core.js';
import { carregarDados, obterSelecoes, obterConvocadosOficiais, obterBandeira } from './data.js';
import { atualizarUI, renderizarListas, configurarAutocomplete, renderizarResultados } from './ui.js';

// --- REFS DE SEÇÕES ---
const modeSection    = document.getElementById('modeSelection');
const teamSection    = document.getElementById('teamSelection');
const builderSection = document.getElementById('squadBuilder');
const resultsSection = document.getElementById('results');

function mostrarSecao(secao) {
    [modeSection, teamSection, builderSection, resultsSection].forEach(s => s.classList.add('hidden'));
    secao.classList.remove('hidden');
}

// --- SELEÇÃO DE MODO ---
document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
        estado.modo = card.dataset.mode;
        document.getElementById('modeLabel').textContent =
            estado.modo === 'copa2026' ? 'Copa do Mundo 2026' : 'Melhor de Todos os Tempos';
        renderizarTimes();
        mostrarSecao(teamSection);
    });
});

// --- RENDERIZAR TIMES ---
function renderizarTimes() {
    const grid = document.getElementById('teamsGrid');
    grid.innerHTML = '';
    const selecoes = obterSelecoes();
    selecoes.forEach(s => {
        const btn = document.createElement('button');

        btn.className = 'team-card';
        btn.innerHTML = `<span class="flag">${s.bandeira}</span><span class="team-name">${s.nome}</span>`;
        btn.addEventListener('click', () => iniciarConvocacao(s.key));
        
        grid.appendChild(btn);
    });
}

// --- INICIAR CONVOCAÇÃO ---
function iniciarConvocacao(key) {
    estado.selecao = key;
    resetConvocados();

    document.getElementById('selectedFlag').textContent = obterBandeira();
    document.getElementById('selectedTeamName').textContent =
        key.charAt(0).toUpperCase() + key.slice(1);

    estado.posicaoAtiva = 'GOL';
    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pos === 'GOL');
        btn.classList.remove('full');
    });

    renderizarListas();
    atualizarUI();
    mostrarSecao(builderSection);
    document.getElementById('playerInput').value = '';
    document.getElementById('playerInput').focus();
}

// --- SELETOR DE POSIÇÃO ---
document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('full')) {
            return;
        }
        estado.posicaoAtiva = btn.dataset.pos;
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.toggle('active', b === btn));
    });
});

// --- ADICIONAR JOGADOR ---
function adicionarJogador(nome) {
    const pos = estado.posicaoAtiva;
    if (estado.convocados[pos].length >= estado.limites[pos]) {
        return;
    }
    
    if (Object.values(estado.convocados).flat().includes(nome)) {
        return;
    }

    estado.convocados[pos].push(nome);
    renderizarListas();
    atualizarUI();

    if (estado.convocados[pos].length >= estado.limites[pos]) {
        const posicoes = ['GOL', 'DEF', 'MEI', 'ATA'];
        const proxima = posicoes.find(p => estado.convocados[p].length < estado.limites[p]);
        if (proxima) {
            estado.posicaoAtiva = proxima;
            document.querySelectorAll('.pos-btn').forEach(b =>
                b.classList.toggle('active', b.dataset.pos === proxima)
            );
        }
    }
}

// --- REMOVER JOGADOR ---
document.querySelector('.squad-lists').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove');
    if (!btn) {
        return;
    }
    const { pos, nome } = btn.dataset;
    estado.convocados[pos] = estado.convocados[pos].filter(n => n !== nome);
    renderizarListas();
    atualizarUI();
});

// --- CONFIRMAR CONVOCAÇÃO ---
document.getElementById('btnConfirm').addEventListener('click', () => {
    if (totalConvocados() < 26) {
        return;
    }
    const oficiais = obterConvocadosOficiais();
    renderizarResultados(estado.convocados, oficiais);
    mostrarSecao(resultsSection);
});

// --- BOTÕES DE NAVEGAÇÃO ---
document.getElementById('btnBackMode').addEventListener('click', () => mostrarSecao(modeSection));
document.getElementById('btnBackTeam').addEventListener('click', () => mostrarSecao(teamSection));
document.getElementById('btnRetry').addEventListener('click', () => {
    resetConvocados();
    mostrarSecao(teamSection);
});

document.getElementById('btnHome').addEventListener('click', () => {
    window.location.href = '../index.html';
});

configurarAutocomplete(adicionarJogador);

async function init() {
    await carregarDados();
}

init();
