const GridGerador = {

    escolhaPesoPonderado(objetoPesos) {
        const entradas = Object.entries(objetoPesos);
        const total = entradas.reduce((acc, [, peso]) => acc + peso, 0);
        let r = Math.random() * total;

        for (const [chave, peso] of entradas) {
            r -= peso;
            if (r <= 0) {
                return chave;
            }
        }
        return entradas[entradas.length - 1][0];
    },

    sortearUnicos(lista, quantidade, excluir = new Set()) {
        const filtrados = lista.filter((x) => !excluir.has(x));
        if (filtrados.length < quantidade) {
            return null;
        }

        const arr = filtrados.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, quantidade);
    },

    temIntersecaoJogadores(linhaChave, linhaTipo, colunaChave, colunaTipo) {
        const { indiceClubes, indicePaises } = GridDados;

        if (linhaTipo === "clube" && colunaTipo === "clube") {
            const a = indiceClubes.get(linhaChave) || [];
            const bSet = new Set(indiceClubes.get(colunaChave) || []);
            return a.some((idx) => bSet.has(idx));
        }

        const isLinhaPaisColClube = linhaTipo === "pais" && colunaTipo === "clube";
        const paisChave = isLinhaPaisColClube ? linhaChave : colunaChave;
        const clubeChave = isLinhaPaisColClube ? colunaChave : linhaChave;

        const porPais = indicePaises.get(paisChave) || [];
        const porClubeSet = new Set(indiceClubes.get(clubeChave) || []);
        return porPais.some((idx) => porClubeSet.has(idx));
    },

    validarGrid(linhas, colunas, linhasTipo, colunasTipo) {
        const { TAMANHO_GRID } = GridConfig;
        let contagemValidos = 0;
        const matriz = Array.from({ length: TAMANHO_GRID }, () =>
            Array.from({ length: TAMANHO_GRID }, () => false)
        );

        for (let i = 0; i < TAMANHO_GRID; i++) {
            for (let j = 0; j < TAMANHO_GRID; j++) {
                const ok = this.temIntersecaoJogadores(linhas[i], linhasTipo, colunas[j], colunasTipo);
                matriz[i][j] = ok;
                if (ok) {
                    contagemValidos++;
                }
            }
        }
        return { contagemValidos, matriz };
    },

    sortearLinhasColunas(linhasTipo, colunasTipo) {
        const { listaClubes, listaPaises } = GridDados;
        const { TAMANHO_GRID } = GridConfig;

        const listaLinhas = linhasTipo === "clube" ? listaClubes : listaPaises;
        const listaCols = colunasTipo === "clube" ? listaClubes : listaPaises;

        const linhas = this.sortearUnicos(listaLinhas, TAMANHO_GRID);
        if (!linhas) {
            return null;
        }

        let excluir = new Set();
        if (linhasTipo === "clube" && colunasTipo === "clube") {
            excluir = new Set(linhas);
        }

        const colunas = this.sortearUnicos(listaCols, TAMANHO_GRID, excluir);
        if (!colunas) {
            return null;
        }

        return { linhas, colunas };
    },

    escolherModo() {
        const escolha = this.escolhaPesoPonderado(GridConfig.PESOS_MODO);
        if (escolha === "linhasPais_colunasClubes") {
            return { linhasTipo: "pais", colunasTipo: "clube" };
        }
        return { linhasTipo: "clube", colunasTipo: "clube" };
    },

    criarConfigGrid() {
        const { MAX_TENTATIVAS, MIN_CELULAS_VALIDAS } = GridConfig;

        for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
            const { linhasTipo, colunasTipo } = this.escolherModo();
            const sorteio = this.sortearLinhasColunas(linhasTipo, colunasTipo);

            if (!sorteio) {
                continue;
            }

            const { linhas, colunas } = sorteio;
            const { contagemValidos, matriz } = this.validarGrid(linhas, colunas, linhasTipo, colunasTipo);

            if (contagemValidos >= MIN_CELULAS_VALIDAS) {
                return { 
                    linhas, 
                    colunas, 
                    linhasTipo, 
                    colunasTipo, 
                    matriz 
                };
            }
        }
        return null;
    }
};
