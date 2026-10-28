import estado from "./core.js";
import { carregarDados, escolherJogador, obterNomesJogadores } from "./data.js";
import { normalizar } from "./utils.js";
import {
    preencherPistas, reiniciarCartoesPistas, revelarCartaoPista, revelarTodos,
    atualizarContador, atualizarPlacar,
    mostrarResultado, esconderResultado,
    mostrarFeedbackErro, esconderFeedbackErro,
    limparCampoPalpite, focarCampoPalpite, desabilitarCampoPalpite, habilitarCampoPalpite,
    mostrarSugestoes, esconderSugestoes
} from "./ui.js";

// --- CALCULAR PONTOS ---
function calcularPontos() {
    return Math.max(7 - estado.pistasReveladas, 1);
}

// --- VERIFICAR PALPITE ---
function verificarPalpite(palpite) {
    if (!estado.jogoAtivo) {
        return;
    }

    const respostaNormalizada = normalizar(estado.jogadorAtual.nome);
    const palpiteNormalizado = normalizar(palpite);

    if (!palpiteNormalizado) {
        return;
    }

    estado.tentativas++;

    if (palpiteNormalizado === respostaNormalizada) {
        const pistasNaVitoria = estado.pistasReveladas;
        estado.jogoAtivo = false;
        estado.acertos++;
        estado.totalRodadas++;
        estado.sequencia++;
        if (estado.sequencia > estado.melhorSequencia) {
            estado.melhorSequencia = estado.sequencia;
        }

        const pontosRodada = calcularPontos();
        estado.pontos += pontosRodada;

        revelarTodos();
        desabilitarCampoPalpite();
        esconderFeedbackErro();
        atualizarPlacar();

        if (window.registrarVitoria) {
            window.registrarVitoria();
        }

        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-adivinha-jogador", {
                venceu: true,
                bucket: pistasNaVitoria - 1,
                tamanho: 6
            });
        }

        setTimeout(() => {
            mostrarResultado(
                "Acertou!",
                `O jogador era ${estado.jogadorAtual.nome}! +${pontosRodada} pontos (${estado.pistasReveladas} pista${estado.pistasReveladas > 1 ? "s" : ""}).`,
                "<i class='fas fa-check-circle' style='color:#2ecc71'></i>"
            );
            
            if (window.FG11Stats) {
                window.FG11Stats.mostrarModal("football-adivinha-jogador", {
                    venceu: true,
                    titulo: "Acertou!",
                    resposta: `O jogador era ${estado.jogadorAtual.nome}`,
                    tamanho: 6,
                    rotulos: ["1", "2", "3", "4", "5", "6"],
                    tituloGrafico: "Vitórias por pistas reveladas",
                    bucketAtual: pistasNaVitoria - 1,
                    onReiniciar: proximaRodada,
                    onHome: () => { window.location.href = "../../../index.html"; }
                });
            }
        }, 600);
    } else {
        if (estado.pistasReveladas >= 6) {
            finalizarErro();
        } else {
            mostrarFeedbackErro("Não é esse! Tente novamente ou revele mais pistas.");
            limparCampoPalpite();
            focarCampoPalpite();
        }
    }
}

// --- FINALIZAR COM ERRO ---
function finalizarErro() {
    estado.jogoAtivo = false;
    estado.totalRodadas++;
    estado.sequencia = 0;

    revelarTodos();
    desabilitarCampoPalpite();
    esconderFeedbackErro();
    atualizarPlacar();

    if (window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-adivinha-jogador", {
            venceu: false,
            tamanho: 6
        });
    }

    setTimeout(() => {
        mostrarResultado(
            "Não foi dessa vez!",
            `O jogador era ${estado.jogadorAtual.nome}.`,
            "<i class='fas fa-times-circle' style='color:#e74c3c'></i>"
        );
        if (window.FG11Stats) {
            window.FG11Stats.mostrarModal("football-adivinha-jogador", {
                venceu: false,
                titulo: "Não foi dessa vez!",
                resposta: `O jogador era ${estado.jogadorAtual.nome}`,
                tamanho: 6,
                rotulos: ["1", "2", "3", "4", "5", "6"],
                tituloGrafico: "Vitórias por pistas reveladas",
                bucketAtual: -1,
                onReiniciar: proximaRodada,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }
    }, 600);
}

// --- PRÓXIMA RODADA ---
function proximaRodada() {
    esconderResultado();
    esconderFeedbackErro();
    escolherJogador();
    preencherPistas();
    reiniciarCartoesPistas();
    atualizarContador();
    limparCampoPalpite();
    habilitarCampoPalpite();
    focarCampoPalpite();
    atualizarPlacar();
}

// --- FILTRAR SUGESTÕES DO AUTOCOMPLETE ---
function filtrarSugestoes(texto) {
    if (!texto || texto.length < 2) {
        esconderSugestoes();
        return;
    }

    const textoNormalizado = normalizar(texto);
    const nomes = obterNomesJogadores();
    const filtrados = nomes.filter(nomeJogador => normalizar(nomeJogador).includes(textoNormalizado));
    mostrarSugestoes(filtrados);
}

// --- CLIQUE NO CARD DE PISTA ---
function tratarCliqueCartaoPista(eventoClique) {
    if (!estado.jogoAtivo) {
        return;
    }

    const cartaoPista = eventoClique.target.closest(".pista-card");
    if (!cartaoPista || !cartaoPista.classList.contains("oculto")) {
        return;
    }

    const indicePista = parseInt(cartaoPista.dataset.idx);
    revelarCartaoPista(indicePista);
}

// --- CONFIGURAR EVENTOS ---
let sugestaoAtiva = -1;

// --- ATUALIZA O ITEM DESTACADO NA NAVEGAÇÃO POR TECLADO ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, indiceSugestao) => item.classList.toggle("ativo", indiceSugestao === sugestaoAtiva));
    if (itens[sugestaoAtiva]) {
        itens[sugestaoAtiva].scrollIntoView({ block: "nearest" });
    }
}

function configurarEventos() {
    const input = document.getElementById("palpiteInput");
    const btnConfirmarPalpite = document.getElementById("btnConfirmarPalpite");
    const btnIniciarProximaRodada = document.getElementById("btnIniciarProximaRodada");
    const sugestoesLista = document.getElementById("sugestoesLista");
    const pistasGrid = document.getElementById("pistasGrid");

    btnConfirmarPalpite.addEventListener("click", () => {
        verificarPalpite(input.value);
    });

    input.addEventListener("keydown", (e) => {
        const itens = [...document.querySelectorAll("#sugestoesLista .sugestao-item")];

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva + 1) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (itens.length) {
                sugestaoAtiva = (sugestaoAtiva - 1 + itens.length) % itens.length;
                atualizarSugestaoAtiva(itens);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (sugestaoAtiva >= 0 && itens[sugestaoAtiva]) {
                input.value = itens[sugestaoAtiva].textContent;
                esconderSugestoes();
                sugestaoAtiva = -1;
                verificarPalpite(input.value);
            } else {
                verificarPalpite(input.value);
            }
        } else if (e.key === "Escape") {
            esconderSugestoes();
            sugestaoAtiva = -1;
        }
    });

    btnIniciarProximaRodada.addEventListener("click", () => proximaRodada());

    input.addEventListener("input", () => {
        sugestaoAtiva = -1;
        filtrarSugestoes(input.value);
    });

    sugestoesLista.addEventListener("click", (e) => {
        const item = e.target.closest(".sugestao-item");
        if (item) {
            input.value = item.textContent;
            esconderSugestoes();
            sugestaoAtiva = -1;
            verificarPalpite(input.value);
        }
    });

    pistasGrid.addEventListener("click", tratarCliqueCartaoPista);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            esconderSugestoes();
            sugestaoAtiva = -1;
        }
    });
}

// --- INICIALIZAR ---
async function iniciar() {
    try {
        await carregarDados();
        escolherJogador();
        preencherPistas();
        reiniciarCartoesPistas();
        atualizarContador();
        atualizarPlacar();
        configurarEventos();
        focarCampoPalpite();
    } catch (erro) {
        console.error("Erro ao inicializar Football Adivinha Jogador:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => iniciar());
