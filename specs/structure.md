# Project Structure

## Árbol de directorios

```text
DictionaryUIReact/
├── specs/                 ← fuente de verdad (constitution, mission, tech-stack, structure)
├── plans/                 ← current.md (feature activo) y backlog.md
├── .sdd/                  ← prompts y adaptadores del flujo SDD
├── public/                ← favicon, manifest e íconos
├── index.html             ← punto de entrada HTML de Vite
├── vite.config.js         ← configuración de Vite y Vitest
└── src/
    ├── main.jsx           ← arranque: crea repositorios y monta <App/>
    ├── App.jsx            ← navegación entre "My words" y "Search"
    ├── domain/            ← modelo de dominio (Word, Meaning, Definition) y resultados de búsqueda
    ├── repositories/
    │   ├── contracts.js   ← contratos y assertImplements
    │   ├── index.js       ← raíz de composición
    │   ├── freeDictionary/     ← adaptador WordLookupRepository + mapper + fixtures
    │   ├── wikimediaCommons/   ← adaptador PronunciationRepository + fixtures
    │   ├── decorators/         ← withPronunciation
    │   └── savedWords/         ← adaptador SavedWordsRepository (localStorage)
    ├── context/           ← RepositoryProvider / useRepositories
    ├── hooks/             ← useWordLookup, useSavedWords, useSpeech
    ├── components/        ← componentes de UI
    └── test/              ← setup de Vitest y fakes en memoria
```

## Módulos principales

<!-- Formato: Módulo | Responsabilidad | Dependencias internas -->
- `domain` | Modelo `Word` y resultados `found` / `not_found` / `error` | ninguna
- `repositories` | Contratos, adaptadores y composición | `domain`
- `context` | Inyecta los repositorios en React | `repositories` (solo en `main.jsx`)
- `hooks` | Estado de búsqueda, colección y pronunciación | `context`, `domain`
- `components` | UI | `hooks`, `domain`

## Flujo de datos de alto nivel
<!-- Diagrama en texto o descripción del flujo principal del sistema. -->

- Búsqueda: `WordSearch` → `useWordLookup` → `withPronunciation`
  (Free Dictionary + Wikimedia Commons en paralelo) → `Word` de dominio → `WordDetails`.
- Colección: `SaveWordButton` / `SavedWordsGrid` → `useSavedWords` → adaptador `localStorage` (guarda el `Word` de dominio).
- Pronunciación: `PronounceButton` → `useSpeech` → grabación humana o, si no hay, la mejor voz sintética instalada.

## Puntos de entrada

- Dev: `pnpm dev` (http://localhost:5173)
- Test: `pnpm test:run`
- Prod: `pnpm build` → `dist/` servido como sitio estático en Vercel
