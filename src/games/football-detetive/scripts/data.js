import { estado, NIVEIS } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-detetive.json");
    estado.dados = await resposta.json();
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

// --- GERA TODAS AS PERMUTAÇÕES DE 0..N-1 ---
const cachePermutacoes = {};
function gerarPermutacoes(tamanho) {
    if (cachePermutacoes[tamanho]) {
        return cachePermutacoes[tamanho];
    }

    const resultado = [];
    function permutar(atual, restantes) {
        if (restantes.length === 0) {
            resultado.push(atual);
            return;
        }
        restantes.forEach((valor, indice) => {
            permutar(
                [...atual, valor],
                [...restantes.slice(0, indice), ...restantes.slice(indice + 1)]
            );
        });
    }
    permutar([], Array.from({ length: tamanho }, (_, indice) => indice));

    cachePermutacoes[tamanho] = resultado;
    return resultado;
}

// --- VERIFICA SE A CONTRATAÇÃO P ATENDE AO DESCRITOR ---
function combina(descritor, jogador, hipotese) {
    switch (descritor.k) {
        case "P": 
            return jogador === descritor.v;
        case "C": 
            return hipotese.clubeDe[jogador] === descritor.v;
        case "S": 
            return hipotese.temporadaDe[jogador] === descritor.v;
        default:  
            return hipotese.clubes[hipotese.clubeDe[jogador]].pais === descritor.v;
    }
}

// --- ENCONTRA A CONTRATAÇÃO DE UM DESCRITOR ÚNICO ---
function contratacaoDe(descritor, hipotese) {
    for (let jogador = 0; jogador < hipotese.clubeDe.length; jogador++) {
        if (combina(descritor, jogador, hipotese)) {
            return jogador;
        }
    }
    return -1;
}

// --- AVALIA UMA PISTA EM UMA HIPÓTESE ---
function pistaVale(pista, hipotese) {
    const total = hipotese.clubeDe.length;

    if (pista.tipo === "antes") {
        const antes = contratacaoDe(pista.a, hipotese);
        const depois = contratacaoDe(pista.b, hipotese);
        return hipotese.temporadaDe[antes] < hipotese.temporadaDe[depois];
    }

    for (let jogador = 0; jogador < total; jogador++) {
        if (!combina(pista.a, jogador, hipotese)) {
            continue;
        }

        const bate = combina(pista.b, jogador, hipotese);
        if (pista.tipo === "e" && !bate) {
            return false;
        }

        if (pista.tipo === "nao" && bate) {
            return false;
        }
    }
    return true;
}

// --- CONTA AS SOLUÇÕES ---
function contarSolucoes(pistas, clubes, limite) {
    const permutacoes = gerarPermutacoes(clubes.length);
    let total = 0;

    for (const clubeDe of permutacoes) {
        for (const temporadaDe of permutacoes) {
            const hipotese = { clubeDe, temporadaDe, clubes };
            if (pistas.every((pista) => pistaVale(pista, hipotese))) {
                total++;
                if (total >= limite) {
                    return total;
                }
            }
        }
    }
    return total;
}

// --- VALOR VERDADEIRO DE UM DESCRITOR PARA UMA CONTRATAÇÃO ---
function valorDe(tipo, jogador, solucao) {
    switch (tipo) {
        case "P": 
            return jogador;
        case "C": 
            return solucao.clubeDe[jogador];
        case "S":   
            return solucao.temporadaDe[jogador];
        default:  
            return solucao.clubes[solucao.clubeDe[jogador]].pais;
    }
}

// --- MONTA TODAS AS PISTAS VERDADEIRAS POSSÍVEIS ---
function montarPiscinaDePistas(solucao, permitirDiretas) {
    const total = solucao.clubeDe.length;
    const paisesPresentes = [...new Set(solucao.clubes.map((clube) => clube.pais))];
    const unicos = ["P", "C", "S"];
    const todos = ["P", "C", "K", "S"];
    const piscina = [];

    const valoresDe = (tipo) => (tipo === "K" ? paisesPresentes : Array.from({ length: total }, (_, indice) => indice));

    const duplicado = (tipoA, tipoB) =>
        (tipoA === "C" && tipoB === "P") ||
        (tipoA === "S" && (tipoB === "P" || tipoB === "C"));

    const direta = (tipoA, tipoB) =>
        tipoA === "P" && (tipoB === "C" || tipoB === "S");

    for (const tipoA of unicos) {
        for (const tipoB of todos) {
            if (tipoA === tipoB || duplicado(tipoA, tipoB) || (tipoA === "C" && tipoB === "K")) {
                continue;
            }

            for (let jogador = 0; jogador < total; jogador++) {
                const a = { k: tipoA, v: valorDe(tipoA, jogador, solucao) };
                const verdadeiro = valorDe(tipoB, jogador, solucao);

                if (permitirDiretas || !direta(tipoA, tipoB)) {
                    piscina.push({ tipo: "e", a, b: { k: tipoB, v: verdadeiro } });
                }

                valoresDe(tipoB).forEach((outro) => {
                    if (outro !== verdadeiro) {
                        piscina.push({ tipo: "nao", a, b: { k: tipoB, v: outro } });
                    }
                });
            }
        }
    }

    for (const tipoA of unicos) {
        for (const tipoB of unicos) {
            if (tipoA === "S" && tipoB === "S") {
                continue;
            }

            for (let jogadorA = 0; jogadorA < total; jogadorA++) {
                for (let jogadorB = 0; jogadorB < total; jogadorB++) {
                    if (jogadorA === jogadorB || solucao.temporadaDe[jogadorA] >= solucao.temporadaDe[jogadorB]) {
                        continue;
                    }

                    piscina.push({
                        tipo: "antes",
                        a: { 
                            k: tipoA, 
                            v: valorDe(tipoA, jogadorA, solucao) 
                        },
                        b: {
                            k: tipoB, 
                            v: valorDe(tipoB, jogadorB, solucao) 
                        }
                    });
                }
            }
        }
    }

    return piscina;
}

// --- TENTA GERAR UM CASO COM SOLUÇÃO ÚNICA ---
function tentarGerarCaso(quantidade, permitirDiretas) {
    const { jogadores: todosJogadores, clubes: todosClubes } = estado.dados;

    const jogadores = [];
    const paisesUsados = new Set();
    for (const jogador of embaralhar(todosJogadores)) {
        if (jogadores.length >= quantidade) {
            break;
        }

        if (!paisesUsados.has(jogador.pais)) {
            paisesUsados.add(jogador.pais);
            jogadores.push(jogador);
        }
    }

    const clubes = embaralhar(todosClubes).slice(0, quantidade);
    const anoInicial = 2012 + Math.floor(Math.random() * 11);
    const temporadas = Array.from({ length: quantidade }, (_, indice) => {
        const ano = anoInicial + indice;
        return `${ano}/${String(ano + 1).slice(2)}`;
    });

    const permutacoes = gerarPermutacoes(quantidade);
    const solucao = {
        clubeDe: permutacoes[Math.floor(Math.random() * permutacoes.length)],
        temporadaDe: permutacoes[Math.floor(Math.random() * permutacoes.length)],
        clubes
    };

    const piscina = embaralhar(montarPiscinaDePistas(solucao, permitirDiretas));
    let pistas = [];
    let unico = false;

    for (const pista of piscina) {
        pistas.push(pista);
        if (contarSolucoes(pistas, clubes, 2) === 1) {
            unico = true;
            break;
        }
    }

    if (!unico) {
        return null;
    }

    for (const pista of embaralhar(pistas)) {
        const semEla = pistas.filter((outra) => outra !== pista);
        if (semEla.length > 0 && contarSolucoes(semEla, clubes, 2) === 1) {
            pistas = semEla;
        }
    }

    return {
        jogadores,
        clubes,
        temporadas,
        solucao: { clubeDe: solucao.clubeDe, temporadaDe: solucao.temporadaDe },
        pistas: embaralhar(pistas).map((pista) => ({
            ...pista,
            citarPorPais: Math.random() < 0.5,
            inverter: Math.random() < 0.5
        }))
    };
}

// --- GERA UM CASO NOVO ---
export function gerarCaso() {
    const quantidade = NIVEIS[estado.configuracao.nivel].contratacoes;

    for (let tentativa = 0; tentativa < 40; tentativa++) {
        const caso = tentarGerarCaso(quantidade, tentativa >= 25);
        if (caso) {
            return caso;
        }
    }
    return null;
}

// --- TEXTO DAS PISTAS ---
function adjetivo(codigoPais) {
    return estado.dados.paises[codigoPais];
}

// --- TEXTO DO CLUBE COM ARTIGO ---
function artigoClube(clube) {
    return `${clube.artigo} ${clube.nome}`;
}

// --- FRASE QUE DESIGNA A CONTRATAÇÃO ---
function sujeito(descritor, pista, caso) {
    switch (descritor.k) {
        case "P": {
            const jogador = caso.jogadores[descritor.v];
            return pista.citarPorPais ? `o ${adjetivo(jogador.pais)}` : jogador.nome;
        }
        case "C": 
            return `quem foi para ${artigoClube(caso.clubes[descritor.v])}`;
        case "S": 
            return `quem chegou em ${caso.temporadas[descritor.v]}`;
        default:  
            return `quem foi para um clube ${adjetivo(descritor.v)}`;
    }
}

// --- FRASE DEPOIS DE "ANTES DE" / "DEPOIS DE" ---
function objetoDe(descritor, pista, caso) {
    switch (descritor.k) {
        case "P": {
            const jogador = caso.jogadores[descritor.v];
            return pista.citarPorPais ? `do ${adjetivo(jogador.pais)}` : `de ${jogador.nome}`;
        }
        case "C": 
            return `de quem foi para ${artigoClube(caso.clubes[descritor.v])}`;
        default: 
            return `de ${caso.temporadas[descritor.v]}`;
    }
}

// --- PREDICADO ---
function predicado(descritor, negativo, caso) {
    const nao = negativo ? "não " : "";
    switch (descritor.k) {
        case "C": 
            return `${nao}foi para ${artigoClube(caso.clubes[descritor.v])}`;
        case "S": 
            return `${nao}chegou em ${caso.temporadas[descritor.v]}`;
        case "P": 
            return `${nao}é ${caso.jogadores[descritor.v].nome}`;
        default:  
            return `${nao}foi para um clube ${adjetivo(descritor.v)}`;
    }
}

const PRIORIDADE = { 
    P: 0, 
    C: 1, 
    S: 2, 
    K: 3 
};

// --- PRIMEIRA LETRA MAIÚSCULA ---
function maiuscula(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// --- CONVERTE UMA PISTA EM FRASE ---
export function textoDaPista(pista, caso) {
    if (pista.tipo === "antes") {
        if (pista.inverter) {
            return `${maiuscula(sujeito(pista.b, pista, caso))} chegou depois ${objetoDe(pista.a, pista, caso)}.`;
        }
        return `${maiuscula(sujeito(pista.a, pista, caso))} chegou antes ${objetoDe(pista.b, pista, caso)}.`;
    }

    let primeiro = pista.a;
    let segundo = pista.b;
    if (PRIORIDADE[primeiro.k] > PRIORIDADE[segundo.k]) {
        [primeiro, segundo] = [segundo, primeiro];
    }

    return `${maiuscula(sujeito(primeiro, pista, caso))} ${predicado(segundo, pista.tipo === "nao", caso)}.`;
}
