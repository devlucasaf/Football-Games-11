(function () {
    const catalogo = window.FG11Catalogo;
    const perfil = window.FG11Perfil;
    if (!catalogo || !perfil) {
        return;
    }

    const estado = { categoria: "todas", termo: "" };
    const resumo = perfil.resumo();
    const estatisticasPorJogo = new Map(resumo.jogos.map(item => [item.jogo.id, item]));

    const grade = document.getElementById("gamesGrid");
    const gradeDestaques = document.getElementById("gradeDestaques");
    const filtros = document.getElementById("filtrosCategoria");
    const busca = document.getElementById("buscaCatalogo");
    const btnLimparBuscaCatalogo = document.getElementById("limparBusca");
    const estadoVazio = document.getElementById("estadoVazio");
    const contagem = document.getElementById("contagemJogos");

    // --- REMOVE ACENTOS PARA BUSCAR "ESTADIO" E ACHAR "ESTÁDIO" ---
    function normalizarTextoBusca(texto) {
        return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    }

    // --- DESTAQUE DE PONTUAÇÃO DO CARD ---
    function gerarMarcacaoPlacarJogo(jogo) {
        const estatisticasJogo = estatisticasPorJogo.get(jogo.id);

        if (!jogo.estatisticas) {
            return `
                <div class="gcard-score gcard-score--free">
                    <i class="fas fa-infinity" aria-hidden="true"></i>
                    <span data-key="card-free-mode">Modo livre</span>
                </div>`;
        }

        if (!estatisticasJogo || estatisticasJogo.partidas === 0) {
            return `
                <div class="gcard-score gcard-score--new">
                    <i class="fas fa-flag-checkered" aria-hidden="true"></i>
                    <span data-key="card-not-played">Ainda não jogado</span>
                </div>`;
        }

        return `
            <div class="gcard-score">
                <span class="gcard-record">
                    <i class="fas fa-trophy" aria-hidden="true"></i>
                    <strong>${estatisticasJogo.vitorias}</strong>
                    <span data-key="ranking-wins-short">V</span>
                    <span class="gcard-sep" aria-hidden="true">·</span>
                    <strong>${estatisticasJogo.derrotas}</strong>
                    <span data-key="ranking-losses-short">D</span>
                </span>
                <span class="gcard-rate" title="Aproveitamento">${perfil.porcentagem(estatisticasJogo.aproveitamento)}</span>
                <span class="gcard-meter" aria-hidden="true">
                    <span style="width:${Math.round(estatisticasJogo.aproveitamento * 100)}%"></span>
                </span>
            </div>`;
    }

    // --- CARD DE JOGO ---
    function gerarMarcacaoCartaoJogo(jogo, indice, opcoes = {}) {
        const categoria = catalogo.categorias[jogo.categoria];
        const identificadorTitulo = `${opcoes.prefixo || "g"}-${jogo.id}`;
        const numero = String(indice + 1).padStart(2, "0");

        return `
            <article class="gcard${opcoes.destaque ? " gcard--featured" : ""}" data-id="${jogo.id}" data-cat="${jogo.categoria}" style="--i:${indice}" aria-labelledby="${identificadorTitulo}">
                <div class="gcard-cover" aria-hidden="true">
                    <span class="gcard-number">${numero}</span>
                    <i class="fas ${jogo.icone} gcard-icon"></i>
                    ${opcoes.destaque ? '<span class="gcard-ribbon"><i class="fas fa-fire"></i> <span data-key="card-featured">Destaque</span></span>' : ""}
                </div>
                <div class="gcard-body">
                    <span class="gcard-cat">
                        <i class="fas ${categoria.icone}" aria-hidden="true"></i>
                        <span data-key="${categoria.rotuloKey}">${categoria.rotulo}</span>
                    </span>
                    <h3 class="gcard-title" id="${identificadorTitulo}" data-key="${jogo.tituloKey}">${jogo.titulo}</h3>
                    <p class="gcard-desc" data-key="${jogo.descKey}">${jogo.desc}</p>
                    ${gerarMarcacaoPlacarJogo(jogo)}
                    <a class="btn gcard-cta" href="${jogo.pagina}" data-jogo="${jogo.id}">
                        <i class="fas fa-play" aria-hidden="true"></i>
                        <span data-key="play-now">Jogar agora</span>
                    </a>
                </div>
            </article>`;
    }

    // --- CHIPS DE CATEGORIA ---
    function renderizarFiltrosCategorias() {
        const contagens = {};
        catalogo.jogos.forEach(jogo => {
            contagens[jogo.categoria] = (contagens[jogo.categoria] || 0) + 1;
        });

        const gerarMarcacaoFiltroCategoria = (identificadorCategoria, chave, rotulo, icone, total) => `
            <button type="button" class="chip" data-categoria="${identificadorCategoria}" aria-pressed="${estado.categoria === identificadorCategoria}">
                <i class="fas ${icone}" aria-hidden="true"></i>
                <span data-key="${chave}">${rotulo}</span>
                <span class="chip-count">${total}</span>
            </button>`;

        filtros.innerHTML =
            gerarMarcacaoFiltroCategoria("todas", "cat-all", "Todos", "fa-border-all", catalogo.jogos.length) +
            Object.entries(catalogo.categorias)
                .map(([identificadorCategoria, categoria]) => gerarMarcacaoFiltroCategoria(identificadorCategoria, categoria.rotuloKey, categoria.rotulo, categoria.icone, contagens[identificadorCategoria] || 0))
                .join("");
    }

    // --- APLICA CATEGORIA + BUSCA NOS CARDS ---
    function aplicarFiltros() {
        const termo = normalizarTextoBusca(estado.termo);
        let visiveis = 0;

        grade.querySelectorAll(".gcard").forEach(cartaoJogo => {
            const combinaCategoria = estado.categoria === "todas" || cartaoJogo.dataset.cat === estado.categoria;
            const texto = normalizarTextoBusca(cartaoJogo.textContent);
            const combinaBusca = termo === "" || texto.includes(termo);
            const mostrar = combinaCategoria && combinaBusca;

            cartaoJogo.hidden = !mostrar;
            if (mostrar) {
                cartaoJogo.style.setProperty("--i", visiveis);
                visiveis++;
            }
        });

        contagem.textContent = visiveis;
        estadoVazio.hidden = visiveis !== 0;
        btnLimparBuscaCatalogo.hidden = estado.termo === "";

        filtros.querySelectorAll(".chip").forEach(btnFiltrarCategoria => {
            btnFiltrarCategoria.setAttribute("aria-pressed", btnFiltrarCategoria.dataset.categoria === estado.categoria ? "true" : "false");
        });
    }

    function definirTermoBusca(termo) {
        estado.termo = termo;
        if (busca.value !== termo) {
            busca.value = termo;
        }
        aplicarFiltros();
    }

    // --- CONTINUE JOGANDO ---
    function renderizarJogosRecentes() {
        const secao = document.getElementById("continuar");
        const lista = document.getElementById("listaRecentes");
        if (!secao || !lista || resumo.recentes.length === 0) {
            return;
        }

        lista.innerHTML = resumo.recentes.map(jogo => {
            const categoria = catalogo.categorias[jogo.categoria];
            return `
                <li>
                    <a class="quick-item" href="${jogo.pagina}" data-jogo="${jogo.id}" data-cat="${jogo.categoria}">
                        <span class="quick-icon" aria-hidden="true"><i class="fas ${jogo.icone}"></i></span>
                        <span class="quick-text">
                            <strong data-key="${jogo.tituloKey}">${jogo.titulo}</strong>
                            <small data-key="${categoria.rotuloKey}">${categoria.rotulo}</small>
                        </span>
                        <span class="quick-play" aria-hidden="true"><i class="fas fa-play"></i></span>
                    </a>
                </li>`;
        }).join("");
        secao.hidden = false;
    }

    // --- NÚMEROS DO HERO ---
    function renderizarIndicadoresDestaque() {
        const definirValorIndicador = (identificadorElemento, valor) => {
            const elementoIndicador = document.getElementById(identificadorElemento);
            if (elementoIndicador) {
                elementoIndicador.textContent = valor;
            }
        };

        definirValorIndicador("heroPartidas", resumo.partidas);
        definirValorIndicador("heroAproveitamento", perfil.porcentagem(resumo.aproveitamento));
        definirValorIndicador("heroExplorados", resumo.jogosDiferentes);
        definirValorIndicador("heroTotal", resumo.totalJogos);
        definirValorIndicador("heroOvr", resumo.ovr);

        const nivel = document.getElementById("heroNivel");
        if (nivel) {
            nivel.classList.add(`pitch-chip--${resumo.nivel.id}`);
            const rotulo = nivel.querySelector("span");
            rotulo.setAttribute("data-key", resumo.nivel.chave);
            rotulo.textContent = resumo.nivel.nome;
        }
    }

    // --- PERFIL + RANKING ---
    function renderizarPerfilJogador() {
        const carta = document.getElementById("cartaJogador");
        const progresso = document.getElementById("progressoNivel");
        const classificacaoJogos = document.getElementById("rankingResumo");

        if (carta) {
            carta.innerHTML = perfil.htmlCarta(resumo);
        }

        if (progresso) {
            progresso.innerHTML = perfil.htmlProgressoNivel(resumo);
        }
        
        if (classificacaoJogos) {
            classificacaoJogos.innerHTML = perfil.htmlRanking(resumo, 5, "");
        }
    }

    // --- NAVEGA COM A TRANSIÇÃO DE SAÍDA ---
    function navegarParaPagina(enderecoDestino) {
        const reduzir = document.documentElement.getAttribute("data-reduce-motion") === "true"
            || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        
        if (reduzir) {
            window.location.href = enderecoDestino;
            return;
        }
        document.body.classList.add("is-leaving");
        setTimeout(() => {
            window.location.href = enderecoDestino;
        }, 160);
    }

    // --- CLIQUE EM QUALQUER PARTE DO CARD ABRE O JOGO ---
    function aoClicarCartaoJogo(evento) {
        const ligacaoJogo = evento.target.closest("[data-jogo]");
        if (ligacaoJogo) {
            perfil.registrarAcesso(ligacaoJogo.dataset.jogo);
            return;
        }

        const cartaoJogo = evento.target.closest(".gcard");
        if (!cartaoJogo || evento.target.closest("a, button")) {
            return;
        }

        const ligacaoIniciarJogo = cartaoJogo.querySelector(".gcard-cta");
        cartaoJogo.classList.add("is-selected");
        perfil.registrarAcesso(cartaoJogo.dataset.id);
        navegarParaPagina(ligacaoIniciarJogo.href);
    }

    // --- SORTEIA UM JOGO ---
    function iniciarPartidaRapida() {
        const jogos = catalogo.jogos;
        const escolhido = jogos[Math.floor(Math.random() * jogos.length)];
        const btnIniciarPartidaRapida = document.getElementById("btnPartidaRapida");
        btnIniciarPartidaRapida?.classList.add("is-rolling");
        perfil.registrarAcesso(escolhido.id);
        navegarParaPagina(escolhido.pagina);
    }

    // --- RENDERIZAÇÃO INICIAL ---
    const destaques = catalogo.jogos.filter(jogo => jogo.destaque);
    gradeDestaques.innerHTML = destaques.map((jogo, indiceJogo) => gerarMarcacaoCartaoJogo(jogo, indiceJogo, { destaque: true, prefixo: "d" })).join("");
    grade.innerHTML = catalogo.jogos.map((jogo, indiceJogo) => gerarMarcacaoCartaoJogo(jogo, indiceJogo)).join("");

    renderizarFiltrosCategorias();
    renderizarJogosRecentes();
    renderizarIndicadoresDestaque();
    renderizarPerfilJogador();
    aplicarFiltros();

    // --- EVENTOS ---
    filtros.addEventListener("click", (evento) => {
        const btnFiltrarCategoria = evento.target.closest(".chip");
        if (!btnFiltrarCategoria) {
            return;
        }
        estado.categoria = btnFiltrarCategoria.dataset.categoria;
        aplicarFiltros();
    });

    busca.addEventListener("input", () => definirTermoBusca(busca.value));

    busca.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            definirTermoBusca("");
        }
    });

    btnLimparBuscaCatalogo.addEventListener("click", () => {
        definirTermoBusca("");
        busca.focus();
    });

    document.getElementById("limparFiltros")?.addEventListener("click", () => {
        estado.categoria = "todas";
        definirTermoBusca("");
    });

    // --- BUSCA DO CABEÇALHO ---
    document.addEventListener("fg11:busca", (evento) => definirTermoBusca(evento.detail.termo || ""));

    [grade, gradeDestaques, document.getElementById("listaRecentes")].forEach(area => {
        area?.addEventListener("click", aoClicarCartaoJogo);
    });

    document.getElementById("btnPartidaRapida")?.addEventListener("click", iniciarPartidaRapida);

    // --- RESTAURA O ESTADO AO VOLTAR PELO HISTÓRICO ---
    window.addEventListener("pageshow", () => {
        document.querySelectorAll(".gcard.is-selected").forEach(cartaoJogo => cartaoJogo.classList.remove("is-selected"));
        document.getElementById("btnPartidaRapida")?.classList.remove("is-rolling");
    });
})();
