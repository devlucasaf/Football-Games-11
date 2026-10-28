import estado from "./core.js";
import { embaralharJogadores } from "./utils.js";
import { mostrarExplicacao, atualizarPlacar } from "./ui.js";

// --- CRIAR CARDS DA RODADA ---
export function criarCartoesJogadores() {
    const gradeJogadores = document.getElementById("impostorGrid");
    const elementoTema = document.getElementById("temaTexto");
    const elementoDificuldade = document.getElementById("dificuldadeBadge");

    gradeJogadores.innerHTML = "";

    // --- EXIBIR TEMA ---
    elementoTema.textContent = estado.rodadaAtual.tema;

    // --- EXIBIR DIFICULDADE ---
    elementoDificuldade.textContent = estado.rodadaAtual.dificuldade;
    elementoDificuldade.className = `dificuldade-badge ${estado.rodadaAtual.dificuldade}`;

    // --- COMBINAR E EMBARALHAR ---
    const todosJogadores = embaralharJogadores([
        ...estado.rodadaAtual.jogadores,
        estado.rodadaAtual.impostor
    ]);

    todosJogadores.forEach((nome, indiceJogador) => {
        const cartaoJogador = document.createElement("div");
        cartaoJogador.className = "impostor-card";
        cartaoJogador.dataset.nome = nome;
        cartaoJogador.style.animation = `fadeInCard 0.4s ease ${indiceJogador * 0.07}s both`;

        // --- ÍCONE ---
        const elementoIcone = document.createElement("div");
        elementoIcone.className = "card-icon";
        elementoIcone.innerHTML = '<i class="fas fa-user"></i>';
        cartaoJogador.appendChild(elementoIcone);

        // --- NOME ---
        const elementoNome = document.createElement("div");
        elementoNome.className = "card-nome";
        elementoNome.textContent = nome;
        cartaoJogador.appendChild(elementoNome);

        cartaoJogador.addEventListener("click", () => selecionarJogador(nome, cartaoJogador));

        gradeJogadores.appendChild(cartaoJogador);
    });

    estado.jogoAtivo = true;
}

// --- SELECIONAR JOGADOR ---
function selecionarJogador(nome, cartaoJogador) {
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
        cartaoJogador.classList.add("impostor-found");
    } else {
        estado.sequencia = 0;
        cartaoJogador.classList.add("wrong-choice");

        // --- REVELAR O IMPOSTOR VERDADEIRO ---
        const cartoesJogadores = document.querySelectorAll(".impostor-card");
        cartoesJogadores.forEach(cartao => {
            if (cartao.dataset.nome === estado.rodadaAtual.impostor) {
                setTimeout(() => cartao.classList.add("impostor-reveal"), 400);
            }
        });
    }

    // --- DIMINUIR OPACIDADE DOS OUTROS ---
    const cartoesJogadores = document.querySelectorAll(".impostor-card");
    cartoesJogadores.forEach(cartao => {
        if (cartao !== cartaoJogador && cartao.dataset.nome !== estado.rodadaAtual.impostor) {
            cartao.classList.add("dimmed");
        }
    });

    atualizarPlacar();

    if (acertou) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    // --- MOSTRAR EXPLICAÇÃO ---
    setTimeout(() => {
        mostrarExplicacao(acertou);
    }, 1000);
}
