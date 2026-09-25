(function () {
    const PREFIXO = "fg11_stats_";

    // --- LÊ TODAS AS ESTATÍSTICAS SALVAS ---
    function lerTodasEstatisticas() {
        const resultado = {};
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave && chave.startsWith(PREFIXO)) {
                const id = chave.slice(PREFIXO.length);
                try {
                    const dados = JSON.parse(localStorage.getItem(chave));
                    if (dados && typeof dados === "object") {
                        resultado[id] = {
                            vitorias: dados.vitorias || 0,
                            derrotas: dados.derrotas || 0
                        };
                    }
                } catch (e) {
                    // ignora entradas corrompidas
                }
            }
        }
        return resultado;
    }

    // --- CARREGA OS METADADOS DOS JOGOS ---
    async function carregarMetadados() {
        try {
            const resp = await fetch("../data/games.json", { cache: "no-store" });
            if (!resp.ok) {
                return {};
            }
            const dados = await resp.json();
            const mapa = {};
            (dados.jogos || []).forEach(j => {
                mapa[j.id] = j;
            });
            return mapa;
        } catch (e) {
            return {};
        }
    }

    // --- TRADUZ UMA CHAVE NO IDIOMA ATUAL ---
    function traduzir(key, fallback) {
        const idioma = localStorage.getItem("preferredLanguage") || "traducoes";
        const linguas = window.translations;
        if (linguas && linguas[idioma] && linguas[idioma][key]) {
            return linguas[idioma][key];
        }
        return fallback;
    }

    // --- MONTA O PAINEL ---
    async function montar() {
        const estatisticas = lerTodasEstatisticas();
        const metadados = await carregarMetadados();

        const ids = Object.keys(estatisticas);
        const resumo = document.getElementById("statsResumo");
        const grade = document.getElementById("statsGrade");
        const vazio = document.getElementById("statsVazio");

        let totalV = 0;
        let totalD = 0;
        ids.forEach(id => {
            totalV += estatisticas[id].vitorias;
            totalD += estatisticas[id].derrotas;
        });
        const totalPartidas = totalV + totalD;
        const taxa = totalPartidas > 0 ? Math.round((totalV / totalPartidas) * 100) : 0;

        // --- SEQUÊNCIA DE DIAS ---
        let streak = { sequencia: 0, recorde: 0 };
        if (window.FG11Stats && window.FG11Stats.obterStreak) {
            streak = window.FG11Stats.obterStreak();
        }

        if (totalPartidas === 0) {
            if (vazio) {
                vazio.classList.remove("hidden");
            }
            return;
        }

        // --- CARDS DE RESUMO ---
        const cardsResumo = [
            { 
                icone: "fa-trophy", 
                valor: totalV, 
                key: "stats-total-wins", 
                texto: "Vitórias" 
            },
            { 
                icone: "fa-xmark", 
                valor: totalD, 
                key: "stats-total-losses", 
                texto: "Derrotas" 
            },
            { 
                icone: "fa-percent", 
                valor: `${taxa}%`, 
                key: "stats-winrate", 
                texto: "Taxa de acerto" 
            },
            { 
                icone: "fa-gamepad", 
                valor: ids.length, 
                key: "stats-games-played", 
                texto: "Jogos jogados" 
            },
            { 
                icone: "fa-fire", 
                valor: streak.sequencia, 
                key: "stats-streak", 
                texto: "Dias seguidos" 
            },
            { 
                icone: "fa-award", 
                valor: streak.recorde, 
                key: "stats-streak-record", 
                texto: "Recorde de dias" 
            }
        ];

        resumo.innerHTML = cardsResumo.map(c =>
            `<div class="stats-resumo-card">
                <i class="fas ${c.icone}"></i>
                <span class="stats-resumo-valor">${c.valor}</span>
                <span class="stats-resumo-label" data-key="${c.key}">${traduzir(c.key, c.texto)}</span>
            </div>`
        ).join("");

        // --- CARDS POR JOGO (ORDENADO POR MAIS JOGADO) ---
        const ordenados = ids.slice().sort((a, b) => {
            const pa = estatisticas[a].vitorias + estatisticas[a].derrotas;
            const pb = estatisticas[b].vitorias + estatisticas[b].derrotas;
            return pb - pa;
        });

        grade.innerHTML = ordenados.map(id => {
            const meta = metadados[id] || {};
            const v = estatisticas[id].vitorias;
            const d = estatisticas[id].derrotas;
            const partidas = v + d;
            const pct = partidas > 0 ? Math.round((v / partidas) * 100) : 0;
            const icone = meta.icone || "fa-futbol";
            const nome = meta.tituloKey ? traduzir(meta.tituloKey, id) : id;
            const nomeKey = meta.tituloKey || "";

            return `<div class="stats-jogo-card">
                <div class="stats-jogo-icone"><i class="fas ${icone}"></i></div>
                <div class="stats-jogo-info">
                    <h3${nomeKey ? ` data-key="${nomeKey}"` : ""}>${nome}</h3>
                    <div class="stats-jogo-barra">
                        <div class="stats-jogo-barra-fill" style="width:${pct}%"></div>
                    </div>
                    <div class="stats-jogo-nums">
                        <span class="stats-vit"><i class="fas fa-trophy"></i> ${v}</span>
                        <span class="stats-der"><i class="fas fa-xmark"></i> ${d}</span>
                        <span class="stats-taxa">${pct}%</span>
                    </div>
                </div>
            </div>`;
        }).join("");

        if (window.applyTranslation) {
            const idioma = localStorage.getItem("preferredLanguage") || "traducoes";
            window.applyTranslation(idioma);
        }
    }

    document.addEventListener("DOMContentLoaded", montar);
})();
