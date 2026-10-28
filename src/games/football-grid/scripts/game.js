const GradeJogo = {
    jogoParado:         false,
    jogadoresUsados:    new Set(),
    celulaSelecionada:  null,
    gradeAtual:         null,

    // --- VERIFICAR SE JOGADOR ATENDE A CÉLULA ---
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

    // --- TRATAR PALPITE DO JOGADOR ---
    tratarPalpite() {
        const { campoJogador } = GradeInterface.elementos;
        const celulas = GradeInterface.elementos.celulas;

        if (this.jogoParado) {
            alert("Jogo encerrado. Clique no botão de reiniciar para jogar novamente.");
            return;
        }

        if (!campoJogador) {
            return;
        }

        const palpite = campoJogador.value.trim();
        if (!palpite) {
            return;
        }

        const jogador = GradeDados.buscarJogadorPorNome(palpite);
        if (!jogador) {
            alert("Jogador não encontrado no banco de dados.");
            campoJogador.value = "";
            GradeInterface.esconderSugestoes();
            return;
        }

        const chaveUsada = GradeConfiguracao.normalizarTexto(jogador.nome);
        if (this.jogadoresUsados.has(chaveUsada)) {
            alert("Este jogador já foi usado nesta grade.");
            campoJogador.value = "";
            GradeInterface.esconderSugestoes();
            return;
        }

        const celulasVazias = celulas.filter((celula) => !celula.classList.contains("correct"));
        let celulaAlvo = null;

        if (this.celulaSelecionada && !this.celulaSelecionada.classList.contains("correct")) {
            const jogadorCompativel = this.jogadorAtendeCelula(
                jogador,
                this.celulaSelecionada.dataset.linha,
                this.celulaSelecionada.dataset.linhaTipo,
                this.celulaSelecionada.dataset.coluna,
                this.celulaSelecionada.dataset.colunaTipo
            );

            if (jogadorCompativel) {
                celulaAlvo = this.celulaSelecionada;
            }
        }

        if (!celulaAlvo) {
            celulaAlvo = celulasVazias.find((celula) =>
                this.jogadorAtendeCelula(
                    jogador,
                    celula.dataset.linha,
                    celula.dataset.linhaTipo,
                    celula.dataset.coluna,
                    celula.dataset.colunaTipo
                )
            );
        }

        if (celulaAlvo) {
            celulaAlvo.textContent = "";
            celulaAlvo.innerHTML = "";

            if (jogador.foto) {
                const imagem = document.createElement("img");

                imagem.src = jogador.foto;
                imagem.alt = jogador.nome;
                imagem.title = jogador.nome;
                imagem.className = "player-photo";
                imagem.onerror = () => { celulaAlvo.textContent = jogador.nome; };

                celulaAlvo.appendChild(imagem);
            } else {
                celulaAlvo.textContent = jogador.nome;
            }

            celulaAlvo.classList.add("correct");
            celulaAlvo.classList.remove("selected");
            this.jogadoresUsados.add(chaveUsada);
            this.celulaSelecionada = null;
            celulas.forEach((celula) => celula.classList.remove("selected"));
            campoJogador.value = "";
            GradeInterface.esconderSugestoes();
            this.verificarVitoria();
        } else {
            alert("Este jogador não se encaixa em nenhuma célula disponível.");
            campoJogador.value = "";
            GradeInterface.esconderSugestoes();
        }
    },

    // --- VERIFICAR VITÓRIA ---
    verificarVitoria() {
        const celulas = GradeInterface.elementos.celulas;
        const todasPreenchidas = celulas.every((celula) => celula.classList.contains("correct"));
        if (todasPreenchidas) {
            GradeTemporizador.pararJogo("Parabéns! Você completou o grid! 🎉");
            if (window.registrarVitoria) {
                window.registrarVitoria();
            }
        }
    },

    // --- SELECIONAR CÉLULA ---
    selecionarCelula(celula) {
        if (this.jogoParado) {
            return;
        }

        if (celula.classList.contains("correct")) {
            return;
        }

        const celulas = GradeInterface.elementos.celulas;
        celulas.forEach((elementoCelula) => elementoCelula.classList.remove("selected"));
        celula.classList.add("selected");
        this.celulaSelecionada = celula;
        GradeInterface.elementos.campoJogador.focus();
    },

    // --- REINICIAR JOGO ---
    reiniciarJogo() {
        this.jogadoresUsados.clear();
        this.celulaSelecionada = null;
        this.jogoParado = false;
    },

    // --- CONFIGURAR EVENTOS ---
    configurarEventos() {
        const { campoJogador, btnBuscarJogador, btnGerarNovaGrade, btnDesistirPartida, celulas } = GradeInterface.elementos;

        btnBuscarJogador?.addEventListener("click", () => this.tratarPalpite());

        campoJogador?.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                this.tratarPalpite();
            }
        });

        campoJogador?.addEventListener("input", () => {
            GradeInterface.mostrarSugestoes(
                campoJogador.value,
                this.jogadoresUsados,
                () => this.tratarPalpite()
            );
        });

        document.addEventListener("click", (evento) => {
            if (!evento.target.closest(".input-container")) {
                GradeInterface.esconderSugestoes();
            }
        });

        celulas.forEach((celula) => {
            celula.addEventListener("click", () => this.selecionarCelula(celula));
        });

        btnGerarNovaGrade?.addEventListener("click", () => {
            const configuracaoGrade = GradeGerador.criarConfiguracaoGrade();
            if (!configuracaoGrade) {
                alert("Não foi possível gerar uma grade válida. Tente novamente.");
                return;
            }

            this.reiniciarJogo();
            campoJogador.disabled = false;
            btnBuscarJogador.disabled = false;
            btnDesistirPartida.disabled = false;
            campoJogador.value = "";
            campoJogador.focus();
            celulas.forEach((celula) => celula.classList.remove("selected"));
            GradeInterface.esconderSugestoes();

            this.gradeAtual = configuracaoGrade;
            GradeInterface.aplicarGradeNaPagina(configuracaoGrade);
        });

        btnDesistirPartida?.addEventListener("click", () => {
            GradeTemporizador.pararJogo("Você desistiu! Clique no botão de reiniciar para gerar um novo Grid.");
            if (window.registrarDerrota) {
                window.registrarDerrota();
            }
        });
    }
};
