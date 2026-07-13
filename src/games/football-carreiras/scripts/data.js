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
    } catch (e) {
        jogadoresCentral = [];
    }

    const respostaCarreiras = await fetch("data/football-carreiras.json", { cache: "no-store" });

    if (!respostaCarreiras.ok) {
        throw new Error(`Erro ao carregar carreiras (${respostaCarreiras.status})`);
    }
    const dadosCarreiras = await respostaCarreiras.json();

    const porNome = new Map();
    dadosCarreiras.jogadores.forEach(j => porNome.set(normalizar(j.nome), j));
    jogadoresCentral.forEach(j => porNome.set(normalizar(j.nome), j));

    estado.jogadores = [...porNome.values()].filter(j => j.clubes && j.clubes.length >= 3);

    const respostaGrid = await fetch(
        "../football-grid/data/football-grid.json",
        { cache: "no-store" }
    );

    if (!respostaGrid.ok) {
        throw new Error(`Erro ao carregar escudos (${respostaGrid.status})`);
    }
    const dadosGrid = await respostaGrid.json();

    dadosGrid.clubes.forEach(c => {
        estado.escudos.set(normalizar(c.nome), c.escudo);
    });
}

// --- BUSCAR ESCUDO DE UM CLUBE ---
export function buscarEscudo(nomeClube) {
    return estado.escudos.get(normalizar(nomeClube)) || null;
}

// --- ESCOLHER JOGADOR ALEATÓRIO ---
export function escolherJogador() {
    const idx = Math.floor(Math.random() * estado.jogadores.length);
    
    estado.jogadorAtual = estado.jogadores[idx];
    estado.clubesRevelados = 0;
    estado.erros = 0;
    estado.jogoAtivo = true;
}
