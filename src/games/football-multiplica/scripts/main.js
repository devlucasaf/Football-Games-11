import { estado } from "./core.js";
import { carregarDados, sortearDesafio, sortearJogadores, jogadorAtual, valorDoJogador } from "./data.js";
import {
    exibirDesafio,
    atualizarRodada,
    atualizarPulos,
    exibirJogador,
    renderizarMultiplicadores,
    mostrarFinal,
    reiniciarInterface
} from "./ui.js";

// --- MOSTRAR RODADA ---
function mostrarRodada() {
    const jogador = jogadorAtual();
    if (!jogador) {
        return;
    }

    const valor = valorDoJogador(jogador);
    atualizarRodada();
    exibirJogador(jogador, valor);
    renderizarMultiplicadores(selecionarMultiplicador);
}

// --- SELECIONAR MULTIPLICADOR ---
function selecionarMultiplicador(indiceMultiplicador, multiplicador) {
    const jogador = jogadorAtual();
    const valor = valorDoJogador(jogador);
    const resultado = valor * multiplicador;

    estado.multiplicadoresUsados[indiceMultiplicador] = jogador.nome;
    estado.totalAcumulado += resultado;
    atualizarRodada();
    avancarRodada();
}

// --- PULAR JOGADOR ---
function pularJogador() {
    if (estado.pulosRestantes <= 0) {
        return;
    }
    estado.pulosRestantes--;
    estado.indiceSorteados++;
    atualizarPulos();
    mostrarRodada();
}

// --- PRÓXIMA RODADA ---
function avancarRodada() {
    estado.rodadaAtual++;
    estado.indiceSorteados++;
    if (estado.rodadaAtual >= estado.desafioAtual.rodadas) {
        const venceu = estado.totalAcumulado >= estado.desafioAtual.meta;
        mostrarFinal(venceu);
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-multiplica", {
                venceu,
                bucket: 0,
                tamanho: 1
            });
            
            window.FG11Stats.mostrarModal("football-multiplica", {
                venceu,
                titulo: venceu ? "Meta batida!" : "Não foi dessa vez!",
                resposta: `Total: ${estado.totalAcumulado} · Meta: ${estado.desafioAtual.meta}`,
                tamanho: 1,
                rotulos: ["Vitórias"],
                tituloGrafico: "Desafios vencidos",
                bucketAtual: venceu ? 0 : -1,
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
    estado.indiceSorteados = 0;
    estado.totalAcumulado = 0;
    estado.pulosRestantes = estado.maximoPulos;
    estado.multiplicadoresUsados = {};
    reiniciarInterface();
    sortearDesafio();
    sortearJogadores();
    exibirDesafio();
    mostrarRodada();
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoMultiplicacao() {
    await carregarDados();

    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnPularJogador").addEventListener("click", pularJogador);
    document.getElementById("btnJogarNovamente").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-multiplica";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
    }
}

inicializarJogoMultiplicacao();
