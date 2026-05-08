const LegendsConstrutor = {

    async iniciar() {
        try {
            const parametrosUrl = new URLSearchParams(window.location.search);
            const chaveTime = parametrosUrl.get('team');

            if (!chaveTime) {
                window.location.href = 'football-legends.html';
                return;
            }

            await LegendsDados.carregarDados();

            LegendsDados.timeAtual = LegendsDados.timesProcessados.find(t => t.key === chaveTime);

            if (!LegendsDados.timeAtual) {
                window.location.href = 'football-legends.html';
                return;
            }

            this.atualizarInterfaceConstrutor();
            this.renderizarListaJogadores();
            this.renderizarFormacao();
            this.configurarEventos();
            this.configurarArrastarSoltar();

        } catch (erro) {
            console.error('Erro ao inicializar construtor:', erro);
            window.location.href = 'football-legends.html';
        }
    },

    atualizarInterfaceConstrutor() {
        const nomeTimeEl = document.getElementById('teamName');
        const nomeCompletoEl = document.getElementById('teamFullName');
        const contagemJogadoresEl = document.getElementById('playerCount');

        if (nomeTimeEl) {
            nomeTimeEl.textContent = LegendsDados.timeAtual.name;
        }

        if (nomeCompletoEl) {
            nomeCompletoEl.textContent = `Melhor XI Histórico - ${LegendsDados.timeAtual.name}`;
        }

        if (contagemJogadoresEl) {
            contagemJogadoresEl.textContent = LegendsDados.timeAtual.players.length;
        }
    },

    renderizarListaJogadores() {
        const listaJogadores = document.getElementById('playersList');
        const elementoCarregando = document.getElementById('loadingPlayers');

        if (elementoCarregando) {
            elementoCarregando.style.display = 'none';
        }

        if (!listaJogadores) {
            return;
        }

        listaJogadores.innerHTML = '';

        LegendsDados.timeAtual.players.forEach((jogador, indice) => {
            const elemento = this.criarElementoJogador(jogador, indice);
            listaJogadores.appendChild(elemento);
        });

        this.atualizarContagemCampo();
    },

    criarElementoJogador(jogador, indice) {
        const div = document.createElement('div');

        div.className = 'player-item';
        div.dataset.playerIndex = indice;
        div.draggable = true;

        const grupoPosicao = LegendsDados.obterGrupoPosicao(jogador.pos);

        div.innerHTML = `
            <div class="player-header">
                <span class="player-name">${jogador.name}</span>
                <span class="player-position">${jogador.pos}</span>
            </div>
            <div class="player-info">
                <span>${grupoPosicao}</span>
                <i class="fas fa-${LegendsDados.jogadorEstaSelecionado(jogador.name) ? 'check-circle' : 'plus-circle'}"></i>
            </div>
        `;

        return div;
    },

    renderizarFormacao() {
        const posicoesFormacao = document.getElementById('formationPositions');
        if (!posicoesFormacao) {
            return;
        }

        posicoesFormacao.innerHTML = '';

        const posicoes = LegendsConfig.formacoes[LegendsDados.formacaoAtual].posicoes;

        posicoes.forEach(pos => {
            const slot = this.criarSlotPosicao(pos);
            posicoesFormacao.appendChild(slot);
        });

        const formacaoAtualEl = document.getElementById('currentFormation');
        if (formacaoAtualEl) {
            formacaoAtualEl.textContent = LegendsDados.formacaoAtual;
        }
    },

    criarSlotPosicao(posicao) {
        const slot = document.createElement('div');

        slot.className = 'position-slot';
        slot.dataset.position = posicao.id;
        slot.style.left = `${posicao.x}%`;
        slot.style.top = `${posicao.y}%`;

        const jogador = LegendsDados.jogadoresSelecionados.get(posicao.id);
        if (jogador) {
            slot.classList.add('filled');
            slot.innerHTML = `<div class="position-label">${jogador.name}</div>`;
        } else {
            slot.innerHTML = `<div class="position-label">${posicao.id}</div>`;
        }

        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (jogador) {
                LegendsDados.removerJogadorDaPosicao(posicao.id);
                this.atualizarTudo();
            }
        });

        return slot;
    },

    configurarArrastarSoltar() {
        const itensJogador = document.querySelectorAll('.player-item');
        const slotsPosicao = document.querySelectorAll('.position-slot');

        itensJogador.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.playerIndex);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        slotsPosicao.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!slot.classList.contains('filled')) {
                    slot.style.borderColor = 'var(--accent-pink)';
                }
            });

            slot.addEventListener('dragleave', () => {
                slot.style.borderColor = '';
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const indiceJogador = e.dataTransfer.getData('text/plain');
                const posicao = slot.dataset.position;

                if (indiceJogador && posicao) {
                    LegendsDados.adicionarJogadorNaPosicao(parseInt(indiceJogador), posicao);
                    this.atualizarTudo();
                }

                slot.style.borderColor = '';
            });
        });
    },

    atualizarTudo() {
        this.renderizarFormacao();
        this.renderizarListaJogadores();
        this.atualizarJogadoresSelecionados();
        this.atualizarContagemCampo();
        this.configurarArrastarSoltar();
    },

    atualizarJogadoresSelecionados() {
        const elementoSelecionados = document.getElementById('selectedPlayers');
        if (!elementoSelecionados) {
            return;
        }

        if (LegendsDados.jogadoresSelecionados.size === 0) {
            elementoSelecionados.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Arraste jogadores para o campo ou clique nas posições vazias</p>
                </div>
            `;
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'selected-players-grid';

        LegendsDados.jogadoresSelecionados.forEach((jogador, posicao) => {
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

    atualizarContagemCampo() {
        const contagemEl = document.getElementById('fieldCount');
        if (contagemEl) {
            contagemEl.textContent = `${LegendsDados.jogadoresSelecionados.size}/11`;
        }
    },

    mudarFormacao(formacao) {
        if (LegendsConfig.formacoes[formacao]) {
            LegendsDados.formacaoAtual = formacao;
            this.renderizarFormacao();

            const menu = document.getElementById('formationsMenu');
            if (menu) {
                menu.classList.remove('active');
            }

            this.atualizarPosicoesParaFormacao();
        }
    },

    atualizarPosicoesParaFormacao() {
        const novosJogadores = new Map();

        LegendsDados.jogadoresSelecionados.forEach((jogador, posicaoAntiga) => {
            const novaPosicao = LegendsDados.encontrarPosicaoSimilar(posicaoAntiga);
            if (novaPosicao && !novosJogadores.has(novaPosicao)) {
                novosJogadores.set(novaPosicao, jogador);
            }
        });

        LegendsDados.jogadoresSelecionados = novosJogadores;
        this.atualizarTudo();
    },

    filtrarJogadoresPorPosicao(filtro) {
        const listaJogadores = document.getElementById('playersList');
        if (!listaJogadores) {
            return;
        }

        const itens = listaJogadores.querySelectorAll('.player-item');

        itens.forEach(item => {
            const indice = parseInt(item.dataset.playerIndex);
            const jogador = LegendsDados.timeAtual.players[indice];

            if (filtro === 'all' || LegendsDados.posicaoCorrespondeAoFiltro(jogador.pos, filtro)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },

    configurarEventos() {
        // --- TEMA ---
        const botaoTema = document.getElementById('themeToggle');
        if (botaoTema) {
            botaoTema.addEventListener('click', LegendsUtils.alternarTema);
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
                    LegendsDados.reiniciarEscalacao();
                    this.atualizarTudo();
                }
            });
        }

        // --- SALVAR TIME ---  
        const botaoSalvar = document.getElementById('saveTeam');
        if (botaoSalvar) {
            botaoSalvar.addEventListener('click', () => {
                if (LegendsDados.salvarTime()) {
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
                const texto = LegendsDados.gerarTextoCompartilhamento();
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
                window.location.href = 'football-legends.html';
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

    mostrarModalSalvar() {
        const modal = document.getElementById('saveModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
};
