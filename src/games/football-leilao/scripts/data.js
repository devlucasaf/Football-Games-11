import { estado, VAGAS_ELENCO, POSICOES, PRECO_MINIMO, NOTA_RESERVA, NIVEIS, PERFIS } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-leilao.json");
    const dados = await resposta.json();
    estado.jogadores = dados.jogadores;
}

// --- EMBARALHA UMA LISTA ---
export function embaralhar(lista) {
    const copia = [...lista];
    for (let indiceAtual = copia.length - 1; indiceAtual > 0; indiceAtual--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceAtual + 1));
        [copia[indiceAtual], copia[indiceSorteado]] = [copia[indiceSorteado], copia[indiceAtual]];
    }
    return copia;
}

// --- VALOR DE MERCADO EM MILHÕES PELA NOTA ---
export function valorDeMercado(nota) {
    const proporcao = Math.max(0, (nota - 70) / 25);
    return Math.round(2 + Math.pow(proporcao, 2.2) * 60);
}

// --- PREÇO INICIAL DO LEILÃO ---
export function precoBase(jogador) {
    return Math.max(PRECO_MINIMO, Math.round(valorDeMercado(jogador.nota) * 0.4));
}

// --- CRIA UM PARTICIPANTE ---
function criarParticipante(id, nome, orcamento, perfil) {
    return { id, nome, perfil, orcamento, elenco: [], gasto: 0 };
}

// --- VAGAS ---
export function vagasDaPosicao(participante, posicao) {
    const ocupadas = participante.elenco.filter((jogador) => jogador.pos === posicao).length;
    return VAGAS_ELENCO[posicao] - ocupadas;
}

export function vagasRestantes(participante) {
    return POSICOES.reduce((total, posicao) => total + vagasDaPosicao(participante, posicao), 0);
}

// --- MAIOR LANCE POSSÍVEL, GUARDANDO O MÍNIMO PARA AS OUTRAS VAGAS ---
export function lanceMaximo(participante) {
    const outrasVagas = Math.max(0, vagasRestantes(participante) - 1);
    return participante.orcamento - outrasVagas * PRECO_MINIMO;
}

// --- MONTA A FILA DE JOGADORES DO LEILÃO ---
function montarFila(quantidadeAdversarios) {
    const fila = [];
    POSICOES.forEach((posicao) => {
        const candidatos = embaralhar(estado.jogadores.filter((jogador) => jogador.pos === posicao));
        const quantidade = VAGAS_ELENCO[posicao] * (quantidadeAdversarios + 1) + 2;
        fila.push(...candidatos.slice(0, quantidade));
    });
    return embaralhar(fila);
}

// --- CRIA UM LEILÃO NOVO ---
export function criarLeilao(nivel) {
    const config = NIVEIS[nivel];
    const adversarios = config.perfis.map((perfil, indice) =>
        criarParticipante(`cpu${indice}`, PERFIS[perfil].nome, config.orcamentoAdversarios, perfil)
    );

    return {
        voce: criarParticipante("voce", "Você", config.orcamento, null),
        adversarios,
        fila: montarFila(adversarios.length),
        indice: 0,
        lote: null
    };
}

// --- QUANTOS JOGADORES DA POSIÇÃO AINDA RESTAM NA FILA ---
function restantesNaFila(leilao, posicao) {
    return leilao.fila.slice(leilao.indice).filter((jogador) => jogador.pos === posicao).length;
}

// --- QUANTO UM ADVERSÁRIO ACEITA PAGAR POR UM JOGADOR ---
function calcularTeto(adversario, jogador, leilao) {
    const valor = valorDeMercado(jogador.nota);
    const ruido = 0.9 + Math.random() * 0.2;
    const vagasPosicao = vagasDaPosicao(adversario, jogador.pos);
    let teto = 0;

    if (vagasPosicao <= 0) {
        return 0;
    }

    switch (adversario.perfil) {
        case "agressivo": {
            const comeco = leilao.indice < leilao.fila.length * 0.3 ? 1.1 : 1;
            teto = valor * 1.45 * comeco;
            break;
        }
        case "economico":
            teto = valor * 0.8;
            break;
        case "estrelas":
            teto = jogador.nota >= 87 ? valor * 1.5 : valor * 0.55;
            break;
        case "posicional": {
            const urgencia = vagasPosicao / Math.max(1, restantesNaFila(leilao, jogador.pos));
            teto = valor * (0.85 + 0.9 * Math.min(1, urgencia));
            break;
        }
        default:
            teto = Math.min(valor * 1.1, (adversario.orcamento / vagasRestantes(adversario)) * 1.4);
    }

    const reserva = PERFIS[adversario.perfil].reserva * Math.max(0, vagasRestantes(adversario) - 1);
    return Math.max(0, Math.min(Math.floor(teto * ruido), adversario.orcamento - reserva));
}

// --- INICIA UM LOTE ---
export function abrirLote(leilao) {
    const jogador = leilao.fila[leilao.indice];
    const interessados = leilao.adversarios.filter((adversario) => vagasDaPosicao(adversario, jogador.pos) > 0);
    const tetos = {};
    interessados.forEach((adversario) => {
        tetos[adversario.id] = calcularTeto(adversario, jogador, leilao);
    });

    leilao.lote = {
        jogador,
        base: precoBase(jogador),
        preco: precoBase(jogador),
        lider: null,
        ativos: interessados.map((adversario) => adversario.id),
        tetos,
        voceAtivo: vagasDaPosicao(leilao.voce, jogador.pos) > 0
    };
    return leilao.lote;
}

// --- PRÓXIMO PREÇO SE VOCÊ COBRIR ---
export function precoDoLance(lote, incremento) {
    return lote.lider === null ? lote.base : lote.preco + incremento;
}

// --- VOCÊ DÁ UM LANCE ---
export function lanceDaVoce(leilao, incremento) {
    const lote = leilao.lote;
    const novoPreco = precoDoLance(lote, incremento);
    if (novoPreco > lanceMaximo(leilao.voce)) {
        return false;
    }

    lote.preco = novoPreco;
    lote.lider = "voce";
    return true;
}

// --- VOCÊ DESISTE DO LOTE ---
export function desistirDoLote(leilao) {
    leilao.lote.voceAtivo = false;
}

// --- UMA RODADA DE DECISÕES DOS ADVERSÁRIOS ---
export function rodadaAdversarios(leilao) {
    const lote = leilao.lote;
    const eventos = [];

    for (const id of embaralhar(lote.ativos)) {
        if (!lote.ativos.includes(id) || lote.lider === id) {
            continue;
        }

        const adversario = leilao.adversarios.find((candidato) => candidato.id === id);
        const passo = PERFIS[adversario.perfil].passo;
        const possivel = Math.min(lote.tetos[id], lanceMaximo(adversario));
        const abertura = lote.lider === null;
        const minimo = abertura ? lote.base : lote.preco + PRECO_MINIMO;

        if (minimo <= possivel) {
            const preco = abertura ? lote.base : Math.min(lote.preco + passo, possivel);
            lote.preco = preco;
            lote.lider = id;
            eventos.push({ tipo: "lance", adversario, preco });
        } else {
            lote.ativos = lote.ativos.filter((outro) => outro !== id);
            eventos.push({ tipo: "desiste", adversario, preco: lote.preco });
        }
    }
    return eventos;
}

// --- É A SUA VEZ DE DECIDIR? ---
export function vezDaVoce(leilao) {
    const lote = leilao.lote;
    return lote.voceAtivo && lote.lider !== "voce";
}

// --- O LOTE TERMINOU? ---
export function loteEncerrado(leilao) {
    const lote = leilao.lote;
    const concorrentes = lote.ativos.filter((id) => id !== lote.lider);

    if (lote.voceAtivo && lote.lider !== "voce") {
        return false;
    }
    return concorrentes.length === 0;
}

// --- FECHA O LOTE E ENTREGA O JOGADOR ---
export function fecharLote(leilao) {
    const lote = leilao.lote;
    if (lote.lider === null) {
        return { vendido: false, jogador: lote.jogador };
    }

    const comprador = lote.lider === "voce"
        ? leilao.voce
        : leilao.adversarios.find((adversario) => adversario.id === lote.lider);

    comprador.orcamento -= lote.preco;
    comprador.gasto += lote.preco;
    comprador.elenco.push({ ...lote.jogador, preco: lote.preco });
    return { vendido: true, jogador: lote.jogador, comprador, preco: lote.preco };
}

// --- RESOLVE O LOTE SÓ ENTRE ADVERSÁRIOS ---
export function resolverSemVoce(leilao) {
    const lote = leilao.lote;
    lote.voceAtivo = false;
    while (!loteEncerrado(leilao)) {
        rodadaAdversarios(leilao);
    }
    return fecharLote(leilao);
}

// --- AVANÇA PARA O PRÓXIMO LOTE ---
export function proximoLote(leilao) {
    leilao.indice++;
    leilao.lote = null;
    return leilao.indice < leilao.fila.length;
}

// --- COMPLETA ELENCOS INCOMPLETOS COM JOGADORES RESERVA ---
function completarElenco(participante) {
    POSICOES.forEach((posicao) => {
        for (let vaga = vagasDaPosicao(participante, posicao); vaga > 0; vaga--) {
            participante.elenco.push({ nome: "Reserva", pos: posicao, nota: NOTA_RESERVA, preco: 0, reserva: true });
        }
    });
}

// --- SOMA DAS NOTAS DO ELENCO ---
function notaDoElenco(participante) {
    return participante.elenco.reduce((total, jogador) => total + jogador.nota, 0);
}

// --- CLASSIFICAÇÃO FINAL ---
export function classificar(leilao) {
    const todos = [leilao.voce, ...leilao.adversarios];
    todos.forEach(completarElenco);
    return todos
        .map((participante) => ({ participante, nota: notaDoElenco(participante) }))
        .sort((a, b) => b.nota - a.nota || b.participante.orcamento - a.participante.orcamento);
}

export { NIVEIS };
