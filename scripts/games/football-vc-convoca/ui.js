import { estado, totalConvocados, POSICOES, LIMITES, LABELS } from "./core.js";
import { obterOpcoesPorPosicao } from "./data.js";

// --- RENDERIZA TODOS OS GRUPOS DE POSIÇÃO COM SLOTS ---
export function renderizarGrupos(onSlotClick) {
    const container = document.getElementById("positionGroups");
    container.innerHTML = "";

    POSICOES.forEach(pos => {
        const limite = LIMITES[pos];
        const group = document.createElement("div");
        group.className = "position-group";
        group.id = `group-${pos}`;

        const preenchidos = estado.convocados[pos].length;

        group.innerHTML = `
            <div class="group-header">
                <h3>${LABELS[pos]}</h3>
                <span class="group-counter">${preenchidos}/${limite}</span>
            </div>
            <div class="slots-container" id="slots-${pos}"></div>
        `;

        const slotsDiv = group.querySelector(".slots-container");

        for (let i = 0; i < limite; i++) {
            const jogador = estado.convocados[pos][i];
            const slot = document.createElement("button");
            slot.className = "player-slot" + (jogador ? " filled" : "");
            slot.dataset.pos = pos;
            slot.dataset.index = i;

            if (jogador) {
                slot.innerHTML = `<span class="slot-name">${jogador}</span><span class="slot-remove" data-pos="${pos}" data-index="${i}"><i class="fas fa-xmark"></i></span>`;
            } else {
                slot.innerHTML = `<i class="fas fa-plus"></i><span class="slot-label">Escolher</span>`;
                slot.addEventListener("click", () => onSlotClick(pos));
            }

            slotsDiv.appendChild(slot);
        }

        container.appendChild(group);
    });
}

// --- ATUALIZA CONTADOR GERAL ---
export function atualizarContador() {
    document.getElementById("squadCount").textContent = totalConvocados();
    const btnConfirm = document.getElementById("btnConfirm");
    btnConfirm.disabled = totalConvocados() < 26;
}

// --- ABRE MODAL DE OPÇÕES PARA UMA POSIÇÃO ---
export function abrirModal(pos, onSelect) {
    const modal = document.getElementById("playerModal");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("modalPlayerList");

    title.textContent = `${LABELS[pos]} (${estado.convocados[pos].length}/${LIMITES[pos]})`;
    list.innerHTML = "";

    const opcoes = obterOpcoesPorPosicao(pos);
    const jaEscolhidos = Object.values(estado.convocados).flat();

    opcoes.forEach(nome => {
        const item = document.createElement("button");
        item.className = "modal-player-item";

        if (jaEscolhidos.includes(nome)) {
            item.classList.add("disabled");
            item.disabled = true;
            item.innerHTML = `<span>${nome}</span><i class="fas fa-check"></i>`;
        } else {
            item.innerHTML = `<span>${nome}</span>`;
            item.addEventListener("click", () => {
                onSelect(pos, nome);
                fecharModal();
            });
        }

        list.appendChild(item);
    });

    modal.classList.add("active");
}

// --- FECHA MODAL ---
export function fecharModal() {
    document.getElementById("playerModal").classList.remove("active");
}

// --- RENDERIZA TELA DE RESULTADOS ---
export function renderizarResultados(convocadosUsuario, convocadosOficiais) {
    const nomesOficiais = convocadosOficiais.map(j => j.nome);
    const nomesUsuario = Object.values(convocadosUsuario).flat();

    let acertos = 0;
    nomesUsuario.forEach(nome => {
        if (nomesOficiais.includes(nome)) {
            acertos++;
        }
    });

    document.getElementById("scoreNumber").textContent = acertos;

    // --- SUA CONVOCAÇÃO ---
    const yourDiv = document.getElementById("yourSquadResult");
    yourDiv.innerHTML = "";
    POSICOES.forEach(pos => {
        if (convocadosUsuario[pos].length === 0) {
            return;
        }

        const group = document.createElement("div");
        group.className = "result-group";
        group.innerHTML = `<h4>${LABELS[pos]}</h4><ul></ul>`;
        
        const ul = group.querySelector("ul");
        convocadosUsuario[pos].forEach(nome => {
            const li = document.createElement("li");
            li.textContent = nome;
            li.className = nomesOficiais.includes(nome) ? "correct" : "wrong";
            ul.appendChild(li);
        });
        yourDiv.appendChild(group);
    });

    // --- CONVOCAÇÃO OFICIAL ---
    const officialDiv = document.getElementById("officialSquadResult");
    officialDiv.innerHTML = "";
    POSICOES.forEach(pos => {
        const jogadores = convocadosOficiais.filter(j => j.posicao === pos);
        if (jogadores.length === 0) {
            return;
        }

        const group = document.createElement("div");
        group.className = "result-group";
        group.innerHTML = `<h4>${LABELS[pos]}</h4><ul></ul>`;

        const ul = group.querySelector("ul");
        jogadores.forEach(j => {
            const li = document.createElement("li");
            li.textContent = j.nome;
            li.className = nomesUsuario.includes(j.nome) ? "correct" : "missed";
            ul.appendChild(li);
        });
        officialDiv.appendChild(group);
    });
}
