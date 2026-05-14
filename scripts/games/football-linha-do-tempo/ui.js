import { estado } from './core.js';

const els = {
    rodadaAtual:    document.getElementById('rodadaAtual'),
    pontos:         document.getElementById('pontos'),
    tema:           document.getElementById('tema'),
    timelineList:   document.getElementById('timelineList'),
    timelineCard:   document.getElementById('timelineCard'),
    roundResult:    document.getElementById('roundResult'),
    roundScore:     document.getElementById('roundScore'),
    roundCorrect:   document.getElementById('roundCorrect'),
    finalResult:    document.getElementById('finalResult'),
    finalPoints:    document.getElementById('finalPoints'),
    finalDetails:   document.getElementById('finalDetails'),
    gameInfo:       document.getElementById('gameInfo')
};

let draggedItem = null;

export function renderizarLista() {
    els.timelineList.innerHTML = '';
    estado.ordemAtual.forEach((evento, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.draggable = true;
        item.dataset.idx = idx;

        item.innerHTML = `
            <span class="item-number">${idx + 1}</span>
            <span class="item-text">${evento.texto}</span>
            <div class="item-arrows">
                <button class="btn-up" data-idx="${idx}" title="Mover para cima"><i class="fas fa-chevron-up"></i></button>
                <button class="btn-down" data-idx="${idx}" title="Mover para baixo"><i class="fas fa-chevron-down"></i></button>
            </div>
        `;

        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
            document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedItem && draggedItem !== item) {
                item.classList.add('drag-over');
            }
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            if (!draggedItem || draggedItem === item) {
                return;
            }

            const fromIdx = parseInt(draggedItem.dataset.idx);
            const toIdx = parseInt(item.dataset.idx);
            const moved = estado.ordemAtual.splice(fromIdx, 1)[0];
            estado.ordemAtual.splice(toIdx, 0, moved);
            renderizarLista();
        });

        els.timelineList.appendChild(item);
    });

    els.timelineList.querySelectorAll('.btn-up').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            if (idx > 0) {
                [estado.ordemAtual[idx], estado.ordemAtual[idx - 1]] = [estado.ordemAtual[idx - 1], estado.ordemAtual[idx]];
                renderizarLista();
            }
        });
    });

    els.timelineList.querySelectorAll('.btn-down').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            if (idx < estado.ordemAtual.length - 1) {
                [estado.ordemAtual[idx], estado.ordemAtual[idx + 1]] = [estado.ordemAtual[idx + 1], estado.ordemAtual[idx]];
                renderizarLista();
            }
        });
    });
}

export function atualizarRodada() {
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

export function atualizarTema(texto) {
    els.tema.textContent = texto;
}

export function atualizarPontos() {
    els.pontos.textContent = estado.pontos;
}

export function mostrarTimelineCard() {
    els.timelineCard.classList.remove('hidden');
    els.roundResult.classList.add('hidden');
}

export function mostrarRoundResult(corretos, ordemCorreta) {
    els.timelineCard.classList.add('hidden');
    els.roundResult.classList.remove('hidden');

    els.roundScore.textContent = `${corretos}/5 na posição correta (+${corretos} pts)`;

    let html = '<div style="text-align: left; max-width: 500px; margin: 0 auto;">';
    ordemCorreta.forEach((ev) => {
        html += `<div class="correct-order-item"><span class="year-badge">${ev.ano}</span> ${ev.texto}</div>`;
    });
    html += '</div>';
    els.roundCorrect.innerHTML = html;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById('btnNext').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

export function mostrarFinal() {
    els.timelineCard.classList.add('hidden');
    els.roundResult.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');
    els.finalPoints.textContent = estado.pontos;

    const maxPts = estado.totalRodadas * 5;
    const pct = Math.round((estado.pontos / maxPts) * 100);
    let msg = '';
    if (pct >= 90) {
        msg = 'Historiador do futebol!';
    } else if (pct >= 60) {
        msg = 'Boa memória cronológica!';
    } else if (pct >= 40) {
        msg = 'Precisa estudar as datas!';
    } else {
        msg = 'Tente novamente!';
    }

    els.finalDetails.innerHTML = `<p>${msg}</p><p>${estado.pontos}/${maxPts} eventos na posição correta</p>`;
}

export function resetarUI() {
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
    els.pontos.textContent = '0';
}
