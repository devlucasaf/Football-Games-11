import estado from "./core.js";
import { normalizar } from "./utils.js";

// --- ATUALIZAR INFORMAÇÕES NA TELA ---
export function atualizarInformacoesCarreira() {
    document.getElementById("clubesCount").textContent = estado.jogadorAtual.clubes.length;
    document.getElementById("errosCount").textContent = estado.erros;
    document.getElementById("reveladosCount").textContent =
        `${estado.clubesRevelados}/${estado.jogadorAtual.clubes.length}`;
}

// --- MOSTRAR RESULTADO ---
export function mostrarResultado(acertou) {
    const sobreposicaoResultado = document.getElementById("resultOverlay");
    const iconeResultado = document.getElementById("resultIcon");
    const textoResultado = document.getElementById("resultText");

    if (acertou) {
        iconeResultado.textContent = "";
        textoResultado.textContent = `Você acertou! O jogador era ${estado.jogadorAtual.nome}! (${estado.erros} erro${estado.erros !== 1 ? "s" : ""})`;
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
        iconeResultado.textContent = "";
        textoResultado.textContent = `O jogador era ${estado.jogadorAtual.nome}!`;
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

    sobreposicaoResultado.classList.add("show");
}

// --- ESCONDER RESULTADO ---
export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("show");
}

// --- MOSTRAR SUGESTÕES DO AUTOCOMPLETE ---
export function mostrarSugestoes(consulta, tratarSelecaoJogador) {
    const listaSugestoesJogadores = document.getElementById("suggestionsDropdown");

    if (!consulta || consulta.length < 2) {
        esconderSugestoes();
        return;
    }

    const consultaNormalizada = normalizar(consulta);
    const correspondencias = estado.jogadores
        .filter(jogador => normalizar(jogador.nome).includes(consultaNormalizada))
        .slice(0, 8);

    if (correspondencias.length === 0) {
        esconderSugestoes();
        return;
    }

    listaSugestoesJogadores.innerHTML = "";
    correspondencias.forEach(jogador => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = jogador.nome;
        item.addEventListener("click", () => {
            document.getElementById("playerInput").value = jogador.nome;
            esconderSugestoes();
            tratarSelecaoJogador();
        });
        listaSugestoesJogadores.appendChild(item);
    });
    listaSugestoesJogadores.style.display = "block";
}

// --- ESCONDER SUGESTÕES ---
export function esconderSugestoes() {
    const listaSugestoesJogadores = document.getElementById("suggestionsDropdown");
    if (listaSugestoesJogadores) {
        listaSugestoesJogadores.style.display = "none";
        listaSugestoesJogadores.innerHTML = "";
    }
}
