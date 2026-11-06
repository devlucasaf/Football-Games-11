import { estado, TAMANHOS, TEMAS, MODOS }                   from "./core.js";
import { carregarDados, montarPartida, calcularEstrelas }   from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_memoria_config";
const TEMPO_DESVIRAR = 1100;
const PADRAO_COR = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
const PADRAO_BANDEIRA = /^[a-z]{2}(-[a-z]{3})?$/;

// --- RÓTULOS PARA LEITORES DE TELA ---
const ROTULOS_TIPO = {
    jogador: [
        "memoria-tipo-jogador", 
        "Jogador"
    ],
    pais: [
        "memoria-tipo-pais",    
        "Nacionalidade"
    ],
    clube: [
        "memoria-tipo-clube",   
        "Clube"
    ],
    estadio: [
        "memoria-tipo-estadio", 
        "Estádio"
    ],
    selecao: [
        "memoria-tipo-selecao", 
        "Seleção"
    ],
    escudo:  [
        "memoria-tipo-escudo",  
        "Escudo"
    ]
};

// --- RÓTULOS DE TEMAS E MODOS ---
const ROTULOS_TEMA = {
    nacionalidade: [
        "memoria-theme-nacionalidade", 
        "Jogador e nacionalidade"
    ],
    estadio: [
        "memoria-theme-estadio",       
        "Clube e estádio"
    ],
    escudo: [
        "memoria-theme-escudo",        
        "Seleção e escudo"
    ],
    misto: [
        "memoria-theme-misto",         
        "Misturado"
    ]
};

// --- RÓTULOS DE MODOS ---
const ROTULOS_MODO = {
    tempo: [
        "memoria-mode-tempo",      
        "Contra o relógio"
    ],
    movimentos: [
        "memoria-mode-movimentos", 
        "Movimentos limitados"
    ],
    livre: [
        "memoria-mode-livre",      
        "Livre"
    ]
};

// --- ELEMENTOS DO DOM ---
const elementosMemoria = {
    painelConfiguracao:  document.getElementById("painelConfiguracao"),
    areaJogo:            document.getElementById("areaJogo"),
    resultadoFinal:      document.getElementById("resultadoFinal"),
    rotuloPartida:       document.getElementById("rotuloPartida"),
    iconeLimite:         document.getElementById("iconeLimite"),
    rotuloLimite:        document.getElementById("rotuloLimite"),
    valorLimite:         document.getElementById("valorLimite"),
    caixaLimite:         document.getElementById("caixaLimite"),
    contadorMovimentos:  document.getElementById("contadorMovimentos"),
    contadorPares:       document.getElementById("contadorPares"),
    preenchimentoBarra:  document.getElementById("preenchimentoBarra"),
    avisoPrevia:         document.getElementById("avisoPrevia"),
    tabuleiro:           document.getElementById("tabuleiro"),
    painelCuriosidade:   document.getElementById("painelCuriosidade"),
    parCuriosidade:      document.getElementById("parCuriosidade"),
    textoCuriosidade:    document.getElementById("textoCuriosidade"),
    iconeResultado:      document.getElementById("iconeResultado"),
    textoResultado:      document.getElementById("textoResultado"),
    estrelasResultado:   document.getElementById("estrelasResultado"),
    resumoResultado:     document.getElementById("resumoResultado"),
    listaAprendizado:    document.getElementById("listaAprendizado"),
    anuncioLeitorTela:   document.getElementById("anuncioLeitorTela")
};

let identificadorDesvirar = null;

// --- TEXTO TRADUZIDO COM FALLBACK ---
function texto(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- TEXTO A PARTIR DE UM PAR [CHAVE, PADRÃO] ---
function rotulo(par) {
    return texto(par[0], par[1]);
}

// --- ANUNCIA UMA MENSAGEM PARA LEITORES DE TELA ---
function anunciar(mensagem) {
    elementosMemoria.anuncioLeitorTela.textContent = "";
    setTimeout(() => {
        elementosMemoria.anuncioLeitorTela.textContent = mensagem;
    }, 30);
}

// --- FORMATA SEGUNDOS EM M:SS ---
function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = String(segundos % 60).padStart(2, "0");
    return `${minutos}:${resto}`;
}

// --- GERA FAIXAS DE CORES PARA ESCUDOS E CLUBES ---
function gerarFaixas(cores, angulo) {
    const coresValidas = (cores || []).filter((cor) => PADRAO_COR.test(cor));
    if (coresValidas.length === 0) {
        return "var(--primary-green)";
    }

    const parte = 100 / coresValidas.length;
    const faixas = coresValidas.map((cor, indiceCor) => `${cor} ${indiceCor * parte}% ${(indiceCor + 1) * parte}%`);
    return `linear-gradient(${angulo}, ${faixas.join(", ")})`;
}

// --- DESCRIÇÃO DA CARTA PARA LEITORES DE TELA ---
function descreverCarta(carta) {
    let descricao = `${rotulo(ROTULOS_TIPO[carta.tipo])}: ${carta.texto}`;
    if (carta.subtexto) {
        descricao += `, ${carta.subtexto}`;
    }

    if (carta.tipo === "escudo" && carta.estrelas) {
        descricao += `, ${carta.estrelas} ${texto("memoria-stars", "estrelas")}`;
    }
    return descricao;
}

// --- CRIA UM ÍCONE DO FONT AWESOME ---
function criarIcone(classe) {
    const icone = document.createElement("i");
    icone.className = `fas ${classe}`;
    icone.setAttribute("aria-hidden", "true");
    return icone;
}

// --- MONTA A PARTE VISUAL DA CARTA ---
function criarVisualCarta(carta) {
    const visual = document.createElement("span");
    visual.className = "carta-visual";

    if (carta.tipo === "pais" && PADRAO_BANDEIRA.test(carta.bandeira || "")) {
        const bandeira = document.createElement("img");
        bandeira.className = "carta-bandeira";
        bandeira.src = `https://flagcdn.com/w80/${carta.bandeira}.png`;
        bandeira.srcset = `https://flagcdn.com/w160/${carta.bandeira}.png 2x`;
        bandeira.alt = "";
        bandeira.addEventListener("error", () => bandeira.replaceWith(criarIcone("fa-flag")));
        visual.appendChild(bandeira);
    } else if (carta.tipo === "clube") {
        const cores = document.createElement("span");
        cores.className = "carta-clube-cores";
        cores.style.background = gerarFaixas(carta.cores, "135deg");
        cores.appendChild(criarIcone("fa-shield-halved"));
        visual.appendChild(cores);
    } else if (carta.tipo === "escudo") {
        const escudo = document.createElement("span");
        escudo.className = "carta-escudo";

        const estrelas = document.createElement("span");
        estrelas.className = "carta-escudo-estrelas";
        estrelas.textContent = "★".repeat(Math.min(Number(carta.estrelas) || 0, 5));

        const forma = document.createElement("span");
        forma.className = "carta-escudo-forma";
        forma.style.background = gerarFaixas(carta.cores, "90deg");

        const sigla = document.createElement("span");
        sigla.className = "carta-escudo-sigla";
        sigla.textContent = carta.texto;

        forma.appendChild(sigla);
        escudo.append(estrelas, forma);
        visual.appendChild(escudo);
    } else {
        const icones = { 
            jogador: "fa-user", 
            estadio: "fa-location-dot", 
            selecao: "fa-people-group", 
            pais: "fa-flag" 
        };
        visual.appendChild(criarIcone(icones[carta.tipo] || "fa-futbol"));
    }

    return visual;
}

// --- CRIA O ELEMENTO DE UMA CARTA ---
function criarCarta(carta) {
    const btnCarta = document.createElement("button");
    btnCarta.type = "button";
    btnCarta.className = "memoria-carta";
    btnCarta.dataset.indice = carta.indice;

    const interna = document.createElement("span");
    interna.className = "carta-interna";

    const verso = document.createElement("span");
    verso.className = "carta-verso";
    verso.appendChild(criarIcone("fa-futbol"));

    const frente = document.createElement("span");
    frente.className = `carta-frente tipo-${carta.tipo}`;

    const tipo = document.createElement("span");
    tipo.className = "carta-tipo";
    tipo.textContent = rotulo(ROTULOS_TIPO[carta.tipo]);
    frente.append(tipo, criarVisualCarta(carta));

    if (carta.tipo !== "escudo") {
        const nome = document.createElement("span");
        nome.className = "carta-texto";
        nome.textContent = carta.texto;
        frente.appendChild(nome);
    }

    if (carta.subtexto) {
        const subtexto = document.createElement("span");
        subtexto.className = "carta-subtexto";
        subtexto.textContent = carta.subtexto;
        frente.appendChild(subtexto);
    }

    interna.append(verso, frente);
    btnCarta.appendChild(interna);
    btnCarta.addEventListener("click", () => virarCarta(carta.indice));
    return btnCarta;
}

// --- ATUALIZA O RÓTULO ACESSÍVEL DE UMA CARTA ---
function atualizarRotuloCarta(indice) {
    const carta = estado.cartas[indice];
    const btnCarta = obterElementoCarta(indice);
    if (!btnCarta) {
        return;
    }

    const posicao = `${texto("memoria-card", "Carta")} ${indice + 1}`;
    if (carta.encontrada) {
        btnCarta.setAttribute("aria-label", `${posicao}, ${texto("memoria-found", "par encontrado")}: ${descreverCarta(carta)}`);
    } else if (btnCarta.classList.contains("virada")) {
        btnCarta.setAttribute("aria-label", `${posicao}: ${descreverCarta(carta)}`);
    } else {
        btnCarta.setAttribute("aria-label", `${posicao}, ${texto("memoria-face-down", "virada para baixo")}`);
    }
}

// --- OBTÉM O BOTÃO DE UMA CARTA ---
function obterElementoCarta(indice) {
    return elementosMemoria.tabuleiro.querySelector(`[data-indice="${indice}"]`);
}

// --- RENDERIZA O TABULEIRO ---
function renderizarTabuleiro() {
    const { colunas } = TAMANHOS[estado.configuracao.tamanho];
    elementosMemoria.tabuleiro.innerHTML = "";
    elementosMemoria.tabuleiro.style.setProperty("--colunas", colunas);
    estado.cartas.forEach((carta) => {
        elementosMemoria.tabuleiro.appendChild(criarCarta(carta));
        atualizarRotuloCarta(carta.indice);
    });
}

// --- ATUALIZA O PAINEL SUPERIOR ---
function atualizarPainel() {
    const { modo, tamanho } = estado.configuracao;
    const configuracao = TAMANHOS[tamanho];
    const totalPares = estado.paresPartida.length;
    let fracao;
    let urgente = false;

    if (modo === "tempo") {
        elementosMemoria.iconeLimite.className = "fas fa-stopwatch";
        elementosMemoria.rotuloLimite.textContent = texto("memoria-time", "Tempo");
        elementosMemoria.valorLimite.textContent = formatarTempo(estado.tempoRestante);
        fracao = estado.tempoRestante / configuracao.tempo;
        urgente = estado.tempoRestante <= 10;
    } else if (modo === "movimentos") {
        const restantes = Math.max(configuracao.movimentos - estado.movimentos, 0);
        elementosMemoria.iconeLimite.className = "fas fa-shoe-prints";
        elementosMemoria.rotuloLimite.textContent = texto("memoria-remaining", "Restantes");
        elementosMemoria.valorLimite.textContent = restantes;
        fracao = restantes / configuracao.movimentos;
        urgente = restantes <= 3;
    } else {
        elementosMemoria.iconeLimite.className = "fas fa-clock";
        elementosMemoria.rotuloLimite.textContent = texto("memoria-time", "Tempo");
        elementosMemoria.valorLimite.textContent = formatarTempo(estado.tempoDecorrido);
        fracao = totalPares ? estado.paresEncontrados / totalPares : 0;
    }

    elementosMemoria.caixaLimite.classList.toggle("urgente", urgente);
    elementosMemoria.preenchimentoBarra.style.width = `${Math.max(0, Math.min(1, fracao)) * 100}%`;
    elementosMemoria.contadorMovimentos.textContent = estado.movimentos;
    elementosMemoria.contadorPares.textContent = `${estado.paresEncontrados}/${totalPares}`;
}

// --- MOSTRA A CURIOSIDADE DO PAR ENCONTRADO ---
function mostrarCuriosidade(par) {
    elementosMemoria.parCuriosidade.textContent = `${par.a.texto} ↔ ${par.b.texto}`;
    elementosMemoria.textoCuriosidade.textContent = par.curiosidade;
    elementosMemoria.painelCuriosidade.classList.remove("vazio");
    elementosMemoria.painelCuriosidade.classList.remove("destaque");
    void elementosMemoria.painelCuriosidade.offsetWidth;
    elementosMemoria.painelCuriosidade.classList.add("destaque");
}

// --- LIMPA O PAINEL DE CURIOSIDADES ---
function limparCuriosidade() {
    elementosMemoria.parCuriosidade.textContent = "";
    elementosMemoria.textoCuriosidade.textContent = texto("memoria-learn-placeholder", "Encontre um par para descobrir uma curiosidade.");
    elementosMemoria.painelCuriosidade.classList.add("vazio");
    elementosMemoria.painelCuriosidade.classList.remove("destaque");
}

// --- PARA TODOS OS TEMPORIZADORES ---
function pararTemporizadores() {
    clearInterval(estado.identificadorCronometro);
    clearTimeout(estado.identificadorPrevia);
    clearTimeout(identificadorDesvirar);
    estado.identificadorCronometro = null;
    estado.identificadorPrevia = null;
    identificadorDesvirar = null;
}

// --- TICK DO RELÓGIO ---
function descontarSegundo() {
    estado.tempoDecorrido++;
    if (estado.configuracao.modo === "tempo") {
        estado.tempoRestante--;
    }
    atualizarPainel();

    if (estado.configuracao.modo === "tempo" && estado.tempoRestante <= 0) {
        finalizarPartida(false, "tempo");
    }
}

// --- MOSTRA AS CARTAS PARA MEMORIZAR E DEPOIS AS VIRA ---
function iniciarPrevia() {
    const { previa } = TAMANHOS[estado.configuracao.tamanho];
    const cartas = elementosMemoria.tabuleiro.querySelectorAll(".memoria-carta");

    cartas.forEach((btnCarta) => btnCarta.classList.add("virada"));
    estado.cartas.forEach((carta) => atualizarRotuloCarta(carta.indice));

    elementosMemoria.avisoPrevia.classList.remove("hidden");
    anunciar(texto("memoria-memorize", "Memorize as cartas!"));

    estado.identificadorPrevia = setTimeout(() => {
        cartas.forEach((btnCarta) => btnCarta.classList.remove("virada"));
        estado.cartas.forEach((carta) => atualizarRotuloCarta(carta.indice));
        elementosMemoria.avisoPrevia.classList.add("hidden");

        estado.tabuleiroBloqueado = false;
        estado.jogando = true;
        estado.identificadorCronometro = setInterval(descontarSegundo, 1000);
        anunciar(texto("memoria-go", "Valendo! Encontre os pares."));
    }, previa);
}

// --- VIRA UMA CARTA ---
function virarCarta(indice) {
    if (!estado.jogando || estado.tabuleiroBloqueado) {
        return;
    }

    const carta = estado.cartas[indice];
    if (!carta || carta.encontrada || estado.cartasViradas.includes(indice)) {
        return;
    }

    obterElementoCarta(indice).classList.add("virada");
    atualizarRotuloCarta(indice);
    estado.cartasViradas.push(indice);
    anunciar(descreverCarta(carta));

    if (estado.cartasViradas.length < 2) {
        return;
    }

    estado.movimentos++;
    const [indicePrimeira, indiceSegunda] = estado.cartasViradas;
    const primeira = estado.cartas[indicePrimeira];
    const segunda = estado.cartas[indiceSegunda];

    if (primeira.parId === segunda.parId) {
        confirmarPar(primeira, segunda);
    } else {
        errarPar(indicePrimeira, indiceSegunda);
    }
    atualizarPainel();
}

// --- CONFIRMA UM PAR CORRETO ---
function confirmarPar(primeira, segunda) {
    primeira.encontrada = true;
    segunda.encontrada = true;
    estado.paresEncontrados++;
    estado.cartasViradas = [];

    [primeira, segunda].forEach((carta) => {
        const btnCarta = obterElementoCarta(carta.indice);
        btnCarta.classList.add("encontrada");
        btnCarta.setAttribute("aria-disabled", "true");
        atualizarRotuloCarta(carta.indice);
    });

    const par = estado.paresPartida.find((parPartida) => parPartida.id === primeira.parId);
    if (par) {
        mostrarCuriosidade(par);
    }

    anunciar(`${texto("memoria-match", "Par encontrado!")} ${par ? par.curiosidade : ""}`);

    if (estado.paresEncontrados === estado.paresPartida.length) {
        finalizarPartida(true);
        return;
    }
    verificarLimiteMovimentos();
}

// --- DESVIRA UM PAR ERRADO ---
function errarPar(indicePrimeira, indiceSegunda) {
    estado.tabuleiroBloqueado = true;
    const cartasErradas = [obterElementoCarta(indicePrimeira), obterElementoCarta(indiceSegunda)];
    cartasErradas.forEach((btnCarta) => btnCarta.classList.add("errada"));
    anunciar(texto("memoria-no-match", "Não formam par."));

    if (verificarLimiteMovimentos()) {
        return;
    }

    identificadorDesvirar = setTimeout(() => {
        cartasErradas.forEach((btnCarta) => btnCarta.classList.remove("virada", "errada"));
        estado.cartasViradas = [];
        atualizarRotuloCarta(indicePrimeira);
        atualizarRotuloCarta(indiceSegunda);
        estado.tabuleiroBloqueado = false;
    }, TEMPO_DESVIRAR);
}

// --- VERIFICA SE OS MOVIMENTOS ACABARAM ---
function verificarLimiteMovimentos() {
    const { modo, tamanho } = estado.configuracao;
    if (modo !== "movimentos" || estado.movimentos < TAMANHOS[tamanho].movimentos) {
        return false;
    }
    finalizarPartida(false, "movimentos");
    return true;
}

// --- MONTA A LISTA DO QUE O JOGADOR APRENDEU ---
function renderizarAprendizado() {
    elementosMemoria.listaAprendizado.innerHTML = "";
    const encontrados = new Set(estado.cartas.filter((carta) => carta.encontrada).map((carta) => carta.parId));

    estado.paresPartida.forEach((par) => {
        const item = document.createElement("li");
        const achou = encontrados.has(par.id);
        item.className = `memoria-aprendizado-item ${achou ? "achou" : "faltou"}`;

        const titulo = document.createElement("strong");
        titulo.append(criarIcone(achou ? "fa-check" : "fa-xmark"), ` ${par.a.texto} ↔ ${par.b.texto}`);

        const curiosidade = document.createElement("span");
        curiosidade.textContent = par.curiosidade;

        item.append(titulo, curiosidade);
        elementosMemoria.listaAprendizado.appendChild(item);
    });
}

// --- FINALIZA A PARTIDA ---
function finalizarPartida(venceu, motivo) {
    pararTemporizadores();
    estado.jogando = false;
    estado.tabuleiroBloqueado = true;

    const estrelas = venceu ? calcularEstrelas() : 0;
    let titulo;

    if (venceu) {
        titulo = texto("memoria-win", "Você encontrou todos os pares!");
        elementosMemoria.iconeResultado.className = "round-icon correct";
        elementosMemoria.iconeResultado.innerHTML = "<i class=\"fas fa-trophy\"></i>";
    } else if (motivo === "tempo") {
        titulo = texto("memoria-loss-time", "O tempo acabou!");
        elementosMemoria.iconeResultado.className = "round-icon wrong";
        elementosMemoria.iconeResultado.innerHTML = "<i class=\"fas fa-hourglass-end\"></i>";
    } else {
        titulo = texto("memoria-loss-moves", "Seus movimentos acabaram!");
        elementosMemoria.iconeResultado.className = "round-icon wrong";
        elementosMemoria.iconeResultado.innerHTML = "<i class=\"fas fa-shoe-prints\"></i>";
    }

    const resumo = `${texto("memoria-pairs", "Pares")}: ${estado.paresEncontrados}/${estado.paresPartida.length} · ` +
        `${texto("memoria-moves", "Movimentos")}: ${estado.movimentos} · ` +
        `${texto("memoria-time", "Tempo")}: ${formatarTempo(estado.tempoDecorrido)}`;

    elementosMemoria.textoResultado.textContent = titulo;
    elementosMemoria.resumoResultado.textContent = resumo;
    elementosMemoria.estrelasResultado.innerHTML = "";
    elementosMemoria.estrelasResultado.classList.toggle("hidden", !venceu);
    elementosMemoria.estrelasResultado.setAttribute("aria-label", `${estrelas} ${texto("memoria-stars", "estrelas")}`);
    
    for (let indiceEstrela = 0; indiceEstrela < 3; indiceEstrela++) {
        const estrela = criarIcone("fa-star");
        if (indiceEstrela < estrelas) {
            estrela.classList.add("cheia");
        }
        elementosMemoria.estrelasResultado.appendChild(estrela);
    }
    renderizarAprendizado();

    setTimeout(() => {
        elementosMemoria.areaJogo.classList.add("hidden");
        elementosMemoria.resultadoFinal.classList.remove("hidden");
        anunciar(`${titulo} ${resumo}`);
    }, venceu ? 600 : 900);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-memoria", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-memoria", {
                venceu,
                titulo,
                resposta: resumo,
                tamanho: 3,
                rotulos: ["★", "★★", "★★★"],
                tituloGrafico: texto("memoria-chart-title", "Vitórias por estrelas"),
                bucketAtual: estrelas - 1,
                onReiniciar: novaPartida,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }, 1200);
    }
}

// --- INICIA UMA NOVA PARTIDA COM A CONFIGURAÇÃO ATUAL ---
function novaPartida() {
    pararTemporizadores();
    montarPartida();

    const { tema, modo } = estado.configuracao;
    elementosMemoria.rotuloPartida.textContent = `${rotulo(ROTULOS_TEMA[tema])} · ${rotulo(ROTULOS_MODO[modo])}`;

    renderizarTabuleiro();
    limparCuriosidade();
    atualizarPainel();

    elementosMemoria.painelConfiguracao.classList.add("hidden");
    elementosMemoria.resultadoFinal.classList.add("hidden");
    elementosMemoria.areaJogo.classList.remove("hidden");

    iniciarPrevia();
}

// --- VOLTA PARA A TELA DE CONFIGURAÇÃO ---
function abrirConfiguracao() {
    pararTemporizadores();
    estado.jogando = false;
    elementosMemoria.areaJogo.classList.add("hidden");
    elementosMemoria.resultadoFinal.classList.add("hidden");
    elementosMemoria.painelConfiguracao.classList.remove("hidden");
    elementosMemoria.painelConfiguracao.querySelector(".memoria-opcao.ativa")?.focus();
}

// --- MARCA AS OPÇÕES SELECIONADAS NA CONFIGURAÇÃO ---
function atualizarOpcoes() {
    elementosMemoria.painelConfiguracao.querySelectorAll(".memoria-opcao").forEach((btnOpcao) => {
        const ativa = estado.configuracao[btnOpcao.dataset.opcao] === btnOpcao.dataset.valor;
        btnOpcao.classList.toggle("ativa", ativa);
        btnOpcao.setAttribute("aria-pressed", ativa ? "true" : "false");
    });
}

// --- CARREGA A ÚLTIMA CONFIGURAÇÃO USADA ---
function carregarConfiguracao() {
    try {
        const salva = JSON.parse(localStorage.getItem(CHAVE_CONFIGURACAO));
        if (salva && TEMAS.includes(salva.tema) && MODOS.includes(salva.modo) && TAMANHOS[salva.tamanho]) {
            estado.configuracao = { tema: salva.tema, modo: salva.modo, tamanho: salva.tamanho };
        }
    } catch (erro) {
        // --- CONFIGURAÇÃO INVÁLIDA: MANTÉM O PADRÃO ---
    }
}

// --- SALVA A CONFIGURAÇÃO ATUAL ---
function salvarConfiguracao() {
    try {
        localStorage.setItem(CHAVE_CONFIGURACAO, JSON.stringify(estado.configuracao));
    } catch (erro) {
        // --- ARMAZENAMENTO INDISPONÍVEL ---
    }
}

// --- NAVEGAÇÃO PELO TABULEIRO COM AS SETAS ---
function navegarComSetas(evento) {
    const colunas = getComputedStyle(elementosMemoria.tabuleiro).gridTemplateColumns.split(" ").length;
    const deslocamentos = { 
        ArrowLeft: -1, 
        ArrowRight: 1, 
        ArrowUp: -colunas, 
        ArrowDown: colunas 
    };

    const deslocamento = deslocamentos[evento.key];
    const cartaAtual = evento.target.closest(".memoria-carta");
    if (!deslocamento || !cartaAtual) {
        return;
    }

    evento.preventDefault();
    const destino = obterElementoCarta(Number(cartaAtual.dataset.indice) + deslocamento);
    destino?.focus();
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoMemoria() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    elementosMemoria.painelConfiguracao.querySelectorAll(".memoria-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao[btnOpcao.dataset.opcao] = btnOpcao.dataset.valor;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarPartida").addEventListener("click", () => {
        salvarConfiguracao();
        novaPartida();
    });
    
    document.getElementById("btnReiniciarPartida").addEventListener("click", novaPartida);
    document.getElementById("btnMudarModo").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnJogarNovamente").addEventListener("click", novaPartida);
    document.getElementById("btnMudarModoFinal").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });

    elementosMemoria.tabuleiro.addEventListener("keydown", navegarComSetas);
}

inicializarJogoMemoria();
