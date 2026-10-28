import estado from "./core.js";

// --- RENDERIZAR CARDS ---
export function renderizarCartoesCompanheiros() {
    const cartoesCompanheiros = document.querySelectorAll(".companheiro-card");
    const companheiros = estado.rodadaAtual.companheiros;

    cartoesCompanheiros.forEach((cartaoCompanheiro, indiceCompanheiro) => {
        const elementoNome = cartaoCompanheiro.querySelector(".card-nome");
        elementoNome.textContent = companheiros[indiceCompanheiro] || "";
        cartaoCompanheiro.classList.remove("revelado");
        cartaoCompanheiro.classList.add("oculto");
    });

    revelarCompanheiro(0);
}

// --- REVELAR COMPANHEIRO POR ÍNDICE ---
export function revelarCompanheiro(indiceCompanheiro) {
    const cartoesCompanheiros = document.querySelectorAll(".companheiro-card");
    if (indiceCompanheiro < 0 || indiceCompanheiro >= cartoesCompanheiros.length) {
        return;
    }

    const cartaoCompanheiro = cartoesCompanheiros[indiceCompanheiro];

    cartaoCompanheiro.classList.remove("oculto");
    cartaoCompanheiro.classList.add("revelado");
    estado.companheirosRevelados = indiceCompanheiro + 1;
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
    const cartaoResposta = document.getElementById("respostaCard");
    const elementoNome = document.getElementById("respostaNome");
    const elementoIcone = document.getElementById("respostaIcone");

    elementoNome.textContent = estado.rodadaAtual.resposta;
    elementoIcone.className = acertou ? "fas fa-trophy resposta-icone" : "fas fa-times-circle resposta-icone";
    cartaoResposta.classList.remove("revelado", "errado");
    cartaoResposta.classList.add(acertou ? "revelado" : "errado");
}

// --- RESETAR CARD DE RESPOSTA ---
export function reiniciarCartaoResposta() {
    const cartaoResposta = document.getElementById("respostaCard");
    const elementoNome = document.getElementById("respostaNome");
    const elementoIcone = document.getElementById("respostaIcone");

    elementoNome.textContent = "???";
    elementoIcone.className = "fas fa-question resposta-icone";
    cartaoResposta.classList.remove("revelado", "errado");
}

// --- MOSTRAR DICA ---
export function mostrarDica() {
    const recipienteDica = document.getElementById("dicaContainer");
    const texto = document.getElementById("dicaTexto");

    if (estado.rodadaAtual.dica) {
        texto.textContent = estado.rodadaAtual.dica;
        recipienteDica.style.display = "";
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
export function limparCampoPalpite() {
    const campoPalpite = document.getElementById("palpiteInput");
    campoPalpite.value = "";
    esconderSugestoes();
}

// --- FOCAR INPUT ---
export function focarCampoPalpite() {
    document.getElementById("palpiteInput").focus();
}

// --- DESABILITAR INPUT ---
export function desabilitarCampoPalpite() {
    document.getElementById("palpiteInput").disabled = true;
    document.getElementById("btnConfirmarPalpite").disabled = true;
    document.getElementById("btnRevelarProximaPista").disabled = true;
}

// --- HABILITAR INPUT ---
export function habilitarCampoPalpite() {
    document.getElementById("palpiteInput").disabled = false;
    document.getElementById("btnConfirmarPalpite").disabled = false;
    document.getElementById("btnRevelarProximaPista").disabled = false;
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
        const elementoSugestao = document.createElement("div");
        elementoSugestao.className = "sugestao-item";
        elementoSugestao.textContent = nome;
        lista.appendChild(elementoSugestao);
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
    for (let indiceCompanheiro = estado.companheirosRevelados; indiceCompanheiro < 5; indiceCompanheiro++) {
        revelarCompanheiro(indiceCompanheiro);
    }
}
