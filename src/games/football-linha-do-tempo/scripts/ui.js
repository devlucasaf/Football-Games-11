import { estado } from "./core.js";

const elementosLinhaTempo = {
    rodadaAtual:    document.getElementById("rodadaAtual"),
    pontos:         document.getElementById("pontos"),
    tema:           document.getElementById("tema"),
    listaEventos:   document.getElementById("timelineList"),
    cartaoLinhaTempo:   document.getElementById("timelineCard"),
    resultadoRodada:    document.getElementById("roundResult"),
    pontuacaoRodada:     document.getElementById("roundScore"),
    ordemCorretaRodada:   document.getElementById("roundCorrect"),
    resultadoFinal:    document.getElementById("finalResult"),
    pontosFinais:    document.getElementById("finalPoints"),
    detalhesResultadoFinal:   document.getElementById("finalDetails"),
    informacoesJogo:       document.getElementById("gameInfo")
};

let eventoArrastado = null;

// --- RENDERIZAR LISTA DE EVENTOS ---
export function renderizarLista() {
    elementosLinhaTempo.listaEventos.innerHTML = "";
    estado.ordemAtual.forEach((evento, indiceEvento) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.draggable = true;
        item.dataset.indiceEvento = indiceEvento;

        item.innerHTML = `
            <span class="item-number">${indiceEvento + 1}</span>
            <span class="item-text">${evento.texto}</span>
            <div class="item-arrows">
                <button class="btn-up" data-indice-evento="${indiceEvento}" title="Mover para cima"><i class="fas fa-chevron-up"></i></button>
                <button class="btn-down" data-indice-evento="${indiceEvento}" title="Mover para baixo"><i class="fas fa-chevron-down"></i></button>
            </div>
        `;

        item.addEventListener("dragstart", (eventoArraste) => {
            eventoArrastado = item;
            item.classList.add("dragging");
            eventoArraste.dataTransfer.effectAllowed = "move";
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            eventoArrastado = null;
            document.querySelectorAll(".timeline-item").forEach(elementoEvento => elementoEvento.classList.remove("drag-over"));
        });

        item.addEventListener("dragover", (eventoArraste) => {
            eventoArraste.preventDefault();
            if (eventoArrastado && eventoArrastado !== item) {
                item.classList.add("drag-over");
            }
        });

        item.addEventListener("dragleave", () => {
            item.classList.remove("drag-over");
        });

        item.addEventListener("drop", (eventoSoltura) => {
            eventoSoltura.preventDefault();
            item.classList.remove("drag-over");
            if (!eventoArrastado || eventoArrastado === item) {
                return;
            }

            const indiceOrigem = parseInt(eventoArrastado.dataset.indiceEvento);
            const indiceDestino = parseInt(item.dataset.indiceEvento);
            const eventoMovido = estado.ordemAtual.splice(indiceOrigem, 1)[0];
            estado.ordemAtual.splice(indiceDestino, 0, eventoMovido);
            renderizarLista();
        });

        elementosLinhaTempo.listaEventos.appendChild(item);
    });

    elementosLinhaTempo.listaEventos.querySelectorAll(".btn-up").forEach(btnMoverEventoParaCima => {
        btnMoverEventoParaCima.addEventListener("click", (eventoClique) => {
            eventoClique.stopPropagation();
            const indiceEvento = parseInt(btnMoverEventoParaCima.dataset.indiceEvento);
            if (indiceEvento > 0) {
                [estado.ordemAtual[indiceEvento], estado.ordemAtual[indiceEvento - 1]] = [estado.ordemAtual[indiceEvento - 1], estado.ordemAtual[indiceEvento]];
                renderizarLista();
            }
        });
    });

    elementosLinhaTempo.listaEventos.querySelectorAll(".btn-down").forEach(btnMoverEventoParaBaixo => {
        btnMoverEventoParaBaixo.addEventListener("click", (eventoClique) => {
            eventoClique.stopPropagation();
            const indiceEvento = parseInt(btnMoverEventoParaBaixo.dataset.indiceEvento);
            if (indiceEvento < estado.ordemAtual.length - 1) {
                [estado.ordemAtual[indiceEvento], estado.ordemAtual[indiceEvento + 1]] = [estado.ordemAtual[indiceEvento + 1], estado.ordemAtual[indiceEvento]];
                renderizarLista();
            }
        });
    });
}

// --- ATUALIZAR RODADA ---
export function atualizarRodada() {
    elementosLinhaTempo.rodadaAtual.textContent = estado.rodadaAtual + 1;
}

// --- ATUALIZAR TEMA ---
export function atualizarTema(texto) {
    elementosLinhaTempo.tema.textContent = texto;
}

// --- ATUALIZAR PONTOS ---
export function atualizarPontos() {
    elementosLinhaTempo.pontos.textContent = estado.pontos;
}

// --- MOSTRAR CARD DA TIMELINE ---
export function mostrarCartaoLinhaTempo() {
    elementosLinhaTempo.cartaoLinhaTempo.classList.remove("hidden");
    elementosLinhaTempo.resultadoRodada.classList.add("hidden");
}

// --- MOSTRAR RESULTADO DA RODADA ---
export function mostrarResultadoRodada(corretos, ordemCorreta) {
    elementosLinhaTempo.cartaoLinhaTempo.classList.add("hidden");
    elementosLinhaTempo.resultadoRodada.classList.remove("hidden");

    elementosLinhaTempo.pontuacaoRodada.textContent = `${corretos}/5 na posição correta (+${corretos} pts)`;

    let html = "<div style='text-align: left; max-width: 500px; margin: 0 auto;'>";
    ordemCorreta.forEach((evento) => {
        html += `<div class="correct-order-item"><span class="year-badge">${evento.ano}</span> ${evento.texto}</div>`;
    });
    html += "</div>";
    elementosLinhaTempo.ordemCorretaRodada.innerHTML = html;

    if (estado.rodadaAtual >= estado.totalRodadas - 1) {
        document.getElementById("btnAvancarRodada").innerHTML = "<i class='fas fa-flag-checkered'></i> Ver Resultado";
    }
}

// --- MOSTRAR RESULTADO FINAL ---
export function mostrarFinal() {
    elementosLinhaTempo.cartaoLinhaTempo.classList.add("hidden");
    elementosLinhaTempo.resultadoRodada.classList.add("hidden");
    elementosLinhaTempo.informacoesJogo.classList.add("hidden");
    elementosLinhaTempo.resultadoFinal.classList.remove("hidden");
    elementosLinhaTempo.pontosFinais.textContent = estado.pontos;

    const pontuacaoMaxima = estado.totalRodadas * 5;
    const percentualAcertos = Math.round((estado.pontos / pontuacaoMaxima) * 100);
    let mensagemResultado = "";
    
    if (percentualAcertos >= 90) {
        mensagemResultado = "Historiador do futebol!";
    } else if (percentualAcertos >= 60) {
        mensagemResultado = "Boa memória cronológica!";
    } else if (percentualAcertos >= 40) {
        mensagemResultado = "Precisa estudar as datas!";
    } else {
        mensagemResultado = "Tente novamente!";
    }

    if (percentualAcertos >= 50) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }

    elementosLinhaTempo.detalhesResultadoFinal.innerHTMmensagemResultado `<p>${msg}</p><p>${estado.pontuacaoMaxima}/${maxPts} eventos na posição correta</p>`;

    if (window.FG11Stats) {
        const total = estado.totalRodadas;
        const venceu = percentualAcertos >= 50;
        const rotulos = Array.from({ length: total + 1 }, (valorIgnorado, indiceRodadasPerfeitas) => String(indiceRodadasPerfeitas));
        window.FG11Stats.registrar("football-linha-do-tempo", {
            venceu,
            bucket: estado.rodadasPerfeitas,
            tamanho: total + 1
        });
        
        window.FG11Stats.mostrarModal("football-linha-do-tempo", {
            venceu,
            titulo: "Fim de jogo!",
            resposta: `${estado.pontos}/${pontuacaoMaxima} eventos certos · ${estado.rodadasPerfeitas} rodadas perfeitas`,
            tamanho: total + 1,
            rotulos,
            tituloGrafico: "Rodadas perfeitas por partida",
            bucketAtual: estado.rodadasPerfeitas,
            onReiniciar: window.linhaTempoReiniciar,
            onHome: () => { window.location.href = "../../../index.html"; }
        });
    }
}

// --- RESETAR INTERFACE ---
export function reiniciarInterface() {
    elementosLinhaTempo.resultadoFinal.classList.add("hidden");
    elementosLinhaTempo.informacoesJogo.classList.remove("hidden");
    elementosLinhaTempo.pontos.textContent = "0";
}
