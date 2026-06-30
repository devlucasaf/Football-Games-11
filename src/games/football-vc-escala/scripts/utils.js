const EscalaUtils = {
    alternarTema() {
        const temaAtual = document.documentElement.getAttribute("data-theme");
        const novoTema = temaAtual === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", novoTema);
        localStorage.setItem("theme", novoTema);

        const icone = document.querySelector("#themeToggle i");
        if (icone) {
            icone.className = novoTema === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
    },

    // --- INICIALIZA O TEMA SALVO ANTERIORMENTE OU DEFINE O PADRÃO ---
    inicializarTema() {
        const temaSalvo = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", temaSalvo);

        const icone = document.querySelector("#themeToggle i");
        if (icone) {
            icone.className = temaSalvo === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
    }
};

// --- AGUARDA O CARREGAMENTO COMPLETO DO DOM ANTES DE INICIALIZAR ---
document.addEventListener("DOMContentLoaded", () => {
    EscalaUtils.inicializarTema();
});
