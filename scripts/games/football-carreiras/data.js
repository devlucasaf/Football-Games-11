import estado from "./core.js";
import { normalizar } from "./utils.js";

export async function carregarDados() {
    // --- CARREGAR JOGADORES ---
    const respostaCarreiras = await fetch(
        "../data/football-carreiras.json",
        { cache: "no-store" }
    );
    
    if (!respostaCarreiras.ok) {
        throw new Error(`Erro ao carregar carreiras (${respostaCarreiras.status})`);
    }
    const dadosCarreiras = await respostaCarreiras.json();
    estado.jogadores = dadosCarreiras.jogadores.filter(j => j.clubes && j.clubes.length >= 3);

    // --- CARREGAR ESCUDOS DO GRID ---
    const respostaGrid = await fetch(
        "../data/football-grid.json",
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

export function buscarEscudo(nomeClube) {
    return estado.escudos.get(normalizar(nomeClube)) || null;
}

export function escolherJogador() {
    const idx = Math.floor(Math.random() * estado.jogadores.length);
    
    estado.jogadorAtual = estado.jogadores[idx];
    estado.clubesRevelados = 0;
    estado.erros = 0;
    estado.jogoAtivo = true;
}
