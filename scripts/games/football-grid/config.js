const GridConfig = {
    TAMANHO_GRID: 3,
    CAMINHO_JSON: "../data/football-grid.json",
    MIN_CELULAS_VALIDAS: 3,
    MAX_TENTATIVAS: 50,

    PESOS_MODO: {
        linhasPais_colunasClubes: 0.6,
        linhasClubes_colunasClubes: 0.4
    },

    APELIDOS: new Map([
        // --- CLUBES ---
        ["psg", "psg"],
        ["paris saint-germain", "psg"],
        ["real betis", "real betis"],
        ["real betis balompie", "real betis"],
        ["real betis balompié", "real betis"],
        ["real betis balompie s.a.d", "real betis"],
        ["real betis balompie sad", "real betis"],
        ["real betis balompié sad", "real betis"],
        ["real bétis", "real betis"],
        ["betis", "real betis"],

        ["atletico de madrid", "atletico de madrid"],
        ["atlético de madrid", "atletico de madrid"],

        ["bayern de munique", "bayern de munique"],
        ["bayern munich", "bayern de munique"],
        ["fc bayern munich", "bayern de munique"],
        ["fc bayern münchen", "bayern de munique"],

        ["manchester united", "manchester united"],
        ["man united", "manchester united"],
        ["man utd", "manchester united"],

        ["manchester city", "manchester city"],
        ["man city", "manchester city"],

        ["ac milan", "milan"],
        ["milan", "milan"],

        ["borussia dortmund", "borussia dortmund"],
        ["bvb", "borussia dortmund"],

        // --- SELEÇÕES ---
        ["brasil", "brasil"],
        ["portugal", "portugal"],
        ["alemanha", "alemanha"],
        ["argentina", "argentina"],
        ["franca", "franca"],
        ["frança", "franca"],
        ["italia", "italia"],
        ["itália", "italia"],
        ["holanda", "holanda"],
        ["paises baixos", "holanda"],
        ["países baixos", "holanda"],
        ["espanha", "espanha"],
        ["inglaterra", "inglaterra"],
        ["japao", "japao"],
        ["japão", "japao"],
        ["colombia", "colombia"],
        ["colômbia", "colombia"],
        ["polonia", "polonia"],
        ["polônia", "polonia"]
    ]),

    normalizar(s) {
        return (s ?? "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    },

    canonizar(s) {
        return this.APELIDOS.get(this.normalizar(s)) || this.normalizar(s);
    }
};
