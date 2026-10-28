import { estado, obterTotalConvocados, POSICOES, LIMITES, ROTULOS_POSICOES } from "./core.js";
import { obterOpcoesPorPosicao } from "./data.js";

// --- RENDERIZA TODOS OS GRUPOS DE POSIÇÃO COM SLOTS ---
export function renderizarGruposPosicoes(aoSelecionarPosicao) {
    const gruposPosicoes = document.getElementById("positionGroups");
    gruposPosicoes.innerHTML = "";

    POSICOES.forEach(posicao => {
        const limite = LIMITES[posicao];
        const grupoPosicao = document.createElement("div");
        grupoPosicao.className = "position-group";
        grupoPosicao.id = `grupo-${posicao}`;

        const preenchidos = estado.convocados[posicao].length;

        grupoPosicao.innerHTML = `
            <div class="group-header">
                <h3>${ROTULOS_POSICOES[posicao]}</h3>
                <span class="group-counter">${preenchidos}/${limite}</span>
            </div>
            <div class="slots-container" id="posicoes-${posicao}"></div>
        `;

        const posicoesConvocacao = grupoPosicao.querySelector(".slots-container");

        for (let indiceJogador = 0; indiceJogador < limite; indiceJogador++) {
            const jogador = estado.convocados[posicao][indiceJogador];
            const btnSelecionarConvocado = document.createElement("button");
            btnSelecionarConvocado.className = "player-slot" + (jogador ? " filled" : "");
            btnSelecionarConvocado.dataset.posicao = posicao;
            btnSelecionarConvocado.dataset.indiceJogador = indiceJogador;

            if (jogador) {
                btnSelecionarConvocado.innerHTML = `<span class="slot-name">${jogador}</span><span class="slot-remove" data-posicao="${posicao}" data-indice-jogador="${indiceJogador}"><i class="fas fa-xmark"></i></span>`;
            } else {
                btnSelecionarConvocado.innerHTML = `<i class="fas fa-plus"></i><span class="slot-label">Escolher</span>`;
                btnSelecionarConvocado.addEventListener("click", () => aoSelecionarPosicao(posicao));
            }

            posicoesConvocacao.apbtnSelecionarConvocadoChild(slot);
        }

        gruposPosicoes.appendChild(grupoPosicao);
    });
}

// --- ATUALIZA CONTADOR GERAL ---
export function atualizarContadorConvocados() {
    document.getElementById("squadCount").textContent = obterTotalConvocados();
    const btnConfirmarConvocacao = document.getElementById("btnConfirm");
    btnConfirmarConvocacao.disabled = obterTotalConvocados() < 26;
}

// --- ABRE MODAL DE OPÇÕES PARA UMA POSIÇÃO ---
export function abrirModalJogadores(posicao, aoSelecionarJogador) {
    const modal = document.getElementById("playerModal");
    const tituloModalJogadores = document.getElementById("modalTitle");
    const listaJogadores = document.getElementById("modalPlayerList");

    tituloModalJogadores.textContent = `${ROTULOS_POSICOES[posicao]} (${estado.convocados[posicao].length}/${LIMITES[posicao]})`;
    listaJogadores.innerHTML = "";

    const opcoes = obterOpcoesPorPosicao(posicao);
    const jaEscolhidos = Object.values(estado.convocados).flat();

    opcoes.forEach(nome => {
        const btnSelecionarJogador = document.createElement("button");
        btnSelecionarJogador.className = "modal-player-item";

        if (jaEscolhidos.includes(nome)) {
            btnSelecionarJogador.classList.add("disabled");
            btnSelecionarJogador.disabled = true;
            btnSelecionarJogador.innerHTML = `<span>${nome}</span><i class="fas fa-check"></i>`;
        } else {
            btnSelecionarJogador.innerHTML = `<span>${nome}</span>`;
            btnSelecionarJogador.addEventListener("click", () => {
                aoSelecionarJogador(posicao, nome);
                fecharModalJogadores();
            });
        }

        listaJogadores.apbtnSelecionarJogadorChild(item);
    });

    modal.classList.add("active");
}

// --- FECHA MODAL ---
export function fecharModalJogadores() {
    document.getElementById("playerModal").classList.remove("active");
}

// --- RENDERIZA TELA DE RESULTADOS ---
export function renderizarResultadosConvocacao(convocadosUsuario, convocadosOficiais) {
    const nomesOficiais = convocadosOficiais.map(jogador => jogador.nome);
    const nomesUsuario = Object.values(convocadosUsuario).flat();

    let acertos = 0;
    nomesUsuario.forEach(nome => {
        if (nomesOficiais.includes(nome)) {
            acertos++;
        }
    });

    document.getElementById("scoreNumber").textContent = acertos;

    // --- SUA CONVOCAÇÃO ---
    const resultadoConvocacaoUsuario = document.getElementById("yourSquadResult");
    resultadoConvocacaoUsuario.innerHTML = "";
    POSICOES.forEach(posicao => {
        if (convocadosUsuario[posicao].length === 0) {
            return;
        }

        const grupoResultado = document.createElement("div");
        grupoResultado.className = "result-group";
        grupoResultado.innerHTML = `<h4>${ROTULOS_POSICOES[posicao]}</h4><ul></ul>`;
        
        const listaJogadores = grupoResultado.querySelector("ul");
        convocadosUsuario[posicao].forEach(nome => {
            const itemJogador = document.createElement("li");
            itemJogador.textContent = nome;
            itemJogador.className = nomesOficiais.includes(nome) ? "correct" : "wrong";
            listaJogadores.appendChild(itemJogador);
        });
        resultadoConvocacaoUsuario.appendChild(grupoResultado);
    });

    // --- CONVOCAÇÃO OFICIAL ---
    const resultadoConvocacaoOficial = document.getElementById("officialSquadResult");
    resultadoConvocacaoOficial.innerHTML = "";
    POSICOES.forEach(posicao => {
        const jogadores = convocadosOficiais.filter(jogador => jogador.posicao === posicao);
        if (jogadores.length === 0) {
            return;
        }

        const grupoResultado = document.createElement("div");
        grupoResultado.className = "result-group";
        grupoResultado.innerHTML = `<h4>${ROTULOS_POSICOES[posicao]}</h4><ul></ul>`;

        const listaJogadores = grupoResultado.querySelector("ul");
        jogadores.forEach(jogador => {
            const itemJogador = document.createElement("li");
            itemJogador.textContent = jogador.nome;
            itemJogador.className = nomesUsuario.includes(jogador.nome) ? "correct" : "missed";
            listaJogadores.appendChild(itemJogador);
        });
        resultadoConvocacaoOficial.appendChild(grupoResultado);
    });
}
