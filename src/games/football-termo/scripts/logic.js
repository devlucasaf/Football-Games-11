import estado from "./core.js";
import { esperarMilissegundos } from "./utils.js";
import { obterCelulasLinha } from "./board.js";
import { revelarLinha, animarVitoria, animarLinhaIncompleta } from "./animations.js";
import { mostrarMensagem } from "./ui.js";

// --- CALCULA AS CORES DE CADA LETRA NA TENTATIVA ---
export function calcularCores(chute) {
    const tamanho = estado.secretoNormalizado.length;
    const resultado = new Array(tamanho).fill("absent");
    const letrasJogadorSecreto = estado.secretoNormalizado.split("");
    const letrasPalpite = chute.split("");
    const contagem = {};

    for (const letraSecreta of letrasJogadorSecreto) {
        contagem[letraSecreta] = (contagem[letraSecreta] || 0) + 1;
    }

    // --- VERDES PRIMEIRO ---
    for (let indiceLetra = 0; indiceLetra < tamanho; indiceLetra++) {
        if (letrasPalpite[indiceLetra] === letrasJogadorSecreto[indiceLetra]) {
            resultado[indiceLetra] = "correct";
            contagem[letrasPalpite[indiceLetra]]--;
        }
    }

    // --- AMARELOS ---
    for (let indiceLetra = 0; indiceLetra < tamanho; indiceLetra++) {
        if (resultado[indiceLetra] === "correct") {
            continue;
        }

        // --- OBTÉM A LETRA DO CHUTE ---
        const letra = letrasPalpite[indiceLetra];
        if (contagem[letra] && contagem[letra] > 0) {
            resultado[indiceLetra] = "present";
            contagem[letra]--;
        }
    }
    return resultado;
}

// --- ATUALIZA O ESTADO DAS TECLAS DO TECLADO COM BASE NO CHUTE ---
export function atualizarTeclado(chute, cores) {
    const prioridade = { 
        absent:  0, 
        present: 1, 
        correct: 2 
    };

    // --- ITERA SOBRE CADA LETRA DO CHUTE ---
    for (let indiceLetra = 0; indiceLetra < chute.length; indiceLetra++) {
        const letra = chute[indiceLetra];
        const corAtual = estado.estadoTeclas.get(letra);
        const novaCor = cores[indiceLetra];

        if (!corAtual || prioridade[novaCor] > prioridade[corAtual]) {
            estado.estadoTeclas.set(letra, novaCor);
        }
    }

    // --- ATUALIZA VISUALMENTE TODAS AS TECLAS DO TECLADO ---
    document.querySelectorAll(".key[data-key]").forEach((tecla) => {
        const letraTecla = tecla.dataset.key;
        const estadoTecla = estado.estadoTeclas.get(letraTecla);
        if (estadoTecla) {
            tecla.classList.remove("key-correct", "key-present", "key-absent");
            tecla.classList.add(`key-${estadoTecla}`);
        }
    });
}

// --- CONFIRMA A TENTATIVA E VERIFICA VITÓRIA OU DERROTA ---
export async function confirmarTentativa() {
    if (!estado.jogoAtivo) {
        return;
    }

    const tamanho = estado.secretoNormalizado.length;
    if (estado.colunaAtual < tamanho) {
        animarLinhaIncompleta(estado.tentativaAtual);
        return;
    }

    const celulas = obterCelulasLinha(estado.tentativaAtual);
    const chute = celulas.map((celula) => celula.textContent).join("");
    const cores = calcularCores(chute);

    estado.jogoAtivo = false;
    await revelarLinha(celulas, chute, cores);
    atualizarTeclado(chute, cores);

    // --- VITÓRIA ---
    if (chute === estado.secretoNormalizado) {
        await esperarMilissegundos(300);
        await animarVitoria(celulas);
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-termo", { 
                venceu: true, 
                bucket: estado.tentativaAtual, 
                tamanho: estado.MAXIMO_TENTATIVAS
            });
            window.FG11Stats.mostrarModal("football-termo", {
                venceu: true,
                titulo: "GOLAÇO! Você acertou!",
                resposta: `O jogador era: ${estado.jogadorSecreto}`,
                tamanho: estado.MAXIMO_TENTATIVAS,
                rotulos: ["1", "2", "3", "4", "5", "6"],
                tituloGrafico: "Acertos por tentativa",
                bucketAtual: estado.tentativaAtual,
                onReiniciar: () => document.getElementById("btnIniciarNovoJogo").click()
            });
        } else {
            mostrarMensagem(`GOLAÇO! Você acertou!\nO jogador era: ${estado.jogadorSecreto}`);
        }
        return;
    }

    estado.tentativaAtual++;

    // --- DERROTA ---
    if (estado.tentativaAtual >= estado.MAXIMO_TENTATIVAS) {
        await esperarMilissegundos(300);
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
        if (window.FG11Stats) {
            window.FG11Stats.registrar("football-termo", { 
                venceu: false, 
                tamanho: estado.MAXIMO_TENTATIVAS
            });
            window.FG11Stats.mostrarModal("football-termo", {
                venceu: false,
                titulo: "Fim de jogo!",
                resposta: `O jogador era: ${estado.jogadorSecreto}`,
                tamanho: estado.MAXIMO_TENTATIVAS,
                rotulos: ["1", "2", "3", "4", "5", "6"],
                tituloGrafico: "Acertos por tentativa",
                bucketAtual: -1,
                onReiniciar: () => document.getElementById("btnIniciarNovoJogo").click()
            });
        } else {
            mostrarMensagem(`Fim de jogo!\nO jogador era: ${estado.jogadorSecreto}`);
        }
        return;
    }

    estado.colunaAtual = 0;
    estado.jogoAtivo = true;
}
