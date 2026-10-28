import { estado } from "./core.js";
import { embaralharJogadores } from "./data.js";

// --- RENDERIZAR GRID DE JOGADORES ---
export function renderizarGradeJogadores() {
    const gradeJogadores = document.getElementById("playersGrid");
    gradeJogadores.innerHTML = "";

    estado.jogadoresRestantes.forEach(nome => {
        const btnSelecionarJogador = document.createElement("button");
        btnSelecionarJogador.className = "player-tile";
        btnSelecionarJogador.textContent = nome;
        btnSelecionarJogador.dataset.nome = nome;

        if (estado.selecionados.includes(nome)) {
            btnSelecionarJogador.classList.add("selected");
        }

        btnSelecionarJogador.addEventListener("click", () => alternarSelecaoJogador(nome));
        gradeJogadores.appendChild(btnSelecionarJogador);
    });

    atualizarBotoes();
}

// --- ALTERNAR SELEÇÃO DE JOGADOR ---
function alternarSelecaoJogador(nome) {
    if (!estado.jogoAtivo) {
        return;
    }
    
    const indiceJogadorSelecionado = estado.selecionados.indexOf(nome);
    if (indiceJogadorSelecionado >= 0) {
        estado.selecionados.splice(indiceJogadorSelecionado, 1);
    } else {
        if (estado.selecionados.length >= 4) {
            return;
        }
        estado.selecionados.push(nome);
    }

    renderizarGradeJogadores();
}

// --- ATUALIZAR ESTADO DOS BOTÕES ---
export function atualizarBotoes() {
    const btnLimparSelecao = document.getElementById("btnLimparSelecao");
    const btnConfirmarSelecao = document.getElementById("btnConfirmarSelecao");

    btnLimparSelecao.disabled = estado.selecionados.length === 0;
    btnConfirmarSelecao.disabled = estado.selecionados.length !== 4;
}

// --- RENDERIZAR VIDAS ---
export function renderizarVidas() {
    const indicadoresVidas = document.querySelectorAll("#livesDots .dot");
    indicadoresVidas.forEach((indicadorVida, indiceVida) => {
        if (indiceVida >= estado.tentativasRestantes) {
            indicadorVida.classList.add("lost");
        } else {
            indicadorVida.classList.remove("lost");
        }
    });
}

// --- RENDERIZAR GRUPO ACERTADO ---
export function renderizarGrupoAcertado(grupo) {
    const recipienteGruposAcertados = document.getElementById("solvedGroups");
    const cartaoGrupo = document.createElement("div");

    cartaoGrupo.className = "solved-group";
    cartaoGrupo.style.backgroundColor = grupo.cor;
    cartaoGrupo.innerHTML = `
        <div class="group-category">${grupo.categoria}</div>
        <div class="group-players">${grupo.jogadores.join(", ")}</div>
    `;
    recipienteGruposAcertados.appendChild(cartaoGrupo);
}

// --- MOSTRAR FEEDBACK ---
export function mostrarMensagemSelecao(tipo, texto) {
    const mensagemSelecao = document.getElementById("feedbackMsg");

    mensagemSelecao.textContent = texto;
    mensagemSelecao.className = `feedback-msg ${tipo}`;
    mensagemSelecao.classList.remove("hidden");

    setTimeout(() => {
        mensagemSelecao.classList.add("hidden");
    }, 2500);
}

// --- ANIMAR ERRO ---
export function animarErro() {
    const botoesJogadoresSelecionados = document.querySelectorAll(".player-tile.selected");
    botoesJogadoresSelecionados.forEach(btnSelecionarJogador => {
        btnSelecionarJogador.classList.add("shake");
        setTimeout(() => btnSelecionarJogador.classList.remove("shake"), 400);
    });
}

// --- ANIMAR QUASE LÁ ---
export function animarQuaseLa() {
    const botoesJogadoresSelecionados = document.querySelectorAll(".player-tile.selected");
    botoesJogadoresSelecionados.forEach(btnSelecionarJogador => {
        btnSelecionarJogador.classList.add("almost");
        setTimeout(() => btnSelecionarJogador.classList.remove("almost"), 600);
    });
}

// --- EMBARALHAR GRID ---
export function embaralharGradeJogadores() {
    estado.jogadoresRestantes = embaralharJogadores(estado.jogadoresRestantes);
    renderizarGradeJogadores();
}

// --- LIMPAR SELEÇÃO ---
export function limparSelecao() {
    estado.selecionados = [];
    renderizarGradeJogadores();
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarResultadoFinal(venceu) {
    document.getElementById("playersGrid").classList.add("hidden");
    document.querySelector(".lives-area").classList.add("hidden");
    document.querySelector(".game-actions").classList.add("hidden");

    const resultadoFinal = document.getElementById("finalResult");
    resultadoFinal.classList.remove("hidden");

    const iconeResultado = document.getElementById("finalIcon");
    const tituloResultado = document.getElementById("finalTitle");
    const textoResultado = document.getElementById("finalText");

    if (venceu) {
        iconeResultado.textContent = "";
        tituloResultado.textContent = "Parabéns!";
        textoResultado.textContent = "Você encontrou todos os grupos!";
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        iconeResultado.textContent = "";
        tituloResultado.textContent = "Fim de jogo!";
        textoResultado.textContent = "Suas tentativas acabaram. Veja os grupos:";
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    const recipienteGruposFinais = document.getElementById("finalGroups");
    recipienteGruposFinais.innerHTML = "";
    estado.desafioAtual.grupos.forEach(grupo => {
        const item = document.createElement("div");
        item.className = "final-group-item";
        item.style.backgroundColor = grupo.cor;
        item.innerHTML = `
            <div class="fg-cat">${grupo.categoria}</div>
            <div class="fg-players">${grupo.jogadores.join(", ")}</div>
        `;
        recipienteGruposFinais.appendChild(item);
    });
}

// --- RESETAR VISUAL ---
export function reiniciarInterfaceDesafio() {
    document.getElementById("playersGrid").classList.remove("hidden");
    document.querySelector(".lives-area").classList.remove("hidden");
    document.querySelector(".game-actions").classList.remove("hidden");
    document.getElementById("finalResult").classList.add("hidden");
    document.getElementById("solvedGroups").innerHTML = "";
    document.getElementById("feedbackMsg").classList.add("hidden");

    document.querySelectorAll("#livesDots .dot").forEach(indicadorVida => indicadorVida.classList.remove("lost"));
}
