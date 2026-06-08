import estado from './core.js';

const els = {
    descricao:          document.getElementById('golDescricao'),
    dicasArea:          document.getElementById('dicasArea'),
    dicasList:          document.getElementById('dicasList'),
    palpiteInput:       document.getElementById('palpiteInput'),
    autocompleteList:   document.getElementById('autocompleteList'),
    rodadaInfo:         document.getElementById('rodadaInfo'),
    pontosInfo:         document.getElementById('pontosInfo'),
    resultOverlay:      document.getElementById('resultOverlay'),
    resultIcon:         document.getElementById('resultIcon'),
    resultTitle:        document.getElementById('resultTitle'),
    resultText:         document.getElementById('resultText'),
    finalResult:        document.getElementById('finalResult'),
    finalPoints:        document.getElementById('finalPoints'),
    finalDetails:       document.getElementById('finalDetails'),
    gameArea:           document.getElementById('gameArea'),
    modeSelect:         document.getElementById('modeSelect'),
    btnDica:            document.getElementById('btnDica'),
    btnPular:           document.getElementById('btnPular')
};

// --- TRADUÇÃO ---
function t(key, fallback) {
    const lingua = localStorage.getItem('preferredLanguage') || 'traducoes';
    if (window.translations && window.translations[lingua] && window.translations[lingua][key]) {
        return window.translations[lingua][key];
    }
    return fallback;
}

// --- MOSTRAR MODO SELECT ---
export function mostrarModeSelect() {
    els.modeSelect.classList.remove('hidden');
    els.gameArea.classList.add('hidden');
    els.finalResult.classList.add('hidden');
}

// --- ESCONDER MODO SELECT ---
export function esconderModeSelect() {
    els.modeSelect.classList.add('hidden');
    els.gameArea.classList.remove('hidden');
    els.finalResult.classList.add('hidden');
}

// --- ATUALIZAR INFO DA RODADA ---
export function atualizarRodada() {
    els.rodadaInfo.textContent = `${estado.rodada}/${estado.totalRodadas}`;
    els.pontosInfo.textContent = estado.pontos;
}

// --- MOSTRAR DESCRIÇÃO DO GOL ---
export function mostrarGol(gol) {
    els.descricao.textContent = gol.descricao;
    els.dicasList.innerHTML = '';
    els.dicasArea.classList.add('hidden');
    els.palpiteInput.value = '';
    els.autocompleteList.classList.add('hidden');
    els.btnDica.disabled = false;
    atualizarBtnDica();
}

// --- REVELAR DICA ---
export function revelarDica() {
    if (estado.dicasReveladas >= estado.golAtual.dicas.length) {
        return;
    }

    const dica = estado.golAtual.dicas[estado.dicasReveladas];
    const li = document.createElement('li');
    li.textContent = dica;
    li.classList.add('dica-item', 'dica-new');
    els.dicasList.appendChild(li);
    els.dicasArea.classList.remove('hidden');

    estado.dicasReveladas++;
    atualizarBtnDica();

    setTimeout(() => li.classList.remove('dica-new'), 400);
}

function atualizarBtnDica() {
    const restantes = estado.golAtual.dicas.length - estado.dicasReveladas;
    if (restantes <= 0) {
        els.btnDica.disabled = true;
        els.btnDica.innerHTML = `<i class="fas fa-lightbulb"></i> ${t('gol-no-hints', 'Sem dicas')}`;
    } else {
        els.btnDica.innerHTML = `<i class="fas fa-lightbulb"></i> ${t('gol-hint', 'Dica')} (${restantes})`;
    }
}

// --- MOSTRAR RESULTADO DA RODADA ---
export function mostrarResultadoRodada(acertou, resposta, pts) {
    els.resultOverlay.classList.add('active');

    if (acertou) {
        els.resultIcon.innerHTML = '<i class="fas fa-futbol" style="color:#2ecc71"></i>';
        els.resultTitle.textContent = t('gol-correct', 'Goool!');
        els.resultText.textContent = `${resposta} — +${pts} ${t('gol-points', 'pontos')}`;
    } else {
        els.resultIcon.innerHTML = '<i class="fas fa-times-circle" style="color:#e74c3c"></i>';
        els.resultTitle.textContent = t('gol-wrong', 'Errou!');
        els.resultText.textContent = `${t('gol-answer-was', 'A resposta era')}: ${resposta}`;
    }
}

// --- ESCONDER RESULTADO DA RODADA ---
export function esconderResultadoRodada() {
    els.resultOverlay.classList.remove('active');
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    els.gameArea.classList.add('hidden');
    els.finalResult.classList.remove('hidden');

    els.finalPoints.textContent = estado.pontos;

    const porcentagem = Math.round((estado.pontos / (estado.totalRodadas * 4)) * 100);
    let mensagem;
    if (porcentagem >= 90) {
        mensagem = t('gol-result-perfect', 'Craque absoluto!');
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else if (porcentagem >= 60) {
        mensagem = t('gol-result-great', 'Bom conhecimento de gols!');
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else if (porcentagem >= 40) {
        mensagem = t('gol-result-ok', 'Precisa assistir mais jogos!');
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    } else {
        mensagem = t('gol-result-bad', 'Tente novamente!');
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    els.finalDetails.innerHTML = `
        <p>${mensagem}</p>
        <p>${estado.pontos} ${t('gol-points', 'pontos')} ${t('gol-of', 'de')} ${estado.totalRodadas * 4} ${t('gol-possible', 'possíveis')}</p>
    `;
}

// --- AUTOCOMPLETE ---
let currentOnSelect = null;
let nomes = [];

export function configurarAutocomplete(listaNomes, onSelect) {
    nomes = listaNomes;
    currentOnSelect = onSelect;

    const input = els.palpiteInput;
    const list = els.autocompleteList;

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    els.palpiteInput = newInput;

    newInput.addEventListener('input', () => {
        const val = newInput.value.trim().toLowerCase();
        atualizarAutocomplete(val);
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
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const prev = activeItem.previousElementSibling || items[items.length - 1];
                prev.classList.add('active');
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

function atualizarAutocomplete(val) {
    const list = els.autocompleteList;
    list.innerHTML = '';

    if (val.length < 2) {
        list.classList.add('hidden');
        return;
    }

    const norm = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filtrados = nomes.filter(n => norm(n).includes(norm(val)));

    if (filtrados.length === 0) {
        list.classList.add('hidden');
        return;
    }

    filtrados.slice(0, 6).forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome;
        li.addEventListener('click', () => {
            currentOnSelect(nome);
            els.palpiteInput.value = '';
            list.classList.add('hidden');
        });
        list.appendChild(li);
    });

    list.classList.remove('hidden');
}

// --- FOCAR INPUT ---
export function focarInput() {
    els.palpiteInput.focus();
}
