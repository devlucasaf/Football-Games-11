// --- DERIVA O CAMINHO BASE DO CORE ---
const caminhoBaseCabecalho = (function () {
    const atual = document.currentScript;
    return atual ? atual.src.replace(/\/scripts\/header\.js.*$/, "") : "";
})();

// --- CONSIDERA "/" EQUIVALENTE A "/index.html" ---
function normalizarCaminho(caminho) {
    return caminho.endsWith("/") ? `${caminho}index.html` : caminho;
}

// --- MONTA OS ENDEREÇOS DO SITE A PARTIR DO CORE ---
function obterRotas() {
    const base = caminhoBaseCabecalho;
    return {
        inicio: new URL(`${base}/../../index.html`).href,
        jogos: new URL(`${base}/../../index.html#jogos`).href,
        estatisticas: new URL(`${base}/pages/estatisticas.html`).href,
        configuracoes: new URL(`${base}/pages/configuracoes.html`).href,
        perguntasFrequentes: new URL(`${base}/pages/faq.html`).href,
        sobre: new URL(`${base}/pages/sobre.html`).href,
        privacidade: new URL(`${base}/pages/privacidade.html`).href,
        licenca: new URL(`${base}/pages/licenca.html`).href
    };
}

// --- VERIFICA SE O ENDEREÇO É A PÁGINA ATUAL ---
function ehPaginaAtual(endereco) {
    const alvo = new URL(endereco);
    const atual = new URL(window.location.href);
    return alvo.origin === atual.origin && normalizarCaminho(alvo.pathname) === normalizarCaminho(atual.pathname);
}

// --- MONTA E INJETA O CABEÇALHO ---
function renderizarCabecalho() {
    const rotas = obterRotas();
    const ehInicio = ehPaginaAtual(rotas.inicio);
    const temTutorial = document.querySelector(".tutorial-overlay") !== null;

    garantirAlvoDoConteudo();
    inserirLinkDeAtalho();

    // --- NÃO SOBRESCREVE CABEÇALHOS PERSONALIZADOS ---
    let cabecalho = document.querySelector("header.main-header");
    if (cabecalho && cabecalho.children.length > 0) {
        return;
    }

    const itensMenu = [
        { 
            href: rotas.inicio, 
            icone: "fa-house", 
            chave: "menu-home", 
            texto: "Início", 
            atual: ehInicio 
        },
        {
            href: ehInicio ? "#jogos" : rotas.jogos,
            icone: "fa-gamepad",
            chave: "menu-games",
            texto: "Jogos",
            atual: false
        },
        {
            href: rotas.estatisticas,
            icone: "fa-chart-simple",
            chave: "menu-stats",
            texto: "Estatísticas",
            atual: ehPaginaAtual(rotas.estatisticas)
        },
        {
            href: rotas.configuracoes,
            icone: "fa-sliders",
            chave: "menu-settings",
            texto: "Configurações",
            atual: ehPaginaAtual(rotas.configuracoes)
        },
        {
            href: rotas.perguntasFrequentes,
            icone: "fa-circle-question",
            chave: "menu-faq",
            texto: "FAQ",
            atual: ehPaginaAtual(rotas.perguntasFrequentes)
        }
    ];

    const menu = itensMenu.map(item => `
                        <li>
                            <a class="nav-link" href="${item.href}"${item.atual ? ' aria-current="page"' : ""}>
                                <i class="fas ${item.icone}" aria-hidden="true"></i>
                                <span data-key="${item.chave}">${item.texto}</span>
                            </a>
                        </li>`).join("");

    const marcacaoBotaoAjuda = temTutorial
        ? ` <button class="btn-help" id="tutorialHelpBtn" title="Ver tutorial" aria-label="Ver tutorial">
                <i class="fas fa-question" aria-hidden="true"></i>
            </button>`
        : "";

    // --- BUSCA DE JOGOS ---
    const buscaJogos = ehInicio
        ? `<div class="header-search" id="headerSearch">
                <input
                    type="search"
                    id="searchGamesInput"
                    class="search-input"
                    placeholder="Buscar jogos..."
                    data-key="search-placeholder"
                    aria-label="Buscar jogos"
                    autocomplete="off"
                />
                <button class="btn-search" id="btnSearchGames" title="Buscar jogos" aria-label="Buscar jogos" aria-expanded="false" aria-controls="searchGamesInput">
                    <i class="fas fa-search" aria-hidden="true"></i>
                </button>
            </div>`
        : "";

    // --- HTML DO CABEÇALHO ---
    const marcacaoCabecalho = `
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <a class="brand" href="${rotas.inicio}" aria-label="Football Games 11 — início">
                            <span class="brand-mark" aria-hidden="true"><i class="fas fa-futbol"></i></span>
                            <span class="brand-text">
                                <span class="brand-name">Football Games</span>
                                <span class="brand-tag" data-key="brand-tag">Minigames de futebol</span>
                            </span>
                        </a>
                    </div>

                    <nav class="main-nav" id="mainNav" aria-label="Principal">
                        <ul>${menu}
                        </ul>
                    </nav>

                    <div class="header-actions">
                        ${buscaJogos}
                        ${marcacaoBotaoAjuda}
                        <button class="btn-theme" data-theme-toggle title="Alterar tema" aria-label="Alterar tema">
                            <i class="fas fa-moon" aria-hidden="true"></i>
                        </button>
                        <button class="btn-menu" id="btnMenu" aria-label="Abrir menu" aria-expanded="false" aria-controls="mainNav">
                            <i class="fas fa-bars" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>`;

    // --- INSERE NO CABEÇALHO EXISTENTE OU CRIA UM NOVO ---
    if (!cabecalho) {
        cabecalho = document.createElement("header");
        cabecalho.className = "main-header";
        document.body.insertBefore(cabecalho, document.body.firstChild);
    }
    cabecalho.innerHTML = marcacaoCabecalho;

    inicializarMenuResponsivo(cabecalho);
}

// --- MENU RESPONSIVO ---
function inicializarMenuResponsivo(cabecalho) {
    const btnAlternarMenu = cabecalho.querySelector("#btnMenu");
    const navegacaoPrincipal = cabecalho.querySelector("#mainNav");
    if (!btnAlternarMenu || !navegacaoPrincipal) {
        return;
    }

    function definirAberturaMenu(aberto) {
        navegacaoPrincipal.classList.toggle("open", aberto);
        btnAlternarMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
        btnAlternarMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        btnAlternarMenu.querySelector("i").className = aberto ? "fas fa-xmark" : "fas fa-bars";
    }

    btnAlternarMenu.addEventListener("click", () => definirAberturaMenu(!navegacaoPrincipal.classList.contains("open")));

    navegacaoPrincipal.addEventListener("click", (evento) => {
        if (evento.target.closest("a")) {
            definirAberturaMenu(false);
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && navegacaoPrincipal.classList.contains("open")) {
            definirAberturaMenu(false);
            btnAlternarMenu.focus();
        }
    });

    document.addEventListener("click", (evento) => {
        if (navegacaoPrincipal.classList.contains("open") && !cabecalho.contains(evento.target)) {
            definirAberturaMenu(false);
        }
    });
}

// --- GARANTE UM ALVO PARA O LINK "PULAR PARA O CONTEÚDO" ---
function garantirAlvoDoConteudo() {
    if (document.getElementById("conteudo")) {
        return;
    }
    const principal = document.querySelector("main");
    if (principal) {
        principal.id = principal.id || "conteudo";
        if (principal.id !== "conteudo") {
            principal.setAttribute("data-skip-target", "");
        }
    }
}

// --- LINK DE ATALHO PARA O CONTEÚDO ---
function inserirLinkDeAtalho() {
    if (document.querySelector(".skip-link")) {
        return;
    }

    const alvo = document.getElementById("conteudo") || document.querySelector("main");
    if (!alvo) {
        return;
    }

    const ligacaoAtalho = document.createElement("a");
    ligacaoAtalho.className = "skip-link";
    ligacaoAtalho.href = `#${alvo.id}`;
    ligacaoAtalho.setAttribute("data-key", "skip-to-content");
    ligacaoAtalho.textContent = "Pular para o conteúdo";
    document.body.insertBefore(ligacaoAtalho, document.body.firstChild);
}

// --- MONTA O RODAPÉ PADRÃO EM TODAS AS PÁGINAS ---
function renderizarRodape() {
    const rodape = document.querySelector("footer.main-footer");
    if (!rodape) {
        return;
    }

    const rotas = obterRotas();
    const redes = [
        { href: "https://instagram.com/__.fr3it4s.__", icone: "fab fa-instagram", nome: "Instagram" },
        { href: "https://gitlab.com/devlucasaf/Football-Games-11", icone: "fab fa-gitlab", nome: "GitLab" },
        { href: "https://github.com/devlucasaf/Football-Games-11", icone: "fab fa-github", nome: "GitHub" },
        { href: "mailto:freitas.lucasaf@gmail.com", icone: "fas fa-envelope", nome: "Email" },
        { href: "https://open.spotify.com/user/6atv4j3yoivc7yidi4tf3e00h?si=a7882472f98742e8", icone: "fab fa-spotify", nome: "Spotify" },
        { href: "https://discord.com/users/1043680764140736612", icone: "fab fa-discord", nome: "Discord" },
        { href: "https://www.linkedin.com/in/lucasfr3itas/", icone: "fab fa-linkedin", nome: "LinkedIn" }
    ];

    const icones = redes.map(rede => {
        const externo = rede.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `
            <a href="${rede.href}" class="social-icon" title="${rede.nome}" aria-label="${rede.nome}"${externo}>
                <i class="${rede.icone}" aria-hidden="true"></i>
            </a>`;
    }).join("");

    // --- COLUNA DE LINKS ---
    const gerarColunaRodape = (chaveTitulo, titulo, ligacoes) => `
                    <nav class="footer-col" aria-label="${titulo}">
                        <h4 data-key="${chaveTitulo}">${titulo}</h4>
                        <ul>
                            ${ligacoes.map(ligacao => `
                            <li>
                                <a href="${ligacao.href}">
                                    <i class="fas ${ligacao.icone}" aria-hidden="true"></i>
                                    <span data-key="${ligacao.chave}">${ligacao.texto}</span>
                                </a>
                            </li>`).join("")}
                        </ul>
                    </nav>`;

    rodape.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <a class="brand" href="${rotas.inicio}" aria-label="Football Games 11 — início">
                            <span class="brand-mark" aria-hidden="true">
                                <i class="fas fa-futbol"></i>
                            </span>
                            <span class="brand-text">
                                <span class="brand-name">Football Games</span>
                                <span class="brand-tag" data-key="brand-tag">Minigames de futebol</span>
                            </span>
                        </a>
                        <p data-key="footer-made-with">Feito com ❤️ para fãs de futebol</p>
                        <div class="social-icons">${icones}</div>
                    </div>
                    ${gerarColunaRodape("footer-col-play", "Jogar", [
                        { href: rotas.inicio, icone: "fa-house", chave: "menu-home", texto: "Início" },
                        { href: rotas.jogos, icone: "fa-gamepad", chave: "menu-games", texto: "Jogos" },
                        { href: rotas.estatisticas, icone: "fa-chart-simple", chave: "menu-stats", texto: "Estatísticas" }
                    ])}
                    ${gerarColunaRodape("footer-col-project", "Projeto", [
                        { href: rotas.sobre, icone: "fa-circle-info", chave: "footer-about", texto: "Sobre" },
                        { href: rotas.perguntasFrequentes, icone: "fa-circle-question", chave: "footer-faq", texto: "FAQ" },
                        { href: rotas.configuracoes, icone: "fa-sliders", chave: "footer-settings", texto: "Configurações" }
                    ])}
                    ${gerarColunaRodape("footer-col-legal", "Legal", [
                        { href: rotas.privacidade, icone: "fa-shield-halved", chave: "footer-privacy", texto: "Privacidade" },
                        { href: rotas.licenca, icone: "fa-scale-balanced", chave: "footer-license", texto: "Licença" }
                    ])}
                </div>

                <div class="footer-bottom">
                    <p class="copyright" data-key="footer-copyright">© 2026 Football Games 11. Todos os direitos reservados.</p>
                    <span class="footer-version">V 1.0.0</span>
                </div>
            </div>`;
}

// --- FAVICON EMBUTIDO (EVITA 404 DE /favicon.ico) ---
function inserirIconeSite() {
    if (document.querySelector('link[rel~="icon"]')) {
        return;
    }
    const imagemVetorialIcone = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%231a5632'/><circle cx='32' cy='32' r='18' fill='%23fff'/><path d='M32 20l8 6-3 10h-10l-3-10z' fill='%2307190f'/><rect x='38' y='40' width='22' height='18' rx='5' fill='%23b4f03c'/><text x='49' y='54' font-family='Arial' font-weight='900' font-size='13' text-anchor='middle' fill='%230b2618'>11</text></svg>";
    const ligacaoIconeSite = document.createElement("link");
    ligacaoIconeSite.rel = "icon";
    ligacaoIconeSite.href = `data:image/svg+xml,${imagemVetorialIcone}`;
    document.head.appendChild(ligacaoIconeSite);
}

inserirIconeSite();

document.addEventListener("DOMContentLoaded", () => {
    renderizarCabecalho();
    renderizarRodape();
});
