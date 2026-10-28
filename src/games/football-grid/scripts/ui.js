const GradeInterface = {
    elementos: {
        campoJogador:       null,
        btnBuscarJogador:   null,
        btnGerarNovaGrade:  null,
        btnDesistirPartida: null,
        celulas:            [],
        cabecalhosColunas:  [],
        cabecalhosLinhas:   [],
        elementoSugestoes:  null
    },

    // --- INICIAR ELEMENTOS DO DOM ---
    iniciarElementos() {
        this.elementos.campoJogador = document.getElementById("playerInput");
        this.elementos.btnBuscarJogador = document.getElementById("btnBuscarJogador");
        this.elementos.btnGerarNovaGrade = document.getElementById("btnGerarNovaGrade");
        this.elementos.btnDesistirPartida = document.getElementById("btnDesistirPartida");
        this.elementos.celulas = Array.from(document.querySelectorAll(".play-cell"));
        this.elementos.cabecalhosColunas = Array.from(document.querySelectorAll(".club-header"));
        this.elementos.cabecalhosLinhas = Array.from(document.querySelectorAll(".club-side"));

        // --- CRIA ELEMENTOS DE SUGESTÕES ---
        const recipienteCampo = document.querySelector(".input-field") || document.querySelector(".input-container");
        if (recipienteCampo) {
            this.elementos.elementoSugestoes = document.createElement("div");
            this.elementos.elementoSugestoes.className = "suggestions-dropdown";
            this.elementos.elementoSugestoes.style.display = "none";
            recipienteCampo.style.position = "relative";
            recipienteCampo.appendChild(this.elementos.elementoSugestoes);
        }
    },

    // --- OBTER NOME DE EXIBIÇÃO ---
    obterNomeExibicao(tipo, chave) {
        if (tipo === "clube") {
            const informacoes = GradeDados.clubeExibicao.get(chave);
            return { 
                nome: String(informacoes?.nome ?? chave).toUpperCase(),
                imagem: informacoes?.escudo ?? null
            };
        }
        const informacoes = GradeDados.paisExibicao.get(chave);
        return { 
            nome: String(informacoes?.nome ?? chave).toUpperCase(),
            imagem: informacoes?.bandeira ?? null
        };
    },

    // --- APLICAR CABEÇALHOS ---
    aplicarCabecalhos(elementosCabecalho, chaves, tipo) {
        const { TAMANHO_GRADE } = GradeConfiguracao;
        if (elementosCabecalho.length !== TAMANHO_GRADE) {
            return;
        }

        for (let indiceCabecalho = 0; indiceCabecalho < TAMANHO_GRADE; indiceCabecalho++) {
            const chave = chaves[indiceCabecalho];
            const elementoCabecalho = elementosCabecalho[indiceCabecalho];
            const { nome, imagem } = this.obterNomeExibicao(tipo, chave);

            elementoCabecalho.innerHTML = "";
            if (imagem) {
                const imagemCabecalho = document.createElement("img");
                imagemCabecalho.src = imagem;
                imagemCabecalho.alt = nome;
                imagemCabecalho.title = nome;
                imagemCabecalho.className = "header-badge";
                imagemCabecalho.onerror = () => { elementoCabecalho.textContent = nome; };
                elementoCabecalho.appendChild(imagemCabecalho);
            } else {
                elementoCabecalho.textContent = nome;
            }
            elementoCabecalho.dataset.type = tipo;
            elementoCabecalho.dataset.key = chave;
        }
    },

    // --- APLICAR GRID NO DOM ---
    aplicarGradeNaPagina(configuracaoGrade) {
        const { linhas, colunas, linhasTipo, colunasTipo } = configuracaoGrade;
        const { TAMANHO_GRADE } = GradeConfiguracao;

        const cabecalhosColunas = document.querySelectorAll(".club-header");
        const cabecalhosLinhas = document.querySelectorAll(".club-side");
        const celulas = document.querySelectorAll(".play-cell");

        this.aplicarCabecalhos(Array.from(cabecalhosColunas), colunas, colunasTipo);
        this.aplicarCabecalhos(Array.from(cabecalhosLinhas), linhas, linhasTipo);

        celulas.forEach((celula, indiceCelula) => {
            const indiceLinha = Math.floor(indiceCelula / TAMANHO_GRADE);
            const indiceColuna = indiceCelula % TAMANHO_GRADE;

            celula.textContent = "";
            celula.classList.remove("correct", "selected", "wrong");

            celula.dataset.linha = linhas[indiceLinha];
            celula.dataset.coluna = colunas[indiceColuna];
            celula.dataset.linhaTipo = linhasTipo;
            celula.dataset.colunaTipo = colunasTipo;
        });
    },

    // --- MOSTRAR SUGESTÕES ---
    mostrarSugestoes(consulta, jogadoresUsados, aoSelecionar) {
        const elementoSugestoes = this.elementos.elementoSugestoes;
        if (!elementoSugestoes) {
            return;
        }

        if (!consulta || consulta.length < 2) {
            this.esconderSugestoes();
            return;
        }

        const consultaNormalizada = GradeConfiguracao.normalizarTexto(consulta);
        const correspondencias = GradeDados.bancoJogadores
            .filter((jogador) => !jogadoresUsados.has(GradeConfiguracao.normalizarTexto(jogador.nome)))
            .filter((jogador) => jogador.nomeCanonico.includes(consultaNormalizada))
            .slice(0, 30);

        if (correspondencias.length === 0) {
            this.esconderSugestoes();
            return;
        }

        elementoSugestoes.innerHTML = "";
        correspondencias.forEach((jogador) => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            item.textContent = jogador.nome;
            item.addEventListener("click", () => {
                this.elementos.campoJogador.value = jogador.nome;
                this.esconderSugestoes();
                aoSelecionar();
            });
            elementoSugestoes.appendChild(item);
        });
        elementoSugestoes.style.display = "block";
    },

    // --- ESCONDER SUGESTÕES ---
    esconderSugestoes() {
        const elementoSugestoes = this.elementos.elementoSugestoes;
        if (elementoSugestoes) {
            elementoSugestoes.style.display = "none";
            elementoSugestoes.innerHTML = "";
        }
    }
};
