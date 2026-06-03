import estado from "./core.js";
import { normalizar } from "./utils.js";

export function atualizarInfo() {
    document.getElementById("clubesCount").textContent = estado.jogadorAtual.clubes.length;
    document.getElementById("errosCount").textContent = estado.erros;
    document.getElementById("reveladosCount").textContent =
        `${estado.clubesRevelados}/${estado.jogadorAtual.clubes.length}`;
}

// --- MOSTRAR RESULTADO ---
export function mostrarResultado(acertou) {
    const overlay   = document.getElementById("resultOverlay");
    const icon      = document.getElementById("resultIcon");
    const text      = document.getElementById("resultText");

    if (acertou) {
        icon.textContent = "";
        text.textContent = `Você acertou! O jogador era ${estado.jogadorAtual.nome}! (${estado.erros} erro${estado.erros !== 1 ? "s" : ""})`;
    } else {
        icon.textContent = "";
        text.textContent = `O jogador era ${estado.jogadorAtual.nome}!`;
    }

    overlay.classList.add("show");
}

// --- ESCONDER RESULTADO ---
export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("show");
}

// --- MOSTRAR SUGESTÕES DO AUTOCOMPLETE ---
export function mostrarSugestoes(consulta, onSelect) {
    const dropdown = document.getElementById("suggestionsDropdown");

    if (!consulta || consulta.length < 2) {
        esconderSugestoes();
        return;
    }

    const consultaNorm = normalizar(consulta);
    const correspondencias = estado.jogadores
        .filter(j => normalizar(j.nome).includes(consultaNorm))
        .slice(0, 8);

    if (correspondencias.length === 0) {
        esconderSugestoes();
        return;
    }

    dropdown.innerHTML = "";
    correspondencias.forEach(j => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = j.nome;
        item.addEventListener("click", () => {
            document.getElementById("playerInput").value = j.nome;
            esconderSugestoes();
            onSelect();
        });
        dropdown.appendChild(item);
    });
    dropdown.style.display = "block";
}

// --- ESCONDER SUGESTÕES ---
export function esconderSugestoes() {
    const dropdown = document.getElementById("suggestionsDropdown");
    if (dropdown) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
    }
}
