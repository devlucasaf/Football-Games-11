import estado from './core.js';
import { normalizar } from './utils.js';
import { obterNomesItens } from './data.js';

const $lista          = document.getElementById('top10Lista');
const $temaIcone      = document.getElementById('temaIcone');
const $temaTexto      = document.getElementById('temaTexto');
const $temaCategoria  = document.getElementById('temaCategoria');
const $acertosCount   = document.getElementById('acertosCount');
const $vidasCount     = document.getElementById('vidasCount');
const $pontosCount    = document.getElementById('pontosCount');
const $rodadasCount   = document.getElementById('rodadasCount');
const $input          = document.getElementById('palpiteInput');
const $sugestoes      = document.getElementById('sugestoesLista');
const $feedbackArea   = document.getElementById('feedbackArea');
const $feedbackIcone  = document.getElementById('feedbackIcone');
const $feedbackTexto  = document.getElementById('feedbackTexto');
const $resultOverlay  = document.getElementById('resultOverlay');
const $resultIcon     = document.getElementById('resultIcon');
const $resultTitle    = document.getElementById('resultTitle');
const $resultText     = document.getElementById('resultText');

let feedbackTimer = null;

export function renderizarTema(lista) {
    $temaIcone.className = lista.icone;
    $temaTexto.textContent = lista.tema;

    const cat = {
        selecoes:  'Seleções',
        clubes:    'Clubes',
        jogadores: 'Jogadores'
    };
    $temaCategoria.textContent = cat[lista.categoria] || lista.categoria;
}

export function renderizarLista(lista) {
    $lista.innerHTML = '';

    lista.itens.forEach((item, idx) => {
        const div = document.createElement('div');
        div.classList.add('top10-item');
        div.dataset.pos = item.posicao;
        div.dataset.idx = idx;

        div.innerHTML = `
            <span class="item-posicao">${item.posicao}.</span>
            <span class="item-oculto">???</span>
        `;

        $lista.appendChild(div);
    });
}

export function revelarItem(idx, modoDesistir = false) {
    const item = estado.listaAtual.itens[idx];
    const el   = $lista.querySelector(`[data-idx="${idx}"]`);
    if (!el) {
        return;
    }

    el.classList.add(modoDesistir ? 'desistiu' : 'revelado');

    el.innerHTML = `
        <span class="item-posicao">${item.posicao}.</span>
        <div class="item-conteudo">
            <span class="item-nome">${item.nome}</span>
            <span class="item-detalhe">${item.detalhe}</span>
        </div>
    `;
}

export function revelarTodos() {
    estado.listaAtual.itens.forEach((_, idx) => {
        if (!estado.itensAcertados.has(idx)) {
            revelarItem(idx, true);
        }
    });
}

export function atualizarPlacar() {
    $acertosCount.textContent = estado.acertosRodada;
    $vidasCount.textContent   = estado.vidas;
    $pontosCount.textContent  = estado.pontosTotal;
    $rodadasCount.textContent = estado.totalRodadas;
}

export function mostrarFeedback(tipo, texto) {
    clearTimeout(feedbackTimer);

    $feedbackArea.style.display = '';
    $feedbackArea.className = 'top10-feedback ' + tipo;
    $feedbackIcone.className = tipo === 'acerto'
        ? 'fas fa-check-circle'
        : 'fas fa-times-circle';
    $feedbackTexto.textContent = texto;

    feedbackTimer = setTimeout(() => {
        $feedbackArea.style.display = 'none';
    }, 2000);
}

export function inicializarSugestoes(onSelecionar) {
    $input.addEventListener('input', () => {
        const valor = $input.value.trim();
        if (valor.length < 2) {
            fecharSugestoes();
            return;
        }

        const nomes = obterNomesItens();
        const valorN = normalizar(valor);

        const sugestoes = nomes.filter((nome, idx) => {
            if (estado.itensAcertados.has(idx)) { 
                return false;
            }
            return normalizar(nome).includes(valorN);
        });

        const vistos = new Set();
        const unicos = sugestoes.filter(n => {
            const norm = normalizar(n);
            if (vistos.has(norm)) {
                return false;
            }
            vistos.add(norm);
            return true;
        });

        if (unicos.length === 0) {
            fecharSugestoes();
            return;
        }

        $sugestoes.innerHTML = '';
        unicos.slice(0, 6).forEach(nome => {
            const div = document.createElement('div');
            div.classList.add('sugestao-item');
            div.textContent = nome;
            div.addEventListener('click', () => {
                $input.value = nome;
                fecharSugestoes();
                onSelecionar();
            });
            $sugestoes.appendChild(div);
        });

        $sugestoes.classList.add('ativa');
    });

    document.addEventListener('click', (e) => {
        if (!$input.contains(e.target) && !$sugestoes.contains(e.target)) {
            fecharSugestoes();
        }
    });
}

function fecharSugestoes() {
    $sugestoes.innerHTML = '';
    $sugestoes.classList.remove('ativa');
}

export function limparInput() {
    $input.value = '';
    fecharSugestoes();
}

export function focarInput() {
    $input.focus();
}

export function desabilitarInput() {
    $input.disabled = true;
    document.getElementById('confirmarBtn').disabled = true;
    document.getElementById('desistirBtn').disabled  = true;
}

export function habilitarInput() {
    $input.disabled = false;
    document.getElementById('confirmarBtn').disabled = false;
    document.getElementById('desistirBtn').disabled  = false;
}

export function mostrarResultado(acertos, total, pontos) {
    const completo = acertos === total;

    $resultIcon.innerHTML = completo
        ? '<i class="fas fa-trophy" style="color: #f1c40f;"></i>'
        : '<i class="fas fa-list-check" style="color: var(--primary-green);"></i>';

    $resultTitle.textContent = completo
        ? 'Lista completa!'
        : 'Fim da rodada!';

    $resultText.innerHTML = `
        Você acertou <strong>${acertos}</strong> de <strong>${total}</strong> itens.<br>
        Pontos nesta rodada: <strong>+${pontos}</strong>
    `;

    $resultOverlay.classList.add('active');
}

export function fecharResultado() {
    $resultOverlay.classList.remove('active');
}
