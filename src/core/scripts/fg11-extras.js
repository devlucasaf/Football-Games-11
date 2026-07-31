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

    const CHAVE_DIARIO = "fg11_diario";

    function diaDeHoje() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    // --- GERA UM NÚMERO ESTÁVEL A PARTIR DE UMA STRING ---
    function semente(texto) {
        let h = 0;
        for (let i = 0; i < texto.length; i++) {
            h = (h * 31 + texto.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    // --- ESCOLHE UM ITEM DE FORMA DETERMINÍSTICA PARA O DIA ---
    function escolherDoDia(lista) {
        if (!lista || lista.length === 0) {
            return null;
        }
        const idx = semente(diaDeHoje()) % lista.length;
        return lista[idx];
    }

    function obterDiario() {
        let dados = null;
        try {
            dados = JSON.parse(localStorage.getItem(CHAVE_DIARIO));
        } catch (e) {
            dados = null;
        }

        if (!dados || typeof dados !== "object") {
            dados = { 
                dia: null, 
                feito: false 
            };
        }
        return dados;
    }

    function marcarDiarioFeito() {
        localStorage.setItem(CHAVE_DIARIO, JSON.stringify({ 
            dia: diaDeHoje(), 
            feito: true 
        }));
    }

    function diarioFeitoHoje() {
        const d = obterDiario();
        return d.feito === true && d.dia === diaDeHoje();
    }

    window.FG11Daily = { escolherDoDia, diaDeHoje, marcarFeito: marcarDiarioFeito, feitoHoje: diarioFeitoHoje };

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
                const categoriasValidas = ["adivinhacao", "palavra", "logica", "ordenacao", "conhecimento", "memoria"];
                jogos = (dados.jogos || []).filter(j => categoriasValidas.includes(j.categoria));
            }
        } catch (e) {
            jogos = [];
        }

        if (jogos.length === 0) {
            return;
        }

        const jogo = window.FG11Daily.escolherDoDia(jogos);
        if (!jogo) {
            return;
        }

        const feito = window.FG11Daily.feitoHoje();

        const bloco = document.createElement("section");
        bloco.className = "desafio-dia";
        bloco.id = "desafioDia";
        bloco.innerHTML =
            `<div class="desafio-dia-info">
                <span class="desafio-dia-tag" data-key="daily-tag"><i class="fas fa-calendar-day"></i> Desafio do Dia</span>
                <h3 class="desafio-dia-nome">
                    <i class="fas ${jogo.icone}"></i>
                    <span data-key="${jogo.tituloKey}">${jogo.id}</span>
                </h3>
                <p class="desafio-dia-sub" data-key="daily-sub">O mesmo desafio para todos, hoje. Volte amanhã para um novo!</p>
            </div>
            <a href="${jogo.pagina}" class="desafio-dia-btn${feito ? " feito" : ""}" id="desafioDiaBtn">
                <i class="fas ${feito ? "fa-check" : "fa-play"}"></i>
                <span data-key="${feito ? "daily-done" : "daily-play"}">${feito ? "Jogado hoje" : "Jogar agora"}</span>
            </a>`;

        secao.insertBefore(bloco, secao.firstChild);

        const botao = document.getElementById("desafioDiaBtn");
        if (botao) {
            botao.addEventListener("click", () => window.FG11Daily.marcarFeito());
        }

        if (window.applyTranslation) {
            const idioma = localStorage.getItem("preferredLanguage") || "traducoes";
            window.applyTranslation(idioma);
        }
    }
})();
