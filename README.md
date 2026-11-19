# Dictionary UI (React)

[![CI](https://github.com/chaquen/DictionaryUIReact/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/chaquen/DictionaryUIReact/actions/workflows/ci.yml)

Diccionario de inglés: busca palabras, escucha su pronunciación y guarda tu propia colección.

**App publicada:** https://dictionary-ui-react.vercel.app

- **Home**: cobertura de inglés cotidiano, palabras nuevas de hoy, palabras para repasar, racha, XP, nivel y logros.
- **Learn**: ruta de vocabulario esencial. Una prueba de nivel corta y luego, cada día, las palabras más útiles que aún no
  conoces (lista [NGSL 1.2](https://www.newgeneralservicelist.com), CC BY-SA 4.0), con definición en inglés simple, imagen, audio y
  ayuda opcional en español. "Learn it" la lleva al repaso; "I know it" la descarta.
- **Review**: repaso espaciado. Recuerdas el significado, lo revelas y te calificas (Again, Hard, Good, Easy);
  el algoritmo (FSRS-6 por defecto, o cajas de Leitner) decide cuándo volver a preguntarte cada palabra.
- **Search**: definiciones agrupadas por categoría gramatical, ejemplos de uso, sinónimos y antónimos.
- **My words**: colección personal guardada en el navegador (sobrevive a recargas). Guardar una palabra la agrega al repaso.
- **Lab**: activa o desactiva cada idea del MVP, elige el algoritmo de repaso y las palabras nuevas por día, consulta las
  métricas de aprendizaje y expórtalas como JSON. Los datos nunca salen del navegador.
- **Ayuda bilingüe**: la interfaz está en inglés y cada instrucción y botón muestra una ayuda en español ("Learn it · La aprendo").
  Se cambia o se apaga en el Lab; los textos están en `src/i18n/help.es.js` y otro idioma es un archivo más.
- **Traducción**: "Show in Spanish" traduce la palabra y su definición en el dispositivo con la Translator API de Chrome
  (solo Chrome de escritorio).
- **Imágenes**: pictogramas de [ARASAAC](https://arasaac.org) (autor Sergio Palao, Gobierno de Aragón, CC BY-NC-SA),
  hechos para aprender vocabulario; para verbos se elige el sentido verbal. Las palabras sin pictograma muestran solo el
  ejemplo de uso resaltado. Los adaptadores de fotos (Wikipedia, Wikidata, Openverse) y el filtro con la IA local de
  Chrome siguen en `src/repositories/` por si se quieren volver a usar desde la raíz de composición.
- **Pronunciación**: grabaciones de voz humana de [Wikimedia Commons](https://commons.wikimedia.org) (acento EE. UU., luego Reino Unido y Australia).
  Si una palabra no tiene grabación, o para leer definiciones, usa la mejor voz sintética instalada
  (prioriza voces "Natural", "Google", "Premium" o "Enhanced" y descarta las voces de broma de macOS).

Datos: [Free Dictionary API](https://dictionaryapi.dev) (gratuita, sin clave) + Wikimedia Commons para el audio.

> Tip (macOS): para que las definiciones suenen menos robóticas, descarga una voz *Premium* o *Mejorada* en
> Ajustes del Sistema → Accesibilidad → Contenido leído → Voz del sistema → Gestionar voces. En Chrome se usa
> "Google US English" y en Edge las voces "Natural".

## Requisitos

- Node.js 20.19+ o 22.12+ (CI y Vercel usan la versión de `.nvmrc`: 22)
- pnpm 11 (fijado en `package.json` → `packageManager`; el lockfile es `pnpm-lock.yaml`)

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

## CI/CD

- **CI** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml): en cada PR hacia `master` y en cada push a `master`
  ejecuta `pnpm install --frozen-lockfile`, `pnpm test:run` y `pnpm build` (job `validate`).
- **CD** — integración GitHub de Vercel: cada PR recibe una URL de vista previa y cada merge a `master` se publica
  en producción (https://dictionary-ui-react.vercel.app).
- **Protección de rama** — `master` solo acepta cambios por PR con `validate` en verde.

### Configuración inicial (una sola vez, la hace el dueño del repositorio)

1. **Vercel:** en [vercel.com/new](https://vercel.com/new) importa `chaquen/DictionaryUIReact`.
   Vercel detecta Vite (build `pnpm build`, salida `dist`). En *Settings → Build and Deployment* deja Node.js en **22.x**.
   Si la instalación falla por la versión de pnpm, agrega la variable de entorno `ENABLE_EXPERIMENTAL_COREPACK=1`.
2. **Protección de rama:** en GitHub, *Settings → Rules → Rulesets → New branch ruleset*:
   - Target: rama `master`; Enforcement: *Active*; sin *bypass list*.
   - Activa *Require a pull request before merging* y *Require status checks to pass* con el check `validate`.
   - Activa *Block force pushes*.

## Arquitectura: patrón repositorio

```
src/
├── domain/
│   ├── word.js                     Modelo de dominio (Word, Meaning, Definition) y resultados de búsqueda
│   ├── learningEvent.js            Eventos de aprendizaje: fuente de métricas y gamificación
│   ├── scheduling/                 Patrón Strategy: FSRS-6 y Leitner (+ sombra de FSRS-6 para evaluarlo)
│   ├── gamification.js             XP, niveles, racha y logros calculados desde los eventos
│   ├── learningPath.js             Ruta de vocabulario: prueba de nivel, palabras de hoy y cobertura
│   └── metrics.js                  Métricas por idea y calidad del repaso
├── data/ngsl/                      NGSL 1.2 en JSON (CC BY-SA 4.0, ver ATTRIBUTION.md; se genera con scripts/build_ngsl.py)
├── repositories/
│   ├── contracts.js                Contratos: WordLookupRepository, PronunciationRepository, SavedWordsRepository
│   ├── index.js                    Raíz de composición: elige las implementaciones
│   ├── freeDictionary/             Adaptador de Free Dictionary API (+ mapper y fixtures reales)
│   ├── wikimediaCommons/           Adaptador de grabaciones humanas (PronunciationRepository)
│   ├── images/                     ImageRepository: ARASAAC (en uso); Wikimedia, Openverse y su compuesto (alternativas)
│   ├── translation/                Translator API de Chrome (TranslationRepository)
│   ├── decorators/withPronunciation.js  Enriquece cualquier diccionario con esas grabaciones
│   └── savedWords/                 Adaptador de localStorage para la colección
├── context/                        RepositoryProvider + LearningProvider (eventos, preferencias, tarjetas)
├── i18n/                           Ayuda bilingüe: catálogo help.es.js, <Bi>, <BiLabel> y <HelpLine>
├── hooks/                          useWordLookup, useSavedWords, useSpeech, useWordImages
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
