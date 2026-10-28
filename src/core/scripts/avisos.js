// --- AVISOS DO SITE ---
(function () {
    function obterRecipienteAvisos() {
        let recipienteAvisos = document.getElementById("fg11Avisos");
        if (!recipienteAvisos) {
            recipienteAvisos = document.createElement("div");
            recipienteAvisos.id = "fg11Avisos";
            recipienteAvisos.className = "fg11-avisos";
            recipienteAvisos.setAttribute("role", "status");
            recipienteAvisos.setAttribute("aria-live", "polite");
            document.body.appendChild(recipienteAvisos);
        }
        return recipienteAvisos;
    }

    // --- MOSTRA UM AVISO ---
    function mostrarAviso({ icone = "fa-medal", titulo = "", texto = "", iconeTexto = null, acao = null, duracao = 7000 }) {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", () => mostrarAviso({ icone, titulo, texto, iconeTexto, acao, duracao }));
            return null;
        }

        const aviso = document.createElement("div");
        
        aviso.className = "fg11-aviso";

        const elementoIconeAviso = document.createElement("span");
        
        elementoIconeAviso.className = "fg11-aviso-icone";
        elementoIconeAviso.setAttribute("aria-hidden", "true");
        elementoIconeAviso.innerHTML = `<i class="fas ${icone}"></i>`;

        const corpo = document.createElement("div");
        
        corpo.className = "fg11-aviso-corpo";
        
        const elementoTituloAviso = document.createElement("strong");
        
        elementoTituloAviso.textContent = titulo;
        corpo.appendChild(elementoTituloAviso);
        
        if (texto) {
            const elementoTextoAviso = document.createElement("span");
            if (iconeTexto) {
                const elementoIconeTextoAviso = document.createElement("i");
                elementoIconeTextoAviso.className = `fas ${iconeTexto}`;
                elementoIconeTextoAviso.setAttribute("aria-hidden", "true");
                elementoTextoAviso.append(elementoIconeTextoAviso, " ");
            }
            elementoTextoAviso.append(texto);
            corpo.appendChild(elementoTextoAviso);
        }

        aviso.append(elementoIconeAviso, corpo);

        if (acao) {
            const btnExecutarAcaoAviso = document.createElement("button");
            
            btnExecutarAcaoAviso.type = "button";
            btnExecutarAcaoAviso.className = "fg11-aviso-acao";
            btnExecutarAcaoAviso.textContent = acao.rotulo;
            btnExecutarAcaoAviso.addEventListener("click", () => acao.aoClicar(btnExecutarAcaoAviso));
            aviso.appendChild(btnExecutarAcaoAviso);
        }

        const btnFecharAviso = document.createElement("button");
        
        btnFecharAviso.type = "button";
        btnFecharAviso.className = "fg11-aviso-fechar";
        btnFecharAviso.setAttribute("aria-label", "Fechar");
        btnFecharAviso.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
        btnFecharAviso.addEventListener("click", () => removerAviso(aviso));
        aviso.appendChild(btnFecharAviso);

        obterRecipienteAvisos().appendChild(aviso);
        if (duracao > 0) {
            setTimeout(() => removerAviso(aviso), duracao);
        }
        return aviso;
    }

    // --- REMOVE UM AVISO ---
    function removerAviso(aviso) {
        if (aviso.isConnected) {
            aviso.classList.add("saindo");
            setTimeout(() => aviso.remove(), 250);
        }
    }

    window.FG11Avisos = { mostrar: mostrarAviso };
})();
