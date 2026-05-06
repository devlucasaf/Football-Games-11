const FootballBingo = {
    dados: null,
    jogadoresSelecionados: [],
    timesSelecionados: [],

    async iniciar() {
        try {
            const resposta = await fetch('../data/football-grid.json');
            this.dados = await resposta.json();
            this.gerarJogo();
            this.configurarEventos();
        } catch (erro) {
            console.error('Erro ao carregar dados do bingo:', erro);
        }
    },

    gerarJogo() {
        this.selecionarJogadores();
        this.selecionarTimes();
        this.renderizarJogadores();
        this.renderizarGrid();
    },

    selecionarJogadores() {
        const jogadores = [...this.dados.jogadores];
        this.jogadoresSelecionados = this.embaralhar(jogadores).slice(0, 6);
    },

    selecionarTimes() {
        const clubes = this.dados.clubes.map(c => c.nome);
        this.timesSelecionados = this.embaralhar([...clubes]).slice(0, 36);
    },

    renderizarJogadores() {
        const container = document.getElementById('bingoPlayers');
        container.innerHTML = '';

        this.jogadoresSelecionados.forEach(jogador => {
            const div = document.createElement('div');
            div.className = 'bingo-player-name';
            div.textContent = jogador.nome;
            div.title = jogador.nome;
            container.appendChild(div);
        });
    },

    renderizarGrid() {
        const grid = document.getElementById('bingoGrid');
        grid.innerHTML = '';

        this.timesSelecionados.forEach((time, indice) => {
            const btn = document.createElement('button');
            btn.className = 'bingo-cell';
            btn.textContent = time;
            btn.dataset.indice = indice;
            btn.dataset.time = time;

            btn.addEventListener('click', () => this.alternarCelula(btn));
            grid.appendChild(btn);
        });
    },

    alternarCelula(btn) {
        btn.classList.toggle('marcado');
    },

    configurarEventos() {
        const btnNovo = document.getElementById('novoJogoBtn');
        if (btnNovo) {
            btnNovo.addEventListener('click', () => this.gerarJogo());
        }
    },

    embaralhar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FootballBingo.iniciar();
});
