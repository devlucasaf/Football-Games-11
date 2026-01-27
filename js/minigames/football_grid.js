const GRID_SIZE = 3;
const DEFAULT_TIME_SECONDS = 180;

async function carregarJogadores() {
    try {
        const response = await fetch('.data/players-grid.json');
        jogadores = await response.json();
        console.log("Jogadores carregados:", jogadores);
        renderGrid();
    } catch (error) {
        console.error("Erro ao carregar jogadores:", error);
    }
}