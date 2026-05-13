import { estado } from './core.js';

const els = {
    pontuacao:          document.getElementById('pontuacao'),
    rodadaAtual:        document.getElementById('rodadaAtual'),
    jogadorIdx:         document.getElementById('jogadorIdx'),
    contextoTexto:      document.getElementById('contextoTexto'),
    timeANome:          document.getElementById('timeANome'),
    timeATemp:          document.getElementById('timeATemp'),
    timeBNome:          document.getElementById('timeBNome'),
    timeBTemp:          document.getElementById('timeBTemp'),
    scoreA:             document.getElementById('scoreA'),
    scoreB:             document.getElementById('scoreB'),
    playerName:         document.getElementById('playerName'),
    playerCard:         document.getElementById('playerCard'),
    btnChooseA:         document.getElementById('btnChooseA'),
    btnChooseB:         document.getElementById('btnChooseB'),
    quickFeedback:      document.getElementById('quickFeedback'),
    quickFeedbackText:  document.getElementById('quickFeedbackText'),
    dueloArena:         document.getElementById('dueloArena'),
    dueloContexto:      document.getElementById('dueloContexto'),
    dueloResult:        document.getElementById('dueloResult'),
    dueloResultTitle:   document.getElementById('dueloResultTitle'),
    dueloResultDetails: document.getElementById('dueloResultDetails'),
    finalResult:        document.getElementById('finalResult'),
    finalPoints:        document.getElementById('finalPoints'),
    finalDetails:       document.getElementById('finalDetails')
};

export function configurarDuelo(duelo) {
    els.contextoTexto.textContent = duelo.contexto;
    els.timeANome.textContent = duelo.timeA.nome;
    els.timeATemp.textContent = duelo.timeA.temporada;
    els.timeBNome.textContent = duelo.timeB.nome;
    els.timeBTemp.textContent = duelo.timeB.temporada;
    els.scoreA.textContent = '0';
    els.scoreB.textContent = '0';
    els.dueloArena.classList.remove('hidden');
    els.dueloContexto.classList.remove('hidden');
    els.dueloResult.classList.add('hidden');
    els.quickFeedback.classList.add('hidden');
    habilitarBotoes();
}

export function mostrarJogador(jogador) {
    els.playerName.textContent = jogador.nome;
    els.playerCard.style.animation = 'none';
    els.playerCard.offsetHeight; 
    els.playerCard.style.animation = 'playerEnter 0.4s ease';
    els.jogadorIdx.textContent = estado.jogadorIdx + 1;
}

export function mostrarQuickFeedback(correto, timeCorreto) {
    els.quickFeedback.classList.remove('hidden', 'correct', 'wrong');
    if (correto) {
        els.quickFeedback.classList.add('correct');
        els.quickFeedbackText.textContent = '✓ Correto!';
    } else {
        els.quickFeedback.classList.add('wrong');
        els.quickFeedbackText.textContent = `✗ Era do ${timeCorreto}`;
    }
    setTimeout(() => els.quickFeedback.classList.add('hidden'), 1200);
}

export function atualizarScores(acertosA, acertosB) {
    els.scoreA.textContent = acertosA;
    els.scoreB.textContent = acertosB;
}

export function atualizarInfo() {
    els.pontuacao.textContent = estado.pontuacao;
    els.rodadaAtual.textContent = estado.rodada;
}

export function habilitarBotoes() {
    els.btnChooseA.disabled = false;
    els.btnChooseB.disabled = false;
}

export function desabilitarBotoes() {
    els.btnChooseA.disabled = true;
    els.btnChooseB.disabled = true;
}

export function mostrarResultadoDuelo(acertos, total) {
    els.dueloArena.classList.add('hidden');
    els.dueloContexto.classList.add('hidden');
    els.dueloResult.classList.remove('hidden');

    const pct = Math.round((acertos / total) * 100);
    els.dueloResultTitle.textContent = `${acertos}/${total} acertos neste duelo!`;

    let msg = '';
    if (pct === 100) {
        msg = 'Perfeito! Conhece bem esses elencos!';
    } else if (pct >= 66) {
        msg = 'Boa memória!';
    } else {
        msg = 'Difícil esse duelo!';
    }

    els.dueloResultDetails.innerHTML = `
        <p>${msg}</p>
        <p><strong>${estado.dueloAtual.timeA.nome}</strong> ${estado.dueloAtual.timeA.temporada} vs 
        <strong>${estado.dueloAtual.timeB.nome}</strong> ${estado.dueloAtual.timeB.temporada}</p>
    `;
}

export function mostrarResultadoFinal() {
    els.dueloArena.classList.add('hidden');
    els.dueloContexto.classList.add('hidden');
    els.dueloResult.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.pontuacao;

    const max = estado.totalRodadas * 6;
    const totalAcertos = estado.historico.reduce((s, h) => s + h.acertos, 0);
    const pct = Math.round((totalAcertos / max) * 100);
    let msg = '';
    if (pct === 100) {
        msg = 'Incrível! Memória de técnico!';
    } else if (pct >= 70) {
        msg = 'Ótimo conhecimento de elencos!';
    } else if (pct >= 40) {
        msg = 'Bom, mas pode melhorar!';
    } else {
        msg = 'Continue praticando!';
    }

    let detalhes = `<p>${msg}</p><p>${totalAcertos}/${max} acertos totais (${pct}%)</p>`;
    detalhes += '<div style="margin-top:1rem;">';
    estado.historico.forEach(h => {
        detalhes += `<p>${h.acertos}/6 — ${h.timeA} vs ${h.timeB}</p>`;
    });
    detalhes += '</div>';
    els.finalDetails.innerHTML = detalhes;
}
