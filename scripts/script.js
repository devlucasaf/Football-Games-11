function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    
    if (!themeToggle) {
        console.warn("Botão de tema não encontrado");
        return;
    }
    
    const themeIcon = themeToggle.querySelector("i");
    
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
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

// --- LANGUAGE SELECTOR ---
function initLanguageSelector() {
    const languageToggle        = document.getElementById("languageToggle");
    const languageDropdown      = document.getElementById("languageDropdown");
    const languageOptions       = document.querySelectorAll(".language-option");
    const currentLanguageFlag   = document.getElementById("currentLanguageFlag");
    
    if (!languageToggle || !languageDropdown) {
        console.warn("Seletor de idioma não encontrado");
        return;
    }
    
    const savedLanguage = localStorage.getItem("preferredLanguage") || "traducoes";
    updateLanguageDisplay(savedLanguage);
    selectLanguage(savedLanguage);
    
    languageToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        languageDropdown.classList.toggle("active");
    });
    
    languageOptions.forEach(option => {
        option.addEventListener("click", () => {
            const language = option.getAttribute("data-language");
            selectLanguage(language);
            languageDropdown.classList.remove("active");
        });
    });
    
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".language-selector")) {
            languageDropdown.classList.remove("active");
        }
    });
}

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

function updateLanguageDisplay(language) {
    const isSubpage = window.location.pathname.includes("/pages/");
    const prefix = isSubpage ? "../" : "";
    const flagImages = {
        "traducoes": prefix + "assets/br-flag-icon.png",
        "translations": prefix + "assets/us-flag-icon.png",
        "traducciones": prefix + "assets/es-flag-icon.png",
        "ubersetzungen": prefix + "assets/de-flag-icon.png"
    };
    
    const currentLanguageFlag = document.getElementById("currentLanguageFlag");
    const languageOptions = document.querySelectorAll(".language-option");
    
    if (currentLanguageFlag && flagImages[language]) {
        currentLanguageFlag.src = flagImages[language];
    }
    
    languageOptions.forEach(option => {
        if (option.getAttribute("data-language") === language) {
            option.classList.add("active");
        } else {
            option.classList.remove("active");
        }
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initLanguageSelector();
    initScoreboard();
    
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
    window.location.href = "pages/football-grid.html";
}); 

function openTimeSelection() {
    document.getElementById("timeModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("timeModal").style.display = "none";
}

function startGame(mode) {
    window.location.href = `pages/football-grid.html?time=${mode}`;
}

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

    const chave = `tutorial_visto_${gameId}`;

    if (localStorage.getItem(chave)) {
        tutorial.classList.add("hidden");
        return;
    }

    tutorial.classList.remove("hidden");

    const btnStart = document.getElementById("tutorialStartBtn");
    const btnSkip = document.getElementById("tutorialSkipBtn");

    function fecharTutorial() {
        localStorage.setItem(chave, "true");
        tutorial.classList.add("hidden");
    }

    btnStart?.addEventListener("click", fecharTutorial);
    btnSkip?.addEventListener("click", fecharTutorial);

    tutorial.addEventListener("click", (e) => {
        if (e.target === tutorial) {
            fecharTutorial();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTutorial();
});

// --- SISTEMA DE PLACAR GLOBAL ---
function initScoreboard() {
    atualizarPlacar();
}

function getScoreboard() {
    const vitorias = parseInt(localStorage.getItem("fg11_vitorias") || "0", 10);
    const derrotas = parseInt(localStorage.getItem("fg11_derrotas") || "0", 10);
    return { 
        vitorias, 
        derrotas 
    };
}

function registrarVitoria() {
    const score = getScoreboard();
    score.vitorias++;
    localStorage.setItem("fg11_vitorias", score.vitorias.toString());
    atualizarPlacar();
}

function registrarDerrota() {
    const score = getScoreboard();
    score.derrotas++;
    localStorage.setItem("fg11_derrotas", score.derrotas.toString());
    atualizarPlacar();
}

function atualizarPlacar() {
    const score = getScoreboard();
    const scoreElements = document.querySelectorAll(".scoreboard .score");
    if (scoreElements.length >= 2) {
        scoreElements[0].textContent = score.vitorias;
        scoreElements[1].textContent = score.derrotas;
    }
}

window.registrarVitoria = registrarVitoria;
window.registrarDerrota = registrarDerrota;
window.atualizarPlacar  = atualizarPlacar;
window.getScoreboard    = getScoreboard;