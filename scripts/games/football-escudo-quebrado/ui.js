import { estado }       from './core.js';
import { obterCores }   from './data.js';

const els = {
    colorBlocks:    document.getElementById('colorBlocks'),
    hintsList:      document.getElementById('hintsList'),
    optionsGrid:    document.getElementById('optionsGrid'),
    badgeQuestion:  document.querySelector('.badge-question'),
    pontuacao:      document.getElementById('pontuacao'),
    rodadaAtual:    document.getElementById('rodadaAtual'),
    btnHint:        document.getElementById('btnHint'),
    feedback:       document.getElementById('feedback'),
    feedbackIcon:   document.getElementById('feedbackIcon'),
    feedbackText:   document.getElementById('feedbackText'),
    feedbackAnswer: document.getElementById('feedbackAnswer'),
    hintsArea:      document.getElementById('hintsArea'),
    optionsArea:    document.getElementById('optionsArea'),
    finalResult:    document.getElementById('finalResult'),
    finalPoints:    document.getElementById('finalPoints'),
    finalDetails:   document.getElementById('finalDetails')
};

// --- RENDERIZAR BLOCOS DE CORES ---
export function renderizarCores() {
    const cores = obterCores();
    els.colorBlocks.innerHTML = '';
    cores.forEach(cor => {
        const bloco = document.createElement('div');
        
        bloco.className = 'color-block';
        bloco.style.backgroundColor = cor;
        els.colorBlocks.appendChild(bloco);
    });
}

// --- RENDERIZAR DICA ---
export function renderizarDica(dica) {
    const item = document.createElement('div');
    item.className = 'hint-item';

    const tipoIcons = {
        cores:     'fa-palette',
        simbolo:   'fa-icons',
        elemento:  'fa-puzzle-piece',
        detalhe:   'fa-info',
        cidade:    'fa-map-marker-alt'
    };

    const tipoLabels = {
        cores:     'Cores',
        simbolo:   'Símbolo',
        elemento:  'Elemento',
        detalhe:   'Detalhe',
        cidade:    'Localização'
    };

    item.innerHTML = `
        <div class="hint-icon"><i class="fas ${tipoIcons[dica.tipo] || 'fa-circle'}"></i></div>
        <div>
            <span class="hint-label">${tipoLabels[dica.tipo] || dica.tipo}</span>
            <span class="hint-text">${dica.texto}</span>
        </div>
    `;
    els.hintsList.appendChild(item);
}

// --- RENDERIZAR OPÇÕES DE RESPOSTA ---
export function renderizarOpcoes(opcoes, onSelect) {
    els.optionsGrid.innerHTML = '';
    const shuffled = [...opcoes].sort(() => Math.random() - 0.5);
    shuffled.forEach(nome => {
        const btn = document.createElement('button');

        btn.className = 'option-btn';
        btn.textContent = nome;
        btn.addEventListener('click', () => onSelect(nome, btn));
        els.optionsGrid.appendChild(btn);
    });
}

// --- MOSTRAR FEEDBACK CORRETO ---
export function mostrarFeedbackCorreto(pontos) {
    els.hintsArea.classList.add('hidden');
    els.optionsArea.classList.add('hidden');
    els.feedback.classList.remove('hidden');

    els.feedbackIcon.className = 'feedback-icon correct';
    els.feedbackIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    els.feedbackText.textContent = 'Correto!';
    els.feedbackAnswer.innerHTML = `
        <strong>${estado.clubeAtual.nome}</strong> — ${estado.clubeAtual.pais}
        <div class="points-earned">+${pontos} pontos</div>
    `;
}

// --- MOSTRAR FEEDBACK ERRADO ---
export function mostrarFeedbackErrado() {
    els.hintsArea.classList.add('hidden');
    els.optionsArea.classList.add('hidden');
    els.feedback.classList.remove('hidden');

    els.feedbackIcon.className = 'feedback-icon wrong';
    els.feedbackIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    els.feedbackText.textContent = 'Errado!';
    els.feedbackAnswer.innerHTML = `
        O clube era <strong>${estado.clubeAtual.nome}</strong> — ${estado.clubeAtual.pais}
        <div class="points-earned">+0 pontos</div>
    `;
}

// --- ATUALIZAR INFORMAÇÕES ---
export function atualizarInfo() {
    els.pontuacao.textContent = estado.pontuacao;
    els.rodadaAtual.textContent = estado.rodada;
}

// --- RESETAR RODADA ---
export function resetarRodada() {
    els.colorBlocks.innerHTML = '';
    els.hintsList.innerHTML = '';
    els.optionsGrid.innerHTML = '';
    els.feedback.classList.add('hidden');
    els.hintsArea.classList.remove('hidden');
    els.optionsArea.classList.remove('hidden');
    els.btnHint.disabled = false;
    els.badgeQuestion.classList.remove('revealed');
    els.badgeQuestion.innerHTML = '<i class="fas fa-shield-halved"></i><span>?</span>';
}

// --- DESABILITAR OPÇÕES ---
export function desabilitarOpcoes(respostaCerta) {
    const btns = els.optionsGrid.querySelectorAll('.option-btn');
    btns.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === respostaCerta) {
            btn.classList.add('correct');
        }
    });
}

// --- DESABILITAR BOTÃO DE DICA ---
export function desabilitarHint() {
    els.btnHint.disabled = true;
}

// --- REVELAR ESCUDO ---
export function revelarEscudo() {
    els.badgeQuestion.classList.add('revealed');
    els.badgeQuestion.innerHTML = `<i class="fas fa-shield-halved"></i><span>${estado.clubeAtual.nome}</span>`;
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarResultadoFinal() {
    els.hintsArea.classList.add('hidden');
    els.optionsArea.classList.add('hidden');
    els.feedback.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.pontuacao;

    const max = estado.totalRodadas * 10;
    const pct = Math.round((estado.pontuacao / max) * 100);
    let msg = '';
    if (pct === 100) {
        msg = 'Perfeito! Você é um expert em escudos!';
    } else if (pct >= 70) {
        msg = 'Ótimo desempenho! Conhece bem os escudos!';
    } else if (pct >= 40) {
        msg = 'Bom, mas pode melhorar!';
    } else {
        msg = 'Continue praticando!';
    }

    let detalhes = `<p>${msg}</p><p>${estado.pontuacao}/${max} pontos (${pct}%)</p>`;
    detalhes += '<div style="margin-top:1rem; text-align:left; max-width:300px; margin-left:auto; margin-right:auto;">';
    
    estado.historico.forEach(h => {
        const icon = h.acertou ? '<i class="fas fa-check" style="color: green;"></i>' : '<i class="fas fa-times" style="color: red;"></i>';
        detalhes += `<p>${icon} ${h.clube} — ${h.dicas} dica(s) usada(s)</p>`;
    });
    detalhes += '</div>';
    els.finalDetails.innerHTML = detalhes;
}
