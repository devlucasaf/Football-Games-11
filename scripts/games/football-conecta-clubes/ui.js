import { estado } from './core.js';

const els = {
    rodadaAtual: document.getElementById('rodadaAtual'),
    acertos: document.getElementById('acertos'),
    clube1: document.getElementById('clube1'),
    clube2: document.getElementById('clube2'),
    tentativas: document.getElementById('tentativas'),
    guessInput: document.getElementById('guessInput'),
    guessFeedback: document.getElementById('guessFeedback'),
    clubsCard: document.getElementById('clubsCard'),
    roundResult: document.getElementById('roundResult'),
    roundIcon: document.getElementById('roundIcon'),
    roundText: document.getElementById('roundText'),
    roundAnswers: document.getElementById('roundAnswers'),
    finalResult: document.getElementById('finalResult'),
    finalPoints: document.getElementById('finalPoints'),
    finalDetails: document.getElementById('finalDetails'),
    gameInfo: document.getElementById('gameInfo')
};

export function atualizarRodada() {
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

export function atualizarAcertos() {
    els.acertos.textContent = estado.acertos;
}

export function configurarRodada(conexao) {
    els.clube1.textContent = conexao.clube1;
    els.clube2.textContent = conexao.clube2;
    els.tentativas.textContent = estado.tentativasRestantes;
    els.guessInput.value = '';
    els.guessFeedback.classList.add('hidden');
    els.clubsCard.classList.remove('hidden');
    els.roundResult.classList.add('hidden');
    els.guessInput.focus();
}

export function atualizarTentativas() {
    els.tentativas.textContent = estado.tentativasRestantes;
}

export function mostrarFeedbackErro(palpite) {
    els.guessFeedback.textContent = `"${palpite}" não jogou em ambos. Tente novamente!`;
    els.guessFeedback.className = 'guess-feedback wrong';
    els.guessFeedback.classList.remove('hidden');
    els.guessInput.value = '';
    els.guessInput.focus();
}

export function mostrarResultadoRodada(acertou, palpite, conexao) {
    els.clubsCard.classList.add('hidden');
    els.roundResult.classList.remove('hidden');

    if (acertou) {
        els.roundIcon.className = 'round-icon correct';
        els.roundIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        els.roundText.textContent = `Correto! ${palpite} jogou em ambos!`;
    } else {
        els.roundIcon.className = 'round-icon wrong';
        els.roundIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        els.roundText.textContent = 'Não acertou desta vez!';
    }

    els.roundAnswers.textContent = `Respostas possíveis: ${conexao.respostas.join(', ')}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

export function mostrarFinal() {
    els.clubsCard.classList.add('hidden');
    els.roundResult.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / 10) * 100);
    let msg = '';
    if (pct === 100) msg = 'Enciclopédia ambulante!';
    else if (pct >= 70) msg = 'Ótimo conhecimento de transferências!';
    else if (pct >= 40) msg = 'Bom, mas pode melhorar!';
    else msg = 'Estude mais o mercado da bola!';

    els.finalDetails.innerHTML = `<p>${msg}</p>`;
}

export function resetarUI() {
    els.acertos.textContent = '0';
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
}

export function getInput() {
    return els.guessInput.value.trim();
}
