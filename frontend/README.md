# The Transcendence Client

## Usage of external tools

1. Webpack: Webpack is a JavaScript bundler that compiles and bundles multiple JavaScript files (and other assets like CSS, images, and fonts) into optimized files for production. It can also process TypeScript by using loaders (like ts-loader or babel-loader), enabling developers to leverage TypeScript's features while benefiting from Webpack's bundling and optimization capabilities.

2. Caddy: Caddy is an https server to run and host websites.

## Directory structure of scripts

✅ means a page is refactored, only means a page is architecturally confirmed to a style

```
scripts/
├─ global/                 // ✅
│  ├─ config.ts            // ✅ Global vars, i.e. paths, urls, etc. to avoid hardcoding
│  ├─ router.ts            // ✅
│  └─ state.ts             // ✅ General generic reactive global state store, i.e. auth, lang, game
├─ modules/                // ✅ Business logic of complex stuff, i.e. game, auth, websocket
│  ├─ game/                //
│  │  ├─ objects           //
│  │  │  ├─ ball.ts        //
│  │  │  ├─ board.ts       //
│  │  │  ├─ paddle.ts      //
│  │  │  ├─ score.ts       //
│  │  │  └─ wall.ts        //
│  │  ├── renderer         // For graphic babylon3d renderer, divided to smaller components
│  │  │  ├─ audio.ts       //
│  │  │  ├─ camera.ts      //
│  │  │  ├─ controls.ts    //
│  │  │  ├─ scene.ts       //
│  │  │  ├─ ...            //
│  │  ├─ controller.ts     // User interface with the renderer
│  │  ├─ renderer.ts       // Basically the 'class', as closure
│  │  └─ store.ts          // Game store for state
│  ├─ auth/                // ✅ Handles the logged in status
│  │  ├─ auth.service.ts   // ✅
│  │  └─ auth.store.ts     // ✅
│  ├─ layout/              // ✅
│  │  ├─ layout.service.ts // ✅
│  │  └─ layout.store.ts   // ✅
│  └─ ws/                  // ✅
│     ├─ ws.service.ts     // ✅
│     └─ ws.store.ts       // ✅
├─ ui/                     // HTMLElement, with conventional name
│  ├─ components/          // Reusable, customizable components
│  │  ├─ Table.ts          // createTable(...)
│  │  ├─ Button.ts         // createButton(...)
│  │  ├─ [Component].ts    // create[Component](...)
│  │  ├─ ...
│  ├─ layouts/             // Reusable, non-customizable components
│  │  ├─ Paddles.ts        // createPaddles(...)
│  │  ├─ Header.ts         // createHeader(...)
│  │  ├─ Footer.ts         // createFooter(...)
│  │  ├─ ...
│  └─ pages/               // page renderer, should be built with components and layouts mostly
│     ├─ GamePage.ts       //
│     ├─ LandingPage.ts    //
│     ├─ SetupPage.tsx     //
│     ├─ ...
├─ utils/                  // ✅ General global utils
│     ├─ api.ts            // ✅ fetch wrapper, get, post, etc.
│     ├─ dom-helper.ts     // createEl, etc.
│     └─ logger.ts         // ✅
├─ types.d.ts              // ✅ Global type definitions
└─ index.ts                // ✅ Entry point
```

## App initialization flow

```
layout -> router (page load)
       -> renderer -> socket
       -> auth
```
