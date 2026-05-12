import estado from "./core.js";

export function renderizarCards() {
    const cards = document.querySelectorAll(".companheiro-card");
    const companheiros = estado.rodadaAtual.companheiros;

    cards.forEach((card, idx) => {
        const nomeEl = card.querySelector(".card-nome");
        nomeEl.textContent = companheiros[idx] || "";
        card.classList.remove("revelado");
        card.classList.add("oculto");
    });

    // --- REVELAR O PRIMEIRO COMPANHEIRO ---
    revelarCompanheiro(0);
}

export function revelarCompanheiro(idx) {
    const cards = document.querySelectorAll(".companheiro-card");
    if (idx < 0 || idx >= cards.length) {
        return;
    }

    const card = cards[idx];

    card.classList.remove("oculto");
    card.classList.add("revelado");
    estado.companheirosRevelados = idx + 1;
}

export function revelarProximo() {
    if (estado.companheirosRevelados >= 5) {
        return false;
    }
    revelarCompanheiro(estado.companheirosRevelados);
    return true;
}

export function mostrarResposta(acertou) {
    const cardResposta  = document.getElementById("respostaCard");
    const nomeEl        = document.getElementById("respostaNome");
    const iconeEl       = document.getElementById("respostaIcone");

    nomeEl.textContent = estado.rodadaAtual.resposta;
    iconeEl.className = acertou ? "fas fa-trophy resposta-icone" : "fas fa-times-circle resposta-icone";
    cardResposta.classList.remove("revelado", "errado");
    cardResposta.classList.add(acertou ? "revelado" : "errado");
}

export function resetarRespostaCard() {
    const cardResposta  = document.getElementById("respostaCard");
    const nomeEl        = document.getElementById("respostaNome");
    const iconeEl       = document.getElementById("respostaIcone");

    nomeEl.textContent = "???";
    iconeEl.className = "fas fa-question resposta-icone";
    cardResposta.classList.remove("revelado", "errado");
}

export function mostrarDica() {
    const container = document.getElementById("dicaContainer");
    const texto     = document.getElementById("dicaTexto");

    if (estado.rodadaAtual.dica) {
        texto.textContent = estado.rodadaAtual.dica;
        container.style.display = "";
    }
}

export function esconderDica() {
    document.getElementById("dicaContainer").style.display = "none";
}

export function atualizarPlacar() {
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("rodadasCount").textContent = estado.totalRodadas;
    document.getElementById("sequenciaCount").textContent = estado.sequencia;
    document.getElementById("pontosCount").textContent = estado.pontos;
}

export function mostrarResultado(titulo, texto, icone) {
    document.getElementById("resultTitle").textContent = titulo;
    document.getElementById("resultText").textContent = texto;
    document.getElementById("resultIcon").innerHTML = icone;
    document.getElementById("resultOverlay").classList.add("active");
}

export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

export function limparInput() {
    const input = document.getElementById("palpiteInput");
    input.value = "";
    esconderSugestoes();
}

export function focarInput() {
    document.getElementById("palpiteInput").focus();
}

export function desabilitarInput() {
    document.getElementById("palpiteInput").disabled = true;
    document.getElementById("confirmarBtn").disabled = true;
    document.getElementById("pularBtn").disabled = true;
}

export function habilitarInput() {
    document.getElementById("palpiteInput").disabled = false;
    document.getElementById("confirmarBtn").disabled = false;
    document.getElementById("pularBtn").disabled = false;
}

// --- SUGESTÕES / AUTOCOMPLETE ---
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

// --- REVELAR TODOS OS COMPANHEIROS RESTANTES ---
export function revelarTodos() {
    for (let i = estado.companheirosRevelados; i < 5; i++) {
        revelarCompanheiro(i);
    }
}
