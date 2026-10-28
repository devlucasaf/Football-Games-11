// --- FUNÇÃO DE NORMALIZAÇÃO DE TEXTO ---
export function normalizarTexto(texto) {
    return texto
        .normalize("NFD")                         
        .replace(/[\u0300-\u036f]/g, "")          
        .toUpperCase()                            
        .trim();                                  
}

// --- FUNÇÃO DE ESPERA ASSÍNCRONA ---
export function esperarMilissegundos(milissegundos) {
    return new Promise((concluirEspera) => setTimeout(concluirEspera, milissegundos));
}