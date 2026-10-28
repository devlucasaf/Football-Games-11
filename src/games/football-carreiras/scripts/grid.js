import estado from "./core.js";
import { buscarEscudo } from "./data.js";
import { atualizarInformacoesCarreira } from "./ui.js";

// --- CRIA A GRADE DE CLUBES ---
export function criarGradeClubesCarreira() {
    const gradeClubesCarreira = document.getElementById("carreirasGrid");
    gradeClubesCarreira.innerHTML = "";

    const clubes = estado.jogadorAtual.clubes;

    clubes.forEach((clube, indiceClube) => {
        const cartaoClube = document.createElement("div");

        cartaoClube.className = "clube-card hidden-club";
        cartaoClube.dataset.index = indiceClube;

        const numero = document.createElement("div");

        numero.className = "clube-number";
        numero.textContent = indiceClube + 1;
        cartaoClube.appendChild(numero);

        const recipienteEscudo = document.createElement("div");
        recipienteEscudo.className = "clube-escudo";
        const escudo = buscarEscudo(clube);
        if (escudo) {
            const imagem = document.createElement("img");

            imagem.src = escudo;
            imagem.alt = clube;
            imagem.title = clube;
            imagem.onerror = () => { recipienteEscudo.textContent = clube; };

            recipienteEscudo.appendChild(imagem);
        } else {
            recipienteEscudo.style.fontSize = "0.65rem";
            recipienteEscudo.style.fontWeight = "700";
            recipienteEscudo.style.color = "var(--text-primary)";
            recipienteEscudo.style.textAlign = "center";
            recipienteEscudo.style.padding = "4px";
            recipienteEscudo.textContent = clube;
        }
        cartaoClube.appendChild(recipienteEscudo);

        const nome = document.createElement("div");

        nome.className = "clube-nome";
        nome.textContent = clube;

        cartaoClube.appendChild(nome);

        gradeClubesCarreira.appendChild(cartaoClube);
    });

    revelarProximo();
    atualizarInformacoesCarreira();
}

// --- REVELA O PRÓXIMO CLUBE ---
export function revelarProximo() {
    const cartoesClubes = document.querySelectorAll(".clube-card");
    
    if (estado.clubesRevelados >= cartoesClubes.length) {
        return;
    }

    const cartaoClube = cartoesClubes[estado.clubesRevelados];

    cartaoClube.classList.remove("hidden-club");
    cartaoClube.classList.add("revealed");
    
    estado.clubesRevelados++;
    atualizarInformacoesCarreira();
}

// --- REVELA TODOS OS CLUBES RESTANTES ---
export function revelarTodos() {
    const cartoesClubes = document.querySelectorAll(".clube-card");
    cartoesClubes.forEach((cartaoClube, indiceClube) => {
        if (!cartaoClube.classList.contains("revealed")) {
            setTimeout(() => {
                cartaoClube.classList.remove("hidden-club");
                cartaoClube.classList.add("revealed", "reveal-all");
            }, indiceClube * 80);
        }
    });
}
