const LegendsUtils = {
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

    inicializarTema() {
        const temaSalvo = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", temaSalvo);

        const icone = document.querySelector("#themeToggle i");
        if (icone) {
            icone.className = temaSalvo === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
    }
};

// --- INICIALIZA TEMA AO CARREGAR ---
document.addEventListener("DOMContentLoaded", () => {
    LegendsUtils.inicializarTema();
});
