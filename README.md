# Dictionary UI (React)

Diccionario de inglés: busca palabras, escucha su pronunciación y guarda tu propia colección.

- **Search**: definiciones agrupadas por categoría gramatical, ejemplos de uso, sinónimos y antónimos.
- **My words**: colección personal guardada en el navegador (sobrevive a recargas).
- **Pronunciación**: grabaciones de voz humana de [Wikimedia Commons](https://commons.wikimedia.org) (acento EE. UU., luego Reino Unido y Australia).
  Si una palabra no tiene grabación, o para leer definiciones, usa la mejor voz sintética instalada
  (prioriza voces "Natural", "Google", "Premium" o "Enhanced" y descarta las voces de broma de macOS).

Datos: [Free Dictionary API](https://dictionaryapi.dev) (gratuita, sin clave) + Wikimedia Commons para el audio.

> Tip (macOS): para que las definiciones suenen menos robóticas, descarga una voz *Premium* o *Mejorada* en
> Ajustes del Sistema → Accesibilidad → Contenido leído → Voz del sistema → Gestionar voces. En Chrome se usa
> "Google US English" y en Edge las voces "Natural".

## Requisitos

- Node.js 20.19+ o 22.12+ (probado con Node 24)
- pnpm (el lockfile es `pnpm-lock.yaml`)

## Uso

```bash
pnpm install
pnpm dev           # http://localhost:5173
pnpm test:run      # tests (Vitest + Testing Library)
pnpm build         # build de producción en dist/
```

Variables opcionales (copiar `.env.example` a `.env`):

| Variable | Descripción |
| --- | --- |
| `VITE_DICTIONARY_API_URL` | URL base de la API. Por defecto `https://api.dictionaryapi.dev/api/v2/entries/en` |

## Arquitectura: patrón repositorio

```
src/
├── domain/word.js                  Modelo de dominio (Word, Meaning, Definition) y resultados de búsqueda
├── repositories/
│   ├── contracts.js                Contratos: WordLookupRepository, PronunciationRepository, SavedWordsRepository
│   ├── index.js                    Raíz de composición: elige las implementaciones
│   ├── freeDictionary/             Adaptador de Free Dictionary API (+ mapper y fixtures reales)
│   ├── wikimediaCommons/           Adaptador de grabaciones humanas (PronunciationRepository)
│   ├── decorators/withPronunciation.js  Enriquece cualquier diccionario con esas grabaciones
│   └── savedWords/                 Adaptador de localStorage para la colección
├── context/RepositoryContext.jsx   Inyecta los repositorios en React
├── hooks/                          useWordLookup, useSavedWords, useSpeech
└── components/                     UI: solo conoce el modelo de dominio
```

Reglas:

1. Los componentes solo usan el modelo de dominio (`src/domain/word.js`), nunca el JSON de la API.
2. Los repositorios no lanzan excepciones en casos esperados: devuelven `found`, `not_found` o `error`.
3. La colección guarda objetos de dominio, así que sobrevive a un cambio de API.

### Cambiar de API de diccionario

1. Crea `src/repositories/<nuevaApi>/` con una función que devuelva un objeto con
   `findByTerm(term, { signal })` y traduzca la respuesta a `Word` (usa `freeDictionary/` como guía).
2. Cámbiala en `src/repositories/index.js`. `assertImplements` valida el contrato al arrancar.
3. Agrega tests del mapper con respuestas reales en `__fixtures__/`.

El decorador `withPronunciation` sigue funcionando con la nueva API, así que el audio humano se conserva.
Ningún componente necesita cambios. Lo mismo aplica para mover la colección de `localStorage` a un backend
(`SavedWordsRepository` ya es asíncrono).
