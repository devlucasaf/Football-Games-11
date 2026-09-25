// --- PERFIL DO JOGADOR ---
(function () {
    const CHAVE_RECENTES = "fg11_recentes";
    const CHAVE_APELIDO = "fg11_apelido";
    const MAX_RECENTES = 6;

    // --- FAIXAS DE NÍVEL POR VITÓRIAS ---
    const NIVEIS = [
        { id: "bronze", chave: "tier-bronze", nome: "Bronze", minimo: 0 },
        { id: "prata",  chave: "tier-silver", nome: "Prata",  minimo: 10 },
        { id: "ouro",   chave: "tier-gold",   nome: "Ouro",   minimo: 30 },
        { id: "elite",  chave: "tier-elite",  nome: "Elite",  minimo: 75 },
        { id: "lenda",  chave: "tier-legend", nome: "Lenda",  minimo: 150 }
    ];

    // --- CONQUISTAS (MEDALHAS) ---
    const CONQUISTAS = [
        { id: "primeira",     icone: "fa-futbol",         medalha: "bronze", tituloKey: "ach-first-title",      titulo: "Primeiro gol",   descKey: "ach-first-desc",      desc: "Vença sua primeira partida",                 meta: 1,   valor: r => r.vitorias },
        { id: "hat-trick",    icone: "fa-fire",           medalha: "bronze", tituloKey: "ach-hattrick-title",   titulo: "Hat-trick",      descKey: "ach-hattrick-desc",   desc: "Acumule 3 vitórias",                         meta: 3,   valor: r => r.vitorias },
        { id: "explorador",   icone: "fa-compass",        medalha: "bronze", tituloKey: "ach-explorer-title",   titulo: "Explorador",     descKey: "ach-explorer-desc",   desc: "Jogue 5 minigames diferentes",               meta: 5,   valor: r => r.jogosDiferentes },
        { id: "dez",          icone: "fa-medal",          medalha: "prata",  tituloKey: "ach-ten-title",        titulo: "Titular",        descKey: "ach-ten-desc",        desc: "Acumule 10 vitórias",                        meta: 10,  valor: r => r.vitorias },
        { id: "colecionador", icone: "fa-layer-group",    medalha: "prata",  tituloKey: "ach-collector-title",  titulo: "Colecionador",   descKey: "ach-collector-desc",  desc: "Jogue 15 minigames diferentes",              meta: 15,  valor: r => r.jogosDiferentes },
        { id: "maratonista",  icone: "fa-person-running", medalha: "prata",  tituloKey: "ach-marathon-title",   titulo: "Maratonista",    descKey: "ach-marathon-desc",   desc: "Dispute 100 partidas",                       meta: 100, valor: r => r.partidas },
        { id: "cinquenta",    icone: "fa-trophy",         medalha: "ouro",   tituloKey: "ach-fifty-title",      titulo: "Artilheiro",     descKey: "ach-fifty-desc",      desc: "Acumule 50 vitórias",                        meta: 50,  valor: r => r.vitorias },
        { id: "craque",       icone: "fa-star",           medalha: "ouro",   tituloKey: "ach-ace-title",        titulo: "Craque",         descKey: "ach-ace-desc",        desc: "70% de aproveitamento em 20+ partidas",      meta: 70,  valor: r => (r.partidas >= 20 ? Math.round(r.aproveitamento * 100) : 0) },
        { id: "enciclopedia", icone: "fa-book-open",      medalha: "ouro",   tituloKey: "ach-encyclopedia-title", titulo: "Enciclopédia", descKey: "ach-encyclopedia-desc", desc: "Jogue todos os minigames",                  meta: null, valor: r => r.jogosDiferentes },
        { id: "centenario",   icone: "fa-crown",          medalha: "ouro",   tituloKey: "ach-hundred-title",    titulo: "Lenda do clube", descKey: "ach-hundred-desc",    desc: "Acumule 100 vitórias",                       meta: 100, valor: r => r.vitorias }
    ];

    // --- LEITURA SEGURA DO LOCALSTORAGE ---
    function lerJSON(chave, padrao) {
        try {
            const valor = JSON.parse(localStorage.getItem(chave));
            return valor ?? padrao;
        } catch (e) {
            return padrao;
        }
    }

    function lerNumero(chave) {
        return parseInt(localStorage.getItem(chave) || "0", 10) || 0;
    }

    // --- JOGOS ABERTOS RECENTEMENTE ---
    function obterRecentes() {
        const lista = lerJSON(CHAVE_RECENTES, []);
        return Array.isArray(lista) ? lista : [];
    }

    function registrarAcesso(id) {
        const lista = obterRecentes().filter(item => item !== id);
        lista.unshift(id);
        try {
            localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista.slice(0, MAX_RECENTES)));
        } catch (e) {
            // --- ARMAZENAMENTO INDISPONÍVEL: IGNORA ---
        }
    }

    // --- APELIDO DO JOGADOR ---
    function obterApelido() {
        return (localStorage.getItem(CHAVE_APELIDO) || "").trim();
    }

    function salvarApelido(apelido) {
        const limpo = String(apelido || "").trim().slice(0, 18);
        if (limpo) {
            localStorage.setItem(CHAVE_APELIDO, limpo);
        } else {
            localStorage.removeItem(CHAVE_APELIDO);
        }
        return limpo;
    }

    // --- ESTATÍSTICAS DE UM JOGO ---
    function lerJogo(id) {
        const dados = lerJSON(`fg11_stats_${id}`, null);
        const vitorias = (dados && dados.vitorias) || 0;
        const derrotas = (dados && dados.derrotas) || 0;
        const partidas = vitorias + derrotas;
        return {
            vitorias,
            derrotas,
            partidas,
            aproveitamento: partidas ? vitorias / partidas : 0
        };
    }

    // --- RESUMO COMPLETO DO JOGADOR ---
    function resumo() {
        const catalogo = window.FG11Catalogo ? window.FG11Catalogo.jogos : [];
        const recentes = obterRecentes();

        const jogos = catalogo.map(jogo => ({ jogo, ...lerJogo(jogo.id) }));

        const vitorias = lerNumero("fg11_vitorias");
        const derrotas = lerNumero("fg11_derrotas");
        const partidas = vitorias + derrotas;
        const aproveitamento = partidas ? vitorias / partidas : 0;

        const jogados = new Set(recentes);
        jogos.forEach(item => {
            if (item.partidas > 0) {
                jogados.add(item.jogo.id);
            }
        });
        const jogosDiferentes = catalogo.filter(jogo => jogados.has(jogo.id)).length;

        // --- NÍVEL ATUAL E PROGRESSO ATÉ O PRÓXIMO ---
        let indiceNivel = 0;
        NIVEIS.forEach((nivel, i) => {
            if (vitorias >= nivel.minimo) {
                indiceNivel = i;
            }
        });
        const nivel = NIVEIS[indiceNivel];
        const proximo = NIVEIS[indiceNivel + 1] || null;
        const progressoNivel = proximo
            ? (vitorias - nivel.minimo) / (proximo.minimo - nivel.minimo)
            : 1;

        // --- OVR ---
        const confianca = Math.min(1, partidas / 20);
        const variedade = catalogo.length ? jogosDiferentes / catalogo.length : 0;
        const ovr = Math.min(99, Math.round(50 + 30 * aproveitamento * confianca + 19 * variedade));

        // --- RANKING ---
        const ranking = jogos
            .filter(item => item.partidas > 0)
            .sort((a, b) => b.vitorias - a.vitorias || b.aproveitamento - a.aproveitamento || b.partidas - a.partidas);

        const base = { vitorias, derrotas, partidas, aproveitamento, jogosDiferentes };

        const conquistas = CONQUISTAS.map(c => {
            const meta = c.meta ?? catalogo.length;
            const valor = c.valor(base);
            return { 
                ...c, 
                meta, 
                valor, 
                desbloqueada: valor >= meta, 
                progresso: Math.min(1, valor / meta) 
            };
        });

        return {
            ...base,
            totalJogos: catalogo.length,
            nivel,
            proximo,
            progressoNivel,
            ovr,
            jogos,
            ranking,
            conquistas,
            desbloqueadas: conquistas.filter(c => c.desbloqueada).length,
            recentes: recentes
                .map(id => catalogo.find(jogo => jogo.id === id))
                .filter(Boolean),
            apelido: obterApelido()
        };
    }

    // --- FORMATAÇÃO ---
    function porcentagem(valor) {
        return `${Math.round(valor * 100)}%`;
    }

    // --- CARTA DO JOGADOR ---
    function htmlCarta(r, opcoes = {}) {
        const nome = r.apelido || "Jogador";
        const edicao = opcoes.editavel
            ? `<button type="button" class="pcard-edit" id="btnEditarApelido" aria-label="Editar apelido" title="Editar apelido"><i class="fas fa-pen" aria-hidden="true"></i></button>`
            : "";

        return `
            <div class="pcard pcard--${r.nivel.id}">
                <div class="pcard-shine" aria-hidden="true"></div>
                <div class="pcard-top">
                    <div class="pcard-ovr">
                        <span class="pcard-ovr-num">${r.ovr}</span>
                        <span class="pcard-ovr-label">OVR</span>
                    </div>
                    <div class="pcard-tier">
                        <i class="fas fa-shield-halved" aria-hidden="true"></i>
                        <span data-key="${r.nivel.chave}">${r.nivel.nome}</span>
                    </div>
                </div>
                <div class="pcard-avatar" aria-hidden="true">
                    <i class="fas fa-user-astronaut"></i>
                </div>
                <div class="pcard-name">
                    <span class="pcard-name-text" ${r.apelido ? "" : 'data-key="profile-default-name"'}>${escapar(nome)}</span>
                    ${edicao}
                </div>
                <dl class="pcard-attrs">
                    <div>
                        <dt data-key="attr-played">PJ</dt>
                        <dd>${r.partidas}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-wins">VIT</dt>
                        <dd>${r.vitorias}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-rate">APR</dt>
                        <dd>${porcentagem(r.aproveitamento)}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-losses">DER</dt>
                        <dd>${r.derrotas}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-games">JOG</dt>
                        <dd>${r.jogosDiferentes}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-medals">MED</dt>
                        <dd>${r.desbloqueadas}</dd>
                    </div>
                </dl>
            </div>`;
    }

    // --- BARRA DE PROGRESSO DO NÍVEL ---
    function htmlProgressoNivel(r) {
        const faltam = r.proximo ? r.proximo.minimo - r.vitorias : 0;
        const legenda = r.proximo
            ? `<span class="tier-progress-hint">
                    <strong>${faltam}</strong> 
                    <span data-key="tier-wins-to">vitórias para</span> 
                    <span data-key="${r.proximo.chave}">${r.proximo.nome}</span>
                </span>`
            : `<span class="tier-progress-hint" data-key="tier-max">Nível máximo alcançado!</span>`;

        return `
            <div class="tier-progress">
                <div class="tier-progress-head">
                    <span class="tier-chip tier-chip--${r.nivel.id}"><i class="fas fa-shield-halved" aria-hidden="true"></i> <span data-key="${r.nivel.chave}">${r.nivel.nome}</span></span>
                    ${legenda}
                </div>
                <div class="tier-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(r.progressoNivel * 100)}" aria-label="Progresso de nível">
                    <span style="width:${Math.max(4, r.progressoNivel * 100)}%"></span>
                </div>
            </div>`;
    }

    // --- LISTA DE RANKING (TOP N) ---
    function htmlRanking(r, limite, raiz) {
        if (r.ranking.length === 0) {
            return `
                <div class="empty-state empty-state--compact">
                    <i class="fas fa-ranking-star" aria-hidden="true"></i>
                    <p data-key="ranking-empty">Vença partidas para montar o seu ranking de jogos.</p>
                </div>`;
        }

        const medalhas = ["ouro", "prata", "bronze"];
        const itens = r.ranking.slice(0, limite).map((item, i) => `
                <li class="rank-item">
                    <span class="rank-pos ${medalhas[i] ? `rank-pos--${medalhas[i]}` : ""}">${i < 3 ? '<i class="fas fa-medal" aria-hidden="true"></i>' : ""}<span>${i + 1}</span></span>
                    <span class="rank-icon" data-cat="${item.jogo.categoria}" aria-hidden="true"><i class="fas ${item.jogo.icone}"></i></span>
                    <a class="rank-name" href="${raiz}${item.jogo.pagina}" data-key="${item.jogo.tituloKey}">${item.jogo.titulo}</a>
                    <span class="rank-score"><strong>${item.vitorias}</strong> <span data-key="ranking-wins-short">V</span></span>
                    <span class="rank-rate">${porcentagem(item.aproveitamento)}</span>
                </li>`).join("");

        return `<ol class="rank-list">${itens}</ol>`;
    }

    // --- ESCAPA TEXTO DIGITADO PELO USUÁRIO ---
    function escapar(texto) {
        return String(texto).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    // --- REAPLICA O IDIOMA APÓS RENDERIZAR CONTEÚDO NOVO ---
    function retraduzir() {
        if (window.applyTranslation && document.readyState !== "loading") {
            window.applyTranslation(localStorage.getItem("preferredLanguage") || "traducoes");
        }
    }

    window.FG11Perfil = {
        resumo,
        registrarAcesso,
        obterApelido,
        salvarApelido,
        htmlCarta,
        htmlProgressoNivel,
        htmlRanking,
        porcentagem,
        escapar,
        retraduzir,
        NIVEIS
    };
})();
