import { estado, TAMANHOS } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-memoria.json");
    const dados = await resposta.json();
    estado.temas = dados.temas;
}

// --- EMBARALHA UMA LISTA ---
export function embaralhar(lista) {
    const copia = [...lista];
    for (let indiceAtual = copia.length - 1; indiceAtual > 0; indiceAtual--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceAtual + 1));
        [copia[indiceAtual], copia[indiceSorteado]] = [copia[indiceSorteado], copia[indiceAtual]];
    }
    return copia;
}

// --- SORTEIA OS PARES SEM REPETIR O MESMO PAÍS NA PARTIDA ---
function sortearPares(tema, quantidade) {
    let candidatos;
    if (tema === "misto") {
        candidatos = Object.values(estado.temas).flat();
    } else {
        candidatos = estado.temas[tema] || [];
    }

    const escolhidos = [];
    const paisesUsados = new Set();

    for (const par of embaralhar(candidatos)) {
        if (escolhidos.length >= quantidade) {
            break;
        }

        if (par.pais && paisesUsados.has(par.pais)) {
            continue;
        }

        if (par.pais) {
            paisesUsados.add(par.pais);
        }
        escolhidos.push(par);
    }
    return escolhidos;
}

// --- MONTA AS CARTAS DA PARTIDA ---
export function montarPartida() {
    const { tema, tamanho } = estado.configuracao;
    const pares = sortearPares(tema, TAMANHOS[tamanho].pares);

    const cartas = [];

    pares.forEach((par) => {
        cartas.push({ 
            parId: par.id, 
            lado: "a", 
            ...par.a 
        });
        
        cartas.push({ 
            parId: par.id, 
            lado: "b", 
            ...par.b 
        });
    });

    estado.paresPartida = pares;
    estado.cartas = embaralhar(cartas).map((carta, indice) => ({ ...carta, indice, encontrada: false }));
    estado.cartasViradas = [];
    estado.paresEncontrados = 0;
    estado.movimentos = 0;
    estado.tempoRestante = TAMANHOS[tamanho].tempo;
    estado.tempoDecorrido = 0;
    estado.tabuleiroBloqueado = true;
    estado.jogando = false;
}

// --- CALCULA AS ESTRELAS PELO NÚMERO DE ERROS ---
export function calcularEstrelas() {
    const totalPares = estado.paresPartida.length;
    const erros = estado.movimentos - totalPares;
    if (erros <= Math.ceil(totalPares / 2)) {
        return 3;
    }
    
    if (erros <= totalPares) {
        return 2;
    }
    return 1;
}
