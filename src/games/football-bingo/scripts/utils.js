export function embaralhar(itensSorteio) {
    for (let indiceItem = itensSorteio.length - 1; indiceItem > 0; indiceItem--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceItem + 1));
        [itensSorteio[indiceItem], itensSorteio[indiceSorteado]] = [itensSorteio[indiceSorteado], itensSorteio[indiceItem]];
    }
    return itensSorteio;
}
