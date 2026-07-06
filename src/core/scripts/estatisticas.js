(function () {
    const PREFIXO = "fg11_stats_";

    // --- LÊ AS ESTATÍSTICAS DE UM JOGO ---
    function obter(gameId, tamanho) {
        let dados = null;
        try {
            dados = JSON.parse(localStorage.getItem(PREFIXO + gameId));
        } catch (e) {
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
    function salvar(gameId, dados) {
        localStorage.setItem(PREFIXO + gameId, JSON.stringify(dados));
    }

    // --- REGISTRA O RESULTADO DE UMA PARTIDA ---
    function registrar(gameId, opcoes) {
        const { venceu, bucket, tamanho } = opcoes;
        const dados = obter(gameId, tamanho);

        if (venceu) {
            dados.vitorias++;
            if (typeof bucket === "number" && bucket >= 0 && bucket < tamanho) {
                dados.distribuicao[bucket]++;
            }
        } else {
            dados.derrotas++;
        }

        salvar(gameId, dados);
        return dados;
    }

    // --- FECHA A TELA DE ESTATÍSTICAS ---
    function fechar() {
        const existente = document.getElementById("fg11StatsOverlay");
        if (existente) {
            existente.remove();
        }
    }

    // --- EXIBE A TELA DE ESTATÍSTICAS COM O GRÁFICO DE BARRAS ---
    function mostrarModal(gameId, opcoes) {
        const {
            venceu = false,
            titulo = "Estatísticas",
            resposta = "",
            tamanho = 6,
            rotulos = [],
            tituloGrafico = "Distribuição",
            bucketAtual = -1,
            onReiniciar = null,
            onHome = null
        } = opcoes;

        const dados = obter(gameId, tamanho);
        fechar();

        const maximo = Math.max(...dados.distribuicao.slice(0, tamanho), 1);

        let barras = "";
        for (let i = 0; i < tamanho; i++) {
            const valor = dados.distribuicao[i] || 0;
            const largura = Math.max((valor / maximo) * 100, 10);
            const atual = i === bucketAtual ? " atual" : "";
            const rotulo = rotulos[i] != null ? rotulos[i] : (i + 1);
            barras +=
                `<div class="fg11-bar-row">` +
                    `<span class="fg11-bar-label">${rotulo}</span>` +
                    `<div class="fg11-bar-track">` +
                        `<div class="fg11-bar-fill${atual}" style="width:${largura}%">${valor}</div>` +
                    `</div>` +
                `</div>`;
        }

        const icone = venceu ? "fa-trophy" : "fa-chart-column";
        const respostaHtml = resposta ? `<p class="fg11-stats-resposta">${resposta}</p>` : "";
        const homeHtml = onHome
            ? `<button class="fg11-stats-btn" id="fg11StatsHome"><i class="fas fa-home"></i> Menu</button>`
            : "";

        const overlay = document.createElement("div");
        overlay.className = "tutorial-overlay fg11-stats-overlay";
        overlay.id = "fg11StatsOverlay";
        overlay.innerHTML =
            `<div class="tutorial-box fg11-stats-box">` +
                `<div class="fg11-stats-header">` +
                    `<i class="fas ${icone}"></i>` +
                    `<h2>${titulo}</h2>` +
                    respostaHtml +
                `</div>` +
                `<div class="fg11-stats-counts">` +
                    `<div class="fg11-stat">` +
                        `<span class="fg11-stat-num">${dados.vitorias}</span>` +
                        `<span class="fg11-stat-label">Vitórias</span>` +
                    `</div>` +
                    `<div class="fg11-stat">` +
                        `<span class="fg11-stat-num">${dados.derrotas}</span>` +
                        `<span class="fg11-stat-label">Derrotas</span>` +
                    `</div>` +
                `</div>` +
                `<h3 class="fg11-stats-chart-title">${tituloGrafico}</h3>` +
                `<div class="fg11-stats-chart">${barras}</div>` +
                `<div class="fg11-stats-actions">` +
                    `<button class="fg11-stats-btn primary" id="fg11StatsReiniciar">
                        <i class="fas fa-redo"></i> Jogar novamente
                    </button>` +
                    homeHtml +
                `</div>` +
            `</div>`;

        document.body.appendChild(overlay);

        overlay.querySelector("#fg11StatsReiniciar").addEventListener("click", () => {
            fechar();
            if (typeof onReiniciar === "function") {
                onReiniciar();
            }
        });

        const homeEl = overlay.querySelector("#fg11StatsHome");
        if (homeEl) {
            homeEl.addEventListener("click", () => {
                if (typeof onHome === "function") {
                    onHome();
                }
            });
        }

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                fechar();
            }
        });

        return dados;
    }

    window.FG11Stats = { obter, registrar, mostrarModal, fechar };
})();
