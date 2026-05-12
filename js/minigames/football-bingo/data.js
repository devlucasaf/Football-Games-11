import estado from "./core.js";
import { embaralhar } from "./utils.js";

export async function carregarDados() {
    const resposta = await fetch(
        "../data/football-bingo.json", 
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
    estado.mapeamentoSelecao  = dados.mapeamentoSelecao;
}

export function selecionarGrid() {
    estado.gridCategorias = embaralhar([...estado.categorias]).slice(0, 25);
}

export function selecionarFila() {
    estado.filaJogadores = embaralhar([...estado.jogadores]);
    estado.jogadorIdx = 0;
}

export function jogadorAtual() {
    return estado.filaJogadores[estado.jogadorIdx] || null;
}

export function proximoJogador() {
    estado.jogadorIdx++;
    if (estado.jogadorIdx >= estado.filaJogadores.length) {
        return null;
    }
    return estado.filaJogadores[estado.jogadorIdx];
}

// --- VERIFICAR SE JOGADOR CORRESPONDE A UMA CATEGORIA ---
export function jogadorCorresponde(jogador, categoria) {
    if (!jogador || !categoria) {
        return false;
    }

    switch (categoria.tipo) {
        case "clube": {
            const nomeClube = categoria.texto.replace("Jogou no ", "").replace("Jogou na ", "");
            return jogador.clubes.some(c =>
                c.toLowerCase() === nomeClube.toLowerCase()
            );
        }
        case "selecao": {
            const nacionalidade = categoria.texto;
            const selecaoMapeada = Object.entries(estado.mapeamentoSelecao)
                .find(([, adj]) => adj === nacionalidade);
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
