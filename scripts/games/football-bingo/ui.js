import estado from "./core.js";

export function renderizarGrid() {
    const grid = document.getElementById("bingoGrid");
    grid.innerHTML = "";

    estado.gridCategorias.forEach((cat, idx) => {
        const btn = document.createElement("button");
        btn.className = "bingo-cell";
        btn.dataset.indice = idx;

        // --- MARCAR CÉLULAS JÁ ACERTADAS ---
        if (estado.celulasMarcadas.has(idx)) {
            btn.classList.add("correto", "locked");
        }

        // --- CONTEÚDO DA CÉLULA ---
        if (cat.tipo === "clube" && cat.escudo) {
            const img = document.createElement("img");
            img.className = "cell-escudo";
            img.src = cat.escudo;
            img.alt = cat.texto;
            img.onerror = () => {
                img.remove();
                const icon = document.createElement("i");
                icon.className = `fas ${cat.icone} cell-icon`;
                btn.prepend(icon);
            };
            btn.appendChild(img);
        } else if (cat.tipo === "selecao" && cat.bandeira) {
            const bandeira = document.createElement("span");
            bandeira.className = "cell-bandeira";
            bandeira.textContent = cat.bandeira;
            btn.appendChild(bandeira);
        } else {
            const icon = document.createElement("i");
            icon.className = `fas ${cat.icone} cell-icon`;
            btn.appendChild(icon);
        }

        const texto = document.createElement("span");
        texto.className = "cell-texto";
        texto.textContent = cat.texto;
        btn.appendChild(texto);

        grid.appendChild(btn);
    });
}

export function exibirJogador(jogador) {
    const nomeEl = document.getElementById("jogadorNome");
    nomeEl.textContent = jogador ? jogador.nome : "---";

    document.getElementById("confirmarBtn").style.display = jogador ? "" : "none";
    document.getElementById("proximoBtn").style.display = "none";
}

export function mostrarBotaoProximo() {
    document.getElementById("confirmarBtn").style.display = "none";
    document.getElementById("proximoBtn").style.display = "";
}

export function atualizarPlacar() {
    document.getElementById("jogadorNum").textContent = estado.jogadorIdx + 1;
    document.getElementById("jogadorTotal").textContent = estado.filaJogadores.length;
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("errosCount").textContent = estado.erros;
    document.getElementById("bingosCount").textContent = estado.bingos;

    const indicator = document.getElementById("bingoIndicator");
    if (estado.bingos > 0) {
        indicator.classList.add("has-bingo");
    } else {
        indicator.classList.remove("has-bingo");
    }
}

export function mostrarResultado(titulo, texto, icone) {
    document.getElementById("resultTitle").textContent = titulo;
    document.getElementById("resultText").textContent = texto;
    document.getElementById("resultIcon").innerHTML = icone;
    document.getElementById("resultOverlay").classList.add("active");
}

export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

// --- VERIFICAR BINGO ---
export function verificarBingos() {
    const marcadas = estado.celulasMarcadas;
    let bingos = 0;
    const linhasBingo = new Set();

    // --- LINHAS ---
    for (let row = 0; row < 5; row++) {
        const indices = [0, 1, 2, 3, 4].map(c => row * 5 + c);
        if (indices.every(i => marcadas.has(i))) {
            bingos++;
            indices.forEach(i => linhasBingo.add(i));
        }
    }

    // --- COLUNAS ---
    for (let col = 0; col < 5; col++) {
        const indices = [0, 1, 2, 3, 4].map(r => r * 5 + col);
        if (indices.every(i => marcadas.has(i))) {
            bingos++;
            indices.forEach(i => linhasBingo.add(i));
        }
    }

    // --- DIAGONAL PRINCIPAL ---
    const diag1 = [0, 6, 12, 18, 24];
    if (diag1.every(i => marcadas.has(i))) {
        bingos++;
        diag1.forEach(i => linhasBingo.add(i));
    }

    // --- DIAGONAL SECUNDÁRIA ---
    const diag2 = [4, 8, 12, 16, 20];
    if (diag2.every(i => marcadas.has(i))) {
        bingos++;
        diag2.forEach(i => linhasBingo.add(i));
    }

    estado.bingos = bingos;

    // --- DESTACAR LINHAS DE BINGO ---
    document.querySelectorAll(".bingo-cell").forEach((cell, idx) => {
        if (linhasBingo.has(idx)) {
            cell.classList.add("bingo-line");
        } else {
            cell.classList.remove("bingo-line");
        }
    });
}
