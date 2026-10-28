import estado from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-adivinha-jogador.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }

    const dados = await resposta.json();
    estado.jogadores = dados.jogadores;
}

// --- ESCOLHA ALEATÓRIA DE JOGADOR ---
export function escolherJogador() {
    const disponiveis = estado.jogadores.filter((jogadorNaoUtilizado, indiceJogador) => !estado.jogadoresUsados.has(indiceJogador));

    if (disponiveis.length === 0) {
        estado.jogadoresUsados.clear();
        return escolherJogador();
    }

    const indices = estado.jogadores
        .map((jogadorNaoUtilizado, indiceJogador) => indiceJogador)
        .filter(indiceJogador => !estado.jogadoresUsados.has(indiceJogador));

    const indiceJogadorSorteado = indices[Math.floor(Math.random() * indices.length)];
    
    estado.jogadoresUsados.add(indiceJogadorSorteado);
    estado.jogadorAtual = estado.jogadores[indiceJogadorSorteado];
    estado.pistasReveladas = 1;
    estado.tentativas = 0;
    estado.jogoAtivo = true;
}

// --- OBTER LISTA DE NOMES DOS JOGADORES ---
export function obterNomesJogadores() {
    return estado.jogadores.map(jogador => jogador.nome);
}
