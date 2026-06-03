const EscalaDados = {
    dadosTimes: null,
    timesProcessados: [],
    timeAtual: null,
    jogadoresSelecionados: new Map(),
    formacaoAtual: '4-3-3',

    async carregarDados() {
        const resposta = await fetch(EscalaConfig.CAMINHO_JSON);
        if (!resposta.ok) {
            throw new Error('Falha ao carregar dados dos times');
        }
        this.dadosTimes = await resposta.json();
        this.processarDados();
    },

    processarDados() {
        this.timesProcessados = [];

        const mapaPosicao = {
            goleiro:    'GK',
            zagueiro:   'ZAG',
            lateral:    'LAT',
            volante:    'VOL',
            meioCampo:  'MEI',
            atacante:   'ATA'
        };

        for (const [nomeTime, posicoes] of Object.entries(this.dadosTimes)) {
            const jogadores = [];

            for (const [posicaoChave, nomes] of Object.entries(posicoes)) {
                const posAbreviada = mapaPosicao[posicaoChave] || posicaoChave;
                nomes.forEach(nome => {
                    jogadores.push({ 
                        name: nome, 
                        pos: posAbreviada 
                    });
                });
            }

            this.timesProcessados.push({
                key: nomeTime.toLowerCase().replace(/\s+/g, '-').replace(/[áàã]/g, 'a').replace(/[éê]/g, 'e').replace(/[í]/g, 'i').replace(/[óô]/g, 'o').replace(/[ú]/g, 'u'),
                name: nomeTime,
                type: 'club',
                players: jogadores
            });
        }
    },

    obterContagemPosicoes(jogadores) {
        const contagem = { 
            GK:  0, 
            DEF: 0, 
            MID: 0, 
            ATT: 0 
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

    obterGrupoPosicao(posicao) {
        const pos = posicao.toUpperCase();
        for (const [chave, grupo] of Object.entries(EscalaConfig.gruposPosicao)) {
            if (pos.includes(chave)) {
                return grupo;
            }
        }
        return 'Outros';
    },

    jogadorEstaSelecionado(nomeJogador) {
        return Array.from(this.jogadoresSelecionados.values()).some(j => j.name === nomeJogador);
    },

    adicionarJogadorNaPosicao(indiceJogador, posicao) {
        const jogador = this.timeAtual.players[indiceJogador];
        if (!jogador) {
            return;
        }

        this.removerJogadorDeTodasPosicoes(jogador.name);
        this.jogadoresSelecionados.set(posicao, jogador);
    },

    removerJogadorDaPosicao(posicao) {
        this.jogadoresSelecionados.delete(posicao);
    },

    removerJogadorDeTodasPosicoes(nomeJogador) {
        for (const [posicao, jogador] of this.jogadoresSelecionados.entries()) {
            if (jogador.name === nomeJogador) {
                this.jogadoresSelecionados.delete(posicao);
                break;
            }
        }
    },

    encontrarPosicaoSimilar(posicaoAntiga) {
        for (const [categoria, posicoes] of Object.entries(EscalaConfig.posicoesSimilares)) {
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

    reiniciarEscalacao() {
        this.jogadoresSelecionados.clear();
    },

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

        const timesSalvos = JSON.parse(localStorage.getItem('vcEscalaTeams') || '[]');
        timesSalvos.push(dadosTime);
        localStorage.setItem('vcEscalaTeams', JSON.stringify(timesSalvos));

        return true;
    },

    gerarTextoCompartilhamento() {
        let texto = `Minha Escalação do ${this.timeAtual.name} - Brasileirão 2026\n`;
        texto += `Formação: ${this.formacaoAtual}\n\n`;

        this.jogadoresSelecionados.forEach((jogador, posicao) => {
            texto += `${posicao}: ${jogador.name}\n`;
        });

        texto += `\nMontado em: Football Games 11 - Vc Escala!`;
        return texto;
    }
};
