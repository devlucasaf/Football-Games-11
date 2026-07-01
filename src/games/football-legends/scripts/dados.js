const LegendsDados = {
    dadosTimes: null,
    timesProcessados: [],
    timeAtual: null,
    jogadoresSelecionados: new Map(),
    formacaoAtual: "4-3-3",

    // --- CARREGAR DADOS DO JSON ---
    async carregarDados() {
        const resposta = await fetch(LegendsConfig.CAMINHO_JSON);
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

        const criarSlug = (texto) => texto
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
                    const posAbreviada = mapaPosicao[posicaoChave] || posicaoChave;
                    (nomes || []).forEach(nomeJogador => {
                        jogadores.push({
                            name: nomeJogador,
                            pos: posAbreviada
                        });
                    });
                }

                const tecnico = Array.isArray(dados.tecnicos)
                    ? dados.tecnicos[0] || ""
                    : (dados.tecnico || "");

                this.timesProcessados.push({
                    key: `${criarSlug(categoria)}-${criarSlug(nome)}`,
                    name: nome,
                    type: tipo,
                    escudo: dados.escudo || dados.logo || dados.bandeira || "",
                    tecnico,
                    players: jogadores
                });
            });
        }
    },

    // --- OBTER CONTAGEM DE POSIÇÕES ---
    obterContagemPosicoes(jogadores) {
        const contagem = { 
            GK:   0, 
            DEF:  0, 
            MID:  0, 
            ATT:  0 
        };

        jogadores.forEach(jogador => {
            const pos = jogador.pos.toUpperCase();
            
            if (pos.includes("GK")) {
                contagem.GK++;
            } else if (pos.includes("ZAG") || pos.includes("LAT") || pos.includes("LD") || pos.includes("LE")) {
                contagem.DEF++;
            } else if (pos.includes("VOL") || pos.includes("MEI") || pos.includes("ME") || pos.includes("MD") || pos.includes("CAM")) {
                contagem.MID++;
            } else if (pos.includes("ATA") || pos.includes("CA") || pos.includes("PD") || pos.includes("PE") || pos.includes("SA")) {
                contagem.ATT++;
            }
        });

        return contagem;
    },

    // --- OBTER GRUPO DA POSIÇÃO ---
    obterGrupoPosicao(posicao) {
        const pos = posicao.toUpperCase();
        for (const [chave, grupo] of Object.entries(LegendsConfig.gruposPosicao)) {
            if (pos.includes(chave)) {
                return grupo;
            }
        }
        return "Outros";
    },

    // --- VERIFICAR SE JOGADOR ESTÁ SELECIONADO ---
    jogadorEstaSelecionado(nomeJogador) {
        return Array.from(this.jogadoresSelecionados.values()).some(j => j.name === nomeJogador);
    },

    // --- ADICIONAR JOGADOR NA POSIÇÃO ---
    adicionarJogadorNaPosicao(indiceJogador, posicao) {
        const jogador = this.timeAtual.players[indiceJogador];
        if (!jogador) {
            return;
        }

        // --- REMOVE JOGADOR DE QUALQUER OUTRA POSIÇÃO ---
        this.removerJogadorDeTodasPosicoes(jogador.name);

        // --- ADICIONA NA POSIÇÃO ---
        this.jogadoresSelecionados.set(posicao, jogador);
    },

    // --- ADICIONAR JOGADOR AUTOMATICAMENTE ---
    adicionarJogadorAutomaticamente(indiceJogador) {
        const jogador = this.timeAtual.players[indiceJogador];
        if (!jogador) {
            return false;
        }

        // --- SE JÁ ESTÁ ESCALADO, REMOVE ---
        if (this.jogadorEstaSelecionado(jogador.name)) {
            this.removerJogadorDeTodasPosicoes(jogador.name);
            return true;
        }

        const slotLivre = this.encontrarSlotLivrePorJogador(jogador);
        if (!slotLivre) {
            return false;
        }

        this.jogadoresSelecionados.set(slotLivre, jogador);
        return true;
    },

    // --- ENCONTRAR SLOT LIVRE COMPATÍVEL COM O JOGADOR ---
    encontrarSlotLivrePorJogador(jogador) {
        const posicoesFormacao = LegendsConfig.formacoes[this.formacaoAtual].posicoes;
        const idsFormacao = posicoesFormacao.map(p => p.id);

        const compatibilidade = {
            GK:  ["GK"],
            ZAG: ["ZAG1", "ZAG2", "ZAG3"],
            LAT: ["LD", "LE", "LAT"],
            MEI: ["VOL", "VOL1", "VOL2", "MEI", "MEI1", "MEI2", "CAM", "MD", "ME", "MOD", "MOE"],
            ATA: ["CA", "ATA1", "ATA2", "PD", "PE", "MOD", "MOE"]
        };

        const pos = (jogador.pos || "").toUpperCase();
        let chave = "MEI";
        if (pos.includes("GK")) {
            chave = "GK";
        } else if (pos.includes("ZAG")) {
            chave = "ZAG";
        } else if (pos.includes("LAT") || pos.includes("LD") || pos.includes("LE")) {
            chave = "LAT";
        } else if (pos.includes("ATA") || pos.includes("CA") || pos.includes("PD") || pos.includes("PE")) {
            chave = "ATA";
        } else {
            chave = "MEI";
        }

        const preferidos = compatibilidade[chave] || [];
        for (const id of preferidos) {
            if (idsFormacao.includes(id) && !this.jogadoresSelecionados.has(id)) {
                return id;
            }
        }

        for (const id of idsFormacao) {
            if (!this.jogadoresSelecionados.has(id)) {
                return id;
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
            if (jogador.name === nomeJogador) {
                this.jogadoresSelecionados.delete(posicao);
                break;
            }
        }
    },

    // --- ENCONTRAR POSIÇÃO SIMILAR ---
    encontrarPosicaoSimilar(posicaoAntiga) {
        for (const [categoria, posicoes] of Object.entries(LegendsConfig.posicoesSimilares)) {
            if (posicaoAntiga.includes(categoria)) {
                for (const pos of posicoes) {
                    if (!this.jogadoresSelecionados.has(pos)) {
                        return pos;
                    }
                }
            }
        }
        return null;
    },

    // --- VERIFICAR SE POSIÇÃO CORRESPONDE AO FILTRO ---
    posicaoCorrespondeAoFiltro(posicao, filtro) {
        const pos = posicao.toUpperCase();

        switch (filtro) {
            case "GK":
                return pos.includes("GK");
            case "ZAG":
                return pos.includes("ZAG");
            case "LD/LE":
                return pos.includes("LD") || pos.includes("LE") || pos.includes("LAT");
            case "VOL/MEI":
                return pos.includes("VOL") || pos.includes("MEI") || pos.includes("ME") || pos.includes("MD") || pos.includes("CAM");
            case "ATA":
                return pos.includes("ATA") || pos.includes("CA") || pos.includes("PD") || pos.includes("PE") || pos.includes("SA");
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
            time: this.timeAtual.name,
            formacao: this.formacaoAtual,
            timestamp: new Date().toISOString(),
            jogadores: Array.from(this.jogadoresSelecionados.entries()).map(([posicao, jogador]) => ({
                posicao,
                nome: jogador.name,
                posicaoOriginal: jogador.pos
            }))
        };

        const timesSalvos = JSON.parse(localStorage.getItem("footballLegendsTeams") || "[]");
        timesSalvos.push(dadosTime);
        localStorage.setItem("footballLegendsTeams", JSON.stringify(timesSalvos));

        return true;
    },

    // --- GERAR TEXTO DE COMPARTILHAMENTO ---
    gerarTextoCompartilhamento() {
        let texto = `${this.timeAtual.name}\n`;
        texto += `Formação: ${this.formacaoAtual}\n\n`;

        this.jogadoresSelecionados.forEach((jogador, posicao) => {
            texto += `${posicao}: ${jogador.name}\n`;
        });

        texto += `\nMontado em: Football Games 11`;
        return texto;
    }
};
