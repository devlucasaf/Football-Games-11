import {
    estado, COMPETICOES, NOMES_FASE, CUSTO_DICAS, PENALIDADE_ERRO, MAXIMO_ERROS, META_ESTRELAS
} from "./core.js";
import {
    carregarDados, sortearEdicao, montarJogos, dadosDaSelecao, buscarSelecoes, textoDoPlacar,
    pontosDoAcerto, totalDePontos, pontosMaximos, encontrarJogo
} from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_taca_config";
const PADRAO_BANDEIRA = /^[a-z]{2}(-[a-z]{3})?$/;

// --- ELEMENTOS DO DOM ---
const elementosJogo = {
    painelConfiguracao: document.getElementById("painelConfiguracao"),
    areaJogo:           document.getElementById("areaJogo"),
    resultadoFinal:     document.getElementById("resultadoFinal"),
    tituloEdicao:       document.getElementById("tituloEdicao"),
    subtituloEdicao:    document.getElementById("subtituloEdicao"),
    contadorAcertos:    document.getElementById("contadorAcertos"),
    contadorPontos:     document.getElementById("contadorPontos"),
    contadorErros:      document.getElementById("contadorErros"),
    listaJogos:         document.getElementById("listaJogos"),
    campoSelecao:       document.getElementById("campoSelecao"),
    listaSugestoes:     document.getElementById("listaSugestoes"),
    mensagemJogo:       document.getElementById("mensagemJogo"),
    iconeResultado:     document.getElementById("iconeResultado"),
    textoResultado:     document.getElementById("textoResultado"),
    estrelasResultado:  document.getElementById("estrelasResultado"),
    resumoResultado:    document.getElementById("resumoResultado"),
    listaRevisao:       document.getElementById("listaRevisao"),
    anuncioLeitorTela:  document.getElementById("anuncioLeitorTela")
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

// --- CRIA UMA BANDEIRA ---
function criarBandeira(nomeSelecao) {
    const { bandeira } = dadosDaSelecao(nomeSelecao);
    if (!bandeira || !PADRAO_BANDEIRA.test(bandeira)) {
        return criarIcone("fa-flag");
    }

    const imagem = document.createElement("img");
    
    imagem.className = "taca-bandeira";
    imagem.src = `https://flagcdn.com/w80/${bandeira}.png`;
    imagem.srcset = `https://flagcdn.com/w160/${bandeira}.png 2x`;
    imagem.alt = "";
    imagem.addEventListener("error", () => imagem.replaceWith(criarIcone("fa-flag")));
    
    return imagem;
}

// --- SALVA E CARREGA A CONFIGURAÇÃO ---
function salvarConfiguracao() {
    localStorage.setItem(CHAVE_CONFIGURACAO, JSON.stringify(estado.configuracao));
}

// --- CARREGA A CONFIGURAÇÃO ---
function carregarConfiguracao() {
    try {
        const salva = JSON.parse(localStorage.getItem(CHAVE_CONFIGURACAO));
        if (salva && COMPETICOES[salva.competicao]) {
            estado.configuracao.competicao = salva.competicao;
        }
    } catch (erro) {
        localStorage.removeItem(CHAVE_CONFIGURACAO);
    }
}

// --- ATUALIZA AS OPÇÕES DE COMPETIÇÃO ---
function atualizarOpcoes() {
    document.querySelectorAll(".taca-opcao").forEach((btnOpcao) => {
        const ativa = btnOpcao.dataset.competicao === estado.configuracao.competicao;
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

// --- NOME DA FASE DE UM JOGO ---
function nomeDaFase(jogo) {
    const fase = NOMES_FASE[jogo.fase];
    let nome = texto(fase.chave, fase.nome);

    if (jogo.fase === "G") {
        const numero = estado.jogos.filter((outro) => outro.fase === "G" && outro.indice <= jogo.indice).length;
        nome += ` · ${texto("taca-match", "jogo")} ${numero}`;
    }
    return nome;
}

// --- PAINEL DE PROGRESSO ---
function renderizarPainel() {
    const acertos = estado.jogos.filter((jogo) => jogo.status === "certo").length;
    elementosJogo.contadorAcertos.textContent = `${acertos}/${estado.jogos.length}`;
    elementosJogo.contadorPontos.textContent = totalDePontos();
    elementosJogo.contadorErros.textContent = `${estado.erros}/${MAXIMO_ERROS}`;
}

// --- CRIA UM BOTÃO DE DICA ---
function criarBotaoDica(jogo, tipo, icone, rotulo) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "taca-dica";
    botao.disabled = jogo.dicas[tipo] || jogo.status !== "aberto";
    botao.append(criarIcone(icone), ` ${rotulo} (-${CUSTO_DICAS[tipo]})`);
    botao.addEventListener("click", (evento) => {
        evento.stopPropagation();
        pedirDica(jogo, tipo);
    });
    return botao;
}

// --- DESENHA A CAMPANHA ---
function renderizarJogos() {
    elementosJogo.listaJogos.innerHTML = "";

    estado.jogos.forEach((jogo) => {
        const item = document.createElement("li");
        item.className = `taca-jogo status-${jogo.status}`;
        item.classList.toggle("selecionado", jogo.indice === estado.selecionado && jogo.status === "aberto");

        const cabecalho = document.createElement("div");
        cabecalho.className = "taca-jogo-fase";
        cabecalho.textContent = nomeDaFase(jogo);

        const corpo = document.createElement("div");
        corpo.className = "taca-jogo-corpo";

        if (jogo.status === "aberto") {
            const resumo = document.createElement("div");
            resumo.className = "taca-jogo-pistas";

            if (jogo.dicas.bandeira) {
                resumo.appendChild(criarBandeira(jogo.adversario));
            }

            const pistas = [];
            if (jogo.dicas.pais) {
                const { confed } = dadosDaSelecao(jogo.adversario);
                pistas.push(`${confed} · ${jogo.adversario.length} ${texto("taca-letters", "letras")}`);
            }

            if (jogo.dicas.placar) {
                pistas.push(`${texto("taca-score", "Placar")}: ${textoDoPlacar(jogo)}`);
            }

            const interrogacao = document.createElement("strong");
            interrogacao.textContent = pistas.length > 0 ? pistas.join(" · ") : "???";
            resumo.appendChild(interrogacao);
            corpo.appendChild(resumo);

            const dicas = document.createElement("div");
            dicas.className = "taca-dicas";
            dicas.append(
                criarBotaoDica(jogo, "pais", "fa-earth-europe", texto("taca-hint-country", "País")),
                criarBotaoDica(jogo, "bandeira", "fa-flag", texto("taca-hint-flag", "Escudo")),
                criarBotaoDica(jogo, "placar", "fa-futbol", texto("taca-hint-score", "Resultado"))
            );
            corpo.appendChild(dicas);
        } else {
            const resumo = document.createElement("div");
            resumo.className = "taca-jogo-resposta";
            const nome = document.createElement("strong");
            nome.textContent = jogo.adversario;
            const placar = document.createElement("span");
            placar.textContent = textoDoPlacar(jogo);
            resumo.append(criarBandeira(jogo.adversario), nome, placar);
            corpo.appendChild(resumo);
        }

        item.append(cabecalho, corpo);
        item.addEventListener("click", () => selecionarJogo(jogo.indice));
        elementosJogo.listaJogos.appendChild(item);
    });
}

// --- SELECIONA UM JOGO ABERTO ---
function selecionarJogo(indice) {
    if (!estado.jogando || estado.jogos[indice].status !== "aberto") {
        return;
    }
    estado.selecionado = indice;
    renderizarJogos();
    elementosJogo.campoSelecao.focus();
}

// --- PRÓXIMO JOGO ABERTO DEPOIS DO ATUAL ---
function proximoAberto(aPartirDe) {
    const abertos = estado.jogos.filter((jogo) => jogo.status === "aberto");
    if (abertos.length === 0) {
        return -1;
    }
    const seguinte = abertos.find((jogo) => jogo.indice > aPartirDe);
    return (seguinte || abertos[0]).indice;
}

// --- PEDE UMA DICA ---
function pedirDica(jogo, tipo) {
    if (!estado.jogando || jogo.dicas[tipo] || jogo.status !== "aberto") {
        return;
    }
    jogo.dicas[tipo] = true;
    estado.selecionado = jogo.indice;
    renderizarJogos();
    elementosJogo.campoSelecao.focus();
}

// --- SUGESTÕES DE SELEÇÕES ---
function fecharSugestoes() {
    elementosJogo.listaSugestoes.classList.add("hidden");
    elementosJogo.listaSugestoes.innerHTML = "";
    elementosJogo.campoSelecao.setAttribute("aria-expanded", "false");
    sugestoesAtuais = [];
    sugestaoSelecionada = -1;
}

// --- ATUALIZA AS SUGESTÕES ---
function atualizarSugestoes() {
    sugestoesAtuais = buscarSelecoes(elementosJogo.campoSelecao.value, 8);
    sugestaoSelecionada = sugestoesAtuais.length > 0 ? 0 : -1;
    elementosJogo.listaSugestoes.innerHTML = "";

    if (sugestoesAtuais.length === 0) {
        elementosJogo.listaSugestoes.classList.add("hidden");
        elementosJogo.campoSelecao.setAttribute("aria-expanded", "false");
        return;
    }

    sugestoesAtuais.forEach((nome, posicao) => {
        const item = document.createElement("li");
        item.setAttribute("role", "option");
        item.className = "taca-sugestao";
        item.classList.toggle("selecionada", posicao === sugestaoSelecionada);
        item.append(criarBandeira(nome), ` ${nome}`);

        item.addEventListener("mousedown", (evento) => {
            evento.preventDefault();
            enviarPalpite(nome);
        });
        elementosJogo.listaSugestoes.appendChild(item);
    });

    elementosJogo.listaSugestoes.classList.remove("hidden");
    elementosJogo.campoSelecao.setAttribute("aria-expanded", "true");
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

// --- ENVIA UM PALPITE ---
function enviarPalpite(adversario) {
    if (!estado.jogando) {
        return;
    }

    elementosJogo.campoSelecao.value = "";
    fecharSugestoes();

    const jogo = encontrarJogo(adversario);
    if (!jogo) {
        estado.erros++;
        renderizarPainel();

        if (estado.erros >= MAXIMO_ERROS) {
            finalizarJogo("erros");
            return;
        }
        mostrarMensagem(`${adversario} ${texto("taca-not-faced", "não está entre os jogos em aberto desta campanha.")} (-${PENALIDADE_ERRO})`, "erro");
        return;
    }

    const estavaSelecionado = jogo.indice === estado.selecionado;
    jogo.status = "certo";
    jogo.pontos = pontosDoAcerto(jogo);

    if (estavaSelecionado) {
        mostrarMensagem(`${adversario}! +${jogo.pontos}`, "acerto");
    } else {
        mostrarMensagem(`${adversario} ${texto("taca-was-in", "foi na etapa")}: ${nomeDaFase(jogo)}. +${jogo.pontos}`, "acerto");
    }

    const proximo = proximoAberto(jogo.indice);
    if (proximo === -1) {
        renderizarPainel();
        renderizarJogos();
        finalizarJogo("completo");
        return;
    }

    estado.selecionado = proximo;
    renderizarPainel();
    renderizarJogos();
    elementosJogo.campoSelecao.focus();
}

// --- ESTRELAS PELO PERCENTUAL DE PONTOS ---
function calcularEstrelas(percentual) {
    if (percentual >= META_ESTRELAS[2]) {
        return 3;
    } else if (percentual >= META_ESTRELAS[1]) {
        return 2;
    } else if (percentual >= META_ESTRELAS[0]) {
        return 1;
    }
    return 0;
}

// --- REVISÃO NO FINAL ---
function renderizarRevisao() {
    elementosJogo.listaRevisao.innerHTML = "";

    estado.jogos.forEach((jogo) => {
        const item = document.createElement("li");
        item.className = `taca-revisao-item ${jogo.status === "certo" ? "acertou" : "faltou"}`;

        const titulo = document.createElement("strong");
        titulo.append(criarIcone(jogo.status === "certo" ? "fa-check" : "fa-xmark"), ` ${nomeDaFase(jogo)}`);

        const detalhe = document.createElement("span");
        detalhe.append(criarBandeira(jogo.adversario), ` ${jogo.adversario} · ${textoDoPlacar(jogo)}`);

        item.append(titulo, detalhe);
        elementosJogo.listaRevisao.appendChild(item);
    });
}

// --- FINALIZA A PARTIDA ---
function finalizarJogo(motivo) {
    estado.jogando = false;
    fecharSugestoes();

    estado.jogos.forEach((jogo) => {
        if (jogo.status === "aberto") {
            jogo.status = "revelado";
        }
    });

    const total = totalDePontos();
    const percentual = total / pontosMaximos();
    const completo = motivo === "completo";
    const estrelas = completo ? calcularEstrelas(percentual) : 0;
    const venceu = estrelas >= 1;
    let titulo;

    if (venceu) {
        titulo = texto("taca-win", "Campanha reconstruída!");
        elementosJogo.iconeResultado.className = "round-icon correct";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-trophy\"></i>";
    } else if (completo) {
        titulo = texto("taca-loss-low", "Você completou, mas com muitas dicas e erros.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-star-half-stroke\"></i>";
    } else if (motivo === "erros") {
        titulo = texto("taca-loss-mistakes", "Erros demais: a campanha escapou da memória.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-heart-crack\"></i>";
    } else {
        titulo = texto("taca-loss-gave-up", "Você desistiu da campanha.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-flag\"></i>";
    }

    const acertos = estado.jogos.filter((jogo) => jogo.status === "certo").length;
    const resumo = `${texto("taca-found", "Jogos descobertos")}: ${acertos}/${estado.jogos.length} · ` +
        `${texto("taca-points", "Pontos")}: ${total}/${pontosMaximos()}`;

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

    renderizarJogos();
    renderizarRevisao();

    setTimeout(() => {
        elementosJogo.areaJogo.classList.add("hidden");
        elementosJogo.resultadoFinal.classList.remove("hidden");
        anunciar(`${titulo} ${resumo}`);
    }, completo ? 700 : 400);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-caminho-da-taca", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-caminho-da-taca", {
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
        }, 1300);
    }
}

// --- COMEÇA UMA CAMPANHA NOVA ---
function novaPartida() {
    const edicao = sortearEdicao(estado.configuracao.competicao);
    estado.edicao = edicao;
    estado.ultimaEdicao = edicao.id;
    estado.jogos = montarJogos(edicao);
    estado.selecionado = 0;
    estado.erros = 0;
    estado.jogando = true;

    const competicao = COMPETICOES[edicao.competicao];
    elementosJogo.tituloEdicao.textContent = `${texto(competicao.chave, competicao.nome)} ${edicao.ano}`;
    elementosJogo.subtituloEdicao.textContent =
        `${texto("taca-champion", "Campeã")}: ${edicao.campeao} · ${texto("taca-host", "Sede")}: ${edicao.sede}`;

    elementosJogo.painelConfiguracao.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.areaJogo.classList.remove("hidden");
    elementosJogo.campoSelecao.value = "";
    fecharSugestoes();
    mostrarMensagem("");
    renderizarPainel();
    renderizarJogos();
    elementosJogo.campoSelecao.focus();
}

// --- VOLTA PARA A ESCOLHA DA COMPETIÇÃO ---
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
            enviarPalpite(sugestoesAtuais[sugestaoSelecionada]);
        }
    } else if (evento.key === "Escape") {
        fecharSugestoes();
    }
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoTaca() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    document.querySelectorAll(".taca-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao.competicao = btnOpcao.dataset.competicao;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarPartida").addEventListener("click", () => {
        salvarConfiguracao();
        novaPartida();
    });

    elementosJogo.campoSelecao.addEventListener("input", atualizarSugestoes);
    elementosJogo.campoSelecao.addEventListener("keydown", aoDigitar);
    elementosJogo.campoSelecao.addEventListener("blur", () => setTimeout(fecharSugestoes, 100));

    document.getElementById("btnDesistir").addEventListener("click", () => {
        if (estado.jogando) {
            finalizarJogo("desistiu");
        }
    });
    document.getElementById("btnJogarNovamente").addEventListener("click", novaPartida);
    document.getElementById("btnMudarCompeticao").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
}

inicializarJogoTaca();
