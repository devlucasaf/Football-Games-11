(function () {
    const catalogo = window.FG11Catalogo;
    const perfil = window.FG11Perfil;
    if (!catalogo || !perfil) {
        return;
    }

    const estado = { categoria: "todas", termo: "" };
    const resumo = perfil.resumo();
    const statsPorJogo = new Map(resumo.jogos.map(item => [item.jogo.id, item]));

    const grade             = document.getElementById("gamesGrid");
    const gradeDestaques    = document.getElementById("gradeDestaques");
    const filtros           = document.getElementById("filtrosCategoria");
    const busca             = document.getElementById("buscaCatalogo");
    const limparBusca       = document.getElementById("limparBusca");
    const estadoVazio       = document.getElementById("estadoVazio");
    const contagem          = document.getElementById("contagemJogos");

    // --- REMOVE ACENTOS PARA BUSCAR "ESTADIO" E ACHAR "ESTÁDIO" ---
    function normalizar(texto) {
        return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    }

    // --- DESTAQUE DE PONTUAÇÃO DO CARD ---
    function htmlPlacar(jogo) {
        const stats = statsPorJogo.get(jogo.id);

        if (!jogo.estatisticas) {
            return `
                <div class="gcard-score gcard-score--free">
                    <i class="fas fa-infinity" aria-hidden="true"></i>
                    <span data-key="card-free-mode">Modo livre</span>
                </div>`;
        }

        if (!stats || stats.partidas === 0) {
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
                    <strong>${stats.vitorias}</strong>
                    <span data-key="ranking-wins-short">V</span>
                    <span class="gcard-sep" aria-hidden="true">·</span>
                    <strong>${stats.derrotas}</strong>
                    <span data-key="ranking-losses-short">D</span>
                </span>
                <span class="gcard-rate" title="Aproveitamento">${perfil.porcentagem(stats.aproveitamento)}</span>
                <span class="gcard-meter" aria-hidden="true">
                    <span style="width:${Math.round(stats.aproveitamento * 100)}%"></span>
                </span>
            </div>`;
    }

    // --- CARD DE JOGO ---
    function htmlCard(jogo, indice, opcoes = {}) {
        const categoria = catalogo.categorias[jogo.categoria];
        const idTitulo = `${opcoes.prefixo || "g"}-${jogo.id}`;
        const numero = String(indice + 1).padStart(2, "0");

        return `
            <article class="gcard${opcoes.destaque ? " gcard--featured" : ""}" data-id="${jogo.id}" data-cat="${jogo.categoria}" style="--i:${indice}" aria-labelledby="${idTitulo}">
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
                    <h3 class="gcard-title" id="${idTitulo}" data-key="${jogo.tituloKey}">${jogo.titulo}</h3>
                    <p class="gcard-desc" data-key="${jogo.descKey}">${jogo.desc}</p>
                    ${htmlPlacar(jogo)}
                    <a class="btn gcard-cta" href="${jogo.pagina}" data-jogo="${jogo.id}">
                        <i class="fas fa-play" aria-hidden="true"></i>
                        <span data-key="play-now">Jogar agora</span>
                    </a>
                </div>
            </article>`;
    }

    // --- CHIPS DE CATEGORIA ---
    function renderFiltros() {
        const contagens = {};
        catalogo.jogos.forEach(jogo => {
            contagens[jogo.categoria] = (contagens[jogo.categoria] || 0) + 1;
        });

        const chip = (id, chave, rotulo, icone, total) => `
            <button type="button" class="chip" data-categoria="${id}" aria-pressed="${estado.categoria === id}">
                <i class="fas ${icone}" aria-hidden="true"></i>
                <span data-key="${chave}">${rotulo}</span>
                <span class="chip-count">${total}</span>
            </button>`;

        filtros.innerHTML =
            chip("todas", "cat-all", "Todos", "fa-border-all", catalogo.jogos.length) +
            Object.entries(catalogo.categorias)
                .map(([id, cat]) => chip(id, cat.rotuloKey, cat.rotulo, cat.icone, contagens[id] || 0))
                .join("");
    }

    // --- APLICA CATEGORIA + BUSCA NOS CARDS ---
    function aplicarFiltros() {
        const termo = normalizar(estado.termo);
        let visiveis = 0;

        grade.querySelectorAll(".gcard").forEach(card => {
            const combinaCategoria = estado.categoria === "todas" || card.dataset.cat === estado.categoria;
            const texto = normalizar(card.textContent);
            const combinaBusca = termo === "" || texto.includes(termo);
            const mostrar = combinaCategoria && combinaBusca;

            card.hidden = !mostrar;
            if (mostrar) {
                card.style.setProperty("--i", visiveis);
                visiveis++;
            }
        });

        contagem.textContent = visiveis;
        estadoVazio.hidden = visiveis !== 0;
        limparBusca.hidden = estado.termo === "";

        filtros.querySelectorAll(".chip").forEach(chip => {
            chip.setAttribute("aria-pressed", chip.dataset.categoria === estado.categoria ? "true" : "false");
        });
    }

    function definirTermo(termo) {
        estado.termo = termo;
        if (busca.value !== termo) {
            busca.value = termo;
        }
        aplicarFiltros();
    }

    // --- CONTINUE JOGANDO ---
    function renderRecentes() {
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
    function renderHero() {
        const definir = (id, valor) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = valor;
            }
        };

        definir("heroPartidas", resumo.partidas);
        definir("heroAproveitamento", perfil.porcentagem(resumo.aproveitamento));
        definir("heroExplorados", resumo.jogosDiferentes);
        definir("heroTotal", resumo.totalJogos);
        definir("heroOvr", resumo.ovr);

        const nivel = document.getElementById("heroNivel");
        if (nivel) {
            nivel.classList.add(`pitch-chip--${resumo.nivel.id}`);
            const rotulo = nivel.querySelector("span");
            rotulo.setAttribute("data-key", resumo.nivel.chave);
            rotulo.textContent = resumo.nivel.nome;
        }
    }

    // --- PERFIL + RANKING ---
    function renderPerfil() {
        const carta = document.getElementById("cartaJogador");
        const progresso = document.getElementById("progressoNivel");
        const ranking = document.getElementById("rankingResumo");

        if (carta) {
            carta.innerHTML = perfil.htmlCarta(resumo);
        }
        if (progresso) {
            progresso.innerHTML = perfil.htmlProgressoNivel(resumo);
        }
        if (ranking) {
            ranking.innerHTML = perfil.htmlRanking(resumo, 5, "");
        }
    }

    // --- NAVEGA COM A TRANSIÇÃO DE SAÍDA ---
    function irPara(href) {
        const reduzir = document.documentElement.getAttribute("data-reduce-motion") === "true"
            || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        
        if (reduzir) {
            window.location.href = href;
            return;
        }
        document.body.classList.add("is-leaving");
        setTimeout(() => {
            window.location.href = href;
        }, 160);
    }

    // --- CLIQUE EM QUALQUER PARTE DO CARD ABRE O JOGO ---
    function aoClicarNoCard(e) {
        const link = e.target.closest("[data-jogo]");
        if (link) {
            perfil.registrarAcesso(link.dataset.jogo);
            return;
        }

        const card = e.target.closest(".gcard");
        if (!card || e.target.closest("a, button")) {
            return;
        }

        const cta = card.querySelector(".gcard-cta");
        card.classList.add("is-selected");
        perfil.registrarAcesso(card.dataset.id);
        irPara(cta.href);
    }

    // --- SORTEIA UM JOGO ---
    function partidaRapida() {
        const jogos = catalogo.jogos;
        const escolhido = jogos[Math.floor(Math.random() * jogos.length)];
        const botao = document.getElementById("btnPartidaRapida");
        botao?.classList.add("is-rolling");
        perfil.registrarAcesso(escolhido.id);
        irPara(escolhido.pagina);
    }

    // --- RENDERIZAÇÃO INICIAL ---
    const destaques = catalogo.jogos.filter(jogo => jogo.destaque);
    gradeDestaques.innerHTML = destaques.map((jogo, i) => htmlCard(jogo, i, { destaque: true, prefixo: "d" })).join("");
    grade.innerHTML = catalogo.jogos.map((jogo, i) => htmlCard(jogo, i)).join("");

    renderFiltros();
    renderRecentes();
    renderHero();
    renderPerfil();
    aplicarFiltros();

    // --- EVENTOS ---
    filtros.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) {
            return;
        }
        estado.categoria = chip.dataset.categoria;
        aplicarFiltros();
    });

    busca.addEventListener("input", () => definirTermo(busca.value));

    busca.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            definirTermo("");
        }
    });

    limparBusca.addEventListener("click", () => {
        definirTermo("");
        busca.focus();
    });

    document.getElementById("limparFiltros")?.addEventListener("click", () => {
        estado.categoria = "todas";
        definirTermo("");
    });

    // --- BUSCA DO CABEÇALHO ---
    document.addEventListener("fg11:busca", (e) => definirTermo(e.detail.termo || ""));

    [grade, gradeDestaques, document.getElementById("listaRecentes")].forEach(area => {
        area?.addEventListener("click", aoClicarNoCard);
    });

    document.getElementById("btnPartidaRapida")?.addEventListener("click", partidaRapida);

    // --- RESTAURA O ESTADO AO VOLTAR PELO HISTÓRICO ---
    window.addEventListener("pageshow", () => {
        document.querySelectorAll(".gcard.is-selected").forEach(card => card.classList.remove("is-selected"));
        document.getElementById("btnPartidaRapida")?.classList.remove("is-rolling");
    });
})();
