import estado from "./core.js";

// --- EXIBIÇÃO DA EXPLICAÇÃO/RESULTADO DA RODADA ---
export function mostrarExplicacao(acertou) {
    const sobreposicaoResultado = document.getElementById("resultOverlay");
    const iconeResultado = document.getElementById("resultIcon");
    const tituloResultado = document.getElementById("resultTitle");
    const textoResultado = document.getElementById("resultText");
    const nomeImpostor = document.getElementById("impostorName");

    if (acertou) {
        iconeResultado.innerHTML = '<i class="fas fa-check-circle"></i>';
        iconeResultado.className = "result-icon correct";
        tituloResultado.textContent = "Você encontrou o impostor!";
    } else {
        iconeResultado.innerHTML = '<i class="fas fa-times-circle"></i>';
        iconeResultado.className = "result-icon wrong";
        tituloResultado.textContent = "Errou!";
    }

    nomeImpostor.textContent = `O impostor era: ${estado.rodadaAtual.impostor}`;
    textoResultado.textContent = estado.rodadaAtual.explicacao;

    sobreposicaoResultado.classList.add("active");
}

// --- OCULTAÇÃO DO OVERLAY DE RESULTADO ---
export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

// --- ATUALIZAÇÃO DO PLACAR ---
export function atualizarPlacar() {
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("totalCount").textContent = estado.totalJogado;
    document.getElementById("sequenciaCount").textContent = estado.sequencia;
    document.getElementById("melhorCount").textContent = estado.melhorSequencia;
}