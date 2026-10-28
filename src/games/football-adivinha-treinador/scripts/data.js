import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-adivinha-treinador.json");
    const dadosTreinadores = await respostaCarregamento.json();
    estado.treinadores = dadosTreinadores.treinadores;
}

// --- SORTEIA TREINADORES PARA O JOGO ---
export function sortearTreinadoresRodadas() {
    const copia = [...estado.treinadores];
    const sorteados = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceTreinador = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(indiceTreinador, 1)[0]);
    }
    estado.sorteados = sorteados;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizarTextoComparacao(textoComparacao) {
    return textoComparacao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- VERIFICA SE O PALPITE ESTÁ CORRETO ---
export function obterDicas(treinador) {
    return [
        { 
            rotulo: "Nacionalidade", 
            valor: treinador.nacionalidade 
        },
        { 
            rotulo: "Nascimento", 
            valor: treinador.anoNascimento.toString() 
        },
        { 
            rotulo: "Clubes", 
            valor: treinador.clubes.slice(0, 3).join(", ") + "..." 
        },
        { 
            rotulo: "Títulos", 
            valor: treinador.titulos.slice(0, 2).join(", ") 
        },
        { 
            rotulo: "Curiosidade", 
            valor: treinador.curiosidade 
        }
    ];
}
