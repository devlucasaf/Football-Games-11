import { estado } from "./core.js";

const elementosJogo = {
    temaSelection:  document.getElementById("temaSelection"),
    temaGrid:       document.getElementById("temaGrid"),
    quizGame:       document.getElementById("quizGame"),
    quizInfo:       document.getElementById("quizInfo"),
    quizTemaBadge:  document.getElementById("quizTemaBadge"),
    perguntaAtual:  document.getElementById("perguntaAtual"),
    perguntaTotal:  document.getElementById("perguntaTotal"),
    acertosCount:   document.getElementById("acertosCount"),
    progressFill:   document.getElementById("progressFill"),
    progressLabel:  document.getElementById("progressLabel"),
    perguntaCard:   document.getElementById("perguntaCard"),
    perguntaTexto:  document.getElementById("perguntaTexto"),
    opcoesList:     document.getElementById("opcoesList"),
    btnProxima:     document.getElementById("btnProxima"),
    quizFinal:      document.getElementById("quizFinal"),
    resultIcon:     document.getElementById("resultIcon"),
    resultTitle:    document.getElementById("resultTitle"),
    resultText:     document.getElementById("resultText"),
    resultScore:    document.getElementById("resultScore")
};

const LETRAS = ["A", "B", "C", "D", "E"];

// --- RENDERIZAR TEMAS ---
export function renderizarTemas(aoSelecionarTema) {
    elementosJogo.temaGrid.innerHTML = "";
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
        elementosJogo.temaGrid.appendChild(btnSelecionarTema);
    });
}

// --- MOSTRAR QUIZ ---
export function mostrarQuiz() {
    elementosJogo.temaSelection.classList.add("hidden");
    elementosJogo.quizGame.classList.remove("hidden");
    elementosJogo.quizFinal.classList.add("hidden");

    elementosJogo.quizTemaBadge.innerHTML = `<img class="tema-icone-badge" src="${estado.temaAtual.icone}" alt="${estado.temaAtual.nome}"/> ${estado.temaAtual.nome}`;
    elementosJogo.quizTemaBadge.style.background = estado.temaAtual.cor;
    elementosJogo.perguntaTotal.textContent = estado.totalPerguntas;
}

// --- ATUALIZAR INFORMAÇÕES ---
export function atualizarInformacoesPerguntas() {
    elementosJogo.perguntaAtual.textContent = estado.perguntaAtual + 1;
    elementosJogo.acertosCount.textContent = estado.acertos;

    const porcentagemProgresso = ((estado.perguntaAtual) / estado.totalPerguntas) * 100;
    elementosJogo.progressFill.style.width = `${porcentagemProgresso}%`;
    elementosJogo.progressLabel.textContent = `${Math.round(porcentagemProgresso)}%`;
}

// --- EXIBIR PERGUNTA ---
export function exibirPergunta(pergunta, aoResponderPergunta) {
    elementosJogo.perguntaTexto.textContent = pergunta.pergunta;
    elementosJogo.opcoesList.innerHTML = "";
    elementosJogo.btnProxima.classList.add("hidden");

    pergunta.opcoes.forEach((opcao, indiceOpcao) => {
        const btnSelecionarResposta = document.createElement("button");
        btnSelecionarResposta.className = "btn-opcao";
        btnSelecionarResposta.innerHTML = `<span class="opcao-letra">${LETRAS[indiceOpcao]}</span> ${opcao}`;
        btnSelecionarResposta.addEventListener("click", () => aoResponderPergunta(indiceOpcao));
        elementosJogo.opcoesList.appendChild(btnSelecionarResposta);
    });
}

// --- MOSTRAR RESPOSTA ---
export function mostrarResposta(indiceSelecionado, indiceCorreto) {
    const botoes = elementosJogo.opcoesList.querySelectorAll(".btn-opcao");

    botoes.forEach((btnSelecionarResposta, indiceOpcao) => {
        btnSelecionarResposta.classList.add("disabled");
        if (indiceOpcao === indiceCorreto) {
            btnSelecionarResposta.classList.add("correta");
        }
        
        if (indiceOpcao === indiceSelecionado && indiceSelecionado !== indiceCorreto) {
            btnSelecionarResposta.classList.add("errada");
        }
    });

    elementosJogo.btnProxima.classList.remove("hidden");

    if (estado.perguntaAtual >= estado.totalPerguntas - 1) {
        elementosJogo.btnProxima.innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    } else {
        elementosJogo.btnProxima.innerHTML = "<i class='fas fa-arrow-right'></i> Próxima";
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    elementosJogo.quizGame.classList.add("hidden");
    elementosJogo.quizFinal.classList.remove("hidden");

    const acertos = estado.acertos;
    const total = estado.totalPerguntas;
    const porcentagemAcertos = (acertos / total) * 100;

    elementosJogo.resultScore.textContent = `${acertos}/${total}`;

    if (porcentagemAcertos >= 80) {
        elementosJogo.resultIcon.innerHTML = "<i class='fas fa-trophy' style='color: #f1c40f;'></i>";
        elementosJogo.resultTitle.textContent = "Excelente!";
        elementosJogo.resultText.textContent = "Você é um verdadeiro craque do conhecimento!";
    } else if (porcentagemAcertos >= 50) {
        elementosJogo.resultIcon.innerHTML = "<i class='fas fa-thumbs-up' style='color: #3498db;'></i>";
        elementosJogo.resultTitle.textContent = "Bom trabalho!";
        elementosJogo.resultText.textContent = "Você manda bem, mas pode melhorar!";
    } else {
        elementosJogo.resultIcon.innerHTML = "<i class='fas fa-times-circle' style='color: #e74c3c;'></i>";
        elementosJogo.resultTitle.textContent = "Tente novamente!";
        elementosJogo.resultText.textContent = "Estude mais sobre o tema e volte para tentar de novo.";
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
    elementosJogo.temaSelection.classList.remove("hidden");
    elementosJogo.quizGame.classList.add("hidden");
    elementosJogo.quizFinal.classList.add("hidden");
}

// --- RESETAR UI ---
export function reiniciarInterfacePerguntas() {
    elementosJogo.progressFill.style.width = "0%";
    elementosJogo.progressLabel.textContent = "0%";
    elementosJogo.acertosCount.textContent = "0";
    elementosJogo.btnProxima.classList.add("hidden");
    elementosJogo.btnProxima.innerHTML = "<i class='fas fa-arrow-right'></i> Próxima";
}
