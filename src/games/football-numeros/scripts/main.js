import { estado } from "./core.js";
import { carregarDados, sortearJogadoresDasRodadas } from "./data.js";

// --- REFERÊNCIAS AOS ELEMENTOS DOM ---
const elementosJogo = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    acertos:        document.getElementById("acertos"),
    jogadorNome:    document.getElementById("jogadorNome"),
    jogadorClube:   document.getElementById("jogadorClube"),
    jogadorPeriodo: document.getElementById("jogadorPeriodo"),
    tentativas:     document.getElementById("tentativas"),
    inputNumero:    document.getElementById("inputNumero"),
    guessFeedback:  document.getElementById("guessFeedback"),
    gameArea:       document.getElementById("gameArea"),
    roundResult:    document.getElementById("roundResult"),
    roundIcon:      document.getElementById("roundIcon"),
    roundText:      document.getElementById("roundText"),
    roundAnswer:    document.getElementById("roundAnswer"),
    finalResult:    document.getElementById("finalResult"),
    finalPoints:    document.getElementById("finalPoints"),
    finalDetails:   document.getElementById("finalDetails"),
    gameInfo:       document.getElementById("gameInfo")
};

// --- EXIBIÇÃO DA RODADA ATUAL ---
function mostrarRodada() {
    const jogador = estado.sorteados[estado.rodadaAtual];
    estado.tentativasRestantes = 3;

    elementosJogo.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosJogo.jogadorNome.textContent = jogador.nome;
    elementosJogo.jogadorClube.textContent = jogador.clube;
    elementosJogo.jogadorPeriodo.textContent = jogador.periodo;
    elementosJogo.tentativas.textContent = estado.tentativasRestantes;
    elementosJogo.inputNumero.value = "";
    elementosJogo.guessFeedback.classList.add("hidden");
    elementosJogo.gameArea.classList.remove("hidden");
    elementosJogo.roundResult.classList.add("hidden");
    elementosJogo.inputNumero.focus();
}

// --- VERIFICAÇÃO DO PALPITE DO JOGADOR ---
function verificarPalpite() {
    const valor = elementosJogo.inputNumero.value.trim();
    if (!valor) {
        return;
    }

    const palpite = parseInt(valor);
    if (isNaN(palpite) || palpite < 1 || palpite > 99) {
        elementosJogo.guessFeedback.textContent = "Digite um número entre 1 e 99.";
        elementosJogo.guessFeedback.className = "guess-feedback wrong";
        elementosJogo.guessFeedback.classList.remove("hidden");
        return;
    }

    const jogador = estado.sorteados[estado.rodadaAtual];
    const correto = jogador.numero;

    if (palpite === correto) {
        estado.acertos++;
        elementosJogo.acertos.textContent = estado.acertos;
        estado.historico.push({ 
            jogador: jogador.nome, 
            clube: jogador.clube, 
            acertou: true, 
            tentativas: 3 - estado.tentativasRestantes + 1 
        });
        mostrarResultado(true, jogador);
    } else {
        estado.tentativasRestantes--;
        elementosJogo.tentativas.textContent = estado.tentativasRestantes;

        if (estado.tentativasRestantes <= 0) {
            estado.historico.push({ 
                jogador: jogador.nome, 
                clube: jogador.clube, 
                acertou: false, 
                tentativas: 3 
            });
            mostrarResultado(false, jogador);
        } else {
            const dica = palpite < correto ? "⬆ Maior!" : "⬇ Menor!";
            elementosJogo.guessFeedback.textContent = dica;
            elementosJogo.guessFeedback.className = "guess-feedback hint";
            elementosJogo.guessFeedback.classList.remove("hidden");
            elementosJogo.inputNumero.value = "";
            elementosJogo.inputNumero.focus();
        }
    }
}

// --- EXIBIÇÃO DO RESULTADO DA RODADA ---
function mostrarResultado(acertou, jogador) {
    elementosJogo.gameArea.classList.add("hidden");
    elementosJogo.roundResult.classList.remove("hidden");

    if (acertou) {
        elementosJogo.roundIcon.className = "round-icon correct";
        elementosJogo.roundIcon.innerHTML = "<i class='fas fa-check-circle'></i>";
        elementosJogo.roundText.textContent = "Correto!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        elementosJogo.roundIcon.className = "round-icon wrong";
        elementosJogo.roundIcon.innerHTML = "<i class='fas fa-times-circle'></i>";
        elementosJogo.roundText.textContent = "Não acertou!";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    elementosJogo.roundAnswer.textContent = `${jogador.nome} usava a camisa ${jogador.numero} no ${jogador.clube}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnNext").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    }
}

// --- AVANÇA PARA PRÓXIMA RODADA OU FINAL ---
function avancarRodada() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

// --- TELA DE RESULTADO FINAL ---
function mostrarFinal() {
    elementosJogo.gameArea.classList.add("hidden");
    elementosJogo.roundResult.classList.add("hidden");
    elementosJogo.gameInfo.classList.add("hidden");
    elementosJogo.finalResult.classList.remove("hidden");
    elementosJogo.finalPoints.textContent = estado.acertos;

    const porcentagemAcertos = Math.round((estado.acertos / estado.totalRodadas) * 100);
    let mensagemResultado = "";
    if (porcentagemAcertos === 100) {
        mensagemResultado = "Memória fotográfica de camisas!";
    } else if (porcentagemAcertos >= 70) {
        mensagemResultado = "Ótimo conhecimento numérico!";
    } else if (porcentagemAcertos >= 40) {
        mensagemResultado = "Bom, mas pode melhorar!";
    } else {
        mensagemResultado = "Tente novamente!";
    }

    elementosJogo.finalDetails.innerHTML = `<p>${mensagemResultado}</p>`;

    if (window.FG11Stats) {
        const total = estado.totalRodadas;
        const venceu = estado.acertos >= Math.ceil(total / 2);
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-numeros", {
            venceu,
            bucket: estado.acertos,
            tamanho: total + 1
        });
        window.FG11Stats.mostrarModal("football-numeros", {
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
}

// --- INICIALIZAÇÃO DO JOGO ---
function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    estado.historico = [];
    elementosJogo.acertos.textContent = "0";
    elementosJogo.finalResult.classList.add("hidden");
    elementosJogo.gameInfo.classList.remove("hidden");
    sortearJogadoresDasRodadas();
    mostrarRodada();
}

// --- CONFIGURAÇÃO INICIAL ASSÍNCRONA ---
async function inicializarJogoNumeros() {
    await carregarDados();

    document.getElementById("btnGuess").addEventListener("click", verificarPalpite);
    document.getElementById("btnNext").addEventListener("click", avancarRodada);
    document.getElementById("btnRetry").addEventListener("click", iniciarJogo);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.getElementById("inputNumero").addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.key === "Enter") {
            verificarPalpite();
        }
    });

    const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
    const chaveDispensaTutorial = "tutorial_skip_football-numeros";

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

inicializarJogoNumeros();
