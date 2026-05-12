export function mostrarMensagem(texto) {
    const overlay = document.getElementById("messageOverlay");
    const mensagem = document.getElementById("messageText");
    mensagem.textContent = texto;
    overlay.classList.add("show");
}

export function esconderMensagem() {
    document.getElementById("messageOverlay").classList.remove("show");
}
