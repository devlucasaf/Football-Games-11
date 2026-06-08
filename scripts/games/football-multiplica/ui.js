import { estado } from './core.js';
import { nomeTipo } from './data.js';

const els = {
    desafioTema:            document.getElementById('desafioTema'),
    metaValor:              document.getElementById('metaValor'),
    rodadaAtual:            document.getElementById('rodadaAtual'),
    rodadaTotal:            document.getElementById('rodadaTotal'),
    totalAcumulado:         document.getElementById('totalAcumulado'),
    progressFill:           document.getElementById('progressFill'),
    progressLabel:          document.getElementById('progressLabel'),
    jogadorNome:            document.getElementById('jogadorNome'),
    jogadorStats:           document.getElementById('jogadorStats'),
    valorLabel:             document.getElementById('valorLabel'),
    valorNumero:            document.getElementById('valorNumero'),
    jogadorCard:            document.getElementById('jogadorCard'),
    multiplicadoresGrid:    document.getElementById('multiplicadoresGrid'),
    multiplicacaoResultado: document.getElementById('multiplicacaoResultado'),
    resultadoCalculo:       document.getElementById('resultadoCalculo'),
    finalResult:            document.getElementById('finalResult'),
    resultIcon:             document.getElementById('resultIcon'),
    resultTitle:            document.getElementById('resultTitle'),
    resultText:             document.getElementById('resultText'),
    resultDetails:          document.getElementById('resultDetails'),
    gameInfo:               document.getElementById('gameInfo'),
    btnPular:               document.getElementById('btnPular'),
    pulosRestantes:         document.getElementById('pulosRestantes'),
    pulosInfo:              document.getElementById('pulosInfo'),
    skipSection:            document.getElementById('skipSection')
};

// --- FORMATAR NÚMERO ---
function formatarNumero(n) {
    return n.toLocaleString('pt-BR');
}

// --- EXIBIR DESAFIO ---
export function exibirDesafio() {
    const d = estado.desafioAtual;

    els.desafioTema.textContent = d.tema;
    els.metaValor.textContent = formatarNumero(d.meta);
    els.rodadaTotal.textContent = d.rodadas;

    atualizarProgresso();
}

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    els.rodadaAtual.textContent = estado.rodadaAtual + 1;
    els.totalAcumulado.textContent = formatarNumero(estado.totalAcumulado);
    atualizarProgresso();
}

// --- ATUALIZAR PROGRESSO ---
function atualizarProgresso() {
    const meta = estado.desafioAtual.meta;
    const pct = Math.min((estado.totalAcumulado / meta) * 100, 100);
    els.progressFill.style.width = `${pct}%`;
    els.progressLabel.textContent = `${Math.round(pct)}%`;

    if (pct >= 100) {
        els.progressFill.classList.add('meta-atingida');
    } else {
        els.progressFill.classList.remove('meta-atingida');
    }
}

// --- EXIBIR JOGADOR ---
export function exibirJogador(jogador, valorTipo) {
    els.jogadorNome.textContent = jogador.nome;

    const tipo = estado.desafioAtual.tipo;
    const tipoNome = nomeTipo(tipo);

    const statsMap = [
        { chave: 'gols',            icone: 'fa-futbol',         label: 'Gols'       },
        { chave: 'assistencias',    icone: 'fa-hands-helping',  label: 'Assist.'    },
        { chave: 'copas',           icone: 'fa-trophy',         label: 'Copas'      },
        { chave: 'champions',       icone: 'fa-star',           label: 'UCL'        },
        { chave: 'libertadores',    icone: 'fa-award',          label: 'Liberta.'   },
        { chave: 'bolasDeOuro',     icone: 'fa-medal',          label: 'B. Ouro'    },
        { chave: 'brasileirao',     icone: 'fa-shield-alt',     label: 'BR'         },
        { chave: 'premierLeague',   icone: 'fa-shield-alt',     label: 'PL'         }
    ];

    els.jogadorStats.innerHTML = '';
    statsMap.forEach(s => {
        const val = jogador[s.chave] || 0;
        if (val > 0) {
            const destaque = s.chave === tipo ? ' destaque' : '';
            els.jogadorStats.innerHTML += `<span class="stat-badge${destaque}"><i class="fas ${s.icone}"></i> ${s.label}: ${formatarNumero(val)}</span>`;
        }
    });

    els.valorLabel.textContent = `${tipoNome}:`;
    els.valorNumero.textContent = formatarNumero(valorTipo);

    els.jogadorCard.classList.remove('hidden');
    els.multiplicacaoResultado.classList.add('hidden');
    els.skipSection.classList.remove('hidden');
    atualizarPulos();
    els.multiplicadoresGrid.classList.remove('hidden');
}

// --- RENDERIZAR MULTIPLICADORES ---
export function renderizarMultiplicadores(onSelect) {
    els.multiplicadoresGrid.innerHTML = '';
    estado.multiplicadores.forEach((mult, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-multiplicador';

        const usado = estado.multiplicadoresUsados[idx];
        if (usado) {
            btn.classList.add('usado');
            btn.disabled = true;
            btn.innerHTML = `<span class="mult-valor">x${mult}</span><span class="mult-jogador">${usado}</span>`;
        } else {
            if (mult <= 10) {
                btn.classList.add('baixo');
            } else if (mult <= 75) {
                btn.classList.add('medio');
            } else {
                btn.classList.add('alto');
            }
            btn.textContent = `x${mult}`;
            btn.addEventListener('click', () => onSelect(idx, mult));
        }

        els.multiplicadoresGrid.appendChild(btn);
    });
}

// --- MOSTRAR RESULTADO DA MULTIPLICAÇÃO ---
export function mostrarResultadoMultiplicacao(valor, mult, resultado) {
    els.skipSection.classList.add('hidden');
    els.multiplicadoresGrid.classList.add('hidden');
    els.multiplicacaoResultado.classList.remove('hidden');

    els.resultadoCalculo.innerHTML = `
        ${formatarNumero(valor)} × ${mult} = <span class="resultado-valor">${formatarNumero(resultado)}</span>
        <br>Total acumulado: <strong>${formatarNumero(estado.totalAcumulado)}</strong>
    `;

    if (estado.rodadaAtual >= estado.desafioAtual.rodadas - 1) {
        document.getElementById('btnProximo').innerHTML = '<i class="fas fa-flag-checkered"></i> Ver Resultado';
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal(venceu) {
    els.jogadorCard.classList.add('hidden');
    els.gameInfo.classList.add('hidden');
    els.finalResult.classList.remove('hidden');

    const meta = estado.desafioAtual.meta;

    if (venceu) {
        els.resultIcon.innerHTML = '<i class="fas fa-trophy" style="color: #f1c40f;"></i>';
        els.resultTitle.textContent = 'Meta alcançada!';
        els.resultText.textContent = 'Parabéns, você atingiu o objetivo!';
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        els.resultIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
        els.resultTitle.textContent = 'Não foi dessa vez!';
        els.resultText.textContent = 'Você não alcançou a meta.';
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }   
    }

    els.resultDetails.innerHTML = `
        <p>Meta: ${formatarNumero(meta)}</p>
        <p>Seu total: ${formatarNumero(estado.totalAcumulado)}</p>
        <p>${venceu ? 'Superou em ' + formatarNumero(estado.totalAcumulado - meta) + '!' : 'Faltaram ' + formatarNumero(meta - estado.totalAcumulado)}</p>
    `;
}

// --- ATUALIZAR PULOS ---
export function atualizarPulos() {
    els.pulosRestantes.textContent = estado.pulosRestantes;
    els.pulosInfo.textContent = `${estado.pulosRestantes}/${estado.maxPulos}`;

    if (estado.pulosRestantes <= 0) {
        els.btnPular.disabled = true;
        els.btnPular.classList.add('disabled');
    } else {
        els.btnPular.disabled = false;
        els.btnPular.classList.remove('disabled');
    }
}

// --- RESETAR UI ---
export function resetarUI() {
    els.finalResult.classList.add('hidden');
    els.gameInfo.classList.remove('hidden');
    els.jogadorCard.classList.remove('hidden');
    els.totalAcumulado.textContent = '0';
    els.progressFill.style.width = '0%';
    els.progressFill.classList.remove('meta-atingida');
    els.progressLabel.textContent = '0%';
    atualizarPulos();
    document.getElementById('btnProximo').innerHTML = '<i class="fas fa-arrow-right"></i> Próximo';
}
