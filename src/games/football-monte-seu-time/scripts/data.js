import { estado, CATEGORIAS } from "./core.js?v=3";

// --- CARREGA OS DADOS DO ARQUIVO JSON ---
export async function carregarDados() {
    const resposta = await fetch("data/football-monte-seu-time.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error("Falha ao carregar os dados do jogo");
    }
    const dados = await resposta.json();
    estado.times = dados.times || [];
    return dados;
}

// --- RECONSTRÓI O BARALHO COM TODOS OS TIMES ---
export function reiniciarBaralho() {
    estado.baralho = [...estado.times];
}

// --- SORTEIA UM TIME ALEATORIAMENTE DO BARALHO ---
export function sortearProximo() {
    if (estado.baralho.length === 0) {
        reiniciarBaralho();
    }
    const indice = Math.floor(Math.random() * estado.baralho.length);
    const escolhido = estado.baralho.splice(indice, 1)[0];
    estado.timeAtual = escolhido;
    return escolhido;
}

// --- CONTA QUANTOS SLOTS ESTÃO OCUPADOS ---
export function contarCategoriasPreenchidas() {
    return CATEGORIAS.filter(categoria => estado.categoriasPreenchidas[categoria.id]).length;
}

// --- VERIFICA SE AS 7 CATEGORIAS ESTÃO COMPLETAS ---
export function todasCategoriasPreenchidas() {
    return CATEGORIAS.every(categoria => estado.categoriasPreenchidas[categoria.id]);
}

// --- REINICIA O ESTADO PARA UMA NOVA PARTIDA ---
export function reiniciarJogo() {
    estado.baralho = [];
    estado.timeAtual = null;
    estado.rodada = 0;
    estado.categoriasPreenchidas = {};
    CATEGORIAS.forEach(categoria => {
        estado.categoriasPreenchidas[categoria.id] = null;
    });
    estado.terminado = false;
    estado.venceu = false;
}

// --- OBTÉM A URL DA IMAGEM POR CATEGORIA ---
export function imagemDaCategoria(time, identificadorCategoria) {
    if (identificadorCategoria === "escudo") {
        return time.escudo_url || "";
    }
    return time[identificadorCategoria + "_img"] || "";
}

// --- OBTÉM A LEGENDA POR CATEGORIA ---
export function legendaDaCategoria(time, identificadorCategoria) {
    const valor = time[identificadorCategoria + "_nome"];
    return (valor && valor.trim()) ? valor : time.nome;
}
