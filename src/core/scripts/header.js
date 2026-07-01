// --- DERIVA O CAMINHO BASE DO CORE ---
const caminhoBaseHeader = (function () {
    const atual = document.currentScript;
    return atual ? atual.src.replace(/\/scripts\/header\.js.*$/, "") : "";
})();

// --- MONTA E INJETA O CABEÇALHO ---
function renderHeader() {
    const base = caminhoBaseHeader;
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

    // --- BUSCA DE JOGOS ---
    const buscaJogos = ehInicio
        ? `<div class="header-search" id="headerSearch">
                <input 
                    type="text" 
                    id="searchGamesInput" 
                    class="search-input" 
                    placeholder="Buscar jogos..." 
                    data-key="search-placeholder" 
                    aria-label="Buscar jogos" 
                />
                <button class="btn-search" id="btnSearchGames" title="Buscar jogos" aria-label="Buscar jogos">
                    <i class="fas fa-search"></i>
                </button>
            </div>`
        : "";

    // --- HTML DO CABEÇALHO ---
    const html = `
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <h1>${logo}</h1>
                    </div>

                    <div class="header-actions">
                        ${buscaJogos}
                        ${botaoAjuda}
                    </div>
                </div>
            </div>`;

    // --- INSERE NO CABEÇALHO EXISTENTE OU CRIA UM NOVO ---
    let header = document.querySelector("header.main-header");

    // --- NÃO SOBRESCREVE CABEÇALHOS PERSONALIZADOS ---
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
