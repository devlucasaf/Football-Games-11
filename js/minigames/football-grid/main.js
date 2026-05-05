(async function iniciarFootballGrid() {
    try {
        GridInterface.iniciarElementos();

        const dados = await GridDados.carregarDados();
        GridDados.construirDados(dados);

        const cfg = GridGerador.criarConfigGrid();
        if (!cfg) {
            throw new Error("Falha ao gerar uma grade jogável.");
        }

        GridJogo.gridAtual = cfg;
        GridInterface.aplicarGridNoDOM(cfg);
        GridJogo.configurarEventos();

        // --- TIMER ---
        const parametrosUrl = new URLSearchParams(window.location.search);
        const modoTempo = parametrosUrl.get("time") || "unlimited";
        GridTemporizador.iniciarTimer(modoTempo);
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao inicializar: ${erro.message}`);
    }
})();
