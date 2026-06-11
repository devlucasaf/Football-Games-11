const EscalaConstrutor = {
    posicaoSelecionada: null,

    async iniciar() {
        try {
            const parametrosUrl = new URLSearchParams(window.location.search);
            const chaveTime = parametrosUrl.get('team');

            if (!chaveTime) {
                window.location.href = 'football-vc-escala.html';
                return;
            }

            await EscalaDados.carregarDados();

            EscalaDados.timeAtual = EscalaDados.timesProcessados.find(t => t.key === chaveTime);

            if (!EscalaDados.timeAtual) {
                window.location.href = 'football-vc-escala.html';
                return;
            }

            this.atualizarInterfaceConstrutor();
            this.renderizarListaJogadores();
            this.renderizarFormacao();
            this.configurarEventos();

        } catch (erro) {
            console.error('Erro ao inicializar construtor:', erro);
            window.location.href = 'football-vc-escala.html';
        }
    },

    // --- ATUALIZA OS ELEMENTOS DA INTERFACE COM INFORMAÇÕES DO TIME ---
    atualizarInterfaceConstrutor() {
        const nomeTimeEl = document.getElementById('teamName');
        const nomeCompletoEl = document.getElementById('teamFullName');
        const contagemJogadoresEl = document.getElementById('playerCount');
        const badgeEl = document.getElementById('teamBadge');

        if (nomeTimeEl) {
            nomeTimeEl.textContent = EscalaDados.timeAtual.name;
        }

        if (nomeCompletoEl) {
            nomeCompletoEl.textContent = `Escalação - ${EscalaDados.timeAtual.name}`;
        }

        if (contagemJogadoresEl) {
            contagemJogadoresEl.textContent = EscalaDados.timeAtual.players.length;
        }

        if (badgeEl) {
            badgeEl.innerHTML = EscalaConfig.obterEscudoHTML(EscalaDados.timeAtual.name);
        }
    },

    // --- RENDERIZA A LISTA DE JOGADORES DISPONÍVEIS PARA ESCALAÇÃO ---
    renderizarListaJogadores() {
        const listaJogadores = document.getElementById('playersList');
        const elementoCarregando = document.getElementById('loadingPlayers');

        if (elementoCarregando) {
            elementoCarregando.style.display = 'none';
        }

        if (!listaJogadores) {
            return;
        }

        // --- LIMPA A LISTA ANTERIOR ---
        listaJogadores.innerHTML = '';

        EscalaDados.timeAtual.players.forEach((jogador, indice) => {
            const elemento = this.criarElementoJogador(jogador, indice);
            listaJogadores.appendChild(elemento);
        });

        this.atualizarContagemCampo();
    },

    // --- CRIA O ELEMENTO HTML PARA UM JOGADOR NA LISTA ---
    criarElementoJogador(jogador, indice) {
        const div = document.createElement('div');

        div.className = 'player-item';
        if (EscalaDados.jogadorEstaSelecionado(jogador.name)) {
            div.classList.add('selected');
        }
        div.dataset.playerIndex = indice;

        const grupoPosicao = EscalaDados.obterGrupoPosicao(jogador.pos);

        div.innerHTML = `
            <div class="player-header">
                <span class="player-name">${jogador.name}</span>
                <span class="player-position">${jogador.pos}</span>
            </div>
            <div class="player-info">
                <span>${grupoPosicao}</span>
                <i class="fas fa-${EscalaDados.jogadorEstaSelecionado(jogador.name) ? 'check-circle' : 'plus-circle'}"></i>
            </div>
        `;

        div.addEventListener('click', () => {
            if (this.posicaoSelecionada) {
                EscalaDados.adicionarJogadorNaPosicao(indice, this.posicaoSelecionada);
                this.posicaoSelecionada = null;
                this.atualizarTudo();
            }
        });

        return div;
    },

    // --- RENDERIZA O CAMPO COM AS POSIÇÕES E JOGADORES SELECIONADOS ---
    renderizarFormacao() {
        const posicoesFormacao = document.getElementById('formationPositions');
        if (!posicoesFormacao) {
            return;
        }

        posicoesFormacao.innerHTML = '';

        const posicoes = EscalaConfig.formacoes[EscalaDados.formacaoAtual].posicoes;

        posicoes.forEach(pos => {
            const slot = this.criarSlotPosicao(pos);
            posicoesFormacao.appendChild(slot);
        });

        const formacaoAtualEl = document.getElementById('currentFormation');
        if (formacaoAtualEl) {
            formacaoAtualEl.textContent = EscalaDados.formacaoAtual;
        }
    },

    // --- CRIA UM SLOT DE POSIÇÃO NO CAMPO PARA COLOCAR UM JOGADOR ---
    criarSlotPosicao(posicao) {
        const slot = document.createElement('div');

        slot.className = 'position-slot';
        slot.dataset.position = posicao.id;
        slot.style.left = `${posicao.x}%`;
        slot.style.top = `${posicao.y}%`;

        // --- BUSCA O JOGADOR JÁ ATRIBUÍDO A ESTA POSIÇÃO ---
        const jogador = EscalaDados.jogadoresSelecionados.get(posicao.id);
        if (jogador) {
            slot.classList.add('filled');
            slot.innerHTML = `<div class="position-label">${jogador.name}</div>`;
        } else {
            slot.innerHTML = `<div class="position-label">${posicao.id}</div>`;
        }

        if (this.posicaoSelecionada === posicao.id) {
            slot.classList.add('active');
        }

        // --- ADICIONA EVENTO DE CLIQUE PARA SELECIONAR OU REMOVER JOGADOR ---
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (jogador) {
                EscalaDados.removerJogadorDaPosicao(posicao.id);
                this.posicaoSelecionada = null;
                this.atualizarTudo();
            } else {
                this.selecionarPosicao(posicao.id);
            }
        });

        return slot;
    },

    // --- SELECIONA UMA POSIÇÃO NO CAMPO E PREPARA PARA ADICIONAR JOGADOR ---
    selecionarPosicao(posicaoId) {
        this.posicaoSelecionada = posicaoId;
        this.renderizarFormacao();
        this.filtrarJogadoresPorPosicaoSlot(posicaoId);

        const painel = document.querySelector('.players-panel');
        if (painel) {
            painel.classList.add('highlight');
            painel.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    },

    // --- FILTRA JOGADORES COMPATÍVEIS COM A POSIÇÃO SELECIONADA ---
    filtrarJogadoresPorPosicaoSlot(posicaoId) {
        const listaJogadores = document.getElementById('playersList');
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll('.player-item');
        const posBase = posicaoId.replace(/[0-9]/g, '');

        let filtro;
        if (posBase === 'GK') {
            filtro = 'GK';
        } else if (posBase === 'ZAG') {
            filtro = 'ZAG';
        } else if (posBase === 'LD' || posBase === 'LE' || posBase === 'LAT') {
            filtro = 'LD/LE';
        } else if (['VOL', 'MEI', 'ME', 'MD', 'CAM', 'MOD', 'MOE'].includes(posBase)) {
            filtro = 'VOL/MEI';
        } else if (['ATA', 'CA', 'PD', 'PE', 'SA'].includes(posBase)) {
            filtro = 'ATA';
        } else {
            filtro = 'all';
        }

        // --- ATUALIZA O VALOR DO DROPDOWN DE FILTRO ---
        const filtroPosicao = document.getElementById('positionFilter');
        if (filtroPosicao) {
            filtroPosicao.value = filtro;
        }

        this.filtrarJogadoresPorPosicao(filtro);
    },

    // --- ATUALIZA TODA A INTERFACE COM AS MUDANÇAS REALIZADAS ---
    atualizarTudo() {
        this.renderizarFormacao();
        this.renderizarListaJogadores();
        this.atualizarJogadoresSelecionados();
        this.atualizarContagemCampo();

        // --- GERENCIA O DESTAQUE DO PAINEL DE JOGADORES ---
        const painel = document.querySelector('.players-panel');
        if (painel) {
            if (this.posicaoSelecionada) {
                painel.classList.add('highlight');
            } else {
                painel.classList.remove('highlight');
            }
        }

        // --- RESETA O FILTRO SE NENHUMA POSIÇÃO ESTÁ SELECIONADA ---
        if (!this.posicaoSelecionada) {
            const filtroPosicao = document.getElementById('positionFilter');
            if (filtroPosicao) {
                filtroPosicao.value = 'all';
            }
            this.filtrarJogadoresPorPosicao('all');
        }
    },

    // --- ATUALIZA A EXIBIÇÃO DOS JOGADORES JÁ SELECIONADOS ---
    atualizarJogadoresSelecionados() {
        const elementoSelecionados = document.getElementById('selectedPlayers');
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
        const grid = document.createElement('div');
        grid.className = 'selected-players-grid';

        EscalaDados.jogadoresSelecionados.forEach((jogador, posicao) => {
            const elemento = document.createElement('div');
            elemento.className = 'selected-player';
            elemento.innerHTML = `
                <div class="selected-player-name">${jogador.name}</div>
                <div class="selected-player-position">${posicao}</div>
            `;
            grid.appendChild(elemento);
        });

        elementoSelecionados.innerHTML = '';
        elementoSelecionados.appendChild(grid);
    },

    // --- ATUALIZA A CONTAGEM DE JOGADORES NO CAMPO ---
    atualizarContagemCampo() {
        const contagemEl = document.getElementById('fieldCount');
        if (contagemEl) {
            contagemEl.textContent = `${EscalaDados.jogadoresSelecionados.size}/11`;
        }
    },

    // --- MUDA A FORMAÇÃO DO TIME ---
    mudarFormacao(formacao) {
        if (EscalaConfig.formacoes[formacao]) {
            EscalaDados.formacaoAtual = formacao;
            this.renderizarFormacao();

            const menu = document.getElementById('formationsMenu');
            if (menu) {
                menu.classList.remove('active');
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
        const listaJogadores = document.getElementById('playersList');
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll('.player-item');

        itens.forEach(item => {
            const indice = parseInt(item.dataset.playerIndex);
            const jogador = EscalaDados.timeAtual.players[indice];

            if (filtro === 'all' || EscalaDados.posicaoCorrespondeAoFiltro(jogador.pos, filtro)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },

    // --- CONFIGURA TODOS OS EVENTOS DE CLIQUE E INTERAÇÃO DA PÁGINA ---
    configurarEventos() {
        // --- TEMA ---
        const botaoTema = document.getElementById('themeToggle');
        if (botaoTema) {
            botaoTema.addEventListener('click', EscalaUtils.alternarTema);
        }

        // --- ALTERNAR FORMAÇÃO ---
        const botaoFormacao = document.getElementById('formationToggle');
        if (botaoFormacao) {
            botaoFormacao.addEventListener('click', () => {
                const menu = document.getElementById('formationsMenu');
                menu.classList.toggle('active');
            });
        }

        // --- OPÇÕES DE FORMAÇÃO ---
        const opcoesFormacao = document.querySelectorAll('.formation-option');
        opcoesFormacao.forEach(opcao => {
            opcao.addEventListener('click', () => {
                this.mudarFormacao(opcao.dataset.formation);
            });
        });

        // --- FILTRO DE POSIÇÃO ---
        const filtroPosicao = document.getElementById('positionFilter');
        if (filtroPosicao) {
            filtroPosicao.addEventListener('change', (e) => {
                this.filtrarJogadoresPorPosicao(e.target.value);
            });
        }

        // --- REINICIAR TIME ---
        const botaoReiniciar = document.getElementById('resetTeam');
        if (botaoReiniciar) {
            botaoReiniciar.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja reiniciar toda a escalação?')) {
                    EscalaDados.reiniciarEscalacao();
                    this.atualizarTudo();
                }
            });
        }

        // --- SALVAR TIME ---
        const botaoSalvar = document.getElementById('saveTeam');
        if (botaoSalvar) {
            botaoSalvar.addEventListener('click', () => {
                if (EscalaDados.salvarTime()) {
                    this.mostrarModalSalvar();
                } else {
                    alert('Complete todas as 11 posições antes de salvar!');
                }
            });
        }

        // --- FECHAR MODAL ---
        const fecharModal = document.getElementById('closeModal');
        if (fecharModal) {
            fecharModal.addEventListener('click', () => {
                const modal = document.getElementById('saveModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // --- COMPARTILHAR TIME ---
        const botaoCompartilhar = document.getElementById('shareTeam');
        if (botaoCompartilhar) {
            botaoCompartilhar.addEventListener('click', () => {
                const texto = EscalaDados.gerarTextoCompartilhamento();
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Escalação copiada para a área de transferência!');
                }).catch(() => {
                    prompt('Copie o texto abaixo:', texto);
                });
            });
        }

        // --- NOVO TIME ---
        const botaoNovoTime = document.getElementById('newTeam');
        if (botaoNovoTime) {
            botaoNovoTime.addEventListener('click', () => {
                window.location.href = 'football-vc-escala.html';
            });
        }

        // --- FECHAR MENU AO CLICAR FORA ---
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('formationsMenu');
            const toggle = document.getElementById('formationToggle');

            if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    },

    // --- EXIBE O MODAL DE CONFIRMAÇÃO DE SALVAMENTO DA ESCALAÇÃO ---
    mostrarModalSalvar() {
        const modal = document.getElementById('saveModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
};
