const GridDados = {
    dadosBrutos:    null,
    bancoJogadores: [],
    listaClubes:    [],
    listaPaises:    [],
    clubeExibicao:  new Map(),
    paisExibicao:   new Map(),
    indiceClubes:   new Map(),
    indicePaises:   new Map(),

    deduplicarPorCanon(itens, pegarNome) {
        const vistos = new Set();
        const resultado = [];

        for (const item of itens) {
            const chave = GridConfig.canonizar(pegarNome(item));

            if (vistos.has(chave)) {
                continue;
            }

            vistos.add(chave);
            resultado.push({ chave, item });
        }
        return resultado;
    },

    async carregarDados() {
        const resposta = await fetch(GridConfig.CAMINHO_JSON, {
            cache: "no-store"
        });

        if (!resposta.ok) {
            throw new Error(`Falha ao carregar JSON (${resposta.status})`);
        }
        return resposta.json();
    },

    paraArray(valor) {
        if (Array.isArray(valor)) {
            return valor;
        }

        if (typeof valor === "string" && valor.trim()) {
            return [valor];
        }
        return [];
    },

    construirDados(dados) {
        this.dadosBrutos = dados;

        // --- CLUBES ---
        const paresClubes = this.deduplicarPorCanon(dados.clubes ?? [], (c) => c.nome);
        this.listaClubes = paresClubes.map((p) => p.chave);
        this.clubeExibicao = new Map(
            paresClubes.map(({ chave, item }) => [chave, {
                nome: item.nome,
                escudo: item.escudo ?? null
            }])
        );

        // --- PAÍSES ---
        const paresPaises = this.deduplicarPorCanon(
            (dados.selecoes ?? []).map((s) => ({ nome: s.pais || s, bandeira: s.bandeira ?? null })),
            (x) => x.nome
        );
        this.listaPaises = paresPaises.map((p) => p.chave);
        this.paisExibicao = new Map(paresPaises.map(({ chave, item }) => [chave, {
            nome: item.nome,
            bandeira: item.bandeira
        }]));

        // --- JOGADORES ---
        this.bancoJogadores = (dados.jogadores ?? []).map((j) => ({
            nome: j.nome,
            nomeCanon: GridConfig.normalizar(j.nome),
            clubes: this.paraArray(j.clubes).map((c) => GridConfig.canonizar(c)),
            selecoes: this.paraArray(j.selecoes).map((s) => GridConfig.canonizar(s)),
            foto: j.foto ?? null
        }));

        // --- ÍNDICES ---
        this.indiceClubes = new Map();
        this.indicePaises = new Map();

        this.bancoJogadores.forEach((j, idx) => {
            j.clubes.forEach((cl) => {
                if (!this.indiceClubes.has(cl)) {
                    this.indiceClubes.set(cl, []);
                }
                this.indiceClubes.get(cl).push(idx);
            });

            j.selecoes.forEach((sel) => {
                if (!this.indicePaises.has(sel)) {
                    this.indicePaises.set(sel, []);
                }
                this.indicePaises.get(sel).push(idx);
            });
        });
    },

    buscarJogadorPorNome(texto) {
        const n = GridConfig.normalizar(texto);
        const exato = this.bancoJogadores.find((j) => j.nomeCanon === n);
        if (exato) {
            return exato;
        }
        return this.bancoJogadores.find((j) => j.nomeCanon.includes(n) || n.includes(j.nomeCanon)) || null;
    }
};
