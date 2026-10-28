import estado from "./core.js";
import { normalizar } from "./utils.js";

// --- CARREGAR JOGADORES ---
export async function carregarDados() {
    let jogadoresCentral = [];
    try {
        const respostaCentral = await fetch("../../core/data/jogadores.json", { cache: "no-store" });
        if (respostaCentral.ok) {
            const dadosCentral = await respostaCentral.json();
            jogadoresCentral = Array.isArray(dadosCentral.jogadores) ? dadosCentral.jogadores : [];
        }
    } catch (erroCarregamentoCentral) {
        jogadoresCentral = [];
    }

    const respostaCarreiras = await fetch("data/football-carreiras.json", { cache: "no-store" });

    if (!respostaCarreiras.ok) {
        throw new Error(`Erro ao carregar carreiras (${respostaCarreiras.status})`);
    }
    const dadosCarreiras = await respostaCarreiras.json();

    const porNome = new Map();
    dadosCarreiras.jogadores.forEach(jogador => porNome.set(normalizar(jogador.nome), jogador));
    jogadoresCentral.forEach(jogador => porNome.set(normalizar(jogador.nome), jogador));

    estado.jogadores = [...porNome.values()].filter(jogador => jogador.clubes && jogador.clubes.length >= 3);

    const respostaEscudosClubes = await fetch(
        "../football-grid/data/football-grid.json",
        { cache: "no-store" }
    );

    if (!respostaEscudosClubes.ok) {
        throw new Error(`Erro ao carregar escudos (${respostaEscudosClubes.status})`);
    }
    const dadosEscudosClubes = await respostaEscudosClubes.json();

    dadosEscudosClubes.clubes.forEach(clube => {
        estado.escudos.set(normalizar(clube.nome), clube.escudo);
    });
}

// --- BUSCAR ESCUDO DE UM CLUBE ---
export function buscarEscudo(nomeClube) {
    return estado.escudos.get(normalizar(nomeClube)) || null;
}

// --- ESCOLHER JOGADOR ALEATÓRIO ---
export function escolherJogador() {
    const indiceJogador = Math.floor(Math.random() * estado.jogadores.length);
    
    estado.jogadorAtual = estado.jogadores[indiceJogador];
    estado.clubesRevelados = 0;
    estado.erros = 0;
    estado.jogoAtivo = true;
}
