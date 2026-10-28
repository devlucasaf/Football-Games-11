(function () {
    const catalogo = window.FG11Catalogo;
    const perfil = window.FG11Perfil;
    if (!catalogo || !perfil) {
        return;
    }

    const CAMINHO_RAIZ_SITE = "../../../";
    const estado = { categoria: "todas", ordem: "vitorias" };
    let resumo = perfil.resumo();

    // --- CARTA + EDIÇÃO DO APELIDO ---
    function renderizarCartaJogador() {
        document.getElementById("cartaJogador").innerHTML = perfil.htmlCarta(resumo, { editavel: true });
        document.getElementById("btnEditarApelido")?.addEventListener("click", abrirEdicaoApelido);
    }

    function abrirEdicaoApelido() {
        const formularioApelido = document.getElementById("formApelido");
        const campoApelido = document.getElementById("inputApelido");
        formularioApelido.hidden = false;
        campoApelido.value = resumo.apelido;
        campoApelido.focus();
    }

    document.getElementById("formApelido").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const formularioApelido = evento.currentTarget;
        perfil.salvarApelido(document.getElementById("inputApelido").value);
        resumo = perfil.resumo();
        formularioApelido.hidden = true;
        renderizarCartaJogador();
        perfil.retraduzir();
        document.getElementById("btnEditarApelido")?.focus();
    });

    // --- INDICADORES GERAIS ---
    function renderizarIndicadoresGerais() {
        const gerarMarcacaoIndicador = (icone, chave, rotulo, valor) => `
            <div class="kpi">
                <span class="kpi-label"><i class="fas ${icone}" aria-hidden="true"></i><span data-key="${chave}">${rotulo}</span></span>
                <span class="kpi-value">${valor}</span>
            </div>`;
        
        document.getElementById("kpis").innerHTML =
            gerarMarcacaoIndicador("fa-futbol", "kpi-played", "Partidas", resumo.partidas) +
            gerarMarcacaoIndicador("fa-trophy", "score-victories", "Vitórias", resumo.vitorias) +
            gerarMarcacaoIndicador("fa-xmark", "score-defeats", "Derrotas", resumo.derrotas) +
            gerarMarcacaoIndicador("fa-percent", "stat-win-rate", "Aproveitamento", perfil.porcentagem(resumo.aproveitamento)) +
            gerarMarcacaoIndicador("fa-compass", "stat-explored", "Jogos explorados", `${resumo.jogosDiferentes}<small>/${resumo.totalJogos}</small>`) +
            gerarMarcacaoIndicador("fa-medal", "ach-title", "Conquistas", `${resumo.desbloqueadas}<small>/${resumo.conquistas.length}</small>`) +
            gerarMarcacaoIndicador("fa-fire", "kpi-streak", "Sequência", `${resumo.sequenciaAtual}<small> / ${resumo.recordeSequencia}</small>`) +
            gerarMarcacaoIndicador("fa-calendar-check", "kpi-dailies", "Desafios do Dia", `${resumo.diariosConcluidos}<small> (${resumo.diariosVencidos}✓)</small>`);

        document.getElementById("progressoNivel").innerHTML = perfil.htmlProgressoNivel(resumo);
    }

    // --- CHIPS DE CATEGORIA ---
    function renderizarFiltrosCategorias() {
        const gerarMarcacaoFiltroCategoria = (identificadorCategoria, chave, rotulo, icone) => `
            <button type="button" class="chip" data-categoria="${identificadorCategoria}" aria-pressed="${estado.categoria === identificadorCategoria}">
                <i class="fas ${icone}" aria-hidden="true"></i>
                <span data-key="${chave}">${rotulo}</span>
            </button>`;

        document.getElementById("filtrosCategoria").innerHTML =
            gerarMarcacaoFiltroCategoria("todas", "cat-all", "Todos", "fa-border-all") +
            Object.entries(catalogo.categorias).map(([identificadorCategoria, categoria]) => gerarMarcacaoFiltroCategoria(identificadorCategoria, categoria.rotuloKey, categoria.rotulo, categoria.icone)).join("");
    }

    // --- TABELA DE CLASSIFICAÇÃO ---
    function renderizarTabelaClassificacao() {
        const criterios = {
            vitorias: (primeiroResultado, segundoResultado) => segundoResultado.vitorias - primeiroResultado.vitorias || segundoResultado.aproveitamento - primeiroResultado.aproveitamento,
            aproveitamento: (primeiroResultado, segundoResultado) => segundoResultado.aproveitamento - primeiroResultado.aproveitamento || segundoResultado.partidas - primeiroResultado.partidas,
            partidas: (primeiroResultado, segundoResultado) => segundoResultado.partidas - primeiroResultado.partidas || segundoResultado.vitorias - primeiroResultado.vitorias
        };

        const linhas = resumo.jogos
            .filter(item => estado.categoria === "todas" || item.jogo.categoria === estado.categoria)
            .sort((primeiroResultado, segundoResultado) => (segundoResultado.partidas > 0) - (primeiroResultado.partidas > 0) || criterios[estado.ordem](primeiroResultado, segundoResultado));

        const medalhas = ["ouro", "prata", "bronze"];
        let posicao = 0;

        document.getElementById("tabelaJogos").innerHTML = linhas.map(item => {
            const { jogo } = item;
            const jogado = item.partidas > 0;
            const posicaoClassificacao = jogado ? ++posicao : null;
            const medalha = posicaoClassificacao && posicaoClassificacao <= 3 ? medalhas[posicaoClassificacao - 1] : "";
            const marcacaoPosicao = posicaoClassificacao
                ? `<span class="rank-pos ${medalha ? `rank-pos--${medalha}` : ""}">${medalha ? '<i class="fas fa-medal" aria-hidden="true"></i>' : ""}<span>${posicaoClassificacao}</span></span>`
                : "—";
            const semPlacar = !jogo.estatisticas
                ? ' <small class="tier-progress-hint" data-key="card-free-mode">Modo livre</small>'
                : "";
            const taxa = Math.round(item.aproveitamento * 100);

            return `
                <tr class="${jogado ? "" : "is-empty"}">
                    <td class="col-pos">${marcacaoPosicao}</td>
                    <td class="col-game">
                        <div class="game-cell">
                            <span class="rank-icon" data-cat="${jogo.categoria}" aria-hidden="true"><i class="fas ${jogo.icone}"></i></span>
                            <div>
                                <a href="${CAMINHO_RAIZ_SITE}${jogo.pagina}" data-key="${jogo.tituloKey}">${jogo.titulo}</a>${semPlacar}
                            </div>
                        </div>
                    </td>
                    <td>${jogado ? item.partidas : "—"}</td>
                    <td class="num-strong">${jogado ? item.vitorias : "—"}</td>
                    <td>${jogado ? item.derrotas : "—"}</td>
                    <td>
                        ${jogado
                            ? `<div class="rate-cell"><span class="rate-bar" aria-hidden="true"><span style="width:${taxa}%"></span></span><b>${taxa}%</b></div>`
                            : "—"}
                    </td>
                </tr>`;
        }).join("");

        document.querySelectorAll("#filtrosCategoria .chip").forEach(btnFiltrarCategoria => {
            btnFiltrarCategoria.setAttribute("aria-pressed", btnFiltrarCategoria.dataset.categoria === estado.categoria ? "true" : "false");
        });
        document.querySelectorAll("#ordenacao button").forEach(btnOrdenarClassificacao => {
            btnOrdenarClassificacao.setAttribute("aria-pressed", btnOrdenarClassificacao.dataset.ordem === estado.ordem ? "true" : "false");
        });
    }

    // --- CONQUISTAS ---
    function renderizarConquistas() {
        document.getElementById("contagemConquistas").textContent = `${resumo.desbloqueadas}/${resumo.conquistas.length}`;

        document.getElementById("conquistas").innerHTML = resumo.conquistas.map(conquista => `
            <article class="ach ach--${conquista.medalha}${conquista.desbloqueada ? "" : " is-locked"}">
                <span class="ach-medal" aria-hidden="true"><i class="fas ${conquista.icone}"></i></span>
                <div>
                    <h3 data-key="${conquista.tituloKey}">${conquista.titulo}</h3>
                    <p data-key="${conquista.descKey}">${conquista.desc}</p>
                </div>
                <div class="ach-progress">
                    <span class="rate-bar" aria-hidden="true"><span style="width:${Math.round(conquista.progresso * 100)}%"></span></span>
                    <span>${conquista.desbloqueada ? '<i class="fas fa-check" aria-hidden="true"></i>' : `${Math.min(conquista.valor, conquista.meta)}/${conquista.meta}`}</span>
                    <span class="sr-only">${conquista.desbloqueada ? "Desbloqueada" : "Bloqueada"}</span>
                </div>
            </article>`).join("");
    }

    // --- RENDERIZAÇÃO INICIAL ---
    renderizarCartaJogador();
    renderizarIndicadoresGerais();
    renderizarFiltrosCategorias();
    renderizarTabelaClassificacao();
    renderizarConquistas();

    // --- EVENTOS DA TABELA ---
    document.getElementById("filtrosCategoria").addEventListener("click", (evento) => {
        const btnFiltrarCategoria = evento.target.closest(".chip");
        if (btnFiltrarCategoria) {
            estado.categoria = btnFiltrarCategoria.dataset.categoria;
            renderizarTabelaClassificacao();
            perfil.retraduzir();
        }
    });

    document.getElementById("ordenacao").addEventListener("click", (evento) => {
        const btnOrdenarClassificacao = evento.target.closest("button[data-ordem]");
        if (btnOrdenarClassificacao) {
            estado.ordem = btnOrdenarClassificacao.dataset.ordem;
            renderizarTabelaClassificacao();
            perfil.retraduzir();
        }
    });
})();
