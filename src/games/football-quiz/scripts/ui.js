import { estado } from "./core.js";

const elementosJogo = {
    selecaoTema:                document.getElementById("temaSelection"),
    gradeTemas:                 document.getElementById("temaGrid"),
    areaQuestionario:           document.getElementById("quizGame"),
    informacoesQuestionario:    document.getElementById("quizInfo"),
    indicadorTemaQuestionario:  document.getElementById("quizTemaBadge"),
    perguntaAtual:              document.getElementById("perguntaAtual"),
    perguntaTotal:              document.getElementById("perguntaTotal"),
    contadorAcertos:            document.getElementById("acertosCount"),
    preenchimentoProgresso:     document.getElementById("progressFill"),
    rotuloProgresso:            document.getElementById("progressLabel"),
    cartaoPergunta:             document.getElementById("perguntaCard"),
    perguntaTexto:              document.getElementById("perguntaTexto"),
    listaOpcoesResposta:        document.getElementById("opcoesList"),
    btnAvancarPergunta:         document.getElementById("btnAvancarPergunta"),
    resultadoFinalQuestionario: document.getElementById("quizFinal"),
    iconeResultadoFinal:        document.getElementById("resultIcon"),
    tituloResultadoFinal:       document.getElementById("resultTitle"),
    textoResultadoFinal:        document.getElementById("resultText"),
    pontuacaoResultadoFinal:    document.getElementById("resultScore")
};

const LETRAS = ["A", "B", "C", "D", "E"];

// --- RENDERIZAR TEMAS ---
export function renderizarTemas(aoSelecionarTema) {
    elementosJogo.gradeTemas.innerHTML = "";
    estado.temas.forEach(tema => {
        const btnSelecionarTema = document.createElement("button");
        
        btnSelecionarTema.className = "tema-card";
        btnSelecionarTema.style.borderColor = tema.cor;
        btnSelecionarTema.innerHTML = `
            <img 
                class="tema-icone" 
                src="${tema.icone}" 
                alt="${tema.nome}" 
                loading="lazy"
            />
            <span class="tema-nome">${tema.nome}</span>
        `;
        btnSelecionarTema.addEventListener("click", () => aoSelecionarTema(tema.id));
        elementosJogo.gradeTemas.appendChild(btnSelecionarTema);
    });
}

// --- MOSTRAR QUIZ ---
export function mostrarQuiz() {
    elementosJogo.selecaoTema.classList.add("hidden");
    elementosJogo.areaQuestionario.classList.remove("hidden");
    elementosJogo.resultadoFinalQuestionario.classList.add("hidden");

    elementosJogo.indicadorTemaQuestionario.innerHTML = `<img class="tema-icone-badge" src="${estado.temaAtual.icone}" alt="${estado.temaAtual.nome}"/> ${estado.temaAtual.nome}`;
    elementosJogo.indicadorTemaQuestionario.style.background = estado.temaAtual.cor;
    elementosJogo.perguntaTotal.textContent = estado.totalPerguntas;
}

// --- ATUALIZAR INFORMAÇÕES ---
export function atualizarInformacoesPerguntas() {
    elementosJogo.perguntaAtual.textContent = estado.perguntaAtual + 1;
    elementosJogo.contadorAcertos.textContent = estado.acertos;

    const porcentagemProgresso = ((estado.perguntaAtual) / estado.totalPerguntas) * 100;
    elementosJogo.preenchimentoProgresso.style.width = `${porcentagemProgresso}%`;
    elementosJogo.rotuloProgresso.textContent = `${Math.round(porcentagemProgresso)}%`;
}

// --- EXIBIR PERGUNTA ---
export function exibirPergunta(pergunta, aoResponderPergunta) {
    elementosJogo.perguntaTexto.textContent = pergunta.pergunta;
    elementosJogo.listaOpcoesResposta.innerHTML = "";
    elementosJogo.btnAvancarPergunta.classList.add("hidden");

    pergunta.opcoes.forEach((opcao, indiceOpcao) => {
        const btnSelecionarResposta = document.createElement("button");
        btnSelecionarResposta.className = "btn-opcao";
        btnSelecionarResposta.innerHTML = `<span class="opcao-letra">${LETRAS[indiceOpcao]}</span> ${opcao}`;
        btnSelecionarResposta.addEventListener("click", () => aoResponderPergunta(indiceOpcao));
        elementosJogo.listaOpcoesResposta.appendChild(btnSelecionarResposta);
    });
}

// --- MOSTRAR RESPOSTA ---
export function mostrarResposta(indiceSelecionado, indiceCorreto) {
    const botoes = elementosJogo.listaOpcoesResposta.querySelectorAll(".btn-opcao");

    botoes.forEach((btnSelecionarResposta, indiceOpcao) => {
        btnSelecionarResposta.classList.add("disabled");
        if (indiceOpcao === indiceCorreto) {
            btnSelecionarResposta.classList.add("correta");
        }
        
        if (indiceOpcao === indiceSelecionado && indiceSelecionado !== indiceCorreto) {
            btnSelecionarResposta.classList.add("errada");
        }
    });

    elementosJogo.btnAvancarPergunta.classList.remove("hidden");

    if (estado.perguntaAtual >= estado.totalPerguntas - 1) {
        elementosJogo.btnAvancarPergunta.innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    } else {
        elementosJogo.btnAvancarPergunta.innerHTML = "<i class='fas fa-arrow-right'></i> Próxima";
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    elementosJogo.areaQuestionario.classList.add("hidden");
    elementosJogo.resultadoFinalQuestionario.classList.remove("hidden");

    const acertos = estado.acertos;
    const total = estado.totalPerguntas;
    const porcentagemAcertos = (acertos / total) * 100;

    elementosJogo.pontuacaoResultadoFinal.textContent = `${acertos}/${total}`;

    if (porcentagemAcertos >= 80) {
        elementosJogo.iconeResultadoFinal.innerHTML = "<i class='fas fa-trophy' style='color: #f1c40f;'></i>";
        elementosJogo.tituloResultadoFinal.textContent = "Excelente!";
        elementosJogo.textoResultadoFinal.textContent = "Você é um verdadeiro craque do conhecimento!";
    } else if (porcentagemAcertos >= 50) {
        elementosJogo.iconeResultadoFinal.innerHTML = "<i class='fas fa-thumbs-up' style='color: #3498db;'></i>";
        elementosJogo.tituloResultadoFinal.textContent = "Bom trabalho!";
        elementosJogo.textoResultadoFinal.textContent = "Você manda bem, mas pode melhorar!";
    } else {
        elementosJogo.iconeResultadoFinal.innerHTML = "<i class='fas fa-times-circle' style='color: #e74c3c;'></i>";
        elementosJogo.tituloResultadoFinal.textContent = "Tente novamente!";
        elementosJogo.textoResultadoFinal.textContent = "Estude mais sobre o tema e volte para tentar de novo.";
    }

    if (porcentagemAcertos >= 50) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    if (window.FG11Stats) {
        const venceu = porcentagemAcertos >= 50;
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-quiz", {
            venceu,
            bucket: acertos,
            tamanho: total + 1
        });
        
        window.FG11Stats.mostrarModal("football-quiz", {
            venceu,
            titulo: venceu ? "Muito bem!" : "Fim do quiz!",
            resposta: `Você acertou ${acertos} de ${total}`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Acertos por partida",
            bucketAtual: acertos,
            onReiniciar: window.reiniciarQuestionario,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- MOSTRAR SELEÇÃO DE TEMA ---
export function mostrarSelecaoTema() {
    elementosJogo.selecaoTema.classList.remove("hidden");
    elementosJogo.areaQuestionario.classList.add("hidden");
    elementosJogo.resultadoFinalQuestionario.classList.add("hidden");
}

// --- RESETAR UI ---
export function reiniciarInterfacePerguntas() {
    elementosJogo.preenchimentoProgresso.style.width = "0%";
    elementosJogo.rotuloProgresso.textContent = "0%";
    elementosJogo.contadorAcertos.textContent = "0";
    elementosJogo.btnAvancarPergunta.classList.add("hidden");
    elementosJogo.btnAvancarPergunta.innerHTML = "<i class='fas fa-arrow-right'></i> Próxima";
}
