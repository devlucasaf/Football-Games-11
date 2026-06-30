import estado from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-contexto.json");
    const dados = await resp.json();
    estado.jogadores = dados.jogadores;
}

// --- SORTEIA O JOGADOR SECRETO ---
export function sortearSecreto() {
    const idx = Math.floor(Math.random() * estado.jogadores.length);
    estado.secreto = estado.jogadores[idx];
}

// --- NORMALIZA TEXTO PARA COMPARAÇÃO ---
export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- BUSCA JOGADOR PELO NOME ---
export function buscarJogador(nome) {
    return estado.jogadores.find(j => normalizar(j.nome) === normalizar(nome));
}

// --- RETORNA A LISTA DE NOMES ---
export function obterNomes() {
    return estado.jogadores.map(j => j.nome);
}

// --- CALCULA A SIMILARIDADE COM O SECRETO ---
export function calcularSimilaridade(jogador) {
    const secreto = estado.secreto;
    if (!secreto || !jogador) {
        return 0;
    }

    if (normalizar(jogador.nome) === normalizar(secreto.nome)) {
        return 100;
    }

    let score = 0;

    if (jogador.clube === secreto.clube) {
        score += 30;
    } else if (jogador.liga === secreto.liga) {
        score += 15;
    }

    if (jogador.posicao === secreto.posicao) {
        score += 25;
    } else if (posicoesProximas(jogador.posicao, secreto.posicao)) {
        score += 10;
    }

    if (jogador.nacionalidade === secreto.nacionalidade) {
        score += 20;
    } else if (jogador.continente === secreto.continente) {
        score += 8;
    }

    const diffIdade = Math.abs(jogador.idade - secreto.idade);

    if (diffIdade === 0) {
        score += 15;
    } else if (diffIdade <= 2) {
        score += 10;
    } else if (diffIdade <= 4) {
        score += 5;
    }

    if (jogador.pe === secreto.pe) {
        score += 5;
    }

    return Math.min(score, 99);
}

// --- VERIFICA SE AS POSIÇÕES SÃO PRÓXIMAS ---
function posicoesProximas(pos1, pos2) {
    const grupos = {
        "GOL": 0,
        "ZAG": 1,
        "LAT": 1,
        "VOL": 2,
        "MEI": 2,
        "ATA": 3
    };
    return Math.abs((grupos[pos1] || 0) - (grupos[pos2] || 0)) <= 1 && pos1 !== pos2;
}
