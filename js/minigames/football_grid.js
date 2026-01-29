(() => {
    // Configuração do MiniGame Grid
    const GRID_SIZE = 3;
    const JSON_PATH = "..data/players-grid.json";
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
    const colHeaders = Array.from(document.querySelectorAll('.col-label'));
    const rowHeaders = Array.from(document.querySelectorAll('row-label'));

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

            if (seen.has(key)) 
                continue;

            seen.add(key);
            res.push({key, item: it});
        }
        return res;
    }

    async function loadData() {
        const res = await fetch(JSON_PATH, {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error(`Falha ao carregar JSON (${res.status})`);
        }
        return res.json();
    }

    function buildData(data) {
        rawData = data;

        // Clubes (dedup + display maps)
        const clubePairs = dedupByCanon(data.clubes ?? [], (c) => c.nome);
        listaClube = clubePairs.map((p) => p.key);

        clubeDisplay = new Map(
            clubePairs.map(({key, item}) => [key, {nome: item.nome, escudo: item.escudo ?? null}])
        );

        // Seleções
        const countryPairs = dedupByCanon((data.selecoes ?? []).map((s) => ({ nome: s })), (x) => x.nome);
        countryList = countryPairs.map((p) => p.key);
        countryDisplay = new Map(countryPairs.map(({ key, item }) => [key, item.nome]));

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
                if (!clubeIndex.has(cl)) clubeIndex.set(cl, []);
                clubeIndex.get(c1).push(idx);
            });
            p.selecoes.forEach((ct) => {
                if (!paisIndex.has(ct)) paisDisplay.set(ct, []);
                paisIndex.get(ct).push(idx);
            });
        });
    }

    // Sorteio e validação da grade
    function randomChoiceWeighted(weightObject) {
        const entries = Object.entries(weightObject);
        const total = entries.reduce((acc, [, w]) => acc + w, 0);
        let r = Math.ramdom() * total;

        for (const [k, w] of entrues) {
            if ((r -= w) <= 0)
                return k;
        }
        return entries[entries.length - 1][0];
    }

    function pickRandomUnique(pool, n, excludeSet = new Set()) {
        const filtered = pool.filter((x) => !excludeSet.has(x));

        if(filtered.length < n) 
            return null;
        
        const arr = filtered.slice();

        for (let i = arr.length -1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, n);
    }

    function hasIntersectionPlayers(rowKey, rowType, colKey, colType) {
        if (rowType === 'clube' && colType === 'clube') {
            const a = clubeIndex.get(rowKey) || [];
            const bSet = new Set(clubeIndex.get(colKey) || []);
            return a.some((idx) => bSet.has(idx)); 
        }

        const isRowPaisesColClube = rowType === 'pais' && colType === 'clube';
        const paisKey = isRowPaisesColClube ? rowKey : colKey;
        const clubeKey = isRowPaisesColClube ? colKey : rowKey;

        const byPaises = countryIndex.get(paisKey) || [];
        const byClubeSet = new Set(clubIndex.get(clubeKey) || []);
        return byPaises.some((idx) => byClubeSet.has(idx));
    }

    function validateGrid(rows, cols, rowsType, colsType) {
        let validCount = 0;
        const matrix = Array.from({ length: GRID_SIZE}, () =>
            Array.from({ length: GRID_SIZE }, () => false)
        );

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
            validCount, matrix
        };
    }

    // Evita "clube × clube" com o MESMO clube cruzando 
    function drawRowsCols(rowsType, colsType) {
        const rowsPool = rowsType === 'clube' ? listaClube : listaPaises;
        const colsPool = colsType === 'clube' ? listaClube : listaPaises;

        // Linhas
        const rows = pickRandomUnique(rowsPool, GRID_SIZE);
        if (!rows) {
            return null;
        }

        let exclude = new Set();
        if (rowsType === 'clube' && colsType === 'club') {
            exclude = new Set(rows);
        }

        const cols = pickRandomUnique(colsPool, GRID_SIZE, exclude);
        if (!cols) {
            return null;
        }
        return {
            rows, cols
        };
    }

    function chooseMode() {
        const pick = randomChoiceWeighted(MODE_WEIGHTS);
        if (pick === 'rowsPais_colsClube') {
            return {
                rowsType: 'pais',
                colsType: 'clube'
            };
        }
    }

    function createdGridConfig() {
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
        if (type === 'clube') {
            return clubeDisplay.get(key)?.nome ?? key;
        }
        return paisDisplay.get(key) ?? key;
    }

    function displayBadge(type, key) {
        if (type === 'clube') {
            return clubeDisplay.get(key)?.nome ?? key;
        }
        return paisDisplay.get(key) ?? key;
    }

    function applyHeaders(headersEls, keys, type) {
        if (headersEls.length !== GRID_SIZE) 
            return;

        for (let i = 0; i < GRID_SIZE; i++) {
            const key = keys[i];
            const el = headersEls[i];
            el.textContent = displayName(type, key);
            el.dataset.type = type;
            el.dataset.key = key;

            // Se quiser mostrar escudo nos cabeçalhos (quando tipo = club)
            const badge = displayBadge(type, key);
            if (badge) {
                el.setAttribute('data-badge', badge);
                // Você pode usar CSS para exibir a imagem via attr(data-badge) -> content ou background.
            } else {
                el.removeAttribute('data-badge');
            }
        }
    }

    
    function applyGridToDOM(config) {
        const { rows, cols, rowsType, colsType } = config;

        // Aplica rótulos
        applyHeaders(colHeaders, cols, colsType);
        applyHeaders(rowHeaders, rows, rowsType);

        // Limpa estado
        usedPlayers.clear();

        // Prepara células (assume 3×3)
        cells.forEach((cell, idx) => {
        const r = cell.dataset.rowIndex ? parseInt(cell.dataset.rowIndex, 10) : Math.floor(idx / GRID_SIZE);
        const c = cell.dataset.colIndex ? parseInt(cell.dataset.colIndex, 10) : (idx % GRID_SIZE);

        const rowKey = rows[r];
        const colKey = cols[c];

        cell.textContent = '';
        cell.classList.remove('correct');

        // Tipos e chaves canônicas
        cell.dataset.row = rowKey;
        cell.dataset.col = colKey;
        cell.dataset.rowType = rowsType;
        cell.dataset.colType = colsType;
        });
    }

    
    // === Validação do palpite ===
    function findPlayerByName(text) {
        const n = normalize(text);
        return playersDataBase.find((p) => p.nomeCanon === n) || null;
    }

    function playerMatchesCell(player, rowKey, rowType, colKey, colType) {
        const pClubes = new Set(player.clubes);
        const pPaises = new Set(player.selecoes);

        if (rowType === 'club' && colType === 'club') {
            // Precisa ter passado pelos dois clubes (ordem não importa)
            return pClubes.has(rowKey) && pClubes.has(colKey);
        }
        if (rowType === 'country' && colType === 'club') {
            return pPaises.has(rowKey) && pClubes.has(colKey);
        }
        if (rowType === 'club' && colType === 'country') {
            return pClubes.has(rowKey) && pPaises.has(colKey);
        }
        return false; // Nunca país×país neste minigame
    }

    
    function handleGuess() {
        if (!inputEl) 
            return;

        const guess = inputEl.value.trim();

        if (!guess) 
            return;

        const player = findPlayerByName(guess);

        if (!player) {
            alert('Jogador não encontrado no banco de dados.');
            inputEl.value = '';
            return;
        }

        const usedKey = normalize(player.nome);
        if (usedPlayers.has(usedKey)) {
            alert('Este jogador já foi usado nesta grade.');
            inputEl.value = '';
            return;
        }

        // Tenta inserir na primeira célula válida e vazia
        let placed = false;
        for (const cell of cells) {
            if (cell.textContent.trim() !== '') continue;

            const rowKey = cell.dataset.row;
            const colKey = cell.dataset.col;
            const rowType = cell.dataset.rowType;
            const colType = cell.dataset.colType;

            if (playerMatchesCell(player, rowKey, rowType, colKey, colType)) {
                cell.textContent = player.nome;
                cell.classList.add('correct');
                usedPlayers.add(usedKey);
                placed = true;
                break;
            }
        }

        if (placed) {
            alert('Jogador inserido na grade.');
        } else {
            alert('Este jogador não preenche nenhum requisito da grade atual.');
        }
        inputEl.value = '';
    }

    function setupEvents() {
        btnEl?.addEventListener('click', handleGuess);
        inputEl?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') 
                handleGuess();
        });

        newGridBtn?.addEventListener('click', () => {
            const cfg = createGridConfig();
            if (!cfg) {
                alert('Não foi possível gerar uma grade válida. Tente novamente.');
                return;
            }
            currentGrid = cfg;
            applyGridToDOM(cfg);
        });
    }

    async function initFootballGrid() {
        try {
            const data = await loadData();
            buildData(data);

            const cfg = createdGridConfig();
            if (!cfg) {
                throw new Error('Falha ao gerar uma grade jogável após várias tentativas.');
            }
            currentGrid = cfg;
            applyGridToDOM(cfg);
            setupEvents();
        } catch (err) {
            console.error(err);
            alert(`Erro ao inicializar o Football Grid: ${err.message}`);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener(`DOMContentLoaded`, initFootballGrid);
    } else {
        initFootballGrid();
    }
})();
