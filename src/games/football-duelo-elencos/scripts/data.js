import { estado } from "./core.js";

// --- CARREGAMENTO DE DADOS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-duelo-elencos.json");
    const dados = await resposta.json();
    estado.duelos = dados.duelos;
}

// --- ESCOLHER DUELO ALEATÓRIO ---
export function escolherDuelo() {
    const disponiveis = estado.duelos.filter((duelo, indiceDuelo) => !estado.duelosUsados.includes(indiceDuelo));
    if (disponiveis.length === 0) {
        return null;
    }
    const indiceSorteado = Math.floor(Math.random() * disponiveis.length);
    const indiceDuelo = estado.duelos.indexOf(disponiveis[indiceSorteado]);
    estado.duelosUsados.push(indiceDuelo);
    return disponiveis[indiceSorteado];
}

// --- OBTER POSIÇÃO ATUAL ---
export function obterPosicaoAtual() {
    if (!estado.dueloAtual) {
        return null;
    }
    return estado.dueloAtual.posicoes[estado.indicePosicao];
}

// --- COORDENADAS DA POSIÇÃO NO CAMPO ---
export function obterCoordenadasPosicao(posicao) {
    const mapa = {
        "GOL":  { top: 90, left: 50 },
        "LD":   { top: 75, left: 80 },
        "ZAG1": { top: 75, left: 60 },
        "ZAG2": { top: 75, left: 40 },
        "LE":   { top: 75, left: 20 },
        "VOL":  { top: 55, left: 50 },
        "MC1":  { top: 45, left: 30 },
        "MC2":  { top: 45, left: 70 },
        "PE":   { top: 20, left: 15 },
        "CA":   { top: 15, left: 50 },
        "PD":   { top: 20, left: 85 }
    };
    return mapa[posicao] || { 
        top: 50, 
        left: 50 
    };
}

// --- LABEL DA POSIÇÃO ---
export function obterRotuloPosicao(posicao) {
    const rotulos = {
        "GOL": "GOL", 
        "LD": "LD", 
        "ZAG1": "ZAG", "ZAG2": "ZAG",
        "LE": "LE", 
        "VOL": "VOL", 
        "MC1": "MC", "MC2": "MC",
        "PE": "PE", 
        "CA": "CA", 
        "PD": "PD"
    };
    return rotulos[posicao] || posicao;
}
