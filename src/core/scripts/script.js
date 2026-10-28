document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "light");
document.documentElement.setAttribute("data-reduce-motion", localStorage.getItem("fg11_reduzir_animacoes") === "true" ? "true" : "false");
document.documentElement.setAttribute("data-font-size", localStorage.getItem("fg11_tamanho_fonte") || "medio");

// --- TEXTO TRADUZIDO PARA CONTEÚDO GERADO VIA JS ---
function fg11Texto(chave, padrao) {
    const lingua = localStorage.getItem("preferredLanguage") || "traducoes";
    const linguas = window.translations || {};
    return (linguas[lingua] && linguas[lingua][chave]) || padrao;
}

// --- BOTÕES DE TEMA ---
function obterBotoesTema() {
    return document.querySelectorAll("#themeToggle, [data-theme-toggle]");
}

// --- APLICA O TEMA SALVO ---
function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", temaSalvo);

    obterBotoesTema().forEach(btnAlternarTema => atualizarIconeTema(temaSalvo, btnAlternarTema.querySelector("i")));
}

// --- ALTERNADOR DE TEMA ---
function inicializarAlternadorTema() {
    obterBotoesTema().forEach(btnAlternarTema => {
        btnAlternarTema.addEventListener("click", () => {
            const temaAtual = document.documentElement.getAttribute("data-theme");
            const novoTema = temaAtual === "light" ? "dark" : "light";

            document.documentElement.setAttribute("data-theme", novoTema);

            localStorage.setItem("theme", novoTema);

            obterBotoesTema().forEach(btnTema => atualizarIconeTema(novoTema, btnTema.querySelector("i")));

            const icone = btnAlternarTema.querySelector("i");
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
function atualizarIconeTema(tema, elementoIcone) {
    if (!elementoIcone) {
        return;
    }

    const btnAlternarTema = elementoIcone.parentElement;
    const rotulo = tema === "dark"
        ? fg11Texto("theme-to-light", "Alternar para tema claro")
        : fg11Texto("theme-to-dark", "Alternar para tema escuro");

    elementoIcone.className = tema === "dark" ? "fas fa-sun" : "fas fa-moon";
    btnAlternarTema.title = rotulo;
    btnAlternarTema.setAttribute("aria-label", rotulo);
    btnAlternarTema.setAttribute("aria-pressed", tema === "dark" ? "true" : "false");
}

// --- APLICA O IDIOMA SALVO ---
function aplicarIdiomaSalvo() {
    const idiomaSalvo = localStorage.getItem("preferredLanguage") || "traducoes";

    if (window.applyTranslation) {
        window.applyTranslation(idiomaSalvo);
    } else {
        setTimeout(() => {
            if (window.applyTranslation) {
                window.applyTranslation(idiomaSalvo);
            }
        }, 100);
    }

    atualizarExibicaoIdioma(idiomaSalvo);
}

// --- SELETOR DE IDIOMA ---
function inicializarSeletorIdioma() {
    const btnAlternarMenuIdiomas = document.getElementById("languageToggle");
    const menuIdiomas = document.getElementById("languageDropdown");
    const opcoesIdioma = document.querySelectorAll(".language-option");

    if (!btnAlternarMenuIdiomas || !menuIdiomas) {
        return;
    }

    // --- ABRE/FECHA O MENU DE IDIOMAS ---
    btnAlternarMenuIdiomas.addEventListener("click", (evento) => {
        evento.stopPropagation();
        menuIdiomas.classList.toggle("active");
    });
    
    // --- SELEÇÃO DE IDIOMA ---
    opcoesIdioma.forEach(opcao => {
        opcao.addEventListener("click", () => {
            const idioma = opcao.getAttribute("data-language");
            selecionarIdioma(idioma);
            menuIdiomas.classList.remove("active");
        });
    });
    
    // --- FECHA AO CLICAR FORA ---
    document.addEventListener("click", (evento) => {
        if (!evento.target.closest(".language-selector")) {
            menuIdiomas.classList.remove("active");
        }
    });
}

// --- APLICA O IDIOMA E SALVA A PREFERÊNCIA ---
function selecionarIdioma(idioma) {
    atualizarExibicaoIdioma(idioma);
    
    if (window.applyTranslation) {
        window.applyTranslation(idioma);
    } else {
        console.warn("Função de tradução não está disponível ainda");
        setTimeout(() => {
            if (window.applyTranslation) {
                window.applyTranslation(idioma);
            }
        }, 100);
    }
    
    localStorage.setItem("preferredLanguage", idioma);
}

// --- ATUALIZA A BANDEIRA E A OPÇÃO ATIVA ---
function atualizarExibicaoIdioma(idioma) {
    const bandeiraIdiomaAtual = document.getElementById("currentLanguageFlag");
    const opcoesIdioma = document.querySelectorAll(".language-option");

    opcoesIdioma.forEach(opcao => {
        const estaAtiva = opcao.getAttribute("data-language") === idioma;
        opcao.classList.toggle("active", estaAtiva);

        if (estaAtiva && bandeiraIdiomaAtual) {
            const bandeiraOpcao = opcao.querySelector("img");
            if (bandeiraOpcao) {
                bandeiraIdiomaAtual.src = bandeiraOpcao.getAttribute("src");
            }
        }
    });
}

// --- APLICA AS PREFERÊNCIAS DE ACESSIBILIDADE ---
function aplicarAcessibilidadeSalva() {
    const reduzirAnimacoes = localStorage.getItem("fg11_reduzir_animacoes") === "true";
    document.documentElement.setAttribute("data-reduce-motion", reduzirAnimacoes ? "true" : "false");

    const tamanhoFonte = localStorage.getItem("fg11_tamanho_fonte") || "medio";
    document.documentElement.setAttribute("data-font-size", tamanhoFonte);
}

// --- BUSCA DE JOGOS NO CABEÇALHO ---
function inicializarBuscaJogos() {
    const recipienteBusca = document.getElementById("headerSearch");
    const btnAlternarBuscaJogos = document.getElementById("btnSearchGames");
    const campoBusca = document.getElementById("searchGamesInput");

    if (!recipienteBusca || !btnAlternarBuscaJogos || !campoBusca) {
        return;
    }

    // --- AVISA A PÁGINA SOBRE O NOVO TERMO ---
    function emitirTermoBuscaJogos(termo) {
        document.dispatchEvent(new CustomEvent("fg11:busca", { detail: { termo, origem: "header" } }));
    }

    // --- ABRE/FECHA A BARRA DE BUSCA ---
    btnAlternarBuscaJogos.addEventListener("click", () => {
        const aberto = recipienteBusca.classList.toggle("open");
        btnAlternarBuscaJogos.setAttribute("aria-expanded", aberto ? "true" : "false");

        if (aberto) {
            campoBusca.focus();
            document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            campoBusca.value = "";
            emitirTermoBuscaJogos("");
        }
    });

    // --- FILTRA ENQUANTO DIGITA ---
    campoBusca.addEventListener("input", () => emitirTermoBuscaJogos(campoBusca.value));

    // --- FECHA COM A TECLA ESC ---
    campoBusca.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            campoBusca.value = "";
            emitirTermoBuscaJogos("");
            recipienteBusca.classList.remove("open");
            btnAlternarBuscaJogos.setAttribute("aria-expanded", "false");
            btnAlternarBuscaJogos.focus();
        }
    });
}

// --- TRANSIÇÃO SUAVE AO SAIR DA PÁGINA ---
function inicializarTransicoesPagina() {
    document.addEventListener("click", (evento) => {
        const ligacao = evento.target.closest("a[href]");
        if (!ligacao || evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) {
            return;
        }

        const reduzir = document.documentElement.getAttribute("data-reduce-motion") === "true"
            || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const destino = new URL(ligacao.href, window.location.href);
        const mesmaPagina = destino.pathname === window.location.pathname && destino.search === window.location.search;

        if (reduzir || ligacao.target === "_blank" || ligacao.hasAttribute("download") || mesmaPagina
            || destino.origin !== window.location.origin || !/^(https?|file):$/.test(destino.protocol)) {
            return;
        }

        evento.preventDefault();
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
    aplicarTemaSalvo();
    aplicarIdiomaSalvo();
    aplicarAcessibilidadeSalva();

    inicializarAlternadorTema();
    inicializarSeletorIdioma();
    inicializarPlacar();
    inicializarBuscaJogos();
    inicializarTransicoesPagina();
});

document.getElementById("btn-football-grid")?.addEventListener("click", function() {
    window.location.href = "src/games/football-grid/football-grid.html";
});

// --- ABRE O MODAL DE SELEÇÃO DE TIME ---
function abrirSelecaoTime() {
    document.getElementById("timeModal").style.display = "flex";
}

// --- FECHA O MODAL ---
function fecharModal() {
    document.getElementById("timeModal").style.display = "none";
}

// --- INICIA O GRID NO MODO ESCOLHIDO ---
function iniciarJogo(modo) {
    window.location.href = `src/games/football-grid/football-grid.html?time=${modo}`;
}

// --- FECHA O MODAL AO CLICAR FORA ---
window.onclick = function(evento) {
    const modal = document.getElementById("timeModal");
    if (modal && evento.target == modal) {
        fecharModal();
    }
}

// --- SISTEMA DE TUTORIAL ---
function inicializarTutorial() {
    const tutorial = document.getElementById("tutorialOverlay");
    if (!tutorial) {
        return;
    }

    const identificadorJogo = tutorial.dataset.game;
    if (!identificadorJogo) {
        return;
    }

    const chave = `tutorial_oculto_${identificadorJogo}`;

    const btnIniciarPartida = document.getElementById("tutorialStartBtn");
    const btnNaoMostrarTutorialNovamente = document.getElementById("tutorialSkipBtn");
    const btnAbrirTutorial = document.getElementById("tutorialHelpBtn");

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
        btnIniciarPartida?.focus();
    }

    // --- FECHA O TUTORIAL ---
    function fecharTutorial() {
        tutorial.classList.add("hidden");
        btnAbrirTutorial?.focus();
    }

    // --- NÃO MOSTRAR NOVAMENTE ---
    function ocultarTutorialNasProximasVisitas() {
        localStorage.setItem(chave, "true");
        fecharTutorial();
    }

    btnIniciarPartida?.addEventListener("click", fecharTutorial);
    btnNaoMostrarTutorialNovamente?.addEventListener("click", ocultarTutorialNasProximasVisitas);
    btnAbrirTutorial?.addEventListener("click", abrirTutorial);

    tutorial.addEventListener("click", (evento) => {
        if (evento.target === tutorial) {
            fecharTutorial();
        }
    });

    // --- FECHA COM A TECLA ESC ---
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !tutorial.classList.contains("hidden")) {
            fecharTutorial();
        }
    });

    if (localStorage.getItem(chave)) {
        tutorial.classList.add("hidden");
    } else {
        tutorial.classList.remove("hidden");
        setTimeout(() => btnIniciarPartida?.focus(), 50);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarTutorial();
});

// --- SISTEMA DE PLACAR GLOBAL ---
function inicializarPlacar() {
    atualizarPlacar();
}

// --- LÊ O PLACAR DO LOCALSTORAGE ---
function obterPlacar() {
    const vitorias = parseInt(localStorage.getItem("fg11_vitorias") || "0", 10);
    const derrotas = parseInt(localStorage.getItem("fg11_derrotas") || "0", 10);
    return { 
        vitorias, 
        derrotas 
    };
}

// --- REGISTRA UMA VITÓRIA ---
function registrarVitoria() {
    const placar = obterPlacar();
    placar.vitorias++;
    localStorage.setItem("fg11_vitorias", placar.vitorias.toString());
    atualizarPlacar();
}

// --- REGISTRA UMA DERROTA ---
function registrarDerrota() {
    const placar = obterPlacar();
    placar.derrotas++;
    localStorage.setItem("fg11_derrotas", placar.derrotas.toString());
    atualizarPlacar();
}

// --- ATUALIZA O PLACAR NA TELA ---
function atualizarPlacar() {
    const placar = obterPlacar();
    const elementosPlacar = document.querySelectorAll(".scoreboard .score");
    if (elementosPlacar.length >= 2) {
        elementosPlacar[0].textContent = placar.vitorias;
        elementosPlacar[1].textContent = placar.derrotas;
    }
}

// --- EXPÕE AS FUNÇÕES GLOBALMENTE ---
window.registrarVitoria = registrarVitoria;
window.registrarDerrota = registrarDerrota;
window.atualizarPlacar = atualizarPlacar;
window.obterPlacar = obterPlacar;
window.aplicarAcessibilidadeSalva = aplicarAcessibilidadeSalva;
window.selecionarIdioma = selecionarIdioma;
window.fg11Texto = fg11Texto;