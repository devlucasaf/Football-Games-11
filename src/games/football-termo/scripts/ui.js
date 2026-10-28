// --- EXIBIÇÃO DE MENSAGEM ---
export function mostrarMensagem(texto) {
    const sobreposicaoMensagem = document.getElementById("sobreposicaoMensagem");
    const mensagem = document.getElementById("textoMensagem");
    mensagem.textContent = texto;              
    sobreposicaoMensagem.classList.add("show");
}

// --- OCULTAR MENSAGEM ---
export function esconderMensagem() {
    document.getElementById("sobreposicaoMensagem").classList.remove("show");
}