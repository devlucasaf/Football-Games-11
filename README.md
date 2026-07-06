<img
    width=100%
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=header"
/>

# Football Games 11 ⚽

Um hub de minigames interativos de futebol — teste sua memória esportiva, monte escalações lendárias e desafie seus conhecimentos!

---

## 📖 Descrição

**Football Games 11** é um projeto web feito com **HTML, CSS e JavaScript (ES6+ Modules)** com foco em **minigames interativos de futebol**.

A proposta é reunir em um único site diversos jogos inspirados em plataformas como [futbol11.com](https://futbol-11.com/) e [playfootball.games](https://playfootball.games/), oferecendo desafios baseados em memória esportiva, jogadores históricos, clubes e seleções.

---

## 🎮 Minigames

| # | Jogo | Descrição |
|---|------|-----------|
| 1 | **Football Grid** | Preencha o grid 3×3 com jogadores que passaram por ambos os clubes/seleções |
| 2 | **Football Legends** | Monte o melhor XI histórico do seu clube ou seleção |
| 3 | **Football Bingo** | Bingo 5×5 — associe jogadores às categorias corretas |
| 4 | **Football Termo** | Adivinhe o nome do jogador em 6 tentativas |
| 5 | **Football Carreiras** | Descubra o jogador pela sequência de clubes da carreira |
| 6 | **Football Impostor** | Encontre o jogador que não pertence ao grupo |
| 7 | **Football Jogou Com** | Descubra quem jogou com todos os companheiros mostrados |
| 8 | **Football Adivinha o Jogador** | Adivinhe o jogador por pistas |
| 9 | **Football Top 10** | Complete listas de 10 maiores do futebol |
| 10 | **Football Vc Escala!** | Monte sua escalação ideal com jogadores do Brasileirão |
| 11 | **Football Vc Convoca!** | Convoque 26 jogadores para representar a sua seleção |
| 12 | **Football Transferências** | Descubra o jogador pela sequência de clubes da carreira revelados um a um |
| 13 | **Football Conexões** | Agrupe 16 jogadores em 4 categorias secretas |
| 14 | **Football Adivinha o Treinador** | Descubra o treinador pelas dicas sobre sua carreira |
| 15 | **Football Duelo de Elencos** | Associe cada jogador ao elenco correto em duelos históricos |
| 16 | **Football Acerta Escalação** | Adivinhe os 11 jogadores que começaram um jogo histórico |
| 17 | **Football Conecta Clubes** | Encontre o jogador que une dois clubes |
| 18 | **Football Números** | Adivinhe o número da camisa do jogador |
| 19 | **Football Linha do Tempo** | Coloque eventos do futebol em ordem cronológica |
| 20 | **Football Placar** | Acerte o placar exato de jogos históricos |
| 21 | **Football Adivinha o Estádio** | Adivinhe o estádio por pistas |
| 22 | **Football Multiplica** | Multiplique estatísticas de jogadores para alcançar a meta |
| 23 | **Football Quiz** | Quiz temático com perguntas sobre Champions, Copa, Libertadores e mais |
| 24 | **Football Gol a Gol** | Adivinhe quem marcou o gol icônico pelas dicas progressivas |
| 25 | **Football Forca** | Descubra o jogador letra por letra |
| 26 | **Football Pirâmide** | Ordene 10 jogadores na pirâmide pela categoria |
| 27 | **Football 30 segundos** | Cite o máximo de jogadores que conseguir em 30 segundos |
| 28 | **Football Adivinha o Clube** | Adivinhe o clube por pistas |

---

## 📂 Estrutura do Projeto

```
Football-Games-11/
├── index.html                      # Hub principal com todos os minigames
├── src/
│   ├── icons/                      # Icons das bandeiras
│   ├── core/                       # Recursos compartilhados entre os jogos
│   │   ├── pages/
│   │   │   ├── configuracoes.html  # Página de configurações (tema, idioma, acessibilidade)
│   │   │   ├── faq.html            # Página de Perguntas Frequentes
│   │   │   ├── sobre.html          # Página institucional "Sobre"
│   │   │   ├── privacidade.html    # Política de Privacidade
│   │   │   └── licenca.html        # Página da licença (MIT)
│   │   ├── scripts/
│   │   │   ├── configuracoes.js    # Lógica da página de configurações
│   │   │   ├── formation.js        # Script para montar as formações do futebol
│   │   │   ├── header.js           # Renderização do cabeçalho compartilhado
│   │   │   ├── script.js           # Tema, tutorial e utilitários globais
│   │   │   └── traducao.js         # Lógica de tradução
│   │   ├── styles/
│   │   │   ├── global.css          # Estilos globais do site
│   │   │   ├── field.css           # Estilos do campo de futebol
│   │   │   ├── institucional.css   # Estilos das páginas institucionais (sobre/privacidade/licença)
│   │   │   └── settings.css        # Estilos da página de configurações
│   │   └── translation/            # Módulos JS de cada idioma
│   │       ├── english.js
│   │       ├── french.js
│   │       ├── german.js
│   │       ├── italian.js
│   │       ├── portuguese.js
│   │       └── spanish.js
│   └── games/                      # Cada minigame é autônomo (HTML + data/ + scripts/ + styles/)
│       ├── football-30-segundos/
│       ├── football-acerta-escalacao/
│       ├── football-adivinha-clube/
│       ├── football-adivinha-estadio/
│       ├── football-adivinha-jogador/
│       ├── football-adivinha-treinador/
│       ├── football-bingo/
│       ├── football-carreiras/
│       ├── football-conecta-clubes/
│       ├── football-conexoes/
│       ├── football-duelo-elencos/
│       ├── football-forca/
│       ├── football-gol-a-gol/
│       ├── football-grid/
│       ├── football-impostor/
│       ├── football-jogou-com/
│       ├── football-legends/
│       ├── football-linha-do-tempo/
│       ├── football-multiplica/
│       ├── football-numeros/
│       ├── football-piramide/
│       ├── football-placar/
│       ├── football-quiz/
│       ├── football-termo/
│       ├── football-top10/
│       ├── football-transferencias/
│       ├── football-vc-convoca/
│       └── football-vc-escala/
├── README.md
└── LICENSE
```

Cada minigame em `src/games/` é autônomo e segue o mesmo padrão interno:

```
football-numeros/
├── football-numeros.html       # Página do jogo
├── data/                       # Arquivos JSON com os dados do jogo
├── scripts/                    # Módulos JS do jogo (core, data, ui, main...)
└── styles/                     # CSS específico do jogo
```

---

## 🚀 Como rodar

1. Clone o repositório:
   ```bash
   git clone https://github.com/devlucasaf/Football-Games-11.git
   ```
2. Abra a pasta no VS Code
3. Use a extensão **Live Server** (clique direito no `index.html` → "Open with Live Server")
4. Acesse `http://localhost:5500` no navegador

> ⚠️ É necessário servir via HTTP (Live Server). O protocolo `file://` bloqueia módulos ES e `fetch()`.

---

## 🛠️ Tecnologias utilizadas

<div align="left">
    <img 
        align="center"
        alt="JavaScript"
        title="JavaScript"
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
        alt="JSON" 
        title="JSON"
        height="40" 
        style="padding-right: 10px;" 
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-plain.svg"
    />
    <img
        align="center"
        alt="VsCode"
        title="VsCode"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=vscode"
    />
    <img
        align="center"
        alt="git"
        title="Git"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=git"
    />
    <img
        align="center"
        alt="github"
        title="GitHub"
        height="40" 
        style="padding-right: 10px;" 
        src="https://skillicons.dev/icons?i=github"
    />          
</div>

---

## 🏆 License

**The** [**MIT License**](./LICENSE).

<img 
    width=100% 
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=footer"
/>