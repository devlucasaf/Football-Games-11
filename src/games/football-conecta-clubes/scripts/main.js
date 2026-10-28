import { estado } from "./core.js";
import { carregarDados, sortearConexoesRodadas, normalizarTextoComparacao, obterNomes } from "./data.js";
import {
    atualizarRodada,
    atualizarAcertos,
    configurarRodada,
    atualizarTentativas,
    mostrarFeedbackErro,
    mostrarResultadoRodada,
    mostrarFinal,
    reiniciarInterfaceJogo,
    obterPalpiteInformado
} from "./ui.js";

let nomesDisponiveis = [];
let sugestaoAtiva = -1;
const obterCampoPalpite = () => document.getElementById("guessInput");
const obterListaSugestoes = () => document.getElementById("suggestions");

// --- ESCONDER SUGESTÕES ---
function esconderSugestoes() {
    const lista = obterListaSugestoes();
    lista.classList.add("hidden");
    lista.innerHTML = "";
    sugestaoAtiva = -1;
}

// --- SELECIONAR UMA SUGESTÃO ---
function selecionarSugestao(nome) {
    obterCampoPalpite().value = nome;
    esconderSugestoes();
    obterCampoPalpite().focus();
}

// --- ATUALIZAR DESTAQUE DA SUGESTÃO ATIVA ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, indiceSugestao) => {
        item.classList.toggle("active", indiceSugestao === sugestaoAtiva);
        if (indiceSugestao === sugestaoAtiva) {
            item.scrollIntoView({ block: "nearest" });  
        }
    });
}

// --- RENDERIZAR SUGESTÕES ---
function renderizarSugestoes() {
    const termo = normalizarTextoComparacao(obterCampoPalpite().value);
    const lista = obterListaSugestoes();
    sugestaoAtiva = -1;

    if (!termo) {
        esconderSugestoes();
        return;
    }

    const filtrados = nomesDisponiveis
        .filter(nome => normalizarTextoComparacao(nome).includes(termo))
        .slice(0, 8);

    if (filtrados.length === 0) {
        esconderSugestoes();
        return;
    }

    lista.innerHTML = "";
    filtrados.forEach(nome => {
        const itemSugestao = document.createElement("li");
        itemSugestao.className = "suggestion-item";
        itemSugestao.innerHTML = `<i class="fas fa-user"></i><span>${nome}</span>`;
        itemSugestao.addEventListener("mousedown", (eventoSelecao) => {
            eventoSelecao.preventDefault();
            selecionarSugestao(nome);
        });
        lista.appendChild(itemSugestao);
    });
    lista.classList.remove("hidden");
}

// --- EXIBIR A RODADA ATUAL ---
function mostrarRodada() {
    const conexao = estado.sorteadas[estado.rodadaAtual];
    atualizarRodada();
    estado.tentativasRestantes = 3;
    configurarRodada(conexao);
    esconderSugestoes();
}

// --- VERIFICAR PALPITE DO USUÁRIO ---
function verificarPalpite() {
    const palpite = obterPalpiteInformado();
    esconderSugestoes();
    if (!palpite) {
        return;
    }

    const conexao = estado.sorteadas[estado.rodadaAtual];
    const acertou = conexao.respostas.some(respostaConexao => normalizarTextoComparacao(respostaConexao) === normalizarTextoComparacao(palpite));

    if (acertou) {
        estado.acertos++;
        atualizarAcertos();
        mostrarResultadoRodada(true, palpite, conexao);
    } else {
        estado.tentativasRestantes--;
        atualizarTentativas();

        if (estado.tentativasRestantes <= 0) {
            mostrarResultadoRodada(false, null, conexao);  
        } else {
            mostrarFeedbackErro(palpite);                  
        }
    }
}

// --- AVANÇAR PARA PRÓXIMA RODADA ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
        if (window.FG11Stats) {
            const total = estado.totalRodadas;
            const venceu = estado.acertos >= Math.ceil(total / 2);
            const rotulos = Array.from({ length: total + 1 }, (valorNaoUtilizado, indicePontuacao) => String(indicePontuacao));
            window.FG11Stats.registrar("football-conecta-clubes", {
                venceu,
                bucket: estado.acertos,
                tamanho: total + 1
            });
            window.FG11Stats.mostrarModal("football-conecta-clubes", {
                venceu,
                titulo: "Fim de jogo!",
                resposta: `Você acertou ${estado.acertos} de ${total}`,
                tamanho: total + 1,
                rotulos,
                tituloGrafico: "Acertos por partida",
                bucketAtual: estado.acertos,
                onReiniciar: iniciarJogo,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }
    } else {
        mostrarRodada();
    }
}

// --- INICIAR JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    reiniciarInterfaceJogo();
    sortearConexoesRodadas();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoConectaClubes() {
    await carregarDados();
    nomesDisponiveis = obterNomes();

    // --- EVENTOS DOS BOTÕES PRINCIPAIS ---
    document.getElementById("btnEnviarPalpite").addEventListener("click", verificarPalpite);
    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnReiniciarPartida").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    // --- EVENTOS DO CAMPO DE INPUT ---
    const campoPalpite = obterCampoPalpite();
    campoPalpite.addEventListener("input", renderizarSugestoes);
    campoPalpite.addEventListener("keydown", (eventoTeclado) => {
        const itens = [...obterListaSugestoes().querySelectorAll(".suggestion-item")];

        if (eventoTeclado.key === "ArrowDown" && itens.length > 0) {
            eventoTeclado.preventDefault();
            sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "ArrowUp" && itens.length > 0) {
            eventoTeclado.preventDefault();
            sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "Enter") {
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                eventoTeclado.preventDefault();
                selecionarSugestao(itens[sugestaoAtiva].querySelector("span").textContent);
            } else {
                verificarPalpite();  
            }
        } else if (eventoTeclado.key === "Escape") {
            esconderSugestoes();
        }
    });

    document.addEventListener("click", (eventoClique) => {
        if (!eventoClique.target.closest(".input-autocomplete")) {
            esconderSugestoes();
        }
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const skipKey = "tutorial_skip_football-conecta-clubes";

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


inicializarJogoConectaClubes();
