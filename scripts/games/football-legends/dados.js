const LegendsDados = {
    dadosTimes: null,
    timesProcessados: [],
    timeAtual: null,
    jogadoresSelecionados: new Map(),
    formacaoAtual: '4-3-3',

    // --- CARREGAR DADOS DO JSON ---
    async carregarDados() {
        const resposta = await fetch(LegendsConfig.CAMINHO_JSON);
        if (!resposta.ok) {
            throw new Error('Falha ao carregar dados dos times');
        }
        this.dadosTimes = await resposta.json();
        this.processarDados();
    },

    // --- PROCESSAR DADOS DOS TIMES ---
    processarDados() {
        this.timesProcessados = [];

        const mapaPosicao = {
            goleiro:    'GK',
            zagueiro:   'ZAG',
            lateral:    'LAT',
            meioCampo:  'MEI',
            atacante:   'ATA'
        };

        for (const [pais, edicoes] of Object.entries(this.dadosTimes)) {
            for (const [ano, dados] of Object.entries(edicoes)) {
                const jogadores = [];

                for (const [posicaoChave, nomes] of Object.entries(dados.jogadores || {})) {
                    const posAbreviada = mapaPosicao[posicaoChave] || posicaoChave;
                    nomes.forEach(nome => {
                        jogadores.push({ 
                            name: nome, 
                            pos: posAbreviada 
                        });
                    });
                }

                this.timesProcessados.push({
                    key: `${pais.toLowerCase()}-${ano}`,
                    name: `${pais} ${ano}`,
                    type: 'selecao',
                    tecnico: dados.tecnico || '',
                    players: jogadores
                });
            }
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
            if (pos.includes('GK')) {
                contagem.GK++;
            } else if (pos.includes('ZAG') || pos.includes('LAT') || pos.includes('LD') || pos.includes('LE')) {
                contagem.DEF++;
            } else if (pos.includes('VOL') || pos.includes('MEI') || pos.includes('ME') || pos.includes('MD') || pos.includes('CAM')) {
                contagem.MID++;
            } else if (pos.includes('ATA') || pos.includes('CA') || pos.includes('PD') || pos.includes('PE') || pos.includes('SA')) {
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
        return 'Outros';
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
            case 'GK':
                return pos.includes('GK');
            case 'ZAG':
                return pos.includes('ZAG');
            case 'LD/LE':
                return pos.includes('LD') || pos.includes('LE') || pos.includes('LAT');
            case 'VOL/MEI':
                return pos.includes('VOL') || pos.includes('MEI') || pos.includes('ME') || pos.includes('MD') || pos.includes('CAM');
            case 'ATA':
                return pos.includes('ATA') || pos.includes('CA') || pos.includes('PD') || pos.includes('PE') || pos.includes('SA');
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

        const timesSalvos = JSON.parse(localStorage.getItem('footballLegendsTeams') || '[]');
        timesSalvos.push(dadosTime);
        localStorage.setItem('footballLegendsTeams', JSON.stringify(timesSalvos));

        return true;
    },

    // --- GERAR TEXTO DE COMPARTILHAMENTO ---
    gerarTextoCompartilhamento() {
        let texto = `Melhor XI Histórico do ${this.timeAtual.name}\n`;
        texto += `Formação: ${this.formacaoAtual}\n\n`;

        this.jogadoresSelecionados.forEach((jogador, posicao) => {
            texto += `${posicao}: ${jogador.name}\n`;
        });

        texto += `\nMontado em: Football Games 11`;
        return texto;
    }
};
