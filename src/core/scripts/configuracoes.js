// --- CONTROLES DA TELA DE CONFIGURAÇÕES ---
document.addEventListener("DOMContentLoaded", () => {
    inicializarBotoesIdioma();
    inicializarTamanhoFonte();
    inicializarReducaoAnimacoes();
    inicializarAcoesDados();
});

// --- IDIOMA ---
function inicializarBotoesIdioma() {
    const opcoesIdioma = document.querySelectorAll(".language-option");

    opcoesIdioma.forEach(opcao => {
        opcao.addEventListener("click", () => {
            const lingua = opcao.getAttribute("data-language");
            if (window.selecionarIdioma) {
                window.selecionarIdioma(lingua);
            }
        });
    });
}

// --- TAMANHO DA FONTE ---
function inicializarTamanhoFonte() {
    const grupoTamanhosFonte = document.getElementById("fontSizeGroup");
    if (!grupoTamanhosFonte) {
        return;
    }

    const botoesTamanhoFonte = grupoTamanhosFonte.querySelectorAll(".option-btn");
    const tamanhoFonteSalvo = localStorage.getItem("fg11_tamanho_fonte") || "medio";

    // --- MARCA O BOTÃO ATIVO ---
    function destacarTamanhoFonte(tamanho) {
        botoesTamanhoFonte.forEach(btnSelecionarTamanhoFonte => {
            btnSelecionarTamanhoFonte.classList.toggle("active", btnSelecionarTamanhoFonte.getAttribute("data-size") === tamanho);
        });
    }

    destacarTamanhoFonte(tamanhoFonteSalvo);

    botoesTamanhoFonte.forEach(btnSelecionarTamanhoFonte => {
        btnSelecionarTamanhoFonte.addEventListener("click", () => {
            const tamanho = btnSelecionarTamanhoFonte.getAttribute("data-size");
            localStorage.setItem("fg11_tamanho_fonte", tamanho);
            document.documentElement.setAttribute("data-font-size", tamanho);
            destacarTamanhoFonte(tamanho);
        });
    });
}

// --- REDUZIR ANIMAÇÕES ---
function inicializarReducaoAnimacoes() {
    const alternador = document.getElementById("reduceMotionToggle");
    if (!alternador) {
        return;
    }

    alternador.checked = localStorage.getItem("fg11_reduzir_animacoes") === "true";

    alternador.addEventListener("change", () => {
        let valor;
        if (alternador.checked) {
            valor = "true";
        } else {
            valor = "false";
        }

        localStorage.setItem("fg11_reduzir_animacoes", valor);
        document.documentElement.setAttribute("data-reduce-motion", valor);
    });
}

// --- DADOS E PROGRESSO ---
function inicializarAcoesDados() {
    const btnReativarTutoriais = document.getElementById("resetTutorialsBtn");
    const btnLimparDadosSalvos = document.getElementById("clearDataBtn");

    // --- REATIVAR TUTORIAIS ---
    if (btnReativarTutoriais) {
        btnReativarTutoriais.addEventListener("click", () => {
            const chaves = [];
            for (let indice = 0; indice < localStorage.length; indice++) {
                const chave = localStorage.key(indice);
                if (chave && chave.startsWith("tutorial_oculto_")) {
                    chaves.push(chave);
                }
            }
            chaves.forEach(chave => localStorage.removeItem(chave));
            exibirRetornoVisualBotao(btnReativarTutoriais);
        });
    }

    // --- LIMPAR TODOS OS DADOS ---
    if (btnLimparDadosSalvos) {
        btnLimparDadosSalvos.addEventListener("click", () => {
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

// --- RETORNO VISUAL TEMPORÁRIO NO BOTÃO ---
function exibirRetornoVisualBotao(btnConfirmarAcaoDados) {
    btnConfirmarAcaoDados.classList.add("done");
    setTimeout(() => btnConfirmarAcaoDados.classList.remove("done"), 1500);
}
