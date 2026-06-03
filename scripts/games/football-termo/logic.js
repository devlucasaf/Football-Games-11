import estado from "./core.js";
import { esperar } from "./utils.js";
import { getCelulasLinha } from "./board.js";
import { revelarLinha, animarVitoria, shakeRow } from "./animations.js";
import { mostrarMensagem } from "./ui.js";

// --- CALCULA AS CORES DE CADA LETRA NA TENTATIVA ---
export function calcularCores(chute) {
    const tamanho       = estado.secretoNormalizado.length;
    const resultado     = new Array(tamanho).fill("absent");
    const secretoChars  = estado.secretoNormalizado.split("");
    const chuteChars    = chute.split("");
    const contagem      = {};

    for (const c of secretoChars) {
        contagem[c] = (contagem[c] || 0) + 1;
    }

    // --- VERDES PRIMEIRO ---
    for (let i = 0; i < tamanho; i++) {
        if (chuteChars[i] === secretoChars[i]) {
            resultado[i] = "correct";
            contagem[chuteChars[i]]--;
        }
    }

    // --- AMARELOS ---
    for (let i = 0; i < tamanho; i++) {
        if (resultado[i] === "correct") {
            continue;
        }

        // --- OBTÉM A LETRA DO CHUTE ---
        const letra = chuteChars[i];
        if (contagem[letra] && contagem[letra] > 0) {
            resultado[i] = "present";
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
    for (let i = 0; i < chute.length; i++) {
        const letra = chute[i];
        const corAtual = estado.estadoTeclas.get(letra);
        const novaCor = cores[i];

        if (!corAtual || prioridade[novaCor] > prioridade[corAtual]) {
            estado.estadoTeclas.set(letra, novaCor);
        }
    }

    // --- ATUALIZA VISUALMENTE TODAS AS TECLAS DO TECLADO ---
    document.querySelectorAll(".key[data-key]").forEach((tecla) => {
        const k = tecla.dataset.key;
        const estadoTecla = estado.estadoTeclas.get(k);
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
        shakeRow(estado.tentativaAtual);
        return;
    }

    const celulas = getCelulasLinha(estado.tentativaAtual);
    const chute = celulas.map((c) => c.textContent).join("");
    const cores = calcularCores(chute);

    estado.jogoAtivo = false;
    await revelarLinha(celulas, chute, cores);
    atualizarTeclado(chute, cores);

    // --- VITÓRIA ---
    if (chute === estado.secretoNormalizado) {
        await esperar(300);
        await animarVitoria(celulas);
        mostrarMensagem(`GOLAÇO! Você acertou!\nO jogador era: ${estado.jogadorSecreto}`);
        return;
    }

    estado.tentativaAtual++;

    // --- DERROTA ---
    if (estado.tentativaAtual >= estado.MAX_TENTATIVAS) {
        await esperar(300);
        mostrarMensagem(`Fim de jogo!\nO jogador era: ${estado.jogadorSecreto}`);
        return;
    }

    estado.colunaAtual = 0;
    estado.jogoAtivo = true;
}
