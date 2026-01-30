(() => {
    // Configuração do MiniGame Grid
    const GRID_SIZE = 3;
    const JSON_PATH = "../data/football-grid.json";
    const MIN_VALID_CELLS = 3;
    const MAX_ATTEMPTS = 50; 

    const MODE_WEIGHTS = {
        rowsCountry_colsClub: 0.6,     
        rowsClub_colsClub:    0.4 
    };

    const inputEl = document.getElementById('playerInput');
    const btnEl = document.getElementById('searchBtn');
    const newGridBtn = document.getElementById('newGridBtn');
    const cells = Array.from(document.querySelectorAll('.play-cell'));

    const colHeaders = Array.from(document.querySelectorAll('.club-header'));
    const rowHeaders = Array.from(document.querySelectorAll('.club-side'));

    const stopBtn = document.getElementById("stopBtn");

    let gameStopped = false;

    let timerInterval = null;
    let timeLeft = 0;

    let rawData = null;                 // Valor nulo
    let playersDataBase = [];           // Lista para mostrar [{nome, clubes: [canon], seleções}]
    let listaClube = [];                // [clubeCanon]
    let listaPaises = [];               // [paisesCanon]
    let clubeDisplay = new Map();       // clubeCanon -> { nome, escudo }
    let paisDisplay = new Map();        // paisesCanon -> displayName
    let clubeIndex = new Map();         // clubeCanon 
    let paisIndex = new Map();          // paisesCanon
    let usedPlayers = new Set();        // nomes canônicos já usados
    let currentGrid = null;             // { rows, cols, rowsType, colsType }

    const normalize = (s) =>
        (s ?? '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    
    const alias = new Map([
        // CLubes
        ['psg', 'psg'],
        ['paris saint-germain', 'psg'],
        ['real betis', 'real betis'],
        ['real betis balompie', 'real betis'],
        ['real betis balompié', 'real betis'],
        ['real betis balompie s.a.d', 'real betis'],
        ['real betis balompie sad', 'real betis'],
        ['real betis balompié sad', 'real betis'],
        ['real bétis', 'real betis'],
        ['betis', 'real betis'],

        ['atletico de madrid', 'atletico de madrid'],
        ['atlético de madrid', 'atletico de madrid'],

        ['bayern de munique', 'bayern de munique'],
        ['bayern munich', 'bayern de munique'],
        ['fc bayern munich', 'bayern de munique'],
        ['fc bayern münchen', 'bayern de munique'],

        ['manchester united', 'manchester united'],
        ['man united', 'manchester united'],
        ['man utd', 'manchester united'],

        ['manchester city', 'manchester city'],
        ['man city', 'manchester city'],

        ['ac milan', 'milan'],
        ['milan', 'milan'],
        
        ['borussia dortmund', 'borussia dortmund'],
        ['bvb', 'borussia dortmund'],

        // Seleções

        ['brasil', 'brasil'],
        ['portugal', 'portugal'],
        ['alemanha', 'alemanha'],
        ['argentina', 'argentina'],
        ['franca', 'franca'],
        ['frança', 'franca'],
        ['italia', 'italia'],
        ['itália', 'italia'],
        ['holanda', 'holanda'],
        ['paises baixos', 'holanda'],
        ['países baixos', 'holanda'],
        ['espanha', 'espanha'],
        ['inglaterra', 'inglaterra'],
        ['japao', 'japao'],
        ['japão', 'japao'],
        ['colombia', 'colombia'],
        ['colômbia', 'colombia'],
        ['polonia', 'polonia'],
        ['polônia', 'polonia']
    ]);

    const canon = (s) => alias.get(normalize(s)) || normalize(s);

    function dedupByCanon(items, getName) {
        const seen = new Set();
        const res = [];

        for (const it of items) {
            const key = canon(getName(it));

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            res.push({ key, item: it });
        }
        return res;
    }

    async function loadData() {
        const res = await fetch(JSON_PATH, { 
            cache: "no-store" 
        });
        
        if (!res.ok) {
            throw new Error(`Falha ao carregar JSON (${res.status})`);
        }
        return res.json();
    }

    function buildData(data) {
        rawData = data;

        // Clubes
        const clubePairs = dedupByCanon(data.clubes ?? [], (c) => c.nome);
        listaClube = clubePairs.map((p) => p.key);
        clubeDisplay = new Map(
            clubePairs.map(({ key, item }) => [key, { 
                nome: item.nome,
                escudo: item.escudo ?? null 
            }])
        );

        // Países/Seleções
        const paisPairs = dedupByCanon((data.selecoes ?? []).map((s) => ({ nome: s })), (x) => x.nome);
        listaPaises = paisPairs.map((p) => p.key);
        paisDisplay = new Map(paisPairs.map(({ key, item }) => [key, item.nome]));

        // Jogadores
        playersDataBase = (data.jogadores ?? []).map((p) => ({
            nome: p.nome,
            nomeCanon: normalize(p.nome),
            clubes: (p.clubes ?? []).map(canon),
            selecoes: (p.selecoes ?? []).map(canon)
        }));

        // Índices
        clubeIndex = new Map();
        paisIndex = new Map();

        playersDataBase.forEach((p, idx) => {
            p.clubes.forEach((cl) => {
                if (!clubeIndex.has(cl)) {
                    clubeIndex.set(cl, []);
                }
                clubeIndex.get(cl).push(idx);
            });

            p.selecoes.forEach((ct) => {
                if (!paisIndex.has(ct)) {
                    paisIndex.set(ct, []);
                }
                paisIndex.get(ct).push(idx);
            });
        });
    }

    function randomChoiceWeighted(weightObject) {
        const entries = Object.entries(weightObject);
        const total = entries.reduce((acc, [, w]) => acc + w, 0);
        let r = Math.random() * total;

        for (const [k, w] of entries) {
            r -= w;
            if (r <= 0) {
                return k;
            }
        }
        return entries[entries.length - 1][0];
    }

    function pickRandomUnique(pool, n, excludeSet = new Set()) {
        const filtered = pool.filter((x) => !excludeSet.has(x));
        if (filtered.length < n) {
            return null;
        }

        const arr = filtered.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, n);
    }

    function hasIntersectionPlayers(rowKey, rowType, colKey, colType) {
        if (rowType === "clube" && colType === "clube") {
            const a = clubeIndex.get(rowKey) || [];
            const bSet = new Set(clubeIndex.get(colKey) || []);
            return a.some((idx) => bSet.has(idx));
        }

        const isRowPaisColClube = rowType === "pais" && colType === "clube";
        const paisKey = isRowPaisColClube ? rowKey : colKey;
        const clubeKey = isRowPaisColClube ? colKey : rowKey;

        const byPais = paisIndex.get(paisKey) || [];
        const byClubeSet = new Set(clubeIndex.get(clubeKey) || []);
        return byPais.some((idx) => byClubeSet.has(idx));
    }

    function validateGrid(rows, cols, rowsType, colsType) {
        let validCount = 0;
        const matrix = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => false));

        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const ok = hasIntersectionPlayers(rows[i], rowsType, cols[j], colsType);
                matrix[i][j] = ok;

                if (ok) {
                    validCount++;
                }
            }
        }
        return { 
            validCount, 
            matrix 
        };
    }

    function drawRowsCols(rowsType, colsType) {
        const rowsPool = rowsType === "clube" ? listaClube : listaPaises;
        const colsPool = colsType === "clube" ? listaClube : listaPaises;

        const rows = pickRandomUnique(rowsPool, GRID_SIZE);
        if (!rows) {
            return null;
        }

        let exclude = new Set();
        if (rowsType === "clube" && colsType === "clube") {
            exclude = new Set(rows);
        }

        const cols = pickRandomUnique(colsPool, GRID_SIZE, exclude);
        if (!cols) {
            return null;
        }

        return { 
            rows, 
            cols 
        };
    }

    function chooseMode() {
        const pick = randomChoiceWeighted(MODE_WEIGHTS);
        if (pick === "rowsPais_colsClube") {
            return { 
                rowsType: "pais", 
                colsType: "clube" 
            };
        }

        return { 
            rowsType: "clube", 
            colsType: "clube" 
        };
    }

    function createGridConfig() {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const { rowsType, colsType } = chooseMode();
            const drawn = drawRowsCols(rowsType, colsType);
            
            if (!drawn) {
                continue;
            }

            const { rows, cols } = drawn;
            const { validCount, matrix } = validateGrid(rows, cols, rowsType, colsType);

            if (validCount >= MIN_VALID_CELLS) {
                return { 
                    rows, 
                    cols, 
                    rowsType, 
                    colsType, 
                    matrix 
                };
            }
        }
        return null;
    }

    function displayName(type, key) {
        if (type === "clube") {
            return clubeDisplay.get(key)?.nome ?? key;
        }
        return paisDisplay.get(key) ?? key;
    }

    function applyHeaders(headersEls, keys, type) {
        if (headersEls.length !== GRID_SIZE) {
            return;
        }

        for (let i = 0; i < GRID_SIZE; i++) {
            const key = keys[i];
            const el = headersEls[i];
            el.textContent = displayName(type, key);
            el.dataset.type = type;
            el.dataset.key = key;
        }
    }

    function applyGridToDOM(config) {
        const { rows, cols, rowsType, colsType } = config;

        applyHeaders(colHeaders, cols, colsType);
        applyHeaders(rowHeaders, rows, rowsType);

        usedPlayers.clear();

        cells.forEach((cell, idx) => {
            const r = Math.floor(idx / GRID_SIZE);
            const c = idx % GRID_SIZE;

            const rowKey = rows[r];
            const colKey = cols[c];

            cell.textContent = "";
            cell.classList.remove("correct");

            cell.dataset.row = rowKey;
            cell.dataset.col = colKey;
            cell.dataset.rowType = rowsType;
            cell.dataset.colType = colsType;
        });
    }

    function findPlayerByName(text) {
        const n = normalize(text);
        return playersDataBase.find((p) => p.nomeCanon === n) || null;
    }

    function playerMatchesCell(player, rowKey, rowType, colKey, colType) {
        const pClubes = new Set(player.clubes);
        const pPaises = new Set(player.selecoes);

        if (rowType === "clube" && colType === "clube") {
            return pClubes.has(rowKey) && pClubes.has(colKey);
        }

        if (rowType === "pais" && colType === "clube") {
            return pPaises.has(rowKey) && pClubes.has(colKey);
        }

        if (rowType === "clube" && colType === "pais") {
            return pClubes.has(rowKey) && pPaises.has(colKey);
        }
        return false;
    }

    function handleGuess() {
        if (gameStopped) {
            alert("Jogo encerrado. Clique em 🔄 para jogar novamente.")
            return;
        }

        if (!inputEl) {
            return;
        }

        const guess = inputEl.value.trim();

        if (!guess) {
            return;
        }

        const player = findPlayerByName(guess);
        if (!player) {
            alert("Jogador não encontrado no banco de dados.");
            inputEl.value = "";
            return;
        }

        const usedKey = normalize(player.nome);
        if (usedPlayers.has(usedKey)) {
            alert("Este jogador já foi usado nesta grade.");
            inputEl.value = "";
            return;
        }

        let placed = false;
        for (const cell of cells) {
            if (cell.textContent.trim() !== "") {
                continue;
            }

            const rowKey = cell.dataset.row;
            const colKey = cell.dataset.col;
            const rowType = cell.dataset.rowType;
            const colType = cell.dataset.colType;

            if (playerMatchesCell(player, rowKey, rowType, colKey, colType)) {
                cell.textContent = player.nome;
                cell.classList.add("correct");
                usedPlayers.add(usedKey);
                placed = true;
                break;
            }
        }

        alert(placed ? "Jogador inserido na grade." : "Este jogador não preenche nenhum requisito da grade atual.");
        inputEl.value = "";
    }

    function setupEvents() {
        btnEl?.addEventListener("click", handleGuess);
        
        inputEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleGuess();
            }
        });

        newGridBtn?.addEventListener("click", () => {
            location.reload();

            const cfg = createGridConfig();
            if (!cfg) {
                alert("Não foi possível gerar uma grade válida. Tente novamente.");
                return;
            }
        });

        gameStopped = false;

        inputEl.disabled = false;
        btnEl.disabled = false;
        stopBtn.disabled = false;

        inputEl.value = "";
        inputEl.focus();

        currentGrid = cfg;
        applyGridToDOM(cfg);

        stopBtn?.addEventListener("click", () => {
            gameStopped = true;

            // desabilita interação
            inputEl.disabled = true;
            btnEl.disabled = true;

            stopGame("Você desistiu! Clique em 🔄 para gerar um novo Grid.");
        });
    }

    async function initFootballGrid() {
        try {
            const data = await loadData();
            buildData(data);

            const cfg = createGridConfig();
            if (!cfg) {
                throw new Error("Falha ao gerar uma grade jogável.");
            }

            currentGrid = cfg;
            applyGridToDOM(cfg);
            setupEvents();

            // --- LÓGICA DE INÍCIO DO TIMER ---
            const urlParams = new URLSearchParams(window.location.search);
            const timeMode = urlParams.get('time') || 'unlimited';
            startTimer(timeMode);
            // ---------------------------------

        } catch (err) {
            console.error(err);
            alert(`Erro ao inicializar: ${err.message}`);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFootballGrid);
    } else {
        initFootballGrid();
    }

    function startTimer(minutes) {
        if (minutes === 'unlimited') {
            updateTimerDisplay("∞");
            return;
        }

        timeLeft = parseInt(minutes) * 60;
        updateTimerDisplay(formatTime(timeLeft));

        // Limpa qualquer timer anterior se existir
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(formatTime(timeLeft));

            if (timeLeft <= 0) {
                stopGame("Tempo esgotado!");
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay(text) {
        // Procura por um elemento de timer ou cria um no cabeçalho
        let timerEl = document.getElementById('timer-display');
        if (!timerEl) {
            const header = document.querySelector('.game-header');
            timerEl = document.createElement('div');
            timerEl.id = 'timer-display';
            timerEl.style = "font-size: 1.5rem; font-weight: bold; color: #e74c3c; margin-top: 10px;";
            header.appendChild(timerEl);
        }
        timerEl.textContent = `Tempo: ${text}`;
    }

    function stopGame(message) {
        gameStopped = true;
        clearInterval(timerInterval);
        inputEl.disabled = true;
        btnEl.disabled = true;
        alert(message);
    }
})();
