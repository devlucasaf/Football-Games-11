import { estado, NIVEIS, PERFIS, VAGAS_ELENCO, POSICOES } from "./core.js";
import {
    carregarDados, criarLeilao, abrirLote, valorDeMercado, precoDoLance, lanceDaVoce, desistirDoLote,
    rodadaAdversarios, vezDaVoce, loteEncerrado, fecharLote, resolverSemVoce, proximoLote,
    vagasRestantes, lanceMaximo, classificar
} from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_leilao_config";

// --- ELEMENTOS DO DOM ---
const elementosLeilao = {
    painelConfiguracao: document.getElementById("painelConfiguracao"),
    areaJogo:           document.getElementById("areaJogo"),
    resultadoFinal:     document.getElementById("resultadoFinal"),
    valorOrcamento:     document.getElementById("valorOrcamento"),
    valorLote:          document.getElementById("valorLote"),
    valorVagas:         document.getElementById("valorVagas"),
    posJogador:         document.getElementById("posJogador"),
    nomeJogador:        document.getElementById("nomeJogador"),
    notaJogador:        document.getElementById("notaJogador"),
    valorMercado:       document.getElementById("valorMercado"),
    precoAtual:         document.getElementById("precoAtual"),
    liderAtual:         document.getElementById("liderAtual"),
    acoesLance:         document.getElementById("acoesLance"),
    btnDesistirLote:    document.getElementById("btnDesistirLote"),
    avisoLote:          document.getElementById("avisoLote"),
    listaAdversarios:   document.getElementById("listaAdversarios"),
    listaElenco:        document.getElementById("listaElenco"),
    listaHistorico:     document.getElementById("listaHistorico"),
    iconeResultado:     document.getElementById("iconeResultado"),
    textoResultado:     document.getElementById("textoResultado"),
    estrelasResultado:  document.getElementById("estrelasResultado"),
    resumoResultado:    document.getElementById("resumoResultado"),
    listaClassificacao: document.getElementById("listaClassificacao"),
    anuncioLeitorTela:  document.getElementById("anuncioLeitorTela")
};

const botoesLance = [...document.querySelectorAll(".leilao-botao-lance")];

// --- TEXTO TRADUZIDO COM FALLBACK ---
function texto(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- ESPERA UM TEMPO ---
function esperar(milissegundos) {
    const reduzir = document.documentElement.getAttribute("data-reduce-motion") === "true";
    return new Promise((resolver) => setTimeout(resolver, reduzir ? 80 : milissegundos));
}

// --- ANUNCIA PARA LEITORES DE TELA ---
function anunciar(mensagem) {
    elementosLeilao.anuncioLeitorTela.textContent = "";
    setTimeout(() => { elementosLeilao.anuncioLeitorTela.textContent = mensagem; }, 50);
}

// --- CRIA UM ÍCONE ---
function criarIcone(classe) {
    const icone = document.createElement("i");
    icone.className = `fas ${classe}`;
    icone.setAttribute("aria-hidden", "true");
    return icone;
}

// --- FORMATA DINHEIRO EM MILHÕES ---
function dinheiro(valor) {
    return `€ ${valor} mi`;
}

// --- SALVA E CARREGA A CONFIGURAÇÃO ---
function salvarConfiguracao() {
    localStorage.setItem(CHAVE_CONFIGURACAO, JSON.stringify(estado.configuracao));
}

/// --- CARREGA A CONFIGURAÇÃO ---
function carregarConfiguracao() {
    try {
        const salva = JSON.parse(localStorage.getItem(CHAVE_CONFIGURACAO));
        if (salva && NIVEIS[salva.nivel]) {
            estado.configuracao.nivel = salva.nivel;
        }
    } catch (erro) {
        localStorage.removeItem(CHAVE_CONFIGURACAO);
    }
}

/// --- ATUALIZA AS OPÇÕES DE NÍVEL ---
function atualizarOpcoes() {
    document.querySelectorAll(".leilao-opcao").forEach((btnOpcao) => {
        const ativa = btnOpcao.dataset.nivel === estado.configuracao.nivel;
        btnOpcao.classList.toggle("ativa", ativa);
        btnOpcao.setAttribute("aria-pressed", String(ativa));
    });
}

// --- REGISTRA UMA LINHA NA MESA DO LEILÃO ---
function registrarHistorico(mensagem, tipo) {
    const item = document.createElement("li");
    item.textContent = mensagem;
    if (tipo) {
        item.dataset.tipo = tipo;
    }
    elementosLeilao.listaHistorico.prepend(item);
    while (elementosLeilao.listaHistorico.children.length > 10) {
        elementosLeilao.listaHistorico.lastElementChild.remove();
    }
    anunciar(mensagem);
}

// --- PAINEL DE ORÇAMENTO, LOTE E VAGAS ---
function renderizarPainel() {
    const { leilao } = estado;
    const totalVagas = POSICOES.reduce((total, posicao) => total + VAGAS_ELENCO[posicao], 0);

    elementosLeilao.valorOrcamento.textContent = dinheiro(leilao.voce.orcamento);
    elementosLeilao.valorLote.textContent = `${Math.min(leilao.indice + 1, leilao.fila.length)}/${leilao.fila.length}`;
    elementosLeilao.valorVagas.textContent = `${totalVagas - vagasRestantes(leilao.voce)}/${totalVagas}`;
}

// --- SEU ELENCO, POR POSIÇÃO ---
function renderizarElenco() {
    const { voce } = estado.leilao;
    elementosLeilao.listaElenco.innerHTML = "";

    POSICOES.forEach((posicao) => {
        const comprados = voce.elenco.filter((jogador) => jogador.pos === posicao);

        for (let vaga = 0; vaga < VAGAS_ELENCO[posicao]; vaga++) {
            const item = document.createElement("li");
            const rotulo = document.createElement("span");
            rotulo.className = "leilao-elenco-pos";
            rotulo.textContent = posicao;
            item.appendChild(rotulo);

            const jogador = comprados[vaga];
            const detalhe = document.createElement("span");
            if (jogador) {
                item.className = "preenchida";
                detalhe.textContent = `${jogador.nome} · ${jogador.nota} · ${dinheiro(jogador.preco)}`;
            } else {
                item.className = "vazia";
                detalhe.textContent = texto("leilao-empty-slot", "Vaga aberta");
            }
            item.appendChild(detalhe);
            elementosLeilao.listaElenco.appendChild(item);
        }
    });
}

// --- ADVERSÁRIOS ---
function renderizarAdversarios() {
    const { leilao } = estado;
    const lider = leilao.lote ? leilao.lote.lider : null;
    elementosLeilao.listaAdversarios.innerHTML = "";

    leilao.adversarios.forEach((adversario) => {
        const perfil = PERFIS[adversario.perfil];
        const item = document.createElement("li");
        item.className = "leilao-adversario";
        item.classList.toggle("lider", lider === adversario.id);

        const nome = document.createElement("strong");
        nome.append(criarIcone(perfil.icone), ` ${adversario.nome}`);

        const dados = document.createElement("span");
        dados.className = "leilao-adversario-dados";
        const totalVagas = POSICOES.reduce((total, posicao) => total + VAGAS_ELENCO[posicao], 0);
        dados.textContent = `${dinheiro(adversario.orcamento)} · ${totalVagas - vagasRestantes(adversario)}/${totalVagas}`;

        const descricao = document.createElement("small");
        descricao.textContent = texto(`leilao-perfil-${adversario.perfil}`, perfil.descricao);

        item.append(nome, dados, descricao);
        elementosLeilao.listaAdversarios.appendChild(item);
    });
}

// --- LANCE ATUAL E LÍDER ---
function renderizarLance() {
    const { leilao } = estado;
    const lote = leilao.lote;
    if (!lote) {
        return;
    }

    if (lote.lider === null) {
        elementosLeilao.precoAtual.textContent = `${dinheiro(lote.base)} ${texto("leilao-base-tag", "(base)")}`;
        elementosLeilao.liderAtual.textContent = texto("leilao-no-bids", "Sem lances ainda");
    } else {
        elementosLeilao.precoAtual.textContent = dinheiro(lote.preco);
        const nomeLider = lote.lider === "voce"
            ? texto("leilao-you", "Você")
            : leilao.adversarios.find((adversario) => adversario.id === lote.lider).nome;
        elementosLeilao.liderAtual.textContent = `${texto("leilao-leader", "Líder")}: ${nomeLider}`;
    }
    renderizarAdversarios();
}

// --- BOTÕES DE LANCE E DESISTÊNCIA ---
function atualizarBotoes() {
    const { leilao } = estado;
    const lote = leilao.lote;
    const minhaVez = Boolean(lote) && vezDaVoce(leilao) && !estado.ocupado;
    const abertura = Boolean(lote) && lote.lider === null;
    const maximo = lanceMaximo(leilao.voce);

    botoesLance.forEach((botao, indice) => {
        const incremento = Number(botao.dataset.incremento);
        if (!lote) {
            botao.classList.add("hidden");
            return;
        }

        botao.classList.toggle("hidden", abertura && indice > 0);
        const preco = precoDoLance(lote, incremento);
        botao.textContent = abertura
            ? `${texto("leilao-open-bid", "Abrir lance")}: ${dinheiro(preco)}`
            : `+${incremento} → ${dinheiro(preco)}`;
        botao.disabled = !minhaVez || preco > maximo;
    });

    elementosLeilao.btnDesistirLote.disabled = !minhaVez;
}

// --- DESENHA O LOTE ATUAL ---
function renderizarLote() {
    const { leilao } = estado;
    const lote = leilao.lote;

    elementosLeilao.posJogador.textContent = lote.jogador.pos;
    elementosLeilao.nomeJogador.textContent = lote.jogador.nome;
    elementosLeilao.notaJogador.textContent = lote.jogador.nota;
    elementosLeilao.valorMercado.textContent = dinheiro(valorDeMercado(lote.jogador.nota));
    elementosLeilao.avisoLote.textContent = "";

    renderizarPainel();
    renderizarLance();
    atualizarBotoes();
}

// --- DESCREVE UM LANCE DE ADVERSÁRIO NA TELA ---
function mostrarEvento(evento) {
    const lote = estado.leilao.lote;

    if (evento.tipo === "lance") {
        elementosLeilao.precoAtual.textContent = dinheiro(evento.preco);
        elementosLeilao.liderAtual.textContent = `${texto("leilao-leader", "Líder")}: ${evento.adversario.nome}`;
        registrarHistorico(`${evento.adversario.nome} ${texto("leilao-bids", "dá lance de")} ${dinheiro(evento.preco)}.`, "lance");
    } else {
        registrarHistorico(`${evento.adversario.nome} ${texto("leilao-drops", "desiste de")} ${lote.jogador.nome}.`, "desiste");
    }
    renderizarAdversarios();
}

// --- DEIXA OS ADVERSÁRIOS RESPONDEREM ATÉ SER SUA VEZ OU O LOTE ACABAR ---
async function processarAdversarios() {
    const { leilao } = estado;

    while (!loteEncerrado(leilao) && !vezDaVoce(leilao)) {
        const eventos = rodadaAdversarios(leilao);
        for (const evento of eventos) {
            await esperar(650);
            mostrarEvento(evento);
        }
        if (eventos.length === 0) {
            break;
        }
    }
}

// --- FECHA O LOTE ATUAL ---
async function concluirLote() {
    const { leilao } = estado;
    const resultado = fecharLote(leilao);

    if (!resultado.vendido) {
        registrarHistorico(`${resultado.jogador.nome} ${texto("leilao-unsold", "ficou sem comprador.")}`, "aviso");
    } else if (resultado.comprador.id === "voce") {
        registrarHistorico(`${texto("leilao-you-won", "Você levou")} ${resultado.jogador.nome} ${texto("leilao-for", "por")} ${dinheiro(resultado.preco)}!`, "vitoria");
    } else {
        registrarHistorico(`${resultado.jogador.nome} ${texto("leilao-sold-to", "vendido para")} ${resultado.comprador.nome} ${texto("leilao-for", "por")} ${dinheiro(resultado.preco)}.`, "venda");
    }

    renderizarPainel();
    renderizarElenco();
    renderizarAdversarios();
    await esperar(900);
    await avancarLeilao();
}

// --- ESCOLHE O PRÓXIMO LOTE QUE PRECISA DA SUA DECISÃO ---
async function avancarLeilao() {
    const { leilao } = estado;
    estado.ocupado = true;

    while (leilao.indice < leilao.fila.length) {
        const lote = abrirLote(leilao);

        if (!lote.voceAtivo) {
            resolverSemVoce(leilao);
            proximoLote(leilao);
            continue;
        }

        renderizarLote();
        estado.ocupado = false;
        atualizarBotoes();
        elementosLeilao.btnDesistirLote.focus();
        return;
    }

    estado.ocupado = false;
    renderizarPainel();
    renderizarAdversarios();
    finalizarLeilao();
}

// --- VOCÊ DÁ UM LANCE ---
async function darLance(incremento) {
    if (!estado.jogando || estado.ocupado) {
        return;
    }

    const { leilao } = estado;
    if (!vezDaVoce(leilao) || !lanceDaVoce(leilao, incremento)) {
        return;
    }

    estado.ocupado = true;
    atualizarBotoes();
    renderizarLance();
    registrarHistorico(`${texto("leilao-you", "Você")} ${texto("leilao-bids", "dá lance de")} ${dinheiro(leilao.lote.preco)}.`, "lance");

    await processarAdversarios();
    estado.ocupado = false;

    if (loteEncerrado(leilao)) {
        estado.ocupado = true;
        await concluirLote();
    } else {
        atualizarBotoes();
        elementosLeilao.avisoLote.textContent = texto("leilao-your-turn", "Cobriram seu lance. Sua vez!");
    }
}

// --- VOCÊ DESISTE DO JOGADOR ---
async function desistir() {
    if (!estado.jogando || estado.ocupado) {
        return;
    }

    const { leilao } = estado;
    if (!vezDaVoce(leilao)) {
        return;
    }

    estado.ocupado = true;
    desistirDoLote(leilao);
    atualizarBotoes();
    registrarHistorico(`${texto("leilao-you", "Você")} ${texto("leilao-drops", "desiste de")} ${leilao.lote.jogador.nome}.`, "desiste");

    await processarAdversarios();
    await concluirLote();
}

// --- ESTRELAS PELA VANTAGEM SOBRE O 2º LUGAR ---
function calcularEstrelas(vantagem) {
    if (vantagem >= 6) {
        return 3;
    } else if (vantagem >= 3) {
        return 2;
    }
    return 1;
}

// --- FINALIZA O LEILÃO ---
function finalizarLeilao() {
    estado.jogando = false;

    const tabela = classificar(estado.leilao);
    const posicao = tabela.findIndex((linha) => linha.participante.id === "voce") + 1;
    const venceu = posicao === 1;
    const vantagem = tabela[0].nota - tabela[1].nota;
    const estrelas = venceu ? calcularEstrelas(vantagem) : 0;
    let titulo;

    if (venceu) {
        titulo = texto("leilao-win", "Melhor elenco do leilão!");
        elementosLeilao.iconeResultado.className = "round-icon correct";
        elementosLeilao.iconeResultado.innerHTML = "<i class=\"fas fa-trophy\"></i>";
    } else {
        titulo = texto("leilao-loss", "Seu elenco ficou para trás.");
        elementosLeilao.iconeResultado.className = "round-icon wrong";
        elementosLeilao.iconeResultado.innerHTML = "<i class=\"fas fa-gavel\"></i>";
    }

    const minhaLinha = tabela[posicao - 1];
    const resumo = `${posicao}º ${texto("leilao-place", "lugar")} · ` +
        `${texto("leilao-total-rating", "Nota total")}: ${minhaLinha.nota} · ` +
        `${texto("leilao-spent", "Gasto")}: ${dinheiro(minhaLinha.participante.gasto)}`;

    elementosLeilao.textoResultado.textContent = titulo;
    elementosLeilao.resumoResultado.textContent = resumo;
    elementosLeilao.estrelasResultado.innerHTML = "";
    elementosLeilao.estrelasResultado.classList.toggle("hidden", !venceu);
    elementosLeilao.estrelasResultado.setAttribute("aria-label", `${estrelas} ${texto("memoria-stars", "estrelas")}`);

    for (let indiceEstrela = 0; indiceEstrela < 3; indiceEstrela++) {
        const estrela = criarIcone("fa-star");
        if (indiceEstrela < estrelas) {
            estrela.classList.add("cheia");
        }
        elementosLeilao.estrelasResultado.appendChild(estrela);
    }

    renderizarClassificacao(tabela);

    setTimeout(() => {
        elementosLeilao.areaJogo.classList.add("hidden");
        elementosLeilao.resultadoFinal.classList.remove("hidden");
        anunciar(`${titulo} ${resumo}`);
    }, 600);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-leilao", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-leilao", {
                venceu,
                titulo,
                resposta: resumo,
                tamanho: 3,
                rotulos: ["★", "★★", "★★★"],
                tituloGrafico: texto("memoria-chart-title", "Vitórias por estrelas"),
                bucketAtual: estrelas - 1,
                onReiniciar: novoLeilao,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }, 1200);
    }
}

// --- CLASSIFICAÇÃO FINAL ---
function renderizarClassificacao(tabela) {
    elementosLeilao.listaClassificacao.innerHTML = "";

    tabela.forEach((linha) => {
        const { participante, nota } = linha;
        const item = document.createElement("li");
        item.className = "leilao-classificacao-item";
        item.classList.toggle("voce", participante.id === "voce");

        const titulo = document.createElement("strong");
        titulo.textContent = `${participante.nome} · ${nota}`;

        const detalhe = document.createElement("span");
        const reservas = participante.elenco.filter((jogador) => jogador.reserva).length;
        const gasto = `${texto("leilao-spent", "Gasto")}: ${dinheiro(participante.gasto)}`;
        const aviso = reservas > 0 ? ` · ${reservas} ${texto("leilao-fillers", "reserva(s) genérico(s)")}` : "";
        detalhe.textContent = `${gasto}${aviso}`;

        const elenco = document.createElement("small");
        elenco.textContent = participante.elenco
            .map((jogador) => `${jogador.nome} (${jogador.nota})`)
            .join(", ");

        item.append(titulo, detalhe, elenco);
        elementosLeilao.listaClassificacao.appendChild(item);
    });
}

// --- COMEÇA UM LEILÃO NOVO ---
async function novoLeilao() {
    estado.leilao = criarLeilao(estado.configuracao.nivel);
    estado.jogando = true;
    estado.ocupado = true;

    elementosLeilao.painelConfiguracao.classList.add("hidden");
    elementosLeilao.resultadoFinal.classList.add("hidden");
    elementosLeilao.areaJogo.classList.remove("hidden");
    elementosLeilao.listaHistorico.innerHTML = "";

    renderizarPainel();
    renderizarElenco();
    renderizarAdversarios();
    registrarHistorico(texto("leilao-opened", "O leilão está aberto!"), "aviso");
    await avancarLeilao();
}

// --- VOLTA PARA A ESCOLHA DE NÍVEL ---
function abrirConfiguracao() {
    estado.jogando = false;
    elementosLeilao.areaJogo.classList.add("hidden");
    elementosLeilao.resultadoFinal.classList.add("hidden");
    elementosLeilao.painelConfiguracao.classList.remove("hidden");
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoLeilao() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    document.querySelectorAll(".leilao-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao.nivel = btnOpcao.dataset.nivel;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarLeilao").addEventListener("click", () => {
        salvarConfiguracao();
        novoLeilao();
    });

    botoesLance.forEach((botao) => {
        botao.addEventListener("click", () => darLance(Number(botao.dataset.incremento)));
    });
    elementosLeilao.btnDesistirLote.addEventListener("click", desistir);
    document.getElementById("btnNovoLeilao").addEventListener("click", novoLeilao);
    document.getElementById("btnMudarNivel").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
}

inicializarJogoLeilao();
