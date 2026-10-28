// --- PERFIL DO JOGADOR ---
(function () {
    const CHAVE_RECENTES = "fg11_recentes";
    const CHAVE_APELIDO = "fg11_apelido";
    const QUANTIDADE_MAXIMA_JOGOS_RECENTES = 6;
    const CHAVE_CONQUISTAS_VISTAS = "fg11_conquistas_vistas";

    // --- FAIXAS DE NÍVEL POR VITÓRIAS ---
    const NIVEIS = [
        { 
            id: "bronze", 
            chave: "tier-bronze", 
            nome: "Bronze", 
            minimo: 0 
        },
        { 
            id: "prata",  
            chave: "tier-silver", 
            nome: "Prata",  
            minimo: 10 
        },
        { 
            id: "ouro",   
            chave: "tier-gold",   
            nome: "Ouro",   
            minimo: 30 
        },
        { 
            id: "elite",  
            chave: "tier-elite",  
            nome: "Elite",  
            minimo: 75 
        },
        { 
            id: "lenda",  
            chave: "tier-legend", 
            nome: "Lenda",  
            minimo: 150 
        }
    ];

    const CONQUISTAS = [
        { 
            id: "primeira",     
            icone: "fa-futbol",         
            medalha: "bronze", 
            tituloKey: "ach-first-title",      
            titulo: "Primeiro gol",   
            descKey: "ach-first-desc",      
            desc: "Vença sua primeira partida",                 
            meta: 1,   
            valor: resumoPerfil => resumoPerfil.vitorias 
        },
        { 
            id: "hat-trick",    
            icone: "fa-fire",           
            medalha: "bronze", 
            tituloKey: "ach-hattrick-title",   
            titulo: "Hat-trick",      
            descKey: "ach-hattrick-desc",   
            desc: "Acumule 3 vitórias",                         
            meta: 3,   
            valor: resumoPerfil => resumoPerfil.vitorias 
        },
        { 
            id: "explorador",   
            icone: "fa-compass",        
            medalha: "bronze", 
            tituloKey: "ach-explorer-title",   
            titulo: "Explorador",     
            descKey: "ach-explorer-desc",   
            desc: "Jogue 5 minigames diferentes",               
            meta: 5,   
            valor: resumoPerfil => resumoPerfil.jogosDiferentes 
        },
        { 
            id: "dez",          
            icone: "fa-medal",          
            medalha: "prata",  
            tituloKey: "ach-ten-title",        
            titulo: "Titular",        
            descKey: "ach-ten-desc",        
            desc: "Acumule 10 vitórias",                        
            meta: 10,  
            valor: resumoPerfil => resumoPerfil.vitorias 
        },
        { 
            id: "colecionador", 
            icone: "fa-layer-group",    
            medalha: "prata",  
            tituloKey: "ach-collector-title",  
            titulo: "Colecionador",   
            descKey: "ach-collector-desc",  
            desc: "Jogue 15 minigames diferentes",              
            meta: 15,  
            valor: resumoPerfil => resumoPerfil.jogosDiferentes 
        },
        { 
            id: "maratonista",  
            icone: "fa-person-running", 
            medalha: "prata",  
            tituloKey: "ach-marathon-title",   
            titulo: "Maratonista",    
            descKey: "ach-marathon-desc",   
            desc: "Dispute 100 partidas",                       
            meta: 100, 
            valor: resumoPerfil => resumoPerfil.partidas 
        },
        { 
            id: "cinquenta",    
            icone: "fa-trophy",         
            medalha: "ouro",   
            tituloKey: "ach-fifty-title",      
            titulo: "Artilheiro",     
            descKey: "ach-fifty-desc",      
            desc: "Acumule 50 vitórias",                        
            meta: 50,  
            valor: resumoPerfil => resumoPerfil.vitorias 
        },
        { 
            id: "craque",       
            icone: "fa-star",           
            medalha: "ouro",   
            tituloKey: "ach-ace-title",        
            titulo: "Craque",         
            descKey: "ach-ace-desc",        
            desc: "70% de aproveitamento em 20+ partidas",      
            meta: 70,  
            valor: resumoPerfil => {
                if (resumoPerfil.partidas >= 20) {
                    return Math.round(resumoPerfil.aproveitamento * 100);
                } else {
                    return 0;
                }
            } 
        },
        { 
            id: "enciclopedia", 
            icone: "fa-book-open",      
            medalha: "ouro",   
            tituloKey: "ach-encyclopedia-title", 
            titulo: "Enciclopédia", 
            descKey: "ach-encyclopedia-desc", 
            desc: "Jogue todos os minigames",                  
            meta: null, 
            valor: resumoPerfil => resumoPerfil.jogosDiferentes 
        },
        { 
            id: "centenario",   
            icone: "fa-crown",          
            medalha: "ouro",   
            tituloKey: "ach-hundred-title",    
            titulo: "Lenda do clube", 
            descKey: "ach-hundred-desc",    
            desc: "Acumule 100 vitórias",                       
            meta: 100, 
            valor: resumoPerfil => resumoPerfil.vitorias 
        },
        { 
            id: "rotina",       
            icone: "fa-calendar-check", 
            medalha: "bronze", 
            tituloKey: "ach-routine-title",    
            titulo: "Rotina",         
            descKey: "ach-routine-desc",    
            desc: "Jogue 3 dias seguidos",                      
            meta: 3,   
            valor: resumoPerfil => resumoPerfil.recordeSequencia 
        },
        { 
            id: "desafiante",   
            icone: "fa-calendar-day",   
            medalha: "bronze", 
            tituloKey: "ach-challenger-title", 
            titulo: "Desafiante",     
            descKey: "ach-challenger-desc", 
            desc: "Conclua um Desafio do Dia",                  
            meta: 1,   
            valor: resumoPerfil => resumoPerfil.diariosConcluidos 
        },
        { 
            id: "semana",       
            icone: "fa-fire",           
            medalha: "prata",  
            tituloKey: "ach-week-title",       
            titulo: "Semana de fogo", 
            descKey: "ach-week-desc",       
            desc: "Jogue 7 dias seguidos",                      
            meta: 7,   
            valor: resumoPerfil => resumoPerfil.recordeSequencia 
        },
        { 
            id: "diarista",     
            icone: "fa-calendar-week",  
            medalha: "prata",  
            tituloKey: "ach-daily-title",      
            titulo: "Diarista",       
            descKey: "ach-daily-desc",      
            desc: "Conclua 7 Desafios do Dia",                  
            meta: 7,   
            valor: resumoPerfil => resumoPerfil.diariosConcluidos 
        },
        { 
            id: "mes",          
            icone: "fa-fire-flame-curved", medalha: "ouro", 
            tituloKey: "ach-month-title",     
            titulo: "Mês imparável",  
            descKey: "ach-month-desc",      
            desc: "Jogue 30 dias seguidos",                     
            meta: 30,  
            valor: resumoPerfil => resumoPerfil.recordeSequencia 
        },
        { 
            id: "rei-do-dia",   
            icone: "fa-chess-king",     
            medalha: "ouro",   
            tituloKey: "ach-king-title",       
            titulo: "Rei do Dia",     
            descKey: "ach-king-desc",       
            desc: "Vença 15 Desafios do Dia",                   
            meta: 15,  
            valor: resumoPerfil => resumoPerfil.diariosVencidos 
        }
    ];

    // --- LÊ DADOS EM FORMATO JSON DO LOCALSTORAGE ---
    function lerDadosArmazenados(chave, padrao) {
        try {
            const valor = JSON.parse(localStorage.getItem(chave));
            return valor ?? padrao;
        } catch (erro) {
            return padrao;
        }
    }

    // --- LÊ UM NÚMERO DO LOCALSTORAGE ---
    function lerNumeroArmazenado(chave) {
        return parseInt(localStorage.getItem(chave) || "0", 10) || 0;
    }

    // --- OBTÉM A LISTA DE JOGOS RECENTES ---
    function obterRecentes() {
        const lista = lerDadosArmazenados(CHAVE_RECENTES, []);
        if (Array.isArray(lista)) {
            return lista;
        } else {
            return [];
        }
    }

    // --- REGISTRA O ACESSO A UM JOGO NA LISTA DE RECENTES ---
    function registrarAcesso(identificadorJogo) {
        const lista = obterRecentes().filter(item => item !== identificadorJogo);
        lista.unshift(identificadorJogo);
        try {
            localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista.slice(0, QUANTIDADE_MAXIMA_JOGOS_RECENTES)));
        } catch (erro) {
            // --- ARMAZENAMENTO INDISPONÍVEL: IGNORA ---
        }
    }

    // --- OBTÉM O APELIDO DO JOGADOR ---
    function obterApelido() {
        return (localStorage.getItem(CHAVE_APELIDO) || "").trim();
    }

    // --- SALVA O APELIDO DO JOGADOR NO LOCALSTORAGE ---
    function salvarApelido(apelido) {
        const limpo = String(apelido || "").trim().slice(0, 18);
        if (limpo) {
            localStorage.setItem(CHAVE_APELIDO, limpo);
        } else {
            localStorage.removeItem(CHAVE_APELIDO);
        }
        return limpo;
    }

    // --- LÊ AS ESTATÍSTICAS DE UM JOGO ESPECÍFICO ---
    function lerEstatisticasJogo(identificadorJogo) {
        const dados = lerDadosArmazenados(`fg11_stats_${identificadorJogo}`, null);
        const vitorias = (dados && dados.vitorias) || 0;
        const derrotas = (dados && dados.derrotas) || 0;
        const partidas = vitorias + derrotas;
        
        let aproveitamento = 0;
        if (partidas) {
            aproveitamento = vitorias / partidas;
        } else {
            aproveitamento = 0;
        }

        return {
            vitorias,
            derrotas,
            partidas,
            aproveitamento
        };
    }

    // --- GERA O RESUMO COMPLETO DO PERFIL DO JOGADOR ---
    function obterResumoPerfil() {
        let catalogo = [];
        if (window.FG11Catalogo && window.FG11Catalogo.jogos) {
            catalogo = window.FG11Catalogo.jogos;
        } else {
            catalogo = [];
        }
        const recentes = obterRecentes();

        const jogos = catalogo.map(jogo => ({ jogo, ...lerEstatisticasJogo(jogo.id) }));

        const vitorias = lerNumeroArmazenado("fg11_vitorias");
        const derrotas = lerNumeroArmazenado("fg11_derrotas");
        const partidas = vitorias + derrotas;

        let aproveitamento = 0;
        if (partidas) {
            aproveitamento = vitorias / partidas;
        } else {
            aproveitamento = 0;
        }

        const jogados = new Set(recentes);
        jogos.forEach(item => {
            if (item.partidas > 0) {
                jogados.add(item.jogo.id);
            }
        });
        const jogosDiferentes = catalogo.filter(jogo => jogados.has(jogo.id)).length;

        let indiceNivel = 0;
        NIVEIS.forEach((nivel, indiceFaixaNivel) => {
            if (vitorias >= nivel.minimo) {
            indiceNivel = indiceFaixaNivel;
            }
        });
        const nivel = NIVEIS[indiceNivel];
        const proximo = NIVEIS[indiceNivel + 1] || null;

        let progressoNivel = 1;
        if (proximo) {
            progressoNivel = (vitorias - nivel.minimo) / (proximo.minimo - nivel.minimo);
        } else {
            progressoNivel = 1;
        }

        const confianca = Math.min(1, partidas / 20);
        let variedade = 0;
        if (catalogo.length) {
            variedade = jogosDiferentes / catalogo.length;
        } else {
            variedade = 0;
        }
        const avaliacaoGeral = Math.min(99, Math.round(50 + 30 * aproveitamento * confianca + 19 * variedade));

        const classificacaoJogos = jogos
            .filter(item => item.partidas > 0)
            .sort((primeiroResultado, segundoResultado) => segundoResultado.vitorias - primeiroResultado.vitorias || segundoResultado.aproveitamento - primeiroResultado.aproveitamento || segundoResultado.partidas - primeiroResultado.partidas);

        const sequenciaDias = lerDadosArmazenados("fg11_streak", {});
        let diario;
        if (window.FG11Daily) {
            diario = window.FG11Daily.totais();
        } else {
            diario = { concluidos: 0, vencidos: 0, sequencia: 0 };
        }

        const base = {
            vitorias,
            derrotas,
            partidas,
            aproveitamento,
            jogosDiferentes,
            sequenciaAtual: (sequenciaDias && sequenciaDias.sequencia) || 0,
            recordeSequencia: (sequenciaDias && sequenciaDias.recorde) || 0,
            diariosConcluidos: diario.concluidos,
            diariosVencidos: diario.vencidos,
            sequenciaDiaria: diario.sequencia
        };

        const conquistas = CONQUISTAS.map(conquista => {
            const meta = conquista.meta ?? catalogo.length;
            const valor = conquista.valor(base);
            return { 
                ...conquista, 
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
            ovr: avaliacaoGeral,
            jogos,
            ranking: classificacaoJogos,
            conquistas,
            desbloqueadas: conquistas.filter(conquista => conquista.desbloqueada).length,
            recentes: recentes
                .map(identificadorJogo => catalogo.find(jogo => jogo.id === identificadorJogo))
                .filter(Boolean),
            apelido: obterApelido()
        };
    }

    // --- LÊ AS CONQUISTAS QUE JÁ FORAM NOTIFICADAS ---
    function lerConquistasVistas() {
        const lista = lerDadosArmazenados(CHAVE_CONQUISTAS_VISTAS, null);
        if (Array.isArray(lista)) {
            return lista;
        } else {
            return null;
        }
    }

    // --- SALVA AS CONQUISTAS NOTIFICADAS NO LOCALSTORAGE ---
    function salvarConquistasVistas(identificadoresConquistas) {
        try {
            localStorage.setItem(CHAVE_CONQUISTAS_VISTAS, JSON.stringify(identificadoresConquistas));
        } catch (erro) {
        }
    }

    // --- INICIALIZA AS CONQUISTAS JÁ DESBLOQUEADAS ---
    function iniciarConquistasVistas() {
        if (lerConquistasVistas() !== null) {
            return;
        }
        try {
            salvarConquistasVistas(obterResumoPerfil().conquistas.filter(conquista => conquista.desbloqueada).map(conquista => conquista.id));
        } catch (erro) {
        }
    }

    // --- AVISA AS CONQUISTAS DESBLOQUEADAS DESDE A ÚLTIMA VERIFICAÇÃO ---
    function avisarNovasConquistas() {
        const vistas = lerConquistasVistas();
        if (vistas === null) {
            return [];
        }

        const novas = obterResumoPerfil().conquistas.filter(conquista => conquista.desbloqueada && !vistas.includes(conquista.id));
        if (novas.length === 0) {
            return [];
        }

        salvarConquistasVistas(vistas.concat(novas.map(conquista => conquista.id)));

        novas.forEach(conquista => {
            if (!window.FG11Avisos) {
                return;
            }
            const obterTextoConquista = (chave, padrao) => {
                if (window.fg11Texto) {
                    return window.fg11Texto(chave, padrao);
                } else {
                    return padrao;
                }
            };
            window.FG11Avisos.mostrar({
                icone: conquista.icone,
                titulo: `${obterTextoConquista("ach-toast-unlocked", "Conquista desbloqueada!")} ${obterTextoConquista(conquista.tituloKey, conquista.titulo)}`,
                texto: obterTextoConquista(conquista.descKey, conquista.desc),
                duracao: 8000
            });
        });
        return novas;
    }

    iniciarConquistasVistas();

    // --- FORMATA UM VALOR NUMÉRICO EM PORCENTAGEM ---
    function formatarPorcentagem(valor) {
        return `${Math.round(valor * 100)}%`;
    }

    // --- GERA O HTML DA CARTA DO JOGADOR ---
    function gerarMarcacaoCartaJogador(resumoPerfil, opcoes = {}) {
        const nome = resumoPerfil.apelido || "Jogador";
        let edicao = "";
        if (opcoes.editavel) {
            edicao = `<button type="button" class="pcard-edit" id="btnEditarApelido" aria-label="Editar apelido" title="Editar apelido"><i class="fas fa-pen" aria-hidden="true"></i></button>`;
        } else {
            edicao = "";
        }

        let atributoTraducaoNome = "";
        if (!resumoPerfil.apelido) {
            atributoTraducaoNome = ' data-key="profile-default-name"';
        }

        return `
            <div class="pcard pcard--${resumoPerfil.nivel.id}">
                <div class="pcard-shine" aria-hidden="true"></div>
                <div class="pcard-top">
                    <div class="pcard-ovr">
                        <span class="pcard-ovr-num">${resumoPerfil.ovr}</span>
                        <span class="pcard-ovr-label">OVR</span>
                    </div>
                    <div class="pcard-tier">
                        <i class="fas fa-shield-halved" aria-hidden="true"></i>
                        <span data-key="${resumoPerfil.nivel.chave}">${resumoPerfil.nivel.nome}</span>
                    </div>
                </div>
                <div class="pcard-avatar" aria-hidden="true">
                    <i class="fas fa-user-astronaut"></i>
                </div>
                <div class="pcard-name">
                    <span class="pcard-name-text"${atributoTraducaoNome}>${escaparTextoMarcacao(nome)}</span>
                    ${edicao}
                </div>
                <dl class="pcard-attrs">
                    <div>
                        <dt data-key="attr-played">PJ</dt>
                        <dd>${resumoPerfil.partidas}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-wins">VIT</dt>
                        <dd>${resumoPerfil.vitorias}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-rate">APR</dt>
                        <dd>${formatarPorcentagem(resumoPerfil.aproveitamento)}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-losses">DER</dt>
                        <dd>${resumoPerfil.derrotas}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-games">JOG</dt>
                        <dd>${resumoPerfil.jogosDiferentes}</dd>
                    </div>
                    <div>
                        <dt data-key="attr-medals">MED</dt>
                        <dd>${resumoPerfil.desbloqueadas}</dd>
                    </div>
                </dl>
            </div>`;
    }

    // --- GERA O HTML DA BARRA DE PROGRESSO DO NÍVEL ---
    function gerarMarcacaoProgressoNivel(resumoPerfil) {
        let faltam = 0;
        let legenda = "";
        if (resumoPerfil.proximo) {
            faltam = resumoPerfil.proximo.minimo - resumoPerfil.vitorias;
            legenda = `<span class="tier-progress-hint">
                    <strong>${faltam}</strong> 
                    <span data-key="tier-wins-to">vitórias para</span> 
                    <span data-key="${resumoPerfil.proximo.chave}">${resumoPerfil.proximo.nome}</span>
                </span>`;
        } else {
            faltam = 0;
            legenda = `<span class="tier-progress-hint" data-key="tier-max">Nível máximo alcançado!</span>`;
        }

        return `
            <div class="tier-progress">
                <div class="tier-progress-head">
                    <span class="tier-chip tier-chip--${resumoPerfil.nivel.id}"><i class="fas fa-shield-halved" aria-hidden="true"></i> <span data-key="${resumoPerfil.nivel.chave}">${resumoPerfil.nivel.nome}</span></span>
                    ${legenda}
                </div>
                <div class="tier-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(resumoPerfil.progressoNivel * 100)}" aria-label="Progresso de nível">
                    <span style="width:${Math.max(4, resumoPerfil.progressoNivel * 100)}%"></span>
                </div>
            </div>`;
    }

    // --- GERA O HTML DO RANKING DE JOGOS ---
    function gerarMarcacaoClassificacaoJogos(resumoPerfil, limite, raiz) {
        if (resumoPerfil.ranking.length === 0) {
            return `
                <div class="empty-state empty-state--compact">
                    <i class="fas fa-ranking-star" aria-hidden="true"></i>
                    <p data-key="ranking-empty">Vença partidas para montar o seu ranking de jogos.</p>
                </div>`;
        }

        const medalhas = ["ouro", "prata", "bronze"];
        const itens = resumoPerfil.ranking.slice(0, limite).map((item, indiceClassificacao) => {
            let classeMedalha = "";
            if (medalhas[indiceClassificacao]) {
                classeMedalha = ` rank-pos--${medalhas[indiceClassificacao]}`;
            }

            let iconeMedalha = "";
            if (indiceClassificacao < 3) {
                iconeMedalha = '<i class="fas fa-medal" aria-hidden="true"></i>';
            }

            return `
                <li class="rank-item">
                    <span class="rank-pos${classeMedalha}">${iconeMedalha}<span>${indiceClassificacao + 1}</span></span>
                    <span class="rank-icon" data-cat="${item.jogo.categoria}" aria-hidden="true"><i class="fas ${item.jogo.icone}"></i></span>
                    <a class="rank-name" href="${raiz}${item.jogo.pagina}" data-key="${item.jogo.tituloKey}">${item.jogo.titulo}</a>
                    <span class="rank-score"><strong>${item.vitorias}</strong> <span data-key="ranking-wins-short">V</span></span>
                    <span class="rank-rate">${formatarPorcentagem(item.aproveitamento)}</span>
                </li>`;
        }).join("");

        return `<ol class="rank-list">${itens}</ol>`;
    }

    // --- ESCAPA CARACTERES ESPECIAIS DE UM TEXTO ---
    function escaparTextoMarcacao(texto) {
        return String(texto).replace(/[&<>"']/g, caractere => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caractere]));
    }

    // --- REAPLICA AS TRADUÇÕES NO DOCUMENTO ---
    function reaplicarTraducoesDocumento() {
        if (window.applyTranslation && document.readyState !== "loading") {
            window.applyTranslation(localStorage.getItem("preferredLanguage") || "traducoes");
        }
    }

    window.FG11Perfil = {
        resumo: obterResumoPerfil,
        registrarAcesso,
        obterApelido,
        salvarApelido,
        htmlCarta: gerarMarcacaoCartaJogador,
        htmlProgressoNivel: gerarMarcacaoProgressoNivel,
        htmlRanking: gerarMarcacaoClassificacaoJogos,
        porcentagem: formatarPorcentagem,
        escapar: escaparTextoMarcacao,
        retraduzir: reaplicarTraducoesDocumento,
        avisarNovasConquistas,
        NIVEIS
    };
})();
