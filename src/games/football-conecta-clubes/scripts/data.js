import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-conecta-clubes.json");
    const dadosConexoes = await respostaCarregamento.json();
    estado.conexoes = dadosConexoes.conexoes;
}

// --- SORTEAR CONEXÕES PARA AS RODADAS ---
export function sortearConexoesRodadas() {
    const copia = [...estado.conexoes];
    const sorteadas = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceConexao = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(indiceConexao, 1)[0]);
    }
    estado.sorteadas = sorteadas;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizarTextoComparacao(textoComparacao) {
    return textoComparacao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- OBTER TODOS OS NOMES ÚNICOS ---
export function obterNomes() {
    const nomes = new Set();
    estado.conexoes.forEach(conexao => {
        conexao.respostas.forEach(nome => nomes.add(nome));
    });
    return [...nomes].sort((primeiroNome, segundoNome) => primeiroNome.localeCompare(segundoNome));
}
