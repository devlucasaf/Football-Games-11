const GridInterface = {
    elementos: {
        inputJogador:       null,
        btnBuscar:          null,
        btnNovoGrid:        null,
        btnParar:           null,
        celulas:            [],
        cabecalhosColunas:  [],
        cabecalhosLinhas:   [],
        sugestoesEl:        null
    },

    // --- INICIAR ELEMENTOS DO DOM ---
    iniciarElementos() {
        this.elementos.inputJogador = document.getElementById("playerInput");
        this.elementos.btnBuscar = document.getElementById("searchBtn");
        this.elementos.btnNovoGrid = document.getElementById("newGridBtn");
        this.elementos.btnParar = document.getElementById("stopBtn");
        this.elementos.celulas = Array.from(document.querySelectorAll(".play-cell"));
        this.elementos.cabecalhosColunas = Array.from(document.querySelectorAll(".club-header"));
        this.elementos.cabecalhosLinhas = Array.from(document.querySelectorAll(".club-side"));

        // --- CRIA ELEMENTOS DE SUGESTÕES ---
        const containerInput = document.querySelector(".input-container");
        if (containerInput) {
            this.elementos.sugestoesEl = document.createElement("div");
            this.elementos.sugestoesEl.className = "suggestions-dropdown";
            this.elementos.sugestoesEl.style.display = "none";
            containerInput.style.position = "relative";
            containerInput.appendChild(this.elementos.sugestoesEl);
        }
    },

    // --- OBTER NOME DE EXIBIÇÃO ---
    obterNomeExibicao(tipo, chave) {
        if (tipo === "clube") {
            const info = GridDados.clubeExibicao.get(chave);
            return { 
                nome: (info?.nome ?? chave).toUpperCase(), 
                imagem: info?.escudo ?? null 
            };
        }
        const info = GridDados.paisExibicao.get(chave);
        return { 
            nome: (info?.nome ?? chave).toUpperCase(), 
            imagem: info?.bandeira ?? null 
        };
    },

    // --- APLICAR CABEÇALHOS ---
    aplicarCabecalhos(elementosCabecalho, chaves, tipo) {
        const { TAMANHO_GRID } = GridConfig;
        if (elementosCabecalho.length !== TAMANHO_GRID) {
            return;
        }

        for (let i = 0; i < TAMANHO_GRID; i++) {
            const chave = chaves[i];
            const el = elementosCabecalho[i];
            const { nome, imagem } = this.obterNomeExibicao(tipo, chave);

            el.innerHTML = "";
            if (imagem) {
                const img = document.createElement("img");
                img.src = imagem;
                img.alt = nome;
                img.title = nome;
                img.className = "header-badge";
                img.onerror = () => { el.textContent = nome; };
                el.appendChild(img);
            } else {
                el.textContent = nome;
            }
            el.dataset.type = tipo;
            el.dataset.key = chave;
        }
    },

    // --- APLICAR GRID NO DOM ---
    aplicarGridNoDOM(config) {
        const { linhas, colunas, linhasTipo, colunasTipo } = config;
        const { TAMANHO_GRID } = GridConfig;

        const cabColunas = document.querySelectorAll(".club-header");
        const cabLinhas = document.querySelectorAll(".club-side");
        const celulas = document.querySelectorAll(".play-cell");

        this.aplicarCabecalhos(Array.from(cabColunas), colunas, colunasTipo);
        this.aplicarCabecalhos(Array.from(cabLinhas), linhas, linhasTipo);

        celulas.forEach((celula, idx) => {
            const l = Math.floor(idx / TAMANHO_GRID);
            const c = idx % TAMANHO_GRID;

            celula.textContent = "";
            celula.classList.remove("correct", "selected", "wrong");

            celula.dataset.linha = linhas[l];
            celula.dataset.coluna = colunas[c];
            celula.dataset.linhaTipo = linhasTipo;
            celula.dataset.colunaTipo = colunasTipo;
        });
    },

    // --- MOSTRAR SUGESTÕES ---
    mostrarSugestoes(consulta, jogadoresUsados, aoSelecionar) {
        const sugestoesEl = this.elementos.sugestoesEl;
        if (!sugestoesEl) {
            return;
        }

        if (!consulta || consulta.length < 2) {
            this.esconderSugestoes();
            return;
        }

        const consultaNormalizada = GridConfig.normalizar(consulta);
        const correspondencias = GridDados.bancoJogadores
            .filter((j) => !jogadoresUsados.has(GridConfig.normalizar(j.nome)))
            .filter((j) => j.nomeCanon.includes(consultaNormalizada))
            .slice(0, 8);

        if (correspondencias.length === 0) {
            this.esconderSugestoes();
            return;
        }

        sugestoesEl.innerHTML = "";
        correspondencias.forEach((j) => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            item.textContent = j.nome;
            item.addEventListener("click", () => {
                this.elementos.inputJogador.value = j.nome;
                this.esconderSugestoes();
                aoSelecionar();
            });
            sugestoesEl.appendChild(item);
        });
        sugestoesEl.style.display = "block";
    },

    // --- ESCONDER SUGESTÕES ---
    esconderSugestoes() {
        const sugestoesEl = this.elementos.sugestoesEl;
        if (sugestoesEl) {
            sugestoesEl.style.display = "none";
            sugestoesEl.innerHTML = "";
        }
    }
};
