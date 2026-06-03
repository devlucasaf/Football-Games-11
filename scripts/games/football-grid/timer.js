const GridTemporizador = {
    intervaloTimer: null,
    tempoRestante:  0,

    // --- INICIAR TIMER ---
    iniciarTimer(minutos) {
        if (minutos === "unlimited") {
            this.atualizarDisplayTimer("∞");
            return;
        }

        this.tempoRestante = parseInt(minutos) * 60;
        this.atualizarDisplayTimer(this.formatarTempo(this.tempoRestante));

        if (this.intervaloTimer) {
            clearInterval(this.intervaloTimer);
        }

        this.intervaloTimer = setInterval(() => {
            this.tempoRestante--;
            this.atualizarDisplayTimer(this.formatarTempo(this.tempoRestante));

            if (this.tempoRestante <= 0) {
                this.pararJogo("Tempo esgotado!");
            }
        }, 1000);
    },

    // --- FORMATAR TEMPO ---
    formatarTempo(segundos) {
        const mins = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${mins}:${segs.toString().padStart(2, "0")}`;
    },

    // --- ATUALIZAR DISPLAY DO TIMER ---
    atualizarDisplayTimer(texto) {
        let timerEl = document.getElementById("timer-display");
        if (!timerEl) {
            const cabecalho = document.querySelector(".game-header");
            timerEl = document.createElement("div");
            timerEl.id = "timer-display";
            timerEl.style = "font-size: 1.5rem; font-weight: bold; color: #e74c3c; margin-top: 10px;";
            cabecalho.appendChild(timerEl);
        }
        timerEl.textContent = `Tempo: ${texto}`;
    },

    // --- PARAR JOGO ---
    pararJogo(mensagem) {
        GridJogo.jogoParado = true;
        clearInterval(this.intervaloTimer);
        const { inputJogador, btnBuscar } = GridInterface.elementos;
        if (inputJogador) {
            inputJogador.disabled = true;
        }
        
        if (btnBuscar) {
            btnBuscar.disabled = true;
        }
        alert(mensagem);
    }
};
