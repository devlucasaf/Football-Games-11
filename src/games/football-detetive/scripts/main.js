import { estado, NIVEIS }                           from "./core.js";
import { carregarDados, gerarCaso, textoDaPista }   from "./data.js";

const CHAVE_CONFIGURACAO = "fg11_detetive_config";

const VAZIA = 0;
const DESCARTADA = 1;
const CONFIRMADA = 2;

// --- ELEMENTOS DO DOM ---
const elementosDetetive = {
    painelConfiguracao:  document.getElementById("painelConfiguracao"),
    areaJogo:            document.getElementById("areaJogo"),
    resultadoFinal:      document.getElementById("resultadoFinal"),
    rotuloCaso:          document.getElementById("rotuloCaso"),
    contadorErros:       document.getElementById("contadorErros"),
    contadorDicas:       document.getElementById("contadorDicas"),
    listaPistas:         document.getElementById("listaPistas"),
    envoltorioClube:     document.getElementById("envoltorioClube"),
    envoltorioTemporada: document.getElementById("envoltorioTemporada"),
    mensagemCaso:        document.getElementById("mensagemCaso"),
    iconeResultado:      document.getElementById("iconeResultado"),
    textoResultado:      document.getElementById("textoResultado"),
    estrelasResultado:   document.getElementById("estrelasResultado"),
    resumoResultado:     document.getElementById("resumoResultado"),
    listaSolucao:        document.getElementById("listaSolucao"),
    anuncioLeitorTela:   document.getElementById("anuncioLeitorTela")
};

// --- TEXTO TRADUZIDO COM FALLBACK ---
function texto(chave, padrao) {
    return window.fg11Texto ? window.fg11Texto(chave, padrao) : padrao;
}

// --- ANUNCIA PARA LEITORES DE TELA ---
function anunciar(mensagem) {
    elementosDetetive.anuncioLeitorTela.textContent = "";
    setTimeout(() => { elementosDetetive.anuncioLeitorTela.textContent = mensagem; }, 50);
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

// --- MARCA O NÍVEL ESCOLHIDO ---
function atualizarOpcoes() {
    document.querySelectorAll(".detetive-opcao").forEach((btnOpcao) => {
        const ativa = btnOpcao.dataset.nivel === estado.configuracao.nivel;
        btnOpcao.classList.toggle("ativa", ativa);
        btnOpcao.setAttribute("aria-pressed", String(ativa));
    });
}

// --- CRIA UMA MATRIZ VAZIA ---
function matrizVazia(tamanho) {
    return Array.from({ length: tamanho }, () => Array(tamanho).fill(VAZIA));
}

// --- ATUALIZA OS CONTADORES ---
function atualizarPainel() {
    elementosDetetive.contadorErros.textContent = estado.verificacoesErradas;
    elementosDetetive.contadorDicas.textContent = estado.dicasUsadas;
}

// --- MOSTRA UMA MENSAGEM NO CASO ---
function mostrarMensagem(mensagem, tipo) {
    elementosDetetive.mensagemCaso.textContent = mensagem;
    elementosDetetive.mensagemCaso.dataset.tipo = tipo || "";
    if (mensagem) {
        anunciar(mensagem);
    }
}

// --- DESENHA A LISTA DE PISTAS ---
function renderizarPistas() {
    elementosDetetive.listaPistas.innerHTML = "";

    estado.caso.pistas.forEach((pista, indice) => {
        const item = document.createElement("li");
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "detetive-pista";
        botao.textContent = textoDaPista(pista, estado.caso);
        botao.setAttribute("aria-pressed", String(estado.pistasRiscadas.has(indice)));
        botao.classList.toggle("riscada", estado.pistasRiscadas.has(indice));

        botao.addEventListener("click", () => {
            if (estado.pistasRiscadas.has(indice)) {
                estado.pistasRiscadas.delete(indice);
            } else {
                estado.pistasRiscadas.add(indice);
            }
            botao.classList.toggle("riscada", estado.pistasRiscadas.has(indice));
            botao.setAttribute("aria-pressed", String(estado.pistasRiscadas.has(indice)));
        });

        item.appendChild(botao);
        elementosDetetive.listaPistas.appendChild(item);
    });
}

// --- SÍMBOLO E DESCRIÇÃO DE UMA CÉLULA ---
function simboloCelula(valor) {
    if (valor === CONFIRMADA) {
        return "✓";
    } else if (valor === DESCARTADA) {
        return "✗";
    }
    return "";
}

// --- DESCRIÇÃO DE UMA CÉLULA PARA LEITOR DE TELA ---
function descricaoCelula(valor) {
    if (valor === CONFIRMADA) {
        return texto("detetive-cell-yes", "confirmado");
    } else if (valor === DESCARTADA) {
        return texto("detetive-cell-no", "descartado");
    }
    return texto("detetive-cell-empty", "em aberto");
}

// --- DESENHA UMA TABELA DO CADERNO ---
function renderizarTabela(envoltorio, categoria, tituloColuna, colunas) {
    const caso = estado.caso;
    envoltorio.innerHTML = "";

    const tabela = document.createElement("table");
    tabela.className = "detetive-tabela";

    const legenda = document.createElement("caption");
    legenda.textContent = tituloColuna;
    tabela.appendChild(legenda);

    const cabecalho = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");
    linhaCabecalho.appendChild(document.createElement("th"));
    colunas.forEach((coluna) => {
        const celulaCabecalho = document.createElement("th");
        celulaCabecalho.scope = "col";
        celulaCabecalho.textContent = coluna;
        linhaCabecalho.appendChild(celulaCabecalho);
    });
    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    const corpo = document.createElement("tbody");
    caso.jogadores.forEach((jogador, linha) => {
        const tr = document.createElement("tr");
        const nomeLinha = document.createElement("th");
        nomeLinha.scope = "row";
        nomeLinha.textContent = jogador.nome;
        tr.appendChild(nomeLinha);

        colunas.forEach((coluna, indiceColuna) => {
            const td = document.createElement("td");
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "detetive-celula";
            botao.dataset.categoria = categoria;
            botao.dataset.linha = linha;
            botao.dataset.coluna = indiceColuna;
            botao.addEventListener("click", () => alternarCelula(categoria, linha, indiceColuna));
            td.appendChild(botao);
            tr.appendChild(td);
        });
        corpo.appendChild(tr);
    });
    tabela.appendChild(corpo);
    envoltorio.appendChild(tabela);
}

// --- ATUALIZA O VISUAL DAS CÉLULAS ---
function atualizarCelulas() {
    document.querySelectorAll(".detetive-celula").forEach((botao) => {
        const { categoria, linha, coluna } = botao.dataset;
        const valor = estado.marcas[categoria][linha][coluna];
        const nomeColuna = categoria === "clube"
            ? estado.caso.clubes[coluna].nome
            : estado.caso.temporadas[coluna];

        botao.textContent = simboloCelula(valor);
        botao.dataset.valor = valor;
        botao.setAttribute(
            "aria-label",
            `${estado.caso.jogadores[linha].nome} — ${nomeColuna}: ${descricaoCelula(valor)}`
        );
    });
}

// --- AO CONFIRMAR, DESCARTA O RESTO DA LINHA E DA COLUNA ---
function propagarConfirmacao(categoria, linha, coluna) {
    const matriz = estado.marcas[categoria];
    const total = matriz.length;

    for (let indice = 0; indice < total; indice++) {
        if (indice !== coluna && matriz[linha][indice] === VAZIA) {
            matriz[linha][indice] = DESCARTADA;
        }
        if (indice !== linha && matriz[indice][coluna] === VAZIA) {
            matriz[indice][coluna] = DESCARTADA;
        }
    }
}

// --- CICLA O ESTADO DE UMA CÉLULA ---
function alternarCelula(categoria, linha, coluna) {
    if (!estado.jogando) {
        return;
    }

    const matriz = estado.marcas[categoria];
    matriz[linha][coluna] = (matriz[linha][coluna] + 1) % 3;

    if (matriz[linha][coluna] === CONFIRMADA) {
        propagarConfirmacao(categoria, linha, coluna);
    }

    mostrarMensagem("");
    atualizarCelulas();

    const botao = document.querySelector(
        `.detetive-celula[data-categoria="${categoria}"][data-linha="${linha}"][data-coluna="${coluna}"]`
    );
    botao?.focus();
}

// --- DESENHA O CADERNO COMPLETO ---
function renderizarCaderno() {
    renderizarTabela(
        elementosDetetive.envoltorioClube,
        "clube",
        texto("detetive-table-club", "Jogador × Clube"),
        estado.caso.clubes.map((clube) => clube.nome)
    );
    renderizarTabela(
        elementosDetetive.envoltorioTemporada,
        "temporada",
        texto("detetive-table-season", "Jogador × Temporada"),
        estado.caso.temporadas
    );
    atualizarCelulas();
}

// --- COLUNA CONFIRMADA DE UMA LINHA ---
function colunaConfirmada(categoria, linha) {
    return estado.marcas[categoria][linha].indexOf(CONFIRMADA);
}

// --- QUANTIDADE DE LIGAÇÕES ERRADAS NO PALPITE ---
function contarErros() {
    const { solucao, jogadores } = estado.caso;
    let erros = 0;

    jogadores.forEach((_, linha) => {
        if (colunaConfirmada("clube", linha) !== solucao.clubeDe[linha]) {
            erros++;
        }
        if (colunaConfirmada("temporada", linha) !== solucao.temporadaDe[linha]) {
            erros++;
        }
    });
    return erros;
}

// --- CALCULA AS ESTRELAS PELOS ERROS E DICAS ---
function calcularEstrelas() {
    const penalidade = estado.verificacoesErradas + estado.dicasUsadas;
    if (penalidade === 0) {
        return 3;
    } else if (penalidade <= 2) {
        return 2;
    }
    return 1;
}

// --- VERIFICA O PALPITE ---
function verificar() {
    if (!estado.jogando) {
        return;
    }

    const { jogadores } = estado.caso;
    const completo = jogadores.every((_, linha) =>
        colunaConfirmada("clube", linha) !== -1 && colunaConfirmada("temporada", linha) !== -1
    );

    if (!completo) {
        mostrarMensagem(texto("detetive-incomplete", "Marque um ✓ de clube e um ✓ de temporada para cada jogador antes de verificar."), "aviso");
        return;
    }

    const erros = contarErros();
    if (erros === 0) {
        finalizarCaso(true);
        return;
    }

    estado.verificacoesErradas++;
    atualizarPainel();

    const base = texto("detetive-wrong", "Ainda há ligações erradas no seu caderno:");
    mostrarMensagem(`${base} ${erros}.`, "erro");
}

// --- REVELA UMA LIGAÇÃO CORRETA ---
function darDica() {
    if (!estado.jogando) {
        return;
    }

    const { solucao, jogadores } = estado.caso;
    const pendentes = [];

    jogadores.forEach((_, linha) => {
        if (colunaConfirmada("clube", linha) !== solucao.clubeDe[linha]) {
            pendentes.push({ categoria: "clube", linha, coluna: solucao.clubeDe[linha] });
        }

        if (colunaConfirmada("temporada", linha) !== solucao.temporadaDe[linha]) {
            pendentes.push({ categoria: "temporada", linha, coluna: solucao.temporadaDe[linha] });
        }
    });

    if (pendentes.length === 0) {
        mostrarMensagem(texto("detetive-no-hints", "Seu caderno já está correto. Clique em Verificar!"), "aviso");
        return;
    }

    const { categoria, linha, coluna } = pendentes[Math.floor(Math.random() * pendentes.length)];
    const matriz = estado.marcas[categoria];

    for (let indice = 0; indice < matriz.length; indice++) {
        matriz[linha][indice] = DESCARTADA;
        matriz[indice][coluna] = DESCARTADA;
    }
    matriz[linha][coluna] = CONFIRMADA;

    estado.dicasUsadas++;
    atualizarPainel();
    atualizarCelulas();

    const nomeColuna = categoria === "clube" ? estado.caso.clubes[coluna].nome : estado.caso.temporadas[coluna];
    mostrarMensagem(`${texto("detetive-hint-given", "Dica")}: ${jogadores[linha].nome} → ${nomeColuna}.`, "dica");
}

// --- LIMPA O CADERNO ---
function limparCaderno() {
    if (!estado.jogando) {
        return;
    }
    const tamanho = estado.caso.jogadores.length;
    estado.marcas = { clube: matrizVazia(tamanho), temporada: matrizVazia(tamanho) };
    atualizarCelulas();
    mostrarMensagem("");
}

// --- LISTA A SOLUÇÃO NO FINAL ---
function renderizarSolucao() {
    const { jogadores, clubes, temporadas, solucao } = estado.caso;
    elementosDetetive.listaSolucao.innerHTML = "";

    jogadores.forEach((jogador, indice) => {
        const item = document.createElement("li");
        item.className = "detetive-solucao-item";

        const nome = document.createElement("strong");
        nome.textContent = jogador.nome;

        const detalhe = document.createElement("span");
        detalhe.textContent = `${clubes[solucao.clubeDe[indice]].nome} · ${temporadas[solucao.temporadaDe[indice]]}`;

        item.append(criarIcone("fa-user-check"), nome, detalhe);
        elementosDetetive.listaSolucao.appendChild(item);
    });
}

// --- FINALIZA O CASO ---
function finalizarCaso(venceu) {
    estado.jogando = false;

    const estrelas = venceu ? calcularEstrelas() : 0;
    let titulo;

    if (venceu) {
        titulo = texto("detetive-win", "Caso resolvido, detetive!");
        elementosDetetive.iconeResultado.className = "round-icon correct";
        elementosDetetive.iconeResultado.innerHTML = "<i class=\"fas fa-trophy\"></i>";
    } else {
        titulo = texto("detetive-loss", "Caso arquivado sem solução.");
        elementosDetetive.iconeResultado.className = "round-icon wrong";
        elementosDetetive.iconeResultado.innerHTML = "<i class=\"fas fa-folder-closed\"></i>";
    }

    const resumo = `${texto("detetive-wrong-checks", "Erros")}: ${estado.verificacoesErradas} · ` +
        `${texto("detetive-hints", "Dicas")}: ${estado.dicasUsadas}`;

    elementosDetetive.textoResultado.textContent = titulo;
    elementosDetetive.resumoResultado.textContent = resumo;
    elementosDetetive.estrelasResultado.innerHTML = "";
    elementosDetetive.estrelasResultado.classList.toggle("hidden", !venceu);
    elementosDetetive.estrelasResultado.setAttribute("aria-label", `${estrelas} ${texto("memoria-stars", "estrelas")}`);

    for (let indiceEstrela = 0; indiceEstrela < 3; indiceEstrela++) {
        const estrela = criarIcone("fa-star");
        if (indiceEstrela < estrelas) {
            estrela.classList.add("cheia");
        }
        elementosDetetive.estrelasResultado.appendChild(estrela);
    }

    renderizarSolucao();

    setTimeout(() => {
        elementosDetetive.areaJogo.classList.add("hidden");
        elementosDetetive.resultadoFinal.classList.remove("hidden");
        anunciar(`${titulo} ${resumo}`);
    }, venceu ? 500 : 300);

    if (venceu && window.registrarVitoria) {
        window.registrarVitoria();
    } else if (!venceu && window.registrarDerrota) {
        window.registrarDerrota();
    }

    if (window.FG11Stats) {
        window.FG11Stats.registrar("football-detetive", {
            venceu,
            bucket: estrelas - 1,
            tamanho: 3
        });

        setTimeout(() => {
            window.FG11Stats.mostrarModal("football-detetive", {
                venceu,
                titulo,
                resposta: resumo,
                tamanho: 3,
                rotulos: ["★", "★★", "★★★"],
                tituloGrafico: texto("memoria-chart-title", "Vitórias por estrelas"),
                bucketAtual: estrelas - 1,
                onReiniciar: novoCaso,
                onHome: () => { window.location.href = "../../../index.html"; }
            });
        }, 1000);
    }
}

// --- ABRE UM CASO NOVO ---
function novoCaso() {
    const caso = gerarCaso();
    if (!caso) {
        mostrarMensagem(texto("detetive-error", "Não foi possível gerar o caso. Tente de novo."), "erro");
        return;
    }

    const tamanho = caso.jogadores.length;
    estado.caso = caso;
    estado.marcas = { clube: matrizVazia(tamanho), temporada: matrizVazia(tamanho) };
    estado.pistasRiscadas = new Set();
    estado.verificacoesErradas = 0;
    estado.dicasUsadas = 0;
    estado.jogando = true;

    elementosDetetive.painelConfiguracao.classList.add("hidden");
    elementosDetetive.resultadoFinal.classList.add("hidden");
    elementosDetetive.areaJogo.classList.remove("hidden");

    const nomeNivel = document.querySelector(`.detetive-opcao[data-nivel="${estado.configuracao.nivel}"] .detetive-opcao-nome`);
    elementosDetetive.rotuloCaso.textContent =
        `${texto("detetive-case-label", "Caso fictício")} · ${nomeNivel ? nomeNivel.textContent : ""}`;

    atualizarPainel();
    mostrarMensagem("");
    renderizarPistas();
    renderizarCaderno();
}

// --- VOLTA PARA A ESCOLHA DE NÍVEL ---
function abrirConfiguracao() {
    estado.jogando = false;
    elementosDetetive.areaJogo.classList.add("hidden");
    elementosDetetive.resultadoFinal.classList.add("hidden");
    elementosDetetive.painelConfiguracao.classList.remove("hidden");
}

// --- INICIALIZA O JOGO ---
async function inicializarJogoDetetive() {
    await carregarDados();
    carregarConfiguracao();
    atualizarOpcoes();

    document.querySelectorAll(".detetive-opcao").forEach((btnOpcao) => {
        btnOpcao.addEventListener("click", () => {
            estado.configuracao.nivel = btnOpcao.dataset.nivel;
            atualizarOpcoes();
        });
    });

    document.getElementById("btnComecarCaso").addEventListener("click", () => {
        salvarConfiguracao();
        novoCaso();
    });

    document.getElementById("btnVerificar").addEventListener("click", verificar);
    document.getElementById("btnDica").addEventListener("click", darDica);
    document.getElementById("btnLimpar").addEventListener("click", limparCaderno);
    document.getElementById("btnDesistir").addEventListener("click", () => finalizarCaso(false));
    document.getElementById("btnNovoCaso").addEventListener("click", novoCaso);
    document.getElementById("btnMudarNivel").addEventListener("click", abrirConfiguracao);
    document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
        window.location.href = "../../../index.html";
    });
}

inicializarJogoDetetive();
