

const input = document.getElementById('playerInput');
const btn = document.getElementById('searchBtn');
const cells = document.querySelectorAll('.play-cell');

function checkGuess() {
    const guess = input.value.trim().toLowerCase();
    const player = playersDB.find(p => p.name.toLowerCase() === guess);

    if (player) {
        let matched = false;
        cells.forEach(cell => {
            const rowClub = cell.getAttribute('data-row');
            const colClub = cell.getAttribute('data-col');

            // Verifica se o jogador jogou em AMBOS os clubes da célula
            if (player.clubs.includes(rowClub) && player.clubs.includes(colClub)) {
                if (cell.innerText === "") {
                    cell.innerText = player.name;
                    cell.classList.add('correct');
                    matched = true;
                }
            }
        });

        if (matched) {
            alert("Boa! Jogador inserido na grade.");
        } else {
            alert("Este jogador não preenche nenhum requisito da grade atual.");
        }
    } else {
        alert("Jogador não encontrado no banco de dados.");
    }
    input.value = "";
}

btn.addEventListener('click', checkGuess);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkGuess();
});