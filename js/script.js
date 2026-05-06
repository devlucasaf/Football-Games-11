// --- FUNCIONALIDADE DO TEMA CLARO/ESCURO ---

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // --- VERIFICAR SE O BOTÃO EXISTE ---
    if (!themeToggle) {
        console.warn('Botão de tema não encontrado');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    // --- VERIFICAR TEMA SALVO NO LOCALSTORAGE ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // --- ADICIONAR EVENTO DE CLIQUE ---
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // --- APLICAR NOVO TEMA ---
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // --- SALVAR PREFERÊNCIA ---
        localStorage.setItem('theme', newTheme);
        
        // --- ATUALIZAR ÍCONE ---
        updateThemeIcon(newTheme, themeIcon);
        
        // --- ADICIONAR EFEITO VISUAL ---
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
    // --- INICIALIZAR APENAS O TOGGLE DO TEMA ---
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

document.getElementById('btn-football-grid').addEventListener('click', function() {
    window.location.href = 'pages/football-grid.html';
}); 

function openTimeSelection() {
    document.getElementById('timeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('timeModal').style.display = 'none';
}

// --- REDIRECIONA PARA A PÁGINA DO JOGO ENVIANDO O TEMPO ESCOLHIDO NA URL ---
function startGame(mode) {
    window.location.href = `pages/football-grid.html?time=${mode}`;
}

// --- FECHAR O MODAL SE CLICAR FORA DA CAIXA PRETA ---
window.onclick = function(event) {
    const modal = document.getElementById('timeModal');
    if (event.target == modal) {
        closeModal();
    }
}