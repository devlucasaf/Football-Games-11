// --- AVISOS DO SITE ---
(function () {
    function obterContainer() {
        let container = document.getElementById("fg11Avisos");
        if (!container) {
            container = document.createElement("div");
            container.id = "fg11Avisos";
            container.className = "fg11-avisos";
            container.setAttribute("role", "status");
            container.setAttribute("aria-live", "polite");
            document.body.appendChild(container);
        }
        return container;
    }

    // --- MOSTRA UM AVISO ---
    function mostrar({ icone = "fa-medal", titulo = "", texto = "", acao = null, duracao = 7000 }) {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", () => mostrar({ icone, titulo, texto, acao, duracao }));
            return null;
        }

        const aviso = document.createElement("div");
        aviso.className = "fg11-aviso";

        const iconeEl = document.createElement("span");
        iconeEl.className = "fg11-aviso-icone";
        iconeEl.setAttribute("aria-hidden", "true");
        iconeEl.innerHTML = `<i class="fas ${icone}"></i>`;

        const corpo = document.createElement("div");
        corpo.className = "fg11-aviso-corpo";
        const tituloEl = document.createElement("strong");
        tituloEl.textContent = titulo;
        corpo.appendChild(tituloEl);
        if (texto) {
            const textoEl = document.createElement("span");
            textoEl.textContent = texto;
            corpo.appendChild(textoEl);
        }

        aviso.append(iconeEl, corpo);

        if (acao) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "fg11-aviso-acao";
            botao.textContent = acao.rotulo;
            botao.addEventListener("click", () => acao.aoClicar(botao));
            aviso.appendChild(botao);
        }

        const fechar = document.createElement("button");
        fechar.type = "button";
        fechar.className = "fg11-aviso-fechar";
        fechar.setAttribute("aria-label", "Fechar");
        fechar.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
        fechar.addEventListener("click", () => remover(aviso));
        aviso.appendChild(fechar);

        obterContainer().appendChild(aviso);
        if (duracao > 0) {
            setTimeout(() => remover(aviso), duracao);
        }
        return aviso;
    }

    // --- REMOVE UM AVISO ---
    function remover(aviso) {
        if (aviso.isConnected) {
            aviso.classList.add("saindo");
            setTimeout(() => aviso.remove(), 250);
        }
    }

    window.FG11Avisos = { mostrar };
})();
