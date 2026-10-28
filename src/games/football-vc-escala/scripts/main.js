const EscalaConstrutor = {
    posicaoSelecionada: null,

    async iniciar() {
        try {
            const parametrosUrl = new URLSearchParams(window.location.search);
            const chaveTime = parametrosUrl.get("team");

            if (!chaveTime) {
                window.location.href = "football-vc-escala.html";
                return;
            }

            await EscalaDados.carregarDados();

            EscalaDados.timeAtual = EscalaDados.timesProcessados.find(time => time.chave === chaveTime);

            if (!EscalaDados.timeAtual) {
                window.location.href = "football-vc-escala.html";
                return;
            }

            this.atualizarInterfaceConstrutor();
            this.renderizarListaJogadores();
            this.renderizarFormacao();
            this.configurarEventos();

        } catch (erro) {
            console.error("Erro ao inicializar construtor:", erro);
            window.location.href = "football-vc-escala.html";
        }
    },

    // --- ATUALIZA OS ELEMENTOS DA INTERFACE COM INFORMAÇÕES DO TIME ---
    atualizarInterfaceConstrutor() {
        const elementoNomeTime = document.getElementById("teamName");
        const elementoNomeCompleto = document.getElementById("teamFullName");
        const elementoContagemJogadores = document.getElementById("playerCount");
        const elementoEscudoTime = document.getElementById("teamBadge");

        if (elementoNomeTime) {
            elementoNomeTime.textContent = EscalaDados.timeAtual.nome;
        }

        if (elementoNomeCompleto) {
            elementoNomeCompleto.textContent = `Escalação - ${EscalaDados.timeAtual.nome}`;
        }

        if (elementoContagemJogadores) {
            elementoContagemJogadores.textContent = EscalaDados.timeAtual.jogadores.length;
        }

        if (elementoEscudoTime) {
            elementoEscudoTime.innerHTML = EscalaConfiguracoes.obterMarcacaoEscudo(EscalaDados.timeAtual.nome);
        }
    },

    // --- RENDERIZA A LISTA DE JOGADORES DISPONÍVEIS PARA ESCALAÇÃO ---
    renderizarListaJogadores() {
        const listaJogadores = document.getElementById("playersList");
        const elementoCarregando = document.getElementById("loadingPlayers");

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        if (!listaJogadores) {
            return;
        }

        // --- LIMPA A LISTA ANTERIOR ---
        listaJogadores.innerHTML = "";

        EscalaDados.timeAtual.jogadores.forEach((jogador, indice) => {
            const elemento = this.criarElementoJogador(jogador, indice);
            listaJogadores.appendChild(elemento);
        });

        this.atualizarContagemCampo();
    },

    // --- CRIA O ELEMENTO HTML PARA UM JOGADOR NA LISTA ---
    criarElementoJogador(jogador, indice) {
        const elementoJogador = document.createElement("div");

        elementoJogador.className = "player-item";
        if (EscalaDados.jogadorEstaSelecionado(jogador.nome)) {
            elementoJogador.classList.add("selected");
        }
        elementoJogador.dataset.indiceJogador = indice;

        const grupoPosicao = EscalaDados.obterGrupoPosicao(jogador.posicao);

        elementoJogador.innerHTML = `
            <div class="player-header">
                <span class="player-name">${jogador.nome}</span>
                <span class="player-position">${jogador.posicao}</span>
            </div>
            <div class="player-info">
                <span>${grupoPosicao}</span>
                <i class="fas fa-${EscalaDados.jogadorEstaSelecionado(jogador.nome) ? "check-circle" : "plus-circle"}"></i>
            </div>
        `;

        elementoJogador.addEventListener("click", () => {
            if (this.posicaoSelecionada) {
                EscalaDados.adicionarJogadorNaPosicao(indice, this.posicaoSelecionada);
                this.posicaoSelecionada = null;
                this.atualizarTudo();
            }
        });

        return elementoJogador;
    },

    // --- RENDERIZA O CAMPO COM AS POSIÇÕES E JOGADORES SELECIONADOS ---
    renderizarFormacao() {
        const posicoesFormacao = document.getElementById("formationPositions");
        if (!posicoesFormacao) {
            return;
        }

        posicoesFormacao.innerHTML = "";

        const posicoes = EscalaConfiguracoes.formacoes[EscalaDados.formacaoAtual].posicoes;

        posicoes.forEach(posicao => {
            const elementoPosicao = this.criarElementoPosicao(posicao);
            posicoesFormacao.appendChild(elementoPosicao);
        });

        const elementoFormacaoAtual = document.getElementById("currentFormation");
        if (elementoFormacaoAtual) {
            elementoFormacaoAtual.textContent = EscalaDados.formacaoAtual;
        }
    },

    // --- CRIA UM SLOT DE POSIÇÃO NO CAMPO PARA COLOCAR UM JOGADOR ---
    criarElementoPosicao(posicao) {
        const elementoPosicao = document.createElement("div");

        elementoPosicao.className = "position-slot";
        elementoPosicao.dataset.posicao = posicao.id;
        elementoPosicao.style.left = `${posicao.x}%`;
        elementoPosicao.style.top = `${posicao.y}%`;

        // --- BUSCA O JOGADOR JÁ ATRIBUÍDO A ESTA POSIÇÃO ---
        const jogador = EscalaDados.jogadoresSelecionados.get(posicao.id);
        if (jogador) {
            elementoPosicao.classList.add("filled");
            elementoPosicao.innerHTML = `<div class="position-label">${jogador.nome}</div>`;
        } else {
            elementoPosicao.innerHTML = `<div class="position-label">${posicao.id}</div>`;
        }

        if (this.posicaoSelecionada === posicao.id) {
            elementoPosicao.classList.add("active");
        }

        // --- ADICIONA EVENTO DE CLIQUE PARA SELECIONAR OU REMOVER JOGADOR ---
        elementoPosicao.addEventListener("click", (e) => {
            e.stopPropagation();
            if (jogador) {
                EscalaDados.removerJogadorDaPosicao(posicao.id);
                this.posicaoSelecionada = null;
                this.atualizarTudo();
            } else {
                this.selecionarPosicao(posicao.id);
            }
        });

        return elementoPosicao;
    },

    // --- SELECIONA UMA POSIÇÃO NO CAMPO E PREPARA PARA ADICIONAR JOGADOR ---
    selecionarPosicao(identificadorPosicao) {
        this.posicaoSelecionada = identificadorPosicao;
        this.renderizarFormacao();
        this.filtrarJogadoresPorPosicaoSelecionada(identificadorPosicao);

        const painel = document.querySelector(".players-panel");
        if (painel) {
            painel.classList.add("highlight");
            painel.scrollIntoView({ 
                behavior: "smooth", 
                block: "nearest" 
            });
        }
    },

    // --- FILTRA JOGADORES COMPATÍVEIS COM A POSIÇÃO SELECIONADA ---
    filtrarJogadoresPorPosicaoSelecionada(posicaoId) {
        const listaJogadores = document.getElementById("playersList");
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll(".player-item");
        const posicaoBase = posicaoId.replace(/[0-9]/g, "");

        let filtro;
        if (posicaoBase === "GK") {
            filtro = "GK";
        } else if (posicaoBase === "ZAG") {
            filtro = "ZAG";
        } else if (posicaoBase === "LD" || posicaoBase === "LE" || posicaoBase === "LAT") {
            filtro = "LD/LE";
        } else if (["VOL", "MEI", "ME", "MD", "CAM", "MOD", "MOE"].includes(posicaoBase)) {
            filtro = "VOL/MEI";
        } else if (["ATA", "CA", "PD", "PE", "SA"].includes(posicaoBase)) {
            filtro = "ATA";
        } else {
            filtro = "all";
        }

        // --- ATUALIZA O VALOR DO DROPDOWN DE FILTRO ---
        this.definirFiltroPosicao(filtro);
    },

    // --- ATUALIZA TODA A INTERFACE COM AS MUDANÇAS REALIZADAS ---
    atualizarTudo() {
        this.renderizarFormacao();
        this.renderizarListaJogadores();
        this.atualizarJogadoresSelecionados();
        this.atualizarContagemCampo();

        // --- GERENCIA O DESTAQUE DO PAINEL DE JOGADORES ---
        const painel = document.querySelector(".players-panel");
        if (painel) {
            if (this.posicaoSelecionada) {
                painel.classList.add("highlight");
            } else {
                painel.classList.remove("highlight");
            }
        }

        // --- RESETA O FILTRO SE NENHUMA POSIÇÃO ESTÁ SELECIONADA ---
        if (!this.posicaoSelecionada) {
            this.definirFiltroPosicao("all");
        }
    },

    // --- ATUALIZA A EXIBIÇÃO DOS JOGADORES JÁ SELECIONADOS ---
    atualizarJogadoresSelecionados() {
        const elementoSelecionados = document.getElementById("selectedPlayers");
        if (!elementoSelecionados) {
            return;
        }

        if (EscalaDados.jogadoresSelecionados.size === 0) {
            elementoSelecionados.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Clique numa posição no campo e depois selecione o jogador</p>
                </div>
            `;
            return;
        }

        // --- CRIA UM GRID PARA EXIBIR OS JOGADORES SELECIONADOS ---
        const gradeJogadoresSelecionados = document.createElement("div");
        gradeJogadoresSelecionados.className = "selected-players-grid";

        EscalaDados.jogadoresSelecionados.forEach((jogador, posicao) => {
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

    // --- ATUALIZA A CONTAGEM DE JOGADORES NO CAMPO ---
    atualizarContagemCampo() {
        const elementoContagemCampo = document.getElementById("fieldCount");
        if (elementoContagemCampo) {
            elementoContagemCampo.textContent = `${EscalaDados.jogadoresSelecionados.size}/11`;
        }
    },

    // --- MUDA A FORMAÇÃO DO TIME ---
    mudarFormacao(formacao) {
        if (EscalaConfiguracoes.formacoes[formacao]) {
            EscalaDados.formacaoAtual = formacao;
            this.renderizarFormacao();

            const menu = document.getElementById("formationsMenu");
            if (menu) {
                menu.classList.remove("active");
            }

            this.atualizarPosicoesParaFormacao();
        }
    },

    // --- REALOCA JOGADORES PARA POSIÇÕES SIMILARES NA NOVA FORMAÇÃO ---
    atualizarPosicoesParaFormacao() {
        const novosJogadores = new Map();

        EscalaDados.jogadoresSelecionados.forEach((jogador, posicaoAntiga) => {
            const novaPosicao = EscalaDados.encontrarPosicaoSimilar(posicaoAntiga);
            if (novaPosicao && !novosJogadores.has(novaPosicao)) {
                novosJogadores.set(novaPosicao, jogador);
            }
        });

        EscalaDados.jogadoresSelecionados = novosJogadores;
        this.atualizarTudo();
    },

    // --- FILTRA A LISTA DE JOGADORES POR TIPO DE POSIÇÃO ---
    filtrarJogadoresPorPosicao(filtro) {
        const listaJogadores = document.getElementById("playersList");
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll(".player-item");

        itens.forEach(item => {
            const indice = parseInt(item.dataset.indiceJogador);
            const jogador = EscalaDados.timeAtual.jogadores[indice];

            if (filtro === "all" || EscalaDados.posicaoCorrespondeAoFiltro(jogador.posicao, filtro)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    },

    // --- DEFINE O VALOR DO FILTRO DE POSIÇÃO (DROPDOWN CUSTOMIZADO) ---
    definirFiltroPosicao(valor) {
        const filtro = document.getElementById("positionFilter");
        const menu = document.getElementById("positionFilterMenu");
        const rotulo = document.getElementById("positionFilterLabel");

        if (filtro && menu && rotulo) {
            filtro.dataset.value = valor;
            menu.querySelectorAll(".position-filter-option").forEach(opcao => {
                const ativo = opcao.dataset.value === valor;
                opcao.classList.toggle("selected", ativo);
                if (ativo) {
                    rotulo.textContent = opcao.textContent;
                    rotulo.setAttribute("data-key", opcao.getAttribute("data-key") || "");
                }
            });
        }

        this.filtrarJogadoresPorPosicao(valor);
    },

    // --- CONFIGURA O DROPDOWN CUSTOMIZADO DO FILTRO DE POSIÇÃO ---
    configurarFiltroPosicao() {
        const filtro = document.getElementById("positionFilter");
        const botao = document.getElementById("positionFilterToggle");
        const menu = document.getElementById("positionFilterMenu");

        if (!filtro || !botao || !menu) {
            return;
        }

        const fecharMenu = () => {
            filtro.classList.remove("open");
            botao.setAttribute("aria-expanded", "false");
        };

        botao.addEventListener("click", (e) => {
            e.stopPropagation();
            const estaAberto = filtro.classList.toggle("open");
            botao.setAttribute("aria-expanded", estaAberto ? "true" : "false");
        });

        menu.querySelectorAll(".position-filter-option").forEach(opcao => {
            opcao.addEventListener("click", () => {
                this.definirFiltroPosicao(opcao.dataset.value);
                fecharMenu();
            });
        });

        document.addEventListener("click", (e) => {
            if (!filtro.contains(e.target)) {
                fecharMenu();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                fecharMenu();
            }
        });
    },

    // --- CONFIGURA TODOS OS EVENTOS DE CLIQUE E INTERAÇÃO DA PÁGINA ---
    configurarEventos() {
        // --- ALTERNAR FORMAÇÃO ---
        const botaoFormacao = document.getElementById("formationToggle");
        if (botaoFormacao) {
            botaoFormacao.addEventListener("click", () => {
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

        // --- FILTRO DE POSIÇÃO (DROPDOWN CUSTOMIZADO) ---
        this.configurarFiltroPosicao();

        // --- REINICIAR TIME ---
        const botaoReiniciar = document.getElementById("resetTeam");
        if (botaoReiniciar) {
            botaoReiniciar.addEventListener("click", () => {
                if (confirm("Tem certeza que deseja reiniciar toda a escalação?")) {
                    EscalaDados.reiniciarEscalacao();
                    this.atualizarTudo();
                }
            });
        }

        // --- SALVAR TIME ---
        const botaoSalvar = document.getElementById("saveTeam");
        if (botaoSalvar) {
            botaoSalvar.addEventListener("click", () => {
                if (EscalaDados.salvarTime()) {
                    this.mostrarModalSalvar();
                } else {
                    alert("Complete todas as 11 posições antes de salvar!");
                }
            });
        }

        // --- FECHAR MODAL ---
        const fecharModal = document.getElementById("closeModal");
        if (fecharModal) {
            fecharModal.addEventListener("click", () => {
                const modal = document.getElementById("saveModal");
                if (modal) {
                    modal.style.display = "none";
                }
            });
        }

        // --- COMPARTILHAR TIME ---
        const botaoCompartilhar = document.getElementById("shareTeam");
        if (botaoCompartilhar) {
            botaoCompartilhar.addEventListener("click", () => {
                const texto = EscalaDados.gerarTextoCompartilhamento();
                navigator.clipboard.writeText(texto).then(() => {
                    alert("Escalação copiada para a área de transferência!");
                }).catch(() => {
                    prompt("Copie o texto abaixo:", texto);
                });
            });
        }

        // --- NOVO TIME ---
        const botaoNovoTime = document.getElementById("newTeam");
        if (botaoNovoTime) {
            botaoNovoTime.addEventListener("click", () => {
                window.location.href = "football-vc-escala.html";
            });
        }

        // --- FECHAR MENU AO CLICAR FORA ---
        document.addEventListener("click", (e) => {
            const menu = document.getElementById("formationsMenu");
            const btnAlternarFormacoes = document.getElementById("formationToggle");

            if (menu && btnAlternarFormacoes && !menu.contains(e.target) && !btnAlternarFormacoes.contains(e.target)) {
                menu.classList.remove("active");
            }
        });
    },

    // --- EXIBE O MODAL DE CONFIRMAÇÃO DE SALVAMENTO DA ESCALAÇÃO ---
    mostrarModalSalvar() {
        const modal = document.getElementById("saveModal");
        if (modal) {
            modal.style.display = "flex";
        }
    }
};
