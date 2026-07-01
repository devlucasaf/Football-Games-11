// --- APLICA O TEMA SALVO ---
function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        updateThemeIcon(savedTheme, themeToggle.querySelector("i"));
    }
}

// --- ALTERNADOR DE TEMA ---
function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
        return;
    }

    const themeIcon = themeToggle.querySelector("i");

    // --- ALTERNA O TEMA AO CLICAR ---
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        
        localStorage.setItem("theme", newTheme);
        
        updateThemeIcon(newTheme, themeIcon);
        
        themeToggle.style.transform = "rotate(180deg) scale(1.1)";
        setTimeout(() => {
            themeToggle.style.transform = "rotate(0deg) scale(1)";
        }, 300);
    });
}

// --- ATUALIZA O ÍCONE DO TEMA ---
function updateThemeIcon(theme, iconElement) {
    if (!iconElement) {
        return;
    }
    
    if (theme === "dark") {
        iconElement.className = "fas fa-sun";
        iconElement.parentElement.title = "Alternar para tema claro";
    } else {
        iconElement.className = "fas fa-moon";
        iconElement.parentElement.title = "Alternar para tema escuro";
    }
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
    const languageToggle        = document.getElementById("languageToggle");
    const languageDropdown      = document.getElementById("languageDropdown");
    const languageOptions       = document.querySelectorAll(".language-option");

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

// --- BUSCA DE JOGOS ---
function initGameSearch() {
    const container = document.getElementById("headerSearch");
    const botao = document.getElementById("btnSearchGames");
    const input = document.getElementById("searchGamesInput");

    if (!container || !botao || !input) {
        return;
    }

    // --- FILTRA OS CARDS PELO TÍTULO E DESCRIÇÃO ---
    function filtrar(termo) {
        const busca = termo.trim().toLowerCase();
        const cards = document.querySelectorAll(".coming-soon-card");
        let visiveis = 0;

        cards.forEach(card => {
            const titulo = card.querySelector("h4")?.textContent.toLowerCase() || "";
            const descricao = card.querySelector("p")?.textContent.toLowerCase() || "";
            const combina = busca === "" || titulo.includes(busca) || descricao.includes(busca);

            card.style.display = combina ? "" : "none";
            if (combina) {
                visiveis++;
            }
        });

        atualizarMensagemVazia(visiveis === 0 && busca !== "");
    }

    // --- MOSTRA/OCULTA MENSAGEM ---
    function atualizarMensagemVazia(mostrar) {
        const grid = document.querySelector(".coming-soon-grid");
        if (!grid) {
            return;
        }

        let aviso = document.getElementById("searchNoResults");

        if (mostrar) {
            if (!aviso) {
                aviso = document.createElement("p");
                aviso.id = "searchNoResults";
                aviso.className = "search-no-results";
                aviso.setAttribute("data-key", "search-no-results");
                aviso.textContent = "Nenhum jogo encontrado.";
                grid.after(aviso);
            }
            aviso.style.display = "";
        } else if (aviso) {
            aviso.style.display = "none";
        }
    }

    // --- ABRE/FECHA A BARRA DE BUSCA ---
    botao.addEventListener("click", () => {
        const aberto = container.classList.toggle("open");

        if (aberto) {
            input.focus();
        } else {
            input.value = "";
            filtrar("");
        }
    });

    // --- FILTRA ENQUANTO DIGITA ---
    input.addEventListener("input", () => filtrar(input.value));

    // --- FECHA COM A TECLA ESC ---
    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            input.value = "";
            filtrar("");
            container.classList.remove("open");
        }
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
    
    const comingSoonCards = document.querySelectorAll(".coming-soon-card");
    comingSoonCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.2}s both`;
    });
    
    const gameCards = document.querySelectorAll(".game-card");
    gameCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.15}s both`;
    });
});

// --- FUNÇÃO AUXILIAR PARA ANIMAÇÕES ---
if (!document.querySelector("#fadeInUpAnimation")) {
    const style = document.createElement("style");
    style.id = "fadeInUpAnimation";
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

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

    // --- ABRE O TUTORIAL ---
    function abrirTutorial() {
        tutorial.classList.remove("hidden");
    }

    // --- FECHA O TUTORIAL ---
    function fecharTutorial() {
        tutorial.classList.add("hidden");
    }

    // --- NÃO MOSTRAR NOVAMENTE ---
    function naoMostrarNovamente() {
        localStorage.setItem(chave, "true");
        tutorial.classList.add("hidden");
    }

    btnStart?.addEventListener("click", fecharTutorial);
    btnSkip?.addEventListener("click", naoMostrarNovamente);
    btnHelp?.addEventListener("click", abrirTutorial);

    tutorial.addEventListener("click", (e) => {
        if (e.target === tutorial) {
            fecharTutorial();
        }
    });

    if (localStorage.getItem(chave)) {
        tutorial.classList.add("hidden");
    } else {
        tutorial.classList.remove("hidden");
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