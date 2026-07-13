import estado from "./core.js";
import { carregarDados, escolherRodada, obterNomesJogadores } from "./data.js";
import { normalizar } from "./utils.js";
import {
    renderizarCards, revelarProximo, revelarTodos,
    mostrarResposta, resetarRespostaCard,
    mostrarDica, esconderDica,
    atualizarPlacar, mostrarResultado, esconderResultado,
    limparInput, focarInput, desabilitarInput, habilitarInput,
    mostrarSugestoes, esconderSugestoes
} from "./ui.js";

// --- CALCULAR PONTOS DA RODADA ---
function calcularPontos() {
    const base = 6 - estado.companheirosRevelados; 
    return Math.max(base, 1);
}

// --- VERIFICAR PALPITE ---
function verificarPalpite(palpite) {
    if (!estado.jogoAtivo) {
        return;
    }

    const respostaNorm = normalizar(estado.rodadaAtual.resposta);
    const palpiteNorm = normalizar(palpite);

    if (!palpiteNorm) {
        return;
    }

    estado.tentativas++;

    if (palpiteNorm === respostaNorm) {
        estado.jogoAtivo = false;
        estado.acertos++;
        estado.totalRodadas++;
        estado.sequencia++;
        if (estado.sequencia > estado.melhorSequencia) {
            estado.melhorSequencia = estado.sequencia;
        }
        const pts = calcularPontos();
        estado.pontos += pts;

        revelarTodos();
        mostrarResposta(true);
        desabilitarInput();
        atualizarPlacar();

        if (window.registrarVitoria) {
            window.registrarVitoria();
        }

        if (window.FG11Stats) {
            const bucket = Math.min(Math.max(estado.companheirosRevelados - 1, 0), 4);
            window.FG11Stats.registrar("football-jogou-com", {
                venceu: true,
                bucket,
                tamanho: 5
            });
        }

        setTimeout(() => {
            mostrarResultado(
                "Acertou!",
                `O jogador era ${estado.rodadaAtual.resposta}. +${pts} pontos! (${estado.companheirosRevelados} pista${estado.companheirosRevelados > 1 ? "s" : ""} usada${estado.companheirosRevelados > 1 ? "s" : ""})`,
                '<i class="fas fa-check-circle" style="color:#2ecc71"></i>'
            );
        }, 800);
    } else {
        if (estado.companheirosRevelados >= 5) {
            finalizarErro();
        } else {
            limparInput();
            focarInput();
        }
    }
}

function pular() {
    if (!estado.jogoAtivo) {
        return;
    }

    const revelou = revelarProximo();

    if (!revelou) {
        mostrarDica();
        return;
    }

    if (estado.companheirosRevelados >= 4) {
        mostrarDica();
    }

    limparInput();
    focarInput();
}

function finalizarErro() {
    estado.jogoAtivo = false;
    estado.totalRodadas++;
    estado.sequencia = 0;

    revelarTodos();
    mostrarResposta(false);
    desabilitarInput();
    atualizarPlacar();

    if (window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-jogou-com", {
            venceu: false,
            tamanho: 5
        });
    }

    setTimeout(() => {
        mostrarResultado(
            "Não foi dessa vez!",
            `O jogador era ${estado.rodadaAtual.resposta}.`,
            '<i class="fas fa-times-circle" style="color:#e74c3c"></i>'
        );
        if (window.FG11Stats) {
            window.FG11Stats.mostrarModal("football-jogou-com", {
                venceu: false,
                titulo: "Fim da sequência!",
                resposta: `O jogador era ${estado.rodadaAtual.resposta} · melhor sequência: ${estado.melhorSequencia}`,
                tamanho: 5,
                rotulos: ["1", "2", "3", "4", "5"],
                tituloGrafico: "Vitórias por pistas usadas",
                bucketAtual: -1,
                onReiniciar: proximaRodada,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }
    }, 800);
}

// --- PRÓXIMA RODADA ---
function proximaRodada() {
    esconderResultado();
    esconderDica();
    resetarRespostaCard();
    escolherRodada();
    renderizarCards();
    limparInput();
    habilitarInput();
    focarInput();
    atualizarPlacar();
}

// --- AUTOCOMPLETE ---
function filtrarSugestoes(texto) {
    if (!texto || texto.length < 2) {
        esconderSugestoes();
        return;
    }

    const norm = normalizar(texto);
    const nomes = obterNomesJogadores();
    const filtrados = nomes.filter(n => normalizar(n).includes(norm));
    mostrarSugestoes(filtrados);
}

// --- CONFIGURAR EVENTOS ---
function configurarEventos() {
    const input = document.getElementById("palpiteInput");
    const confirmarBtn = document.getElementById("confirmarBtn");
    const pularBtn = document.getElementById("pularBtn");
    const proximaBtn = document.getElementById("proximaRodadaBtn");
    const sugestoesLista = document.getElementById("sugestoesLista");

    // --- CONFIRMAR ---
    confirmarBtn.addEventListener("click", () => {
        verificarPalpite(input.value);
    });

    // --- ENTER NO INPUT ---
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            verificarPalpite(input.value);
        }
    });

    pularBtn.addEventListener("click", () => pular());
    proximaBtn.addEventListener("click", () => proximaRodada());

    // --- AUTOCOMPLETE TYPING ---
    input.addEventListener("input", () => {
        filtrarSugestoes(input.value);
    });

    // --- CLICAR EM SUGESTÃO ---
    sugestoesLista.addEventListener("click", (e) => {
        const item = e.target.closest(".sugestao-item");
        if (item) {
            input.value = item.textContent;
            esconderSugestoes();
            verificarPalpite(input.value);
        }
    });

    // --- FECHAR SUGESTÕES AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            esconderSugestoes();
        }
    });
}

// --- INICIALIZAR ---
async function iniciar() {
    try {
        await carregarDados();
        escolherRodada();
        renderizarCards();
        atualizarPlacar();
        configurarEventos();
        focarInput();
    } catch (erro) {
        console.error("Erro ao inicializar Football Jogou Com:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => iniciar());
