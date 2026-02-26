# 🐾 Plataforma de Adoção ONG UPAR

Um Web App moderno e responsivo desenvolvido para a ONG UPAR (União Protetora dos Animais de Rua) de Indaiatuba. A plataforma visa facilitar o processo de adoção através de um sistema de "Match" de compatibilidade e divulgar eventos da ONG.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído focando em performance, escalabilidade e manutenibilidade a longo prazo:

* **[Next.js 16+](https://nextjs.org/)**: Framework React (App Router) para renderização rápida e otimização de SEO.
* **[React](https://reactjs.org/)**: Biblioteca para construção das interfaces de usuário.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework utilitário de CSS para estilização ágil e responsiva.
* **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para evitar erros durante o desenvolvimento.
* **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones limpos e leves.

## 🎨 Identidade Visual (Design Tokens)

O projeto segue uma paleta de cores minimalista e amigável, configurada globalmente no Tailwind:

* **Background (Creme):** `#FFFCF9` - Usado no fundo principal.
* **Primary (Vermelho UPAR):** `#E5232B` - Usado para destaques, botões ativos e interações (hover).
* **Secondary (Azul Mudo):** `#384763` - Usado para textos principais, cabeçalhos e fundos de banners.
* **Bordas:** Arredondamentos severos (`rounded-2xl`, `rounded-4xl`) para passar uma sensação de ambiente acolhedor e amigável.

## 🧩 Componentes Principais

* **`Header`**: Barra de navegação superior com um menu lateral oculto (Sidebar) acionado pelo ícone customizado da pata da UPAR.
* **`MatchBanner`**: Call-to-action (CTA) principal convidando o usuário a preencher o formulário de compatibilidade.
* **`Events`**: Carrossel horizontal de eventos filtrável através de uma fita de meses (Ribbon Calendar) com scroll inteligente (snap).

## Estrutura

ONG-ANIMAL-APP/
├── public/                 # Imagens estáticas e assets públicos
├── src/
│   ├── app/                # Rotas e configurações globais do Next.js (App Router)
│   │   ├── favicon.ico     # Ícone da aba do navegador
│   │   ├── globals.css     # CSS Global (onde configuramos as cores do Tailwind)
│   │   ├── layout.tsx      # Estrutura base do HTML (cabeçalho, metadados)
│   │   └── page.tsx        # Página principal (Home) que junta todos os componentes
│   │
│   └── components/         # Pedaços reutilizáveis da interface
│       ├── icons/          # Ícones customizados
│       │   ├── Paw.svg     # Arquivo original do ícone da UPAR
│       │   └── PawIcon.tsx # Componente React do ícone (permite mudar de cor)
│       ├── Events.tsx      # Componente do Calendário de Eventos (Fita de meses e cards)
│       ├── Header.tsx      # Cabeçalho superior com menu lateral (Sidebar)
│       └── MatchBanner.tsx # Banner azul de chamada para o formulário de compatibilidade
│
├── package.json            # Lista de dependências (Next.js, Tailwind, Lucide React)
├── tailwind.config.ts      # (Ou via globals.css) Configurações de design da aplicação
└── tsconfig.json           # Configurações do TypeScript

