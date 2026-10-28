// --- MODO DIÁRIO ---
(function () {
    const CHAVE_LEGADO = "fg11_diario";
    const CHAVE_HISTORICO = "fg11_diario_historico";
    const QUANTIDADE_MAXIMA_DIAS_HISTORICO = 120;

    // --- OBTÉM O TEXTO TRADUZIDO COM FALLBACK ---
    function obterTextoDesafioDiario(chave, padrao) {
        return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
    }

    // --- FORMATA A DATA NO PADRÃO ANO-MÊS-DIA ---
    function formatarDia(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    // --- RETORNA A DATA ATUAL FORMATADA ---
    function diaDeHoje() {
        return formatarDia(new Date());
    }

    // --- SOMA OU SUBTRAI DIAS DE UMA DATA ---
    function somarDias(dia, quantidade) {
        const [ano, mes, diaDoMes] = dia.split("-").map(Number);
        return formatarDia(new Date(ano, mes - 1, diaDoMes + quantidade));
    }

    // --- NÚMERO ESTÁVEL A PARTIR DE UM TEXTO ---
    function semente(textoBase) {
        let valorSemente = 0;
        for (let indiceCaractere = 0; indiceCaractere < textoBase.length; indiceCaractere++) {
            valorSemente = (valorSemente * 31 + textoBase.charCodeAt(indiceCaractere)) >>> 0;
        }
        return valorSemente;
    }

    // --- GERADOR ALEATÓRIO COM SEMENTE (MULBERRY32) ---
    function criarAleatorio(sementeInicial) {
        let estado = sementeInicial >>> 0;
        return function () {
            estado = (estado + 0x6D2B79F5) >>> 0;
            let valorMisturado = estado;
            
            valorMisturado = Math.imul(valorMisturado ^ (valorMisturado >>> 15), valorMisturado | 1);
            valorMisturado ^= valorMisturado + Math.imul(valorMisturado ^ (valorMisturado >>> 7), valorMisturado | 61);
            
            return ((valorMisturado ^ (valorMisturado >>> 14)) >>> 0) / 4294967296;
        };
    }

    // --- ESCOLHE UM ITEM DE FORMA DETERMINÍSTICA PARA O DIA ---
    function escolherDoDia(lista) {
        if (!lista || lista.length === 0) {
            return null;
        }
        return lista[semente(diaDeHoje()) % lista.length];
    }

    // --- LÊ O HISTÓRICO DOS DESAFIOS CONCLUÍDOS ---
    function lerHistorico() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE_HISTORICO));
            return dados && typeof dados === "object" && !Array.isArray(dados) ? dados : {};
        } catch (erro) {
            return {};
        }
    }

    // --- SALVA O HISTÓRICO DOS DESAFIOS CONCLUÍDOS ---
    function salvarHistorico(historico) {
        const dias = Object.keys(historico).sort();
        dias.slice(0, Math.max(0, dias.length - QUANTIDADE_MAXIMA_DIAS_HISTORICO)).forEach(dia => delete historico[dia]);
        try {
            localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
        } catch (erro) {
            // --- ARMAZENAMENTO INDISPONÍVEL ---
        }
    }

    // --- RETORNA O RESULTADO DO DESAFIO DE HOJE ---
    function resultadoDeHoje() {
        return lerHistorico()[diaDeHoje()] || null;
    }

    // --- VERIFICA SE O DESAFIO DE HOJE JÁ FOI CONCLUÍDO ---
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

    // --- CALCULA OS TOTAIS DE JOGOS CONCLUÍDOS, VITÓRIAS E SEQUÊNCIA ---
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
        
        for (let diasAnteriores = quantidade - 1; diasAnteriores >= 0; diasAnteriores--) {
            const dia = somarDias(hoje, -diasAnteriores);
            dias.push({ dia, resultado: historico[dia] || null, hoje: dia === hoje });
        }
        return dias;
    }

    // --- IDENTIFICA O JOGO DA PÁGINA ATUAL ---
    function obterIdentificadorJogoAtual() {
        const correspondenciaCaminho = window.location.pathname.match(/\/games\/([^/]+)\//);
        return correspondenciaCaminho ? correspondenciaCaminho[1] : null;
    }

    // --- VERIFICA SE A PÁGINA ATUAL ESTÁ NO MODO DIÁRIO ---
    function modoDiario() {
        return new URLSearchParams(window.location.search).get("diario") === "1" && obterIdentificadorJogoAtual() !== null;
    }

    if (modoDiario()) {
        Math.random = criarAleatorio(semente(`${diaDeHoje()}|${obterIdentificadorJogoAtual()}`));
    }

    // --- TEXTO PARA COMPARTILHAR O RESULTADO ---
    function gerarTextoCompartilhamentoDiario(identificadorJogo, venceu, sequencia) {
        const jogos = window.FG11Catalogo ? window.FG11Catalogo.jogos : [];
        const jogo = jogos.find(item => item.id === identificadorJogo);
        let nome;
        
        if (jogo) {
            nome = obterTextoDesafioDiario(jogo.tituloKey, jogo.titulo);
        } else {
            nome = identificadorJogo;
        }

        let marca;
        
        if (venceu) {
            marca = obterTextoDesafioDiario("daily-done-win", "Vencido hoje");
        } else {
            marca = obterTextoDesafioDiario("daily-done-loss", "Concluído hoje");
        }

        return `Football Games 11 · ${obterTextoDesafioDiario("daily-tag", "Desafio do Dia")} ${diaDeHoje()}\n${nome} - ${marca}\n${sequencia} ${obterTextoDesafioDiario("daily-streak-text", "dias seguidos no desafio")}`;
    }

    // --- COMPARTILHA O RESULTADO OU COPIA PARA A ÁREA DE TRANSFERÊNCIA ---
    async function compartilharResultadoDiario(conteudo, btnCompartilharResultadoDiario) {
        try {
            if (navigator.share) {
                await navigator.share({ text: conteudo });
                return;
            }
            await navigator.clipboard.writeText(conteudo);
            btnCompartilharResultadoDiario.textContent = obterTextoDesafioDiario("daily-copied", "Copiado!");
        } catch (erro) {
            // --- USUÁRIO CANCELOU O COMPARTILHAMENTO ---
        }
    }

    // --- REGISTRA O RESULTADO ---
    function registrarResultado(identificadorJogo, venceu) {
        if (!modoDiario() || identificadorJogo !== obterIdentificadorJogoAtual() || feitoHoje()) {
            return null;
        }

        const historico = lerHistorico();
        historico[diaDeHoje()] = { 
            jogo: identificadorJogo, 
            venceu: Boolean(venceu) 
        };
        salvarHistorico(historico);

        try {
            localStorage.setItem(CHAVE_LEGADO, JSON.stringify({ dia: diaDeHoje(), feito: true }));
        } catch (erro) {
            // --- ARMAZENAMENTO INDISPONÍVEL ---
        }

        const sequencia = sequenciaDiaria();

        setTimeout(() => {
            if (window.FG11Avisos) {
                window.FG11Avisos.mostrar({
                    icone: "fa-calendar-check",
                    titulo: obterTextoDesafioDiario("daily-complete", "Desafio do Dia concluído!"),
                    texto: `${sequencia} ${obterTextoDesafioDiario("daily-streak-text", "dias seguidos no desafio")}`,
                    iconeTexto: "fa-fire",
                    duracao: 12000,
                    acao: {
                        rotulo: obterTextoDesafioDiario("daily-share", "Compartilhar"),
                        aoClicar: btnCompartilharResultadoDiario => compartilharResultadoDiario(gerarTextoCompartilhamentoDiario(identificadorJogo, venceu, sequencia), btnCompartilharResultadoDiario)
                    }
                });
            }
        }, 500);

        return { sequencia, venceu: Boolean(venceu) };
    }

    // --- SELO "DESAFIO DO DIA" NA PÁGINA DO JOGO ---
    function montarSeloDesafioDiario() {
        if (!modoDiario()) {
            return;
        }

        const selo = document.createElement("div");

        selo.className = "fg11-diario-selo";
        selo.innerHTML =
            `<i class="fas fa-calendar-day" aria-hidden="true"></i>` +
            `<span data-key="daily-tag">${obterTextoDesafioDiario("daily-tag", "Desafio do Dia")}</span>`;
        selo.title = obterTextoDesafioDiario("daily-banner-sub", "Mesma partida para todos hoje");
        
        document.body.appendChild(selo);
    }

    document.addEventListener("DOMContentLoaded", montarSeloDesafioDiario);

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
