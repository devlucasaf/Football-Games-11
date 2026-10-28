import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-30-segundos.json");
    const dadosCategorias = await respostaCarregamento.json();
    estado.categorias = dadosCategorias.categorias;
}

// --- SORTEIA UMA CATEGORIA ---
export function sortearCategoria() {
    const indiceCategoria = Math.floor(Math.random() * estado.categorias.length);
    estado.categoriaAtual = estado.categorias[indiceCategoria];
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizarTextoComparacao(textoComparacao) {
    return textoComparacao
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// --- VERIFICA O PALPITE CONTRA A LISTA DE RESPOSTAS ---
export function encontrarResposta(palpite) {
    const alvo = normalizarTextoComparacao(palpite);
    if (!alvo) {
        return null;
    }

    return estado.categoriaAtual.respostas.find((respostaCategoria) => {
        if (normalizarTextoComparacao(respostaCategoria.nome) === alvo) {
            return true;
        }
        return (respostaCategoria.aliases || []).some((nomeAlternativo) => normalizarTextoComparacao(nomeAlternativo) === alvo);
    }) || null;
}

// --- OBTER TODOS OS NOMES ÚNICOS DE TODAS AS CATEGORIAS ---
export function obterNomes() {
    const nomes = new Set();
    estado.categorias.forEach((categoria) => {
        categoria.respostas.forEach((respostaCategoria) => nomes.add(respostaCategoria.nome));
    });
    return [...nomes].sort((primeiroNome, segundoNome) => primeiroNome.localeCompare(segundoNome));
}
