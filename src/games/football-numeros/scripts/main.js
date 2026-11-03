import { estado } from "./core.js";
import { carregarDados, sortearJogadoresDasRodadas } from "./data.js";

// --- REFERÊNCIAS AOS ELEMENTOS DOM ---
const elementosJogo = {
    rodadaAtual:            document.getElementById("rodadaAtual"),
    acertos:                document.getElementById("acertos"),
    jogadorNome:            document.getElementById("jogadorNome"),
    jogadorClube:           document.getElementById("jogadorClube"),
    jogadorPeriodo:         document.getElementById("jogadorPeriodo"),
    tentativas:             document.getElementById("tentativas"),
    campoNumeroCamisa:      document.getElementById("inputNumero"),
    mensagemPalpite:        document.getElementById("guessFeedback"),
    areaJogo:               document.getElementById("gameArea"),
    resultadoRodada:        document.getElementById("roundResult"),
    iconeResultadoRodada:   document.getElementById("roundIcon"),
    textoResultadoRodada:   document.getElementById("roundText"),
    respostaRodada:         document.getElementById("roundAnswer"),
    resultadoFinal:         document.getElementById("finalResult"),
    pontosFinais:           document.getElementById("finalPoints"),
    detalhesResultadoFinal: document.getElementById("finalDetails"),
    informacoesJogo:        document.getElementById("gameInfo")
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
    elementosJogo.campoNumeroCamisa.value = "";
    elementosJogo.mensagemPalpite.classList.add("hidden");
    elementosJogo.areaJogo.classList.remove("hidden");
    elementosJogo.resultadoRodada.classList.add("hidden");
    elementosJogo.campoNumeroCamisa.focus();
}

// --- VERIFICAÇÃO DO PALPITE DO JOGADOR ---
function verificarPalpite() {
    const valor = elementosJogo.campoNumeroCamisa.value.trim();
    if (!valor) {
        return;
    }

    const palpite = parseInt(valor);
    if (isNaN(palpite) || palpite < 1 || palpite > 99) {
        elementosJogo.mensagemPalpite.textContent = "Digite um número entre 1 e 99.";
        elementosJogo.mensagemPalpite.className = "guess-feedback wrong";
        elementosJogo.mensagemPalpite.classList.remove("hidden");
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
            elementosJogo.mensagemPalpite.textContent = dica;
            elementosJogo.mensagemPalpite.className = "guess-feedback hint";
            elementosJogo.mensagemPalpite.classList.remove("hidden");
            elementosJogo.campoNumeroCamisa.value = "";
            elementosJogo.campoNumeroCamisa.focus();
        }
    }
}

// --- EXIBIÇÃO DO RESULTADO DA RODADA ---
function mostrarResultado(acertou, jogador) {
    elementosJogo.areaJogo.classList.add("hidden");
    elementosJogo.resultadoRodada.classList.remove("hidden");

    if (acertou) {
        elementosJogo.iconeResultadoRodada.className = "round-icon correct";
        elementosJogo.iconeResultadoRodada.innerHTML = "<i class='fas fa-check-circle'></i>";
        elementosJogo.textoResultadoRodada.textContent = "Correto!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        elementosJogo.iconeResultadoRodada.className = "round-icon wrong";
        elementosJogo.iconeResultadoRodada.innerHTML = "<i class='fas fa-times-circle'></i>";
        elementosJogo.textoResultadoRodada.textContent = "Não acertou!";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    elementosJogo.respostaRodada.textContent = `${jogador.nome} usava a camisa ${jogador.numero} no ${jogador.clube}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnAvancarRodada").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
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
    elementosJogo.areaJogo.classList.add("hidden");
    elementosJogo.resultadoRodada.classList.add("hidden");
    elementosJogo.informacoesJogo.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.remove("hidden");
    elementosJogo.pontosFinais.textContent = estado.acertos;

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

    elementosJogo.detalhesResultadoFinal.innerHTML = `<p>${mensagemResultado}</p>`;

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
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.informacoesJogo.classList.remove("hidden");
    sortearJogadoresDasRodadas();
    mostrarRodada();
}

// --- CONFIGURAÇÃO INICIAL ASSÍNCRONA ---
async function inicializarJogoNumeros() {
    await carregarDados();

    document.getElementById("btnEnviarPalpite").addEventListener("click", verificarPalpite);
    document.getElementById("btnAvancarRodada").addEventListener("click", avancarRodada);
    document.getElementById("btnReiniciarPartida").addEventListener("click", iniciarJogo);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.getElementById("inputNumero").addEventListener("keydown", (eventoTeclado) => {
        if (eventoTeclado.key === "Enter") {
            verificarPalpite();
        }
    });

    const sobreposicaoTutorial = document.getElementById("sobreposicaoTutorial");
    const chaveDispensaTutorial = "tutorial_skip_football-numeros";

    if (localStorage.getItem(chaveDispensaTutorial)) {
        sobreposicaoTutorial.classList.add("hidden");
        iniciarJogo();
    } else {
        document.getElementById("btnIniciarJogoTutorial").addEventListener("click", () => {
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
        document.getElementById("btnOcultarTutorial").addEventListener("click", () => {
            localStorage.setItem(chaveDispensaTutorial, "true");
            sobreposicaoTutorial.classList.add("hidden");
            iniciarJogo();
        });
    }
}

inicializarJogoNumeros();
