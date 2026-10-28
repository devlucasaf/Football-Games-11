import { estado } from "./core.js";
import { carregarDados, selecionarTema, sortearPerguntas, obterPerguntaAtual } from "./data.js";
import {
    renderizarTemas,
    mostrarQuiz,
    atualizarInformacoesPerguntas,
    exibirPergunta,
    mostrarResposta,
    mostrarFinal,
    mostrarSelecaoTema,
    reiniciarInterfacePerguntas
} from "./ui.js";

// --- MOSTRAR PERGUNTA ---
function mostrarPergunta() {
    const pergunta = obterPerguntaAtual();
    if (!pergunta) {
        return;
    }

    estado.respondida = false;
    atualizarInformacoesPerguntas();
    exibirPergunta(pergunta, responderPergunta);
}

// --- RESPONDER PERGUNTA ---
function responderPergunta(indiceResposta) {
    if (estado.respondida) {
        return;
    }
    estado.respondida = true;

    const pergunta = obterPerguntaAtual();
    if (indiceResposta === pergunta.resposta) {
        estado.acertos++;
    }

    atualizarInformacoesPerguntas();
    mostrarResposta(indiceResposta, pergunta.resposta);
}

// --- PRÓXIMA PERGUNTA ---
function avancarPergunta() {
    estado.perguntaAtual++;
    if (estado.perguntaAtual >= estado.totalPerguntas) {
        mostrarFinal();
    } else {
        mostrarPergunta();
    }
}

// --- INICIAR QUIZ ---
function iniciarQuestionario(identificadorTema) {
    selecionarTema(identificadorTema);
    estado.perguntaAtual = 0;
    estado.acertos = 0;
    estado.respondida = false;
    reiniciarInterfacePerguntas();
    sortearPerguntas();
    mostrarQuiz();
    mostrarPergunta();
}

window.reiniciarQuestionario = () => {
    if (estado.temaAtual) {
        iniciarQuestionario(estado.temaAtual.id);
    }
};

// --- VOLTAR À SELEÇÃO DE TEMAS ---
function voltarSelecaoTemas() {
    mostrarSelecaoTema();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoPerguntas() {
    await carregarDados();

    renderizarTemas(iniciarQuestionario);

    document.getElementById("btnProxima").addEventListener("click", avancarPergunta);
    document.getElementById("btnRetry").addEventListener("click", () => {
        iniciarQuestionario(estado.temaAtual.id);
    });
    document.getElementById("btnOutroTema").addEventListener("click", voltarSelecaoTemas);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-quiz";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
        });
    }
}

inicializarJogoPerguntas();
