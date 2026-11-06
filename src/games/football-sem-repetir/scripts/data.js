import { estado, NIVEIS } from "./core.js";

const NOMES_POSICAO = {
    GOL: "goleiro",
    DEF: "defensor",
    MEI: "meia",
    ATA: "atacante"
};

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-sem-repetir.json");
    const dados = await resposta.json();
    estado.dados = dados;
    estado.jogadores = dados.jogadores.map(([nome, pais, pos, clubes, ucl, copa, bo], indice) => ({
        indice,
        nome,
        pais,
        pos,
        clubes,
        ucl: Boolean(ucl),
        copa: Boolean(copa),
        bo: Boolean(bo)
    }));
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

// --- REMOVE ACENTOS PARA A BUSCA ---
export function semAcento(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- UM JOGADOR ATENDE A UM CRITÉRIO? ---
function atendeCriterio(jogador, criterio) {
    switch (criterio.k) {
        case "pais":  return jogador.pais === criterio.v;
        case "clube": return jogador.clubes.includes(criterio.v);
        case "pos":   return jogador.pos === criterio.v;
        case "ucl":   return jogador.ucl;
        case "copa":  return jogador.copa;
        default:      return jogador.bo;
    }
}

// --- UM JOGADOR ATENDE AO DESAFIO? ---
export function atende(jogador, desafio) {
    return desafio.criterios.every((criterio) => atendeCriterio(jogador, criterio));
}

const cacheOpcoes = new WeakMap();

export function todasAsOpcoes(desafio) {
    if (!cacheOpcoes.has(desafio)) {
        cacheOpcoes.set(desafio, estado.jogadores.filter((jogador) => atende(jogador, desafio)));
    }
    return cacheOpcoes.get(desafio);
}

export function candidatos(desafio, usados) {
    return todasAsOpcoes(desafio).filter((jogador) => !usados.has(jogador.indice));
}

// --- EXISTE UMA FORMA DE RESPONDER TODOS OS DESAFIOS PENDENTES? ---
export function emparelhar(desafios, usados) {
    const dono = new Map();

    function tentar(indiceDesafio, visitados) {
        for (const jogador of candidatos(desafios[indiceDesafio], usados)) {
            if (visitados.has(jogador.indice)) {
                continue;
            }
            visitados.add(jogador.indice);

            if (!dono.has(jogador.indice) || tentar(dono.get(jogador.indice), visitados)) {
                dono.set(jogador.indice, indiceDesafio);
                return true;
            }
        }
        return false;
    }

    let total = 0;
    desafios.forEach((_, indice) => {
        if (tentar(indice, new Set())) {
            total++;
        }
    });

    const solucao = {};
    dono.forEach((indiceDesafio, indiceJogador) => {
        solucao[indiceDesafio] = indiceJogador;
    });
    return { completo: total === desafios.length, solucao };
}

// --- QUANTAS VEZES UMA RESPOSTA ALEATÓRIA, SEM PLANEJAMENTO, QUEBRA O JOGO ---
function taxaDeArmadilha(desafios, tentativas) {
    let falhas = 0;

    for (let tentativa = 0; tentativa < tentativas; tentativa++) {
        const usados = new Set();
        let falhou = false;

        for (const desafio of embaralhar(desafios)) {
            const opcoes = candidatos(desafio, usados);
            if (opcoes.length === 0) {
                falhou = true;
                break;
            }
            usados.add(opcoes[Math.floor(Math.random() * opcoes.length)].indice);
        }

        if (falhou) {
            falhas++;
        }
    }
    return falhas / tentativas;
}

// --- CRITÉRIOS POSSÍVEIS PARA UM JOGADOR ---
function criteriosDoJogador(jogador) {
    const criterios = [
        { 
            k: "pais", 
            v: jogador.pais 
        },
        { 
            k: "pos", 
            v: jogador.pos 
        }
    ];

    jogador.clubes.forEach((clube) => criterios.push({ k: "clube", v: clube }));
    if (jogador.ucl) {
        criterios.push({ k: "ucl" }, { k: "ucl" });
    }

    if (jogador.copa) {
        criterios.push({ k: "copa" }, { k: "copa" });
    }

    if (jogador.bo) {
        criterios.push({ k: "bo" });
    }
    return criterios;
}

function chaveDoDesafio(desafio) {
    return desafio.criterios.map((criterio) => `${criterio.k}:${criterio.v || ""}`).sort().join("|");
}

// --- MONTA UM DESAFIO A PARTIR DE UM JOGADOR-BASE ---
function montarDesafio(jogador, composto) {
    const escolhidos = [];
    const alvo = composto ? 2 : 1;

    for (const criterio of embaralhar(criteriosDoJogador(jogador))) {
        if (escolhidos.some((outro) => outro.k === criterio.k)) {
            continue;
        }
        
        if (criterio.k === "pos" && alvo === 1) {
            continue;
        }

        escolhidos.push(criterio);
        if (escolhidos.length >= alvo) {
            break;
        }
    }
    return { criterios: escolhidos };
}

// --- GERA A SEQUÊNCIA DE DESAFIOS DO NÍVEL ---
export function gerarDesafios(nivel) {
    const config = NIVEIS[nivel];
    const [minimo, maximo] = config.faixaArmadilha;
    let melhor = null;

    for (let tentativa = 0; tentativa < 300; tentativa++) {
        const bases = embaralhar(estado.jogadores).slice(0, config.desafios);
        const desafios = [];
        const chaves = new Set();
        let valido = true;

        for (const base of bases) {
            const desafio = montarDesafio(base, Math.random() < config.compostos);
            const chave = chaveDoDesafio(desafio);
            const total = todasAsOpcoes(desafio).length;
            if (chaves.has(chave) || total < config.minimoOpcoes || total > config.maximoOpcoes) {
                valido = false;
                break;
            }
            chaves.add(chave);
            desafios.push(desafio);
        }

        if (!valido || !emparelhar(desafios, new Set()).completo) {
            continue;
        }

        melhor = desafios;
        const taxa = taxaDeArmadilha(desafios, 100);
        if (taxa >= minimo && taxa <= maximo) {
            return desafios;
        }
    }
    return melhor;
}

// --- TEXTO DO DESAFIO ---
export function textoDoDesafio(desafio) {
    const { gentilicos, clubes } = estado.dados;
    const porTipo = {};
    desafio.criterios.forEach((criterio) => { porTipo[criterio.k] = criterio; });

    const titulos = [];
    if (porTipo.ucl) {
        titulos.push("campeão da Champions League");
    }

    if (porTipo.copa) {
        titulos.push("campeão do mundo");
    }

    if (porTipo.bo) {
        titulos.push("vencedor da Bola de Ouro");
    }

    let base = "";
    if (porTipo.pos && porTipo.pais) {
        base = `${NOMES_POSICAO[porTipo.pos.v]} ${gentilicos[porTipo.pais.v]}`;
    } else if (porTipo.pos) {
        base = NOMES_POSICAO[porTipo.pos.v];
    } else if (porTipo.pais) {
        base = gentilicos[porTipo.pais.v];
    } else if (titulos.length > 0) {
        base = titulos.shift();
    }

    const partes = [base, ...titulos].filter(Boolean);
    let frase = partes.length === 0 ? "" : `Um ${partes.join(" ")}`;

    if (porTipo.clube) {
        const complemento = `que jogou ${clubes[porTipo.clube.v]}`;
        frase = frase ? `${frase} ${complemento}` : `Alguém ${complemento}`;
    }
    return frase;
}

// --- BUSCA JOGADORES POR NOME ---
export function buscarJogadores(termo, limite) {
    const busca = semAcento(termo.trim());
    if (busca.length < 2) {
        return [];
    }
    return estado.jogadores
        .filter((jogador) => semAcento(jogador.nome).includes(busca))
        .sort((a, b) => {
            const aComeca = semAcento(a.nome).startsWith(busca) ? 0 : 1;
            const bComeca = semAcento(b.nome).startsWith(busca) ? 0 : 1;
            return aComeca - bComeca || a.nome.localeCompare(b.nome);
        })
        .slice(0, limite);
}
