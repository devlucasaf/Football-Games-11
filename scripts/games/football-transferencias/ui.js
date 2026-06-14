import { estado } from "./core.js";

function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- RENDERIZA A LINHA DO TEMPO COM OS CLUBES DO JOGADOR ATUAL ---
export function renderizarClubes() {
    const timeline = document.getElementById("clubsTimeline");
    timeline.innerHTML = "";

    if (!estado.jogadorAtual) {
        return;
    }

    const clubes = estado.jogadorAtual.clubes;

    for (let i = 0; i < clubes.length; i++) {
        const div = document.createElement("div");

        if (i < estado.clubesRevelados) {
            div.className = "club-item";
            div.innerHTML = `
                <span class="club-number">${i + 1}</span>
                <span class="club-name">${clubes[i].clube}</span>
                <span class="club-period">${clubes[i].periodo}</span>
            `;
        } else {
            div.className = "club-item hidden-club";
            div.innerHTML = `
                <span class="club-number">${i + 1}</span>
                <span class="club-name">???</span>
                <span class="club-period">-</span>
            `;
        }
        timeline.appendChild(div);
    }

    const btnReveal = document.getElementById("btnReveal");
    if (estado.clubesRevelados >= clubes.length) {
        btnReveal.disabled = true;
        btnReveal.innerHTML = "<i class='fas fa-eye-slash'></i> Todos revelados";
    } else {
        btnReveal.disabled = false;
        btnReveal.innerHTML = "<i class='fas fa-eye'></i> Revelar próximo clube";
    }
}

// --- ATUALIZA AS INFORMAÇÕES EXIBIDAS NA TELA ---
export function atualizarInfo() {
    document.getElementById("pontuacao").textContent = estado.pontuacao;
    document.getElementById("rodadaAtual").textContent = estado.rodada;
}

// --- MOSTRA O FEEDBACK DE ACERTO OU ERRO DO PALPITE ---
export function mostrarFeedback(acertou, pontosGanhos) {
    const feedback  = document.getElementById("feedback");
    const icon      = document.getElementById("feedbackIcon");
    const text      = document.getElementById("feedbackText");
    const answer    = document.getElementById("feedbackAnswer");

    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    feedback.classList.remove("hidden");

    if (acertou) {
        icon.innerHTML = "<i class='fas fa-check-circle'></i>";
        icon.className = "feedback-icon correct";
        text.innerHTML = `Acertou! <span class="points-earned">+${pontosGanhos} pts</span>`;
        answer.classList.add("hidden");
    } else {
        icon.innerHTML = "<i class='fas fa-times-circle'></i>";
        icon.className = "feedback-icon wrong";
        text.textContent = "Errou!";
        answer.textContent = `Era: ${estado.jogadorAtual.nome}`;
        answer.classList.remove("hidden");
    }

    const btnNext = document.getElementById("btnNext");
    if (estado.rodada >= estado.totalRodadas) {
        btnNext.innerHTML = "<i class='fas fa-trophy'></i> Ver Resultado";
    } else {
        btnNext.innerHTML = "<i class='fas fa-arrow-right'></i> Próxima Rodada";
    }
}

// --- EXIBE A TELA DE RESULTADO FINAL DO JOGO ---
export function mostrarResultadoFinal() {
    document.getElementById("clubsArea").classList.add("hidden");
    document.getElementById("guessArea").classList.add("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("gameInfo").classList.add("hidden");

    const final = document.getElementById("finalResult");
    final.classList.remove("hidden");
    document.getElementById("finalPoints").textContent = estado.pontuacao;

    const maxPontos = estado.totalRodadas * 10;
    const detailsDiv = document.getElementById("finalDetails");
    const porcentagem = Math.round((estado.pontuacao / maxPontos) * 100);
    
    let msg = "";

    if (porcentagem >= 80) {
        msg = "Excelente! Você é um expert em transferências!";
    } else if (porcentagem >= 50) {
        msg = "Bom trabalho! Conhece bem o mercado!";
    } else if (porcentagem >= 20) {
        msg = "Pode melhorar! Tente de novo!";
    } else {
        msg = "Difícil, né? Jogue novamente para aprender!";
    }

    detailsDiv.innerHTML = `
        <div class="detail-item">${msg}</div>
        <div class="detail-item">Pontuação máxima possível: ${maxPontos} pts</div>
    `;
}

// --- RESETA A INTERFACE VISUAL PARA UMA NOVA RODADA ---
export function resetarVisual() {
    document.getElementById("clubsArea").classList.remove("hidden");
    document.getElementById("guessArea").classList.remove("hidden");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("finalResult").classList.add("hidden");
    document.getElementById("gameInfo").classList.remove("hidden");
    document.getElementById("guessInput").value = "";
    document.getElementById("autocompleteList").classList.remove("active");
}

// --- CONFIGURA O SISTEMA DE AUTOCOMPLETAR PARA O CAMPO DE ENTRADA ---
export function configurarAutocomplete(nomes, onSelect) {
    const input = document.getElementById("guessInput");
    const list = document.getElementById("autocompleteList");
    let highlightIndex = -1;

    input.addEventListener("input", () => {
        const val = normalizar(input.value.trim());
        list.innerHTML = "";
        highlightIndex = -1;

        if (val.length < 2) {
            list.classList.remove("active");
            return;
        }

        const filtrados = nomes.filter(n => normalizar(n).includes(val)).slice(0, 6);

        if (filtrados.length === 0) {
            list.classList.remove("active");
            return;
        }

        filtrados.forEach(nome => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = nome;
            div.addEventListener("click", () => {
                input.value = nome;
                list.classList.remove("active");
                onSelect(nome);
            });
            list.appendChild(div);
        });
        list.classList.add("active");
    });

    input.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll(".autocomplete-item");
        if (!items.length && e.key !== "Enter") {
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
            items.forEach((it, i) => it.classList.toggle("highlighted", i === highlightIndex));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex = Math.max(highlightIndex - 1, 0);
            items.forEach((it, i) => it.classList.toggle("highlighted", i === highlightIndex));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0 && items[highlightIndex]) {
                items[highlightIndex].click();
            } else if (input.value.trim()) {
                onSelect(input.value.trim());
            }
        } else if (e.key === "Escape") {
            list.classList.remove("active");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            list.classList.remove("active");
        }
    });
}
