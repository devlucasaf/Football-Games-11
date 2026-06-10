import { estado } from './core.js';
import { carregarDados, sortear } from './data.js';

const els = {
    rodadaAtual:    document.getElementById('rodadaAtual'),
    acertos:        document.getElementById('acertos'),
    jogadorNome:    document.getElementById('jogadorNome'),
    jogadorClube:   document.getElementById('jogadorClube'),
    jogadorPeriodo: document.getElementById('jogadorPeriodo'),
    tentativas:     document.getElementById('tentativas'),
    inputNumero:    document.getElementById('inputNumero'),
    guessFeedback:  document.getElementById('guessFeedback'),
    gameArea:       document.getElementById('gameArea'),
    roundResult:    document.getElementById('roundResult'),
    roundIcon:      document.getElementById('roundIcon'),
    roundText:      document.getElementById('roundText'),
    roundAnswer:    document.getElementById('roundAnswer'),
    finalResult:    document.getElementById('finalResult'),
    finalPoints:    document.getElementById('finalPoints'),
    finalDetails:   document.getElementById('finalDetails'),
    gameInfo:       document.getElementById('gameInfo')
};

function mostrarRodada() {
    const jogador = estado.sorteados[estado.rodadaAtual];
    estado.tentativasRestantes = 3;

    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.jogadorNome.textContent = jogador.nome;
    els.jogadorClube.textContent = jogador.clube;
    els.jogadorPeriodo.textContent = jogador.periodo;
    els.tentativas.textContent = estado.tentativasRestantes;
    els.inputNumero.value = '';
    els.guessFeedback.classList.add('hidden');
    els.gameArea.classList.remove('hidden');
    els.roundResult.classList.add('hidden');
    els.inputNumero.focus();
}

function verificarPalpite() {
    const valor = els.inputNumero.value.trim();
    if (!valor) {
        return;
    }

    const palpite = parseInt(valor);
    if (isNaN(palpite) || palpite < 1 || palpite > 99) {
        els.guessFeedback.textContent = 'Digite um número entre 1 e 99.';
        els.guessFeedback.className = 'guess-feedback wrong';
        els.guessFeedback.classList.remove('hidden');
        return;
    }

    const jogador = estado.sorteados[estado.rodadaAtual];
    const correto = jogador.numero;

    if (palpite === correto) {
        estado.acertos++;
        els.acertos.textContent = estado.acertos;
        estado.historico.push({ 
            jogador: jogador.nome, 
            clube: jogador.clube, 
            acertou: true, 
            tentativas: 3 - estado.tentativasRestantes + 1 
        });
        mostrarResultado(true, jogador);
    } else {
        estado.tentativasRestantes--;
        els.tentativas.textContent = estado.tentativasRestantes;

        if (estado.tentativasRestantes <= 0) {
            estado.historico.push({ 
                jogador: jogador.nome, 
                clube: jogador.clube, 
                acertou: false, 
                tentativas: 3 
            });
            mostrarResultado(false, jogador);
        } else {
            const dica = palpite < correto ? '⬆ Maior!' : '⬇ Menor!';
            els.guessFeedback.textContent = dica;
            els.guessFeedback.className = 'guess-feedback hint';
            els.guessFeedback.classList.remove('hidden');
            els.inputNumero.value = '';
            els.inputNumero.focus();
        }
    }
}

function mostrarResultado(acertou, jogador) {
    els.gameArea.classList.add('hidden');
    els.roundResult.classList.remove('hidden');

    if (acertou) {
        els.roundIcon.className = 'round-icon correct';
        els.roundIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        els.roundText.textContent = 'Correto!';
    } else {
        els.roundIcon.className = 'round-icon wrong';
        els.roundIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        els.roundText.textContent = 'Não acertou!';
    }

    els.roundAnswer.textContent = `${jogador.nome} usava a camisa ${jogador.numero} no ${jogador.clube}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

function proxima() {
    estado.rodadaAtual++;
    if (estado.rodadaAtual >= estado.totalRodadas) {
        mostrarFinal();
    } else {
        mostrarRodada();
    }
}

function mostrarFinal() {
    els.gameArea.classList.add('hidden');
    els.roundResult.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / estado.totalRodadas) * 100);
    let msg = '';
    if (pct === 100) {
        msg = 'Memória fotográfica de camisas!';
    } else if (pct >= 70) {
        msg = 'Ótimo conhecimento numérico!';
    } else if (pct >= 40) {
        msg = 'Bom, mas pode melhorar!';
    } else {
        msg = 'Tente novamente!';
    }

    els.finalDetails.innerHTML = `<p>${msg}</p>`;
}

function iniciarJogo() {
    estado.rodadaAtual = 0;
    estado.acertos = 0;
    estado.historico = [];
    els.acertos.textContent = '0';
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
    sortear();
    mostrarRodada();
}

async function init() {
    await carregarDados();

    document.getElementById('btnGuess').addEventListener('click', verificarPalpite);
    document.getElementById('btnNext').addEventListener('click', proxima);
    document.getElementById('btnRetry').addEventListener('click', iniciarJogo);
    document.getElementById('btnHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    document.getElementById('inputNumero').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            verificarPalpite();
        }
    });

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipKey = 'tutorial_skip_football-numeros';

    if (localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add('hidden');
        iniciarJogo();
    } else {
        document.getElementById('tutorialStartBtn').addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            iniciarJogo();
        });
        document.getElementById('tutorialSkipBtn').addEventListener('click', () => {
            localStorage.setItem(skipKey, 'true');
            tutorialOverlay.classList.add('hidden');
            iniciarJogo();
        });
    }
}

init();
