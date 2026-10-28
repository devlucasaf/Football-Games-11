import { estado } from "./core.js";
import { carregarDados, escolherJogador } from "./data.js";

const ALFABETO = ["ABCDEFGHI", "JKLMNOPQR", "STUVWXYZ"];
const PARTES = ["p-cabeca", "p-tronco", "p-braco-e", "p-braco-d", "p-perna-e", "p-perna-d"];

const elementosForca = {
    palavra:        document.getElementById("palavra"),
    teclado:        document.getElementById("teclado"),
    dica:           document.getElementById("dica"),
    quantidadeErros:     document.getElementById("errosCount"),
    letrasErradas:  document.getElementById("letrasErradas"),
    acertos:        document.getElementById("acertos"),
    sequencia:      document.getElementById("sequencia"),
    areaJogo:       document.getElementById("gameArea"),
    resultadoRodada:    document.getElementById("roundResult"),
    iconeRodada:      document.getElementById("roundIcon"),
    textoRodada:      document.getElementById("roundText"),
    respostaRodada:    document.getElementById("roundAnswer")
};

// --- MONTA O TECLADO VIRTUAL ---
function criarTeclado() {
    elementosForca.teclado.innerHTML = "";
    ALFABETO.forEach((linha) => {
        const linhaTeclado = document.createElement("div");
        linhaTeclado.className = "keyboard-row";
        [...linha].forEach((letra) => {
            const btnTentarLetra = document.createElement("button");
            btnTentarLetra.className = "forca-key";
            btnTentarLetra.textContent = letra;
            btnTentarLetra.dataset.letra = letra;
            btnTentarLetra.addEventListener("click", () => tentarLetra(letra));
            linhaTeclado.appendChild(btnTentarLetra);
        });
        elementosForca.teclado.appendChild(linhaTeclado);
    });
}

// --- RENDERIZA A PALAVRA ---
function renderizarPalavra() {
    elementosForca.palavra.innerHTML = "";
    [...estado.palavra].forEach((caractere) => {
        if (caractere === " ") {
            const espaco = document.createElement("span");
            espaco.className = "letra-espaco";
            elementosForca.palavra.appendChild(espaco);
            return;
        }
        const espacoLetra = document.createElement("span");
        espacoLetra.className = "letra-slot";
        if (estado.reveladas.has(caractere)) {
            espacoLetra.textContent = caractere;
            espacoLetra.classList.add("revelada");
        }
        elementosForca.palavra.appendChild(espacoLetra);
    });
}

// --- RENDERIZA O BONECO DA FORCA ---
function renderizarBoneco() {
    PARTES.forEach((identificadorParte, indiceParte) => {
        const parte = document.getElementById(identificadorParte);
        if (parte) {
            parte.classList.toggle("visivel", indiceParte < estado.erros);
        }
    });
}

// --- ATUALIZA O CONTADOR DE ERROS E AS LETRAS ERRADAS ---
function atualizarErros() {
    elementosForca.quantidadeErros.textContent = estado.erros;
    const erradas = [...estado.usadas].filter((letra) => !estado.palavra.includes(letra));
    elementosForca.letrasErradas.textContent = erradas.length ? erradas.join(" ") : "";
}

// --- ATUALIZA O PLACAR DA SESSÃO ---
function atualizarPlacar() {
    elementosForca.acertos.textContent = estado.acertos;
    elementosForca.sequencia.textContent = estado.sequencia;
}

// --- TENTA UMA LETRA ---
function tentarLetra(letra) {
    if (!estado.jogoAtivo || estado.usadas.has(letra)) {
        return;
    }
    estado.usadas.add(letra);

    const tecla = elementosForca.teclado.querySelector(`[data-letra="${letra}"]`);

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
    const letras = [...estado.palavra].filter((caractere) => caractere !== " ");
    const venceu = letras.every((letra) => estado.reveladas.has(letra));
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
            tamanho: estado.maximoErros
        });
        window.FG11Stats.mostrarModal("football-forca", {
            venceu: true,
            titulo: "Você salvou o jogador!",
            resposta: `Resposta: ${estado.atual.nome}`,
            tamanho: estado.maximoErros,
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
    if (estado.erros < estado.maximoErros) {
        return;
    }
    estado.jogoAtivo = false;
    estado.sequencia = 0;
    atualizarPlacar();

    [...estado.palavra].forEach((caractere) => {
        if (caractere !== " ") {
            estado.reveladas.add(caractere);
        }
    });
    renderizarPalavra();

    if (window.registrarDerrota) {
        window.registrarDerrota();
    }
    mostrarResultado(false);

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-forca", { venceu: false, tamanho: estado.maximoErros });
        window.FG11Stats.mostrarModal("football-forca", {
            venceu: false,
            titulo: "Enforcado! Fim da linha.",
            resposta: `Resposta: ${estado.atual.nome}`,
            tamanho: estado.maximoErros,
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
    elementosForca.teclado.querySelectorAll(".forca-key").forEach((btnTentarLetra) => (btnTentarLetra.disabled = true));
    elementosForca.areaJogo.classList.add("hidden");
    elementosForca.resultadoRodada.classList.remove("hidden");

    if (venceu) {
        elementosForca.iconeRodada.className = "round-icon correct";
        elementosForca.iconeRodada.innerHTML = "<i class=\"fas fa-check-circle\"></i>";
        elementosForca.textoRodada.textContent = "Você salvou o jogador!";
    } else {
        elementosForca.iconeRodada.className = "round-icon wrong";
        elementosForca.iconeRodada.innerHTML = "<i class=\"fas fa-skull\"></i>";
        elementosForca.textoRodada.textContent = "Enforcado! Fim da linha.";
    }

    elementosForca.respostaRodada.textContent = `Resposta: ${estado.atual.nome}`;
}

// --- INICIA UMA NOVA PALAVRA ---
function novaPalavra() {
    escolherJogador();
    elementosForca.dica.textContent = estado.atual.dica;
    criarTeclado();
    renderizarPalavra();
    renderizarBoneco();
    atualizarErros();
    elementosForca.resultadoRodada.classList.add("hidden");
    elementosForca.areaJogo.classList.remove("hidden");
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoForca() {
    await carregarDados();

    document.getElementById("btnSortearNovaPalavra").addEventListener("click", novaPalavra);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    document.addEventListener("keydown", (evento) => {
        const sobreposicaoTutorial = document.getElementById("tutorialOverlay");
        if (sobreposicaoTutorial && !sobreposicaoTutorial.classList.contains("hidden")) {
            return;
        }

        const letra = evento.key.toUpperCase();
        if (/^[A-Z]$/.test(letra)) {
            tentarLetra(letra);
        }
    });

    atualizarPlacar();
    novaPalavra();
}

inicializarJogoForca();
