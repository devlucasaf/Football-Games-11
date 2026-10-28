import estado from "./core.js";
import { carregarDados, escolherRodada, obterNomesJogadores } from "./data.js";
import { normalizarNomeJogador } from "./utils.js";
import {
    renderizarCartoesCompanheiros, revelarProximo, revelarTodos,
    mostrarResposta, reiniciarCartaoResposta,
    mostrarDica, esconderDica,
    atualizarPlacar, mostrarResultado, esconderResultado,
    limparCampoPalpite, focarCampoPalpite, desabilitarCampoPalpite, habilitarCampoPalpite,
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

    const respostaNormalizada = normalizarNomeJogador(estado.rodadaAtual.resposta);
    const palpiteNormalizado = normalizarNomeJogador(palpite);

    if (!palpiteNormalizado) {
        return;
    }

    estado.tentativas++;

    if (palpiteNormalizado === respostaNormalizada) {
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
        mostrarResposta(true);
        desabilitarCampoPalpite();
        atualizarPlacar();

        if (window.registrarVitoria) {
            window.registrarVitoria();
        }

        if (window.FG11Stats) {
            const indiceFaixaEstatistica = Math.min(Math.max(estado.companheirosRevelados - 1, 0), 4);
            window.FG11Stats.registrar("football-jogou-com", {
                venceu: true,
                bucket: indiceFaixaEstatistica,
                tamanho: 5
            });
        }

        setTimeout(() => {
            mostrarResultado(
                "Acertou!",
                `O jogador era ${estado.rodadaAtual.resposta}. +${pontosRodada} pontos! (${estado.companheirosRevelados} pista${estado.companheirosRevelados > 1 ? "s" : ""} usada${estado.companheirosRevelados > 1 ? "s" : ""})`,
                '<i class="fas fa-check-circle" style="color:#2ecc71"></i>'
            );
        }, 800);
    } else {
        if (estado.companheirosRevelados >= 5) {
            finalizarErro();
        } else {
            limparCampoPalpite();
            focarCampoPalpite();
        }
    }
}

function revelarProximaPista() {
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

    limparCampoPalpite();
    focarCampoPalpite();
}

function finalizarErro() {
    estado.jogoAtivo = false;
    estado.totalRodadas++;
    estado.sequencia = 0;

    revelarTodos();
    mostrarResposta(false);
    desabilitarCampoPalpite();
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
    reiniciarCartaoResposta();
    escolherRodada();
    renderizarCartoesCompanheiros();
    limparCampoPalpite();
    habilitarCampoPalpite();
    focarCampoPalpite();
    atualizarPlacar();
}

// --- AUTOCOMPLETE ---
function filtrarSugestoes(texto) {
    if (!texto || texto.length < 2) {
        esconderSugestoes();
        return;
    }

    const textoNormalizado = normalizarNomeJogador(texto);
    const nomes = obterNomesJogadores();
    const filtrados = nomes.filter(nome => normalizarNomeJogador(nome).includes(textoNormalizado));
    mostrarSugestoes(filtrados);
}

// --- CONFIGURAR EVENTOS ---
function configurarEventos() {
    const campoPalpite = document.getElementById("palpiteInput");
    const btnConfirmarPalpite = document.getElementById("btnConfirmarPalpite");
    const btnRevelarProximaPista = document.getElementById("btnRevelarProximaPista");
    const btnAvancarRodada = document.getElementById("btnAvancarRodada");
    const sugestoesLista = document.getElementById("sugestoesLista");

    // --- CONFIRMAR ---
    btnConfirmarPalpite.addEventListener("click", () => {
        verificarPalpite(campoPalpite.value);
    });

    // --- ENTER NO INPUT ---
    campoPalpite.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            verificarPalpite(campoPalpite.value);
        }
    });

    btnRevelarProximaPista.addEventListener("click", () => revelarProximaPista());
    btnAvancarRodada.addEventListener("click", () => proximaRodada());

    // --- AUTOCOMPLETE TYPING ---
    campoPalpite.addEventListener("input", () => {
        filtrarSugestoes(campoPalpite.value);
    });

    // --- CLICAR EM SUGESTÃO ---
    sugestoesLista.addEventListener("click", (evento) => {
        const item = evento.target.closest(".sugestao-item");
        if (item) {
            campoPalpite.value = item.textContent;
            esconderSugestoes();
            verificarPalpite(campoPalpite.value);
        }
    });

    // --- FECHAR SUGESTÕES AO CLICAR FORA ---
    document.addEventListener("click", (evento) => {
        if (!evento.target.closest(".input-wrapper")) {
            esconderSugestoes();
        }
    });
}

// --- INICIALIZAR ---
async function iniciar() {
    try {
        await carregarDados();
        escolherRodada();
        renderizarCartoesCompanheiros();
        atualizarPlacar();
        configurarEventos();
        focarCampoPalpite();
    } catch (erro) {
        console.error("Erro ao inicializar Football Jogou Com:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => iniciar());
