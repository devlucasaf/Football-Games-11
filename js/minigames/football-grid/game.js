const GridJogo = {
    jogoParado:         false,
    jogadoresUsados:    new Set(),
    celulaSelecionada:  null,
    gridAtual:          null,

    jogadorAtendeCelula(jogador, linhaChave, linhaTipo, colunaChave, colunaTipo) {
        const clubesJogador = new Set(jogador.clubes);
        const selecoesJogador = new Set(jogador.selecoes);

        if (linhaTipo === "clube" && colunaTipo === "clube") {
            return clubesJogador.has(linhaChave) && clubesJogador.has(colunaChave);
        }

        if (linhaTipo === "pais" && colunaTipo === "clube") {
            return selecoesJogador.has(linhaChave) && clubesJogador.has(colunaChave);
        }

        if (linhaTipo === "clube" && colunaTipo === "pais") {
            return clubesJogador.has(linhaChave) && selecoesJogador.has(colunaChave);
        }
        return false;
    },

    tratarPalpite() {
        const { inputJogador } = GridInterface.elementos;
        const celulas = GridInterface.elementos.celulas;

        if (this.jogoParado) {
            alert("Jogo encerrado. Clique em 🔄 para jogar novamente.");
            return;
        }

        if (!inputJogador) {
            return;
        }

        const palpite = inputJogador.value.trim();
        if (!palpite) {
            return;
        }

        if (!this.celulaSelecionada) {
            alert("Selecione uma célula do grid primeiro!");
            return;
        }

        if (this.celulaSelecionada.textContent.trim() !== "") {
            alert("Esta célula já foi preenchida. Selecione outra.");
            return;
        }

        const jogador = GridDados.buscarJogadorPorNome(palpite);
        if (!jogador) {
            alert("Jogador não encontrado no banco de dados.");
            inputJogador.value = "";
            GridInterface.esconderSugestoes();
            return;
        }

        const chaveUsada = GridConfig.normalizar(jogador.nome);
        if (this.jogadoresUsados.has(chaveUsada)) {
            alert("Este jogador já foi usado nesta grade.");
            inputJogador.value = "";
            GridInterface.esconderSugestoes();
            return;
        }

        const linhaChave    = this.celulaSelecionada.dataset.linha;
        const colunaChave   = this.celulaSelecionada.dataset.coluna;
        const linhaTipo     = this.celulaSelecionada.dataset.linhaTipo;
        const colunaTipo    = this.celulaSelecionada.dataset.colunaTipo;

        if (this.jogadorAtendeCelula(jogador, linhaChave, linhaTipo, colunaChave, colunaTipo)) {
            this.celulaSelecionada.textContent = jogador.nome;
            this.celulaSelecionada.classList.add("correct");
            this.celulaSelecionada.classList.remove("selected");
            this.jogadoresUsados.add(chaveUsada);
            this.celulaSelecionada = null;
            inputJogador.value = "";
            GridInterface.esconderSugestoes();
            this.verificarVitoria();
        } else {
            this.celulaSelecionada.classList.add("wrong");
            setTimeout(() => this.celulaSelecionada.classList.remove("wrong"), 600);
            alert("Este jogador não atende aos critérios desta célula.");
            inputJogador.value = "";
            GridInterface.esconderSugestoes();
        }
    },

    verificarVitoria() {
        const celulas = GridInterface.elementos.celulas;
        const todasPreenchidas = celulas.every((c) => c.textContent.trim() !== "");
        if (todasPreenchidas) {
            GridTemporizador.pararJogo("Parabéns! Você completou o grid! 🎉");
        }
    },

    selecionarCelula(celula) {
        if (this.jogoParado) {
            return;
        }

        if (celula.textContent.trim() !== "") {
            return;
        }

        const celulas = GridInterface.elementos.celulas;
        celulas.forEach((c) => c.classList.remove("selected"));
        celula.classList.add("selected");
        this.celulaSelecionada = celula;
        GridInterface.elementos.inputJogador.focus();
    },

    reiniciarJogo() {
        this.jogadoresUsados.clear();
        this.celulaSelecionada = null;
        this.jogoParado = false;
    },

    configurarEventos() {
        const { inputJogador, btnBuscar, btnNovoGrid, btnParar, celulas } = GridInterface.elementos;

        btnBuscar?.addEventListener("click", () => this.tratarPalpite());

        inputJogador?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.tratarPalpite();
            }
        });

        inputJogador?.addEventListener("input", () => {
            GridInterface.mostrarSugestoes(
                inputJogador.value,
                this.jogadoresUsados,
                () => this.tratarPalpite()
            );
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".input-container")) {
                GridInterface.esconderSugestoes();
            }
        });

        celulas.forEach((celula) => {
            celula.addEventListener("click", () => this.selecionarCelula(celula));
        });

        btnNovoGrid?.addEventListener("click", () => {
            const cfg = GridGerador.criarConfigGrid();
            if (!cfg) {
                alert("Não foi possível gerar uma grade válida. Tente novamente.");
                return;
            }

            this.reiniciarJogo();
            inputJogador.disabled = false;
            btnBuscar.disabled = false;
            btnParar.disabled = false;
            inputJogador.value = "";
            inputJogador.focus();
            celulas.forEach((c) => c.classList.remove("selected"));
            GridInterface.esconderSugestoes();

            this.gridAtual = cfg;
            GridInterface.aplicarGridNoDOM(cfg);
        });

        btnParar?.addEventListener("click", () => {
            GridTemporizador.pararJogo("Você desistiu! Clique em 🔄 para gerar um novo Grid.");
        });
    }
};
