const translations = {
    // General
    "site_name": "Football Games 11",
    "theme_toggle_title": "Change theme",
    "play_button": "Play",

    // Hero section
    "hero_title": "Football Minigames Hub",
    "hero_subtitle": "Test your knowledge, build teams and legendary squads!",
    "stat_minigames_completed": "Minigames completed",
    "stat_combinations": "Combinations",

    // Scoreboard
    "score_victories": "Victories",
    "score_defeats": "Defeats",

    // Minigames section title
    "minigames_section_title": "Minigames",

    // Game: Legends
    "game_legends_name": "Legends",
    "game_legends_desc": "Build the best team from your favorite club or national team.",

    // Game: Bingo
    "game_bingo_name": "Bingo",
    "game_bingo_desc": "Play our bingo.",

    // Game: Grid
    "game_grid_name": "Grid",
    "game_grid_desc": "Football Grid 3x3",

    // Game: Vc Escala! (You Pick!)
    "game_vcescala_name": "You Pick!",
    "game_vcescala_desc": "Build your team and choose the best players.",

    // Game: Termo
    "game_termo_name": "Termo",
    "game_termo_desc": "Guess the football player's name in 6 attempts!",

    // Game: Carreiras (Careers)
    "game_carreiras_name": "Careers",
    "game_carreiras_desc": "Discover the player through their career clubs!",

    // Game: Impostor
    "game_impostor_name": "Impostor",
    "game_impostor_desc": "Find the player that doesn't belong to the group!",

    // Game: Jogou Com (Played With)
    "game_jogoucom_name": "Played With",
    "game_jogoucom_desc": "Discover the mystery player through their teammates!",

    // Game: Adivinha Jogador (Guess Player)
    "game_adivinha_name": "Guess Player",
    "game_adivinha_desc": "Discover the player through clues: country, age, club and titles!",

    // Game: Top 10
    "game_top10_name": "Top 10",
    "game_top10_desc": "Complete the list of the top 10 football greats!",

    // Game: Vc Convoca! (You Call Up!)
    "game_vcconvoca_name": "You Call Up!",
    "game_vcconvoca_desc": "Call up 26 players to represent your national team!",

    // Game: Transferências (Transfers)
    "game_transferencias_name": "Transfers",
    "game_transferencias_desc": "Discover the player through their career club sequence!",

    // Game: Conexões (Connections)
    "game_conexoes_name": "Connections",
    "game_conexoes_desc": "Group 16 players into 4 secret categories!",

    // Game: Escudo Quebrado (Broken Badge)
    "game_escudoquebrado_name": "Broken Badge",
    "game_escudoquebrado_desc": "Discover the club through clues about the badge!",

    // Game: Duelo de Elencos (Squad Duel)
    "game_dueloelencos_name": "Squad Duel",
    "game_dueloelencos_desc": "Match each player to the correct squad in historical duels!",

    // Game: Acerta a Escalação (Guess the Lineup)
    "game_acertaescalacao_name": "Guess the Lineup",
    "game_acertaescalacao_desc": "Guess the 11 players who started the historic match!",

    // Game: Placar (Score)
    "game_placar_name": "Score",
    "game_placar_desc": "Get the score right in historic football matches!",

    // Game: Conecta Clubes (Connect Clubs)
    "game_conectaclubes_name": "Connect Clubs",
    "game_conectaclubes_desc": "Find the player who played for both clubs!",

    // Game: Linha do Tempo (Timeline)
    "game_linhadotempo_name": "Timeline",
    "game_linhadotempo_desc": "Put football events in chronological order!",

    // Game: Quem Falta? (Who's Missing?)
    "game_quemfalta_name": "Who's Missing?",
    "game_quemfalta_desc": "Complete the list with the missing name!",

    // Game: Foto Borrada (Blurred Photo)
    "game_fotoborrada_name": "Blurred Photo",
    "game_fotoborrada_desc": "Guess the player from the blurry photo!",

    // Game: Multiplica (Multiply)
    "game_multiplica_name": "Multiply",
    "game_multiplica_desc": "Multiply the values to reach the goal!",

    // Game: Quiz
    "game_quiz_name": "Quiz",
    "game_quiz_desc": "Test your knowledge about world football!",

    // Footer
    "footer_made_with": "Made with ❤️ for football fans",
    "footer_connect": "Connect",
    "footer_copyright": "All rights reserved."
};

function aplicarTraducao(lingua) {
    if (translations[lingua] && translations[lingua]['titulo']) {
        document.titulo = translations[lingua]['titulo'];
    }

        document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lingua] && translations[lingua][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lingua][key];
            } else {
                element.textContent = translations[lingua][key];
            }
        }
    });

    atualizaSessaoTitulo(lingua);

    atualizaElementosClass(lingua);

    localStorage.setItem('preferredLanguage', lingua);
}

function atualizaSessaoTitulo(lingua) {
    const sessaoMusicaTitulo = document.querySelector('#music-section .section-title');
    if (sessaoMusicaTitulo && translations[lingua] && translations[lingua]['music-title']) {
        const highlightSpan = sessaoMusicaTitulo.querySelector('.highlight');
        if (highlightSpan) {
            sessaoMusicaTitulo.innerHTML = translations[lingua]['music-title'].replace('Agora', '<span class="highlight">Agora</span>');
        } else {
            sessaoMusicaTitulo.textContent = translations[lingua]['music-title'];
        }
    }
}

function atualizaElementosClass(lingua) {
    const navClasses = ["nav-home", "nav-sobre", "nav-musica", "nav-skills", "nav-certifications", "nav-projetos", "nav-contatos"];
    
    navClasses.forEach(className => {
        const elementos = document.getElementsByClassName(className);
        if (elementos.length > 0 && translations[lingua] && translations[lingua][className]) {
            for (let element of elementos) {
                element.textContent = translations[lingua][className];
            }
        }
    });
}

window.translations             = translations;
window.applyTranslation         = aplicarTraducao;
window.updateSectionTitles      = atualizaSessaoTitulo;
window.updateElementsByClass    = atualizaElementosClass;