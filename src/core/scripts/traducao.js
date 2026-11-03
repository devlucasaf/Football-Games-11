// --- CARREGA OS ARQUIVOS DE TRADUÇÃO ---
(function () {
    const arquivoTraducaoAtual = document.currentScript;
    if (!arquivoTraducaoAtual) {
        return;
    }

    const enderecoBase = arquivoTraducaoAtual.src.replace(/\/scripts\/traducao\.js.*$/, "");
    const enderecosArquivos = [
        `${enderecoBase}/translation/english.js`,
        `${enderecoBase}/translation/german.js`,
        `${enderecoBase}/translation/portuguese.js`,
        `${enderecoBase}/translation/spanish.js`,
        `${enderecoBase}/translation/french.js`,
        `${enderecoBase}/translation/italian.js`,
        `${enderecoBase}/scripts/catalogo.js`,
        `${enderecoBase}/scripts/avisos.js`,
        `${enderecoBase}/scripts/diario.js`,
        `${enderecoBase}/scripts/perfil.js`,
        `${enderecoBase}/scripts/header.js`,
        `${enderecoBase}/scripts/script.js`,
        `${enderecoBase}/scripts/estatisticas.js`,
        `${enderecoBase}/scripts/fg11-extras.js`
    ];

    enderecosArquivos.forEach(enderecoArquivo => {
        document.write(`<script src="${enderecoArquivo}"><\/script>`);
    });
})();

// --- MONTA O MAPA DE IDIOMAS ---
function obterTraducoes() {
    return {
        translations: typeof translations !== "undefined" ? translations : {},
        traducoes: typeof traducoes !== "undefined" ? traducoes : {},
        ubersetzungen: typeof ubersetzungen !== "undefined" ? ubersetzungen : {},
        traducciones: typeof traducciones !== "undefined" ? traducciones : {},
        traductions: typeof traductions !== "undefined" ? traductions : {},
        traduzioni: typeof traduzioni !== "undefined" ? traduzioni : {}
    };
}

// --- APLICA A TRADUÇÃO NA PÁGINA ---
function aplicarTraducao(idioma) {
    const traducoesIdiomas = obterTraducoes();

    if (traducoesIdiomas[idioma] && traducoesIdiomas[idioma]["titulo"]) {
        document.title = traducoesIdiomas[idioma]["titulo"];
    }

    document.querySelectorAll("[data-key]").forEach(elementoTraduzivel => {
        const chaveTraducao = elementoTraduzivel.getAttribute("data-key");
        if (traducoesIdiomas[idioma] && traducoesIdiomas[idioma][chaveTraducao]) {
            if (elementoTraduzivel.tagName === "INPUT" || elementoTraduzivel.tagName === "TEXTAREA") {
                elementoTraduzivel.placeholder = traducoesIdiomas[idioma][chaveTraducao];
            } else {
                elementoTraduzivel.textContent = traducoesIdiomas[idioma][chaveTraducao];
            }
        }
    });

    atualizarTituloSecaoMusica(idioma);

    atualizarTraducoesNavegacao(idioma);

    localStorage.setItem("preferredLanguage", idioma);
}

// --- TRADUZ O TÍTULO DA SEÇÃO DE MÚSICA ---
function atualizarTituloSecaoMusica(idioma) {
    const traducoesIdiomas = obterTraducoes();
    const tituloSecaoMusica = document.querySelector("#music-section .section-title");
    if (tituloSecaoMusica && traducoesIdiomas[idioma] && traducoesIdiomas[idioma]["music-title"]) {
        const elementoDestaque = tituloSecaoMusica.querySelector(".highlight");
        if (elementoDestaque) {
            tituloSecaoMusica.innerHTML = traducoesIdiomas[idioma]["music-title"].replace("Agora", "<span class='highlight'>Agora</span>");
        } else {
            tituloSecaoMusica.textContent = traducoesIdiomas[idioma]["music-title"];
        }
    }
}

// --- TRADUZ ELEMENTOS DE NAVEGAÇÃO POR CLASSE ---
function atualizarTraducoesNavegacao(idioma) {
    const traducoesIdiomas = obterTraducoes();
    const classesNavegacao = [
        "nav-home", 
        "nav-sobre", 
        "nav-musica", 
        "nav-skills", 
        "nav-certifications", 
        "nav-projetos", 
        "nav-contatos"
    ];
    
    classesNavegacao.forEach(nomeClasseNavegacao => {
        const elementosNavegacao = document.getElementsByClassName(nomeClasseNavegacao);
        if (elementosNavegacao.length > 0 && traducoesIdiomas[idioma] && traducoesIdiomas[idioma][nomeClasseNavegacao]) {
            for (const elementoNavegacao of elementosNavegacao) {
                elementoNavegacao.textContent = traducoesIdiomas[idioma][nomeClasseNavegacao];
            }
        }
    });
}

// --- EXPÕE AS FUNÇÕES GLOBALMENTE ---
Object.defineProperty(window, "translations", {
    get: obterTraducoes,
    configurable: true
});

Object.defineProperty(window, "traducoesIdiomas", {
    get: obterTraducoes,
    configurable: true
});

window.aplicarTraducao = aplicarTraducao;
window.atualizarTituloSecaoMusica = atualizarTituloSecaoMusica;
window.atualizarTraducoesNavegacao = atualizarTraducoesNavegacao;

// --- COMPATIBILIDADE COM INTEGRAÇÕES ANTERIORES ---
window.applyTranslation = aplicarTraducao;
window.updateSectionTitles = atualizarTituloSecaoMusica;
window.updateElementsByClass = atualizarTraducoesNavegacao;