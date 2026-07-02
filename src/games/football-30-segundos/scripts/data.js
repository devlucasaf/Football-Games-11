import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-30-segundos.json");
    const data = await resp.json();
    estado.categorias = data.categorias;
}

// --- SORTEIA UMA CATEGORIA ---
export function sortearCategoria() {
    const idx = Math.floor(Math.random() * estado.categorias.length);
    estado.categoriaAtual = estado.categorias[idx];
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizar(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// --- VERIFICA O PALPITE CONTRA A LISTA DE RESPOSTAS ---
export function encontrarResposta(palpite) {
    const alvo = normalizar(palpite);
    if (!alvo) {
        return null;
    }

    return estado.categoriaAtual.respostas.find((r) => {
        if (normalizar(r.nome) === alvo) {
            return true;
        }
        return (r.aliases || []).some((a) => normalizar(a) === alvo);
    }) || null;
}
