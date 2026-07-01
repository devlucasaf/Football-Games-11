const LegendsConfig = {
    CAMINHO_JSON: "data/football-legends.json",

    // --- CONFIGURAÇÕES DE FORMAÇÕES ---
    formacoes: {
        "4-3-3": {
            posicoes: [
                { id: "GK",     x: 8,  y: 50 },
                { id: "LD",     x: 24, y: 18 },
                { id: "ZAG1",   x: 22, y: 40 },
                { id: "ZAG2",   x: 22, y: 60 },
                { id: "LE",     x: 24, y: 82 },
                { id: "VOL",    x: 42, y: 50 },
                { id: "MEI1",   x: 52, y: 30 },
                { id: "MEI2",   x: 52, y: 70 },
                { id: "PD",     x: 78, y: 22 },
                { id: "CA",     x: 84, y: 50 },
                { id: "PE",     x: 78, y: 78 }
            ]
        },
        "4-4-2": {
            posicoes: [
                { id: "GK",     x: 8,  y: 50 },
                { id: "LD",     x: 24, y: 18 },
                { id: "ZAG1",   x: 22, y: 40 },
                { id: "ZAG2",   x: 22, y: 60 },
                { id: "LE",     x: 24, y: 82 },
                { id: "MD",     x: 48, y: 20 },
                { id: "VOL1",   x: 45, y: 42 },
                { id: "VOL2",   x: 45, y: 58 },
                { id: "ME",     x: 48, y: 80 },
                { id: "ATA1",   x: 80, y: 38 },
                { id: "ATA2",   x: 80, y: 62 }
            ]
        },
        "3-5-2": {
            posicoes: [
                { id: "GK",     x: 8,  y: 50 },
                { id: "ZAG1",   x: 22, y: 28 },
                { id: "ZAG2",   x: 22, y: 50 },
                { id: "ZAG3",   x: 22, y: 72 },
                { id: "MD",     x: 46, y: 18 },
                { id: "VOL1",   x: 42, y: 40 },
                { id: "MEI",    x: 52, y: 50 },
                { id: "VOL2",   x: 42, y: 60 },
                { id: "ME",     x: 46, y: 82 },
                { id: "ATA1",   x: 80, y: 38 },
                { id: "ATA2",   x: 80, y: 62 }
            ]
        },
        "4-2-3-1": {
            posicoes: [
                { id: "GK",     x: 8,  y: 50 },
                { id: "LD",     x: 24, y: 18 },
                { id: "ZAG1",   x: 22, y: 40 },
                { id: "ZAG2",   x: 22, y: 60 },
                { id: "LE",     x: 24, y: 82 },
                { id: "VOL1",   x: 40, y: 38 },
                { id: "VOL2",   x: 40, y: 62 },
                { id: "MOD",    x: 60, y: 24 },
                { id: "CAM",    x: 60, y: 50 },
                { id: "MOE",    x: 60, y: 76 },
                { id: "CA",     x: 84, y: 50 }
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
