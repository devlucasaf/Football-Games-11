// --- DEFINIÇÃO DO OBJETO DE DADOS DA ESCALAÇÃO ---
const EscalaDados = {
    dadosTimes: null,                   
    timesProcessados: [],               
    timeAtual: null,                    
    jogadoresSelecionados: new Map(),   
    formacaoAtual: "4-3-3",             

    // --- CARREGAMENTO DOS DADOS DO JSON ---
    async carregarDados() {
        const resposta = await fetch(EscalaConfiguracoes.CAMINHO_DADOS_JOGADORES);
        if (!resposta.ok) {
            throw new Error("Falha ao carregar dados dos times");
        }
        this.dadosTimes = await resposta.json();
        this.processarDados();
    },

    // --- PROCESSAMENTO DOS DADOS BRUTOS ---
    processarDados() {
        this.timesProcessados = [];

        const mapaPosicao = {
            goleiro:    "GK",
            zagueiro:   "ZAG",
            lateral:    "LAT",
            volante:    "VOL",
            meioCampo:  "MEI",
            atacante:   "ATA"
        };

        for (const [nomeTime, posicoes] of Object.entries(this.dadosTimes)) {
            const jogadores = [];

            for (const [posicaoChave, nomes] of Object.entries(posicoes)) {
                const codigoPosicao = mapaPosicao[posicaoChave] || posicaoChave;
                nomes.forEach(nome => {
                    jogadores.push({ 
                        nome,
                        posicao: codigoPosicao
                    });
                });
            }

            this.timesProcessados.push({
                chave: nomeTime.toLowerCase().replace(/\s+/g, "-").replace(/[áàã]/g, "a").replace(/[éê]/g, "e").replace(/[í]/g, "i").replace(/[óô]/g, "o").replace(/[ú]/g, "u"),
                nome: nomeTime,
                tipo: "club",
                jogadores
            });
        }
    },

    // --- CONTAGEM DE JOGADORES POR POSIÇÃO ---
    obterContagemPosicoes(jogadores) {
        const contagem = { 
            GK:  0, 
            DEF: 0, 
            MID: 0, 
            ATT: 0 
        };

        jogadores.forEach(jogador => {
            const posicao = jogador.posicao.toUpperCase();
            if (posicao.includes("GK")) {
                contagem.GK++;
            } else if (posicao.includes("ZAG") || posicao.includes("LAT") || posicao.includes("LD") || posicao.includes("LE")) {
                contagem.DEF++;
            } else if (posicao.includes("VOL") || posicao.includes("MEI") || posicao.includes("ME") || posicao.includes("MD") || posicao.includes("CAM")) {
                contagem.MID++;
            } else if (posicao.includes("ATA") || posicao.includes("CA") || posicao.includes("PD") || posicao.includes("PE") || posicao.includes("SA")) {
                contagem.ATT++;
            }
        });

        return contagem;
    },

    // --- OBTENÇÃO DO GRUPO DE UMA POSIÇÃO ---
    obterGrupoPosicao(posicao) {
        const codigoPosicao = posicao.toUpperCase();
        for (const [chave, grupo] of Object.entries(EscalaConfiguracoes.gruposPosicao)) {
            if (codigoPosicao.includes(chave)) {
                return grupo;
            }
        }
        return "Outros";
    },

    // --- VERIFICA SE UM JOGADOR JÁ ESTÁ SELECIONADO EM ALGUMA POSIÇÃO ---
    jogadorEstaSelecionado(nomeJogador) {
        return Array.from(this.jogadoresSelecionados.values()).some(jogador => jogador.nome === nomeJogador);
    },

    // --- ADICIONA UM JOGADOR EM UMA POSIÇÃO ESPECÍFICA ---
    adicionarJogadorNaPosicao(indiceJogador, posicao) {
        const jogador = this.timeAtual.jogadores[indiceJogador];
        if (!jogador) {
            return;
        }

        this.removerJogadorDeTodasPosicoes(jogador.nome);
        this.jogadoresSelecionados.set(posicao, jogador);
    },

    // --- REMOVE JOGADOR DE UMA POSIÇÃO ESPECÍFICA ---
    removerJogadorDaPosicao(posicao) {
        this.jogadoresSelecionados.delete(posicao);
    },

    // --- REMOVE JOGADOR DE TODAS AS POSIÇÕES ---
    removerJogadorDeTodasPosicoes(nomeJogador) {
        for (const [posicao, jogador] of this.jogadoresSelecionados.entries()) {
            if (jogador.nome === nomeJogador) {
                this.jogadoresSelecionados.delete(posicao);
                break;
            }
        }
    },

    // --- ENCONTRA UMA POSIÇÃO SIMILAR DISPONÍVEL ---
    encontrarPosicaoSimilar(posicaoAntiga) {
        for (const [categoria, posicoes] of Object.entries(EscalaConfiguracoes.posicoesSimilares)) {
            if (posicaoAntiga.includes(categoria)) {
                for (const posicao of posicoes) {
                    if (!this.jogadoresSelecionados.has(posicao)) {
                        return posicao;
                    }
                }
            }
        }
        return null;
    },

    // --- VERIFICA SE UMA POSIÇÃO CORRESPONDE AO FILTRO DE POSIÇÃO ---
    posicaoCorrespondeAoFiltro(posicao, filtro) {
        const codigoPosicao = posicao.toUpperCase();

        switch (filtro) {
            case "GK":
                return codigoPosicao.includes("GK");
            case "ZAG":
                return codigoPosicao.includes("ZAG");
            case "LD/LE":
                return codigoPosicao.includes("LD") || codigoPosicao.includes("LE") || codigoPosicao.includes("LAT");
            case "VOL/MEI":
                return codigoPosicao.includes("VOL") || codigoPosicao.includes("MEI") || codigoPosicao.includes("ME") || codigoPosicao.includes("MD") || codigoPosicao.includes("CAM");
            case "ATA":
                return codigoPosicao.includes("ATA") || codigoPosicao.includes("CA") || codigoPosicao.includes("PD") || codigoPosicao.includes("PE") || codigoPosicao.includes("SA");
            default:
                return true;
        }
    },

    // --- REINICIA A ESCALAÇÃO ---
    reiniciarEscalacao() {
        this.jogadoresSelecionados.clear();
    },

    // --- SALVA O TIME ESCOLHIDO NO LOCALSTORAGE ---
    salvarTime() {
        if (this.jogadoresSelecionados.size < 11) {
            return false;
        }

        const dadosTime = {
            time: this.timeAtual.nome,
            formacao: this.formacaoAtual,
            timestamp: new Date().toISOString(),
            jogadores: Array.from(this.jogadoresSelecionados.entries()).map(([posicao, jogador]) => ({
                posicao,
                nome: jogador.nome,
                posicaoOriginal: jogador.posicao
            }))
        };

        const timesSalvos = JSON.parse(localStorage.getItem("vcEscalaTeams") || "[]");
        timesSalvos.push(dadosTime);
        localStorage.setItem("vcEscalaTeams", JSON.stringify(timesSalvos));

        return true;
    },

    // --- GERA TEXTO PARA COMPARTILHAMENTO ---
    gerarTextoCompartilhamento() {
        let texto = `Minha Escalação do ${this.timeAtual.nome} - Brasileirão 2026\n`;
        texto += `Formação: ${this.formacaoAtual}\n\n`;

        this.jogadoresSelecionados.forEach((jogador, posicao) => {
            texto += `${posicao}: ${jogador.nome}\n`;
        });

        texto += `\nMontado em: Football Games 11 - Vc Escala!`;
        return texto;
    }
};