document.addEventListener('DOMContentLoaded', function() {
    // Inicializar a aplicação
    if (typeof appState !== 'undefined') {
        appState.init();
    } else {
        console.error('appState não foi carregado. Verifique formations.js');
    }
    
    // Configurar navegação básica
    setupBasicNavigation();
    
    // Inicializar funcionalidades adicionais
    initAdditionalFeatures();
});

function setupBasicNavigation() {
    // Configurar navegação do header
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.dataset.view;
            
            // Atualizar botões ativos
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar view correspondente
            if (typeof appState !== 'undefined') {
                appState.switchView(view);
            }
        });
    });
}

function initAdditionalFeatures() {
    // Inicializar tooltips
    initTooltips();
    
    // Inicializar modais
    initModals();
    
    // Configurar busca
    initSearch();
}

function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltipText = this.dataset.tooltip;
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - 35) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            
            tooltip.id = 'current-tooltip';
            document.body.appendChild(tooltip);
        });
        
        el.addEventListener('mouseleave', function() {
            const tooltip = document.getElementById('current-tooltip');
            if (tooltip) {
                document.body.removeChild(tooltip);
            }
        });
    });
}

function initModals() {
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Botões para abrir/fechar modais
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-open')) {
            const modalId = e.target.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        }
        
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    });
}

function initSearch() {
    const searchInput = document.getElementById('player-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const playerItems = document.querySelectorAll('.player-item');
            
            playerItems.forEach(item => {
                const playerName = item.querySelector('h4').textContent.toLowerCase();
                if (playerName.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// Funções utilitárias globais
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function getPositionColor(position) {
    const colors = {
        'GK': '#E74C3C',
        'ZAG': '#3498DB',
        'LD': '#9B59B6',
        'LE': '#9B59B6',
        'VOL': '#F1C40F',
        'MC': '#2ECC71',
        'PE': '#E67E22',
        'PD': '#E67E22',
        'ATA': '#E74C3C'
    };
    return colors[position] || '#95A5A6';
}

// Exportar funções para uso global
window.appUtils = {
    formatDate,
    getPositionColor,
    initTooltips,
    initModals
};