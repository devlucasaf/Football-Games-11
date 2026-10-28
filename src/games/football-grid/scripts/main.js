(async function inicializarJogoGrade() {
    try {
        GradeInterface.iniciarElementos();

        const dados = await GradeDados.carregarDados();
        GradeDados.construirDados(dados);

        const configuracaoGrade = GradeGerador.criarConfiguracaoGrade();
        if (!configuracaoGrade) {
            throw new Error("Falha ao gerar uma grade jogável.");
        }

        GradeJogo.gradeAtual = configuracaoGrade;
        GradeInterface.aplicarGradeNaPagina(configuracaoGrade);
        GradeJogo.configurarEventos();

        // --- TIMER ---
        const parametrosUrl = new URLSearchParams(window.location.search);
        const modoTempo = parametrosUrl.get("time") || "unlimited";
        GradeTemporizador.iniciarTemporizador(modoTempo);
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao inicializar: ${erro.message}`);
    }
})();
