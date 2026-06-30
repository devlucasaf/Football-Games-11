import estado from "./core.js";

// --- RENDERIZAR CARDS ---
export function renderizarCards() {
    const cards = document.querySelectorAll(".companheiro-card");
    const companheiros = estado.rodadaAtual.companheiros;

    cards.forEach((card, idx) => {
        const nomeEl = card.querySelector(".card-nome");
        nomeEl.textContent = companheiros[idx] || "";
        card.classList.remove("revelado");
        card.classList.add("oculto");
    });

    revelarCompanheiro(0);
}

// --- REVELAR COMPANHEIRO POR ÍNDICE ---
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

// --- REVELAR PRÓXIMO COMPANHEIRO ---
export function revelarProximo() {
    if (estado.companheirosRevelados >= 5) {
        return false;
    }

    revelarCompanheiro(estado.companheirosRevelados);
    return true;
}

// --- MOSTRAR RESPOSTA ---
export function mostrarResposta(acertou) {
    const cardResposta = document.getElementById("respostaCard");
    const nomeEl = document.getElementById("respostaNome");
    const iconeEl = document.getElementById("respostaIcone");

    nomeEl.textContent = estado.rodadaAtual.resposta;
    iconeEl.className = acertou ? "fas fa-trophy resposta-icone" : "fas fa-times-circle resposta-icone";
    cardResposta.classList.remove("revelado", "errado");
    cardResposta.classList.add(acertou ? "revelado" : "errado");
}

// --- RESETAR CARD DE RESPOSTA ---
export function resetarRespostaCard() {
    const cardResposta = document.getElementById("respostaCard");
    const nomeEl = document.getElementById("respostaNome");
    const iconeEl = document.getElementById("respostaIcone");

    nomeEl.textContent = "???";
    iconeEl.className = "fas fa-question resposta-icone";
    cardResposta.classList.remove("revelado", "errado");
}

// --- MOSTRAR DICA ---
export function mostrarDica() {
    const container = document.getElementById("dicaContainer");
    const texto = document.getElementById("dicaTexto");

    if (estado.rodadaAtual.dica) {
        texto.textContent = estado.rodadaAtual.dica;
        container.style.display = "";
    }
}

// --- ESCONDER DICA ---
export function esconderDica() {
    document.getElementById("dicaContainer").style.display = "none";
}

// --- ATUALIZAR PLACAR ---
export function atualizarPlacar() {
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("rodadasCount").textContent = estado.totalRodadas;
    document.getElementById("sequenciaCount").textContent = estado.sequencia;
    document.getElementById("pontosCount").textContent = estado.pontos;
}

// --- MOSTRAR RESULTADO ---
export function mostrarResultado(titulo, texto, icone) {
    document.getElementById("resultTitle").textContent = titulo;
    document.getElementById("resultText").textContent = texto;
    document.getElementById("resultIcon").innerHTML = icone;
    document.getElementById("resultOverlay").classList.add("active");
}

// --- ESCONDER RESULTADO ---
export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

// --- LIMPAR INPUT ---
export function limparInput() {
    const input = document.getElementById("palpiteInput");
    input.value = "";
    esconderSugestoes();
}

// --- FOCAR INPUT ---
export function focarInput() {
    document.getElementById("palpiteInput").focus();
}

// --- DESABILITAR INPUT ---
export function desabilitarInput() {
    document.getElementById("palpiteInput").disabled = true;
    document.getElementById("confirmarBtn").disabled = true;
    document.getElementById("pularBtn").disabled = true;
}

// --- HABILITAR INPUT ---
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

// --- ESCONDER SUGESTÕES ---
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
