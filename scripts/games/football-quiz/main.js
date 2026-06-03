import { estado } from './core.js';
import { carregarDados, selecionarTema, sortearPerguntas, perguntaAtual } from './data.js';
import {
    renderizarTemas,
    mostrarQuiz,
    atualizarInfo,
    exibirPergunta,
    mostrarResposta,
    mostrarFinal,
    mostrarSelecaoTema,
    resetarUI
} from './ui.js';

// --- MOSTRAR PERGUNTA ---
function mostrarPergunta() {
    const p = perguntaAtual();
    if (!p) {
        return;
    }

    estado.respondida = false;
    atualizarInfo();
    exibirPergunta(p, responder);
}

// --- RESPONDER PERGUNTA ---
function responder(indice) {
    if (estado.respondida) {
        return;
    }
    estado.respondida = true;

    const p = perguntaAtual();
    if (indice === p.resposta) {
        estado.acertos++;
    }

    atualizarInfo();
    mostrarResposta(indice, p.resposta);
}

// --- PRÓXIMA PERGUNTA ---
function proxima() {
    estado.perguntaAtual++;
    if (estado.perguntaAtual >= estado.totalPerguntas) {
        mostrarFinal();
    } else {
        mostrarPergunta();
    }
}

// --- INICIAR QUIZ ---
function iniciarQuiz(temaId) {
    selecionarTema(temaId);
    estado.perguntaAtual = 0;
    estado.acertos = 0;
    estado.respondida = false;
    resetarUI();
    sortearPerguntas();
    mostrarQuiz();
    mostrarPergunta();
}

// --- VOLTAR À SELEÇÃO DE TEMAS ---
function voltarTemas() {
    mostrarSelecaoTema();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function init() {
    await carregarDados();

    renderizarTemas(iniciarQuiz);

    document.getElementById('btnProxima').addEventListener('click', proxima);
    document.getElementById('btnRetry').addEventListener('click', () => {
        iniciarQuiz(estado.temaAtual.id);
    });
    document.getElementById('btnOutroTema').addEventListener('click', voltarTemas);
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipKey = 'tutorial_skip_football-quiz';

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add('hidden');
    } else {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            localStorage.setItem(skipKey, 'true');
            tutorialOverlay.classList.add('hidden');
        });
    }
}

init();
