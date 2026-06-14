import { estado, totalConvocados } from "./core.js";
import { obterOpcoes } from "./data.js";

// --- NORMALIZAR PARA BUSCA ---
function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- ATUALIZA CONTADORES VISUAIS ---
export function atualizarUI() {
    document.getElementById("squadCount").textContent = totalConvocados();
    ["GOL", "DEF", "MEI", "ATA"].forEach(pos => {
        const count = estado.convocados[pos].length;
        const limite = estado.limites[pos];
        document.getElementById(`count${pos}`).textContent = count;

        // --- ATUALIZA HEADER DO GRUPO ---
        const group  = document.getElementById(`group${pos}`);
        const h3     = group.querySelector("h3");
        const labels = { 
            GOL: "Goleiros", 
            DEF: "Defensores", 
            MEI: "Meio-campistas", 
            ATA: "Atacantes" 
        };
        const icons = { 
            GOL: "fa-hands", 
            DEF: "fa-shield-halved", 
            MEI: "fa-arrows-turn-to-dots", 
            ATA: "fa-crosshairs" 
        };
        h3.innerHTML = `<i class="fas ${icons[pos]}"></i> ${labels[pos]} (${count}/${limite})`;

        const btn = document.querySelector(`.pos-btn[data-pos="${pos}"]`);
        if (count >= limite) {
            btn.classList.add("full");
        } else {
            btn.classList.remove("full");
        }
    });

    // --- BOTÃO CONFIRMAR ---
    const btnConfirm = document.getElementById("btnConfirm");
    btnConfirm.disabled = totalConvocados() < 26;
}

// --- RENDERIZA LISTA DE JOGADORES POR POSIÇÃO ---
export function renderizarListas() {
    ["GOL", "DEF", "MEI", "ATA"].forEach(pos => {
        const ul = document.getElementById(`list${pos}`);
        ul.innerHTML = "";
        estado.convocados[pos].forEach(nome => {
            const li = document.createElement("li");
            li.innerHTML = `${nome} <button class="btn-remove" data-pos="${pos}" data-nome="${nome}"><i class="fas fa-xmark"></i></button>`;
            ul.appendChild(li);
        });
    });
}

// --- AUTOCOMPLETE ---
export function configurarAutocomplete(onSelect) {
    const input = document.getElementById("playerInput");
    const list = document.getElementById("autocompleteList");
    let highlightIndex = -1;

    input.addEventListener("input", () => {
        const val = normalizar(input.value.trim());
        list.innerHTML = "";
        highlightIndex = -1;

        if (val.length < 2) {
            list.classList.remove("active");
            return;
        }

        const opcoes = obterOpcoes();
        const todosConvocados = Object.values(estado.convocados).flat();
        const filtrados = opcoes.filter(nome =>
            normalizar(nome).includes(val) && !todosConvocados.includes(nome)
        ).slice(0, 8);

        if (filtrados.length === 0) {
            list.classList.remove("active");
            return;
        }

        filtrados.forEach(nome => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = nome;
            div.addEventListener("click", () => {
                onSelect(nome);
                input.value = "";
                list.classList.remove("active");
            });
            list.appendChild(div);
        });
        list.classList.add("active");
    });

    input.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll(".autocomplete-item");
        if (!items.length) {
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
            items.forEach((it, i) => it.classList.toggle("highlighted", i === highlightIndex));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            highlightIndex = Math.max(highlightIndex - 1, 0);
            items.forEach((it, i) => it.classList.toggle("highlighted", i === highlightIndex));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0 && items[highlightIndex]) {
                items[highlightIndex].click();
            }
        } else if (e.key === "Escape") {
            list.classList.remove("active");
        }
    });

    // --- FECHA AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            list.classList.remove("active");
        }
    });
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
    ["GOL", "DEF", "MEI", "ATA"].forEach(pos => {
        const labels = { 
            GOL: "Goleiros", 
            DEF: "Defensores", 
            MEI: "Meio-campistas", 
            ATA: "Atacantes" 
        };

        const group = document.createElement("div");

        group.className = "result-group";
        group.innerHTML = `<h4>${labels[pos]}</h4><ul></ul>`;

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
    ["GOL", "DEF", "MEI", "ATA"].forEach(pos => {
        const labels = { 
            GOL: "Goleiros", 
            DEF: "Defensores", 
            MEI: "Meio-campistas", 
            ATA: "Atacantes" 
        };

        const jogadores = convocadosOficiais.filter(j => j.posicao === pos);
        const group = document.createElement("div");

        group.className = "result-group";
        group.innerHTML = `<h4>${labels[pos]}</h4><ul></ul>`;

        const ul = group.querySelector("ul");
        jogadores.forEach(j => {
            const li = document.createElement("li");
            li.textContent = j.nome;
            li.className = nomesUsuario.includes(j.nome) ? "correct" : "missed";
            ul.appendChild(li);
        });
        officialDiv.appendChild(group);
    });

    return acertos;
}
