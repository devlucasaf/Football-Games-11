import estado from "./core.js";
import { buscarEscudo } from "./data.js";
import { atualizarInfo } from "./ui.js";

// --- CRIA A GRADE DE CLUBES ---
export function criarGrid() {
    const grid = document.getElementById("carreirasGrid");
    grid.innerHTML = "";

    const clubes = estado.jogadorAtual.clubes;

    clubes.forEach((clube, idx) => {
        const card = document.createElement("div");

        card.className = "clube-card hidden-club";
        card.dataset.index = idx;

        const numero = document.createElement("div");

        numero.className = "clube-number";
        numero.textContent = idx + 1;
        card.appendChild(numero);

        const escudoContainer = document.createElement("div");
        escudoContainer.className = "clube-escudo";
        const escudo = buscarEscudo(clube);
        if (escudo) {
            const imagem = document.createElement("img");

            imagem.src = escudo;
            imagem.alt = clube;
            imagem.title = clube;
            imagem.onerror = () => { escudoContainer.textContent = clube; };

            escudoContainer.appendChild(imagem);
        } else {
            escudoContainer.style.fontSize = "0.65rem";
            escudoContainer.style.fontWeight = "700";
            escudoContainer.style.color = "var(--text-primary)";
            escudoContainer.style.textAlign = "center";
            escudoContainer.style.padding = "4px";
            escudoContainer.textContent = clube;
        }
        card.appendChild(escudoContainer);

        const nome = document.createElement("div");

        nome.className = "clube-nome";
        nome.textContent = clube;

        card.appendChild(nome);

        grid.appendChild(card);
    });

    revelarProximo();
    atualizarInfo();
}

// --- REVELA O PRÓXIMO CLUBE ---
export function revelarProximo() {
    const cards = document.querySelectorAll(".clube-card");
    
    if (estado.clubesRevelados >= cards.length) {
        return;
    }

    const card = cards[estado.clubesRevelados];

    card.classList.remove("hidden-club");
    card.classList.add("revealed");
    
    estado.clubesRevelados++;
    atualizarInfo();
}

// --- REVELA TODOS OS CLUBES RESTANTES ---
export function revelarTodos() {
    const cards = document.querySelectorAll(".clube-card");
    cards.forEach((card, idx) => {
        if (!card.classList.contains("revealed")) {
            setTimeout(() => {
                card.classList.remove("hidden-club");
                card.classList.add("revealed", "reveal-all");
            }, idx * 80);
        }
    });
}
