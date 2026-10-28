import estado from "./core.js";
import { normalizarTexto } from "./utils.js";
import { carregarDados, escolherLista } from "./data.js";
import {
    renderizarTema,
    renderizarLista,
    revelarItem,
    revelarTodos,
    atualizarPlacar,
    mostrarRetornoPalpite,
    mostrarResultado,
    fecharResultado,
    inicializarSugestoes,
    limparCampoPalpite,
    focarCampoPalpite,
    desabilitarCampoPalpite,
    habilitarCampoPalpite
} from "./ui.js";

// --- REFERÊNCIAS AOS ELEMENTOS DOM ---
const btnConfirmarPalpite = document.getElementById("confirmarBtn");
const btnDesistirRodada = document.getElementById("desistirBtn");
const btnProximaRodada = document.getElementById("proximaRodadaBtn");
const campoPalpite = document.getElementById("palpiteInput");

// --- INÍCIO DE UMA NOVA RODADA ---
function iniciarRodada() {
    const lista = escolherLista();

    estado.acertosRodada = 0;
    estado.vidas = 3;
    estado.jogoAtivo = true;
    estado.itensAcertados = new Set();
    estado.totalRodadas++;

    renderizarTema(lista);
    renderizarLista(lista);
    atualizarPlacar();
    habilitarCampoPalpite();
    limparCampoPalpite();
    focarCampoPalpite();
    fecharResultado();
}

// --- VERIFICAÇÃO DO PALPITE DO USUÁRIO ---
function verificarPalpite() {
    if (!estado.jogoAtivo) {
        return;                                          
    }

    const valor = campoPalpite.value.trim();
    if (!valor) {
        return;                                          
    }

    const valorNormalizado = normalizarTexto(valor);
    const itens  = estado.listaAtual.itens;

    const indicesCorrespondentes = [];
    itens.forEach((item, indiceItem) => {
        if (estado.itensAcertados.has(indiceItem)) {
            return;                                      
        }

        if (normalizarTexto(item.nome) === valorNormalizado) {
            indicesCorrespondentes.push(indiceItem);
        }
    });

    if (indicesCorrespondentes.length > 0) {
        indicesCorrespondentes.forEach(indiceItem => {
            estado.itensAcertados.add(indiceItem);
            estado.acertosRodada++;
            revelarItem(indiceItem);
        });

        const pontosGanhos = 10 * indicesCorrespondentes.length;
        estado.pontosTotal += pontosGanhos;

        atualizarPlacar();
        mostrarRetornoPalpite("acerto", `Acertou! +${pontosGanhos} pts`);
        limparCampoPalpite();
        focarCampoPalpite();

        if (estado.acertosRodada >= itens.length) {
            const bonus = 20;
            estado.pontosTotal += bonus;
            atualizarPlacar();
            finalizarRodada();
        }
    } else {
        estado.vidas--;
        atualizarPlacar();
        mostrarRetornoPalpite("erro", `Errou! Vidas restantes: ${estado.vidas}`);
        limparCampoPalpite();
        focarCampoPalpite();

        if (estado.vidas <= 0) {
            revelarTodos();                              
            finalizarRodada();
        }
    }
}

// --- FUNÇÃO PARA DESISTIR DA RODADA ---
function desistirRodada() {
    if (!estado.jogoAtivo) {
        return;
    }
    revelarTodos();
    finalizarRodada();
}

// --- FINALIZAÇÃO DA RODADA ---
function finalizarRodada() {
    estado.jogoAtivo = false;
    desabilitarCampoPalpite();

    const total = estado.listaAtual.itens.length;
    const acertos = estado.acertosRodada;
    const pontos = acertos * 10 + (acertos === total ? 20 : 0);

    if (acertos === total) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    mostrarResultado(acertos, total, pontos);

    if (window.FG11Stats) {
        const venceu = acertos >= Math.ceil(total / 2);
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceAcertos) => String(indiceAcertos));
        window.FG11Stats.registrar("football-top10", {
            venceu,
            bucket: acertos,
            tamanho: total + 1
        });
        
        window.FG11Stats.mostrarModal("football-top10", {
            venceu,
            titulo: acertos === total ? "Lista completa!" : "Fim da rodada!",
            resposta: `Você encontrou ${acertos} de ${total} · ${pontos} pontos`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Acertos por lista",
            bucketAtual: acertos,
            onReiniciar: iniciarRodada,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- EVENTOS DOS BOTÕES ---
btnConfirmarPalpite.addEventListener("click", verificarPalpite);

// --- EVENTO DE TECLA ENTER NO INPUT ---
const listaSugestoes = document.getElementById("sugestoesLista");
campoPalpite.addEventListener("keydown", (eventoTeclado) => {
    if (eventoTeclado.key === "Enter") {
        const temSugestaoAtiva = listaSugestoes.querySelector(".sugestao-item.ativa");
        if (!temSugestaoAtiva) {
            eventoTeclado.preventDefault();
            verificarPalpite();
        }
    }
});

btnDesistirRodada.addEventListener("click", desistirRodada);

btnProximaRodada.addEventListener("click", iniciarRodada);

inicializarSugestoes(verificarPalpite);

// --- INICIALIZAÇÃO DO JOGO ---
async function inicializarJogoListaDez() {
    await carregarDados();
    iniciarRodada();
}

inicializarJogoListaDez();