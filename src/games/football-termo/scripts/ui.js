// --- EXIBIÇÃO DE MENSAGEM ---
export function mostrarMensagem(texto) {
    const overlay = document.getElementById("messageOverlay");
    const mensagem = document.getElementById("messageText");
    mensagem.textContent = texto;              
    overlay.classList.add("show");             
}

// --- OCULTAR MENSAGEM ---
export function esconderMensagem() {
    document.getElementById("messageOverlay").classList.remove("show");
}