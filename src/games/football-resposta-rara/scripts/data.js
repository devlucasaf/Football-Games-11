import { estado, NIVEIS, FAIXAS } from "./core.js";

const CHAVE_ESCOLHAS = "fg11_rara_escolhas";

const NOMES_POSICAO = {
    GOL: "goleiro",
    DEF: "defensor",
    MEI: "meia",
    ATA: "atacante"
};

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-resposta-rara.json");
    const dados = await resposta.json();
    estado.dados = dados;
    estado.jogadores = dados.jogadores.map(([nome, pais, pos, clubes, ucl, copa, bo, fama], indice) => ({
        indice,
        nome,
        pais,
        pos,
        clubes,
        ucl: Boolean(ucl),
        copa: Boolean(copa),
        bo: Boolean(bo),
        fama
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

// --- ESCOLHAS FEITAS NESTE NAVEGADOR ---
function lerEscolhas() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_ESCOLHAS)) || {};
    } catch (erro) {
        return {};
    }
}

export function registrarEscolha(jogador) {
    const escolhas = lerEscolhas();
    escolhas[jogador.nome] = (escolhas[jogador.nome] || 0) + 1;
    try {
        localStorage.setItem(CHAVE_ESCOLHAS, JSON.stringify(escolhas));
    } catch (erro) {
        // Sem armazenamento
    }
}

// --- FAMA EFETIVA: TABELA INICIAL + AJUSTE PELAS ESCOLHAS LOCAIS ---
export function famaEfetiva(jogador, escolhas) {
    const feitas = (escolhas || lerEscolhas())[jogador.nome] || 0;
    return Math.min(10, jogador.fama + Math.min(2, Math.floor(feitas / 2)));
}

// --- FAIXA DE PONTOS DE UM JOGADOR ---
export function faixaDoJogador(jogador, escolhas) {
    const fama = famaEfetiva(jogador, escolhas);
    return FAIXAS.find((faixa) => fama <= faixa.ate);
}

// --- UM JOGADOR ATENDE A UM CRITÉRIO? ---
function atendeCriterio(jogador, criterio) {
    switch (criterio.k) {
        case "pais":  
            return jogador.pais === criterio.v;
        case "clube": 
            return jogador.clubes.includes(criterio.v);
        case "pos":  
            return jogador.pos === criterio.v;
        case "ucl":  
            return jogador.ucl;
        case "copa":  
            return jogador.copa;
        default:      
            return jogador.bo;
    }
}

// --- UM JOGADOR ATENDE A UMA CATEGORIA? ---
export function atende(jogador, categoria) {
    return categoria.criterios.every((criterio) => atendeCriterio(jogador, criterio));
}

const cacheOpcoes = new WeakMap();

// --- TODOS OS JOGADORES VÁLIDOS DA CATEGORIA ---
export function respostasValidas(categoria) {
    if (!cacheOpcoes.has(categoria)) {
        cacheOpcoes.set(categoria, estado.jogadores.filter((jogador) => atende(jogador, categoria)));
    }
    return cacheOpcoes.get(categoria);
}

// --- CRITÉRIOS POSSÍVEIS A PARTIR DE UM JOGADOR ---
function criteriosDoJogador(jogador) {
    const criterios = [{ k: "pais", v: jogador.pais }];

    jogador.clubes.forEach((clube) => criterios.push({ k: "clube", v: clube }, { k: "clube", v: clube }));
    criterios.push({ k: "pos", v: jogador.pos });
    if (jogador.ucl) {
        criterios.push({ k: "ucl" });
    }
    if (jogador.copa) {
        criterios.push({ k: "copa" });
    }
    if (jogador.bo) {
        criterios.push({ k: "bo" });
    }
    return criterios;
}

// --- CHAVE ÚNICA PARA UMA CATEGORIA ---
function chaveDaCategoria(categoria) {
    return categoria.criterios.map((criterio) => `${criterio.k}:${criterio.v || ""}`).sort().join("|");
}

// --- MONTA UMA CATEGORIA A PARTIR DE UM JOGADOR-BASE ---
function montarCategoria(jogador, composta) {
    const escolhidos = [];
    const alvo = composta ? 2 : 1;

    for (const criterio of embaralhar(criteriosDoJogador(jogador))) {
        if (escolhidos.some((outro) => outro.k === criterio.k)) {
            continue;
        }
        // Posição sozinha ou país sozinho são amplos demais para uma categoria simples
        if (alvo === 1 && (criterio.k === "pos" || criterio.k === "pais")) {
            continue;
        }
        escolhidos.push(criterio);
        if (escolhidos.length >= alvo) {
            break;
        }
    }
    return { criterios: escolhidos };
}

// --- PONTOS MÁXIMOS POSSÍVEIS NA CATEGORIA ---
export function pontosMaximos(categoria, escolhas) {
    return Math.max(...respostasValidas(categoria).map((jogador) => faixaDoJogador(jogador, escolhas).pontos));
}

// --- GERA AS CATEGORIAS DO NÍVEL ---
export function gerarCategorias(nivel) {
    const config = NIVEIS[nivel];
    const categorias = [];
    const chaves = new Set();
    const escolhas = lerEscolhas();

    for (let tentativa = 0; tentativa < 2000 && categorias.length < config.rodadas; tentativa++) {
        const base = estado.jogadores[Math.floor(Math.random() * estado.jogadores.length)];
        const categoria = montarCategoria(base, Math.random() < config.compostos);
        if (categoria.criterios.length === 0) {
            continue;
        }

        const chave = chaveDaCategoria(categoria);
        const validas = respostasValidas(categoria);

        const temRara = validas.some((jogador) => faixaDoJogador(jogador, escolhas).pontos >= 60);
        if (chaves.has(chave) || validas.length < config.minimoOpcoes || !temRara) {
            continue;
        }

        chaves.add(chave);
        categorias.push(categoria);
    }
    return categorias;
}

// --- TEXTO DA CATEGORIA ---
export function textoDaCategoria(categoria) {
    const { gentilicos, clubes } = estado.dados;
    const porTipo = {};
    categoria.criterios.forEach((criterio) => { porTipo[criterio.k] = criterio; });

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
        base = `jogador ${gentilicos[porTipo.pais.v]}`;
    } else if (titulos.length > 0) {
        base = titulos.shift();
    } else {
        base = "jogador";
    }

    let frase = `Um ${[base, ...titulos].join(" ")}`;

    if (porTipo.clube) {
        const preposicao = clubes[porTipo.clube.v].replace(/^no /, "pelo ").replace(/^na /, "pela ");
        frase += ` que passou ${preposicao}`;
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

// --- INICIAIS DE UM NOME PARA A DICA ---
export function iniciais(nome) {
    return nome.split(" ").map((parte) => `${parte.charAt(0)}.`).join(" ");
}
