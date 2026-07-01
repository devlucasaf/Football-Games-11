// --- CONTROLES DA TELA DE CONFIGURAÇÕES ---
document.addEventListener("DOMContentLoaded", () => {
    initLanguageButtons();
    initFontSize();
    initReduceMotion();
    initDataActions();
});

// --- IDIOMA ---
function initLanguageButtons() {
    const opcoes = document.querySelectorAll(".language-option");

    opcoes.forEach(opcao => {
        opcao.addEventListener("click", () => {
            const lingua = opcao.getAttribute("data-language");
            if (window.selectLanguage) {
                window.selectLanguage(lingua);
            }
        });
    });
}

// --- TAMANHO DA FONTE ---
function initFontSize() {
    const grupo = document.getElementById("fontSizeGroup");
    if (!grupo) {
        return;
    }

    const botoes = grupo.querySelectorAll(".option-btn");
    const salvo = localStorage.getItem("fg11_tamanho_fonte") || "medio";

    // --- MARCA O BOTÃO ATIVO ---
    function destacar(tamanho) {
        botoes.forEach(botao => {
            botao.classList.toggle("active", botao.getAttribute("data-size") === tamanho);
        });
    }

    destacar(salvo);

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            const tamanho = botao.getAttribute("data-size");
            localStorage.setItem("fg11_tamanho_fonte", tamanho);
            document.documentElement.setAttribute("data-font-size", tamanho);
            destacar(tamanho);
        });
    });
}

// --- REDUZIR ANIMAÇÕES ---
function initReduceMotion() {
    const toggle = document.getElementById("reduceMotionToggle");
    if (!toggle) {
        return;
    }

    toggle.checked = localStorage.getItem("fg11_reduzir_animacoes") === "true";

    toggle.addEventListener("change", () => {
        localStorage.setItem("fg11_reduzir_animacoes", toggle.checked ? "true" : "false");
        document.documentElement.setAttribute("data-reduce-motion", toggle.checked ? "true" : "false");
    });
}

// --- DADOS E PROGRESSO ---
function initDataActions() {
    const botaoTutoriais = document.getElementById("resetTutorialsBtn");
    const botaoLimpar = document.getElementById("clearDataBtn");

    // --- REATIVAR TUTORIAIS ---
    if (botaoTutoriais) {
        botaoTutoriais.addEventListener("click", () => {
            const chaves = [];
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && chave.startsWith("tutorial_oculto_")) {
                    chaves.push(chave);
                }
            }
            chaves.forEach(chave => localStorage.removeItem(chave));
            darFeedback(botaoTutoriais);
        });
    }

    // --- LIMPAR TODOS OS DADOS ---
    if (botaoLimpar) {
        botaoLimpar.addEventListener("click", () => {
            const confirmar = window.confirm(
                "Isso vai apagar placar, preferências e progresso salvos. Deseja continuar?"
            );
            if (confirmar) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }
}

// --- FEEDBACK VISUAL TEMPORÁRIO NO BOTÃO ---
function darFeedback(botao) {
    botao.classList.add("done");
    setTimeout(() => botao.classList.remove("done"), 1500);
}
