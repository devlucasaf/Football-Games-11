import estado from "./core.js";
import { buscarEscudo } from "./data.js";
import { atualizarInfo } from "./ui.js";

export function criarGrid() {
    const grid = document.getElementById("carreirasGrid");
    grid.innerHTML = "";

    const clubes = estado.jogadorAtual.clubes;

    clubes.forEach((clube, idx) => {
        const card = document.createElement("div");
        card.className = "clube-card hidden-club";
        card.dataset.index = idx;

        // --- NÚMERO ---
        const numero = document.createElement("div");
        numero.className = "clube-number";
        numero.textContent = idx + 1;
        card.appendChild(numero);

        // --- ESCUDO ---
        const escudoContainer = document.createElement("div");
        escudoContainer.className = "clube-escudo";
        const escudo = buscarEscudo(clube);
        if (escudo) {
            const img = document.createElement("img");

            img.src = escudo;
            img.alt = clube;
            img.title = clube;
            img.onerror = () => { escudoContainer.textContent = clube; };

            escudoContainer.appendChild(img);
        } else {
            escudoContainer.style.fontSize = "0.65rem";
            escudoContainer.style.fontWeight = "700";
            escudoContainer.style.color = "var(--text-primary)";
            escudoContainer.style.textAlign = "center";
            escudoContainer.style.padding = "4px";
            escudoContainer.textContent = clube;
        }
        card.appendChild(escudoContainer);

        // --- NOME DO CLUBE ---
        const nome = document.createElement("div");
        nome.className = "clube-nome";
        nome.textContent = clube;
        card.appendChild(nome);

        grid.appendChild(card);
    });

    // --- REVELAR O PRIMEIRO CLUBE ---
    revelarProximo();
    atualizarInfo();
}

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
