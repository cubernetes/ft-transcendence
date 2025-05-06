# The Transcendence Client

## Usage of external tools

1. ~~Webpack: Webpack is a JavaScript bundler that compiles and bundles multiple JavaScript files (and other assets like CSS, images, and fonts) into optimized files for production. It can also process TypeScript by using loaders (like ts-loader or babel-loader), enabling developers to leverage TypeScript's features while benefiting from Webpack's bundling and optimization capabilities.~~ [Using esbuild instead due to the much faster build speed]

2. Caddy: Caddy is an https server to run and host websites.

## Directory structure of scripts

Legends (by Darren)

✅: refactored and functionally sound-ish
⚒️: refactored but needs more attention for internal structure and improvement
🚫: to be deleted later, remnant of outdated structure or as dev shortcuts
⚠️: needs to refactor still

```
scripts/
├─ global/                 // ✅
│  ├─ config               // ✅ Global vars, i.e. paths, urls, etc. to avoid hardcoding
│  ├─ router               // ✅
│  └─ state                // ✅ General generic reactive global state store, i.e. auth, lang, game
├─ modules/                // ✅ Business logic of complex stuff, i.e. game, auth, websocket
│  ├─ game/                // ⚒️
│  │  ├─ objects           // ⚒️ Feel too state-dependent still
│  │  │  ├─ ball           // ⚒️
│  │  │  ├─ board          // ⚒️
│  │  │  ├─ paddle         // ⚒️
│  │  │  ├─ score          // ⚒️
│  │  │  └─ wall           // ⚒️
│  │  ├── renderer         // ⚒️ For graphic babylon3d renderer scene, divided to smaller components
│  │  │  ├─ audio          // ✅ Sort of standalone module of babylonjs
│  │  │  ├─ camera         // ⚒️
│  │  │  ├─ controls       // ⚒️
│  │  │  ├─ scene          // ⚒️
│  │  │  ├─ event          // ⚒️
│  │  │  ├─ light          // ⚒️
│  │  │  └─ animations     // ⚒️
│  │  ├─ controller.ts     // ✅ Centralized game control
│  │  ├─ renderer.ts       // ⚒️ Basically the "class" of entire babylonjs engine
│  │  └─ store.ts          // ✅ Game store for state
│  ├─ auth/                // ✅ Handles the logged in status
│  │  ├─ service           // ⚒️ Small typescript difficulty
│  │  └─ store             // ✅
│  ├─ layout/              // ✅
│  │  ├─ service           // ✅
│  │  └─ store             // ✅
│  └─ ws/                  // ✅
│     ├─ controller        // ✅
│     ├─ service           // ✅
│     └─ store             // ✅
├─ ui/                     // ⚒️ UI with tsx name convention; generally still need to check more
│  ├─ components/          // ✅ Reusable, customizable components
│  │  ├─ Table             // ⚒️ Maybe add sorting
│  │  ├─ Button            // ⚒️ Need to check css
│  │  ├─ ButtonGroup       // ⚒️ Need to check css
│  │  ├─ ReturnButton      // 🚫 Merge into Button maybe, don't need a 1-1 relation in components?
│  │  ├─ Error             // ⚒️ Need to check css
│  │  ├─ SectionContainer  // ⚠️ Should probably be general container, all section tag?
│  │  └─ ...
│  ├─ layout/              // ✅ Reusable, non-customizable components
│  │  ├─ Paddles           // ⚒️
│  │  ├─ LoginForm         // ⚠️
│  │  ├─ Header            // ⚒️
│  │  ├─ SetupModal        // ⚒️ Need to clean up
│  │  ├─ TotpModal         // ⚠️
│  │  ├─ UserStatus        // ⚠️
│  │  └─ ...
│  └─ pages/               // ✅ Page renderer, should be built with components and layouts mostly
│     ├─ LandingPage       // ✅ Default page for entry
│     ├─ GamePage          // 🚫 Game should be started from setup and no page change from there
│     ├─ SetupPage         // ✅
│     ├─ LeaderboardPage   // ⚒️ Business logic need to be cleaned up
│     ├─ ProfilePage       // ⚠️ Should include totp setup option which is a modal
│     ├─ SetupPage         // ✅
│     └─ ...
├─ utils/                  // ✅ General global utils
│     ├─ api.ts            // ✅ General fetch wrapper, get, post, etc.
│     ├─ dom-helper.ts     // ⚒️ Need to clean up
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
