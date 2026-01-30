// ===== FUNCIONALIDADE DO TEMA CLARO/ESCURO =====

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Verificar se o botão existe
    if (!themeToggle) {
        console.warn('Botão de tema não encontrado');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // Adicionar evento de clique
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Aplicar novo tema
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Salvar preferência
        localStorage.setItem('theme', newTheme);
        
        // Atualizar ícone
        updateThemeIcon(newTheme, themeIcon);
        
        // Adicionar efeito visual
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

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar apenas o toggle do tema
    initThemeToggle();
    
    // Apenas adicionar animação aos cards que já existem no HTML
    const comingSoonCards = document.querySelectorAll('.coming-soon-card');
    comingSoonCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.2}s both`;
    });
    
    // Adicionar animação aos game-cards que já existem no HTML
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.15}s both`;
    });
});

// ===== FUNÇÃO AUXILIAR PARA ANIMAÇÕES =====

// Se não tiver a animação fadeInUp definida no CSS, adicione:
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

function startGame(mode) {
    // Redireciona para a página do jogo enviando o tempo escolhido na URL
    window.location.href = `pages/football-grid.html?time=${mode}`;
}

// Fechar o modal se clicar fora da caixa preta
window.onclick = function(event) {
    const modal = document.getElementById('timeModal');
    if (event.target == modal) {
        closeModal();
    }
}