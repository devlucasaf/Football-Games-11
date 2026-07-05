// --- FUNÇÃO DE NORMALIZAÇÃO DE TEXTO ---
export function normalizar(texto) {
    return texto
        .normalize("NFD")                         
        .replace(/[\u0300-\u036f]/g, "")          
        .toUpperCase()                            
        .trim();                                  
}

// --- FUNÇÃO DE ESPERA ASSÍNCRONA ---
export function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));  
}