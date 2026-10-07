// --- MODO DIÁRIO ---
(function () {
    const CHAVE_LEGADO = "fg11_diario";
    const CHAVE_HISTORICO = "fg11_diario_historico";
    const MAX_DIAS_HISTORICO = 120;

    function texto(chave, padrao) {
        return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
    }

    // --- DATAS ---
    function formatarDia(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    function diaDeHoje() {
        return formatarDia(new Date());
    }

    function somarDias(dia, quantidade) {
        const [ano, mes, d] = dia.split("-").map(Number);
        return formatarDia(new Date(ano, mes - 1, d + quantidade));
    }

    // --- NÚMERO ESTÁVEL A PARTIR DE UM TEXTO ---
    function semente(textoBase) {
        let h = 0;
        for (let i = 0; i < textoBase.length; i++) {
            h = (h * 31 + textoBase.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    // --- GERADOR ALEATÓRIO COM SEMENTE (MULBERRY32) ---
    function criarAleatorio(sementeInicial) {
        let estado = sementeInicial >>> 0;
        return function () {
            estado = (estado + 0x6D2B79F5) >>> 0;
            let t = estado;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // --- ESCOLHE UM ITEM DE FORMA DETERMINÍSTICA PARA O DIA ---
    function escolherDoDia(lista) {
        if (!lista || lista.length === 0) {
            return null;
        }
        return lista[semente(diaDeHoje()) % lista.length];
    }

    // --- HISTÓRICO DOS DESAFIOS CONCLUÍDOS ---
    function lerHistorico() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE_HISTORICO));
            return dados && typeof dados === "object" && !Array.isArray(dados) ? dados : {};
        } catch (e) {
            return {};
        }
    }

    function salvarHistorico(historico) {
        const dias = Object.keys(historico).sort();
        dias.slice(0, Math.max(0, dias.length - MAX_DIAS_HISTORICO)).forEach(dia => delete historico[dia]);
        try {
            localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
        } catch (e) {
            // --- ARMAZENAMENTO INDISPONÍVEL ---
        }
    }

    function resultadoDeHoje() {
        return lerHistorico()[diaDeHoje()] || null;
    }

    function feitoHoje() {
        return resultadoDeHoje() !== null;
    }

    // --- SEQUÊNCIA DE DIAS SEGUIDOS COM DESAFIO CONCLUÍDO ---
    function sequenciaDiaria() {
        const historico = lerHistorico();
        let dia = diaDeHoje();
        if (!historico[dia]) {
            dia = somarDias(dia, -1);
        }
        let sequencia = 0;
        while (historico[dia]) {
            sequencia++;
            dia = somarDias(dia, -1);
        }
        return sequencia;
    }

    function totais() {
        const valores = Object.values(lerHistorico());
        return {
            concluidos: valores.length,
            vencidos: valores.filter(item => item.venceu).length,
            sequencia: sequenciaDiaria()
        };
    }

    // --- RESULTADO DOS ÚLTIMOS N DIAS ---
    function ultimosDias(quantidade) {
        const historico = lerHistorico();
        const hoje = diaDeHoje();
        const dias = [];
        for (let i = quantidade - 1; i >= 0; i--) {
            const dia = somarDias(hoje, -i);
            dias.push({ dia, resultado: historico[dia] || null, hoje: dia === hoje });
        }
        return dias;
    }

    // --- IDENTIFICA O JOGO DA PÁGINA ATUAL ---
    function idDoJogoAtual() {
        const m = window.location.pathname.match(/\/games\/([^/]+)\//);
        return m ? m[1] : null;
    }

    function modoDiario() {
        return new URLSearchParams(window.location.search).get("diario") === "1" && idDoJogoAtual() !== null;
    }

    // --- NO MODO DIÁRIO, O SORTEIO PASSA A SER IGUAL PARA TODOS OS JOGADORES ---
    if (modoDiario()) {
        Math.random = criarAleatorio(semente(`${diaDeHoje()}|${idDoJogoAtual()}`));
    }

    // --- TEXTO PARA COMPARTILHAR O RESULTADO ---
    function textoCompartilhar(jogoId, venceu, sequencia) {
        const jogos = window.FG11Catalogo ? window.FG11Catalogo.jogos : [];
        const jogo = jogos.find(item => item.id === jogoId);
        const nome = jogo ? texto(jogo.tituloKey, jogo.titulo) : jogoId;
        const marca = venceu ? "✅" : "❌";
        return `Football Games 11 · ${texto("daily-tag", "Desafio do Dia")} ${diaDeHoje()}\n${nome} ${marca}\n🔥 ${sequencia} ${texto("daily-streak-text", "dias seguidos no desafio")}`;
    }

    async function compartilhar(conteudo, botao) {
        try {
            if (navigator.share) {
                await navigator.share({ text: conteudo });
                return;
            }
            await navigator.clipboard.writeText(conteudo);
            botao.textContent = texto("daily-copied", "Copiado!");
        } catch (e) {
            // --- USUÁRIO CANCELOU O COMPARTILHAMENTO ---
        }
    }

    // --- REGISTRA O RESULTADO (SÓ A PRIMEIRA PARTIDA CONCLUÍDA DO DIA CONTA) ---
    function registrarResultado(gameId, venceu) {
        if (!modoDiario() || gameId !== idDoJogoAtual() || feitoHoje()) {
            return null;
        }

        const historico = lerHistorico();
        historico[diaDeHoje()] = { jogo: gameId, venceu: Boolean(venceu) };
        salvarHistorico(historico);

        try {
            localStorage.setItem(CHAVE_LEGADO, JSON.stringify({ dia: diaDeHoje(), feito: true }));
        } catch (e) {
            // --- ARMAZENAMENTO INDISPONÍVEL: IGNORA ---
        }

        const sequencia = sequenciaDiaria();

        setTimeout(() => {
            if (window.FG11Avisos) {
                window.FG11Avisos.mostrar({
                    icone: "fa-calendar-check",
                    titulo: texto("daily-complete", "Desafio do Dia concluído!"),
                    texto: `🔥 ${sequencia} ${texto("daily-streak-text", "dias seguidos no desafio")}`,
                    duracao: 12000,
                    acao: {
                        rotulo: texto("daily-share", "Compartilhar"),
                        aoClicar: botao => compartilhar(textoCompartilhar(gameId, venceu, sequencia), botao)
                    }
                });
            }
        }, 500);

        return { sequencia, venceu: Boolean(venceu) };
    }

    // --- SELO "DESAFIO DO DIA" NA PÁGINA DO JOGO ---
    function montarSelo() {
        if (!modoDiario()) {
            return;
        }
        const selo = document.createElement("div");
        selo.className = "fg11-diario-selo";
        selo.innerHTML =
            `<i class="fas fa-calendar-day" aria-hidden="true"></i>` +
            `<span data-key="daily-tag">${texto("daily-tag", "Desafio do Dia")}</span>`;
        selo.title = texto("daily-banner-sub", "Mesma partida para todos hoje");
        document.body.appendChild(selo);
    }

    document.addEventListener("DOMContentLoaded", montarSelo);

    window.FG11Daily = {
        diaDeHoje,
        somarDias,
        escolherDoDia,
        criarAleatorio,
        semente,
        modoDiario,
        feitoHoje,
        resultadoDeHoje,
        sequenciaDiaria,
        totais,
        ultimosDias,
        registrarResultado
    };
})();
