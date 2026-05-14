import { estado } from './core.js';
import { obterPosicao, obterLabelPosicao } from './data.js';

const els = {
    timer:              document.getElementById('timer'),
    gameTimerArea:      document.getElementById('gameTimerArea'),
    gameInfo:           document.getElementById('gameInfo'),
    matchInfo:          document.getElementById('matchInfo'),
    acertos:            document.getElementById('acertos'),
    playersLayer:       document.getElementById('playersLayer'),
    guessInput:         document.getElementById('guessInput'),
    autocompleteList:   document.getElementById('autocompleteList'),
    finalResult:        document.getElementById('finalResult'),
    finalPoints:        document.getElementById('finalPoints'),
    finalDetails:       document.getElementById('finalDetails'),
    fieldWrapper:       document.querySelector('.field-wrapper'),
    guessInputArea:     document.querySelector('.guess-input-area'),
    giveUpArea:         document.querySelector('.give-up-area'),
    modeSelect:         document.getElementById('modeSelect')
};

let currentOnSelect = null;
let currentNomes = [];

export function renderizarCampo(escalacao) {
    els.playersLayer.innerHTML = '';
    els.matchInfo.textContent = `${escalacao.time} — ${escalacao.evento} (${escalacao.formacao})`;

    escalacao.jogadores.forEach((jogador, idx) => {
        const pos = obterPosicao(jogador.posicao, escalacao.formacao);
        const label = obterLabelPosicao(jogador.posicao);

        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.id = `slot-${idx}`;
        slot.style.top = `${pos.top}%`;
        slot.style.left = `${pos.left}%`;

        slot.innerHTML = `
            <div class="player-circle">${label}</div>
            <span class="player-label">?</span>
        `;

        els.playersLayer.appendChild(slot);
    });
}

export function revelarJogador(idx, nome) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) return;
    slot.classList.add('revealed');
    slot.querySelector('.player-circle').innerHTML = '<i class="fas fa-check"></i>';
    slot.querySelector('.player-label').textContent = nome;
}

export function revelarNaoAcertado(idx, nome) {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) return;
    slot.classList.add('missed');
    slot.querySelector('.player-circle').innerHTML = '<i class="fas fa-times"></i>';
    slot.querySelector('.player-label').textContent = nome;
}

export function atualizarTimer() {
    const min = Math.floor(estado.tempoRestante / 60);
    const sec = estado.tempoRestante % 60;
    els.timer.textContent = `${min}:${sec.toString().padStart(2, '0')}`;

    if (estado.tempoRestante <= 30) {
        els.gameTimerArea.classList.add('danger');
    } else {
        els.gameTimerArea.classList.remove('danger');
    }
}

export function atualizarAcertos() {
    els.acertos.textContent = estado.acertos;
}

export function esconderTimer() {
    els.gameTimerArea.classList.add('hidden');
}

export function mostrarModeSelect() {
    els.modeSelect.classList.remove('hidden');
    els.gameInfo.classList.add('hidden');
    els.fieldWrapper.classList.add('hidden');
    els.guessInputArea.classList.add('hidden');
    els.giveUpArea.classList.add('hidden');
    els.finalResult.classList.add('hidden');
}

export function esconderModeSelect() {
    els.modeSelect.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
    els.fieldWrapper.classList.remove('hidden');
    els.guessInputArea.classList.remove('hidden');
    els.giveUpArea.classList.remove('hidden');
    els.gameTimerArea.classList.remove('hidden');
}

function atualizarLista(val) {
    const list = els.autocompleteList;
    list.innerHTML = '';

    if (val.length < 2) {
        list.classList.add('hidden');
        return;
    }

    const normalizar = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const extras = estado.escalacaoAtual?.extras || [];
    const filtrados = currentNomes.filter(n => {
        if (!normalizar(n).includes(normalizar(val))) return false;
        // Extras sempre aparecem (distratores)
        if (extras.some(e => normalizar(e) === normalizar(n))) return true;
        // Titulares só aparecem se ainda não foram acertados
        return estado.jogadoresRestantes.some(j => normalizar(j.nome) === normalizar(n));
    });

    if (filtrados.length === 0) {
        list.classList.add('hidden');
        return;
    }

    filtrados.slice(0, 8).forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome;
        li.addEventListener('click', () => {
            currentOnSelect(nome);
            els.guessInput.value = '';
            list.classList.add('hidden');
        });
        list.appendChild(li);
    });

    list.classList.remove('hidden');
}

export function configurarAutocomplete(nomes, onSelect) {
    currentNomes = nomes;
    currentOnSelect = onSelect;

    const input = els.guessInput;
    const list = els.autocompleteList;

    // Remove old listeners by cloning
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    els.guessInput = newInput;

    newInput.addEventListener('input', () => {
        atualizarLista(newInput.value.trim().toLowerCase());
    });

    newInput.addEventListener('keydown', (e) => {
        const items = list.querySelectorAll('li');
        const activeItem = list.querySelector('li.active');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!activeItem && items.length > 0) {
                items[0].classList.add('active');
            } else if (activeItem) {
                activeItem.classList.remove('active');
                const next = activeItem.nextElementSibling || items[0];
                next.classList.add('active');
                next.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const prev = activeItem.previousElementSibling || items[items.length - 1];
                prev.classList.add('active');
                prev.scrollIntoView({ block: 'nearest' });
            } else if (items.length > 0) {
                items[items.length - 1].classList.add('active');
            }
        } else if (e.key === 'ArrowRight') {
            if (activeItem) {
                e.preventDefault();
                currentOnSelect(activeItem.textContent);
                newInput.value = '';
                list.classList.add('hidden');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItem) {
                currentOnSelect(activeItem.textContent);
                newInput.value = '';
                list.classList.add('hidden');
            } else if (newInput.value.trim()) {
                currentOnSelect(newInput.value.trim());
                newInput.value = '';
                list.classList.add('hidden');
            }
        } else if (e.key === 'Escape') {
            list.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            list.classList.add('hidden');
        }
    });
}

export function focarInput() {
    els.guessInput.focus();
}

export function mostrarResultadoFinal() {
    els.fieldWrapper.classList.add('hidden');
    els.guessInputArea.classList.add('hidden');
    els.giveUpArea.classList.add('hidden');
    els.finalResult.classList.remove('hidden');

    els.finalPoints.textContent = estado.acertos;

    const pct = Math.round((estado.acertos / 11) * 100);
    let msg = '';
    if (pct === 100) {
        msg = 'Perfeito! Você lembrou de todos!';
    } else if (pct >= 80) {
        msg = 'Memória quase perfeita!';
    } else if (pct >= 50) {
        msg = 'Bom conhecimento!';
    } else {
        msg = 'Tente novamente!';
    }

    let detalhes = `<p>${msg}</p>`;
    if (estado.modoComTempo) {
        const tempoUsado = 300 - estado.tempoRestante;
        const min = Math.floor(tempoUsado / 60);
        const sec = tempoUsado % 60;
        detalhes += `<p>Tempo: ${min}:${sec.toString().padStart(2, '0')}</p>`;
    } else {
        detalhes += `<p>Modo: Sem Tempo</p>`;
    }
    detalhes += `<p><strong>${estado.escalacaoAtual.time}</strong> — ${estado.escalacaoAtual.evento}</p>`;
    els.finalDetails.innerHTML = detalhes;
}

export function resetarUI() {
    els.finalResult.classList.add('hidden');
    els.fieldWrapper.classList.remove('hidden');
    els.guessInputArea.classList.remove('hidden');
    els.giveUpArea.classList.remove('hidden');
    els.guessInput.value = '';
    els.autocompleteList.classList.add('hidden');
    els.gameTimerArea.classList.remove('danger');
}
