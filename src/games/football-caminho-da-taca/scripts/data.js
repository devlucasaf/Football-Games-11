import { estado, PONTOS_POR_JOGO, PONTOS_MINIMOS_POR_JOGO, CUSTO_DICAS, PENALIDADE_ERRO } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-caminho-da-taca.json");
    estado.dados = await resposta.json();
}

// --- REMOVE ACENTOS PARA A BUSCA ---
export function semAcento(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// --- SORTEIA UMA EDIÇÃO DA COMPETIÇÃO ESCOLHIDA, EVITANDO REPETIR A ÚLTIMA ---
export function sortearEdicao(competicao) {
    let candidatas = estado.dados.edicoes.filter((edicao) => competicao === "todas" || edicao.competicao === competicao);
    if (candidatas.length > 1) {
        candidatas = candidatas.filter((edicao) => edicao.id !== estado.ultimaEdicao);
    }
    return candidatas[Math.floor(Math.random() * candidatas.length)];
}

// --- MONTA OS JOGOS DA CAMPANHA PARA A PARTIDA ---
export function montarJogos(edicao) {
    return edicao.jogos.map(([fase, adversario, golsCampeao, golsAdversario, penCampeao, penAdversario, prorrogacao], indice) => ({
        indice,
        fase,
        adversario,
        golsCampeao,
        golsAdversario,
        penCampeao,
        penAdversario,
        prorrogacao,
        status: "aberto",
        dicas: { pais: false, bandeira: false, placar: false },
        pontos: 0
    }));
}

// --- DADOS DE UMA SELEÇÃO ---
export function dadosDaSelecao(nome) {
    return estado.dados.selecoes[nome] || { bandeira: null, confed: "" };
}

// --- LISTA DE SELEÇÕES PARA A BUSCA ---
export function buscarSelecoes(termo, limite) {
    const busca = semAcento(termo.trim());
    if (busca.length < 1) {
        return [];
    }

    return Object.keys(estado.dados.selecoes)
        .filter((nome) => semAcento(nome).includes(busca))
        .sort((a, b) => {
            const aComeca = semAcento(a).startsWith(busca) ? 0 : 1;
            const bComeca = semAcento(b).startsWith(busca) ? 0 : 1;
            return aComeca - bComeca || a.localeCompare(b);
        })
        .slice(0, limite);
}

// --- TEXTO DO PLACAR ---
export function textoDoPlacar(jogo) {
    let placar = `${jogo.golsCampeao} x ${jogo.golsAdversario}`;
    
    if (jogo.penCampeao !== null) {
        placar += ` (pên. ${jogo.penCampeao} x ${jogo.penAdversario})`;
    } else if (jogo.prorrogacao) {
        placar += " (prorrogação)";
    }
    
    return placar;
}

// --- PONTOS DE UM ACERTO, DESCONTADAS AS DICAS USADAS ---
export function pontosDoAcerto(jogo) {
    const gasto = Object.keys(CUSTO_DICAS)
        .filter((dica) => jogo.dicas[dica])
        .reduce((soma, dica) => soma + CUSTO_DICAS[dica], 0);
    return Math.max(PONTOS_MINIMOS_POR_JOGO, PONTOS_POR_JOGO - gasto);
}

// --- TOTAL DE PONTOS DA PARTIDA ---
export function totalDePontos() {
    const soma = estado.jogos.reduce((total, jogo) => total + jogo.pontos, 0);
    return Math.max(0, soma - estado.erros * PENALIDADE_ERRO);
}

export function pontosMaximos() {
    return estado.jogos.length * PONTOS_POR_JOGO;
}

// --- ENCONTRA O JOGO QUE CORRESPONDE AO PALPITE ---
export function encontrarJogo(adversario) {
    const selecionado = estado.jogos[estado.selecionado];
    if (selecionado && selecionado.status === "aberto" && selecionado.adversario === adversario) {
        return selecionado;
    }
    return estado.jogos.find((jogo) => jogo.status === "aberto" && jogo.adversario === adversario) || null;
}
