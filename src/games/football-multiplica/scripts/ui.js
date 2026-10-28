import { estado } from "./core.js";
import { nomeTipo } from "./data.js";

const elementosMultiplicacao = {
    desafioTema:            document.getElementById("desafioTema"),
    metaValor:              document.getElementById("metaValor"),
    rodadaAtual:            document.getElementById("rodadaAtual"),
    rodadaTotal:            document.getElementById("rodadaTotal"),
    totalAcumulado:         document.getElementById("totalAcumulado"),
    preenchimentoProgresso:           document.getElementById("progressFill"),
    rotuloProgresso:          document.getElementById("progressLabel"),
    jogadorNome:            document.getElementById("jogadorNome"),
    estatisticasJogador:           document.getElementById("jogadorStats"),
    rotuloValor:             document.getElementById("valorLabel"),
    valorNumero:            document.getElementById("valorNumero"),
    cartaoJogador:            document.getElementById("jogadorCard"),
    gradeMultiplicadores:    document.getElementById("multiplicadoresGrid"),
    multiplicacaoResultado: document.getElementById("multiplicacaoResultado"),
    resultadoCalculo:       document.getElementById("resultadoCalculo"),
    resultadoFinal:            document.getElementById("finalResult"),
    iconeResultado:             document.getElementById("resultIcon"),
    tituloResultado:            document.getElementById("resultTitle"),
    textoResultado:             document.getElementById("resultText"),
    detalhesResultado:          document.getElementById("resultDetails"),
    informacoesJogo:               document.getElementById("gameInfo"),
    btnPularJogador:               document.getElementById("btnPularJogador"),
    pulosRestantes:         document.getElementById("pulosRestantes"),
    informacoesPulos:              document.getElementById("pulosInfo"),
    secaoPularJogador:            document.getElementById("skipSection")
};

// --- FORMATAR NÚMERO ---
function formatarNumero(numero) {
    return numero.toLocaleString("pt-BR");
}

// --- EXIBIR DESAFIO ---
export function exibirDesafio() {
    const desafio = estado.desafioAtual;

    elementosMultiplicacao.desafioTema.textContent = desafio.tema;
    elementosMultiplicacao.metaValor.textContent = formatarNumero(desafio.meta);
    elementosMultiplicacao.rodadaTotal.textContent = desafio.rodadas;

    atualizarProgresso();
}

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    elementosMultiplicacao.rodadaAtual.textContent = estado.rodadaAtual + 1;
    elementosMultiplicacao.totalAcumulado.textContent = formatarNumero(estado.totalAcumulado);
    atualizarProgresso();
}

// --- ATUALIZAR PROGRESSO ---
function atualizarProgresso() {
    const meta = estado.desafioAtual.meta;
    const percentualProgresso = Math.min((estado.totalAcumulado / meta) * 100, 100);
    elementosMultiplicacao.preenchimentoProgresso.style.width = `${percentualProgresso}%`;
    elementosMultiplicacao.rotuloProgresso.textContent = `${Math.round(percentualProgresso)}%`;

    if (percentualProgresso >= 100) {
        elementosMultiplicacao.preenchimentoProgresso.classList.add("meta-atingida");
    } else {
        elementosMultiplicacao.preenchimentoProgresso.classList.remove("meta-atingida");
    }
}

// --- EXIBIR JOGADOR ---
export function exibirJogador(jogador, valorTipo) {
    elementosMultiplicacao.jogadorNome.textContent = jogador.nome;

    const estatistica = estado.desafioAtual.estatistica || estado.desafioAtual.tipo;
    const tipoNome = nomeTipo(estatistica);

    const definicoesEstatisticas = [
        { chave: "gols",            icone: "fa-futbol",         label: "Gols"     },
        { chave: "titulos",         icone: "fa-trophy",         label: "Títulos"  },
        { chave: "assistencias",    icone: "fa-hands-helping",  label: "Assist."  },
        { chave: "copas",           icone: "fa-trophy",         label: "Copas"    },
        { chave: "quantidadeCopas", icone: "fa-globe",          label: "Copas"    },
        { chave: "champions",       icone: "fa-star",           label: "UCL"      },
        { chave: "libertadores",    icone: "fa-award",          label: "Liberta." },
        { chave: "bolasDeOuro",     icone: "fa-medal",          label: "B. Ouro"  },
        { chave: "brasileirao",     icone: "fa-shield-alt",     label: "BR"       },
        { chave: "premierLeague",   icone: "fa-shield-alt",     label: "PL"       }
    ];

    elementosMultiplicacao.estatisticasJogador.innerHTML = "";
    definicoesEstatisticas.forEach(definicaoEstatistica => {
        const valorEstatistica = jogador[definicaoEstatistica.chave] || 0;
        if (valorEstatistica > 0 && definicaoEstatistica.chave === estatistica) {
            elementosMultiplicacao.estatisticasJogador.innerHTML += `<span class="stat-badge destaque"><i class="fas ${definicaoEstatistica.icone}"></i> ${definicaoEstatistica.label}: ${formatarNumero(valorEstatistica)}</span>`;
        }
    });

    elementosMultiplicacao.rotuloValor.textContent = `${tipoNome}:`;
    elementosMultiplicacao.valorNumero.textContent = formatarNumero(valorTipo);

    elementosMultiplicacao.cartaoJogador.classList.remove("hidden");
    elementosMultiplicacao.multiplicacaoResultado.classList.add("hidden");
    elementosMultiplicacao.secaoPularJogador.classList.remove("hidden");
    atualizarPulos();
    elementosMultiplicacao.gradeMultiplicadores.classList.remove("hidden");
}

// --- RENDERIZAR MULTIPLICADORES ---
export function renderizarMultiplicadores(aoSelecionarMultiplicador) {
    elementosMultiplicacao.gradeMultiplicadores.innerHTML = "";
    estado.multiplicadores.forEach((multiplicador, indiceMultiplicador) => {
        const btnSelecionarMultiplicador = document.createElement("button");
        btnSelecionarMultiplicador.className = "btn-multiplicador";

        const usado = estado.multiplicadoresUsados[indiceMultiplicador];
        if (usado) {
            btnSelecionarMultiplicador.classList.add("usado");
            btnSelecionarMultiplicador.disabled = true;
            btnSelecionarMultiplicador.innerHTML = `<span class="mult-valor">x${multiplicador}</span><span class="mult-jogador">${usado}</span>`;
        } else {
            if (multiplicador <= 10) {
                btnSelecionarMultiplicador.classList.add("baixo");
            } else if (multiplicador <= 75) {
                btnSelecionarMultiplicador.classList.add("medio");
            } else {
                btnSelecionarMultiplicador.classList.add("alto");
            }
            btnSelecionarMultiplicador.textContent = `x${multiplicador}`;
            btnSelecionarMultiplicador.addEventListener("click", () => aoSelecionarMultiplicador(indiceMultiplicador, multiplicador));
        }

        elementosMultiplicacao.gradeMultiplicadores.appendChild(btnSelecionarMultiplicador);
    });
}

// --- MOSTRAR RESULTADO DA MULTIPLICAÇÃO ---
export function mostrarResultadoMultiplicacao(valor, multiplicador, resultado) {
    elementosMultiplicacao.secaoPularJogador.classList.add("hidden");
    elementosMultiplicacao.gradeMultiplicadores.classList.add("hidden");
    elementosMultiplicacao.multiplicacaoResultado.classList.remove("hidden");

    elementosMultiplicacao.resultadoCalculo.innerHTML = `
        ${formatarNumero(valor)} × ${multiplicador} = <span class="resultado-valor">${formatarNumero(resultado)}</span>
        <br>Total acumulado: <strong>${formatarNumero(estado.totalAcumulado)}</strong>
    `;

    if (estado.rodadaAtual >= estado.desafioAtual.rodadas - 1) {
        document.getElementById("btnAvancarRodada").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal(venceu) {
    elementosMultiplicacao.cartaoJogador.classList.add("hidden");
    elementosMultiplicacao.informacoesJogo.classList.add("hidden");
    elementosMultiplicacao.resultadoFinal.classList.remove("hidden");

    const meta = estado.desafioAtual.meta;

    if (venceu) {
        elementosMultiplicacao.iconeResultado.innerHTML = "<i class='fas fa-trophy' style='color: #f1c40f;'></i>";
        elementosMultiplicacao.tituloResultado.textContent = "Meta alcançada!";
        elementosMultiplicacao.textoResultado.textContent = "Parabéns, você atingiu o objetivo!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        elementosMultiplicacao.iconeResultado.innerHTML = "<i class='fas fa-times-circle' style='color: #e74c3c;'></i>";
        elementosMultiplicacao.tituloResultado.textContent = "Não foi dessa vez!";
        elementosMultiplicacao.textoResultado.textContent = "Você não alcançou a meta.";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }   
    }

    elementosMultiplicacao.detalhesResultado.innerHTML = `
        <p>Meta: ${formatarNumero(meta)}</p>
        <p>Seu total: ${formatarNumero(estado.totalAcumulado)}</p>
        <p>${venceu ? "Superou em " + formatarNumero(estado.totalAcumulado - meta) + "!" : "Faltaram " + formatarNumero(meta - estado.totalAcumulado)}</p>
    `;
}

// --- ATUALIZAR PULOS ---
export function atualizarPulos() {
    elementosMultiplicacao.pulosRestantes.textContent = estado.pulosRestantes;
    elementosMultiplicacao.informacoesPulos.textContent = `${estado.pulosRestantes}/${estado.maximoPulos}`;

    if (estado.pulosRestantes <= 0) {
        elementosMultiplicacao.btnPularJogador.disabled = true;
        elementosMultiplicacao.btnPularJogador.classList.add("disabled");
    } else {
        elementosMultiplicacao.btnPularJogador.disabled = false;
        elementosMultiplicacao.btnPularJogador.classList.remove("disabled");
    }
}

// --- RESETAR UI ---
export function reiniciarInterface() {
    elementosMultiplicacao.resultadoFinal.classList.add("hidden");
    elementosMultiplicacao.informacoesJogo.classList.remove("hidden");
    elementosMultiplicacao.cartaoJogador.classList.remove("hidden");
    elementosMultiplicacao.totalAcumulado.textContent = "0";
    elementosMultiplicacao.preenchimentoProgresso.style.width = "0%";
    elementosMultiplicacao.preenchimentoProgresso.classList.remove("meta-atingida");
    elementosMultiplicacao.rotuloProgresso.textContent = "0%";
    atualizarPulos();
    document.getElementById("btnAvancarRodada").innerHTML = "<i class='fas fa-arrow-right'></i> Próximo";
}
