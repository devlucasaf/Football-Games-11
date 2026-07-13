import estado from "./core.js";
import { normalizar } from "./utils.js";

// --- ATUALIZAR INFORMAÇÕES NA TELA ---
export function atualizarInfo() {
    document.getElementById("clubesCount").textContent = estado.jogadorAtual.clubes.length;
    document.getElementById("errosCount").textContent = estado.erros;
    document.getElementById("reveladosCount").textContent =
        `${estado.clubesRevelados}/${estado.jogadorAtual.clubes.length}`;
}

// --- MOSTRAR RESULTADO ---
export function mostrarResultado(acertou) {
    const overlay = document.getElementById("resultOverlay");
    const icon = document.getElementById("resultIcon");
    const text = document.getElementById("resultText");

    if (acertou) {
        icon.textContent = "";
        text.textContent = `Você acertou! O jogador era ${estado.jogadorAtual.nome}! (${estado.erros} erro${estado.erros !== 1 ? "s" : ""})`;
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
        
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-carreiras", {
                venceu: true,
                bucket: Math.min(estado.erros, 5),
                tamanho: 6
            });
        }
    } else {
        icon.textContent = "";
        text.textContent = `O jogador era ${estado.jogadorAtual.nome}!`;
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-carreiras", {
                venceu: false,
                tamanho: 6
            });
            setTimeout(() => {
                window.FG11Stats.mostrarModal("football-carreiras", {
                    venceu: false,
                    titulo: "Não foi dessa vez!",
                    resposta: `O jogador era ${estado.jogadorAtual.nome}`,
                    tamanho: 6,
                    rotulos: ["0", "1", "2", "3", "4", "5+"],
                    tituloGrafico: "Vitórias por erros cometidos",
                    bucketAtual: -1,
                    onReiniciar: window.carreirasProxima,
                    onHome: () => { window.location.href = "../../../index.html"; }
                });
            }, 600);
        }
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
