import { estado } from './core.js';

const elementos = {
    rodadaAtual:    document.getElementById('rodadaAtual'),
    acertos:        document.getElementById('acertos'),
    clube1:         document.getElementById('clube1'),
    clube2:         document.getElementById('clube2'),
    tentativas:     document.getElementById('tentativas'),
    guessInput:     document.getElementById('guessInput'),
    guessFeedback:  document.getElementById('guessFeedback'),
    clubsCard:      document.getElementById('clubsCard'),
    roundResult:    document.getElementById('roundResult'),
    roundIcon:      document.getElementById('roundIcon'),
    roundText:      document.getElementById('roundText'),
    roundAnswers:   document.getElementById('roundAnswers'),
    finalResult:    document.getElementById('finalResult'),
    finalPoints:    document.getElementById('finalPoints'),
    finalDetails:   document.getElementById('finalDetails'),
    gameInfo:       document.getElementById('gameInfo')
};

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    elementos.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

// --- ATUALIZAR ACERTOS ---
export function atualizarAcertos() {
    elementos.acertos.textContent = estado.acertos;
}

// --- CONFIGURAR RODADA ---
export function configurarRodada(conexao) {
    elementos.clube1.textContent = conexao.clube1;
    elementos.clube2.textContent = conexao.clube2;
    elementos.tentativas.textContent = estado.tentativasRestantes;
    elementos.guessInput.value = '';
    elementos.guessFeedback.classList.add('hidden');
    elementos.clubsCard.classList.remove('hidden');
    elementos.roundResult.classList.add('hidden');
    elementos.guessInput.focus();
}

// --- ATUALIZAR TENTATIVAS ---
export function atualizarTentativas() {
    elementos.tentativas.textContent = estado.tentativasRestantes;
}

// --- MOSTRAR FEEDBACK DE ERRO ---
export function mostrarFeedbackErro(palpite) {
    elementos.guessFeedback.textContent = `"${palpite}" não jogou em ambos. Tente novamente!`;
    elementos.guessFeedback.className = 'guess-feedback wrong';
    elementos.guessFeedback.classList.remove('hidden');
    elementos.guessInput.value = '';
    elementos.guessInput.focus();
}

// --- MOSTRAR RESULTADO DA RODADA ---
export function mostrarResultadoRodada(acertou, palpite, conexao) {
    elementos.clubsCard.classList.add('hidden');
    elementos.roundResult.classList.remove('hidden');

    if (acertou) {
        elementos.roundIcon.className = 'round-icon correct';
        elementos.roundIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        elementos.roundText.textContent = `Correto! ${palpite} jogou em ambos!`;
    } else {
        elementos.roundIcon.className = 'round-icon wrong';
        elementos.roundIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        elementos.roundText.textContent = 'Não acertou desta vez!';
    }

    elementos.roundAnswers.textContent = `Respostas possíveis: ${conexao.respostas.join(', ')}`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    elementos.clubsCard.classList.add('hidden');
    elementos.roundResult.classList.add('hidden');
    elementos.gameInfo.classList.add('hidden');
    elementos.finalResult.classList.remove('hidden');
    elementos.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / 10) * 100);
    let mensagem = '';
    if (pct === 100) {
        mensagem = 'Enciclopédia ambulante!';
    } else if (pct >= 70) {
        mensagem = 'Ótimo conhecimento de transferências!';
    } else if (pct >= 40) {
        mensagem = 'Bom, mas pode melhorar!';
    } else {
        mensagem = 'Estude mais o mercado da bola!';
    }

    elementos.finalDetails.innerHTML = `<p>${mensagem}</p>`;
}

// --- RESETAR INTERFACE ---
export function resetarUI() {
    elementos.acertos.textContent = '0';
    elementos.finalResult.classList.add('hidden');
    elementos.gameInfo.classList.remove('hidden');
}

// --- OBTER VALOR DO INPUT ---
export function getInput() {
    return elementos.guessInput.value.trim();
}
