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
            alert("Jogo encerrado. Clique no botão de reiniciar para jogar novamente.");
            return;
        }

        if (!inputJogador) {
            return;
        }

        const palpite = inputJogador.value.trim();
        if (!palpite) {
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

        const celulasVazias = celulas.filter((c) => c.textContent.trim() === "");
        let celulaAlvo = null;

        if (this.celulaSelecionada && this.celulaSelecionada.textContent.trim() === "") {
            const ok = this.jogadorAtendeCelula(
                jogador,
                this.celulaSelecionada.dataset.linha,
                this.celulaSelecionada.dataset.linhaTipo,
                this.celulaSelecionada.dataset.coluna,
                this.celulaSelecionada.dataset.colunaTipo
            );
            if (ok) celulaAlvo = this.celulaSelecionada;
        }

        if (!celulaAlvo) {
            celulaAlvo = celulasVazias.find((c) =>
                this.jogadorAtendeCelula(
                    jogador,
                    c.dataset.linha,
                    c.dataset.linhaTipo,
                    c.dataset.coluna,
                    c.dataset.colunaTipo
                )
            );
        }

        if (celulaAlvo) {
            celulaAlvo.textContent = jogador.nome;
            celulaAlvo.classList.add("correct");
            celulaAlvo.classList.remove("selected");
            this.jogadoresUsados.add(chaveUsada);
            this.celulaSelecionada = null;
            celulas.forEach((c) => c.classList.remove("selected"));
            inputJogador.value = "";
            GridInterface.esconderSugestoes();
            this.verificarVitoria();
        } else {
            alert("Este jogador não se encaixa em nenhuma célula disponível.");
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
            GridTemporizador.pararJogo("Você desistiu! Clique no botão de reiniciar para gerar um novo Grid.");
        });
    }
};
