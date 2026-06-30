export function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

export function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
