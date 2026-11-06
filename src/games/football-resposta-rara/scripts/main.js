import { estado, NIVEIS, TENTATIVAS_POR_RODADA, CUSTO_DICA, META_MEDIA } from "./core.js";
import {
    carregarDados, gerarCategorias, textoDaCategoria, atende, respostasValidas, faixaDoJogador,
    pontosMaximos, registrarEscolha, buscarJogadores, iniciais
} from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_rara_config";

// --- ELEMENTOS DO DOM ---
const elementosJogo = {
    painelConfiguracao:  document.getElementById("painelConfiguracao"),
    areaJogo:            document.getElementById("areaJogo"),
    resultadoFinal:      document.getElementById("resultadoFinal"),
    contadorRodada:      document.getElementById("contadorRodada"),
    contadorPontos:      document.getElementById("contadorPontos"),
    contadorTentativas:  document.getElementById("contadorTentativas"),
    textoCategoria:      document.getElementById("textoCategoria"),
    infoCategoria:       document.getElementById("infoCategoria"),
    blocoBusca:          document.getElementById("blocoBusca"),
    campoJogador:        document.getElementById("campoJogador"),
    listaSugestoes:      document.getElementById("listaSugestoes"),
    mensagemJogo:        document.getElementById("mensagemJogo"),
    acoesRodada:         document.getElementById("acoesRodada"),
    btnDica:             document.getElementById("btnDica"),
    fimRodada:           document.getElementById("fimRodada"),
    seloResposta:        document.getElementById("seloResposta"),
    resultadoRodada:     document.getElementById("resultadoRodada"),
    listaMelhores:       document.getElementById("listaMelhores"),
    textoProxima:        document.getElementById("textoProxima"),
    iconeResultado:      document.getElementById("iconeResultado"),
    textoResultado:      document.getElementById("textoResultado"),
    estrelasResultado:   document.getElementById("estrelasResultado"),
    resumoResultado:     document.getElementById("resumoResultado"),
    listaRevisao:        document.getElementById("listaRevisao"),
    anuncioLeitorTela:   document.getElementById("anuncioLeitorTela")
};

let sugestoesAtuais = [];
let sugestaoSelecionada = -1;

// --- TEXTO TRADUZIDO COM FALLBACK ---
function texto(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- ANUNCIA PARA LEITORES DE TELA ---
function anunciar(mensagem) {
    elementosJogo.anuncioLeitorTela.textContent = "";
    setTimeout(() => { elementosJogo.anuncioLeitorTela.textContent = mensagem; }, 50);
}

// --- CRIA UM ÍCONE ---
function criarIcone(classe) {
    const icone = document.createElement("i");
    icone.className = `fas ${classe}`;
    icone.setAttribute("aria-hidden", "true");
    return icone;
}

// --- SALVA E CARREGA A CONFIGURAÇÃO ---
function salvarConfiguracao() {
    localStorage.setItem(CHAVE_CONFIGURACAO, JSON.stringify(estado.configuracao));
}

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

// --- ATUALIZA OS BOTÕES DE NÍVEL ---
function atualizarOpcoes() {
    document.querySelectorAll(".rara-opcao").forEach((btnOpcao) => {
        const ativa = btnOpcao.dataset.nivel === estado.configuracao.nivel;
        btnOpcao.classList.toggle("ativa", ativa);
        btnOpcao.setAttribute("aria-pressed", String(ativa));
    });
}

// --- MENSAGEM DO JOGO ---
function mostrarMensagem(mensagem, tipo) {
    elementosJogo.mensagemJogo.textContent = mensagem;
    elementosJogo.mensagemJogo.dataset.tipo = tipo || "";
    if (mensagem) {
        anunciar(mensagem);
    }
}

// --- TOTAL DE PONTOS ---
function totalDePontos() {
    return estado.resultados.reduce((soma, resultado) => soma + resultado.pontos, 0);
}

// --- RENDERIZA O PAINEL ---
function renderizarPainel() {
    elementosJogo.contadorRodada.textContent = `${estado.rodadaAtual + 1}/${estado.rodadas.length}`;
    elementosJogo.contadorPontos.textContent = totalDePontos();
    elementosJogo.contadorTentativas.textContent = Math.max(0, TENTATIVAS_POR_RODADA - estado.tentativas);
}

// --- SUGESTÕES DE NOMES ---
function fecharSugestoes() {
    elementosJogo.listaSugestoes.classList.add("hidden");
    elementosJogo.listaSugestoes.innerHTML = "";
    elementosJogo.campoJogador.setAttribute("aria-expanded", "false");
    sugestoesAtuais = [];
    sugestaoSelecionada = -1;
}

// --- ATUALIZA A LISTA DE SUGESTÕES ---
function atualizarSugestoes() {
    sugestoesAtuais = buscarJogadores(elementosJogo.campoJogador.value, 8);
    sugestaoSelecionada = sugestoesAtuais.length > 0 ? 0 : -1;
    elementosJogo.listaSugestoes.innerHTML = "";

    if (sugestoesAtuais.length === 0) {
        elementosJogo.listaSugestoes.classList.add("hidden");
        elementosJogo.campoJogador.setAttribute("aria-expanded", "false");
        return;
    }

    sugestoesAtuais.forEach((jogador, posicao) => {
        const item = document.createElement("li");
        item.setAttribute("role", "option");
        item.className = "rara-sugestao";
        item.classList.toggle("usado", estado.usados.has(jogador.indice));
        item.classList.toggle("selecionada", posicao === sugestaoSelecionada);
        item.textContent = jogador.nome;

        item.addEventListener("mousedown", (evento) => {
            evento.preventDefault();
            enviarResposta(jogador);
        });
        elementosJogo.listaSugestoes.appendChild(item);
    });

    elementosJogo.listaSugestoes.classList.remove("hidden");
    elementosJogo.campoJogador.setAttribute("aria-expanded", "true");
}

// --- MOVE A SUGESTÃO SELECIONADA ---
function moverSugestao(deslocamento) {
    if (sugestoesAtuais.length === 0) {
        return;
    }
    sugestaoSelecionada = (sugestaoSelecionada + deslocamento + sugestoesAtuais.length) % sugestoesAtuais.length;
    [...elementosJogo.listaSugestoes.children].forEach((item, posicao) => {
        item.classList.toggle("selecionada", posicao === sugestaoSelecionada);
    });
}

// --- CATEGORIA DA RODADA ATUAL ---
function categoriaAtual() {
    return estado.rodadas[estado.rodadaAtual];
}

// --- MOSTRA UMA RODADA ---
function abrirRodada() {
    const categoria = categoriaAtual();
    estado.tentativas = 0;
    estado.dicaUsada = false;
    estado.rodadaEncerrada = false;

    elementosJogo.textoCategoria.textContent = textoDaCategoria(categoria);
    elementosJogo.infoCategoria.textContent = "";
    elementosJogo.campoJogador.value = "";
    elementosJogo.blocoBusca.classList.remove("hidden");
    elementosJogo.acoesRodada.classList.remove("hidden");
    elementosJogo.fimRodada.classList.add("hidden");
    elementosJogo.btnDica.disabled = false;
    fecharSugestoes();
    mostrarMensagem("");
    renderizarPainel();
    elementosJogo.campoJogador.focus();
}

// --- PONTOS DA RODADA ---
function pontosDaResposta(jogador) {
    const faixa = faixaDoJogador(jogador);
    const desconto = estado.dicaUsada ? CUSTO_DICA : 0;
    return { faixa, pontos: Math.max(0, faixa.pontos - desconto) };
}

// --- MOSTRA O FIM DA RODADA ---
function encerrarRodada(resultado) {
    estado.rodadaEncerrada = true;
    estado.resultados.push(resultado);
    fecharSugestoes();

    elementosJogo.blocoBusca.classList.add("hidden");
    elementosJogo.acoesRodada.classList.add("hidden");
    elementosJogo.fimRodada.classList.remove("hidden");
    mostrarMensagem("");

    const categoria = categoriaAtual();
    elementosJogo.seloResposta.className = "rara-selo";

    if (resultado.jogador) {
        elementosJogo.seloResposta.textContent = `${resultado.jogador.nome} · ${texto(resultado.faixa.chave, resultado.faixa.rotulo)}`;
        elementosJogo.seloResposta.classList.add(`faixa-${resultado.faixa.pontos}`);
        const desconto = resultado.dica ? ` (${texto("rara-hint-cost", "dica")}: -${CUSTO_DICA})` : "";
        elementosJogo.resultadoRodada.textContent = `+${resultado.pontos} ${texto("rara-points-lower", "pontos")}${desconto}`;
    } else {
        elementosJogo.seloResposta.textContent = texto("rara-no-answer", "Sem resposta válida");
        elementosJogo.seloResposta.classList.add("faixa-0");
        elementosJogo.resultadoRodada.textContent = `+0 ${texto("rara-points-lower", "pontos")}`;
    }

    const melhores = respostasValidas(categoria)
        .filter((jogador) => !resultado.jogador || jogador.indice !== resultado.jogador.indice)
        .filter((jogador) => !resultado.jogador || faixaDoJogador(jogador).pontos > resultado.faixa.pontos)
        .sort((a, b) => faixaDoJogador(b).pontos - faixaDoJogador(a).pontos || a.nome.localeCompare(b.nome))
        .slice(0, 3);

    elementosJogo.listaMelhores.innerHTML = "";
    if (melhores.length === 0) {
        const item = document.createElement("li");
        item.textContent = texto("rara-best-already", "Você já achou uma das respostas mais raras!");
        elementosJogo.listaMelhores.appendChild(item);
    }
    melhores.forEach((jogador) => {
        const item = document.createElement("li");
        item.textContent = `${jogador.nome} (${faixaDoJogador(jogador).pontos})`;
        elementosJogo.listaMelhores.appendChild(item);
    });

    const ultima = estado.rodadaAtual >= estado.rodadas.length - 1;
    elementosJogo.textoProxima.textContent = ultima
        ? texto("rara-see-result", "Ver resultado")
        : texto("rara-next", "Próxima rodada");

    renderizarPainel();
    anunciar(`${elementosJogo.seloResposta.textContent}. ${elementosJogo.resultadoRodada.textContent}`);
    document.getElementById("btnProxima").focus();
}

// --- ENVIA UMA RESPOSTA ---
function enviarResposta(jogador) {
    if (!estado.jogando || estado.rodadaEncerrada) {
        return;
    }

    if (estado.usados.has(jogador.indice)) {
        mostrarMensagem(`${jogador.nome} ${texto("rara-already-used", "já foi usado em outra rodada.")}`, "aviso");
        return;
    }

    elementosJogo.campoJogador.value = "";
    fecharSugestoes();
    const categoria = categoriaAtual();

    if (!atende(jogador, categoria)) {
        estado.tentativas++;
        renderizarPainel();

        if (estado.tentativas >= TENTATIVAS_POR_RODADA) {
            encerrarRodada({ categoria, jogador: null, faixa: null, pontos: 0, dica: estado.dicaUsada });
            return;
        }
        mostrarMensagem(`${jogador.nome} ${texto("rara-does-not-fit", "não atende a esta categoria.")}`, "erro");
        return;
    }

    const { faixa, pontos } = pontosDaResposta(jogador);
    estado.usados.add(jogador.indice);
    registrarEscolha(jogador);
    encerrarRodada({ categoria, jogador, faixa, pontos, dica: estado.dicaUsada });
}

// --- DICA: INICIAIS DE UMA RESPOSTA RARA ---
function pedirDica() {
    if (!estado.jogando || estado.rodadaEncerrada || estado.dicaUsada) {
        return;
    }

    const categoria = categoriaAtual();
    const raras = respostasValidas(categoria)
        .filter((jogador) => !estado.usados.has(jogador.indice))
        .filter((jogador) => faixaDoJogador(jogador).pontos >= 60);

    if (raras.length === 0) {
        mostrarMensagem(texto("rara-no-hint", "Não há dica rara disponível nesta rodada."), "aviso");
        return;
    }

    const sorteado = raras[Math.floor(Math.random() * raras.length)];
    estado.dicaUsada = true;
    elementosJogo.btnDica.disabled = true;
    elementosJogo.infoCategoria.textContent =
        `${texto("rara-hint-reveal", "Dica")}: ${iniciais(sorteado.nome)} (${sorteado.pos})`;
}

// --- ESTRELAS PELA MÉDIA DE PONTOS ---
function calcularEstrelas(media) {
    if (media >= META_MEDIA[2]) {
        return 3;
    } else if (media >= META_MEDIA[1]) {
        return 2;
    } else if (media >= META_MEDIA[0]) {
        return 1;
    }
    return 0;
}

// --- REVISÃO NO FINAL ---
function renderizarRevisao() {
    elementosJogo.listaRevisao.innerHTML = "";

    estado.resultados.forEach((resultado) => {
        const item = document.createElement("li");
        item.className = `rara-revisao-item ${resultado.jogador ? "acertou" : "faltou"}`;

        const titulo = document.createElement("strong");
        titulo.append(criarIcone(resultado.jogador ? "fa-check" : "fa-xmark"), ` ${textoDaCategoria(resultado.categoria)}`);

        const detalhe = document.createElement("span");
        if (resultado.jogador) {
            detalhe.textContent = `${resultado.jogador.nome} · +${resultado.pontos}`;
        } else {
            detalhe.textContent = texto("rara-no-answer", "Sem resposta válida");
        }

        const maximo = document.createElement("small");
        maximo.textContent = `${texto("rara-max-possible", "Máximo possível")}: ${pontosMaximos(resultado.categoria)}`;

        item.append(titulo, detalhe, maximo);
        elementosJogo.listaRevisao.appendChild(item);
    });
}

// --- FINALIZA A PARTIDA ---
function finalizarJogo() {
    estado.jogando = false;
    fecharSugestoes();

    const total = totalDePontos();
    const media = total / estado.rodadas.length;
    const estrelas = calcularEstrelas(media);
    const venceu = estrelas >= 1;
    let titulo;

    if (venceu) {
        titulo = texto("rara-win", "Você foi além dos craques famosos!");
        elementosJogo.iconeResultado.className = "round-icon correct";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-gem\"></i>";
    } else {
        titulo = texto("rara-loss", "Respostas óbvias demais desta vez.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-star-half-stroke\"></i>";
    }

    const resumo = `${texto("rara-points", "Pontos")}: ${total} · ` +
        `${texto("rara-average", "Média por rodada")}: ${Math.round(media)}`;

    elementosJogo.textoResultado.textContent = titulo;
    elementosJogo.resumoResultado.textContent = resumo;
    elementosJogo.estrelasResultado.innerHTML = "";
    elementosJogo.estrelasResultado.classList.toggle("hidden", !venceu);
    elementosJogo.estrelasResultado.setAttribute("aria-label", `${estrelas} ${texto("memoria-stars", "estrelas")}`);

    for (let indiceEstrela = 0; indiceEstrela < 3; indiceEstrela++) {
        const estrela = criarIcone("fa-star");
        if (indiceEstrela < estrelas) {
            estrela.classList.add("cheia");
        }
        elementosJogo.estrelasResultado.appendChild(estrela);
    }

    renderizarRevisao();

    elementosJogo.areaJogo.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.remove("hidden");
    anunciar(`${titulo} ${resumo}`);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-resposta-rara", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-resposta-rara", {
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

// --- PRÓXIMA RODADA OU FIM ---
function avancar() {
    if (!estado.rodadaEncerrada) {
        return;
    }
    if (estado.rodadaAtual >= estado.rodadas.length - 1) {
        finalizarJogo();
        return;
    }
    estado.rodadaAtual++;
    abrirRodada();
}

// --- COMEÇA UMA PARTIDA NOVA ---
function novaPartida() {
    const categorias = gerarCategorias(estado.configuracao.nivel);
    if (categorias.length === 0) {
        return;
    }

    estado.rodadas = categorias;
    estado.rodadaAtual = 0;
    estado.usados = new Set();
    estado.resultados = [];
    estado.jogando = true;

    elementosJogo.painelConfiguracao.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.areaJogo.classList.remove("hidden");
    abrirRodada();
}

// --- VOLTA PARA A ESCOLHA DE NÍVEL ---
function abrirConfiguracao() {
    estado.jogando = false;
    elementosJogo.areaJogo.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.painelConfiguracao.classList.remove("hidden");
}

// --- TECLADO NO CAMPO DE BUSCA ---
function aoDigitar(evento) {
    if (evento.key === "ArrowDown") {
        evento.preventDefault();
        moverSugestao(1);
    } else if (evento.key === "ArrowUp") {
        evento.preventDefault();
        moverSugestao(-1);
    } else if (evento.key === "Enter") {
        evento.preventDefault();
        if (sugestaoSelecionada >= 0) {
            enviarResposta(sugestoesAtuais[sugestaoSelecionada]);
        }
    } else if (evento.key === "Escape") {
        fecharSugestoes();
    }
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoRara() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    document.querySelectorAll(".rara-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao.nivel = btnOpcao.dataset.nivel;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarPartida").addEventListener("click", () => {
        salvarConfiguracao();
        novaPartida();
    });

    elementosJogo.campoJogador.addEventListener("input", atualizarSugestoes);
    elementosJogo.campoJogador.addEventListener("keydown", aoDigitar);
    elementosJogo.campoJogador.addEventListener("blur", () => setTimeout(fecharSugestoes, 100));

    elementosJogo.btnDica.addEventListener("click", pedirDica);
    document.getElementById("btnPular").addEventListener("click", () => {
        if (estado.jogando && !estado.rodadaEncerrada) {
            encerrarRodada({ categoria: categoriaAtual(), jogador: null, faixa: null, pontos: 0, dica: estado.dicaUsada });
        }
    });
    document.getElementById("btnProxima").addEventListener("click", avancar);
    document.getElementById("btnJogarNovamente").addEventListener("click", novaPartida);
    document.getElementById("btnMudarNivel").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
}

inicializarJogoRara();
