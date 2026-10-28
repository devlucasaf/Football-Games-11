const GradeGerador = {
    escolhaPesoPonderado(objetoPesos) {
        const entradas = Object.entries(objetoPesos);
        const total = entradas.reduce((pesoAcumulado, [, peso]) => pesoAcumulado + peso, 0);
        let pesoSorteado = Math.random() * total;

        for (const [chave, peso] of entradas) {
            pesoSorteado -= peso;
            if (pesoSorteado <= 0) {
                return chave;
            }
        }
        return entradas[entradas.length - 1][0];
    },

    // --- SORTEAR ITENS ÚNICOS ---
    sortearUnicos(lista, quantidade, excluir = new Set()) {
        const filtrados = lista.filter((item) => !excluir.has(item));
        if (filtrados.length < quantidade) {
            return null;
        }

        const itensEmbaralhados = filtrados.slice();
        for (let indiceAtual = itensEmbaralhados.length - 1; indiceAtual > 0; indiceAtual--) {
            const indiceSorteado = (Math.random() * (indiceAtual + 1)) | 0;
            [itensEmbaralhados[indiceAtual], itensEmbaralhados[indiceSorteado]] = [itensEmbaralhados[indiceSorteado], itensEmbaralhados[indiceAtual]];
        }
        return itensEmbaralhados.slice(0, quantidade);
    },

    // --- VERIFICAR INTERSECÇÃO DE JOGADORES ---
    temIntersecaoJogadores(linhaChave, linhaTipo, colunaChave, colunaTipo) {
        const { indiceClubes, indicePaises } = GradeDados;

        if (linhaTipo === "clube" && colunaTipo === "clube") {
            const jogadoresLinha = indiceClubes.get(linhaChave) || [];
            const jogadoresColuna = new Set(indiceClubes.get(colunaChave) || []);
            return jogadoresLinha.some((indiceJogador) => jogadoresColuna.has(indiceJogador));
        }

        const linhaPaisColunaClube = linhaTipo === "pais" && colunaTipo === "clube";
        const paisChave = linhaPaisColunaClube ? linhaChave : colunaChave;
        const clubeChave = linhaPaisColunaClube ? colunaChave : linhaChave;

        const porPais = indicePaises.get(paisChave) || [];
        const jogadoresClube = new Set(indiceClubes.get(clubeChave) || []);
        return porPais.some((indiceJogador) => jogadoresClube.has(indiceJogador));
    },

    // --- VALIDAR GRID GERADO ---
    validarGrade(linhas, colunas, linhasTipo, colunasTipo) {
        const { TAMANHO_GRADE } = GradeConfiguracao;
        let contagemValidos = 0;
        const matriz = Array.from({ length: TAMANHO_GRADE }, () =>
            Array.from({ length: TAMANHO_GRADE }, () => false)
        );

        for (let indiceLinha = 0; indiceLinha < TAMANHO_GRADE; indiceLinha++) {
            for (let indiceColuna = 0; indiceColuna < TAMANHO_GRADE; indiceColuna++) {
                const possuiJogadorCompativel = this.temIntersecaoJogadores(
                    linhas[indiceLinha],
                    linhasTipo, 
                    colunas[indiceColuna],
                    colunasTipo
                );
                matriz[indiceLinha][indiceColuna] = possuiJogadorCompativel;
                if (possuiJogadorCompativel) {
                    contagemValidos++;
                }
            }
        }
        return { 
            contagemValidos, 
            matriz 
        };
    },

    // --- SORTEAR LINHAS E COLUNAS ---
    sortearLinhasColunas(linhasTipo, colunasTipo) {
        const { listaClubes, listaPaises } = GradeDados;
        const { TAMANHO_GRADE } = GradeConfiguracao;

        const listaLinhas = linhasTipo  === "clube" ? listaClubes : listaPaises;
        const listaColunas = colunasTipo === "clube" ? listaClubes : listaPaises;

        const linhas = this.sortearUnicos(listaLinhas, TAMANHO_GRADE);
        if (!linhas) {
            return null;
        }

        let excluir = new Set();
        if (linhasTipo === "clube" && colunasTipo === "clube") {
            excluir = new Set(linhas);
        }

        const colunas = this.sortearUnicos(listaColunas, TAMANHO_GRADE, excluir);
        if (!colunas) {
            return null;
        }

        return { 
            linhas, 
            colunas 
        };
    },

    // --- ESCOLHER MODO DO GRID ---
    escolherModo() {
        const escolha = this.escolhaPesoPonderado(GradeConfiguracao.PESOS_MODO);
        if (escolha === "linhasPais_colunasClubes") {
            return { 
                linhasTipo: "pais", 
                colunasTipo: "clube" 
            };
        }
        return { 
            linhasTipo: "clube", 
            colunasTipo: "clube" 
        };
    },

    // --- CRIAR CONFIGURAÇÃO DO GRID ---
    criarConfiguracaoGrade() {
        const { MAXIMO_TENTATIVAS, MINIMO_CELULAS_VALIDAS } = GradeConfiguracao;

        for (let tentativa = 1; tentativa <= MAXIMO_TENTATIVAS; tentativa++) {
            const { linhasTipo, colunasTipo } = this.escolherModo();
            const sorteio = this.sortearLinhasColunas(linhasTipo, colunasTipo);

            if (!sorteio) {
                continue;
            }

            const { linhas, colunas } = sorteio;
            const { contagemValidos, matriz } = this.validarGrade(linhas, colunas, linhasTipo, colunasTipo);

            if (contagemValidos >= MINIMO_CELULAS_VALIDAS) {
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
