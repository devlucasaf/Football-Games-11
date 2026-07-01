const LegendsTimes = {
    async iniciar() {
        try {
            await LegendsDados.carregarDados();
            this.renderizarGridTimes();
            this.atualizarEstatisticas();
            this.configurarEventos();
        } catch (erro) {
            console.error("Erro ao inicializar página de times:", erro);
            this.mostrarEstadoErro();
        }
    },

    // --- RENDERIZAR GRID DE TIMES ---
    renderizarGridTimes() {
        const gridTimes = document.getElementById("teamsGrid");
        const elementoCarregando = document.getElementById("loadingTeams");

        if (!LegendsDados.timesProcessados || LegendsDados.timesProcessados.length === 0) {
            this.mostrarEstadoErro();
            return;
        }

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        gridTimes.innerHTML = "";

        LegendsDados.timesProcessados.forEach(time => {
            const cartao = this.criarCartaoTime(time);
            gridTimes.appendChild(cartao);
        });
    },

    // --- CRIAR CARTÃO DE TIME ---
    criarCartaoTime(time) {
        const cartao = document.createElement("div");
        cartao.className = "team-card";
        cartao.dataset.teamKey = time.key;
        cartao.dataset.teamType = time.type;

        const contagemPosicoes = LegendsDados.obterContagemPosicoes(time.players);

        const iconeFallback = time.type === "club" ? "shield-halved" : "flag";
        const conteudoBadge = time.escudo
            ? `<img 
                    class="team-escudo" 
                    src="${time.escudo}" 
                    alt="${time.name}" 
                    loading="lazy" 
                    onerror="this.style.display='none';this.insertAdjacentHTML('afterend', '<i class=\\'fas fa-${iconeFallback}\\'></i>');"
                >`
            : `<i class="fas fa-${iconeFallback}"></i>`;

        cartao.innerHTML = `
            <div class="team-badge">
                ${conteudoBadge}
            </div>

            <h3>${time.name}</h3>

            <div class="team-type ${time.type === "club" ? "type-club" : "type-selecao"}">
                ${time.type === "club" ? "Clube" : "Seleção"}
            </div>

            <div class="team-count">
                <i class="fas fa-users"></i>
                ${time.players.length} jogadores
            </div>

            <div class="position-breakdown">
                ${contagemPosicoes.GK || 0} <i class="fas fa-goal-net"></i>
                ${contagemPosicoes.DEF || 0} <i class="fas fa-shield"></i>
                ${contagemPosicoes.MID || 0} <i class="fas fa-futbol"></i>
                ${contagemPosicoes.ATT || 0} <i class="fas fa-bolt"></i>
            </div>
        `;

        cartao.addEventListener("click", () => {
            window.location.href = `legendes-builder.html?team=${time.key}`;
        });

        return cartao;
    },

    // --- ATUALIZAR ESTATÍSTICAS ---
    atualizarEstatisticas() {
        if (!LegendsDados.timesProcessados.length) {
            return;
        }

        const totalTimesEl = document.getElementById("totalTeams");
        const totalJogadoresEl = document.getElementById("totalPlayers");

        if (totalTimesEl) {
            totalTimesEl.textContent = LegendsDados.timesProcessados.length;
        }

        if (totalJogadoresEl) {
            const contagem = LegendsDados.timesProcessados.reduce((total, time) => total + time.players.length, 0);
            totalJogadoresEl.textContent = contagem;
        }
    },

    // --- MOSTRAR ESTADO DE ERRO ---
    mostrarEstadoErro() {
        const elementoCarregando = document.getElementById("loadingTeams");
        const elementoErro = document.getElementById("errorState");

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        if (elementoErro) {
            elementoErro.style.display = "block";
        }
    },

    // --- CONFIGURAR EVENTOS ---
    configurarEventos() {
        const botaoTema = document.getElementById("themeToggle");
        if (botaoTema) {
            botaoTema.addEventListener("click", LegendsUtils.alternarTema);
        }
    }
};
