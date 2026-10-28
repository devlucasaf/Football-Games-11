import estado from "./core.js";

// --- PREENCHER VALORES DAS PISTAS ---
export function preencherPistas() {
    const jogadorAtual = estado.jogadorAtual;
    if (!jogadorAtual) {
        return;
    }

    document.getElementById("pistaVal0").textContent = jogadorAtual.posicao;
    document.getElementById("pistaVal1").textContent = jogadorAtual.pais;
    document.getElementById("pistaBandeira").textContent = jogadorAtual.bandeira;
    document.getElementById("pistaVal2").textContent = `${jogadorAtual.idade} anos`;
    document.getElementById("pistaVal3").textContent = jogadorAtual.principalClube;
    document.getElementById("pistaVal4").textContent = jogadorAtual.titulos.slice(0, 3).join(", ");
    document.getElementById("pistaVal5").textContent = jogadorAtual.curiosidade;
}

// --- RESETAR CARDS ---
export function reiniciarCartoesPistas() {
    const cartoesPistas = document.querySelectorAll(".pista-card");
    cartoesPistas.forEach((cartaoPista, indicePista) => {
        if (indicePista === 0) {
            cartaoPista.classList.remove("oculto");
            cartaoPista.classList.add("revelado");
        } else {
            cartaoPista.classList.add("oculto");
            cartaoPista.classList.remove("revelado");

            const iconeFrente = cartaoPista.querySelector(".pista-frente i");
            iconeFrente.className = "fas fa-lock";
        }
    });
}

// --- REVELAR UM CARD ---
export function revelarCartaoPista(indicePista) {
    const cartoesPistas = document.querySelectorAll(".pista-card");
    if (indicePista < 0 || indicePista >= cartoesPistas.length) {
        return false;
    }

    const cartaoPista = cartoesPistas[indicePista];
    if (!cartaoPista.classList.contains("oculto")) {
        return false;
    }

    cartaoPista.classList.remove("oculto");
    cartaoPista.classList.add("revelado");
    estado.pistasReveladas++;
    atualizarContador();
    return true;
}

// --- REVELAR TODOS ---
export function revelarTodos() {
    const cartoesPistas = document.querySelectorAll(".pista-card");
    cartoesPistas.forEach(cartaoPista => {
        cartaoPista.classList.remove("oculto");
        cartaoPista.classList.add("revelado");
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
    const mensagemErroPalpite = document.getElementById("feedbackErro");
    document.getElementById("feedbackTexto").textContent = texto;
    mensagemErroPalpite.style.display = "";
    mensagemErroPalpite.style.animation = "none";
    mensagemErroPalpite.offsetHeight;
    mensagemErroPalpite.style.animation = "";

    setTimeout(() => { mensagemErroPalpite.style.display = "none"; }, 3000);
}

// --- ESCONDER FEEDBACK ERRO ---
export function esconderFeedbackErro() {
    document.getElementById("feedbackErro").style.display = "none";
}

// --- INPUT ---
export function limparCampoPalpite() {
    document.getElementById("palpiteInput").value = "";
    esconderSugestoes();
}

// --- FOCAR INPUT ---
export function focarCampoPalpite() {
    document.getElementById("palpiteInput").focus();
}

// --- HABILITAR/DESABILITAR INPUT ---
export function desabilitarCampoPalpite() {
    document.getElementById("palpiteInput").disabled = true;
    document.getElementById("btnConfirmarPalpite").disabled = true;
}

// --- HABILITAR INPUT ---
export function habilitarCampoPalpite() {
    document.getElementById("palpiteInput").disabled = false;
    document.getElementById("btnConfirmarPalpite").disabled = false;
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
        const itemSugestao = document.createElement("div");
        itemSugestao.className = "sugestao-item";
        itemSugestao.textContent = nome;
        lista.appendChild(itemSugestao);
    });

    lista.classList.add("ativa");
}

// --- ESCONDER SUGESTÕES ---
export function esconderSugestoes() {
    const lista = document.getElementById("sugestoesLista");
    lista.innerHTML = "";
    lista.classList.remove("ativa");
}
