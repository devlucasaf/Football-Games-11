const LendasDados = {
    dadosTimes: null,
    timesProcessados: [],
    timeAtual: null,
    jogadoresSelecionados: new Map(),
    formacaoAtual: "4-3-3",

    // --- CARREGAR DADOS DO JSON ---
    async carregarDados() {
        const resposta = await fetch(LendasConfiguracao.CAMINHO_JSON);
        if (!resposta.ok) {
            throw new Error("Falha ao carregar dados dos times");
        }
        this.dadosTimes = await resposta.json();
        this.processarDados();
    },

    // --- PROCESSAR DADOS DOS TIMES ---
    processarDados() {
        this.timesProcessados = [];

        const mapaPosicao = {
            goleiro:    "GK",
            zagueiro:   "ZAG",
            lateral:    "LAT",
            meioCampo:  "MEI",
            atacante:   "ATA"
        };

        const criarIdentificadorTexto = (texto) => texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        for (const [categoria, times] of Object.entries(this.dadosTimes)) {
            if (!Array.isArray(times)) {
                continue;
            }

            const tipo = /clube/i.test(categoria) ? "club" : "selecao";

            times.forEach(dados => {
                const nome = dados.nome || "Sem nome";
                const jogadores = [];

                for (const [posicaoChave, nomes] of Object.entries(dados.jogadores || {})) {
                    const codigoPosicao = mapaPosicao[posicaoChave] || posicaoChave;
                    (nomes || []).forEach(nomeJogador => {
                        jogadores.push({
                            nome: nomeJogador,
                            posicao: codigoPosicao
                        });
                    });
                }

                const tecnico = Array.isArray(dados.tecnicos)
                    ? dados.tecnicos[0] || ""
                    : (dados.tecnico || "");

                this.timesProcessados.push({
                    chave: `${criarIdentificadorTexto(categoria)}-${criarIdentificadorTexto(nome)}`,
                    nome,
                    tipo,
                    escudo: dados.escudo || dados.logo || dados.bandeira || "",
                    tecnico,
                    jogadores
                });
            });
        }
    },

    // --- OBTER CONTAGEM DE POSIÇÕES ---
    obterContagemPosicoes(jogadores) {
        const contagem = { 
            goleiros: 0,
            defensores: 0,
            meioCampistas: 0,
            atacantes: 0
        };

        jogadores.forEach(jogador => {
            const posicao = jogador.posicao.toUpperCase();
            
            if (posicao.includes("GK")) {
                contagem.goleiros++;
            } else if (posicao.includes("ZAG") || posicao.includes("LAT") || posicao.includes("LD") || posicao.includes("LE")) {
                contagem.defensores++;
            } else if (posicao.includes("VOL") || posicao.includes("MEI") || posicao.includes("ME") || posicao.includes("MD") || posicao.includes("CAM")) {
                contagem.meioCampistas++;
            } else if (posicao.includes("ATA") || posicao.includes("CA") || posicao.includes("PD") || posicao.includes("PE") || posicao.includes("SA")) {
                contagem.atacantes++;
            }
        });

        return contagem;
    },

    // --- OBTER GRUPO DA POSIÇÃO ---
    obterGrupoPosicao(posicao) {
        const posicaoNormalizada = posicao.toUpperCase();
        for (const [chave, grupo] of Object.entries(LendasConfiguracao.gruposPosicao)) {
            if (posicaoNormalizada.includes(chave)) {
                return grupo;
            }
        }
        return "Outros";
    },

    // --- VERIFICAR SE JOGADOR ESTÁ SELECIONADO ---
    jogadorEstaSelecionado(nomeJogador) {
        return Array.from(this.jogadoresSelecionados.values()).some(jogador => jogador.nome === nomeJogador);
    },

    // --- ADICIONAR JOGADOR NA POSIÇÃO ---
    adicionarJogadorNaPosicao(indiceJogador, posicao) {
        const jogador = this.timeAtual.jogadores[indiceJogador];
        if (!jogador) {
            return;
        }

        // --- REMOVE JOGADOR DE QUALQUER OUTRA POSIÇÃO ---
        this.removerJogadorDeTodasPosicoes(jogador.nome);

        // --- ADICIONA NA POSIÇÃO ---
        this.jogadoresSelecionados.set(posicao, jogador);
    },

    // --- ADICIONAR JOGADOR AUTOMATICAMENTE ---
    adicionarJogadorAutomaticamente(indiceJogador) {
        const jogador = this.timeAtual.jogadores[indiceJogador];
        if (!jogador) {
            return false;
        }

        // --- SE JÁ ESTÁ ESCALADO, REMOVE ---
        if (this.jogadorEstaSelecionado(jogador.nome)) {
            this.removerJogadorDeTodasPosicoes(jogador.nome);
            return true;
        }

        const posicaoLivre = this.encontrarPosicaoLivrePorJogador(jogador);
        if (!posicaoLivre) {
            return false;
        }

        this.jogadoresSelecionados.set(posicaoLivre, jogador);
        return true;
    },

    // --- ENCONTRAR SLOT LIVRE COMPATÍVEL COM O JOGADOR ---
    encontrarPosicaoLivrePorJogador(jogador) {
        const posicoesFormacao = LendasConfiguracao.formacoes[this.formacaoAtual].posicoes;
        const identificadoresFormacao = posicoesFormacao.map(posicao => posicao.id);

        const compatibilidade = {
            GK:  ["GK"],
            ZAG: ["ZAG1", "ZAG2", "ZAG3"],
            LAT: ["LD", "LE", "LAT"],
            MEI: ["VOL", "VOL1", "VOL2", "MEI", "MEI1", "MEI2", "CAM", "MD", "ME", "MOD", "MOE"],
            ATA: ["CA", "ATA1", "ATA2", "PD", "PE", "MOD", "MOE"]
        };

        const posicao = (jogador.posicao || "").toUpperCase();
        let chave = "MEI";
        if (posicao.includes("GK")) {
            chave = "GK";
        } else if (posicao.includes("ZAG")) {
            chave = "ZAG";
        } else if (posicao.includes("LAT") || posicao.includes("LD") || posicao.includes("LE")) {
            chave = "LAT";
        } else if (posicao.includes("ATA") || posicao.includes("CA") || posicao.includes("PD") || posicao.includes("PE")) {
            chave = "ATA";
        } else {
            chave = "MEI";
        }

        const preferidos = compatibilidade[chave] || [];
        for (const identificadorPosicao of preferidos) {
            if (identificadoresFormacao.includes(identificadorPosicao) && !this.jogadoresSelecionados.has(identificadorPosicao)) {
                return identificadorPosicao;
            }
        }

        for (const identificadorPosicao of identificadoresFormacao) {
            if (!this.jogadoresSelecionados.has(identificadorPosicao)) {
                return identificadorPosicao;
            }
        }

        return null;
    },

    // --- REMOVER JOGADOR DA POSIÇÃO ---
    removerJogadorDaPosicao(posicao) {
        this.jogadoresSelecionados.delete(posicao);
    },

    // --- REMOVER JOGADOR DE TODAS AS POSIÇÕES ---
    removerJogadorDeTodasPosicoes(nomeJogador) {
        for (const [posicao, jogador] of this.jogadoresSelecionados.entries()) {
            if (jogador.nome === nomeJogador) {
                this.jogadoresSelecionados.delete(posicao);
                break;
            }
        }
    },

    // --- ENCONTRAR POSIÇÃO SIMILAR ---
    encontrarPosicaoSimilar(posicaoAntiga) {
        for (const [categoria, posicoes] of Object.entries(LendasConfiguracao.posicoesSimilares)) {
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

    // --- VERIFICAR SE POSIÇÃO CORRESPONDE AO FILTRO ---
    posicaoCorrespondeAoFiltro(posicao, filtro) {
        const posicaoNormalizada = posicao.toUpperCase();

        switch (filtro) {
            case "GK":
                return posicaoNormalizada.includes("GK");
            case "ZAG":
                return posicaoNormalizada.includes("ZAG");
            case "LD/LE":
                return posicaoNormalizada.includes("LD") || posicaoNormalizada.includes("LE") || posicaoNormalizada.includes("LAT");
            case "VOL/MEI":
                return posicaoNormalizada.includes("VOL") || posicaoNormalizada.includes("MEI") || posicaoNormalizada.includes("ME") || posicaoNormalizada.includes("MD") || posicaoNormalizada.includes("CAM");
            case "ATA":
                return posicaoNormalizada.includes("ATA") || posicaoNormalizada.includes("CA") || posicaoNormalizada.includes("PD") || posicaoNormalizada.includes("PE") || posicaoNormalizada.includes("SA");
            default:
                return true;
        }
    },

    // --- REINICIAR ESCALAÇÃO ---
    reiniciarEscalacao() {
        this.jogadoresSelecionados.clear();
    },

    // --- SALVAR TIME ---
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

        const timesSalvos = JSON.parse(localStorage.getItem("footballLegendsTeams") || "[]");
        timesSalvos.push(dadosTime);
        localStorage.setItem("footballLegendsTeams", JSON.stringify(timesSalvos));

        return true;
    },

    // --- GERAR TEXTO DE COMPARTILHAMENTO ---
    gerarTextoCompartilhamento() {
        let texto = `${this.timeAtual.nome}\n`;
        texto += `Formação: ${this.formacaoAtual}\n\n`;

        this.jogadoresSelecionados.forEach((jogador, posicao) => {
            texto += `${posicao}: ${jogador.nome}\n`;
        });

        texto += `\nMontado em: Football Games 11`;
        return texto;
    }
};
