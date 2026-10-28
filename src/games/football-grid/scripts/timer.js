const GradeTemporizador = {
    intervaloTemporizador: null,
    tempoRestante:  0,

    // --- INICIAR TIMER ---
    iniciarTemporizador(minutos) {
        if (minutos === "unlimited") {
            this.atualizarExibicaoTempo("∞");
            return;
        }

        this.tempoRestante = parseInt(minutos) * 60;
        this.atualizarExibicaoTempo(this.formatarTempo(this.tempoRestante));

        if (this.intervaloTemporizador) {
            clearInterval(this.intervaloTemporizador);
        }

        this.intervaloTemporizador = setInterval(() => {
            this.tempoRestante--;
            this.atualizarExibicaoTempo(this.formatarTempo(this.tempoRestante));

            if (this.tempoRestante <= 0) {
                this.pararJogo("Tempo esgotado!");
                if (window.registrarDerrota) {
                    window.registrarDerrota();
                }
            }
        }, 1000);
    },

    // --- FORMATAR TEMPO ---
    formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`;
    },

    // --- ATUALIZAR DISPLAY DO TIMER ---
    atualizarExibicaoTempo(texto) {
        let elementoTemporizador = document.getElementById("timer-display");
        if (!elementoTemporizador) {
            const cabecalho = document.querySelector(".game-header");
            elementoTemporizador = document.createElement("div");
            elementoTemporizador.id = "timer-display";
            elementoTemporizador.style = "font-size: 1.5rem; font-weight: bold; color: #e74c3c; margin-top: 10px;";
            cabecalho.appendChild(elementoTemporizador);
        }
        elementoTemporizador.textContent = `Tempo: ${texto}`;
    },

    // --- PARAR JOGO ---
    pararJogo(mensagem) {
        GradeJogo.jogoParado = true;
        clearInterval(this.intervaloTemporizador);
        const { campoJogador, btnBuscarJogador } = GradeInterface.elementos;
        if (campoJogador) {
            campoJogador.disabled = true;
        }
        
        if (btnBuscarJogador) {
            btnBuscarJogador.disabled = true;
        }
        alert(mensagem);
    }
};
