(function () {
    const atual = document.currentScript;
    if (!atual) {
        return;
    }

    const base = atual.src.replace(/\/scripts\/traducao\.js.*$/, "");
    const scripts = [
        `${base}/translation/english.js`,
        `${base}/translation/german.js`,
        `${base}/translation/portuguese.js`,
        `${base}/translation/spanish.js`,
        `${base}/scripts/header.js`,
        `${base}/scripts/script.js`
    ];

    scripts.forEach(src => {
        document.write(`<script src="${src}"><\/script>`);
    });
})();

// --- MONTA O MAPA DE IDIOMAS ---
function obterTraducoes() {
    return {
        translations: typeof translations !== "undefined" ? translations : {},
        traducoes: typeof traducoes !== "undefined" ? traducoes : {},
        ubersetzungen: typeof ubersetzungen !== "undefined" ? ubersetzungen : {},
        traducciones: typeof traducciones !== "undefined" ? traducciones : {}
    };
}

// --- APLICA A TRADUÇÃO NA PÁGINA ---
function aplicarTraducao(lingua) {
    const linguas = obterTraducoes();

    if (linguas[lingua] && linguas[lingua]["titulo"]) {
        document.titulo = linguas[lingua]["titulo"];
    }

        document.querySelectorAll("[data-key]").forEach(element => {
        const key = element.getAttribute("data-key");
        if (linguas[lingua] && linguas[lingua][key]) {
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                element.placeholder = linguas[lingua][key];
            } else {
                element.textContent = linguas[lingua][key];
            }
        }
    });

    atualizaSessaoTitulo(lingua);

    atualizaElementosClass(lingua);

    localStorage.setItem("preferredLanguage", lingua);
}

// --- TRADUZ O TÍTULO DA SEÇÃO DE MÚSICA ---
function atualizaSessaoTitulo(lingua) {
    const linguas = obterTraducoes();
    const sessaoMusicaTitulo = document.querySelector("#music-section .section-title");
    if (sessaoMusicaTitulo && linguas[lingua] && linguas[lingua]["music-title"]) {
        const highlightSpan = sessaoMusicaTitulo.querySelector(".highlight");
        if (highlightSpan) {
            sessaoMusicaTitulo.innerHTML = linguas[lingua]["music-title"].replace("Agora", "<span class='highlight'>Agora</span>");
        } else {
            sessaoMusicaTitulo.textContent = linguas[lingua]["music-title"];
        }
    }
}

// --- TRADUZ ELEMENTOS DE NAVEGAÇÃO POR CLASSE ---
function atualizaElementosClass(lingua) {
    const linguas = obterTraducoes();
    const navClasses = ["nav-home", "nav-sobre", "nav-musica", "nav-skills", "nav-certifications", "nav-projetos", "nav-contatos"];
    
    navClasses.forEach(className => {
        const elementos = document.getElementsByClassName(className);
        if (elementos.length > 0 && linguas[lingua] && linguas[lingua][className]) {
            for (let element of elementos) {
                element.textContent = linguas[lingua][className];
            }
        }
    });
}

// --- EXPÕE AS FUNÇÕES GLOBALMENTE ---
Object.defineProperty(window, "translations", {
    get: obterTraducoes,
    configurable: true
});
window.applyTranslation = aplicarTraducao;
window.updateSectionTitles = atualizaSessaoTitulo;
window.updateElementsByClass = atualizaElementosClass;