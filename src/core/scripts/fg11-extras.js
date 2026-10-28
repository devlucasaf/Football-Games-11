// --- RECURSOS EXTRAS ---
(function () {
    const CHAVE_FAVORITOS = "fg11_favoritos";

    // --- OBTÉM A LISTA DE JOGOS FAVORITOS ---
    function obterFavoritos() {
        let lista = null;
        try {
            lista = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS));
        } catch (erro) {
            lista = null;
        }

        if (Array.isArray(lista)) {
            return lista;
        } else {
            return [];
        }
    }

    // --- VERIFICA SE UM JOGO É FAVORITO ---
    function ehFavorito(identificadorJogo) {
        return obterFavoritos().includes(identificadorJogo);
    }

    // --- ALTERNA O STATUS DE FAVORITO DE UM JOGO ---
    function alternarFavorito(identificadorJogo) {
        const lista = obterFavoritos();
        const indiceFavorito = lista.indexOf(identificadorJogo);
        if (indiceFavorito >= 0) {
            lista.splice(indiceFavorito, 1);
        } else {
            lista.push(identificadorJogo);
        }
        localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
        return indiceFavorito < 0; 
    }

    window.FG11Favoritos = { obter: obterFavoritos, alternar: alternarFavorito, ehFavorito };

    //  --- MONTAGEM NA PÁGINA INICIAL ---
    document.addEventListener("DOMContentLoaded", () => {
        const grade = document.querySelector(".coming-soon-grid");
        if (!grade) {
            return; 
        }

        montarFavoritos(grade);
        montarSeloSequenciaDias();
        montarDesafioDoDia();
    });

    // --- EXTRAI O ID DO JOGO A PARTIR DO LINK DO CARD ---
    function obterIdentificadorJogoCartao(cartaoJogo) {
        const ligacaoJogo = cartaoJogo.querySelector("a[href*='src/games/']");
        if (!ligacaoJogo) {
            return null;
        }
        const correspondenciaCaminho = ligacaoJogo.getAttribute("href").match(/src\/games\/([^/]+)\//);
        
        if (correspondenciaCaminho) {
            return correspondenciaCaminho[1];
        } else {
            return null;
        }
    }

    // --- ADICIONA ESTRELA DE FAVORITO EM CADA CARD E REORDENA ---
    function montarFavoritos(grade) {
        const cartoesJogos = Array.from(grade.querySelectorAll(".coming-soon-card"));

        cartoesJogos.forEach(cartaoJogo => {
            const identificadorJogo = obterIdentificadorJogoCartao(cartaoJogo);
            if (!identificadorJogo) {
                return;
            }

            const btnAlternarFavorito = document.createElement("button");
            
            btnAlternarFavorito.className = "fav-toggle";
            btnAlternarFavorito.type = "button";
            btnAlternarFavorito.setAttribute("aria-label", "Favoritar jogo");
            btnAlternarFavorito.title = "Favoritar";
            btnAlternarFavorito.innerHTML = "<i class=\"fa-star\"></i>";
            
            atualizarEstadoBotaoFavorito(btnAlternarFavorito, window.FG11Favoritos.ehFavorito(identificadorJogo));

            btnAlternarFavorito.addEventListener("click", (evento) => {
                evento.preventDefault();
                evento.stopPropagation();
                const virouFavorito = window.FG11Favoritos.alternar(identificadorJogo);
                atualizarEstadoBotaoFavorito(btnAlternarFavorito, virouFavorito);
                reordenarFavoritos(grade);
            });

            cartaoJogo.classList.add("tem-favorito");
            cartaoJogo.insertBefore(btnAlternarFavorito, cartaoJogo.firstChild);
        });

        reordenarFavoritos(grade);
    }

    // --- ATUALIZA O ESTADO VISUAL DO BOTÃO DE FAVORITO ---
    function atualizarEstadoBotaoFavorito(btnAlternarFavorito, ativo) {
        const icone = btnAlternarFavorito.querySelector("i");
        btnAlternarFavorito.classList.toggle("ativo", ativo);
        if (icone) {
            if (ativo) {
                icone.className = "fas fa-star";
            } else {
                icone.className = "far fa-star";
            }
        }
        
        if (ativo) {
            btnAlternarFavorito.setAttribute("aria-pressed", "true");
        } else {
            btnAlternarFavorito.setAttribute("aria-pressed", "false");
        }
    }

    // --- MOVE OS CARDS FAVORITOS PARA O TOPO ---
    function reordenarFavoritos(grade) {
        const favoritos = window.FG11Favoritos.obter();
        const cartoesJogos = Array.from(grade.querySelectorAll(".coming-soon-card"));

        cartoesJogos
            .filter(cartaoJogo => favoritos.includes(obterIdentificadorJogoCartao(cartaoJogo)))
            .reverse()
            .forEach(cartaoJogo => grade.insertBefore(cartaoJogo, grade.firstChild));
    }

    // --- MOSTRA O SELO DE SEQUÊNCIA DE DIAS NO HERO ---
    function montarSeloSequenciaDias() {
        if (!window.FG11Stats || !window.FG11Stats.obterStreak) {
            return;
        }

        const sequenciaDias = window.FG11Stats.obterStreak();
        if (!sequenciaDias.sequencia || sequenciaDias.sequencia < 1) {
            return;
        }

        const indicadoresDestaque = document.querySelector(".hero-stats");
        if (!indicadoresDestaque || document.getElementById("streakBadge")) {
            return;
        }

        const seloSequencia = document.createElement("div");
        seloSequencia.className = "stat streak-badge";
        seloSequencia.id = "streakBadge";
        seloSequencia.innerHTML =
            `<span class="stat-number"><i class="fas fa-fire"></i> ${sequenciaDias.sequencia}</span>` +
            `<span class="stat-label" data-key="streak-label">dias seguidos</span>`;
        indicadoresDestaque.appendChild(seloSequencia);
    }

    // --- MONTA A SEÇÃO "DESAFIO DO DIA" ---
    async function montarDesafioDoDia() {
        const secao = document.querySelector(".minigames-section .container");
        if (!secao || document.getElementById("desafioDia")) {
            return;
        }

        let jogos = [];
        try {
            const respostaCatalogo = await fetch("src/core/data/games.json", { cache: "no-store" });
            if (respostaCatalogo.ok) {
                const dados = await respostaCatalogo.json();
                jogos = (dados.jogos || []).filter(jogo => jogo.estatisticas === true);
            }
        } catch (erro) {
            jogos = [];
        }

        const jogo = window.FG11Daily.escolherDoDia(jogos);
        if (!jogo) {
            return;
        }

        const resultado = window.FG11Daily.resultadoDeHoje();
        const feito = resultado !== null;
        const sequencia = window.FG11Daily.sequenciaDiaria();

        let destino;
        if (feito) {
            destino = jogo.pagina;
        } else {
            destino = `${jogo.pagina}?diario=1`;
        }

        let chaveBotao;
        if (!feito) {
            chaveBotao = "daily-play";
        } else if (resultado.venceu) {
            chaveBotao = "daily-done-win";
        } else {
            chaveBotao = "daily-done-loss";
        }

        let textoBotao;
        if (!feito) {
            textoBotao = "Jogar agora";
        } else if (resultado.venceu) {
            textoBotao = "Vencido hoje";
        } else {
            textoBotao = "Concluído hoje";
        }

        const semana = window.FG11Daily.ultimosDias(7).map(item => {
            let estado;
            if (!item.resultado) {
                estado = "vazio";
            } else if (item.resultado.venceu) {
                estado = "vitoria";
            } else {
                estado = "derrota";
            }

            let classeHoje = "";
            if (item.hoje) {
                classeHoje = " hoje";
            }

            return `<span class="desafio-dia-ponto ${estado}${classeHoje}" title="${item.dia}"></span>`;
        }).join("");

        let marcacaoSequencia = "";
        if (sequencia > 0) {
            marcacaoSequencia = `<span class="desafio-dia-seq"><i class="fas fa-fire"></i> ${sequencia} <span data-key="daily-streak-text">dias seguidos no desafio</span></span>`;
        }

        let classeBotao = "desafio-dia-btn";
        if (feito) {
            classeBotao = "desafio-dia-btn feito";
        }

        let iconeBotao;
        if (feito) {
            iconeBotao = "fa-check";
        } else {
            iconeBotao = "fa-play";
        }

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
                    ${marcacaoSequencia}
                </div>
            </div>
            <a href="${destino}" class="${classeBotao}" id="desafioDiaBtn">
                <i class="fas ${iconeBotao}"></i>
                <span data-key="${chaveBotao}">${textoBotao}</span>
            </a>`;

        secao.insertBefore(bloco, secao.firstChild);

        if (window.applyTranslation) {
            const idioma = localStorage.getItem("preferredLanguage") || "traducoes";
            window.applyTranslation(idioma);
        }
    }
})();
