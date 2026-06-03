const EscalaConfig = {
    CAMINHO_JSON: "../data/players-brasileirao-2026.json",

    // --- ESCUDOS DOS TIMES ---
    escudos: {
        'Athletico-PR':  { sigla: 'CAP', cor: '#D50032', url: 'https://r2.thesportsdb.com/images/media/team/badge/irzu1u1554237406.png' },
        'Atletico-MG':   { sigla: 'CAM', cor: '#2d2d2d', url: 'https://r2.thesportsdb.com/images/media/team/badge/x5lixs1743742872.png' },
        'Bahia':         { sigla: 'BAH', cor: '#004A99', url: 'https://r2.thesportsdb.com/images/media/team/badge/xuvtsv1473539308.png' },
        'Botafogo':      { sigla: 'BOT', cor: '#2d2d2d', url: 'https://r2.thesportsdb.com/images/media/team/badge/bs5mbw1733004596.png' },
        'Bragantino':    { sigla: 'RBB', cor: '#B22222', url: 'https://r2.thesportsdb.com/images/media/team/badge/2p7tl41701423595.png' },
        'Chapecoense':   { sigla: 'CHA', cor: '#006400', url: 'https://r2.thesportsdb.com/images/media/team/badge/wy0e1i1765900601.png' },
        'Corinthians':   { sigla: 'COR', cor: '#2d2d2d', url: 'https://r2.thesportsdb.com/images/media/team/badge/vvuvps1473538042.png' },
        'Coritiba':      { sigla: 'CFC', cor: '#006B3F', url: 'https://r2.thesportsdb.com/images/media/team/badge/ywwsyu1473538050.png' },
        'Cruzeiro':      { sigla: 'CRU', cor: '#003399', url: 'https://r2.thesportsdb.com/images/media/team/badge/upsvvu1473538059.png' },
        'Flamengo':      { sigla: 'FLA', cor: '#D50032', url: 'https://r2.thesportsdb.com/images/media/team/badge/syptwx1473538074.png' },
        'Fluminense':    { sigla: 'FLU', cor: '#7B1B40', url: 'https://r2.thesportsdb.com/images/media/team/badge/stvvwp1473538082.png' },
        'Grêmio':        { sigla: 'GRE', cor: '#0066B3', url: 'https://r2.thesportsdb.com/images/media/team/badge/uvpwyt1473538089.png' },
        'Internacional': { sigla: 'INT', cor: '#D50032', url: 'https://r2.thesportsdb.com/images/media/team/badge/yprvxx1473538097.png' },
        'Mirassol':      { sigla: 'MIR', cor: '#DAA520', url: 'https://r2.thesportsdb.com/images/media/team/badge/pw8uo11765900737.png' },
        'Palmeiras':     { sigla: 'PAL', cor: '#006400', url: 'https://r2.thesportsdb.com/images/media/team/badge/vsqwqp1473538105.png' },
        'Remo':          { sigla: 'REM', cor: '#003399', url: 'https://r2.thesportsdb.com/images/media/team/badge/u36jfy1579341655.png' },
        'Santos':        { sigla: 'SAN', cor: '#2d2d2d', url: 'https://r2.thesportsdb.com/images/media/team/badge/j8xk9g1679447486.png' },
        'São Paulo':     { sigla: 'SAO', cor: '#FF0000', url: 'https://r2.thesportsdb.com/images/media/team/badge/sxpupx1473538135.png' },
        'Vasco':         { sigla: 'VAS', cor: '#2d2d2d', url: 'https://r2.thesportsdb.com/images/media/team/badge/ynqlxo1630521109.png' },
        'Vitória':       { sigla: 'VIT', cor: '#FF0000', url: 'https://r2.thesportsdb.com/images/media/team/badge/tysrrx1473538156.png' }
    },

    obterEscudoHTML(nomeTime, tamanho) {
        const info = this.escudos[nomeTime];
        const classe = tamanho === 'sm' ? 'badge-sm' : '';

        if (!info) {
            return `<div class="badge-initials ${classe}" style="background:#2e7d32">${nomeTime.substring(0, 3).toUpperCase()}</div>`;
        }

        if (info.url) {
            return `
                <img 
                    class="badge-img ${classe}" 
                    src="${info.url}" 
                    alt="${nomeTime}" 
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                />
                <div class="badge-initials ${classe}" style="background:${info.cor};display:none">${info.sigla}</div>
            `;
        }

        return `<div class="badge-initials ${classe}" style="background:${info.cor}">${info.sigla}</div>`;
    },

    // --- CONFIGURAÇÕES DE FORMAÇÕES ---
    formacoes: {
        '4-3-3': {
            posicoes: [
                { id: 'GK',     x: 5, y: 50  },
                { id: 'LD',     x: 20, y: 20 },
                { id: 'ZAG1',   x: 20, y: 40 },
                { id: 'ZAG2',   x: 20, y: 60 },
                { id: 'LE',     x: 20, y: 80 },
                { id: 'VOL',    x: 40, y: 50 },
                { id: 'MEI1',   x: 50, y: 30 },
                { id: 'MEI2',   x: 50, y: 70 },
                { id: 'PD',     x: 75, y: 25 },
                { id: 'CA',     x: 75, y: 50 },
                { id: 'PE',     x: 75, y: 75 }
            ]
        },
        '4-4-2': {
            posicoes: [
                { id: 'GK',     x: 5, y: 50  },
                { id: 'LD',     x: 20, y: 20 },
                { id: 'ZAG1',   x: 20, y: 40 },
                { id: 'ZAG2',   x: 20, y: 60 },
                { id: 'LE',     x: 20, y: 80 },
                { id: 'MD',     x: 45, y: 25 },
                { id: 'VOL1',   x: 45, y: 40 },
                { id: 'VOL2',   x: 45, y: 60 },
                { id: 'ME',     x: 45, y: 75 },
                { id: 'ATA1',   x: 75, y: 40 },
                { id: 'ATA2',   x: 75, y: 60 }
            ]
        },
        '3-5-2': {
            posicoes: [
                { id: 'GK',     x: 5, y: 50  },
                { id: 'ZAG1',   x: 20, y: 30 },
                { id: 'ZAG2',   x: 20, y: 50 },
                { id: 'ZAG3',   x: 20, y: 70 },
                { id: 'MD',     x: 40, y: 20 },
                { id: 'VOL1',   x: 40, y: 40 },
                { id: 'MEI',    x: 40, y: 50 },
                { id: 'VOL2',   x: 40, y: 60 },
                { id: 'ME',     x: 40, y: 80 },
                { id: 'ATA1',   x: 75, y: 40 },
                { id: 'ATA2',   x: 75, y: 60 }
            ]
        },
        '4-2-3-1': {
            posicoes: [
                { id: 'GK',     x: 5, y: 50  },
                { id: 'LD',     x: 20, y: 20 },
                { id: 'ZAG1',   x: 20, y: 40 },
                { id: 'ZAG2',   x: 20, y: 60 },
                { id: 'LE',     x: 20, y: 80 },
                { id: 'VOL1',   x: 35, y: 35 },
                { id: 'VOL2',   x: 35, y: 65 },
                { id: 'MOD',    x: 55, y: 25 },
                { id: 'CAM',    x: 55, y: 50 },
                { id: 'MOE',    x: 55, y: 75 },
                { id: 'CA',     x: 80, y: 50 }
            ]
        }
    },

    // --- GRUPOS DE POSIÇÃO PARA FILTRAGEM ---
    gruposPosicao: {
        'GK': 'Goleiros',
        'ZAG': 'Zagueiros',
        'LD': 'Laterais',
        'LE': 'Laterais',
        'VOL': 'Meio-Campo',
        'MEI': 'Meio-Campo',
        'ME': 'Meio-Campo',
        'MD': 'Meio-Campo',
        'CAM': 'Meio-Campo',
        'MOD': 'Meio-Campo',
        'MOE': 'Meio-Campo',
        'PD': 'Atacantes',
        'PE': 'Atacantes',
        'CA': 'Atacantes',
        'ATA': 'Atacantes'
    },

    // --- MAPEAMENTO DE POSIÇÕES SIMILARES ENTRE FORMAÇÕES ---
    posicoesSimilares: {
        'GK':  ['GK'],
        'LD':  ['LD', 'LAT'],
        'LE':  ['LE', 'LAT'],
        'ZAG': ['ZAG1', 'ZAG2', 'ZAG3'],
        'VOL': ['VOL', 'VOL1', 'VOL2'],
        'MEI': ['MEI', 'MEI1', 'MEI2', 'CAM'],
        'PD':  ['PD', 'MOD'],
        'PE':  ['PE', 'MOE'],
        'CA':  ['CA', 'ATA1', 'ATA2']
    }
};
