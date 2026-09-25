// --- APLICA TEMA E ACESSIBILIDADE O QUANTO ANTES (EVITA "PISCAR" O TEMA CLARO) ---
document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "light");
document.documentElement.setAttribute("data-reduce-motion", localStorage.getItem("fg11_reduzir_animacoes") === "true" ? "true" : "false");
document.documentElement.setAttribute("data-font-size", localStorage.getItem("fg11_tamanho_fonte") || "medio");

// --- TEXTO TRADUZIDO PARA CONTEÚDO GERADO VIA JS (ARIA, PLACEHOLDERS) ---
function fg11Texto(chave, padrao) {
    const lingua = localStorage.getItem("preferredLanguage") || "traducoes";
    const linguas = window.translations || {};
    return (linguas[lingua] && linguas[lingua][chave]) || padrao;
}

// --- BOTÕES DE TEMA (CABEÇALHO E TELA DE CONFIGURAÇÕES) ---
function obterBotoesTema() {
    return document.querySelectorAll("#themeToggle, [data-theme-toggle]");
}

// --- APLICA O TEMA SALVO ---
function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    obterBotoesTema().forEach(botao => updateThemeIcon(savedTheme, botao.querySelector("i")));
}

// --- ALTERNADOR DE TEMA ---
function initThemeToggle() {
    obterBotoesTema().forEach(themeToggle => {
        // --- ALTERNA O TEMA AO CLICAR ---
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "light" ? "dark" : "light";

            document.documentElement.setAttribute("data-theme", newTheme);

            localStorage.setItem("theme", newTheme);

            obterBotoesTema().forEach(botao => updateThemeIcon(newTheme, botao.querySelector("i")));

            const icone = themeToggle.querySelector("i");
            if (icone) {
                icone.style.transform = "rotate(180deg) scale(1.1)";
                setTimeout(() => {
                    icone.style.transform = "";
                }, 300);
            }
        });
    });
}

// --- ATUALIZA O ÍCONE DO TEMA ---
function updateThemeIcon(theme, iconElement) {
    if (!iconElement) {
        return;
    }

    const botao = iconElement.parentElement;
    const rotulo = theme === "dark"
        ? fg11Texto("theme-to-light", "Alternar para tema claro")
        : fg11Texto("theme-to-dark", "Alternar para tema escuro");

    iconElement.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    botao.title = rotulo;
    botao.setAttribute("aria-label", rotulo);
    botao.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

// --- APLICA O IDIOMA SALVO ---
function applySavedLanguage() {
    const savedLanguage = localStorage.getItem("preferredLanguage") || "traducoes";

    if (window.applyTranslation) {
        window.applyTranslation(savedLanguage);
    } else {
        setTimeout(() => {
            if (window.applyTranslation) {
                window.applyTranslation(savedLanguage);
            }
        }, 100);
    }

    updateLanguageDisplay(savedLanguage);
}

// --- SELETOR DE IDIOMA ---
function initLanguageSelector() {
    const languageToggle = document.getElementById("languageToggle");
    const languageDropdown = document.getElementById("languageDropdown");
    const languageOptions = document.querySelectorAll(".language-option");

    if (!languageToggle || !languageDropdown) {
        return;
    }

    // --- ABRE/FECHA O DROPDOWN ---
    languageToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        languageDropdown.classList.toggle("active");
    });
    
    // --- SELEÇÃO DE IDIOMA ---
    languageOptions.forEach(option => {
        option.addEventListener("click", () => {
            const language = option.getAttribute("data-language");
            selectLanguage(language);
            languageDropdown.classList.remove("active");
        });
    });
    
    // --- FECHA AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".language-selector")) {
            languageDropdown.classList.remove("active");
        }
    });
}

// --- APLICA O IDIOMA E SALVA A PREFERÊNCIA ---
function selectLanguage(language) {
    updateLanguageDisplay(language);
    
    if (window.applyTranslation) {
        window.applyTranslation(language);
    } else {
        console.warn("Função de tradução não está disponível ainda");
        setTimeout(() => {
            if (window.applyTranslation) {
                window.applyTranslation(language);
            }
        }, 100);
    }
    
    localStorage.setItem("preferredLanguage", language);
}

// --- ATUALIZA A BANDEIRA E A OPÇÃO ATIVA ---
function updateLanguageDisplay(language) {
    const currentLanguageFlag = document.getElementById("currentLanguageFlag");
    const languageOptions = document.querySelectorAll(".language-option");

    languageOptions.forEach(option => {
        const isActive = option.getAttribute("data-language") === language;
        option.classList.toggle("active", isActive);

        if (isActive && currentLanguageFlag) {
            const optionFlag = option.querySelector("img");
            if (optionFlag) {
                currentLanguageFlag.src = optionFlag.getAttribute("src");
            }
        }
    });
}

// --- APLICA AS PREFERÊNCIAS DE ACESSIBILIDADE ---
function applySavedAccessibility() {
    const reduzirAnimacoes = localStorage.getItem("fg11_reduzir_animacoes") === "true";
    document.documentElement.setAttribute("data-reduce-motion", reduzirAnimacoes ? "true" : "false");

    const tamanhoFonte = localStorage.getItem("fg11_tamanho_fonte") || "medio";
    document.documentElement.setAttribute("data-font-size", tamanhoFonte);
}

// --- BUSCA DE JOGOS NO CABEÇALHO ---
// --- O CABEÇALHO SÓ EMITE O TERMO; A HOME (home.js) FAZ A FILTRAGEM ---
function initGameSearch() {
    const container = document.getElementById("headerSearch");
    const botao = document.getElementById("btnSearchGames");
    const input = document.getElementById("searchGamesInput");

    if (!container || !botao || !input) {
        return;
    }

    // --- AVISA A PÁGINA SOBRE O NOVO TERMO ---
    function emitir(termo) {
        document.dispatchEvent(new CustomEvent("fg11:busca", { detail: { termo, origem: "header" } }));
    }

    // --- ABRE/FECHA A BARRA DE BUSCA ---
    botao.addEventListener("click", () => {
        const aberto = container.classList.toggle("open");
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");

        if (aberto) {
            input.focus();
            document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            input.value = "";
            emitir("");
        }
    });

    // --- FILTRA ENQUANTO DIGITA ---
    input.addEventListener("input", () => emitir(input.value));

    // --- FECHA COM A TECLA ESC ---
    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            input.value = "";
            emitir("");
            container.classList.remove("open");
            botao.setAttribute("aria-expanded", "false");
            botao.focus();
        }
    });
}

// --- TRANSIÇÃO SUAVE AO SAIR DA PÁGINA ---
function initPageTransitions() {
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
        }

        const reduzir = document.documentElement.getAttribute("data-reduce-motion") === "true"
            || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const destino = new URL(link.href, window.location.href);
        const mesmaPagina = destino.pathname === window.location.pathname && destino.search === window.location.search;

        if (reduzir || link.target === "_blank" || link.hasAttribute("download") || mesmaPagina
            || destino.origin !== window.location.origin || !/^(https?|file):$/.test(destino.protocol)) {
            return;
        }

        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => {
            window.location.href = destino.href;
        }, 160);
    });

    // --- RESTAURA A PÁGINA AO VOLTAR PELO HISTÓRICO (BFCACHE) ---
    window.addEventListener("pageshow", () => {
        document.body.classList.remove("is-leaving");
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    applySavedLanguage();
    applySavedAccessibility();

    initThemeToggle();
    initLanguageSelector();
    initScoreboard();
    initGameSearch();
    initPageTransitions();
});

document.getElementById("btn-football-grid")?.addEventListener("click", function() {
    window.location.href = "src/games/football-grid/football-grid.html";
});

// --- ABRE O MODAL DE SELEÇÃO DE TIME ---
function openTimeSelection() {
    document.getElementById("timeModal").style.display = "flex";
}

// --- FECHA O MODAL ---
function closeModal() {
    document.getElementById("timeModal").style.display = "none";
}

// --- INICIA O GRID NO MODO ESCOLHIDO ---
function startGame(mode) {
    window.location.href = `src/games/football-grid/football-grid.html?time=${mode}`;
}

// --- FECHA O MODAL AO CLICAR FORA ---
window.onclick = function(event) {
    const modal = document.getElementById("timeModal");
    if (modal && event.target == modal) {
        closeModal();
    }
}

// --- SISTEMA DE TUTORIAL ---
function initTutorial() {
    const tutorial = document.getElementById("tutorialOverlay");
    if (!tutorial) {
        return;
    }

    const gameId = tutorial.dataset.game;
    if (!gameId) {
        return;
    }

    const chave = `tutorial_oculto_${gameId}`;

    const btnStart = document.getElementById("tutorialStartBtn");
    const btnSkip = document.getElementById("tutorialSkipBtn");
    const btnHelp = document.getElementById("tutorialHelpBtn");

    // --- SEMÂNTICA DE DIÁLOGO PARA LEITORES DE TELA ---
    const caixa = tutorial.querySelector(".tutorial-box");
    const tituloTutorial = tutorial.querySelector(".tutorial-header h2");
    if (caixa) {
        caixa.setAttribute("role", "dialog");
        caixa.setAttribute("aria-modal", "true");
        if (tituloTutorial) {
            tituloTutorial.id = tituloTutorial.id || "tutorialTitulo";
            caixa.setAttribute("aria-labelledby", tituloTutorial.id);
        }
    }

    // --- ABRE O TUTORIAL ---
    function abrirTutorial() {
        tutorial.classList.remove("hidden");
        btnStart?.focus();
    }

    // --- FECHA O TUTORIAL ---
    function fecharTutorial() {
        tutorial.classList.add("hidden");
        btnHelp?.focus();
    }

    // --- NÃO MOSTRAR NOVAMENTE ---
    function naoMostrarNovamente() {
        localStorage.setItem(chave, "true");
        fecharTutorial();
    }

    btnStart?.addEventListener("click", fecharTutorial);
    btnSkip?.addEventListener("click", naoMostrarNovamente);
    btnHelp?.addEventListener("click", abrirTutorial);

    tutorial.addEventListener("click", (e) => {
        if (e.target === tutorial) {
            fecharTutorial();
        }
    });

    // --- FECHA COM A TECLA ESC ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !tutorial.classList.contains("hidden")) {
            fecharTutorial();
        }
    });

    if (localStorage.getItem(chave)) {
        tutorial.classList.add("hidden");
    } else {
        tutorial.classList.remove("hidden");
        setTimeout(() => btnStart?.focus(), 50);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initTutorial();
});

// --- SISTEMA DE PLACAR GLOBAL ---
function initScoreboard() {
    atualizarPlacar();
}

// --- LÊ O PLACAR DO LOCALSTORAGE ---
function getScoreboard() {
    const vitorias = parseInt(localStorage.getItem("fg11_vitorias") || "0", 10);
    const derrotas = parseInt(localStorage.getItem("fg11_derrotas") || "0", 10);
    return { 
        vitorias, 
        derrotas 
    };
}

// --- REGISTRA UMA VITÓRIA ---
function registrarVitoria() {
    const score = getScoreboard();
    score.vitorias++;
    localStorage.setItem("fg11_vitorias", score.vitorias.toString());
    atualizarPlacar();
}

// --- REGISTRA UMA DERROTA ---
function registrarDerrota() {
    const score = getScoreboard();
    score.derrotas++;
    localStorage.setItem("fg11_derrotas", score.derrotas.toString());
    atualizarPlacar();
}

// --- ATUALIZA O PLACAR NA TELA ---
function atualizarPlacar() {
    const score = getScoreboard();
    const scoreElements = document.querySelectorAll(".scoreboard .score");
    if (scoreElements.length >= 2) {
        scoreElements[0].textContent = score.vitorias;
        scoreElements[1].textContent = score.derrotas;
    }
}

// --- EXPÕE AS FUNÇÕES GLOBALMENTE ---
window.registrarVitoria = registrarVitoria;
window.registrarDerrota = registrarDerrota;
window.atualizarPlacar = atualizarPlacar;
window.getScoreboard = getScoreboard;
window.applySavedAccessibility = applySavedAccessibility;
window.selectLanguage = selectLanguage;
window.fg11Texto = fg11Texto;