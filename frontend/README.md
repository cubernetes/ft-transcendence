# The Transcendence Client

## Usage of external tools

1. Webpack: Webpack is a JavaScript bundler that compiles and bundles multiple JavaScript files (and other assets like CSS, images, and fonts) into optimized files for production. It can also process TypeScript by using loaders (like ts-loader or babel-loader), enabling developers to leverage TypeScript's features while benefiting from Webpack's bundling and optimization capabilities.

2. Caddy: Caddy is an https server to run and host websites.

## Directory structure of scripts

```mermaid
scripts/
├── global/
│   ├── config.ts           // Global vars, i.e. paths, etc.
│   ├── router.ts
│   ├── state.ts            // Reactive global state store, i.e. auth, lang
├── modules/                // Business logic of complex stuff, i.e. game
│   ├── game/
│   ├── auth/
│   ├── ws/
├── ui/                     // HTMLElement, with conventional name
│   ├── components/         // Reusable, customizable components
│   │   ├── Table.ts        // createTable(...)
│   │   ├── Button.ts       // createButton(...)
│   │   └── [Component].ts  // create[Component](...)
│   ├── layouts/            // Reusable, non-customizable components
│   │   ├── Paddles.ts      // createPaddles(...)
│   │   ├── Header.ts       // createHeader(...)
│   │   └── Footer.ts       // createFooter(...)
│   ├── pages/              // page renderer, should be built with components and layouts mostly
│   │   ├── GamePage.ts     //
│   │   ├── LandingPage.ts  //
│   │   └── SetupPage.tsx
├── utils/                  // General global utils
│   │   ├── dom-helper.ts   // createEl, etc.
│   │   └── logger.ts       // createFooter(...)
├── types.d.ts
└── index.ts
```
