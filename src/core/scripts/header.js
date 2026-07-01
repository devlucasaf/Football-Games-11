// --- DERIVA O CAMINHO BASE DO CORE ---
const caminhoBaseHeader = (function () {
    const atual = document.currentScript;
    return atual ? atual.src.replace(/\/scripts\/header\.js.*$/, "") : "";
})();

// --- MONTA E INJETA O CABEÇALHO ---
function renderHeader() {
    const base = caminhoBaseHeader;
    const assets = new URL(`${base}/../assets/`).href;
    const inicio = new URL(`${base}/../../index.html`).href;

    const enderecoAtual = window.location.href.split(/[?#]/)[0];
    const ehInicio = inicio === enderecoAtual;
    const temTutorial = document.querySelector(".tutorial-overlay") !== null;

    const logo = ehInicio
        ? `<i class="fas fa-futbol"></i>Football Games 11`
        : `<i class="fas fa-futbol"></i><a href="${inicio}" class="home-link">Football Games 11</a>`;

    const botaoAjuda = temTutorial
        ? `<button class="btn-help" id="tutorialHelpBtn" title="Ver tutorial">
                            <i class="fas fa-question-circle"></i>
                        </button>`
        : "";

    // --- HTML DO CABEÇALHO ---
    const html = `
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <h1>${logo}</h1>
                    </div>

                    <div class="header-actions">
                        <div class="language-selector">
                            <button class="btn-language" id="languageToggle" title="Selecionar idioma">
                                <img 
                                    src="${assets}br-flag-icon.png" 
                                    alt="Português" 
                                    id="currentLanguageFlag" 
                                />
                            </button>

                            <div class="language-dropdown" id="languageDropdown">
                                <button class="language-option" data-language="traducoes">
                                    <img 
                                        src="${assets}br-flag-icon.png" 
                                        alt="Português" 
                                    />
                                    <span>Português</span>
                                </button>

                                <button class="language-option" data-language="translations">
                                    <img 
                                        src="${assets}us-flag-icon.png" 
                                        alt="English" 
                                    />
                                    <span>English</span>
                                </button>

                                <button class="language-option" data-language="traducciones">
                                    <img 
                                        src="${assets}es-flag-icon.png" 
                                        alt="Español" 
                                    />
                                    <span>Español</span>
                                </button>

                                <button class="language-option" data-language="ubersetzungen">
                                    <img 
                                        src="${assets}de-flag-icon.png" 
                                        alt="Deutsch" 
                                    />
                                    <span>Deutsch</span>
                                </button>
                            </div>
                        </div>

                        ${botaoAjuda}
                        <button class="btn-theme" id="themeToggle" title="Alterar tema">
                            <i class="fas fa-moon"></i>
                        </button>

                        <button class="btn-procurar" id="searchToggle" title="Procurar"></button>
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                    </div>
                </div>
            </div>`;

    // --- INSERE NO CABEÇALHO EXISTENTE OU CRIA UM NOVO ---
    let header = document.querySelector("header.main-header");

    // --- NÃO SOBRESCREVE CABEÇALHOS PERSONALIZADOS (EX.: BUILDERS) ---
    if (header && header.children.length > 0) {
        return;
    }

    if (!header) {
        header = document.createElement("header");
        header.className = "main-header";
        document.body.insertBefore(header, document.body.firstChild);
    }
    header.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderHeader);
