import { estado, CATEGORIAS, LIMITE_RODADAS } from "./core.js?v=3";
import {
    carregarDados,
    sortearProximo,
    reiniciarJogo,
    contarSlotsOcupados,
    slotsCompletos,
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

const ID_JOGO = "football-monte-seu-time";

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const els = {
    hudRodada:      document.getElementById("hudRodada"),
    hudTotal:       document.getElementById("hudTotal"),
    hudSlots:       document.getElementById("hudSlots"),
    drawArea:       document.getElementById("drawArea"),
    drawBadge:      document.getElementById("drawBadge"),
    drawName:       document.getElementById("drawName"),
    drawInfo:       document.getElementById("drawInfo"),
    drawActions:    document.getElementById("drawActions"),
    slotsGrid:      document.getElementById("slotsGrid"),
    loadingState:   document.getElementById("loadingState"),
    errorState:     document.getElementById("errorState"),
    finalOverlay:   document.getElementById("finalOverlay"),
    finalClose:     document.getElementById("finalClose"),
    finalKicker:    document.getElementById("finalKicker"),
    finalTitle:     document.getElementById("finalTitle"),
    finalSubtitle:  document.getElementById("finalSubtitle"),
    finalBanner:    document.getElementById("finalBanner"),
    finalRetry:     document.getElementById("finalRetry"),
    finalHome:      document.getElementById("finalHome")
};

// --- TEXTO TRADUZIDO COM FALLBACK ---
function t(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- ÍCONE DE CADA CATEGORIA ---
function iconeDe(categoria) {
    return categoria.icone || "fa-question-circle";
}

// --- CATEGORIAS CUJA IMAGEM É UM LOGO/PEÇA (aparece inteira, sem cortar) ---
const CATEGORIAS_AJUSTADAS = ["escudo", "dinheiro", "uniforme"];

function eAjustada(categoriaId, time) {
    return CATEGORIAS_AJUSTADAS.includes(categoriaId) || time[categoriaId + "_ajuste"] === "contain";
}

// --- CONSTRÓI O BLOCO DE IMAGEM + FALLBACK ---
function htmlMedia(time, categoriaId, classe = "") {
    const url = imagemDaCategoria(time, categoriaId);
    const legenda = legendaDaCategoria(time, categoriaId);
    const icone = iconeDe(CATEGORIAS.find(c => c.id === categoriaId));
    const inicial = (time.nome || "?").substring(0, 3).toUpperCase();

    if (!url) {
        return `
            <div class="monte-media-fallback ${classe}">
                <i class="fas ${icone}"></i>
                <span>${inicial}</span>
            </div>`;
    }

    return `
        <img class="monte-slot-img${eAjustada(categoriaId, time) ? " is-contain" : ""} ${classe}"
            src="${url}"
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
function htmlEscudoSorteio(time) {
    const url = imagemDaCategoria(time, "escudo");
    const inicial = (time.nome || "?").substring(0, 3).toUpperCase();
    const icone = "fa-shield-halved";

    if (!url) {
        return `<div class="monte-media-fallback is-lg"><i class="fas ${icone}"></i><span>${inicial}</span></div>`;
    }

    return `
        <img class="monte-slot-img is-badge is-lg"
            src="${url}"
            alt="${time.nome}"
            onerror="this.style.display='none';this.parentElement.querySelector('.monte-media-fallback').style.display='flex';"
        />
        <div class="monte-media-fallback is-lg" style="display:none">
            <i class="fas ${icone}"></i>
            <span>${inicial}</span>
        </div>`;
}

// --- ATUALIZA O HUD ---
function atualizarHud() {
    const livres = CATEGORIAS.length - contarSlotsOcupados();
    if (els.hudRodada) {
        els.hudRodada.textContent = String(estado.rodada);
    }

    if (els.hudSlots) {
        els.hudSlots.textContent = String(livres);
    }
}

// --- RENDERIZA O CARTÃO DO TIME SORTEADO + AÇÕES ---
function renderizarSorteio() {
    const time = estado.timeAtual;
    if (!time) {
        return;
    }

    const cor = CORES_TIMES[time.id] || "#22703f";
    const card = els.drawArea;
    card.style.setProperty("--team-accent", cor);

    els.drawBadge.innerHTML = htmlEscudoSorteio(time);
    els.drawName.textContent = time.nome;
    els.drawInfo.textContent = [time.cidade, time.apelido, time.pais].filter(Boolean).join(" · ");

    card.classList.remove("is-revealed");
    void card.offsetWidth;
    card.classList.add("is-revealed");

    renderizarAcoes(time);
}

// --- BOTÕES DE AÇÃO ---
function renderizarAcoes(time) {
    const vazios = CATEGORIAS.filter(categoria => estado.slots[categoria.id] === null);

    const chips = vazios.map(categoria => `
        <button class="monte-place-chip" data-cat="${categoria.id}" type="button">
            <i class="fas ${iconeDe(categoria)}" aria-hidden="true"></i>
            <span>${categoria.etiqueta}</span>
        </button>`).join("");

    els.drawActions.innerHTML = `
        <div class="monte-draw-hint">${t("monte-place-hint", "Colocar em:")}</div>
        <div class="monte-chips">${chips}</div>
        <button class="monte-skip-btn" id="skipRoundBtn" type="button">
            <i class="fas fa-forward-step" aria-hidden="true"></i>
            <span>${t("monte-skip-round", "Pular rodada")}</span>
        </button>`;

    els.drawActions.querySelectorAll(".monte-place-chip").forEach(chip => {
        chip.addEventListener("click", () => colocarNaCategoria(chip.dataset.cat));
    });

    els.drawActions.querySelector("#skipRoundBtn").addEventListener("click", pularRodada);
}

// --- RENDERIZA OS 7 SLOTS DO PAINEL ---
function renderizarSlots() {
    els.slotsGrid.innerHTML = "";

    CATEGORIAS.forEach(categoria => {
        const ocupado = estado.slots[categoria.id] !== null;
        const slot = document.createElement(ocupado ? "div" : "button");
        slot.className = `monte-slot-card${ocupado ? " is-filled" : ""}`;
        slot.dataset.cat = categoria.id;

        if (!ocupado) {
            slot.type = "button";
            slot.setAttribute("aria-label", categoria.etiqueta);
            slot.innerHTML = `
                <div class="monte-slot-media">
                    <div class="monte-slot-empty">
                        <i class="fas ${iconeDe(categoria)}" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="monte-slot-body">
                    <span class="monte-slot-label">${categoria.etiqueta}</span>
                    <span class="monte-slot-caption">${t("monte-slot-free", "Slot vazio")}</span>
                </div>`;
            slot.addEventListener("click", () => colocarNaCategoria(categoria.id));
        } else {
            const time = estado.slots[categoria.id].time;
            slot.setAttribute("aria-label", `${categoria.etiqueta}: ${time.nome}`);
            slot.innerHTML = `
                <div class="monte-slot-media${eAjustada(categoria.id, time) ? " is-contain" : ""}">${htmlMedia(time, categoria.id)}</div>
                <div class="monte-slot-body">
                    <span class="monte-slot-label">${categoria.etiqueta}</span>
                    <span class="monte-slot-caption">${legendaDaCategoria(time, categoria.id)}</span>
                </div>`;
        }

        els.slotsGrid.appendChild(slot);
    });
}

// --- COLOCA O TIME SORTEADO NUMA CATEGORIA ---
function colocarNaCategoria(categoriaId) {
    if (estado.terminado || !estado.timeAtual) {
        return;
    }

    if (estado.slots[categoriaId] !== null) {
        return; 
    }

    estado.slots[categoriaId] = { time: estado.timeAtual };
    estado.timeAtual = null;

    renderizarSlots();
    atualizarHud();

    if (slotsCompletos()) {
        terminarJogo(true);
        return;
    }

    avancar();
}

// --- PULA A RODADA ---
function pularRodada() {
    if (estado.terminado || !estado.timeAtual) {
        return;
    }
    estado.timeAtual = null;
    avancar();
}

// --- AVANÇA PARA O PRÓXIMO SORTEIO OU ENCERRA O JOGO AO ATINGIR O LIMITE ---
function avancar() {
    if (estado.rodada >= LIMITE_RODADAS) {
        terminarJogo(false);
        return;
    }

    estado.rodada++;
    sortearProximo();
    atualizarHud();
    renderizarSorteio();
}

// --- FIM DE JOGO --- 
function terminarJogo(venceu) {
    estado.terminado = true;
    estado.venceu = venceu;

    const ocupados = contarSlotsOcupados();

    if (window.FG11Stats) {
        window.FG11Stats.registrar(ID_JOGO, {
            venceu,
            bucket: ocupados,
            tamanho: CATEGORIAS.length
        });
    }

    renderizarModalFinal(venceu);
}

// --- CONTEÚDO DO MODAL DE RESULTADO ---
function renderizarModalFinal(venceu) {
    const ocupados = contarSlotsOcupados();

    els.finalKicker.textContent = venceu
        ? t("monte-win-kicker", "7/7 categorias completadas")
        : t("monte-loss-kicker", `Limite de ${LIMITE_RODADAS} sorteios atingido`);

    els.finalTitle.textContent = venceu
        ? t("monte-win-title", "Time Perfeito!")
        : t("monte-loss-title", "Fim de Jogo");

    els.finalSubtitle.textContent = venceu
        ? t("monte-win-sub", `Você completou as 7 categorias em ${estado.rodada} de ${LIMITE_RODADAS} sorteios. Este é o seu Time Perfeito!`)
        : t("monte-loss-sub", `Você chegou ao limite de ${LIMITE_RODADAS} sorteios com ${ocupados} de 7 slots ocupados. Tente de novo!`);

    renderizarBannerFinal();

    els.finalOverlay.classList.remove("is-defeat", "is-victory");
    els.finalOverlay.classList.add(venceu ? "is-victory" : "is-defeat");
    els.finalOverlay.classList.remove("hidden");

    setTimeout(() => {
        if (els.finalRetry) {
            els.finalRetry.focus();
        }
    }, 120);
}

// --- BANNER DO TIME ---
function renderizarBannerFinal() {
    const itens = CATEGORIAS.map(categoria => {
        const slot = estado.slots[categoria.id];
        const icone = iconeDe(categoria);

        if (!slot) {
            return `
                <div class="monte-final-item is-empty">
                    <div class="monte-final-media">
                        <i class="fas ${icone}" aria-hidden="true"></i>
                    </div>
                    <span class="monte-final-caption">${categoria.etiqueta}</span>
                    <span class="monte-final-team">${t("monte-slot-free", "Vazio")}</span>
                </div>`;
        }

        const time = slot.time;
        const url = imagemDaCategoria(time, categoria.id);
        const legenda = legendaDaCategoria(time, categoria.id);
        const inicial = (time.nome || "?").substring(0, 3).toUpperCase();

        const media = url
            ? `<img class="monte-final-img${eAjustada(categoria.id, time) ? " is-contain" : ""}"
                    src="${url}"
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
                <div class="monte-final-media${eAjustada(categoria.id, time) ? " is-contain" : ""}">${media}</div>
                <span class="monte-final-caption">${categoria.etiqueta}</span>
                <span class="monte-final-team">${time.nome}</span>
            </div>`;
    }).join("");

    els.finalBanner.innerHTML = itens;
}

// --- FECHA O MODAL ---
function fecharModalFinal() {
    els.finalOverlay.classList.add("hidden");
    if (!estado.terminado) {
        return;
    }
    
    els.drawActions.innerHTML = `
        <button class="monte-skip-btn" id="replayBtn" type="button">
            <i class="fas fa-redo" aria-hidden="true"></i>
            <span>${t("monte-play-again", "Jogar novamente")}</span>
        </button>`;
    els.drawActions.querySelector("#replayBtn").addEventListener("click", iniciarJogo);
}

// --- INÍCIO DA PARTIDA ---
function iniciarJogo() {
    reiniciarJogo();
    els.finalOverlay.classList.add("hidden");
    els.drawArea.classList.remove("is-revealed");

    if (!estado.times.length) {
        return;
    }

    estado.rodada = 1;
    sortearProximo();
    atualizarHud();
    renderizarSlots();
    renderizarSorteio();
}

// --- INÍCIO DO MINIGAME ---
async function init() {
    try {
        await carregarDados();

        if (els.loadingState) {
            els.loadingState.style.display = "none";
        }

        if (els.hudTotal) {
            els.hudTotal.textContent = String(LIMITE_RODADAS);
        }

        els.finalRetry.addEventListener("click", iniciarJogo);
        els.finalHome.addEventListener("click", () => {
            window.location.href = "../../../index.html";
        });

        if (els.finalClose) {
            els.finalClose.addEventListener("click", fecharModalFinal);
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !els.finalOverlay.classList.contains("hidden")) {
                fecharModalFinal();
            }
        });

        iniciarJogo();
    } catch (erro) {
        console.error("Erro ao iniciar Monte seu Time:", erro);
        if (els.loadingState) {
            els.loadingState.style.display = "none";
        }

        if (els.errorState) {
            els.errorState.hidden = false;
        }
    }
}

init();
