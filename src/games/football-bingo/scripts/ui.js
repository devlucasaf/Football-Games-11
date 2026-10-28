import estado from "./core.js";

// --- RENDERIZA A GRADE DO BINGO ---
export function renderizarGradeCategorias() {
    const gradeCategorias = document.getElementById("bingoGrid");
    gradeCategorias.innerHTML = "";

    estado.gradeCategorias.forEach((categoria, indiceCategoria) => {
        const btnMarcarCategoria = document.createElement("button");
        btnMarcarCategoria.className = "bingo-cell";
        btnMarcarCategoria.dataset.indice = indiceCategoria;

        if (estado.celulasMarcadas.has(indiceCategoria)) {
            btnMarcarCategoria.classList.add("correto", "locked");
        }

        if (categoria.tipo === "clube" && categoria.escudo) {
            const imagemEscudo = document.createElement("img");
            imagemEscudo.className = "cell-escudo";
            imagemEscudo.src = categoria.escudo;
            imagemEscudo.alt = categoria.texto;
            imagemEscudo.onerror = () => {
                imagemEscudo.remove();
                const iconeCategoria = document.createElement("i");
                iconeCategoria.className = `fas ${categoria.icone} cell-icon`;
                btnMarcarCategoria.prepend(iconeCategoria);
            };
            btnMarcarCategoria.appendChild(imagemEscudo);
        } else if (categoria.tipo === "selecao" && categoria.bandeira) {
            const bandeira = document.createElement("span");
            bandeira.className = "cell-bandeira";
            bandeira.textContent = categoria.bandeira;
            btnMarcarCategoria.appendChild(bandeira);
        } else {
            const iconeCategoria = document.createElement("i");
            iconeCategoria.className = `fas ${categoria.icone} cell-icon`;
            btnMarcarCategoria.appendChild(iconeCategoria);
        }

        const texto = document.createElement("span");
        texto.className = "cell-texto";
        texto.textContent = categoria.texto;
        btnMarcarCategoria.appendChild(texto);

        gradeCategorias.appendChild(btnMarcarCategoria);
    });
}

// --- EXIBIR JOGADOR ATUAL ---
export function exibirJogador(jogador) {
    const nomeJogador = document.getElementById("jogadorNome");
    nomeJogador.textContent = jogador ? jogador.nome : "---";

    document.getElementById("btnConfirmarMarcacoes").style.display = jogador ? "" : "none";
    document.getElementById("btnExibirProximoJogador").style.display = "none";
}

// --- MOSTRAR BOTÃO PRÓXIMO ---
export function mostrarBotaoProximo() {
    document.getElementById("btnConfirmarMarcacoes").style.display = "none";
    document.getElementById("btnExibirProximoJogador").style.display = "";
}

// --- ATUALIZA O PLACAR ---
export function atualizarPlacar() {
    document.getElementById("jogadorNum").textContent = estado.indiceJogadorAtual + 1;
    document.getElementById("jogadorTotal").textContent = estado.filaJogadores.length;
    document.getElementById("acertosCount").textContent = estado.acertos;
    document.getElementById("errosCount").textContent = estado.erros;
    document.getElementById("bingosCount").textContent = estado.bingos;

    const indicadorBingo = document.getElementById("bingoIndicator");
    if (estado.bingos > 0) {
        indicadorBingo.classList.add("has-bingo");
    } else {
        indicadorBingo.classList.remove("has-bingo");
    }
}

// --- MOSTRAR RESULTADO ---
export function mostrarResultado(titulo, texto, icone) {
    document.getElementById("resultTitle").textContent = titulo;
    document.getElementById("resultText").textContent = texto;
    document.getElementById("resultIcon").innerHTML = icone;
    document.getElementById("resultOverlay").classList.add("active");
}

// --- ESCONDER RESULTADO ---
export function esconderResultado() {
    document.getElementById("resultOverlay").classList.remove("active");
}

// --- VERIFICA SE HÁ BINGOS ---
export function verificarBingos() {
    const marcadas = estado.celulasMarcadas;
    let bingos = 0;
    const linhasBingo = new Set();

    for (let indiceLinha = 0; indiceLinha < 5; indiceLinha++) {
        const indices = [0, 1, 2, 3, 4].map(indiceColuna => indiceLinha * 5 + indiceColuna);
        if (indices.every(indiceCelula => marcadas.has(indiceCelula))) {
            bingos++;
            indices.forEach(indiceCelula => linhasBingo.add(indiceCelula));
        }
    }

    for (let indiceColuna = 0; indiceColuna < 5; indiceColuna++) {
        const indices = [0, 1, 2, 3, 4].map(indiceLinha => indiceLinha * 5 + indiceColuna);
        if (indices.every(indiceCelula => marcadas.has(indiceCelula))) {
            bingos++;
            indices.forEach(indiceCelula => linhasBingo.add(indiceCelula));
        }
    }

    const diagonalPrincipal = [0, 6, 12, 18, 24];
    if (diagonalPrincipal.every(indiceCelula => marcadas.has(indiceCelula))) {
        bingos++;
        diagonalPrincipal.forEach(indiceCelula => linhasBingo.add(indiceCelula));
    }

    const diagonalSecundaria = [4, 8, 12, 16, 20];
    if (diagonalSecundaria.every(indiceCelula => marcadas.has(indiceCelula))) {
        bingos++;
        diagonalSecundaria.forEach(indiceCelula => linhasBingo.add(indiceCelula));
    }

    estado.bingos = bingos;

    document.querySelectorAll(".bingo-cell").forEach((btnMarcarCategoria, indiceCelula) => {
        if (linhasBingo.has(indiceCelula)) {
            btnMarcarCategoria.classList.add("bingo-line");
        } else {
            btnMarcarCategoria.classList.remove("bingo-line");
        }
    });
}
