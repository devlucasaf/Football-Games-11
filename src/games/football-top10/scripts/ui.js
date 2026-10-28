import estado from "./core.js";
import { normalizarTexto } from "./utils.js";
import { obterNomesItens, obterOpcoes } from "./data.js";

// --- REFERÊNCIAS AOS ELEMENTOS DOM ---
const listaClassificacao = document.getElementById("top10Lista");
const iconeTema = document.getElementById("temaIcone");
const textoTema = document.getElementById("temaTexto");
const categoriaTema = document.getElementById("temaCategoria");
const contadorAcertos = document.getElementById("acertosCount");
const contadorVidas = document.getElementById("vidasCount");
const contadorPontos = document.getElementById("pontosCount");
const contadorRodadas = document.getElementById("rodadasCount");
const campoPalpite = document.getElementById("palpiteInput");
const listaSugestoes = document.getElementById("sugestoesLista");
const areaRetornoPalpite = document.getElementById("feedbackArea");
const iconeRetornoPalpite = document.getElementById("feedbackIcone");
const textoRetornoPalpite = document.getElementById("feedbackTexto");
const sobreposicaoResultado = document.getElementById("resultOverlay");
const iconeResultado = document.getElementById("resultIcon");
const tituloResultado = document.getElementById("resultTitle");
const textoResultado = document.getElementById("resultText");

let temporizadorRetornoPalpite = null;
let indiceSugestao = -1;           

// --- RENDERIZAÇÃO DO TEMA ---
export function renderizarTema(lista) {
    iconeTema.className = lista.icone;
    textoTema.textContent = lista.tema;

    const rotulosCategorias = {
        selecoes:  "Seleções",
        clubes:    "Clubes",
        jogadores: "Jogadores",
        tecnicos:  "Técnicos",
        arbitros:  "Árbitros"
    };
    categoriaTema.textContent = rotulosCategorias[lista.categoria] || lista.categoria;
}

// --- RENDERIZAÇÃO DA LISTA DE ITENS ---
export function renderizarLista(lista) {
    listaClassificacao.innerHTML = "";

    lista.itens.forEach((item, indiceItem) => {
        const elementoItem = document.createElement("div");
        elementoItem.classList.add("top10-item");
        elementoItem.dataset.posicao = item.posicao;
        elementoItem.dataset.indiceItem = indiceItem;

        elementoItem.innerHTML = `
            <span class="item-posicao">${item.posicao}.</span>
            <span class="item-oculto">???</span>
        `;

        listaClassificacao.appendChild(elementoItem);
    });
}

// --- REVELAÇÃO DE UM ITEM ---
export function revelarItem(indiceItem, modoDesistir = false) {
    const item = estado.listaAtual.itens[indiceItem];
    const elementoItem = listaClassificacao.querySelector(`[data-indice-item="${indiceItem}"]`);
    if (!elementoItem) {
        return;
    }

    elementoItem.classList.add(modoDesistir ? "desistiu" : "revelado");

    elementoItem.innerHTML = `
        <span class="item-posicao">${item.posicao}.</span>
        <div class="item-conteudo">
            <span class="item-nome">${item.nome}</span>
            <span class="item-detalhe">${item.detalhe}</span>
        </div>
    `;
}

// --- REVELAÇÃO DE TODOS OS ITENS NÃO ACERTADOS ---
export function revelarTodos() {
    estado.listaAtual.itens.forEach((itemLista, indiceItem) => {
        if (!estado.itensAcertados.has(indiceItem)) {
            revelarItem(indiceItem, true);
        }
    });
}

// --- ATUALIZAÇÃO DO PLACAR ---
export function atualizarPlacar() {
    contadorAcertos.textContent = estado.acertosRodada;
    contadorVidas.textContent = estado.vidas;
    contadorPontos.textContent = estado.pontosTotal;
    contadorRodadas.textContent = estado.totalRodadas;
}

// --- EXIBIÇÃO DE FEEDBACK ---
export function mostrarRetornoPalpite(tipo, texto) {
    clearTimeout(temporizadorRetornoPalpite);

    areaRetornoPalpite.style.display = "";
    areaRetornoPalpite.className = "top10-feedback " + tipo;
    iconeRetornoPalpite.className = tipo === "acerto"
        ? "fas fa-check-circle"
        : "fas fa-times-circle";
    textoRetornoPalpite.textContent = texto;

    temporizadorRetornoPalpite = setTimeout(() => {
        areaRetornoPalpite.style.display = "none";
    }, 2000);
}

// --- INICIALIZAÇÃO DO SISTEMA DE SUGESTÕES ---
export function inicializarSugestoes(aoSelecionarSugestao) {
    campoPalpite.addEventListener("input", () => {
        indiceSugestao = -1;
        const valor = campoPalpite.value.trim();
        if (valor.length < 2) {
            fecharSugestoes();
            return;
        }

        const opcoes = obterOpcoes();
        const valorNormalizado = normalizarTexto(valor);

        const nomesAcertados = new Set(
            [...estado.itensAcertados].map(indiceItem => normalizarTexto(estado.listaAtual.itens[indiceItem].nome))
        );

        const sugestoes = opcoes.filter(nome => {
            if (nomesAcertados.has(normalizarTexto(nome))) {
                return false;
            }
            return normalizarTexto(nome).includes(valorNormalizado);
        });

        const vistos = new Set();
        const unicos = sugestoes.filter(nomeSugerido => {
            const nomeNormalizado = normalizarTexto(nomeSugerido);
            if (vistos.has(nomeNormalizado)) {
                return false;
            }
            vistos.add(nomeNormalizado);
            return true;
        });

        if (unicos.length === 0) {
            fecharSugestoes();
            return;
        }

        listaSugestoes.innerHTML = "";
        unicos.slice(0, 6).forEach(nome => {
            const elementoSugestao = document.createElement("div");
            elementoSugestao.classList.add("sugestao-item");
            elementoSugestao.textContent = nome;
            elementoSugestao.addEventListener("click", () => {
                campoPalpite.value = nome;
                fecharSugestoes();
                aoSelecionarSugestao();
            });
            listaSugestoes.appendChild(elementoSugestao);
        });

        listaSugestoes.classList.add("ativa");
    });

    campoPalpite.addEventListener("keydown", (eventoTeclado) => {
        const itens = listaSugestoes.querySelectorAll(".sugestao-item");
        if (!itens.length || !listaSugestoes.classList.contains("ativa")) {
            return;
        }

        if (eventoTeclado.key === "ArrowDown") {
            eventoTeclado.preventDefault();
            indiceSugestao = (indiceSugestao + 1) % itens.length;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "ArrowUp") {
            eventoTeclado.preventDefault();
            indiceSugestao = indiceSugestao <= 0 ? itens.length - 1 : indiceSugestao - 1;
            atualizarSugestaoAtiva(itens);
        } else if (eventoTeclado.key === "Enter" && indiceSugestao >= 0) {
            eventoTeclado.preventDefault();
            campoPalpite.value = itens[indiceSugestao].textContent;
            fecharSugestoes();
            aoSelecionarSugestao();
        }
    });

    document.addEventListener("click", (eventoClique) => {
        if (!campoPalpite.contains(eventoClique.target) && !listaSugestoes.contains(eventoClique.target)) {
            fecharSugestoes();
        }
    });
}

// --- ATUALIZAÇÃO DA CLASSE "ATIVA" NA SUGESTÃO DESTACADA ---
function atualizarSugestaoAtiva(itens) {
    itens.forEach((item, indiceItem) => {
        item.classList.toggle("ativa", indiceItem === indiceSugestao);
    });
}

// --- FECHAMENTO DA LISTA DE SUGESTÕES ---
function fecharSugestoes() {
    listaSugestoes.innerHTML = "";
    listaSugestoes.classList.remove("ativa");
}

// --- LIMPEZA DO CAMPO DE INPUT E SUGESTÕES ---
export function limparCampoPalpite() {
    campoPalpite.value = "";
    fecharSugestoes();
}

// --- FOCA NO CAMPO DE INPUT ---
export function focarCampoPalpite() {
    campoPalpite.focus();
}

// --- DESABILITA INPUT E BOTÕES ---
export function desabilitarCampoPalpite() {
    campoPalpite.disabled = true;
    document.getElementById("confirmarBtn").disabled = true;
    document.getElementById("desistirBtn").disabled  = true;
}

// --- HABILITA INPUT E BOTÕES ---
export function habilitarCampoPalpite() {
    campoPalpite.disabled = false;
    document.getElementById("confirmarBtn").disabled = false;
    document.getElementById("desistirBtn").disabled  = false;
}

// --- EXIBIÇÃO DO OVERLAY DE RESULTADO DA RODADA ---
export function mostrarResultado(acertos, total, pontos) {
    const completo = acertos === total;

    iconeResultado.innerHTML = completo
        ? "<i class='fas fa-trophy' style='color: #f1c40f;'></i>"
        : "<i class='fas fa-list-check' style='color: var(--primary-green);'></i>";

    tituloResultado.textContent = completo
        ? "Lista completa!"
        : "Fim da rodada!";

    textoResultado.innerHTML = `
        Você acertou <strong>${acertos}</strong> de <strong>${total}</strong> itens.<br>
        Pontos nesta rodada: <strong>+${pontos}</strong>
    `;

    sobreposicaoResultado.classList.add("active");
}

// --- FECHAMENTO DO OVERLAY DE RESULTADO ---
export function fecharResultado() {
    sobreposicaoResultado.classList.remove("active");
}