import { estado } from './core.js';

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const els = {
    rodadaAtual:        document.getElementById('rodadaAtual'),
    pontos:             document.getElementById('pontos'),
    playerPhoto:        document.getElementById('playerPhoto'),
    blurBar:            document.getElementById('blurBar'),
    guessInput:         document.getElementById('guessInput'),
    guessFeedback:      document.getElementById('guessFeedback'),
    hintText:           document.getElementById('hintText'),
    photoCard:          document.getElementById('photoCard'),
    roundResult:        document.getElementById('roundResult'),
    roundIcon:          document.getElementById('roundIcon'),
    roundText:          document.getElementById('roundText'),
    roundPhotoReveal:   document.getElementById('roundPhotoReveal'),
    finalResult:        document.getElementById('finalResult'),
    finalPoints:        document.getElementById('finalPoints'),
    finalDetails:       document.getElementById('finalDetails'),
    gameInfo:           document.getElementById('gameInfo')
};

// --- INICIAR EFEITO BLUR ---
export function iniciarBlur() {
    estado.blurAtual = 30;
    estado.tempoPassado = 0;
    els.playerPhoto.style.filter = `blur(${estado.blurAtual}px)`;
    els.blurBar.style.width = '0%';

    estado.timerInterval = setInterval(() => {
        estado.tempoPassado += 0.5;
        const progresso = Math.min(estado.tempoPassado / estado.tempoMax, 1);
        estado.blurAtual = 30 * (1 - progresso);
        els.playerPhoto.style.filter = `blur(${estado.blurAtual}px)`;
        els.blurBar.style.width = `${progresso * 100}%`;

        if (estado.tempoPassado >= estado.tempoMax) {
            clearInterval(estado.timerInterval);
            els.playerPhoto.style.filter = 'blur(0px)';
        }
    }, 500);
}

// --- PARAR EFEITO BLUR ---
export function pararBlur() {
    clearInterval(estado.timerInterval);
}

// --- REVELAR FOTO ---
export function revelarFoto() {
    els.playerPhoto.style.filter = 'blur(0px)';
}

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

// --- ATUALIZAR PONTOS ---
export function atualizarPontos() {
    els.pontos.textContent = estado.pontos;
}

// --- CONFIGURAR RODADA ---
export function configurarRodada(jogador) {
    els.playerPhoto.src = jogador.foto;
    els.hintText.textContent = jogador.dica;
    els.hintText.classList.add('hidden');
    document.getElementById('btnHint').classList.remove('used');
    els.guessInput.value = '';
    els.guessFeedback.classList.add('hidden');
    els.photoCard.classList.remove('hidden');
    els.roundResult.classList.add('hidden');
    els.guessInput.focus();
}

// --- MOSTRAR FEEDBACK DE ERRO ---
export function mostrarFeedbackErro() {
    els.guessFeedback.textContent = `Errado! Mais ${estado.tentativasRodada} tentativa(s).`;
    els.guessFeedback.classList.remove('hidden');
    els.guessInput.focus();
}

// --- MOSTRAR RESULTADO DA RODADA ---
export function mostrarResultadoRodada(acertou, jogador, pts) {
    els.photoCard.classList.add('hidden');
    els.roundResult.classList.remove('hidden');

    if (acertou) {
        els.roundIcon.className = 'round-icon correct';
        els.roundIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        els.roundText.textContent = `Correto! Era ${jogador.nome}! (+${pts} pts)`;
    } else {
        els.roundIcon.className = 'round-icon wrong';
        els.roundIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        els.roundText.textContent = `Era ${jogador.nome}!`;
    }

    els.roundPhotoReveal.innerHTML = `<img src="${jogador.foto}" alt="${jogador.nome}">`;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    els.photoCard.classList.add('hidden');
    els.roundResult.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.pontos;

    const maxPts = estado.totalRodadas * 10;
    const pct = Math.round((estado.pontos / maxPts) * 100);
    let msg = '';
    if (pct >= 80) {
        msg = 'Olho de águia! Reconhece qualquer um!';
    } else if (pct >= 50) {
        msg = 'Boa visão, quase um olheiro!';
    } else if (pct >= 30) {
        msg = 'Precisa limpar os óculos!';
    } else {
        msg = 'Tente novamente!';
    }

    els.finalDetails.innerHTML = `<p>${msg}</p><p>${estado.pontos}/${maxPts} pontos possíveis</p>`;
}

// --- RESETAR INTERFACE ---
export function resetarUI() {
    els.pontos.textContent = '0';
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
}

// --- OBTER VALOR DO INPUT ---
export function getInput() {
    return els.guessInput.value.trim();
}

// --- LIMPAR INPUT ---
export function limparInput() {
    els.guessInput.value = '';
}
