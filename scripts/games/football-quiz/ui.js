import { estado } from './core.js';

const els = {
    temaSelection:  document.getElementById('temaSelection'),
    temaGrid:       document.getElementById('temaGrid'),
    quizGame:       document.getElementById('quizGame'),
    quizInfo:       document.getElementById('quizInfo'),
    quizTemaBadge:  document.getElementById('quizTemaBadge'),
    perguntaAtual:  document.getElementById('perguntaAtual'),
    perguntaTotal:  document.getElementById('perguntaTotal'),
    acertosCount:   document.getElementById('acertosCount'),
    progressFill:   document.getElementById('progressFill'),
    progressLabel:  document.getElementById('progressLabel'),
    perguntaCard:   document.getElementById('perguntaCard'),
    perguntaTexto:  document.getElementById('perguntaTexto'),
    opcoesList:     document.getElementById('opcoesList'),
    btnProxima:     document.getElementById('btnProxima'),
    quizFinal:      document.getElementById('quizFinal'),
    resultIcon:     document.getElementById('resultIcon'),
    resultTitle:    document.getElementById('resultTitle'),
    resultText:     document.getElementById('resultText'),
    resultScore:    document.getElementById('resultScore')
};

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

export function renderizarTemas(onSelect) {
    els.temaGrid.innerHTML = '';
    estado.temas.forEach(tema => {
        const card = document.createElement('button');
        card.className = 'tema-card';
        card.style.borderColor = tema.cor;
        card.innerHTML = `
            <i class="fas ${tema.icone}" style="color: ${tema.cor};"></i>
            <span class="tema-nome">${tema.nome}</span>
        `;
        card.addEventListener('click', () => onSelect(tema.id));
        els.temaGrid.appendChild(card);
    });
}

export function mostrarQuiz() {
    els.temaSelection.classList.add('hidden');
    els.quizGame.classList.remove('hidden');
    els.quizFinal.classList.add('hidden');

    els.quizTemaBadge.innerHTML = `<i class="fas ${estado.temaAtual.icone}"></i> ${estado.temaAtual.nome}`;
    els.quizTemaBadge.style.background = estado.temaAtual.cor;
    els.perguntaTotal.textContent = estado.totalPerguntas;
}

export function atualizarInfo() {
    els.perguntaAtual.textContent = estado.perguntaAtual + 1;
    els.acertosCount.textContent = estado.acertos;

    const pct = ((estado.perguntaAtual) / estado.totalPerguntas) * 100;
    els.progressFill.style.width = `${pct}%`;
    els.progressLabel.textContent = `${Math.round(pct)}%`;
}

export function exibirPergunta(pergunta, onResponder) {
    els.perguntaTexto.textContent = pergunta.pergunta;
    els.opcoesList.innerHTML = '';
    els.btnProxima.classList.add('hidden');

    pergunta.opcoes.forEach((opcao, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-opcao';
        btn.innerHTML = `<span class="opcao-letra">${LETRAS[idx]}</span> ${opcao}`;
        btn.addEventListener('click', () => onResponder(idx));
        els.opcoesList.appendChild(btn);
    });
}

export function mostrarResposta(indiceSelecionado, indiceCorreto) {
    const botoes = els.opcoesList.querySelectorAll('.btn-opcao');

    botoes.forEach((btn, idx) => {
        btn.classList.add('disabled');
        if (idx === indiceCorreto) {
            btn.classList.add('correta');
        }
        if (idx === indiceSelecionado && indiceSelecionado !== indiceCorreto) {
            btn.classList.add('errada');
        }
    });

    els.btnProxima.classList.remove('hidden');

    if (estado.perguntaAtual >= estado.totalPerguntas - 1) {
        els.btnProxima.innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    } else {
        els.btnProxima.innerHTML = '<i class="fas fa-arrow-right"></i> Próxima';
    }
}

export function mostrarFinal() {
    els.quizGame.classList.add('hidden');
    els.quizFinal.classList.remove('hidden');

    const acertos = estado.acertos;
    const total = estado.totalPerguntas;
    const pct = (acertos / total) * 100;

    els.resultScore.textContent = `${acertos}/${total}`;

    if (pct >= 80) {
        els.resultIcon.innerHTML = '<i class="fas fa-trophy" style="color: #f1c40f;"></i>';
        els.resultTitle.textContent = 'Excelente!';
        els.resultText.textContent = 'Você é um verdadeiro craque do conhecimento!';
    } else if (pct >= 50) {
        els.resultIcon.innerHTML = '<i class="fas fa-thumbs-up" style="color: #3498db;"></i>';
        els.resultTitle.textContent = 'Bom trabalho!';
        els.resultText.textContent = 'Você manda bem, mas pode melhorar!';
    } else {
        els.resultIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
        els.resultTitle.textContent = 'Tente novamente!';
        els.resultText.textContent = 'Estude mais sobre o tema e volte para tentar de novo.';
    }
}

export function mostrarSelecaoTema() {
    els.temaSelection.classList.remove('hidden');
    els.quizGame.classList.add('hidden');
    els.quizFinal.classList.add('hidden');
}

export function resetarUI() {
    els.progressFill.style.width = '0%';
    els.progressLabel.textContent = '0%';
    els.acertosCount.textContent = '0';
    els.btnProxima.classList.add('hidden');
    els.btnProxima.innerHTML = '<i class="fas fa-arrow-right"></i> Próxima';
}
