import { estado, NIVEIS, MAXIMO_ERROS } from "./core.js";
import {
    carregarDados, gerarDesafios, textoDoDesafio, atende, candidatos, todasAsOpcoes,
    emparelhar, buscarJogadores
} from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_semrepetir_config";

// --- ELEMENTOS DO DOM ---
const elementosJogo = {
    painelConfiguracao: document.getElementById("painelConfiguracao"),
    areaJogo:           document.getElementById("areaJogo"),
    resultadoFinal:     document.getElementById("resultadoFinal"),
    contadorResolvidos: document.getElementById("contadorResolvidos"),
    contadorErros:      document.getElementById("contadorErros"),
    listaDesafios:      document.getElementById("listaDesafios"),
    desafioAtivo:       document.getElementById("desafioAtivo"),
    campoJogador:       document.getElementById("campoJogador"),
    listaSugestoes:     document.getElementById("listaSugestoes"),
    mensagemJogo:       document.getElementById("mensagemJogo"),
    listaUsados:        document.getElementById("listaUsados"),
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

/// --- ATUALIZA O BOTÃO DE NÍVEL ---
function atualizarOpcoes() {
    document.querySelectorAll(".semrepetir-opcao").forEach((btnOpcao) => {
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

// --- DESAFIOS AINDA SEM RESPOSTA ---
function indicesPendentes() {
    return estado.desafios
        .map((_, indice) => indice)
        .filter((indice) => estado.respostas[indice] === undefined);
}

// --- NOME DO JOGADOR PELO ÍNDICE ---
function jogadorPorIndice(indice) {
    return estado.jogadores[indice];
}

// --- PAINEL DE PROGRESSO ---
function renderizarPainel() {
    const resolvidos = Object.keys(estado.respostas).length;
    elementosJogo.contadorResolvidos.textContent = `${resolvidos}/${estado.desafios.length}`;
    elementosJogo.contadorErros.textContent = `${estado.erros}/${MAXIMO_ERROS}`;
}

// --- LISTA DE DESAFIOS ---
function renderizarDesafios() {
    const mostrarOpcoes = NIVEIS[estado.configuracao.nivel].mostrarOpcoes;
    elementosJogo.listaDesafios.innerHTML = "";

    estado.desafios.forEach((desafio, indice) => {
        const item = document.createElement("li");
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "semrepetir-desafio";
        const resposta = estado.respostas[indice];
        const respondido = resposta !== undefined;

        botao.classList.toggle("respondido", respondido);
        botao.classList.toggle("ativo", !respondido && indice === estado.desafioAtivo);
        botao.disabled = respondido;
        botao.setAttribute("aria-pressed", String(!respondido && indice === estado.desafioAtivo));

        const titulo = document.createElement("strong");
        titulo.textContent = textoDoDesafio(desafio);

        const detalhe = document.createElement("span");
        if (respondido) {
            detalhe.append(criarIcone("fa-check"), ` ${jogadorPorIndice(resposta).nome}`);
        } else if (mostrarOpcoes) {
            const restantes = candidatos(desafio, estado.usados).length;
            detalhe.textContent = `${restantes} ${texto("semrepetir-options-left", "opções restantes")}`;
            botao.classList.toggle("apertado", restantes <= 2);
        } else {
            detalhe.textContent = texto("semrepetir-pending", "Pendente");
        }

        botao.append(titulo, detalhe);
        botao.addEventListener("click", () => selecionarDesafio(indice));
        item.appendChild(botao);
        elementosJogo.listaDesafios.appendChild(item);
    });
}

// --- DESAFIO ATIVO E CAMPO DE BUSCA ---
function renderizarAtivo() {
    const pendentes = indicesPendentes();
    if (pendentes.length === 0) {
        elementosJogo.desafioAtivo.textContent = "";
        return;
    }
    elementosJogo.desafioAtivo.textContent = textoDoDesafio(estado.desafios[estado.desafioAtivo]);
}

// --- JOGADORES JÁ USADOS ---
function renderizarUsados() {
    elementosJogo.listaUsados.innerHTML = "";

    if (estado.usados.size === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = texto("semrepetir-none-used", "Nenhum ainda");
        elementosJogo.listaUsados.appendChild(vazio);
        return;
    }

    estado.usados.forEach((indice) => {
        const item = document.createElement("li");
        item.textContent = jogadorPorIndice(indice).nome;
        elementosJogo.listaUsados.appendChild(item);
    });
}

// --- ATUALIZA A TELA INTEIRA ---
function renderizarTudo() {
    renderizarPainel();
    renderizarDesafios();
    renderizarAtivo();
    renderizarUsados();
}

// --- ESCOLHE O DESAFIO QUE SERÁ RESPONDIDO ---
function selecionarDesafio(indice) {
    if (!estado.jogando || estado.respostas[indice] !== undefined) {
        return;
    }
    estado.desafioAtivo = indice;
    renderizarDesafios();
    renderizarAtivo();
    elementosJogo.campoJogador.focus();
}

// --- SUGESTÕES DE NOMES ---
function fecharSugestoes() {
    elementosJogo.listaSugestoes.classList.add("hidden");
    elementosJogo.listaSugestoes.innerHTML = "";
    elementosJogo.campoJogador.setAttribute("aria-expanded", "false");
    sugestoesAtuais = [];
    sugestaoSelecionada = -1;
}

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
        item.className = "semrepetir-sugestao";
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

// --- SIMULA O JOGO PARA VER SE É POSSÍVEL ---
function moverSugestao(deslocamento) {
    if (sugestoesAtuais.length === 0) {
        return;
    }
    sugestaoSelecionada = (sugestaoSelecionada + deslocamento + sugestoesAtuais.length) % sugestoesAtuais.length;
    [...elementosJogo.listaSugestoes.children].forEach((item, posicao) => {
        item.classList.toggle("selecionada", posicao === sugestaoSelecionada);
    });
}

// --- PRÓXIMO DESAFIO PENDENTE DEPOIS DO ATUAL ---
function proximoPendente(aPartirDe) {
    const pendentes = indicesPendentes();
    if (pendentes.length === 0) {
        return -1;
    }
    return pendentes.find((indice) => indice > aPartirDe) ?? pendentes[0];
}

// --- QUAL DESAFIO FICOU SEM SAÍDA? ---
function desafioSemSaida() {
    return indicesPendentes().find((indice) => candidatos(estado.desafios[indice], estado.usados).length === 0);
}

// --- ENVIA UMA RESPOSTA PARA O DESAFIO ATIVO ---
function enviarResposta(jogador) {
    if (!estado.jogando) {
        return;
    }

    const indiceDesafio = estado.desafioAtivo;
    const desafio = estado.desafios[indiceDesafio];

    if (estado.usados.has(jogador.indice)) {
        mostrarMensagem(`${jogador.nome} ${texto("semrepetir-already-used", "já foi usado. Escolha outro jogador.")}`, "aviso");
        return;
    }

    if (!atende(jogador, desafio)) {
        estado.erros++;
        renderizarPainel();
        elementosJogo.campoJogador.value = "";
        fecharSugestoes();

        if (estado.erros >= MAXIMO_ERROS) {
            finalizarJogo(false, "erros");
            return;
        }
        mostrarMensagem(`${jogador.nome} ${texto("semrepetir-does-not-fit", "não atende a este desafio.")}`, "erro");
        return;
    }

    estado.respostas[indiceDesafio] = jogador.indice;
    estado.usados.add(jogador.indice);
    elementosJogo.campoJogador.value = "";
    fecharSugestoes();

    const pendentes = indicesPendentes();
    if (pendentes.length === 0) {
        renderizarTudo();
        finalizarJogo(true);
        return;
    }

    if (!emparelhar(pendentes.map((indice) => estado.desafios[indice]), estado.usados).completo) {
        renderizarTudo();
        finalizarJogo(false, "sem-saida");
        return;
    }

    estado.desafioAtivo = proximoPendente(indiceDesafio);
    renderizarTudo();
    mostrarMensagem(`${jogador.nome} ${texto("semrepetir-fits", "serve!")}`, "acerto");
    elementosJogo.campoJogador.focus();
}

// --- ESTRELAS PELOS ERROS ---
function calcularEstrelas() {
    if (estado.erros === 0) {
        return 3;
    } else if (estado.erros === 1) {
        return 2;
    }
    return 1;
}

// --- REVISÃO DE CADA DESAFIO NO FINAL ---
function renderizarRevisao() {
    elementosJogo.listaRevisao.innerHTML = "";

    const pendentes = indicesPendentes();
    const sugestao = emparelhar(pendentes.map((indice) => estado.desafios[indice]), estado.usados);

    estado.desafios.forEach((desafio, indice) => {
        const item = document.createElement("li");
        const resposta = estado.respostas[indice];
        const respondido = resposta !== undefined;
        item.className = `semrepetir-revisao-item ${respondido ? "acertou" : "faltou"}`;

        const titulo = document.createElement("strong");
        titulo.append(criarIcone(respondido ? "fa-check" : "fa-xmark"), ` ${textoDoDesafio(desafio)}`);

        const detalhe = document.createElement("span");
        if (respondido) {
            detalhe.textContent = jogadorPorIndice(resposta).nome;
        } else {
            const posicaoPendente = pendentes.indexOf(indice);
            const ideal = sugestao.completo ? sugestao.solucao[posicaoPendente] : undefined;
            const opcoes = todasAsOpcoes(desafio).slice(0, 3).map((jogador) => jogador.nome).join(", ");

            if (ideal !== undefined) {
                detalhe.textContent = `${texto("semrepetir-could-be", "Daria para usar")}: ${jogadorPorIndice(ideal).nome}`;
            } else {
                detalhe.textContent = `${texto("semrepetir-options", "Opções")}: ${opcoes}`;
            }
        }

        item.append(titulo, detalhe);
        elementosJogo.listaRevisao.appendChild(item);
    });
}

// --- FINALIZA O JOGO ---
function finalizarJogo(venceu, motivo) {
    estado.jogando = false;
    fecharSugestoes();

    const estrelas = venceu ? calcularEstrelas() : 0;
    let titulo;

    if (venceu) {
        titulo = texto("semrepetir-win", "Todos os desafios resolvidos!");
        elementosJogo.iconeResultado.className = "round-icon correct";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-trophy\"></i>";
    } else if (motivo === "sem-saida") {
        const travado = desafioSemSaida();
        const nome = travado !== undefined ? textoDoDesafio(estado.desafios[travado]) : "";
        titulo = texto("semrepetir-loss-stuck", "Sem saída: faltaram jogadores para um desafio.");
        if (nome) {
            titulo += ` (${nome})`;
        }
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-lock\"></i>";
    } else if (motivo === "desistiu") {
        titulo = texto("semrepetir-loss-gave-up", "Você desistiu do desafio.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-flag\"></i>";
    } else {
        titulo = texto("semrepetir-loss-mistakes", "Palpites errados demais.");
        elementosJogo.iconeResultado.className = "round-icon wrong";
        elementosJogo.iconeResultado.innerHTML = "<i class=\"fas fa-heart-crack\"></i>";
    }

    const resolvidos = Object.keys(estado.respostas).length;
    const resumo = `${texto("semrepetir-solved", "Resolvidos")}: ${resolvidos}/${estado.desafios.length} · ` +
        `${texto("semrepetir-mistakes", "Erros")}: ${estado.erros}`;

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

    setTimeout(() => {
        elementosJogo.areaJogo.classList.add("hidden");
        elementosJogo.resultadoFinal.classList.remove("hidden");
        anunciar(`${titulo} ${resumo}`);
    }, venceu ? 600 : 900);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-sem-repetir", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-sem-repetir", {
                venceu,
                titulo,
                resposta: resumo,
                tamanho: 3,
                rotulos: ["★", "★★", "★★★"],
                tituloGrafico: texto("memoria-chart-title", "Vitórias por estrelas"),
                bucketAtual: estrelas - 1,
                onReiniciar: novoJogo,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }, 1500);
    }
}

// --- COMEÇA UM JOGO NOVO ---
function novoJogo() {
    const desafios = gerarDesafios(estado.configuracao.nivel);
    if (!desafios) {
        return;
    }

    estado.desafios = desafios;
    estado.usados = new Set();
    estado.respostas = {};
    estado.desafioAtivo = 0;
    estado.erros = 0;
    estado.jogando = true;

    elementosJogo.painelConfiguracao.classList.add("hidden");
    elementosJogo.resultadoFinal.classList.add("hidden");
    elementosJogo.areaJogo.classList.remove("hidden");
    elementosJogo.campoJogador.value = "";
    fecharSugestoes();
    mostrarMensagem("");
    renderizarTudo();
    elementosJogo.campoJogador.focus();
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
async function inicializarJogoSemRepetir() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    document.querySelectorAll(".semrepetir-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao.nivel = btnOpcao.dataset.nivel;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarDesafio").addEventListener("click", () => {
        salvarConfiguracao();
        novoJogo();
    });

    elementosJogo.campoJogador.addEventListener("input", atualizarSugestoes);
    elementosJogo.campoJogador.addEventListener("keydown", aoDigitar);
    elementosJogo.campoJogador.addEventListener("blur", () => setTimeout(fecharSugestoes, 100));

    document.getElementById("btnDesistir").addEventListener("click", () => {
        if (estado.jogando) {
            finalizarJogo(false, "desistiu");
        }
    });
    document.getElementById("btnJogarNovamente").addEventListener("click", novoJogo);
    document.getElementById("btnMudarNivel").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
}

inicializarJogoSemRepetir();
