import { estado } from "./core.js";

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- RENDERIZA A LINHA DO TEMPO COM OS CLUBES DO JOGADOR ATUAL ---
export function renderizarClubes() {
    const linhaTempoClubes = document.getElementById("clubsTimeline");
    linhaTempoClubes.innerHTML = "";
    if (!estado.jogadorAtual) {
        return;
    }
    const clubes = estado.jogadorAtual.clubes;
    
    for (let indiceClube = 0; indiceClube < clubes.length; indiceClube++) {
        const elementoClube = document.createElement("div");
        if (indiceClube < estado.clubesRevelados) {
            elementoClube.className = "club-item";
            elementoClube.innerHTML = `<span class="club-number">${indiceClube + 1}</span><span class="club-name">${clubes[indiceClube].clube}</span><span class="club-period">${clubes[indiceClube].periodo}</span>`;
        } else {
            elementoClube.className = "club-item hidden-club";
            elementoClube.innerHTML = `<span class="club-number">${indiceClube + 1}</span><span class="club-name">???</span><span class="club-period">-</span>`;
        }
        linhaTempoClubes.appendChild(elementoClube);
    }
    const btnRevelarProximoClube = document.getElementById("btnReveal");
    btnRevelarProximoClube.disabled = estado.clubesRevelados >= clubes.length;
    btnRevelarProximoClube.innerHTML = btnRevelarProximoClube.disabled ? "<i class='fas fa-eye-slash'></i> Todos revelados" : "<i class='fas fa-eye'></i> Revelar próximo clube";
}

// --- ATUALIZA AS INFORMAÇÕES EXIBIDAS NA TELA ---
export function atualizarInformacoesRodada() {
    document.getElementById("pontuacao").textContent = estado.pontuacao;
    document.getElementById("rodadaAtual").textContent = estado.rodada;
}

// --- MOSTRA O FEEDBACK DE ACERTO OU ERRO DO PALPITE ---
export function mostrarRetornoPalpite(acertou, pontosGanhos) {
    const retornoPalpite = document.getElementById("feedback");
    const iconeRetornoPalpite = document.getElementById("feedbackIcon");
    const textoRetornoPalpite = document.getElementById("feedbackText");
    const respostaPalpite = document.getElementById("feedbackAnswer");
    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    retornoPalpite.classList.remove("hidden");
    if (acertou) {
        iconeRetornoPalpite.innerHTML = "<i class='fas fa-check-circle'></i>";
        iconeRetornoPalpite.className = "feedback-icon correct";
        textoRetornoPalpite.innerHTML = `Acertou! <span class="points-earned">+${pontosGanhos} pts</span>`;
        respostaPalpite.classList.add("hidden");
    } else {
        iconeRetornoPalpite.innerHTML = "<i class='fas fa-times-circle'></i>";
        iconeRetornoPalpite.className = "feedback-icon wrong";
        textoRetornoPalpite.textContent = "Errou!";
        respostaPalpite.textContent = `Era: ${estado.jogadorAtual.nome}`;
        respostaPalpite.classList.remove("hidden");
    }
    const btnProximaRodada = document.getElementById("btnNext");
    btnProximaRodada.innerHTML = estado.rodada >= estado.totalRodadas ? "<i class='fas fa-trophy'></i> Ver Resultado" : "<i class='fas fa-arrow-right'></i> Próxima Rodada";
}

// --- EXIBE A TELA DE RESULTADO FINAL DO JOGO ---
export function mostrarResultadoFinal() {
    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("gameInfo").classList.add("hidden");
    const resultadoFinal = document.getElementById("finalResult");
    resultadoFinal.classList.remove("hidden");
    document.getElementById("finalPoints").textContent = estado.pontuacao;
    const pontuacaoMaxima = estado.totalRodadas * 10;
    const detalhesResultado = document.getElementById("finalDetails");
    const porcentagem = Math.round((estado.pontuacao / pontuacaoMaxima) * 100);
    let mensagemResultado = "";
    if (porcentagem >= 80) {
        mensagemResultado = "Excelente! Você é um expert em transferências!";
    } else if (porcentagem >= 50) mensagemResultado = "Bom trabalho! Conhece bem o mercado!";
    else if (porcentagem >= 20) mensagemResultado = "Pode melhorar! Tente de novo!";
    else mensagemResultado = "Difícil, né? Jogue novamente para aprender!";
    if (porcentagem >= 50) {
        if (window.registrarVitoria) window.registrarVitoria();
    } else if (window.registrarDerrota) window.registrarDerrota();
    detalhesResultado.innerHTML = `<div class="detail-item">${mensagemResultado}</div><div class="detail-item">Pontuação máxima possível: ${pontuacaoMaxima} pts</div>`;
}

// --- RESETA A INTERFACE VISUAL PARA UMA NOVA RODADA ---
export function reiniciarInterfaceRodada() {
    document.getElementById("clubsArea").classList.remove("hidden");
    document.getElementById("guessArea").classList.remove("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("finalResult").classList.add("hidden");
    document.getElementById("gameInfo").classList.remove("hidden");
    document.getElementById("guessInput").value = "";
    document.getElementById("autocompleteList").classList.remove("active");
}

// --- CONFIGURA O SISTEMA DE AUTOCOMPLETAR PARA O CAMPO DE ENTRADA ---
export function configurarPreenchimentoAutomatico(nomes, aoSelecionarJogador) {
    const campoPalpite = document.getElementById("guessInput");
    const listaSugestoes = document.getElementById("autocompleteList");
    let indiceSugestaoDestacada = -1;
    campoPalpite.addEventListener("input", () => {
        const valorNormalizado = normalizarTexto(campoPalpite.value.trim());
        listaSugestoes.innerHTML = "";
        indiceSugestaoDestacada = -1;
        if (valorNormalizado.length < 2) {
            listaSugestoes.classList.remove("active");
            return;
        }
        const filtrados = nomes.filter(nomeJogador => normalizarTexto(nomeJogador).includes(valorNormalizado)).slice(0, 6);
        if (!filtrados.length) {
            listaSugestoes.classList.remove("active");
            return;
        }
        filtrados.forEach(nome => {
            const elementoSugestao = document.createElement("div");
            
            elementoSugestao.className = "autocomplete-item";
            elementoSugestao.textContent = nome;
            elementoSugestao.addEventListener("click", () => {
                campoPalpite.value = nome;
                listaSugestoes.classList.remove("active");
                aoSelecionarJogador(nome);
            });
            listaSugestoes.appendChild(elementoSugestao);
        });
        listaSugestoes.classList.add("active");
    });
    campoPalpite.addEventListener("keydown", eventoTeclado => {
        const itensSugestoes = listaSugestoes.querySelectorAll(".autocomplete-item");
        if (!itensSugestoes.length && eventoTeclado.key !== "Enter") return;
        if (eventoTeclado.key === "ArrowDown") {
            eventoTeclado.preventDefault();
            indiceSugestaoDestacada = Math.min(indiceSugestaoDestacada + 1, itensSugestoes.length - 1);
            itensSugestoes.forEach((itemSugestao, indiceSugestao) => itemSugestao.classList.toggle("highlighted", indiceSugestao === indiceSugestaoDestacada));
        } else if (eventoTeclado.key === "ArrowUp") {
            eventoTeclado.preventDefault();
            indiceSugestaoDestacada = Math.max(indiceSugestaoDestacada - 1, 0);
            itensSugestoes.forEach((itemSugestao, indiceSugestao) => itemSugestao.classList.toggle("highlighted", indiceSugestao === indiceSugestaoDestacada));
        } else if (eventoTeclado.key === "Enter") {
            eventoTeclado.preventDefault();
            if (indiceSugestaoDestacada >= 0 && itensSugestoes[indiceSugestaoDestacada]) {
                itensSugestoes[indiceSugestaoDestacada].click();
            } else if (campoPalpite.value.trim()) {
                aoSelecionarJogador(campoPalpite.value.trim());
            }
        } else if (eventoTeclado.key === "Escape") {
            listaSugestoes.classList.remove("active");
        }
    });

    document.addEventListener("click", eventoClique => {
        if (!eventoClique.target.closest(".input-wrapper")) {
            listaSugestoes.classList.remove("active");
        }
    });
}
