import { estado, reiniciarEstadoTransferencias } from "./core.js";
import { carregarDados, selecionarModo, escolherJogador, obterNomesJogadores } from "./data.js";
import { renderizarClubes, atualizarInformacoesRodada, mostrarRetornoPalpite, mostrarResultadoFinal, reiniciarInterfaceRodada, configurarPreenchimentoAutomatico } from "./ui.js";

function normalizarNomeJogador(nomeJogador) {
    return nomeJogador.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- CALCULA OS PONTOS COM BASE NA QUANTIDADE DE CLUBES REVELADOS ---
function calcularPontos() {
    const total = estado.jogadorAtual.clubes.length;
    const revelados = estado.clubesRevelados;
    const pontos = Math.max(2, Math.round(10 * (1 - (revelados - 1) / Math.max(1, total - 1))));
    return pontos;
}

// --- VERIFICA SE O PALPITE DO USUÁRIO ESTÁ CORRETO ---
function verificarPalpite(nome) {
    if (!estado.jogoAtivo || !estado.jogadorAtual) {
        return;
    }

    const correto = normalizarNomeJogador(estado.jogadorAtual.nome) === normalizarNomeJogador(nome);

    if (correto) {
        const pontos = calcularPontos();
        estado.pontuacao += pontos;
        estado.acertos++;
        mostrarRetornoPalpite(true, pontos);
    } else {
        mostrarRetornoPalpite(false, 0);
    }

    atualizarInformacoesRodada();
}

// --- REVELA O PRÓXIMO CLUBE DO JOGADOR ---
function revelarProximoClube() {
    if (!estado.jogadorAtual) {
        return;
    }

    if (estado.clubesRevelados >= estado.jogadorAtual.clubes.length) {
        return;
    }

    estado.clubesRevelados++;
    renderizarClubes();
}

// --- AVANÇA PARA A PRÓXIMA RODADA OU MOSTRA RESULTADO FINAL ---
function proximaRodada() {
    if (estado.rodada >= estado.totalRodadas) {
        mostrarResultadoFinal();
        registrarEstatisticas();
        return;
    }

    estado.rodada++;
    iniciarRodada();
}

// --- INICIALIZA UMA NOVA RODADA DO JOGO ---
function iniciarRodada() {
    reiniciarInterfaceRodada();
    escolherJogador();
    renderizarClubes();
    atualizarInformacoesRodada();
    document.getElementById("guessInput").focus();
}

// --- REGISTRA E EXIBE AS ESTATÍSTICAS AO FINAL DO JOGO ---
function registrarEstatisticas() {
    if (!window.FG11Stats) {
        return;
    }

    const total = estado.totalRodadas;
    const venceu = estado.acertos >= Math.ceil(total / 2);
    const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
    window.FG11Stats.registrar("football-transferencias", {
        venceu,
        bucket: estado.acertos,
        tamanho: total + 1
    });
    
    window.FG11Stats.mostrarModal("football-transferencias", {
        venceu,
        titulo: "Fim de jogo!",
        resposta: `Você acertou ${estado.acertos} de ${total} · ${estado.pontuacao} pontos`,
        tamanho: total + 1,
        rotulos,
        tituloGrafico: "Acertos por partida",
        bucketAtual: estado.acertos,
        onReiniciar: iniciarJogo,
        onHome: () => { window.location.href = "../../../index.html"; }
    });
}

// --- INICIA UM NOVO JOGO DO ZERO ---
function iniciarJogo() {
    document.getElementById("modeSelection").classList.add("hidden");
    document.getElementById("gameInfo").classList.remove("hidden");
    document.getElementById("clubsArea").classList.remove("hidden");
    document.getElementById("guessArea").classList.remove("hidden");
    reiniciarEstadoTransferencias();
    selecionarModo(estado.modoAtual);
    configurarSugestoesJogadores();
    iniciarRodada();
}

// --- SELECIONAR MODO E INICIAR ---
function selecionarModoEIniciar(modo) {
    estado.modoAtual = modo;
    iniciarJogo();
}

// --- VOLTAR À SELEÇÃO DE MODO ---
function voltarSelecaoModo() {
    document.getElementById("modeSelection").classList.remove("hidden");
    document.getElementById("gameInfo").classList.add("hidden");
    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("finalResult").classList.add("hidden");
}

// --- BOTÃO DE REVELAR PRÓXIMO CLUBE ---
document.getElementById("btnReveal").addEventListener("click", revelarProximoClube);

// --- BOTÃO DE CONFIRMAR PALPITE ---
document.getElementById("btnGuess").addEventListener("click", () => {
    const campoPalpite = document.getElementById("guessInput");
    if (campoPalpite.value.trim()) {
        verificarPalpite(campoPalpite.value.trim());
    }
});

document.getElementById("btnNext").addEventListener("click", proximaRodada);
document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "../../../index.html";
});

// --- BOTÕES DE SELEÇÃO DE MODO ---
document.getElementById("btnMundial").addEventListener("click", () => selecionarModoEIniciar("mundial"));
document.getElementById("btnBrasileiro").addEventListener("click", () => selecionarModoEIniciar("brasileiro"));
document.getElementById("btnTrocarModo").addEventListener("click", voltarSelecaoModo);

// --- CONFIGURA O AUTOCOMPLETAR COM OS NOMES DOS JOGADORES ---
function configurarSugestoesJogadores() {
    const nomes = obterNomesJogadores();
    configurarPreenchimentoAutomatico(nomes, (nome) => {
        document.getElementById("guessInput").value = nome;
        document.getElementById("autocompleteList").classList.remove("active");
        verificarPalpite(nome);
    });
}

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO JOGO ---
async function inicializarJogoTransferencias() {
    await carregarDados();
}

inicializarJogoTransferencias();
