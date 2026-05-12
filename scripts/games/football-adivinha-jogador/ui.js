import estado from "./core.js";

// --- PREENCHER VALORES DAS PISTAS ---
export function preencherPistas() {
    const j = estado.jogadorAtual;
    if (!j) {
        return;
    }

    document.getElementById("pistaVal0").textContent = j.posicao;
    document.getElementById("pistaVal1").textContent = j.pais;
    document.getElementById("pistaBandeira").textContent = j.bandeira;
    document.getElementById("pistaVal2").textContent = `${j.idade} anos`;
    document.getElementById("pistaVal3").textContent = j.principalClube;
    document.getElementById("pistaVal4").textContent = j.titulos.slice(0, 3).join(", ");
    document.getElementById("pistaVal5").textContent = j.curiosidade;
}

// --- RESETAR CARDS ---
export function resetarCards() {
    const cards = document.querySelectorAll(".pista-card");
    cards.forEach((card, idx) => {
        if (idx === 0) {
            card.classList.remove("oculto");
            card.classList.add("revelado");
        } else {
            card.classList.add("oculto");
            card.classList.remove("revelado");

            const iconeFrente = card.querySelector(".pista-frente i");
            iconeFrente.className = "fas fa-lock";
        }
    });
}

// --- REVELAR UM CARD ---
export function revelarCard(idx) {
    const cards = document.querySelectorAll(".pista-card");
    if (idx < 0 || idx >= cards.length) {
        return false;
    }

    const card = cards[idx];
    if (!card.classList.contains("oculto")) {
        return false;
    }

    card.classList.remove("oculto");
    card.classList.add("revelado");
    estado.pistasReveladas++;
    atualizarContador();
    return true;
}

// --- REVELAR TODOS ---
export function revelarTodos() {
    const cards = document.querySelectorAll(".pista-card");
    cards.forEach(card => {
        card.classList.remove("oculto");
        card.classList.add("revelado");
    });
    estado.pistasReveladas = 6;
    atualizarContador();
}

// --- ATUALIZAR CONTADOR DE PISTAS ---
export function atualizarContador() {
    document.getElementById("pistasReveladas").textContent = estado.pistasReveladas;
}

// --- ATUALIZAR PLACAR ---
export function atualizarPlacar() {
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("rodadasCount").textContent = estado.totalRodadas;
    document.getElementById("sequenciaCount").textContent = estado.sequencia;
    document.getElementById("pontosCount").textContent = estado.pontos;
}

// --- RESULTADO ---
export function mostrarResultado(titulo, texto, icone) {
    document.getElementById("resultTitle").textContent = titulo;
    document.getElementById("resultText").textContent = texto;
    document.getElementById("resultIcon").innerHTML = icone;
    document.getElementById("resultOverlay").classList.add("active");
}

export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

// --- FEEDBACK ERRO ---
export function mostrarFeedbackErro(texto) {
    const el = document.getElementById("feedbackErro");
    document.getElementById("feedbackTexto").textContent = texto;
    el.style.display = "";
    el.style.animation = "none";
    el.offsetHeight; 
    el.style.animation = "";

    setTimeout(() => { el.style.display = "none"; }, 3000);
}

export function esconderFeedbackErro() {
    document.getElementById("feedbackErro").style.display = "none";
}

// --- INPUT ---
export function limparInput() {
    document.getElementById("palpiteInput").value = "";
    esconderSugestoes();
}

export function focarInput() {
    document.getElementById("palpiteInput").focus();
}

export function desabilitarInput() {
    document.getElementById("palpiteInput").disabled = true;
    document.getElementById("confirmarBtn").disabled = true;
}

export function habilitarInput() {
    document.getElementById("palpiteInput").disabled = false;
    document.getElementById("confirmarBtn").disabled = false;
}

// --- SUGESTÕES ---
export function mostrarSugestoes(sugestoes) {
    const lista = document.getElementById("sugestoesLista");
    lista.innerHTML = "";

    if (sugestoes.length === 0) {
        lista.classList.remove("ativa");
        return;
    }

    sugestoes.slice(0, 6).forEach(nome => {
        const div = document.createElement("div");
        div.className = "sugestao-item";
        div.textContent = nome;
        lista.appendChild(div);
    });

    lista.classList.add("ativa");
}

export function esconderSugestoes() {
    const lista = document.getElementById("sugestoesLista");
    lista.innerHTML = "";
    lista.classList.remove("ativa");
}
