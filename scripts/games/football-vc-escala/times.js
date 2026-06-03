const EscalaTimes = {
    async iniciar() {
        try {
            await EscalaDados.carregarDados();
            this.renderizarGridTimes();
            this.atualizarEstatisticas();
            this.configurarEventos();
        } catch (erro) {
            console.error('Erro ao inicializar página de times:', erro);
            this.mostrarEstadoErro();
        }
    },

    // --- RENDERIZA UM GRID COM CARTÕES DE TODOS OS TIMES DISPONÍVEIS ---
    renderizarGridTimes() {
        const gridTimes = document.getElementById('teamsGrid');
        const elementoCarregando = document.getElementById('loadingTeams');

        if (!EscalaDados.timesProcessados || EscalaDados.timesProcessados.length === 0) {
            this.mostrarEstadoErro();
            return;
        }

        if (elementoCarregando) {
            elementoCarregando.style.display = 'none';
        }

        gridTimes.innerHTML = '';

        EscalaDados.timesProcessados.forEach(time => {
            const cartao = this.criarCartaoTime(time);
            gridTimes.appendChild(cartao);
        });
    },

    // --- CRIA O CARTÃO HTML PARA UM TIME ---
    criarCartaoTime(time) {
        const cartao = document.createElement('div');
        cartao.className = 'team-card';
        cartao.dataset.teamKey = time.key;

        const contagemPosicoes = EscalaDados.obterContagemPosicoes(time.players);

        cartao.innerHTML = `
            <div class="team-badge">
                ${EscalaConfig.obterEscudoHTML(time.name)}
            </div>

            <h3>${time.name}</h3>

            <div class="team-type">Brasileirão 2026</div>

            <div class="team-count">
                <i class="fas fa-users"></i>
                ${time.players.length} jogadores
            </div>

            <div class="position-breakdown">
                ${contagemPosicoes.GK || 0} <i class="fas fa-hands"></i>
                ${contagemPosicoes.DEF || 0} <i class="fas fa-shield"></i>
                ${contagemPosicoes.MID || 0} <i class="fas fa-futbol"></i>
                ${contagemPosicoes.ATT || 0} <i class="fas fa-bolt"></i>
            </div>
        `;

        cartao.addEventListener('click', () => {
            window.location.href = `escala-builder.html?team=${encodeURIComponent(time.key)}`;
        });

        return cartao;
    },

    // --- ATUALIZA AS ESTATÍSTICAS EXIBIDAS NO TOPO DA PÁGINA ---
    atualizarEstatisticas() {
        if (!EscalaDados.timesProcessados.length) {
            return;
        }

        const totalTimesEl = document.getElementById('totalTeams');
        const totalJogadoresEl = document.getElementById('totalPlayers');

        if (totalTimesEl) {
            totalTimesEl.textContent = EscalaDados.timesProcessados.length;
        }

        if (totalJogadoresEl) {
            const contagem = EscalaDados.timesProcessados.reduce((total, time) => total + time.players.length, 0);
            totalJogadoresEl.textContent = contagem;
        }
    },

    // --- EXIBE A MENSAGEM DE ESTADO DE ERRO QUANDO OS DADOS NÃO CARREGAM ---
    mostrarEstadoErro() {
        const elementoCarregando = document.getElementById('loadingTeams');
        const elementoErro = document.getElementById('errorState');

        if (elementoCarregando) {
            elementoCarregando.style.display = 'none';
        }

        if (elementoErro) {
            elementoErro.style.display = 'block';
        }
    },

    // --- CONFIGURA TODOS OS EVENTOS DE INTERAÇÃO DA PÁGINA ---
    configurarEventos() {
        const botaoTema = document.getElementById('themeToggle');
        if (botaoTema) {
            botaoTema.addEventListener('click', EscalaUtils.alternarTema);
        }
    }
};
