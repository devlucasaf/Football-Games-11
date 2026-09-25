(function () {
    const catalogo = window.FG11Catalogo;
    const perfil = window.FG11Perfil;
    if (!catalogo || !perfil) {
        return;
    }

    const RAIZ = "../../../";
    const estado = { categoria: "todas", ordem: "vitorias" };
    let resumo = perfil.resumo();

    // --- CARTA + EDIÇÃO DO APELIDO ---
    function renderCarta() {
        document.getElementById("cartaJogador").innerHTML = perfil.htmlCarta(resumo, { editavel: true });
        document.getElementById("btnEditarApelido")?.addEventListener("click", abrirEdicao);
    }

    function abrirEdicao() {
        const form = document.getElementById("formApelido");
        const input = document.getElementById("inputApelido");
        form.hidden = false;
        input.value = resumo.apelido;
        input.focus();
    }

    document.getElementById("formApelido").addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        perfil.salvarApelido(document.getElementById("inputApelido").value);
        resumo = perfil.resumo();
        form.hidden = true;
        renderCarta();
        perfil.retraduzir();
        document.getElementById("btnEditarApelido")?.focus();
    });

    // --- INDICADORES GERAIS ---
    function renderKpis() {
        const kpi = (icone, chave, rotulo, valor) => `
            <div class="kpi">
                <span class="kpi-label"><i class="fas ${icone}" aria-hidden="true"></i><span data-key="${chave}">${rotulo}</span></span>
                <span class="kpi-value">${valor}</span>
            </div>`;

        document.getElementById("kpis").innerHTML =
            kpi("fa-futbol", "kpi-played", "Partidas", resumo.partidas) +
            kpi("fa-trophy", "score-victories", "Vitórias", resumo.vitorias) +
            kpi("fa-xmark", "score-defeats", "Derrotas", resumo.derrotas) +
            kpi("fa-percent", "stat-win-rate", "Aproveitamento", perfil.porcentagem(resumo.aproveitamento)) +
            kpi("fa-compass", "stat-explored", "Jogos explorados", `${resumo.jogosDiferentes}<small>/${resumo.totalJogos}</small>`) +
            kpi("fa-medal", "ach-title", "Conquistas", `${resumo.desbloqueadas}<small>/${resumo.conquistas.length}</small>`);

        document.getElementById("progressoNivel").innerHTML = perfil.htmlProgressoNivel(resumo);
    }

    // --- CHIPS DE CATEGORIA ---
    function renderFiltros() {
        const chip = (id, chave, rotulo, icone) => `
            <button type="button" class="chip" data-categoria="${id}" aria-pressed="${estado.categoria === id}">
                <i class="fas ${icone}" aria-hidden="true"></i>
                <span data-key="${chave}">${rotulo}</span>
            </button>`;

        document.getElementById("filtrosCategoria").innerHTML =
            chip("todas", "cat-all", "Todos", "fa-border-all") +
            Object.entries(catalogo.categorias).map(([id, cat]) => chip(id, cat.rotuloKey, cat.rotulo, cat.icone)).join("");
    }

    // --- TABELA DE CLASSIFICAÇÃO ---
    function renderTabela() {
        const criterios = {
            vitorias: (a, b) => b.vitorias - a.vitorias || b.aproveitamento - a.aproveitamento,
            aproveitamento: (a, b) => b.aproveitamento - a.aproveitamento || b.partidas - a.partidas,
            partidas: (a, b) => b.partidas - a.partidas || b.vitorias - a.vitorias
        };

        const linhas = resumo.jogos
            .filter(item => estado.categoria === "todas" || item.jogo.categoria === estado.categoria)
            .sort((a, b) => (b.partidas > 0) - (a.partidas > 0) || criterios[estado.ordem](a, b));

        const medalhas = ["ouro", "prata", "bronze"];
        let posicao = 0;

        document.getElementById("tabelaJogos").innerHTML = linhas.map(item => {
            const { jogo } = item;
            const jogado = item.partidas > 0;
            const pos = jogado ? ++posicao : null;
            const medalha = pos && pos <= 3 ? medalhas[pos - 1] : "";
            const posHtml = pos
                ? `<span class="rank-pos ${medalha ? `rank-pos--${medalha}` : ""}">${medalha ? '<i class="fas fa-medal" aria-hidden="true"></i>' : ""}<span>${pos}</span></span>`
                : "—";
            const semPlacar = !jogo.estatisticas
                ? ' <small class="tier-progress-hint" data-key="card-free-mode">Modo livre</small>'
                : "";
            const taxa = Math.round(item.aproveitamento * 100);

            return `
                <tr class="${jogado ? "" : "is-empty"}">
                    <td class="col-pos">${posHtml}</td>
                    <td class="col-game">
                        <div class="game-cell">
                            <span class="rank-icon" data-cat="${jogo.categoria}" aria-hidden="true"><i class="fas ${jogo.icone}"></i></span>
                            <div>
                                <a href="${RAIZ}${jogo.pagina}" data-key="${jogo.tituloKey}">${jogo.titulo}</a>${semPlacar}
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

        document.querySelectorAll("#filtrosCategoria .chip").forEach(chip => {
            chip.setAttribute("aria-pressed", chip.dataset.categoria === estado.categoria ? "true" : "false");
        });
        document.querySelectorAll("#ordenacao button").forEach(botao => {
            botao.setAttribute("aria-pressed", botao.dataset.ordem === estado.ordem ? "true" : "false");
        });
    }

    // --- CONQUISTAS ---
    function renderConquistas() {
        document.getElementById("contagemConquistas").textContent = `${resumo.desbloqueadas}/${resumo.conquistas.length}`;

        document.getElementById("conquistas").innerHTML = resumo.conquistas.map(c => `
            <article class="ach ach--${c.medalha}${c.desbloqueada ? "" : " is-locked"}">
                <span class="ach-medal" aria-hidden="true"><i class="fas ${c.icone}"></i></span>
                <div>
                    <h3 data-key="${c.tituloKey}">${c.titulo}</h3>
                    <p data-key="${c.descKey}">${c.desc}</p>
                </div>
                <div class="ach-progress">
                    <span class="rate-bar" aria-hidden="true"><span style="width:${Math.round(c.progresso * 100)}%"></span></span>
                    <span>${c.desbloqueada ? '<i class="fas fa-check" aria-hidden="true"></i>' : `${Math.min(c.valor, c.meta)}/${c.meta}`}</span>
                    <span class="sr-only">${c.desbloqueada ? "Desbloqueada" : "Bloqueada"}</span>
                </div>
            </article>`).join("");
    }

    // --- RENDERIZAÇÃO INICIAL ---
    renderCarta();
    renderKpis();
    renderFiltros();
    renderTabela();
    renderConquistas();

    // --- EVENTOS DA TABELA ---
    document.getElementById("filtrosCategoria").addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (chip) {
            estado.categoria = chip.dataset.categoria;
            renderTabela();
            perfil.retraduzir();
        }
    });

    document.getElementById("ordenacao").addEventListener("click", (e) => {
        const botao = e.target.closest("button[data-ordem]");
        if (botao) {
            estado.ordem = botao.dataset.ordem;
            renderTabela();
            perfil.retraduzir();
        }
    });
})();
