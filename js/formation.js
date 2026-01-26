const formations = {
    '4-4-2': {
        name: '4-4-2',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 85, y: 75}], // lateral direito
            ZAG: [{x: 35, y: 80}, {x: 65, y: 80}], // zagueiros
            LE: [{x: 15, y: 75}], // lateral esquerdo
            VOL: [{x: 40, y: 55}, {x: 60, y: 55}], // volantes
            MC: [], // meio-campistas (4-4-2 usa-se meias abertos ou volantes)
            PE: [{x: 15, y: 40}], // ponta esquerda / meia esquerda
            PD: [{x: 85, y: 40}], // ponta direita / meia direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        stats: {
            attack: 85,
            defense: 75,
            midfield: 70,
            description: '4-4-2 é um esquema tático usado no futebol que consiste no esquema de usar 4 defensores, 4 meio-campistas e 2 atacantes'
        }
    },
    '4-3-3': {
        name: '4-3-3',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 85, y: 75}], // lateral direito
            ZAG: [{x: 35, y: 80}, {x: 65, y: 80}], // zagueiros
            LE: [{x: 15, y: 75}], // lateral esquerdo
            VOL: [{x: 50, y: 60}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 15, y: 20}], // ponta esquerda
            PD: [{x: 85, y: 20}], // ponta direita
            ATA: [{x: 50, y: 15}] // centroavante
        },
        stats: {
            attack: 85,
            defense: 75,
            midfield: 70,
            description: 'O 4-3-3 é uma formação que utiliza uma linha de quatro defensores - composta por dois zagueiros e dois laterais - atrás de uma linha de meio-campo com três jogadores.'
        }
    },
    '3-5-2': {
        name: '3-5-2',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            ZAG: [{x: 25, y: 80}, {x: 50, y: 80}, {x: 75, y: 80}], // zagueiros
            LD: [{x: 90, y: 50}], // ala direito
            LE: [{x: 10, y: 50}], // ala esquerdo
            VOL: [{x: 40, y: 60}, {x: 60, y: 60}], // volantes
            MC: [{x: 50, y: 40}], // meio-campista / armador
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}] // atacantes
        },
        stats: {
            attack: 75,
            defense: 70,
            midfield: 90,
            description: 'Sistema com três zagueiros e alas ofensivos que apoiam o ataque, priorizando o controle e superioridade numérica no meio-campo.'
        }
    },
    '4-5-1': {
        name: '4-5-1',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 85, y: 75}], // lateral direito
            ZAG: [{x: 35, y: 80}, {x: 65, y: 80}], // zagueiros
            LE: [{x: 15, y: 75}], // lateral esquerdo
            VOL: [{x: 40, y: 60}, {x: 60, y: 60}], // volantes
            MC: [{x: 50, y: 45}], // meio-campista central
            PE: [{x: 15, y: 35}], // meia esquerda
            PD: [{x: 85, y: 35}], // meia direita
            ATA: [{x: 50, y: 15}] // centroavante
        },
        stats: {
            attack: 60,
            defense: 80,
            midfield: 90,
            description: 'Formação compacta e defensiva que povoa o meio-campo para dificultar a criação do adversário, deixando apenas um atacante isolado.'
        }
    },
    '5-4-1': {
        name: '5-4-1',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            ZAG: [{x: 30, y: 80}, {x: 50, y: 80}, {x: 70, y: 80}], // zagueiros
            LD: [{x: 90, y: 65}], // ala direito
            LE: [{x: 10, y: 65}], // ala esquerdo
            VOL: [{x: 40, y: 50}, {x: 60, y: 50}], // volantes
            PE: [{x: 20, y: 35}], // meia/ponta esquerda
            PD: [{x: 80, y: 35}], // meia/ponta direita
            ATA: [{x: 50, y: 15}] // centroavante
        },
        stats: {
            attack: 50,
            defense: 95,
            midfield: 70,
            description: 'Estratégia ultra-defensiva "retranca", com três zagueiros e dois alas recuados, focada em fechar espaços e explorar contra-ataques.'
        }
    },
    '5-3-2': {
        name: '5-3-2',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            ZAG: [{x: 30, y: 80}, {x: 50, y: 80}, {x: 70, y: 80}], // zagueiros
            LD: [{x: 90, y: 60}], // ala direito
            LE: [{x: 10, y: 60}], // ala esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 35, y: 45}, {x: 65, y: 45}], // meio-campistas
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}] // atacantes
        },
        stats: {
            attack: 65,
            defense: 90,
            midfield: 75,
            description: 'Variação mais defensiva do 3-5-2, onde os alas têm menos liberdade para atacar e o foco é a solidez da linha de zaga.'
        }
    },
    '4-2-4': {
        name: '4-2-4',
        positions: {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 85, y: 75}], // lateral direito
            ZAG: [{x: 35, y: 80}, {x: 65, y: 80}], // zagueiros
            LE: [{x: 15, y: 75}], // lateral esquerdo
            MC: [{x: 40, y: 50}, {x: 60, y: 50}], // meio-campistas
            PE: [{x: 10, y: 25}], // ponta esquerda
            PD: [{x: 90, y: 25}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}] // atacantes
        },
        stats: {
            attack: 95,
            defense: 50,
            midfield: 60,
            description: 'Esquema clássico e extremamente ofensivo (famoso no Brasil de 58/70), com quatro atacantes e apenas dois jogadores de armação.'
        }
    }
};

// Mapeamento de abreviações para nomes completos das posições
const positionLabels = {
    'GK': 'Goleiro',
    'LD': 'Lateral Direito',
    'ZAG': 'Zagueiro',
    'LE': 'Lateral Esquerdo',
    'VOL': 'Volante',
    'MC': 'Meio-Campista',
    'PE': 'Ponta Esquerda',
    'PD': 'Ponta Direita',
    'ATA': 'Atacante'
};

