const formacoesTaticas = {
    "4-4-2": {
        nome: "4-4-2",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            lateralDireito: [{ horizontal: 85, vertical: 75 }],
            zagueiro: [{ horizontal: 35, vertical: 80 }, { horizontal: 65, vertical: 80 }],
            lateralEsquerdo: [{ horizontal: 15, vertical: 75 }],
            volante: [{ horizontal: 40, vertical: 55 }, { horizontal: 60, vertical: 55 }],
            meioCampista: [],
            pontaEsquerda: [{ horizontal: 15, vertical: 40 }],
            pontaDireita: [{ horizontal: 85, vertical: 40 }],
            atacante: [{ horizontal: 35, vertical: 15 }, { horizontal: 65, vertical: 15 }]
        },
        estatisticas: {
            ataque: 85, 
            defesa: 75, 
            meioCampo: 70,
            descricao: "4-4-2 é um esquema tático usado no futebol que consiste no esquema de usar 4 defensores, 4 meio-campistas e 2 atacantes"
        }
    },
    "4-3-3": {
        nome: "4-3-3",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            lateralDireito: [{ horizontal: 85, vertical: 75 }],
            zagueiro: [{ horizontal: 35, vertical: 80 }, { horizontal: 65, vertical: 80 }],
            lateralEsquerdo: [{ horizontal: 15, vertical: 75 }],
            volante: [{ horizontal: 50, vertical: 60 }],
            meioCampista: [{ horizontal: 30, vertical: 45 }, { horizontal: 70, vertical: 45 }],
            pontaEsquerda: [{ horizontal: 15, vertical: 20 }],
            pontaDireita: [{ horizontal: 85, vertical: 20 }],
            atacante: [{ horizontal: 50, vertical: 15 }]
        },
        estatisticas: {
            ataque: 85, 
            defesa: 75, 
            meioCampo: 70,
            descricao: "O 4-3-3 é uma formação que utiliza uma linha de quatro defensores - composta por dois zagueiros e dois laterais - atrás de uma linha de meio-campo com três jogadores."
        }
    },
    "3-5-2": {
        nome: "3-5-2",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            zagueiro: [{ horizontal: 25, vertical: 80 }, { horizontal: 50, vertical: 80 }, { horizontal: 75, vertical: 80 }],
            lateralDireito: [{ horizontal: 90, vertical: 50 }],
            lateralEsquerdo: [{ horizontal: 10, vertical: 50 }],
            volante: [{ horizontal: 40, vertical: 60 }, { horizontal: 60, vertical: 60 }],
            meioCampista: [{ horizontal: 50, vertical: 40 }],
            atacante: [{ horizontal: 35, vertical: 15 }, { horizontal: 65, vertical: 15 }]
        },
        estatisticas: {
            ataque: 75, 
            defesa: 70, 
            meioCampo: 90,
            descricao: "Sistema com três zagueiros e alas ofensivos que apoiam o ataque, priorizando o controle e superioridade numérica no meio-campo."
        }
    },
    "4-5-1": {
        nome: "4-5-1",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            lateralDireito: [{ horizontal: 85, vertical: 75 }],
            zagueiro: [{ horizontal: 35, vertical: 80 }, { horizontal: 65, vertical: 80 }],
            lateralEsquerdo: [{ horizontal: 15, vertical: 75 }],
            volante: [{ horizontal: 40, vertical: 60 }, { horizontal: 60, vertical: 60 }],
            meioCampista: [{ horizontal: 50, vertical: 45 }],
            pontaEsquerda: [{ horizontal: 15, vertical: 35 }],
            pontaDireita: [{ horizontal: 85, vertical: 35 }],
            atacante: [{ horizontal: 50, vertical: 15 }]
        },
        estatisticas: {
            ataque: 60, 
            defesa: 80, 
            meioCampo: 90,
            descricao: "Formação compacta e defensiva que povoa o meio-campo para dificultar a criação do adversário, deixando apenas um atacante isolado."
        }
    },
    "5-4-1": {
        nome: "5-4-1",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            zagueiro: [{ horizontal: 30, vertical: 80 }, { horizontal: 50, vertical: 80 }, { horizontal: 70, vertical: 80 }],
            lateralDireito: [{ horizontal: 90, vertical: 65 }],
            lateralEsquerdo: [{ horizontal: 10, vertical: 65 }],
            volante: [{ horizontal: 40, vertical: 50 }, { horizontal: 60, vertical: 50 }],
            pontaEsquerda: [{ horizontal: 20, vertical: 35 }],
            pontaDireita: [{ horizontal: 80, vertical: 35 }],
            atacante: [{ horizontal: 50, vertical: 15 }]
        },
        estatisticas: {
            ataque: 50, 
            defesa: 95, 
            meioCampo: 70,
            descricao: "Estratégia ultra-defensiva 'retranca', com três zagueiros e dois alas recuados, focada em fechar espaços e explorar contra-ataques."
        }
    },
    "5-3-2": {
        nome: "5-3-2",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            zagueiro: [{ horizontal: 30, vertical: 80 }, { horizontal: 50, vertical: 80 }, { horizontal: 70, vertical: 80 }],
            lateralDireito: [{ horizontal: 90, vertical: 60 }],
            lateralEsquerdo: [{ horizontal: 10, vertical: 60 }],
            volante: [{ horizontal: 50, vertical: 55 }],
            meioCampista: [{ horizontal: 35, vertical: 45 }, { horizontal: 65, vertical: 45 }],
            atacante: [{ horizontal: 35, vertical: 15 }, { horizontal: 65, vertical: 15 }]
        },
        estatisticas: {
            ataque: 65, 
            defesa: 90, 
            meioCampo: 75,
            descricao: "Variação mais defensiva do 3-5-2, onde os alas têm menos liberdade para atacar e o foco é a solidez da linha de zaga."
        }
    },
    "4-2-4": {
        nome: "4-2-4",
        posicoes: {
            goleiro: [{ horizontal: 50, vertical: 90 }],
            lateralDireito: [{ horizontal: 85, vertical: 75 }],
            zagueiro: [{ horizontal: 35, vertical: 80 }, { horizontal: 65, vertical: 80 }],
            lateralEsquerdo: [{ horizontal: 15, vertical: 75 }],
            meioCampista: [{ horizontal: 40, vertical: 50 }, { horizontal: 60, vertical: 50 }],
            pontaEsquerda: [{ horizontal: 10, vertical: 25 }],
            pontaDireita: [{ horizontal: 90, vertical: 25 }],
            atacante: [{ horizontal: 35, vertical: 15 }, { horizontal: 65, vertical: 15 }]
        },
        estatisticas: {
            ataque: 95, 
            defesa: 50, 
            meioCampo: 60,
            descricao: "Esquema clássico e extremamente ofensivo (famoso no Brasil de 58/70), com quatro atacantes e apenas dois jogadores de armação."
        }
    }
};

// --- NOMES COMPLETOS DAS POSIÇÕES ---
const rotulosPosicoes = {
    goleiro: "Goleiro",
    lateralDireito: "Lateral Direito",
    zagueiro: "Zagueiro",
    lateralEsquerdo: "Lateral Esquerdo",
    volante: "Volante",
    meioCampista: "Meio-Campista",
    pontaEsquerda: "Ponta Esquerda",
    pontaDireita: "Ponta Direita",
    atacante: "Atacante"
};

// --- CÓDIGOS LEGADOS DAS POSIÇÕES ---
const codigosPosicoesLegados = {
    GK: "goleiro", 
    LD: "lateralDireito", 
    ZAG: "zagueiro", 
    LE: "lateralEsquerdo",
    VOL: "volante", 
    MC: "meioCampista", 
    PE: "pontaEsquerda", 
    PD: "pontaDireita", 
    ATA: "atacante"
};

const formations = Object.fromEntries(Object.entries(formacoesTaticas).map(([nomeFormacao, formacao]) => [nomeFormacao, {
    name: formacao.nome,
    positions: Object.fromEntries(Object.entries(formacao.posicoes).map(([nomePosicao, coordenadas]) => {
        const codigoLegado = Object.keys(codigosPosicoesLegados).find(codigo => codigosPosicoesLegados[codigo] === nomePosicao);
        return [codigoLegado, coordenadas.map(coordenada => ({ x: coordenada.horizontal, y: coordenada.vertical }))];
    })),
    stats: {
        attack: formacao.estatisticas.ataque,
        defense: formacao.estatisticas.defesa,
        midfield: formacao.estatisticas.meioCampo,
        description: formacao.estatisticas.descricao
    }
}]));
const positionLabels = Object.fromEntries(Object.entries(codigosPosicoesLegados).map(([codigoLegado, nomePosicao]) => [codigoLegado, rotulosPosicoes[nomePosicao]]));

