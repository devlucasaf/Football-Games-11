import { estado } from './core.js';

const els = {
    rodadaAtual:    document.getElementById('rodadaAtual'),
    acertos:        document.getElementById('acertos'),
    tema:           document.getElementById('tema'),
    namesList:      document.getElementById('namesList'),
    guessInput:     document.getElementById('guessInput'),
    guessFeedback:  document.getElementById('guessFeedback'),
    hintText:       document.getElementById('hintText'),
    challengeCard:  document.getElementById('challengeCard'),
    roundResult:    document.getElementById('roundResult'),
    roundIcon:      document.getElementById('roundIcon'),
    roundText:      document.getElementById('roundText'),
    finalResult:    document.getElementById('finalResult'),
    finalPoints:    document.getElementById('finalPoints'),
    finalDetails:   document.getElementById('finalDetails'),
    gameInfo:       document.getElementById('gameInfo')
};

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

// --- ATUALIZAR ACERTOS ---
export function atualizarAcertos() {
    els.acertos.textContent = estado.acertos;
}

// --- CONFIGURAR RODADA ---
export function configurarRodada(desafio) {
    els.tema.textContent = desafio.tema;

    els.namesList.innerHTML = '';
    desafio.lista.forEach((nome, idx) => {
        const item = document.createElement('span');
        if (idx === desafio.escondido) {
            item.className = 'name-item missing';
            item.id = 'missingItem';
        } else {
            item.className = 'name-item';
            item.textContent = nome;
        }
        els.namesList.appendChild(item);
    });

    els.hintText.textContent = desafio.dica;
    els.hintText.classList.add('hidden');
    document.getElementById('btnHint').classList.remove('used');
    els.guessInput.value = '';
    els.guessFeedback.classList.add('hidden');
    els.challengeCard.classList.remove('hidden');
    els.roundResult.classList.add('hidden');
    els.guessInput.focus();
}

// --- REVELAR RESPOSTA ---
export function revelarResposta(resposta) {
    const missing = document.getElementById('missingItem');
    missing.textContent = resposta;
    missing.className = 'name-item revealed';
}

// --- MOSTRAR FEEDBACK DE ERRO ---
export function mostrarFeedbackErro() {
    els.guessFeedback.textContent = `Errado! Mais ${estado.tentativasRodada} tentativa(s).`;
    els.guessFeedback.classList.remove('hidden');
    els.guessInput.value = '';
    els.guessInput.focus();
}

// --- MOSTRAR RESULTADO DA RODADA ---
export function mostrarResultadoRodada(acertou, resposta) {
    els.challengeCard.classList.add('hidden');
    els.roundResult.classList.remove('hidden');

    if (acertou) {
        els.roundIcon.className = 'round-icon correct';
        els.roundIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        els.roundText.textContent = `Correto! Era ${resposta}!`;
    } else {
        els.roundIcon.className = 'round-icon wrong';
        els.roundIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        els.roundText.textContent = `A resposta era: ${resposta}`;
    }

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    els.challengeCard.classList.add('hidden');
    els.roundResult.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / 10) * 100);
    let msg = '';

    if (pct === 100) {
        msg = 'Memória perfeita!';
    } else if (pct >= 70) {
        msg = 'Excelente conhecimento!';
    } else if (pct >= 40) {
        msg = 'Bom, mas pode melhorar!';
    } else {
        msg = 'Estude mais sobre futebol!';
    }

    els.finalDetails.innerHTML = `<p>${msg}</p>`;
}

// --- RESETAR UI ---
export function resetarUI() {
    els.acertos.textContent = '0';
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
}

// --- OBTER INPUT ---
export function getInput() {
    return els.guessInput.value.trim();
}
