import { estado, reiniciarEstadoDesafio } from "./core.js";
import { carregarDados, escolherDesafio, obterTodosJogadores, embaralharJogadores, verificarGrupo } from "./data.js";
import { renderizarGradeJogadores, renderizarVidas, renderizarGrupoAcertado, mostrarMensagemSelecao, animarErro, animarQuaseLa, embaralharGradeJogadores, limparSelecao, mostrarResultadoFinal, reiniciarInterfaceDesafio } from "./ui.js";

// --- INICIAR PUZZLE ---
function iniciarDesafio() {
    reiniciarEstadoDesafio();
    reiniciarInterfaceDesafio();

    const desafio = escolherDesafio();
    if (!desafio) {
        return;
    }

    const todosJogadores = obterTodosJogadores(desafio);
    estado.jogadoresRestantes = embaralharJogadores(todosJogadores);

    renderizarGradeJogadores();
    renderizarVidas();
}

// --- CONFIRMAR SELEÇÃO DE GRUPO ---
function confirmarSelecao() {
    if (estado.selecionados.length !== 4 || !estado.jogoAtivo) {
        return;
    }

    const resultado = verificarGrupo(estado.selecionados, estado.desafioAtual);

    if (resultado.acertou) {
        estado.gruposAcertados.push(resultado.grupo);
        estado.jogadoresRestantes = estado.jogadoresRestantes.filter(
            jogador => !resultado.grupo.jogadores.includes(jogador)
        );
        estado.selecionados = [];

        renderizarGrupoAcertado(resultado.grupo);
        renderizarGradeJogadores();

        if (estado.gruposAcertados.length === 4) {
            estado.jogoAtivo = false;
            setTimeout(() => {
                mostrarResultadoFinal(true);
                registrarEstatisticas(true);
            }, 600);
        }
    } else {
        estado.tentativasRestantes--;
        renderizarVidas();

        if (resultado.quaseLa) {
            animarQuaseLa();
            mostrarMensagemSelecao("almost", "Quase lá! 3 de 4 estão corretos.");
        } else {
            animarErro();
            mostrarMensagemSelecao("wrong", "Não é um grupo válido.");
        }

        estado.selecionados = [];
        renderizarGradeJogadores();

        if (estado.tentativasRestantes <= 0) {
            estado.jogoAtivo = false;
            setTimeout(() => {
                estado.desafioAtual.grupos.forEach(grupo => {
                    if (!estado.gruposAcertados.includes(grupo)) {
                        renderizarGrupoAcertado(grupo);
                    }
                });
                mostrarResultadoFinal(false);
                registrarEstatisticas(false);
            }, 800);
        }
    }
}

// --- REGISTRA E EXIBE AS ESTATÍSTICAS DO PUZZLE ---
function registrarEstatisticas(venceu) {
    if (!window.FG11Stats) {
        return;
    }
    const acertados = estado.gruposAcertados.length;
    window.FG11Stats.registrar("football-conexoes", {
        venceu,
        bucket: acertados,
        tamanho: 5
    });
    window.FG11Stats.mostrarModal("football-conexoes", {
        venceu,
        titulo: venceu ? "Você conectou tudo!" : "Fim de jogo!",
        resposta: `Grupos acertados: ${acertados} de 4`,
        tamanho: 5,
        rotulos: ["0", "1", "2", "3", "4"],
        tituloGrafico: "Grupos acertados por partida",
        bucketAtual: acertados,
        onReiniciar: iniciarDesafio,
        onHome: () => { window.location.href = "../../../index.html"; }
    });
}

// --- EVENTOS DOS BOTÕES ---
document.getElementById("btnConfirmarSelecao").addEventListener("click", confirmarSelecao);
document.getElementById("btnLimparSelecao").addEventListener("click", limparSelecao);
document.getElementById("btnEmbaralharJogadores").addEventListener("click", embaralharGradeJogadores);
document.getElementById("btnIniciarProximoDesafio").addEventListener("click", iniciarDesafio);
document.getElementById("btnVoltarPaginaInicial").addEventListener("click", () => {
    window.location.href = "../../../index.html";
});

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
async function inicializarJogoConexoes() {
    await carregarDados();
    estado.indiceDesafioAtual = Math.floor(Math.random() * estado.desafios.length);
    iniciarDesafio();
}

inicializarJogoConexoes();
