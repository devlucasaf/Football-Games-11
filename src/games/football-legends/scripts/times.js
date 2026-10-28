const LendasTimes = {
    async iniciar() {
        try {
            await LendasDados.carregarDados();
            this.renderizarGradeTimes();
            this.atualizarEstatisticas();
            this.configurarEventos();
        } catch (erro) {
            console.error("Erro ao inicializar página de times:", erro);
            this.mostrarEstadoErro();
        }
    },

    // --- RENDERIZAR GRID DE TIMES ---
    renderizarGradeTimes() {
        const gradeTimes = document.getElementById("teamsGrid");
        const elementoCarregando = document.getElementById("loadingTeams");

        if (!LendasDados.timesProcessados || LendasDados.timesProcessados.length === 0) {
            this.mostrarEstadoErro();
            return;
        }

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        gradeTimes.innerHTML = "";

        LendasDados.timesProcessados.forEach(time => {
            const cartao = this.criarCartaoTime(time);
            gradeTimes.appendChild(cartao);
        });
    },

    // --- CRIAR CARTÃO DE TIME ---
    criarCartaoTime(time) {
        const cartao = document.createElement("div");
        cartao.className = "team-card";
        cartao.dataset.teamKey = time.chave;
        cartao.dataset.teamType = time.tipo;

        const contagemPosicoes = LendasDados.obterContagemPosicoes(time.jogadores);

        const iconeAlternativo = time.tipo === "club" ? "shield-halved" : "flag";
        const conteudoEscudo = time.escudo
            ? `<img 
                    class="team-escudo" 
                    src="${time.escudo}" 
                    alt="${time.nome}"
                    loading="lazy" 
                    onerror="this.style.display='none';this.insertAdjacentHTML('afterend', '<i class=\\'fas fa-${iconeAlternativo}\\'></i>');"
                >`
            : `<i class="fas fa-${iconeAlternativo}"></i>`;

        cartao.innerHTML = `
            <div class="team-badge">
                ${conteudoEscudo}
            </div>

            <h3>${time.nome}</h3>

            <div class="team-type ${time.tipo === "club" ? "type-club" : "type-selecao"}">
                ${time.tipo === "club" ? "Clube" : "Seleção"}
            </div>

            <div class="team-count">
                <i class="fas fa-users"></i>
                ${time.jogadores.length} jogadores
            </div>

            <div class="position-breakdown">
                ${contagemPosicoes.goleiros || 0} <i class="fas fa-goal-net"></i>
                ${contagemPosicoes.defensores || 0} <i class="fas fa-shield"></i>
                ${contagemPosicoes.meioCampistas || 0} <i class="fas fa-futbol"></i>
                ${contagemPosicoes.atacantes || 0} <i class="fas fa-bolt"></i>
            </div>
        `;

        cartao.addEventListener("click", () => {
            window.location.href = `legendes-builder.html?team=${time.chave}`;
        });

        return cartao;
    },

    // --- ATUALIZAR ESTATÍSTICAS ---
    atualizarEstatisticas() {
        if (!LendasDados.timesProcessados.length) {
            return;
        }

        const elementoTotalTimes = document.getElementById("totalTeams");
        const elementoTotalJogadores = document.getElementById("totalPlayers");

        if (elementoTotalTimes) {
            elementoTotalTimes.textContent = LendasDados.timesProcessados.length;
        }

        if (elementoTotalJogadores) {
            const contagem = LendasDados.timesProcessados.reduce((total, time) => total + time.jogadores.length, 0);
            elementoTotalJogadores.textContent = contagem;
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
        const btnAlternarTema = document.getElementById("themeToggle");
        if (btnAlternarTema) {
            btnAlternarTema.addEventListener("click", LendasUtilitarios.alternarTema);
        }
    }
};
