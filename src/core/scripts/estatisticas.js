// --- ESTATÍSTICAS DOS JOGOS ---
(function () {
    const PREFIXO_CHAVE_ESTATISTICAS = "fg11_stats_";

    // --- LÊ AS ESTATÍSTICAS DE UM JOGO ---
    function obterEstatisticasJogo(identificadorJogo, tamanho) {
        let dados = null;
        try {
            dados = JSON.parse(localStorage.getItem(PREFIXO_CHAVE_ESTATISTICAS + identificadorJogo));
        } catch (erro) {
            dados = null;
        }

        if (!dados || typeof dados !== "object") {
            dados = { 
                vitorias: 0, 
                derrotas: 0, 
                distribuicao: [] 
            };
        }

        if (!Array.isArray(dados.distribuicao)) {
            dados.distribuicao = [];
        }

        while (dados.distribuicao.length < tamanho) {
            dados.distribuicao.push(0);
        }

        dados.vitorias = dados.vitorias || 0;
        dados.derrotas = dados.derrotas || 0;
        return dados;
    }

    // --- SALVA AS ESTATÍSTICAS DE UM JOGO ---
    function salvarEstatisticasJogo(identificadorJogo, dados) {
        localStorage.setItem(PREFIXO_CHAVE_ESTATISTICAS + identificadorJogo, JSON.stringify(dados));
    }

    const CHAVE_SEQUENCIA_DIAS = "fg11_streak";

    // --- DATA LOCAL, COMPARTILHADA COM O MODO DIÁRIO ---
    function diaDeHoje() {
        return window.FG11Daily.diaDeHoje();
    }

    // --- LÊ A SEQUÊNCIA DE DIAS ---
    function obterSequenciaDias() {
        let dados = null;
        try {
            dados = JSON.parse(localStorage.getItem(CHAVE_SEQUENCIA_DIAS));
        } catch (erro) {
            dados = null;
        }
        
        if (!dados || typeof dados !== "object") {
            dados = { 
                ultimoDia: null, 
                sequencia: 0, 
                recorde: 0 
            };
        }
        dados.sequencia = dados.sequencia || 0;
        dados.recorde = dados.recorde || 0;
        dados.ultimoDia = dados.ultimoDia || null;
        return dados;
    }

    // --- ATUALIZA A SEQUÊNCIA DE DIAS AO JOGAR ---
    function atualizarSequenciaDias() {
        const dados = obterSequenciaDias();
        const hoje = diaDeHoje();

        if (dados.ultimoDia === hoje) {
            return dados;
        }

        let sequenciaNova = 1;
        if (dados.ultimoDia) {
            const anterior = new Date(dados.ultimoDia + "T00:00:00");
            const atual = new Date(hoje + "T00:00:00");
            const diferencaDias = Math.round((atual - anterior) / 86400000);
            if (diferencaDias === 1) {
                sequenciaNova = dados.sequencia + 1;
            }
        }

        dados.sequencia = sequenciaNova;
        dados.ultimoDia = hoje;
        if (sequenciaNova > dados.recorde) {
            dados.recorde = sequenciaNova;
        }

        localStorage.setItem(CHAVE_SEQUENCIA_DIAS, JSON.stringify(dados));
        return dados;
    }

    // --- REGISTRA O RESULTADO DE UMA PARTIDA ---
    function registrarResultadoPartida(identificadorJogo, opcoes) {
        const { venceu, bucket: indiceDistribuicao, tamanho } = opcoes;
        const dados = obterEstatisticasJogo(identificadorJogo, tamanho);

        if (venceu) {
            dados.vitorias++;
            if (typeof indiceDistribuicao === "number" && indiceDistribuicao >= 0 && indiceDistribuicao < tamanho) {
                dados.distribuicao[indiceDistribuicao]++;
            }
        } else {
            dados.derrotas++;
        }

        salvarEstatisticasJogo(identificadorJogo, dados);
        atualizarSequenciaDias();
        window.FG11Daily.registrarResultado(identificadorJogo, venceu);

        if (window.FG11Perfil) {
            setTimeout(window.FG11Perfil.avisarNovasConquistas, 900);
        }
        return dados;
    }

    // --- TEXTO TRADUZIDO COM FALLBACK ---
    function obterTextoEstatisticas(chave, padrao) {
        if (window.fg11Texto) {
            return window.fg11Texto(chave, padrao);
        } else {
            return padrao;
        }
    }

    // --- FECHA A TELA DE ESTATÍSTICAS ---
    function fecharEstatisticas() {
        const existente = document.getElementById("fg11StatsOverlay");
        if (existente) {
            existente.remove();
        }
        document.removeEventListener("keydown", aoPressionarTeclaEstatisticas);
    }

    // --- FECHA COM A TECLA ESC ---
    function aoPressionarTeclaEstatisticas(evento) {
        if (evento.key === "Escape") {
            fecharEstatisticas();
        }
    }

    // --- CONFETE EM CSS PARA COMEMORAR A VITÓRIA ---
    function gerarMarcacaoConfete() {
        const cores = ["#b4f03c", "#f2b01e", "#ffffff", "#5cb97a", "#7c4dba"];
        let pedacos = "";
        for (let indicePedaco = 0; indicePedaco < 26; indicePedaco++) {
            const esquerda = Math.round(Math.random() * 100);
            const atraso = (Math.random() * 0.6).toFixed(2);
            const cor = cores[indicePedaco % cores.length];
            pedacos += `<span style="left:${esquerda}%;background:${cor};animation-delay:${atraso}s"></span>`;
        }
        return `<div class="fg11-confetti" aria-hidden="true">${pedacos}</div>`;
    }

    // --- EXIBE A TELA DE ESTATÍSTICAS COM O GRÁFICO DE BARRAS ---
    function mostrarJanelaEstatisticas(identificadorJogo, opcoes) {
        const {
            venceu = false,
            titulo = "Estatísticas",
            resposta = "",
            tamanho = 6,
            rotulos = [],
            tituloGrafico = "Distribuição",
            bucketAtual: indiceDistribuicaoAtual = -1,
            onReiniciar: aoReiniciarPartida = null,
            onHome: aoVoltarInicio = null
        } = opcoes;

        const dados = obterEstatisticasJogo(identificadorJogo, tamanho);
        fecharEstatisticas();

        const maximo = Math.max(...dados.distribuicao.slice(0, tamanho), 1);

        let barras = "";
        for (let indiceBarra = 0; indiceBarra < tamanho; indiceBarra++) {
            const valor = dados.distribuicao[indiceBarra] || 0;
            const largura = Math.max((valor / maximo) * 100, 10);
            
            let atual = "";
            if (indiceBarra === indiceDistribuicaoAtual) {
                atual = " atual";
            }

            let rotulo;
            if (rotulos[indiceBarra] != null) {
                rotulo = rotulos[indiceBarra];
            } else {
                rotulo = indiceBarra + 1;
            }

            barras +=
                `<div class="fg11-bar-row">` +
                    `<span class="fg11-bar-label">${rotulo}</span>` +
                    `<div class="fg11-bar-track">` +
                        `<div class="fg11-bar-fill${atual}" style="width:${largura}%">${valor}</div>` +
                    `</div>` +
                `</div>`;
        }

        let icone;
        if (venceu) {
            icone = "fa-trophy";
        } else {
            icone = "fa-futbol";
        }

        const partidas = dados.vitorias + dados.derrotas;

        let aproveitamento = 0;
        if (partidas) {
            aproveitamento = Math.round((dados.vitorias / partidas) * 100);
        } else {
            aproveitamento = 0;
        }

        let chamadaResultado;
        if (venceu) {
            chamadaResultado = obterTextoEstatisticas("result-kicker-win", "Vitória!");
        } else {
            chamadaResultado = obterTextoEstatisticas("result-kicker-end", "Fim de jogo");
        }

        let marcacaoResposta = "";
        if (resposta) {
            marcacaoResposta = `<p class="fg11-stats-resposta">${resposta}</p>`;
        } else {
            marcacaoResposta = "";
        }

        let marcacaoVoltarInicio = "";
        if (aoVoltarInicio) {
            marcacaoVoltarInicio = `<button class="fg11-stats-btn" id="fg11StatsHome">
                    <i class="fas fa-home" aria-hidden="true"></i> Menu
                </button>`;
        } else {
            marcacaoVoltarInicio = "";
        }

        let classeResultado;
        if (venceu) {
            classeResultado = "is-win";
        } else {
            classeResultado = "is-loss";
        }

        let marcacaoConfete = "";
        if (venceu) {
            marcacaoConfete = gerarMarcacaoConfete();
        } else {
            marcacaoConfete = "";
        }

        const sobreposicaoEstatisticas = document.createElement("div");
        sobreposicaoEstatisticas.className = "tutorial-overlay fg11-stats-overlay";
        sobreposicaoEstatisticas.id = "fg11StatsOverlay";
        sobreposicaoEstatisticas.innerHTML =
            `<div class="tutorial-box fg11-stats-box ${classeResultado}" role="dialog" aria-modal="true" aria-labelledby="fg11StatsTitulo">` +
                marcacaoConfete +
                `<button class="fg11-stats-close" id="fg11StatsFechar" aria-label="${obterTextoEstatisticas("result-close", "Fechar")}">
                    <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>` +
                `<div class="fg11-stats-header">` +
                    `<span class="fg11-stats-kicker">${chamadaResultado}</span>` +
                    `<i class="fas ${icone}" aria-hidden="true"></i>` +
                    `<h2 id="fg11StatsTitulo">${titulo}</h2>` +
                    marcacaoResposta +
                `</div>` +
                `<div class="fg11-stats-counts">` +
                    `<div class="fg11-stat">` +
                        `<span class="fg11-stat-num">${dados.vitorias}</span>` +
                        `<span class="fg11-stat-label">${obterTextoEstatisticas("score-victories", "Vitórias")}</span>` +
                    `</div>` +
                    `<div class="fg11-stat">` +
                        `<span class="fg11-stat-num">${dados.derrotas}</span>` +
                        `<span class="fg11-stat-label">${obterTextoEstatisticas("score-defeats", "Derrotas")}</span>` +
                    `</div>` +
                    `<div class="fg11-stat">` +
                        `<span class="fg11-stat-num">${aproveitamento}%</span>` +
                        `<span class="fg11-stat-label">${obterTextoEstatisticas("stat-win-rate", "Aproveitamento")}</span>` +
                    `</div>` +
                `</div>` +
                `<h3 class="fg11-stats-chart-title">${tituloGrafico}</h3>` +
                `<div class="fg11-stats-chart">${barras}</div>` +
                `<div class="fg11-stats-actions">` +
                    `<button class="fg11-stats-btn primary" id="fg11StatsReiniciar">
                        <i class="fas fa-redo" aria-hidden="true"></i> ${obterTextoEstatisticas("play-again", "Jogar novamente")}
                    </button>` +
                    marcacaoVoltarInicio +
                `</div>` +
            `</div>`;

        document.body.appendChild(sobreposicaoEstatisticas);

        sobreposicaoEstatisticas.querySelector("#fg11StatsFechar").addEventListener("click", fecharEstatisticas);
        document.addEventListener("keydown", aoPressionarTeclaEstatisticas);
        setTimeout(() => {
            const btnReiniciarPartida = sobreposicaoEstatisticas.querySelector("#fg11StatsReiniciar");
            if (btnReiniciarPartida) {
                btnReiniciarPartida.focus();
            }
        }, 50);

        sobreposicaoEstatisticas.querySelector("#fg11StatsReiniciar").addEventListener("click", () => {
            fecharEstatisticas();
            if (typeof aoReiniciarPartida === "function") {
                aoReiniciarPartida();
            }
        });

        const btnVoltarInicio = sobreposicaoEstatisticas.querySelector("#fg11StatsHome");
        if (btnVoltarInicio) {
            btnVoltarInicio.addEventListener("click", () => {
                if (typeof aoVoltarInicio === "function") {
                    aoVoltarInicio();
                }
            });
        }

        sobreposicaoEstatisticas.addEventListener("click", (evento) => {
            if (evento.target === sobreposicaoEstatisticas) {
                fecharEstatisticas();
            }
        });

        return dados;
    }

    window.FG11Stats = {
        obter: obterEstatisticasJogo,
        registrar: registrarResultadoPartida,
        mostrarModal: mostrarJanelaEstatisticas,
        fechar: fecharEstatisticas,
        obterStreak: obterSequenciaDias,
        atualizarStreak: atualizarSequenciaDias
    };
})();
