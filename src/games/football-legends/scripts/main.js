const LendasConstrutor = {
    async iniciar() {
        try {
            const parametrosUrl = new URLSearchParams(window.location.search);
            const chaveTime = parametrosUrl.get("team");

            if (!chaveTime) {
                window.location.href = "football-legends.html";
                return;
            }

            await LendasDados.carregarDados();

            LendasDados.timeAtual = LendasDados.timesProcessados.find(time => time.chave === chaveTime);

            if (!LendasDados.timeAtual) {
                window.location.href = "football-legends.html";
                return;
            }

            this.atualizarInterfaceConstrutor();
            this.renderizarListaJogadores();
            this.renderizarFormacao();
            this.configurarEventos();

        } catch (erro) {
            console.error("Erro ao inicializar construtor:", erro);
            window.location.href = "football-legends.html";
        }
    },

    // --- ATUALIZAR INTERFACE DO CONSTRUTOR ---
    atualizarInterfaceConstrutor() {
        const elementoNomeTime = document.getElementById("teamName");
        const elementoNomeCompleto = document.getElementById("teamFullName");
        const elementoContagemJogadores = document.getElementById("playerCount");

        if (elementoNomeTime) {
            elementoNomeTime.textContent = LendasDados.timeAtual.nome;
        }

        if (elementoNomeCompleto) {
            elementoNomeCompleto.textContent = `Melhor XI Histórico - ${LendasDados.timeAtual.nome}`;
        }

        if (elementoContagemJogadores) {
            elementoContagemJogadores.textContent = LendasDados.timeAtual.jogadores.length;
        }
    },

    // --- RENDERIZAR LISTA DE JOGADORES ---
    renderizarListaJogadores() {
        const listaJogadores = document.getElementById("playersList");
        const elementoCarregando = document.getElementById("loadingPlayers");

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        if (!listaJogadores) {
            return;
        }

        listaJogadores.innerHTML = "";

        LendasDados.timeAtual.jogadores.forEach((jogador, indice) => {
            const elemento = this.criarElementoJogador(jogador, indice);
            listaJogadores.appendChild(elemento);
        });

        this.atualizarContagemCampo();
    },

    // --- CRIAR ELEMENTO DE JOGADOR ---
    criarElementoJogador(jogador, indice) {
        const elementoJogador = document.createElement("div");

        const estaSelecionado = LendasDados.jogadorEstaSelecionado(jogador.nome);

        elementoJogador.className = `player-item${estaSelecionado ? " selected" : ""}`;
        elementoJogador.dataset.playerIndex = indice;

        const grupoPosicao = LendasDados.obterGrupoPosicao(jogador.posicao);

        elementoJogador.innerHTML = `
            <div class="player-header">
            <span class="player-name">${jogador.nome}</span>
            <span class="player-position">${jogador.posicao}</span>
            </div>
            <div class="player-info">
                <span>${grupoPosicao}</span>
                <i class="fas fa-${estaSelecionado ? "check-circle" : "plus-circle"}"></i>
            </div>
        `;

        elementoJogador.addEventListener("click", () => {
            const sucesso = LendasDados.adicionarJogadorAutomaticamente(indice);
            if (sucesso) {
                this.atualizarTudo();
            }
        });

        return elementoJogador;
    },

    // --- RENDERIZAR FORMAÇÃO ---
    renderizarFormacao() {
        const posicoesFormacao = document.getElementById("formationPositions");
        if (!posicoesFormacao) {
            return;
        }

        posicoesFormacao.innerHTML = "";

        const posicoes = LendasConfiguracao.formacoes[LendasDados.formacaoAtual].posicoes;

        posicoes.forEach(posicao => {
            const espacoPosicao = this.criarEspacoPosicao(posicao);
            posicoesFormacao.appendChild(espacoPosicao);
        });

        const elementoFormacaoAtual = document.getElementById("currentFormation");
        if (elementoFormacaoAtual) {
            elementoFormacaoAtual.textContent = LendasDados.formacaoAtual;
        }
    },

    // --- CRIAR SLOT DE POSIÇÃO ---
    criarEspacoPosicao(posicao) {
        const espacoPosicao = document.createElement("div");

        espacoPosicao.className = "position-slot";
        espacoPosicao.dataset.position = posicao.id;
        espacoPosicao.style.left = `${posicao.x}%`;
        espacoPosicao.style.top = `${posicao.y}%`;

        const jogador = LendasDados.jogadoresSelecionados.get(posicao.id);
        
        if (jogador) {
            espacoPosicao.classList.add("filled");
            espacoPosicao.innerHTML = `<div class="position-label">${jogador.nome}</div>`;
        } else {
            espacoPosicao.innerHTML = `<div class="position-label">${posicao.id}</div>`;
        }

        espacoPosicao.addEventListener("click", (evento) => {
            evento.stopPropagation();
            if (jogador) {
                LendasDados.removerJogadorDaPosicao(posicao.id);
                this.atualizarTudo();
            }
        });

        return espacoPosicao;
    },

    configurarArrastarSoltar() {
    },

    // --- ATUALIZAR TUDO ---
    atualizarTudo() {
        this.renderizarFormacao();
        this.renderizarListaJogadores();
        this.atualizarJogadoresSelecionados();
        this.atualizarContagemCampo();

        const filtroPosicao = document.getElementById("positionFilter");
        if (filtroPosicao) {
            this.filtrarJogadoresPorPosicao(filtroPosicao.dataset.value || "all");
        }
    },

    // --- ATUALIZAR JOGADORES SELECIONADOS ---
    atualizarJogadoresSelecionados() {
        const elementoSelecionados = document.getElementById("selectedPlayers");
        if (!elementoSelecionados) {
            return;
        }

        if (LendasDados.jogadoresSelecionados.size === 0) {
            elementoSelecionados.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p data-key="legends-builder-empty">Clique em um jogador da lista para escalá-lo no campo</p>
                </div>
            `;
            if (typeof aplicarTraducao === "function") {
                aplicarTraducao();
            }
            return;
        }

        const gradeJogadoresSelecionados = document.createElement("div");
        gradeJogadoresSelecionados.className = "selected-players-grid";

        LendasDados.jogadoresSelecionados.forEach((jogador, posicao) => {
            const elemento = document.createElement("div");
            elemento.className = "selected-player";
            elemento.innerHTML = `
                <div class="selected-player-name">${jogador.nome}</div>
                <div class="selected-player-position">${posicao}</div>
            `;
            gradeJogadoresSelecionados.appendChild(elemento);
        });

        elementoSelecionados.innerHTML = "";
        elementoSelecionados.appendChild(gradeJogadoresSelecionados);
    },

    // --- ATUALIZAR CONTAGEM DO CAMPO ---
    atualizarContagemCampo() {
        const elementoContagemCampo = document.getElementById("fieldCount");
        if (elementoContagemCampo) {
            elementoContagemCampo.textContent = `${LendasDados.jogadoresSelecionados.size}/11`;
        }
    },

    // --- MUDAR FORMAÇÃO ---
    mudarFormacao(formacao) {
        if (LendasConfiguracao.formacoes[formacao]) {
            LendasDados.formacaoAtual = formacao;
            this.renderizarFormacao();

            const menu = document.getElementById("formationsMenu");
            if (menu) {
                menu.classList.remove("active");
            }

            this.atualizarPosicoesParaFormacao();
        }
    },

    // --- ATUALIZAR POSIÇÕES PARA FORMAÇÃO ---
    atualizarPosicoesParaFormacao() {
        const novosJogadores = new Map();

        LendasDados.jogadoresSelecionados.forEach((jogador, posicaoAntiga) => {
            const novaPosicao = LendasDados.encontrarPosicaoSimilar(posicaoAntiga);
            if (novaPosicao && !novosJogadores.has(novaPosicao)) {
                novosJogadores.set(novaPosicao, jogador);
            }
        });

        LendasDados.jogadoresSelecionados = novosJogadores;
        this.atualizarTudo();
    },

    // --- FILTRAR JOGADORES POR POSIÇÃO ---
    filtrarJogadoresPorPosicao(filtro) {
        const listaJogadores = document.getElementById("playersList");
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll(".player-item");

        itens.forEach(item => {
            const indice = parseInt(item.dataset.playerIndex);
            const jogador = LendasDados.timeAtual.jogadores[indice];

            if (filtro === "all" || LendasDados.posicaoCorrespondeAoFiltro(jogador.posicao, filtro)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    },

    // --- CONFIGURAR FILTRO DE POSIÇÃO ---
    configurarFiltroPosicao() {
        const filtro = document.getElementById("positionFilter");
        const btnAlternarFiltroPosicao = document.getElementById("btnAlternarFiltroPosicao");
        const menu = document.getElementById("positionFilterMenu");
        const rotulo = document.getElementById("positionFilterLabel");

        if (!filtro || !btnAlternarFiltroPosicao || !menu || !rotulo) {
            return;
        }

        const fecharMenu = () => {
            filtro.classList.remove("open");
            btnAlternarFiltroPosicao.setAttribute("aria-expanded", "false");
        };

        btnAlternarFiltroPosicao.addEventListener("click", (evento) => {
            evento.stopPropagation();
            const estaAberto = filtro.classList.toggle("open");
            btnAlternarFiltroPosicao.setAttribute("aria-expanded", estaAberto ? "true" : "false");
        });

        menu.querySelectorAll(".position-filter-option").forEach(opcao => {
            opcao.addEventListener("click", () => {
                const valor = opcao.dataset.value;

                menu.querySelectorAll(".position-filter-option").forEach(opcaoFiltro => opcaoFiltro.classList.remove("selected"));
                opcao.classList.add("selected");

                filtro.dataset.value = valor;
                rotulo.textContent = opcao.textContent;
                rotulo.setAttribute("data-key", opcao.getAttribute("data-key") || "");

                this.filtrarJogadoresPorPosicao(valor);
                fecharMenu();
            });
        });

        document.addEventListener("click", (evento) => {
            if (!filtro.contains(evento.target)) {
                fecharMenu();
            }
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                fecharMenu();
            }
        });
    },

    // --- CONFIGURAR EVENTOS ---
    configurarEventos() {
        const btnAlternarFormacoes = document.getElementById("btnAlternarFormacoes");
        if (btnAlternarFormacoes) {
            btnAlternarFormacoes.addEventListener("click", () => {
                const menu = document.getElementById("formationsMenu");
                menu.classList.toggle("active");
            });
        }

        // --- OPÇÕES DE FORMAÇÃO ---
        const opcoesFormacao = document.querySelectorAll(".formation-option");
        opcoesFormacao.forEach(opcao => {
            opcao.addEventListener("click", () => {
                this.mudarFormacao(opcao.dataset.formation);
            });
        });

        // --- FILTRO DE POSIÇÃO ---
        this.configurarFiltroPosicao();

        // --- REINICIAR TIME ---
        const btnReiniciarEscalacao = document.getElementById("btnReiniciarEscalacao");
        if (btnReiniciarEscalacao) {
            btnReiniciarEscalacao.addEventListener("click", () => {
                if (confirm("Tem certeza que deseja reiniciar toda a escalação?")) {
                    LendasDados.reiniciarEscalacao();
                    this.atualizarTudo();
                }
            });
        }

        // --- SALVAR TIME ---  
        const btnSalvarEscalacao = document.getElementById("btnSalvarEscalacao");
        if (btnSalvarEscalacao) {
            btnSalvarEscalacao.addEventListener("click", () => {
                if (LendasDados.salvarTime()) {
                    this.mostrarModalSalvar();
                } else {
                    alert("Complete todas as 11 posições antes de salvar!");
                }
            });
        }

        // --- FECHAR MODAL ---
        const btnFecharModalEscalacaoSalva = document.getElementById("btnFecharModalEscalacaoSalva");
        if (btnFecharModalEscalacaoSalva) {
            btnFecharModalEscalacaoSalva.addEventListener("click", () => {
                const modal = document.getElementById("saveModal");
                if (modal) {
                    modal.style.display = "none";
                }
            });
        }

        // --- COMPARTILHAR TIME ---
        const btnCompartilharEscalacao = document.getElementById("btnCompartilharEscalacao");
        if (btnCompartilharEscalacao) {
            btnCompartilharEscalacao.addEventListener("click", () => {
                const texto = LendasDados.gerarTextoCompartilhamento();
                navigator.clipboard.writeText(texto).then(() => {
                    alert("Escalação copiada para a área de transferência!");
                }).catch(() => {
                    prompt("Copie o texto abaixo:", texto);
                });
            });
        }

        // --- NOVO TIME ---
        const btnEscolherNovoTime = document.getElementById("btnEscolherNovoTime");
        if (btnEscolherNovoTime) {
            btnEscolherNovoTime.addEventListener("click", () => {
                window.location.href = "football-legends.html";
            });
        }

        // --- FECHAR MENU AO CLICAR FORA ---
        document.addEventListener("click", (evento) => {
            const menu = document.getElementById("formationsMenu");
            const btnAlternarFormacoes = document.getElementById("btnAlternarFormacoes");

            if (menu && btnAlternarFormacoes && !menu.contains(evento.target) && !btnAlternarFormacoes.contains(evento.target)) {
                menu.classList.remove("active");
            }
        });
    },

    // --- MOSTRAR MODAL DE SALVAR ---
    mostrarModalSalvar() {
        const modal = document.getElementById("saveModal");
        if (modal) {
            modal.style.display = "flex";
        }
    }
};
