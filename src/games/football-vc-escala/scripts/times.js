const EscalaTimes = {
    async iniciar() {
        try {
            await EscalaDados.carregarDados();
            this.renderizarGradeTimes();
            this.atualizarEstatisticas();
            this.configurarEventos();
        } catch (erro) {
            console.error("Erro ao inicializar página de times:", erro);
            this.mostrarEstadoErro();
        }
    },

    // --- RENDERIZA UM GRID COM CARTÕES DE TODOS OS TIMES DISPONÍVEIS ---
    renderizarGradeTimes() {
        const gradeTimes = document.getElementById("teamsGrid");
        const elementoCarregando = document.getElementById("loadingTeams");

        if (!EscalaDados.timesProcessados || EscalaDados.timesProcessados.length === 0) {
            this.mostrarEstadoErro();
            return;
        }

        if (elementoCarregando) {
            elementoCarregando.style.display = "none";
        }

        gradeTimes.innerHTML = "";

        EscalaDados.timesProcessados.forEach(time => {
            const cartao = this.criarCartaoTime(time);
            gradeTimes.appendChild(cartao);
        });
    },

    // --- CRIA O CARTÃO HTML PARA UM TIME ---
    criarCartaoTime(time) {
        const cartao = document.createElement("div");
        cartao.className = "team-card";
        cartao.dataset.chaveTime = time.chave;

        const contagemPosicoes = EscalaDados.obterContagemPosicoes(time.jogadores);

        cartao.innerHTML = `
            <div class="team-badge">
                ${EscalaConfiguracoes.obterMarcacaoEscudo(time.nome)}
            </div>

            <h3>${time.nome}</h3>

            <div class="team-type">Brasileirão 2026</div>

            <div class="team-count">
                <i class="fas fa-users"></i>
                ${time.jogadores.length} jogadores
            </div>

            <div class="position-breakdown">
                ${contagemPosicoes.GK || 0} <i class="fas fa-hands"></i>
                ${contagemPosicoes.DEF || 0} <i class="fas fa-shield"></i>
                ${contagemPosicoes.MID || 0} <i class="fas fa-futbol"></i>
                ${contagemPosicoes.ATT || 0} <i class="fas fa-bolt"></i>
            </div>
        `;

        cartao.addEventListener("click", () => {
            window.location.href = `escala-builder.html?team=${encodeURIComponent(time.chave)}`;
        });

        return cartao;
    },

    // --- ATUALIZA AS ESTATÍSTICAS EXIBIDAS NO TOPO DA PÁGINA ---
    atualizarEstatisticas() {
        if (!EscalaDados.timesProcessados.length) {
            return;
        }

        const elementoTotalTimes = document.getElementById("totalTeams");
        const elementoTotalJogadores = document.getElementById("totalPlayers");

        if (elementoTotalTimes) {
            elementoTotalTimes.textContent = EscalaDados.timesProcessados.length;
        }

        if (elementoTotalJogadores) {
            const contagem = EscalaDados.timesProcessados.reduce((total, time) => total + time.jogadores.length, 0);
            elementoTotalJogadores.textContent = contagem;
        }
    },

    // --- EXIBE A MENSAGEM DE ESTADO DE ERRO QUANDO OS DADOS NÃO CARREGAM ---
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

    // --- CONFIGURA TODOS OS EVENTOS DE INTERAÇÃO DA PÁGINA ---
    configurarEventos() {
        const botaoTema = document.getElementById("themeToggle");
        if (botaoTema) {
            botaoTema.addEventListener("click", EscalaUtilitarios.alternarTema);
        }
    }
};
