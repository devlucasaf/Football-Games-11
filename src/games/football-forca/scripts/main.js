import { estado } from "./core.js";
import { carregarDados, escolherJogador } from "./data.js";

const ALFABETO = ["ABCDEFGHI", "JKLMNOPQR", "STUVWXYZ"];
const PARTES = ["p-cabeca", "p-tronco", "p-braco-e", "p-braco-d", "p-perna-e", "p-perna-d"];

const els = {
    palavra:        document.getElementById("palavra"),
    teclado:        document.getElementById("teclado"),
    dica:           document.getElementById("dica"),
    errosCount:     document.getElementById("errosCount"),
    letrasErradas:  document.getElementById("letrasErradas"),
    acertos:        document.getElementById("acertos"),
    sequencia:      document.getElementById("sequencia"),
    gameArea:       document.getElementById("gameArea"),
    roundResult:    document.getElementById("roundResult"),
    roundIcon:      document.getElementById("roundIcon"),
    roundText:      document.getElementById("roundText"),
    roundAnswer:    document.getElementById("roundAnswer")
};

// --- MONTA O TECLADO VIRTUAL ---
function criarTeclado() {
    els.teclado.innerHTML = "";
    ALFABETO.forEach((linha) => {
        const row = document.createElement("div");
        row.className = "keyboard-row";
        [...linha].forEach((letra) => {
            const btn = document.createElement("button");
            btn.className = "forca-key";
            btn.textContent = letra;
            btn.dataset.letra = letra;
            btn.addEventListener("click", () => tentarLetra(letra));
            row.appendChild(btn);
        });
        els.teclado.appendChild(row);
    });
}

// --- RENDERIZA A PALAVRA ---
function renderizarPalavra() {
    els.palavra.innerHTML = "";
    [...estado.palavra].forEach((char) => {
        if (char === " ") {
            const espaco = document.createElement("span");
            espaco.className = "letra-espaco";
            els.palavra.appendChild(espaco);
            return;
        }
        const slot = document.createElement("span");
        slot.className = "letra-slot";
        if (estado.reveladas.has(char)) {
            slot.textContent = char;
            slot.classList.add("revelada");
        }
        els.palavra.appendChild(slot);
    });
}

// --- RENDERIZA O BONECO DA FORCA ---
function renderizarBoneco() {
    PARTES.forEach((id, i) => {
        const parte = document.getElementById(id);
        if (parte) {
            parte.classList.toggle("visivel", i < estado.erros);
        }
    });
}

// --- ATUALIZA O CONTADOR DE ERROS E AS LETRAS ERRADAS ---
function atualizarErros() {
    els.errosCount.textContent = estado.erros;
    const erradas = [...estado.usadas].filter((l) => !estado.palavra.includes(l));
    els.letrasErradas.textContent = erradas.length ? erradas.join(" ") : "";
}

// --- ATUALIZA O PLACAR DA SESSÃO ---
function atualizarPlacar() {
    els.acertos.textContent = estado.acertos;
    els.sequencia.textContent = estado.sequencia;
}

// --- TENTA UMA LETRA ---
function tentarLetra(letra) {
    if (!estado.jogoAtivo || estado.usadas.has(letra)) {
        return;
    }
    estado.usadas.add(letra);

    const tecla = els.teclado.querySelector(`[data-letra="${letra}"]`);

    if (estado.palavra.includes(letra)) {
        estado.reveladas.add(letra);
        if (tecla) {
            tecla.classList.add("certa");
            tecla.disabled = true;
        }
        renderizarPalavra();
        verificarVitoria();
    } else {
        estado.erros++;
        if (tecla) {
            tecla.classList.add("errada");
            tecla.disabled = true;
        }
        renderizarBoneco();
        atualizarErros();
        verificarDerrota();
    }
}

// --- VERIFICA SE O JOGADOR VENCEU ---
function verificarVitoria() {
    const letras = [...estado.palavra].filter((c) => c !== " ");
    const venceu = letras.every((c) => estado.reveladas.has(c));
    if (!venceu) {
        return;
    }

    estado.jogoAtivo = false;
    estado.acertos++;
    estado.sequencia++;
    if (estado.sequencia > estado.melhorSequencia) {
        estado.melhorSequencia = estado.sequencia;
    }

    atualizarPlacar();
    if (window.registrarVitoria) {
        window.registrarVitoria();
    }
    mostrarResultado(true);

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-forca", { 
            venceu: true, 
            bucket: estado.erros, 
            tamanho: estado.maxErros 
        });
        window.FG11Stats.mostrarModal("football-forca", {
            venceu: true,
            titulo: "Você salvou o jogador!",
            resposta: `Resposta: ${estado.atual.nome}`,
            tamanho: estado.maxErros,
            rotulos: ["0", "1", "2", "3", "4", "5"],
            tituloGrafico: "Acertos por número de erros",
            bucketAtual: estado.erros,
            onReiniciar: novaPalavra,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- VERIFICA SE O JOGADOR PERDEU ---
function verificarDerrota() {
    if (estado.erros < estado.maxErros) {
        return;
    }
    estado.jogoAtivo = false;
    estado.sequencia = 0;
    atualizarPlacar();

    [...estado.palavra].forEach((c) => {
        if (c !== " ") {
            estado.reveladas.add(c);
        }
    });
    renderizarPalavra();

    if (window.registrarDerrota) {
        window.registrarDerrota();
    }
    mostrarResultado(false);

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-forca", { venceu: false, tamanho: estado.maxErros });
        window.FG11Stats.mostrarModal("football-forca", {
            venceu: false,
            titulo: "Enforcado! Fim da linha.",
            resposta: `Resposta: ${estado.atual.nome}`,
            tamanho: estado.maxErros,
            rotulos: ["0", "1", "2", "3", "4", "5"],
            tituloGrafico: "Acertos por número de erros",
            bucketAtual: -1,
            onReiniciar: novaPalavra,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- MOSTRA O RESULTADO DA RODADA ---
function mostrarResultado(venceu) {
    els.teclado.querySelectorAll(".forca-key").forEach((k) => (k.disabled = true));
    els.gameArea.classList.add("hidden");
    els.roundResult.classList.remove("hidden");

    if (venceu) {
        els.roundIcon.className = "round-icon correct";
        els.roundIcon.innerHTML = "<i class=\"fas fa-check-circle\"></i>";
        els.roundText.textContent = "Você salvou o jogador!";
    } else {
        els.roundIcon.className = "round-icon wrong";
        els.roundIcon.innerHTML = "<i class=\"fas fa-skull\"></i>";
        els.roundText.textContent = "Enforcado! Fim da linha.";
    }

    els.roundAnswer.textContent = `Resposta: ${estado.atual.nome}`;
}

// --- INICIA UMA NOVA PALAVRA ---
function novaPalavra() {
    escolherJogador();
    els.dica.textContent = estado.atual.dica;
    criarTeclado();
    renderizarPalavra();
    renderizarBoneco();
    atualizarErros();
    els.roundResult.classList.add("hidden");
    els.gameArea.classList.remove("hidden");
}

// --- INICIALIZA O JOGO ---
async function init() {
    await carregarDados();

    document.getElementById("btnNova").addEventListener("click", novaPalavra);
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.addEventListener("keydown", (e) => {
        const overlay = document.getElementById("tutorialOverlay");
        if (overlay && !overlay.classList.contains("hidden")) {
            return;
        }

        const letra = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letra)) {
            tentarLetra(letra);
        }
    });

    atualizarPlacar();
    novaPalavra();
}

init();
