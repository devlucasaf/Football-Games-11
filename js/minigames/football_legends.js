/* ===== FOOTBALL LEGENDS GAME LOGIC ===== */

const FootballLegends = {
    // Data
    teamsData: null,
    currentTeam: null,
    selectedPlayers: new Map(), // Map<position, player>
    currentFormation: '4-3-3',
    
    // Formation configurations
    formations: {
        '4-3-3': {
            positions: [
                { id: 'GK', x: 5, y: 50 }, // Goleiro
                { id: 'LD', x: 20, y: 20 }, // Lateral Direito
                { id: 'ZAG1', x: 20, y: 40 }, // Zagueiro 1
                { id: 'ZAG2', x: 20, y: 60 }, // Zagueiro 2
                { id: 'LE', x: 20, y: 80 }, // Lateral Esquerdo
                { id: 'VOL', x: 40, y: 50 }, // Volante
                { id: 'MEI1', x: 50, y: 30 }, // Meia 1
                { id: 'MEI2', x: 50, y: 70 }, // Meia 2
                { id: 'PD', x: 75, y: 25 }, // Ponta Direita
                { id: 'CA', x: 75, y: 50 }, // Centroavante
                { id: 'PE', x: 75, y: 75 }  // Ponta Esquerda
            ]
        },
        '4-4-2': {
            positions: [
                { id: 'GK', x: 5, y: 50 },
                { id: 'LD', x: 20, y: 20 },
                { id: 'ZAG1', x: 20, y: 40 },
                { id: 'ZAG2', x: 20, y: 60 },
                { id: 'LE', x: 20, y: 80 },
                { id: 'MD', x: 45, y: 25 }, // Meia Direita
                { id: 'VOL1', x: 45, y: 40 }, // Volante 1
                { id: 'VOL2', x: 45, y: 60 }, // Volante 2
                { id: 'ME', x: 45, y: 75 }, // Meia Esquerda
                { id: 'ATA1', x: 75, y: 40 }, // Atacante 1
                { id: 'ATA2', x: 75, y: 60 }  // Atacante 2
            ]
        },
        '3-5-2': {
            positions: [
                { id: 'GK', x: 5, y: 50 },
                { id: 'ZAG1', x: 20, y: 30 },
                { id: 'ZAG2', x: 20, y: 50 },
                { id: 'ZAG3', x: 20, y: 70 },
                { id: 'MD', x: 40, y: 20 },
                { id: 'VOL1', x: 40, y: 40 },
                { id: 'MEI', x: 40, y: 50 },
                { id: 'VOL2', x: 40, y: 60 },
                { id: 'ME', x: 40, y: 80 },
                { id: 'ATA1', x: 75, y: 40 },
                { id: 'ATA2', x: 75, y: 60 }
            ]
        },
        '4-2-3-1': {
            positions: [
                { id: 'GK', x: 5, y: 50 },
                { id: 'LD', x: 20, y: 20 },
                { id: 'ZAG1', x: 20, y: 40 },
                { id: 'ZAG2', x: 20, y: 60 },
                { id: 'LE', x: 20, y: 80 },
                { id: 'VOL1', x: 35, y: 35 },
                { id: 'VOL2', x: 35, y: 65 },
                { id: 'MOD', x: 55, y: 25 }, // Meia Ofensivo Direito
                { id: 'CAM', x: 55, y: 50 }, // Meia Central Ofensivo
                { id: 'MOE', x: 55, y: 75 }, // Meia Ofensivo Esquerdo
                { id: 'CA', x: 80, y: 50 }
            ]
        }
    },
    
    // Position groups for filtering
    positionGroups: {
        'GK': 'Goleiros',
        'ZAG': 'Zagueiros',
        'LD': 'Laterais',
        'LE': 'Laterais',
        'VOL': 'Meio-Campo',
        'MEI': 'Meio-Campo',
        'ME': 'Meio-Campo',
        'MD': 'Meio-Campo',
        'CAM': 'Meio-Campo',
        'MOD': 'Meio-Campo',
        'MOE': 'Meio-Campo',
        'PD': 'Atacantes',
        'PE': 'Atacantes',
        'CA': 'Atacantes',
        'ATA': 'Atacantes'
    },
    
    // Initialize Teams Page
    initTeamsPage: async function() {
        try {
            // Load teams data
            await this.loadTeamsData();
            
            // Render teams grid
            this.renderTeamsGrid();
            
            // Update stats
            this.updatePageStats();
            
            // Setup event listeners
            this.setupTeamsPageListeners();
            
        } catch (error) {
            console.error('Error initializing teams page:', error);
            this.showErrorState();
        }
    },
    
    // Load teams data from JSON
    loadTeamsData: async function() {
        try {
            const response = await fetch('../data/historical-teams.json');
            if (!response.ok) {
                throw new Error('Failed to load teams data');
            }
            this.teamsData = await response.json();
        } catch (error) {
            console.error('Error loading teams data:', error);
            throw error;
        }
    },
    
    // Render teams grid
    renderTeamsGrid: function() {
        const teamsGrid = document.getElementById('teamsGrid');
        const loadingElement = document.getElementById('loadingTeams');
        
        if (!this.teamsData || !this.teamsData.teams) {
            this.showErrorState();
            return;
        }
        
        // Hide loading
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Clear grid
        teamsGrid.innerHTML = '';
        
        // Add team cards
        this.teamsData.teams.forEach(team => {
            const teamCard = this.createTeamCard(team);
            teamsGrid.appendChild(teamCard);
        });
    },
    
    // Create team card element
    createTeamCard: function(team) {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.dataset.teamKey = team.key;
        
        // Get position counts
        const positionCounts = this.getPositionCounts(team.players);
        
        card.innerHTML = `
            <div class="team-badge">
                <i class="fas fa-${team.type === 'club' ? 'shield-alt' : 'flag'}"></i>
            </div>
            <h3>${team.name}</h3>
            <div class="team-type">${team.type === 'club' ? 'Clube' : 'Seleção'}</div>
            <div class="team-count">
                <i class="fas fa-users"></i>
                ${team.players.length} jogadores históricos
            </div>
            <div class="position-breakdown">
                ${positionCounts.GK || 0} <i class="fas fa-goal-net"></i>
                ${positionCounts.DEF || 0} <i class="fas fa-shield"></i>
                ${positionCounts.MID || 0} <i class="fas fa-futbol"></i>
                ${positionCounts.ATT || 0} <i class="fas fa-bolt"></i>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            window.location.href = `legends-builder.html?team=${team.key}`;
        });
        
        return card;
    },
    
    // Get position counts for a team
    getPositionCounts: function(players) {
        const counts = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
        
        players.forEach(player => {
            const pos = player.pos.toUpperCase();
            if (pos.includes('GK')) {
                counts.GK++;
            } else if (pos.includes('ZAG') || pos.includes('LD') || pos.includes('LE') || pos.includes('LAT')) {
                counts.DEF++;
            } else if (pos.includes('VOL') || pos.includes('MEI') || pos.includes('ME') || pos.includes('MD') || pos.includes('CAM')) {
                counts.MID++;
            } else if (pos.includes('ATA') || pos.includes('CA') || pos.includes('PD') || pos.includes('PE') || pos.includes('SA')) {
                counts.ATT++;
            }
        });
        
        return counts;
    },
    
    // Update page stats
    updatePageStats: function() {
        if (!this.teamsData) return;
        
        const totalTeams = document.getElementById('totalTeams');
        const totalPlayers = document.getElementById('totalPlayers');
        
        if (totalTeams) {
            totalTeams.textContent = this.teamsData.teams.length;
        }
        
        if (totalPlayers) {
            const playerCount = this.teamsData.teams.reduce((total, team) => total + team.players.length, 0);
            totalPlayers.textContent = playerCount;
        }
    },
    
    // Show error state
    showErrorState: function() {
        const loadingElement = document.getElementById('loadingTeams');
        const errorElement = document.getElementById('errorState');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (errorElement) {
            errorElement.style.display = 'block';
        }
    },
    
    // Setup teams page event listeners
    setupTeamsPageListeners: function() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme);
        }
    },
    
    // Initialize Builder Page
    initBuilderPage: async function() {
        try {
            // Get team from URL
            const urlParams = new URLSearchParams(window.location.search);
            const teamKey = urlParams.get('team');
            
            if (!teamKey) {
                window.location.href = 'football-legends.html';
                return;
            }
            
            // Load teams data
            await this.loadTeamsData();
            
            // Find team
            this.currentTeam = this.teamsData.teams.find(team => team.key === teamKey);
            
            if (!this.currentTeam) {
                window.location.href = 'football-legends.html';
                return;
            }
            
            // Update UI
            this.updateBuilderUI();
            
            // Render players list
            this.renderPlayersList();
            
            // Render formation
            this.renderFormation();
            
            // Setup event listeners
            this.setupBuilderListeners();
            
            // Setup drag and drop
            this.setupDragAndDrop();
            
        } catch (error) {
            console.error('Error initializing builder page:', error);
            window.location.href = 'football-legends.html';
        }
    },
    
    // Update builder UI
    updateBuilderUI: function() {
        // Update team name
        const teamNameElement = document.getElementById('teamName');
        const teamFullNameElement = document.getElementById('teamFullName');
        const playerCountElement = document.getElementById('playerCount');
        
        if (teamNameElement) {
            teamNameElement.textContent = this.currentTeam.name;
        }
        
        if (teamFullNameElement) {
            teamFullNameElement.textContent = `Melhor XI Histórico - ${this.currentTeam.name}`;
        }
        
        if (playerCountElement) {
            playerCountElement.textContent = this.currentTeam.players.length;
        }
    },
    
    // Render players list
    renderPlayersList: function() {
        const playersList = document.getElementById('playersList');
        const loadingElement = document.getElementById('loadingPlayers');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (!playersList) {
            return;
        }
        
        // Clear list
        playersList.innerHTML = '';
        
        // Add players
        this.currentTeam.players.forEach((player, index) => {
            const playerElement = this.createPlayerElement(player, index);
            playersList.appendChild(playerElement);
        });
        
        // Update field count
        this.updateFieldCount();
    },
    
    // Create player element
    createPlayerElement: function(player, index) {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.dataset.playerIndex = index;
        div.draggable = true;
        
        // Get position group
        const positionGroup = this.getPositionGroup(player.pos);
        
        div.innerHTML = `
            <div class="player-header">
                <span class="player-name">${player.name}</span>
                <span class="player-position">${player.pos}</span>
            </div>
            <div class="player-info">
                <span>${positionGroup}</span>
                <i class="fas fa-${this.isPlayerSelected(player.name) ? 'check-circle' : 'plus-circle'}"></i>
            </div>
        `;
        
        return div;
    },
    
    // Get position group for a player
    getPositionGroup: function(position) {
        const pos = position.toUpperCase();
        for (const [key, group] of Object.entries(this.positionGroups)) {
            if (pos.includes(key)) {
                return group;
            }
        }
        return 'Outros';
    },
    
    // Check if player is already selected
    isPlayerSelected: function(playerName) {
        return Array.from(this.selectedPlayers.values()).some(player => player.name === playerName);
    },
    
    // Render formation
    renderFormation: function() {
        const formationPositions = document.getElementById('formationPositions');
        if (!formationPositions) return;
        
        // Clear positions
        formationPositions.innerHTML = '';
        
        // Get current formation positions
        const positions = this.formations[this.currentFormation].positions;
        
        // Add position slots
        positions.forEach(pos => {
            const slot = this.createPositionSlot(pos);
            formationPositions.appendChild(slot);
        });
        
        // Update current formation display
        const currentFormationElement = document.getElementById('currentFormation');
        if (currentFormationElement) {
            currentFormationElement.textContent = this.currentFormation;
        }
    },
    
    // Create position slot element
    createPositionSlot: function(position) {
        const slot = document.createElement('div');
        slot.className = 'position-slot';
        slot.dataset.position = position.id;
        slot.style.left = `${position.x}%`;
        slot.style.top = `${position.y}%`;
        
        // Check if position is filled
        const player = this.selectedPlayers.get(position.id);
        if (player) {
            slot.classList.add('filled');
            slot.innerHTML = `
                <div class="position-label">${player.name}</div>
            `;
        } else {
            slot.innerHTML = `
                <div class="position-label">${position.id}</div>
            `;
        }
        
        // Add click event to remove player
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (player) {
                this.removePlayerFromPosition(position.id);
            }
        });
        
        return slot;
    },
    
    // Setup drag and drop
    setupDragAndDrop: function() {
        const playerItems = document.querySelectorAll('.player-item');
        const positionSlots = document.querySelectorAll('.position-slot');
        
        // Player drag start
        playerItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.playerIndex);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        // Position slot drag over
        positionSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!slot.classList.contains('filled')) {
                    slot.style.borderColor = 'var(--accent-pink)';
                }
            });
            
            slot.addEventListener('dragleave', () => {
                slot.style.borderColor = '';
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const playerIndex = e.dataTransfer.getData('text/plain');
                const position = slot.dataset.position;
                
                if (playerIndex && position) {
                    this.addPlayerToPosition(parseInt(playerIndex), position);
                }
                
                slot.style.borderColor = '';
            });
        });
    },
    
    // Add player to position
    addPlayerToPosition: function(playerIndex, position) {
        const player = this.currentTeam.players[playerIndex];
        
        if (!player) {
            return;
        }
        
        // Remove player from any other position
        this.removePlayerFromAllPositions(player.name);
        
        // Add to position
        this.selectedPlayers.set(position, player);
        
        // Update UI
        this.renderFormation();
        this.renderPlayersList();
        this.updateSelectedPlayers();
        this.updateFieldCount();
    },
    
    // Remove player from position
    removePlayerFromPosition: function(position) {
        this.selectedPlayers.delete(position);
        
        // Update UI
        this.renderFormation();
        this.renderPlayersList();
        this.updateSelectedPlayers();
        this.updateFieldCount();
    },
    
    // Remove player from all positions
    removePlayerFromAllPositions: function(playerName) {
        for (const [position, player] of this.selectedPlayers.entries()) {
            if (player.name === playerName) {
                this.selectedPlayers.delete(position);
                break;
            }
        }
    },
    
    // Update selected players display
    updateSelectedPlayers: function() {
        const selectedPlayersElement = document.getElementById('selectedPlayers');
        if (!selectedPlayersElement) {
            return;
        }
        
        if (this.selectedPlayers.size === 0) {
            selectedPlayersElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Arraste jogadores para o campo ou clique nas posições vazias</p>
                </div>
            `;
            return;
        }
        
        const grid = document.createElement('div');
        grid.className = 'selected-players-grid';
        
        this.selectedPlayers.forEach((player, position) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'selected-player';
            playerElement.innerHTML = `
                <div class="selected-player-name">${player.name}</div>
                <div class="selected-player-position">${position}</div>
            `;
            grid.appendChild(playerElement);
        });
        
        selectedPlayersElement.innerHTML = '';
        selectedPlayersElement.appendChild(grid);
    },
    
    // Update field count
    updateFieldCount: function() {
        const fieldCountElement = document.getElementById('fieldCount');
        if (fieldCountElement) {
            fieldCountElement.textContent = `${this.selectedPlayers.size}/11`;
        }
    },
    
    // Setup builder event listeners
    setupBuilderListeners: function() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme);
        }
        
        // Formation toggle
        const formationToggle = document.getElementById('formationToggle');
        if (formationToggle) {
            formationToggle.addEventListener('click', () => {
                const menu = document.getElementById('formationsMenu');
                menu.classList.toggle('active');
            });
        }
        
        // Formation options
        const formationOptions = document.querySelectorAll('.formation-option');
        formationOptions.forEach(option => {
            option.addEventListener('click', () => {
                const formation = option.dataset.formation;
                this.changeFormation(formation);
            });
        });
        
        // Position filter
        const positionFilter = document.getElementById('positionFilter');
        if (positionFilter) {
            positionFilter.addEventListener('change', (e) => {
                this.filterPlayersByPosition(e.target.value);
            });
        }
        
        // Reset team
        const resetButton = document.getElementById('resetTeam');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetTeam();
            });
        }
        
        // Save team
        const saveButton = document.getElementById('saveTeam');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveTeam();
            });
        }
        
        // Modal close
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Share team
        const shareButton = document.getElementById('shareTeam');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareTeam();
            });
        }
        
        // New team
        const newTeamButton = document.getElementById('newTeam');
        if (newTeamButton) {
            newTeamButton.addEventListener('click', () => {
                window.location.href = 'football-legends.html';
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('formationsMenu');
            const toggle = document.getElementById('formationToggle');
            
            if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    },
    
    // Change formation
    changeFormation: function(formation) {
        if (this.formations[formation]) {
            this.currentFormation = formation;
            this.renderFormation();
            
            // Close menu
            const menu = document.getElementById('formationsMenu');
            if (menu) {
                menu.classList.remove('active');
            }
            
            // Update formation positions for players
            this.updatePlayerPositionsForFormation();
        }
    },
    
    // Update player positions for new formation
    updatePlayerPositionsForFormation: function() {
        // This is a simplified approach - in a real app, you might want to
        // map players from old formation to new formation
        const newSelectedPlayers = new Map();
        
        // Try to keep players in similar positions
        this.selectedPlayers.forEach((player, oldPosition) => {
            // Find similar position in new formation
            const newPosition = this.findSimilarPosition(oldPosition);
            if (newPosition && !newSelectedPlayers.has(newPosition)) {
                newSelectedPlayers.set(newPosition, player);
            }
        });
        
        this.selectedPlayers = newSelectedPlayers;
        this.renderFormation();
        this.updateSelectedPlayers();
        this.updateFieldCount();
    },
    
    // Find similar position in new formation
    findSimilarPosition: function(oldPosition) {
        const oldPositions = this.formations[this.currentFormation].positions;
        const similarPositions = {
            'GK': ['GK'],
            'LD': ['LD', 'LAT'],
            'LE': ['LE', 'LAT'],
            'ZAG': ['ZAG1', 'ZAG2', 'ZAG3'],
            'VOL': ['VOL', 'VOL1', 'VOL2'],
            'MEI': ['MEI', 'MEI1', 'MEI2', 'CAM'],
            'PD': ['PD', 'MOD'],
            'PE': ['PE', 'MOE'],
            'CA': ['CA', 'ATA1', 'ATA2']
        };
        
        for (const [category, positions] of Object.entries(similarPositions)) {
            if (oldPosition.includes(category)) {
                // Find first available similar position
                for (const pos of positions) {
                    if (!this.selectedPlayers.has(pos)) {
                        return pos;
                    }
                }
            }
        }
        
        return null;
    },
    
    // Filter players by position
    filterPlayersByPosition: function(filter) {
        const playersList = document.getElementById('playersList');
        if (!playersList) { 
            return;
        }
        
        const playerItems = playersList.querySelectorAll('.player-item');
        
        playerItems.forEach(item => {
            const playerIndex = parseInt(item.dataset.playerIndex);
            const player = this.currentTeam.players[playerIndex];
            
            if (filter === 'all' || this.positionMatchesFilter(player.pos, filter)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    // Check if position matches filter
    positionMatchesFilter: function(position, filter) {
        const pos = position.toUpperCase();
        
        switch (filter) {
            case 'GK':
                return pos.includes('GK');
            case 'ZAG':
                return pos.includes('ZAG');
            case 'LD/LE':
                return pos.includes('LD') || pos.includes('LE') || pos.includes('LAT');
            case 'VOL/MEI':
                return pos.includes('VOL') || pos.includes('MEI') || pos.includes('ME') || pos.includes('MD') || pos.includes('CAM');
            case 'ATA':
                return pos.includes('ATA') || pos.includes('CA') || pos.includes('PD') || pos.includes('PE') || pos.includes('SA');
            default:
                return true;
        }
    },
    
    // Reset team
    resetTeam: function() {
        if (confirm('Tem certeza que deseja reiniciar toda a escalação?')) {
            this.selectedPlayers.clear();
            this.renderFormation();
            this.renderPlayersList();
            this.updateSelectedPlayers();
            this.updateFieldCount();
        }
    },
    
    // Save team
    saveTeam: function() {
        if (this.selectedPlayers.size < 11) {
            alert('Complete todas as 11 posições antes de salvar!');
            return;
        }
        
        // Create team data
        const teamData = {
            team: this.currentTeam.name,
            formation: this.currentFormation,
            timestamp: new Date().toISOString(),
            players: Array.from(this.selectedPlayers.entries()).map(([position, player]) => ({
                position,
                name: player.name,
                originalPosition: player.pos
            }))
        };
        
        // Save to localStorage
        const savedTeams = JSON.parse(localStorage.getItem('footballLegendsTeams') || '[]');
        savedTeams.push(teamData);
        localStorage.setItem('footballLegendsTeams', JSON.stringify(savedTeams));
        
        // Show success modal
        this.showSaveModal();
    },
    
    // Show save modal
    showSaveModal: function() {
        const modal = document.getElementById('saveModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    
    // Close modal
    closeModal: function() {
        const modal = document.getElementById('saveModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // Share team
    shareTeam: function() {
        const teamData = {
            team: this.currentTeam.name,
            formation: this.currentFormation,
            players: Array.from(this.selectedPlayers.entries()).map(([position, player]) => ({
                position,
                name: player.name
            }))
        };
        
        // Create share text
        let shareText = `🏆 Melhor XI Histórico do ${teamData.team}\n`;
        shareText += `Formação: ${teamData.formation}\n\n`;
        
        teamData.players.forEach(({ position, name }) => {
            shareText += `${position}: ${name}\n`;
        });
        
        shareText += `\nMontado em: Football Games 11`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Escalação copiada para a área de transferência!');
        }).catch(() => {
            // Fallback
            prompt('Copie o texto abaixo:', shareText);
        });
    },
    
    // Theme toggle (shared with main script)
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
});
