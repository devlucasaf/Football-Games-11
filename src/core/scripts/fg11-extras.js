(function () {
    const CHAVE_FAVORITOS = "fg11_favoritos";

    function obterFavoritos() {
        let lista = null;
        try {
            lista = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS));
        } catch (e) {
            lista = null;
        }
        return Array.isArray(lista) ? lista : [];
    }

    function ehFavorito(id) {
        return obterFavoritos().includes(id);
    }

    function alternarFavorito(id) {
        const lista = obterFavoritos();
        const idx = lista.indexOf(id);
        if (idx >= 0) {
            lista.splice(idx, 1);
        } else {
            lista.push(id);
        }
        localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
        return idx < 0; 
    }

    window.FG11Favoritos = { obter: obterFavoritos, alternar: alternarFavorito, ehFavorito };

    //  --- MONTAGEM NA PÁGINA INICIAL ---
    document.addEventListener("DOMContentLoaded", () => {
        const grade = document.querySelector(".coming-soon-grid");
        if (!grade) {
            return; 
        }

        montarFavoritos(grade);
        montarBadgeStreak();
        montarDesafioDoDia();
    });

    // --- EXTRAI O ID DO JOGO A PARTIR DO LINK DO CARD ---
    function idDoCard(card) {
        const link = card.querySelector("a[href*='src/games/']");
        if (!link) {
            return null;
        }
        const m = link.getAttribute("href").match(/src\/games\/([^/]+)\//);
        return m ? m[1] : null;
    }

    // --- ADICIONA ESTRELA DE FAVORITO EM CADA CARD E REORDENA ---
    function montarFavoritos(grade) {
        const cards = Array.from(grade.querySelectorAll(".coming-soon-card"));

        cards.forEach(card => {
            const id = idDoCard(card);
            if (!id) {
                return;
            }

            const botao = document.createElement("button");
            botao.className = "fav-toggle";
            botao.type = "button";
            botao.setAttribute("aria-label", "Favoritar jogo");
            botao.title = "Favoritar";
            botao.innerHTML = "<i class=\"fa-star\"></i>";
            atualizarEstadoBotao(botao, window.FG11Favoritos.ehFavorito(id));

            botao.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const virouFavorito = window.FG11Favoritos.alternar(id);
                atualizarEstadoBotao(botao, virouFavorito);
                reordenarFavoritos(grade);
            });

            card.classList.add("tem-favorito");
            card.insertBefore(botao, card.firstChild);
        });

        reordenarFavoritos(grade);
    }

    function atualizarEstadoBotao(botao, ativo) {
        const icone = botao.querySelector("i");
        botao.classList.toggle("ativo", ativo);
        if (icone) {
            icone.className = ativo ? "fas fa-star" : "far fa-star";
        }
        botao.setAttribute("aria-pressed", ativo ? "true" : "false");
    }

    // --- MOVE OS CARDS FAVORITOS PARA O TOPO ---
    function reordenarFavoritos(grade) {
        const favoritos = window.FG11Favoritos.obter();
        const cards = Array.from(grade.querySelectorAll(".coming-soon-card"));

        cards
            .filter(card => favoritos.includes(idDoCard(card)))
            .reverse()
            .forEach(card => grade.insertBefore(card, grade.firstChild));
    }

    // --- MOSTRA O SELO DE SEQUÊNCIA DE DIAS NO HERO ---
    function montarBadgeStreak() {
        if (!window.FG11Stats || !window.FG11Stats.obterStreak) {
            return;
        }

        const streak = window.FG11Stats.obterStreak();
        if (!streak.sequencia || streak.sequencia < 1) {
            return;
        }

        const heroStats = document.querySelector(".hero-stats");
        if (!heroStats || document.getElementById("streakBadge")) {
            return;
        }

        const badge = document.createElement("div");
        badge.className = "stat streak-badge";
        badge.id = "streakBadge";
        badge.innerHTML =
            `<span class="stat-number"><i class="fas fa-fire"></i> ${streak.sequencia}</span>` +
            `<span class="stat-label" data-key="streak-label">dias seguidos</span>`;
        heroStats.appendChild(badge);
    }

    // --- MONTA A SEÇÃO "DESAFIO DO DIA" ---
    async function montarDesafioDoDia() {
        const secao = document.querySelector(".minigames-section .container");
        if (!secao || document.getElementById("desafioDia")) {
            return;
        }

        let jogos = [];
        try {
            const resp = await fetch("src/core/data/games.json", { cache: "no-store" });
            if (resp.ok) {
                const dados = await resp.json();
                // --- SÓ ENTRAM JOGOS QUE REGISTRAM O RESULTADO (PARA CONCLUIR O DESAFIO) ---
                jogos = (dados.jogos || []).filter(j => j.estatisticas === true);
            }
        } catch (e) {
            jogos = [];
        }

        const jogo = window.FG11Daily.escolherDoDia(jogos);
        if (!jogo) {
            return;
        }

        const resultado = window.FG11Daily.resultadoDeHoje();
        const feito = resultado !== null;
        const sequencia = window.FG11Daily.sequenciaDiaria();

        // --- JOGO DO DIA ABRE NO MODO DIÁRIO; DEPOIS DE CONCLUÍDO, ABRE NO MODO LIVRE ---
        const destino = feito ? jogo.pagina : `${jogo.pagina}?diario=1`;
        const chaveBotao = !feito ? "daily-play" : (resultado.venceu ? "daily-done-win" : "daily-done-loss");
        const textoBotao = !feito ? "Jogar agora" : (resultado.venceu ? "Vencido hoje" : "Concluído hoje");

        const semana = window.FG11Daily.ultimosDias(7).map(item => {
            const estado = item.resultado ? (item.resultado.venceu ? "vitoria" : "derrota") : "vazio";
            return `<span class="desafio-dia-ponto ${estado}${item.hoje ? " hoje" : ""}" title="${item.dia}"></span>`;
        }).join("");

        const bloco = document.createElement("section");
        bloco.className = "desafio-dia";
        bloco.id = "desafioDia";
        bloco.innerHTML =
            `<div class="desafio-dia-info">
                <span class="desafio-dia-tag" data-key="daily-tag"><i class="fas fa-calendar-day"></i> Desafio do Dia</span>
                <h3 class="desafio-dia-nome">
                    <i class="fas ${jogo.icone}"></i>
                    <span data-key="${jogo.tituloKey}">${jogo.titulo || jogo.id}</span>
                </h3>
                <p class="desafio-dia-sub" data-key="daily-sub">O mesmo desafio para todos, hoje. Volte amanhã para um novo!</p>
                <div class="desafio-dia-progresso">
                    <span class="desafio-dia-semana" role="img" aria-label="Últimos 7 dias">${semana}</span>
                    ${sequencia > 0 ? `<span class="desafio-dia-seq"><i class="fas fa-fire"></i> ${sequencia} <span data-key="daily-streak-text">dias seguidos no desafio</span></span>` : ""}
                </div>
            </div>
            <a href="${destino}" class="desafio-dia-btn${feito ? " feito" : ""}" id="desafioDiaBtn">
                <i class="fas ${feito ? "fa-check" : "fa-play"}"></i>
                <span data-key="${chaveBotao}">${textoBotao}</span>
            </a>`;

        secao.insertBefore(bloco, secao.firstChild);

        if (window.applyTranslation) {
            const idioma = localStorage.getItem("preferredLanguage") || "traducoes";
            window.applyTranslation(idioma);
        }
    }
})();
