function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('Botão de tema não encontrado');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme, themeIcon);
        
        themeToggle.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg) scale(1)';
        }, 300);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) {
        return;
    }
    
    if (theme === 'dark') {
        iconElement.className = 'fas fa-sun';
        iconElement.parentElement.title = 'Alternar para tema claro';
    } else {
        iconElement.className = 'fas fa-moon';
        iconElement.parentElement.title = 'Alternar para tema escuro';
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    
    const comingSoonCards = document.querySelectorAll('.coming-soon-card');
    comingSoonCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.2}s both`;
    });
    
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.15}s both`;
    });
});

// --- FUNÇÃO AUXILIAR PARA ANIMAÇÕES ---
if (!document.querySelector('#fadeInUpAnimation')) {
    const style = document.createElement('style');
    style.id = 'fadeInUpAnimation';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

document.getElementById('btn-football-grid')?.addEventListener('click', function() {
    window.location.href = 'pages/football-grid.html';
}); 

function openTimeSelection() {
    document.getElementById('timeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('timeModal').style.display = 'none';
}

function startGame(mode) {
    window.location.href = `pages/football-grid.html?time=${mode}`;
}

window.onclick = function(event) {
    const modal = document.getElementById('timeModal');
    if (modal && event.target == modal) {
        closeModal();
    }
}

// --- SISTEMA DE TUTORIAL ---
function initTutorial() {
    const tutorial = document.getElementById('tutorialOverlay');
    if (!tutorial) {
        return;
    }

    const gameId = tutorial.dataset.game;
    if (!gameId) {
        return;
    }

    const chave = `tutorial_visto_${gameId}`;

    if (localStorage.getItem(chave)) {
        tutorial.classList.add('hidden');
        return;
    }

    tutorial.classList.remove('hidden');

    const btnStart = document.getElementById('tutorialStartBtn');
    const btnSkip = document.getElementById('tutorialSkipBtn');

    function fecharTutorial() {
        localStorage.setItem(chave, 'true');
        tutorial.classList.add('hidden');
    }

    btnStart?.addEventListener('click', fecharTutorial);
    btnSkip?.addEventListener('click', fecharTutorial);

    tutorial.addEventListener('click', (e) => {
        if (e.target === tutorial) {
            fecharTutorial();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTutorial();
});