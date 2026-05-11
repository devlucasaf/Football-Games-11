import estado from "./core.js";

export function mostrarExplicacao(acertou) {
    const overlay       = document.getElementById("resultOverlay");
    const icon          = document.getElementById("resultIcon");
    const title         = document.getElementById("resultTitle");
    const text          = document.getElementById("resultText");
    const impostorName  = document.getElementById("impostorName");

    if (acertou) {
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
        icon.className = "result-icon correct";
        title.textContent = "Você encontrou o impostor!";
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle"></i>';
        icon.className = "result-icon wrong";
        title.textContent = "Errou!";
    }

    impostorName.textContent = `O impostor era: ${estado.rodadaAtual.impostor}`;
    text.textContent = estado.rodadaAtual.explicacao;

    overlay.classList.add("active");
}

export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

export function atualizarPlacar() {
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("totalCount").textContent = estado.totalJogado;
    document.getElementById("sequenciaCount").textContent = estado.sequencia;
    document.getElementById("melhorCount").textContent = estado.melhorSequencia;
}
