import { estado, CATEGORIAS, LIMITE_RODADAS } from "./core.js?v=3";
import {
    carregarDados,
    sortearProximo,
    reiniciarJogo,
    contarCategoriasPreenchidas,
    todasCategoriasPreenchidas,
    imagemDaCategoria,
    legendaDaCategoria
} from "./data.js?v=3";

// --- CORES DE DESTAQUE POR TIME ---
const CORES_TIMES = {
    "gremio": "#0d6bb0",
    "flamengo": "#d21f3c",
    "sao-paulo": "#d21f3c",
    "corinthians": "#3a3a3a",
    "palmeiras": "#1e7b2d",
    "vasco": "#2b2b2b",
    "santos": "#555555",
    "internacional": "#d21f3c",
    "cruzeiro": "#1d4fa8",
    "atletico-mg": "#3a3a3a",
    "botafogo": "#3a3a3a",
    "fluminense": "#8a1c3c",
    "bahia": "#0d6bb0"
};

const IDENTIFICADOR_JOGO = "football-monte-seu-time";

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const elementosMontagemTime = {
    painelRodada:      document.getElementById("hudRodada"),
    painelTotalRodadas:       document.getElementById("hudTotal"),
    painelCategoriasLivres:       document.getElementById("hudSlots"),
    areaSorteio:       document.getElementById("drawArea"),
    escudoTimeSorteado:      document.getElementById("drawBadge"),
    nomeTimeSorteado:       document.getElementById("drawName"),
    informacoesTimeSorteado:       document.getElementById("drawInfo"),
    acoesTimeSorteado:    document.getElementById("drawActions"),
    gradeCategorias:      document.getElementById("slotsGrid"),
    estadoCarregamento:   document.getElementById("loadingState"),
    estadoErro:     document.getElementById("errorState"),
    sobreposicaoResultadoFinal:   document.getElementById("finalOverlay"),
    btnFecharResultadoFinal:     document.getElementById("btnFecharResultadoFinal"),
    resumoResultadoFinal:    document.getElementById("finalKicker"),
    tituloResultadoFinal:     document.getElementById("finalTitle"),
    subtituloResultadoFinal:  document.getElementById("finalSubtitle"),
    painelTimeFinal:    document.getElementById("finalBanner"),
    btnJogarNovamente:     document.getElementById("btnJogarNovamente"),
    btnVoltarPaginaInicial:      document.getElementById("btnVoltarPaginaInicial")
};

// --- TEXTO TRADUZIDO COM FALLBACK ---
function obterTextoTraduzido(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- ÍCONE DE CADA CATEGORIA ---
function obterIconeCategoria(categoria) {
    return categoria.icone || "fa-question-circle";
}

// --- CATEGORIAS CUJA IMAGEM É UM LOGO/PEÇA (aparece inteira, sem cortar) ---
const CATEGORIAS_AJUSTADAS = ["escudo", "dinheiro", "uniforme"];

function imagemCategoriaAjustada(identificadorCategoria, time) {
    return CATEGORIAS_AJUSTADAS.includes(identificadorCategoria) || time[identificadorCategoria + "_ajuste"] === "contain";
}

// --- CONSTRÓI O BLOCO DE IMAGEM + FALLBACK ---
function gerarMarcacaoImagemCategoria(time, identificadorCategoria, classe = "") {
    const enderecoImagem = imagemDaCategoria(time, identificadorCategoria);
    const legenda = legendaDaCategoria(time, identificadorCategoria);
    const icone = obterIconeCategoria(CATEGORIAS.find(categoria => categoria.id === identificadorCategoria));
    const inicial = (time.nome || "?").substring(0, 3).toUpperCase();

    if (!enderecoImagem) {
        return `
            <div class="monte-media-fallback ${classe}">
                <i class="fas ${icone}"></i>
                <span>${inicial}</span>
            </div>`;
    }

    return `
        <img class="monte-slot-img${imagemCategoriaAjustada(identificadorCategoria, time) ? " is-contain" : ""} ${classe}"
            src="${enderecoImagem}"
            alt="${legenda}"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        />
        <div class="monte-media-fallback ${classe}" style="display:none">
            <i class="fas ${icone}"></i>
            <span>${inicial}</span>
        </div>`;
}

// --- VERSÃO PARA O CARTÃO DO SORTEIO ---
function gerarMarcacaoEscudoSorteio(time) {
    const enderecoImagem = imagemDaCategoria(time, "escudo");
    const inicial = (time.nome || "?").substring(0, 3).toUpperCase();
    const icone = "fa-shield-halved";

    if (!enderecoImagem) {
        return `<div class="monte-media-fallback is-lg"><i class="fas ${icone}"></i><span>${inicial}</span></div>`;
    }

    return `
        <img class="monte-slot-img is-badge is-lg"
            src="${enderecoImagem}"
            alt="${time.nome}"
            onerror="this.style.display='none';this.parentElement.querySelector('.monte-media-fallback').style.display='flex';"
        />
        <div class="monte-media-fallback is-lg" style="display:none">
            <i class="fas ${icone}"></i>
            <span>${inicial}</span>
        </div>`;
}

// --- ATUALIZA O HUD ---
function atualizarPainelPartida() {
    const livres = CATEGORIAS.length - contarCategoriasPreenchidas();
    if (elementosMontagemTime.painelRodada) {
        elementosMontagemTime.painelRodada.textContent = String(estado.rodada);
    }

    if (elementosMontagemTime.painelCategoriasLivres) {
        elementosMontagemTime.painelCategoriasLivres.textContent = String(livres);
    }
}

// --- RENDERIZA O CARTÃO DO TIME SORTEADO + AÇÕES ---
function renderizarSorteio() {
    const time = estado.timeAtual;
    if (!time) {
        return;
    }

    const cor = CORES_TIMES[time.id] || "#22703f";
    const cartaoSorteio = elementosMontagemTime.areaSorteio;
    cartaoSorteio.style.setProperty("--team-accent", cor);

    elementosMontagemTime.escudoTimeSorteado.innerHTML = gerarMarcacaoEscudoSorteio(time);
    elementosMontagemTime.nomeTimeSorteado.textContent = time.nome;
    elementosMontagemTime.informacoesTimeSorteado.textContent = [time.cidade, time.apelido, time.pais].filter(Boolean).join(" · ");

    cartaoSorteio.classList.remove("is-revealed");
    void cartaoSorteio.offsetWidth;
    cartaoSorteio.classList.add("is-revealed");

    renderizarAcoes(time);
}

// --- BOTÕES DE AÇÃO ---
function renderizarAcoes(time) {
    const vazios = CATEGORIAS.filter(categoria => estado.categoriasPreenchidas[categoria.id] === null);

    const marcacaoBotoesCategorias = vazios.map(categoria => `
        <button class="monte-place-chip" data-categoria="${categoria.id}" type="button">
            <i class="fas ${obterIconeCategoria(categoria)}" aria-hidden="true"></i>
            <span>${categoria.etiqueta}</span>
        </button>`).join("");

    elementosMontagemTime.acoesTimeSorteado.innerHTML = `
        <div class="monte-draw-hint">${obterTextoTraduzido("monte-place-hint", "Colocar em:")}</div>
        <div class="monte-chips">${marcacaoBotoesCategorias}</div>
        <button class="monte-skip-btn" id="btnPularRodada" type="button">
            <i class="fas fa-forward-step" aria-hidden="true"></i>
            <span>${obterTextoTraduzido("monte-skip-round", "Pular rodada")}</span>
        </button>`;

    elementosMontagemTime.acoesTimeSorteado.querySelectorAll(".monte-place-chip").forEach(btnPreencherCategoria => {
        btnPreencherCategoria.addEventListener("click", () => colocarNaCategoria(btnPreencherCategoria.dataset.categoria));
    });

    elementosMontagemTime.acoesTimeSorteado.querySelector("#btnPularRodada").addEventListener("click", pularRodada);
}

// --- RENDERIZA OS 7 SLOTS DO PAINEL ---
function renderizarCategoriasTime() {
    elementosMontagemTime.gradeCategorias.innerHTML = "";

    CATEGORIAS.forEach(categoria => {
        const ocupado = estado.categoriasPreenchidas[categoria.id] !== null;
        const elementoCategoria = document.createElement(ocupado ? "div" : "button");
        elementoCategoria.className = `monte-slot-card${ocupado ? " is-filled" : ""}`;
        elementoCategoria.dataset.categoria = categoria.id;

        if (!ocupado) {
            elementoCategoria.type = "button";
            elementoCategoria.setAttribute("aria-label", categoria.etiqueta);
            elementoCategoria.innerHTML = `
                <div class="monte-slot-media">
                    <div class="monte-slot-empty">
                        <i class="fas ${obterIconeCategoria(categoria)}" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="monte-slot-body">
                    <span class="monte-slot-label">${categoria.etiqueta}</span>
                    <span class="monte-slot-caption">${obterTextoTraduzido("monte-slot-free", "Slot vazio")}</span>
                </div>`;
            elementoCategoria.addEventListener("click", () => colocarNaCategoria(categoria.id));
        } else {
            const time = estado.categoriasPreenchidas[categoria.id].time;
            elementoCategoria.setAttribute("aria-label", `${categoria.etiqueta}: ${time.nome}`);
            elementoCategoria.innerHTML = `
                <div class="monte-slot-media${imagemCategoriaAjustada(categoria.id, time) ? " is-contain" : ""}">${gerarMarcacaoImagemCategoria(time, categoria.id)}</div>
                <div class="monte-slot-body">
                    <span class="monte-slot-label">${categoria.etiqueta}</span>
                    <span class="monte-slot-caption">${legendaDaCategoria(time, categoria.id)}</span>
                </div>`;
        }

        elementosMontagemTime.gradeCategorias.appendChild(elementoCategoria);
    });
}

// --- COLOCA O TIME SORTEADO NUMA CATEGORIA ---
function colocarNaCategoria(identificadorCategoria) {
    if (estado.terminado || !estado.timeAtual) {
        return;
    }

    if (estado.categoriasPreenchidas[identificadorCategoria] !== null) {
        return; 
    }

    estado.categoriasPreenchidas[identificadorCategoria] = { time: estado.timeAtual };
    estado.timeAtual = null;

    renderizarCategoriasTime();
    atualizarPainelPartida();

    if (todasCategoriasPreenchidas()) {
        terminarJogo(true);
        return;
    }

    avancarSorteio();
}

// --- PULA A RODADA ---
function pularRodada() {
    if (estado.terminado || !estado.timeAtual) {
        return;
    }
    estado.timeAtual = null;
    avancarSorteio();
}

// --- AVANÇA PARA O PRÓXIMO SORTEIO OU ENCERRA O JOGO AO ATINGIR O LIMITE ---
function avancarSorteio() {
    if (estado.rodada >= LIMITE_RODADAS) {
        terminarJogo(false);
        return;
    }

    estado.rodada++;
    sortearProximo();
    atualizarPainelPartida();
    renderizarSorteio();
}

// --- FIM DE JOGO --- 
function terminarJogo(venceu) {
    estado.terminado = true;
    estado.venceu = venceu;

    const ocupados = contarCategoriasPreenchidas();

    if (window.FG11Stats) {
        window.FG11Stats.registrar(IDENTIFICADOR_JOGO, {
            venceu,
            bucket: ocupados,
            tamanho: CATEGORIAS.length
        });
    }

    renderizarModalFinal(venceu);
}

// --- CONTEÚDO DO MODAL DE RESULTADO ---
function renderizarModalFinal(venceu) {
    const ocupados = contarCategoriasPreenchidas();

    elementosMontagemTime.resumoResultadoFinal.textContent = venceu
        ? obterTextoTraduzido("monte-win-kicker", "7/7 categorias completadas")
        : obterTextoTraduzido("monte-loss-kicker", `Limite de ${LIMITE_RODADAS} sorteios atingido`);

    elementosMontagemTime.tituloResultadoFinal.textContent = venceu
        ? obterTextoTraduzido("monte-win-title", "Time Perfeito!")
        : obterTextoTraduzido("monte-loss-title", "Fim de Jogo");

    elementosMontagemTime.subtituloResultadoFinal.textContent = venceu
        ? obterTextoTraduzido("monte-win-sub", `Você completou as 7 categorias em ${estado.rodada} de ${LIMITE_RODADAS} sorteios. Este é o seu Time Perfeito!`)
        : obterTextoTraduzido("monte-loss-sub", `Você chegou ao limite de ${LIMITE_RODADAS} sorteios com ${ocupados} de 7 slots ocupados. Tente de novo!`);

    renderizarBannerFinal();

    elementosMontagemTime.sobreposicaoResultadoFinal.classList.remove("is-defeat", "is-victory");
    elementosMontagemTime.sobreposicaoResultadoFinal.classList.add(venceu ? "is-victory" : "is-defeat");
    elementosMontagemTime.sobreposicaoResultadoFinal.classList.remove("hidden");

    setTimeout(() => {
        if (elementosMontagemTime.btnJogarNovamente) {
            elementosMontagemTime.btnJogarNovamente.focus();
        }
    }, 120);
}

// --- BANNER DO TIME ---
function renderizarBannerFinal() {
    const itens = CATEGORIAS.map(categoria => {
        const categoriaPreenchida = estado.categoriasPreenchidas[categoria.id];
        const icone = obterIconeCategoria(categoria);

        if (!categoriaPreenchida) {
            return `
                <div class="monte-final-item is-empty">
                    <div class="monte-final-media">
                        <i class="fas ${icone}" aria-hidden="true"></i>
                    </div>
                    <span class="monte-final-caption">${categoria.etiqueta}</span>
                    <span class="monte-final-team">${obterTextoTraduzido("monte-slot-free", "Vazio")}</span>
                </div>`;
        }

        const time = categoriaPreenchida.time;
        const enderecoImagem = imagemDaCategoria(time, categoria.id);
        const legenda = legendaDaCategoria(time, categoria.id);
        const inicial = (time.nome || "?").substring(0, 3).toUpperCase();

        const marcacaoImagem = enderecoImagem
            ? `<img class="monte-final-img${imagemCategoriaAjustada(categoria.id, time) ? " is-contain" : ""}"
                src="${enderecoImagem}"
                    alt="${legenda}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                <div class="monte-final-fallback" style="display:none">
                    <i class="fas ${icone}" aria-hidden="true"></i>
                    <span>${inicial}</span>
                </div>`
            : `<div class="monte-final-fallback">
                    <i class="fas ${icone}" aria-hidden="true"></i>
                    <span>${inicial}</span>
                </div>`;

        return `
            <div class="monte-final-item" title="${categoria.etiqueta}">
                <div class="monte-final-media${imagemCategoriaAjustada(categoria.id, time) ? " is-contain" : ""}">${marcacaoImagem}</div>
                <span class="monte-final-caption">${categoria.etiqueta}</span>
                <span class="monte-final-team">${time.nome}</span>
            </div>`;
    }).join("");

    elementosMontagemTime.painelTimeFinal.innerHTML = itens;
}

// --- FECHA O MODAL ---
function fecharModalFinal() {
    elementosMontagemTime.sobreposicaoResultadoFinal.classList.add("hidden");
    if (!estado.terminado) {
        return;
    }
    
    elementosMontagemTime.acoesTimeSorteado.innerHTML = `
        <button class="monte-skip-btn" id="btnJogarNovamenteAposResultado" type="button">
            <i class="fas fa-redo" aria-hidden="true"></i>
            <span>${obterTextoTraduzido("monte-play-again", "Jogar novamente")}</span>
        </button>`;
    elementosMontagemTime.acoesTimeSorteado.querySelector("#btnJogarNovamenteAposResultado").addEventListener("click", iniciarJogo);
}

// --- INÍCIO DA PARTIDA ---
function iniciarJogo() {
    reiniciarJogo();
    elementosMontagemTime.sobreposicaoResultadoFinal.classList.add("hidden");
    elementosMontagemTime.areaSorteio.classList.remove("is-revealed");

    if (!estado.times.length) {
        return;
    }

    estado.rodada = 1;
    sortearProximo();
    atualizarPainelPartida();
    renderizarCategoriasTime();
    renderizarSorteio();
}

// --- INÍCIO DO MINIGAME ---
async function inicializarMontagemTime() {
    try {
        await carregarDados();

        if (elementosMontagemTime.estadoCarregamento) {
            elementosMontagemTime.estadoCarregamento.style.display = "none";
        }

        if (elementosMontagemTime.painelTotalRodadas) {
            elementosMontagemTime.painelTotalRodadas.textContent = String(LIMITE_RODADAS);
        }

        elementosMontagemTime.btnJogarNovamente.addEventListener("click", iniciarJogo);
        elementosMontagemTime.btnVoltarPaginaInicial.addEventListener("click", () => {
            window.location.href = "../../../index.html";
        });

        if (elementosMontagemTime.btnFecharResultadoFinal) {
            elementosMontagemTime.btnFecharResultadoFinal.addEventListener("click", fecharModalFinal);
        }

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !elementosMontagemTime.sobreposicaoResultadoFinal.classList.contains("hidden")) {
                fecharModalFinal();
            }
        });

        iniciarJogo();
    } catch (erro) {
        console.error("Erro ao iniciar Monte seu Time:", erro);
        if (elementosMontagemTime.estadoCarregamento) {
            elementosMontagemTime.estadoCarregamento.style.display = "none";
        }

        if (elementosMontagemTime.estadoErro) {
            elementosMontagemTime.estadoErro.hidden = false;
        }
    }
}

inicializarMontagemTime();
