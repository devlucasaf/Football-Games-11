import estado from "./core.js";
import { embaralhar } from "./utils.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados(modo = "mundial") {
    const arquivo = modo === "brasileiro" 
        ? "data/football-bingo-brasileiro.json" 
        : "data/football-bingo.json";

    const resposta = await fetch(
        arquivo, 
        { 
            cache: "no-store" 
        }
    );
    
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }
    const dados = await resposta.json();
    estado.categorias         = dados.categorias;
    estado.jogadores          = dados.jogadores;
    estado.mapeamentoSelecao  = dados.mapeamentoSelecao || {};
}

// --- ESCOLHER JOGADOR ALEATÓRIO ---
export function selecionarGradeCategorias() {
    estado.gradeCategorias = embaralhar([...estado.categorias]).slice(0, 25);
}

// --- ESCOLHER JOGADOR ALEATÓRIO ---
export function selecionarFila() {
    estado.filaJogadores = embaralhar([...estado.jogadores]);
    estado.indiceJogadorAtual = 0;
}

// --- OBTER JOGADOR ATUAL ---
export function jogadorAtual() {
    return estado.filaJogadores[estado.indiceJogadorAtual] || null;
}

// --- OBTER CATEGORIA ATUAL ---
export function proximoJogador() {
    estado.indiceJogadorAtual++;
    if (estado.indiceJogadorAtual >= estado.filaJogadores.length) {
        return null;
    }
    return estado.filaJogadores[estado.indiceJogadorAtual];
}

// --- VERIFICAR SE JOGADOR CORRESPONDE A UMA CATEGORIA ---
export function jogadorCorresponde(jogador, categoria) {
    if (!jogador || !categoria) {
        return false;
    }

    switch (categoria.tipo) {
        case "clube": {
            const nomeClube = categoria.texto.replace("Jogou no ", "").replace("Jogou na ", "");
            return jogador.clubes.some(clube =>
                clube.toLowerCase() === nomeClube.toLowerCase()
            );
        }
        case "selecao": {
            const nacionalidade = categoria.texto;
            const selecaoMapeada = Object.entries(estado.mapeamentoSelecao)
                .find(([, adjetivoNacionalidade]) => adjetivoNacionalidade === nacionalidade);
            if (selecaoMapeada) {
                return jogador.selecao === selecaoMapeada[0];
            }
            return false;
        }
        case "titulo":
            return (jogador.titulos || []).includes(categoria.texto);
        case "posicao":
            return jogador.posicao === categoria.texto;
        default:
            return false;
    }
}
