const GradeDados = {
    dadosBrutos:    null,
    bancoJogadores: [],
    listaClubes:    [],
    listaPaises:    [],
    clubeExibicao:  new Map(),
    paisExibicao:   new Map(),
    indiceClubes:   new Map(),
    indicePaises:   new Map(),

    // --- DEDUPLICAR POR CHAVE CANONIZADA ---
    deduplicarPorNomeCanonico(itens, obterNome) {
        const vistos = new Set();
        const resultado = [];

        for (const item of itens) {
            const chave = GradeConfiguracao.canonizarNome(obterNome(item));

            if (vistos.has(chave)) {
                continue;
            }

            vistos.add(chave);
            resultado.push({ 
                chave, 
                item 
            });
        }
        return resultado;
    },

    // --- CARREGAR DADOS DO JSON ---
    async carregarDados() {
        const resposta = await fetch(GradeConfiguracao.CAMINHO_JSON, {
            cache: "no-store"
        });

        if (!resposta.ok) {
            throw new Error(`Falha ao carregar JSON (${resposta.status})`);
        }
        return resposta.json();
    },

    // --- CONVERTER VALOR PARA ARRAY ---
    converterParaLista(valor) {
        if (Array.isArray(valor)) {
            return valor;
        }

        if (typeof valor === "string" && valor.trim()) {
            return [valor];
        }
        return [];
    },

    // --- CONSTRUIR ESTRUTURAS DE DADOS ---
    construirDados(dados) {
        this.dadosBrutos = dados;

        // --- CLUBES ---
        const paresClubes = this.deduplicarPorNomeCanonico(dados.clubes ?? [], (clube) => clube.nome);
        this.listaClubes = paresClubes.map((parClube) => parClube.chave);
        this.clubeExibicao = new Map(
            paresClubes.map(({ chave, item }) => [chave, {
                nome: item.nome,
                escudo: item.escudo ?? null
            }])
        );

        // --- PAÍSES ---
        const paresPaises = this.deduplicarPorNomeCanonico(
            (dados.selecoes ?? []).map((selecao) => ({
                nome: selecao.pais || selecao,
                bandeira: selecao.bandeira ?? null
            })),
            (selecao) => selecao.nome
        );
        this.listaPaises = paresPaises.map((parPais) => parPais.chave);
        this.paisExibicao = new Map(paresPaises.map(({ chave, item }) => [chave, {
            nome: item.nome,
            bandeira: item.bandeira
        }]));

        // --- JOGADORES ---
        this.bancoJogadores = (dados.jogadores ?? []).map((jogador) => ({
            nome: jogador.nome,
            nomeCanonico: GradeConfiguracao.normalizarTexto(jogador.nome),
            clubes: this.converterParaLista(jogador.clubes).map((clube) => GradeConfiguracao.canonizarNome(clube)),
            selecoes: this.converterParaLista(jogador.selecoes).map((selecao) => GradeConfiguracao.canonizarNome(selecao)),
            foto: jogador.foto ?? null
        }));

        // --- ÍNDICES ---
        this.indiceClubes = new Map();
        this.indicePaises = new Map();

        this.bancoJogadores.forEach((jogador, indiceJogador) => {
            jogador.clubes.forEach((clube) => {
                if (!this.indiceClubes.has(clube)) {
                    this.indiceClubes.set(clube, []);
                }
                this.indiceClubes.get(clube).push(indiceJogador);
            });

            jogador.selecoes.forEach((selecao) => {
                if (!this.indicePaises.has(selecao)) {
                    this.indicePaises.set(selecao, []);
                }
                this.indicePaises.get(selecao).push(indiceJogador);
            });
        });
    },

    // --- BUSCAR JOGADOR POR NOME ---
    buscarJogadorPorNome(texto) {
        const nomeNormalizado = GradeConfiguracao.normalizarTexto(texto);
        const exato = this.bancoJogadores.find((jogador) => jogador.nomeCanonico === nomeNormalizado);
        if (exato) {
            return exato;
        }
        return this.bancoJogadores.find((jogador) => jogador.nomeCanonico.includes(nomeNormalizado) || nomeNormalizado.includes(jogador.nomeCanonico)) || null;
    }
};
