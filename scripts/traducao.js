const listaFazerTraducoesLinguas = {
    translations,
    traducoes,
    ubersetzungen,
    traducciones
}

function aplicarTraducao(lingua) {
    if (listaFazerTraducoesLinguas[lingua] && listaFazerTraducoesLinguas[lingua]['titulo']) {
        document.titulo = listaFazerTraducoesLinguas[lingua]['titulo'];
    }

        document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (listaFazerTraducoesLinguas[lingua] && listaFazerTraducoesLinguas[lingua][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = listaFazerTraducoesLinguas[lingua][key];
            } else {
                element.textContent = listaFazerTraducoesLinguas[lingua][key];
            }
        }
    });

    atualizaSessaoTitulo(lingua);

    atualizaElementosClass(lingua);

    localStorage.setItem('preferredLanguage', lingua);
}

function atualizaSessaoTitulo(lingua) {
    const sessaoMusicaTitulo = document.querySelector('#music-section .section-title');
    if (sessaoMusicaTitulo && listaFazerTraducoesLinguas[lingua] && listaFazerTraducoesLinguas[lingua]['music-title']) {
        const highlightSpan = sessaoMusicaTitulo.querySelector('.highlight');
        if (highlightSpan) {
            sessaoMusicaTitulo.innerHTML = listaFazerTraducoesLinguas[lingua]['music-title'].replace('Agora', '<span class="highlight">Agora</span>');
        } else {
            sessaoMusicaTitulo.textContent = listaFazerTraducoesLinguas[lingua]['music-title'];
        }
    }
}

function atualizaElementosClass(lingua) {
    const navClasses = ["nav-home", "nav-sobre", "nav-musica", "nav-skills", "nav-certifications", "nav-projetos", "nav-contatos"];
    
    navClasses.forEach(className => {
        const elementos = document.getElementsByClassName(className);
        if (elementos.length > 0 && listaFazerTraducoesLinguas[lingua] && listaFazerTraducoesLinguas[lingua][className]) {
            for (let element of elementos) {
                element.textContent = listaFazerTraducoesLinguas[lingua][className];
            }
        }
    });
}

window.translations             = listaFazerTraducoesLinguas;
window.applyTranslation         = aplicarTraducao;
window.updateSectionTitles      = atualizaSessaoTitulo;
window.updateElementsByClass    = atualizaElementosClass;