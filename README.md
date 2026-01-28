<img
    width=100%
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=header"
/>

# Formação Futebol ⚽

Um aplicativo web interativo para montar escalações de futebol, reviver seleções históricas e acompanhar o Brasileirão rodada a rodada.

---

## 📖 Descrição
O **Formação Futebol** é um projeto em **HTML, CSS e JavaScript** que permite ao usuário:
- Montar times históricos de clubes e seleções.
- Convocar jogadores por posição (goleiro, laterais, zagueiros, volante, meio-campo, pontas e centroavante).
- Alterar formações táticas dinamicamente (4-4-2, 3-5-2, 4-3-3, etc.).
- Acompanhar o **Brasileirão rodada a rodada**, escalando times diferentes em cada rodada.
- Salvar escalações e consultar o histórico para comparar evolução.

---

## 🏟️ Funcionalidades
- **Campo de futebol estilizado em CSS** com posições dinâmicas.
- **Formações táticas**: 4-4-2, 4-3-3, 3-5-2, 4-5-1, 5-4-1, 3-4-3, 4-2-3-1.
- **Convocação organizada por posição** com filtros (GK, DEF, LAT, MEC, PD, PE, AT).
- **Seleções históricas**: Brasil, Argentina, Holanda, Alemanha, etc.
- **Times históricos**: Sua escalação dos melhores jogadores que passaram pelos times.
- **Modo fantasia**: liberdade total para criar times dos sonhos.
- **Histórico de rodadas**: salvar escalações e rever escolhas anteriores.

---

## 📂 Estrutura do Projeto
```
/Football-Games-11
├── index.html                      # Homepage (hub de jogos)
├── pages/                          # Páginas HTML de cada minigame
│   ├── grid.html                   # Página do Futbol Grid
│   ├── selection.html              # Página de Seleções Históricas
│   └── quiz.html                   # (Futuro) Página de Quiz
├── css/
│   ├── grid.css                    # Estilos do Futbol Grid
│   ├── style.css                   # Estilo principal
│   └── field.css                   # Estilos do campo de futebol
├── js/
│   ├── script.js                   # Código comum a todas as páginas
│   ├── router.js                   # Gerenciador de navegação (SPA)
│   ├── modules/
│   │   ├── futbol-grid.js          # Lógica do Futbol Grid
│   │   ├── selection-builder.js    # Lógica das Seleções Históricas
│   │   └── quiz.js                 # (Futuro) Lógica do Quiz
│   ├── utils/ 
│   │   ├── data-loader.js          # Carregador de JSONs
│   │   └── validators.js           # Funções de validação
│   └── components/ 
│       ├── header.js               # Componente do cabeçalho
│       ├── footer.js               # Componente do rodapé
│       └── game-card.js            # Componente dos cards de jogos
├── data/ 
│   ├── futbol-grid-data.json       # Dados para o grid (jogadores e critérios)
│   ├── historical-teams.json       # Dados para seleções históricas
│   └── quiz-questions.json         # (Futuro) Perguntas para quiz
├── assets/ 
│   ├── images/                     # Imagens do site
│   ├── icons/                      # Ícones e logos
│   └── fonts/                      # Fontes personalizadas
├── README.md
└── LICENSE
```

## 🛠️ Tecnologias utilizadas

<div align="left">
    <img 
        align="center"
        alt="JavaScript"
        tittle="JavaScript"
        height="40" 
        style="padding-right: 10px;"
        src="https://skillicons.dev/icons?i=javascript" 
    />
    <img
        align="center" 
        alt="HTML" 
        title="HTML"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=html"
    />
    <img
        align="center" 
        alt="CSS" 
        title="CSS"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=css"
    />
    <img
        align="center"
        alt="VsCode"
        tittle="VsCode"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=vscode"
    />
    <img
        align="center"
        alt="github"
        tittle="GitHub"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=github"
    />
</div>

## 🏆 License

**The** [**MIT License**](./LICENSE).

<img 
    width=100% 
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=footer"
/>