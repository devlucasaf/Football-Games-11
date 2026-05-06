const LegendsTimes = {

    async iniciar() {
        try {
            await LegendsDados.carregarDados();
            this.renderizarGridTimes();
            this.atualizarEstatisticas();
            this.configurarEventos();
        } catch (erro) {
            console.error('Erro ao inicializar página de times:', erro);
            this.mostrarEstadoErro();
        }
    },

    renderizarGridTimes() {
        const gridTimes = document.getElementById('teamsGrid');
        const elementoCarregando = document.getElementById('loadingTeams');

        if (!LegendsDados.dadosTimes || !LegendsDados.dadosTimes.teams) {
            this.mostrarEstadoErro();
            return;
        }

        if (elementoCarregando) {
            elementoCarregando.style.display = 'none';
        }

        gridTimes.innerHTML = '';

        LegendsDados.dadosTimes.teams.forEach(time => {
            const cartao = this.criarCartaoTime(time);
            gridTimes.appendChild(cartao);
        });
    },

    criarCartaoTime(time) {
        const cartao = document.createElement('div');
        cartao.className = 'team-card';
        cartao.dataset.teamKey = time.key;

        const contagemPosicoes = LegendsDados.obterContagemPosicoes(time.players);

        cartao.innerHTML = `
            <div class="team-badge">
                <i class="fas fa-${time.type === 'club' ? 'shield-alt' : 'flag'}"></i>
            </div>

            <h3>${time.name}</h3>

            <div class="team-type">
                ${time.type === 'club' ? 'Clube' : 'Seleção'}
            </div>

            <div class="team-count">
                <i class="fas fa-users"></i>
                ${time.players.length} jogadores históricos
            </div>

            <div class="position-breakdown">
                ${contagemPosicoes.GK || 0} <i class="fas fa-goal-net"></i>
                ${contagemPosicoes.DEF || 0} <i class="fas fa-shield"></i>
                ${contagemPosicoes.MID || 0} <i class="fas fa-futbol"></i>
                ${contagemPosicoes.ATT || 0} <i class="fas fa-bolt"></i>
            </div>
        `;

        cartao.addEventListener('click', () => {
            window.location.href = `legendes-builder.html?team=${time.key}`;
        });

        return cartao;
    },

    atualizarEstatisticas() {
        if (!LegendsDados.dadosTimes) {
            return;
        }

        const totalTimesEl = document.getElementById('totalTeams');
        const totalJogadoresEl = document.getElementById('totalPlayers');

        if (totalTimesEl) {
            totalTimesEl.textContent = LegendsDados.dadosTimes.teams.length;
        }

        if (totalJogadoresEl) {
            const contagem = LegendsDados.dadosTimes.teams.reduce((total, time) => total + time.players.length, 0);
            totalJogadoresEl.textContent = contagem;
        }
    },

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

    configurarEventos() {
        const botaoTema = document.getElementById('themeToggle');
        if (botaoTema) {
            botaoTema.addEventListener('click', LegendsUtils.alternarTema);
        }
    }
};
