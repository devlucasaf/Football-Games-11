const LegendsConfig = {
    CAMINHO_JSON: "../data/football-legends.json",

    // --- CONFIGURAÇÕES DE FORMAÇÕES ---
    formacoes: {
        "4-3-3": {
            posicoes: [
                { id: "GK",     x: 5, y: 50  },
                { id: "LD",     x: 20, y: 20 },
                { id: "ZAG1",   x: 20, y: 40 },
                { id: "ZAG2",   x: 20, y: 60 },
                { id: "LE",     x: 20, y: 80 },
                { id: "VOL",    x: 40, y: 50 },
                { id: "MEI1",   x: 50, y: 30 },
                { id: "MEI2",   x: 50, y: 70 },
                { id: "PD",     x: 75, y: 25 },
                { id: "CA",     x: 75, y: 50 },
                { id: "PE",     x: 75, y: 75 }
            ]
        },
        "4-4-2": {
            posicoes: [
                { id: "GK",     x: 5, y: 50  },
                { id: "LD",     x: 20, y: 20 },
                { id: "ZAG1",   x: 20, y: 40 },
                { id: "ZAG2",   x: 20, y: 60 },
                { id: "LE",     x: 20, y: 80 },
                { id: "MD",     x: 45, y: 25 },
                { id: "VOL1",   x: 45, y: 40 },
                { id: "VOL2",   x: 45, y: 60 },
                { id: "ME",     x: 45, y: 75 },
                { id: "ATA1",   x: 75, y: 40 },
                { id: "ATA2",   x: 75, y: 60 }
            ]
        },
        "3-5-2": {
            posicoes: [
                { id: "GK",     x: 5, y: 50  },
                { id: "ZAG1",   x: 20, y: 30 },
                { id: "ZAG2",   x: 20, y: 50 },
                { id: "ZAG3",   x: 20, y: 70 },
                { id: "MD",     x: 40, y: 20 },
                { id: "VOL1",   x: 40, y: 40 },
                { id: "MEI",    x: 40, y: 50 },
                { id: "VOL2",   x: 40, y: 60 },
                { id: "ME",     x: 40, y: 80 },
                { id: "ATA1",   x: 75, y: 40 },
                { id: "ATA2",   x: 75, y: 60 }
            ]
        },
        "4-2-3-1": {
            posicoes: [
                { id: "GK",     x: 5, y: 50  },
                { id: "LD",     x: 20, y: 20 },
                { id: "ZAG1",   x: 20, y: 40 },
                { id: "ZAG2",   x: 20, y: 60 },
                { id: "LE",     x: 20, y: 80 },
                { id: "VOL1",   x: 35, y: 35 },
                { id: "VOL2",   x: 35, y: 65 },
                { id: "MOD",    x: 55, y: 25 },
                { id: "CAM",    x: 55, y: 50 },
                { id: "MOE",    x: 55, y: 75 },
                { id: "CA",     x: 80, y: 50 }
            ]
        }
    },

    // --- GRUPOS DE POSIÇÃO PARA FILTRAGEM ---
    gruposPosicao: {
        "GK": "Goleiros",
        "ZAG": "Zagueiros",
        "LD": "Laterais",
        "LE": "Laterais",
        "VOL": "Meio-Campo",
        "MEI": "Meio-Campo",
        "ME": "Meio-Campo",
        "MD": "Meio-Campo",
        "CAM": "Meio-Campo",
        "MOD": "Meio-Campo",
        "MOE": "Meio-Campo",
        "PD": "Atacantes",
        "PE": "Atacantes",
        "CA": "Atacantes",
        "ATA": "Atacantes"
    },

    // --- MAPEAMENTO DE POSIÇÕES SIMILARES ENTRE FORMAÇÕES ---
    posicoesSimilares: {
        "GK": ["GK"],
        "LD": ["LD", "LAT"],
        "LE": ["LE", "LAT"],
        "ZAG": ["ZAG1", "ZAG2", "ZAG3"],
        "VOL": ["VOL", "VOL1", "VOL2"],
        "MEI": ["MEI", "MEI1", "MEI2", "CAM"],
        "PD": ["PD", "MOD"],
        "PE": ["PE", "MOE"],
        "CA": ["CA", "ATA1", "ATA2"]
    }
};
