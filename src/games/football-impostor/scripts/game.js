import estado from "./core.js";
import { embaralhar } from "./utils.js";
import { mostrarExplicacao, atualizarPlacar } from "./ui.js";

// --- CRIAR CARDS DA RODADA ---
export function criarCards() {
    const grid = document.getElementById("impostorGrid");
    const temaEl = document.getElementById("temaTexto");
    const dificuldadeEl = document.getElementById("dificuldadeBadge");

    grid.innerHTML = "";

    // --- EXIBIR TEMA ---
    temaEl.textContent = estado.rodadaAtual.tema;

    // --- EXIBIR DIFICULDADE ---
    dificuldadeEl.textContent = estado.rodadaAtual.dificuldade;
    dificuldadeEl.className = `dificuldade-badge ${estado.rodadaAtual.dificuldade}`;

    // --- COMBINAR E EMBARALHAR ---
    const todosJogadores = embaralhar([
        ...estado.rodadaAtual.jogadores,
        estado.rodadaAtual.impostor
    ]);

    todosJogadores.forEach((nome, idx) => {
        const card = document.createElement("div");
        card.className = "impostor-card";
        card.dataset.nome = nome;
        card.style.animation = `fadeInCard 0.4s ease ${idx * 0.07}s both`;

        // --- ÍCONE ---
        const icon = document.createElement("div");
        icon.className = "card-icon";
        icon.innerHTML = '<i class="fas fa-user"></i>';
        card.appendChild(icon);

        // --- NOME ---
        const nomeEl = document.createElement("div");
        nomeEl.className = "card-nome";
        nomeEl.textContent = nome;
        card.appendChild(nomeEl);

        card.addEventListener("click", () => selecionarJogador(nome, card));

        grid.appendChild(card);
    });

    estado.jogoAtivo = true;
}

// --- SELECIONAR JOGADOR ---
function selecionarJogador(nome, card) {
    if (!estado.jogoAtivo) {
        return;
    }
    
    estado.jogoAtivo = false;
    estado.totalJogado++;

    const acertou = nome === estado.rodadaAtual.impostor;

    if (acertou) {
        estado.acertos++;
        estado.sequencia++;
        if (estado.sequencia > estado.melhorSequencia) {
            estado.melhorSequencia = estado.sequencia;
        }
        card.classList.add("impostor-found");
    } else {
        estado.sequencia = 0;
        card.classList.add("wrong-choice");

        // --- REVELAR O IMPOSTOR VERDADEIRO ---
        const cards = document.querySelectorAll(".impostor-card");
        cards.forEach(c => {
            if (c.dataset.nome === estado.rodadaAtual.impostor) {
                setTimeout(() => c.classList.add("impostor-reveal"), 400);
            }
        });
    }

    // --- DIMINUIR OPACIDADE DOS OUTROS ---
    const cards = document.querySelectorAll(".impostor-card");
    cards.forEach(c => {
        if (c !== card && c.dataset.nome !== estado.rodadaAtual.impostor) {
            c.classList.add("dimmed");
        }
    });

    atualizarPlacar();

    // --- MOSTRAR EXPLICAÇÃO ---
    setTimeout(() => {
        mostrarExplicacao(acertou);
    }, 1000);
}
