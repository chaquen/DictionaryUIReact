# Plan Activo

> Un feature a la vez. Este archivo representa el único trabajo en curso.
> Estado del ciclo: idle → specify → clarify → plan → tasks → implement → review → done

## Origen
- Fuente: texto libre en chat (2026-11-19), tras una lluvia de ideas de 18 propuestas:
  "vamos a dejar un mvc que permita explorar varias ideas y sobre todo encontrar el valor real, me gusta la idea del
  escenario 16, y 18 creo que podriamos hacer una poc aca el 12 9 7 1 3 2 son los que quiero evaluar los otros no quedan
  descartados pero se haran en una proxima iteracion"
- Interpretación: "mvc" se lee como **MVP** (producto mínimo viable).
- Obtenido: 2026-11-19
- Criterios de aceptación originales: ninguno; la fuente fija el objetivo ("encontrar el valor real") y el alcance
  (PoC: #16 y #18; a evaluar: #1, #2, #3, #7, #9, #12).

## Feature en curso
**Nombre:** HU-002 — MVP de aprendizaje: explorar ideas y encontrar el valor real
**Estado:** implement
**Plan aprobado:** 2026-11-19
**Inicio:** 2026-11-19
**Deadline estimado:** -

---

## Requisitos
<!-- Qué debe hacer este feature. Funcional, no técnico. -->

Objetivo: pasar de un buscador a una herramienta de aprendizaje, probando varias ideas a la vez con usuarios reales y
midiendo cuáles aportan valor, para decidir qué se construye en serio en la siguiente iteración.

- **FR-001** (#1 Repaso espaciado) Cada palabra guardada entra en un plan de repaso: el sistema decide cuándo volver a
  preguntarla según si el usuario la recordó o no.
- **FR-002** (#2 Pronunciación) El usuario escucha la pronunciación humana de una palabra, la repite en voz alta y recibe
  una indicación de si la dijo correctamente.
- **FR-003** (#3 Reto diario) Cada día hay una palabra secreta que se adivina con pistas progresivas; el resultado se puede
  compartir sin revelar la palabra.
- **FR-004** (#7 Ejercicios generados) El sistema crea ejercicios a partir de las palabras del usuario: completar oraciones,
  escribir una oración propia que recibe corrección, y una mini historia con varias de sus palabras.
- **FR-005** (#9 Personaje compañero) Un personaje le pide al usuario que le explique palabras, valora la explicación y
  recuerda qué palabras ya aprendió el usuario para retomarlas después.
- **FR-006** (#12 Imágenes) Cada palabra puede mostrarse con una imagen que ayude a recordarla; el usuario puede pedir otra.
- **FR-007** (#16 PoC Escape room) Una sala de escape narrativa y corta en la que el usuario avanza interactuando en inglés
  con objetos y personajes, usando palabras de su colección.
- **FR-008** (#18 PoC Mecánicas de juego) Rachas, puntos de experiencia, niveles y logros que recompensan las acciones de
  aprendizaje de FR-001 a FR-007.
- **FR-009** [INFERIDO] Cada idea registra señales de uso y de aprendizaje (veces usada, días de regreso, aciertos en el
  repaso) para compararlas entre sí.
- **FR-010** [INFERIDO] Cada idea se puede activar o desactivar por separado, para experimentar sin afectar a las demás.
- **FR-011** [INFERIDO] Si el dispositivo no tiene una capacidad que una idea necesita (IA local, micrófono), esa idea se
  oculta o se degrada con un aviso, y el resto de la app sigue funcionando.
- **FR-012** [INFERIDO] La búsqueda, la pronunciación y la colección actuales siguen funcionando igual.

### User stories

**US-001** [P1] (#1) Como estudiante, quiero que la app me pregunte mis palabras justo cuando estoy por olvidarlas, para
recordarlas a largo plazo.

- Given una palabra guardada hoy
  When llega el momento de repasarla
  Then aparece en "Review today"; si respondo que la recordé, el siguiente repaso se aleja; si no, se acerca.
- Given que no tengo palabras pendientes
  When abro el repaso
  Then veo cuándo toca el próximo, en lugar de una pantalla vacía.

**US-002** [P1] (#18) Como estudiante, quiero ver mi racha, mis puntos y mis logros, para tener motivos para volver cada día.

- Given que completo cualquier actividad de aprendizaje
  When termina
  Then gano puntos, y mi racha aumenta si es mi primera actividad del día.
- Given que paso un día sin actividad
  When vuelvo
  Then mi racha se reinicia y lo veo claramente.

**US-003** [P1] (#16) Como estudiante, quiero resolver una sala de escape usando inglés, para practicar el vocabulario
con un objetivo que me importe.

- Given que entro a la sala
  When interactúo con objetos y personajes en inglés
  Then avanzo cuando uso correctamente las palabras que la sala necesita, y recibo pistas si me atasco.
- Given que salgo de la sala
  When termino
  Then las palabras nuevas que encontré se pueden guardar en mi colección.

**US-004** [P2] (#2) Como estudiante, quiero repetir en voz alta una palabra y saber si la dije bien, para mejorar mi
pronunciación.

- Given una palabra con grabación humana
  When la escucho y la repito
  Then la app me dice si me entendió y me deja intentarlo de nuevo.

**US-005** [P2] (#3) Como estudiante, quiero un reto con una palabra al día, para practicar aunque tenga poco tiempo.

- Given el reto del día
  When fallo un intento
  Then se revela una pista nueva (definición, audio, primera letra).
- Given que lo resuelvo o se acaban los intentos
  When termino
  Then puedo compartir el resultado sin revelar la palabra, y el reto no se repite ese día.

**US-006** [P2] (#7) Como estudiante, quiero ejercicios creados con mis propias palabras, para practicar usándolas y no solo
reconociéndolas.

- Given al menos 3 palabras en mi colección
  When pido un ejercicio
  Then recibo uno nuevo basado en ellas, y si escribo una oración, recibo corrección y una explicación.

**US-007** [P3] (#9) Como estudiante, quiero explicarle palabras a un personaje, para comprobar si de verdad las entiendo.

- Given una palabra que ya estudié
  When el personaje me pregunta y le respondo
  Then valora mi explicación, me sugiere cómo mejorarla y la recuerda para preguntarme otra vez más adelante.

**US-008** [P3] (#12) Como estudiante, quiero una imagen memorable para cada palabra, para asociarla a algo visual.

- Given una palabra de mi colección
  When abro su detalle
  Then veo una imagen relacionada y puedo pedir otra si no me ayuda.

**US-009** [P1] [INFERIDO] (FR-009/FR-010) Como responsable del producto, quiero comparar el uso y el aprendizaje que
genera cada idea, para decidir cuáles construir en la siguiente iteración.

- Given que varias personas usan el MVP durante el periodo de evaluación
  When reviso los resultados
  Then veo, por idea: cuántas veces se usó, cuántos días regresaron los usuarios y el porcentaje de aciertos en repasos.

## Criterios de aceptación
<!-- Condiciones verificables. Si no son verificables, no son criterios. -->
- [ ] Las 8 ideas (#1, #2, #3, #7, #9, #12, #16, #18) se pueden usar de principio a fin en producción.
- [ ] Cada idea se puede activar o desactivar por separado.
- [ ] En un dispositivo sin IA local o sin micrófono, las ideas afectadas se ocultan o avisan, y el resto funciona.
- [ ] Existen datos por idea de: uso, días de regreso y aciertos en repaso.
- [ ] La búsqueda, la pronunciación y la colección actuales siguen pasando sus pruebas.
- [ ] Al final del periodo de evaluación hay una decisión documentada sobre qué ideas continúan.

### Hipótesis de valor y señales de éxito

| Idea | Hipótesis | Señal de éxito |
|------|-----------|----------------|
| #1 Repaso espaciado | Repasar justo antes de olvidar mejora el recuerdo | ≥ 80 % de aciertos en repasos hechos a 7 días o más |
| #2 Pronunciación | Repetir en voz alta hace que el usuario practique más cada palabra | ≥ 2 intentos de pronunciación por palabra practicada |
| #3 Reto diario | Un reto corto crea hábito | El usuario vuelve ≥ 4 de cada 7 días |
| #7 Ejercicios generados | Producir la palabra ayuda más que solo reconocerla | Las palabras practicadas con ejercicios tienen más aciertos en el repaso que las que no |
| #9 Personaje compañero | Explicar una palabra demuestra y refuerza la comprensión | ≥ 60 % de las explicaciones se valoran como correctas en el segundo intento |
| #12 Imágenes | Una imagen memorable ayuda a recordar | Las palabras con imagen tienen más aciertos en el repaso que las que no tienen |
| #16 Escape room | Un objetivo narrativo motiva a usar el inglés | ≥ 60 % de quienes empiezan la sala la terminan |
| #18 Mecánicas de juego | Rachas y logros aumentan la constancia | Más días activos por semana con las mecánicas activas que sin ellas |

### Criterios de éxito
- El usuario puede repasar sus palabras pendientes del día en menos de 5 minutos.
- El usuario puede empezar cualquier actividad en 2 clics o menos desde la pantalla principal.
- El responsable del producto puede decidir qué ideas continúan, con datos de al menos 2 semanas de uso.

### Dependencias
- #7, #9 y #16 dependen de IA capaz de generar y evaluar texto (ver clarificación 3).
- #12 depende de una fuente de imágenes (ver clarificación 1).
- #2 depende del reconocimiento de voz del navegador.
- #1 es la base de las señales de aprendizaje: los aciertos en el repaso miden el efecto de #7, #9 y #12.
- #18 recompensa acciones de todas las demás ideas.
- Puede requerir actualizar `specs/` (con aprobación): nuevas dependencias (p. ej. three.js para #16), ADRs y métricas de
  `mission.md` orientadas al aprendizaje.

### Riesgos y ambigüedades
- Alcance amplio: 8 ideas en un solo feature. Conviene entregarlas por incrementos (se decide en la fase plan).
- Pocos usuarios de prueba producen datos poco concluyentes.
- Las comparaciones "con y sin" (#7, #12) requieren que el mismo usuario tenga palabras de los dos grupos.

### Complejidad
**alta** — 8 ideas con dependencias externas (IA, voz, imágenes) más un sistema de medición.

## Clarificaciones
- P1: (#12) ¿Imágenes generadas o de bancos libres? → De bancos libres (Wikimedia Commons u Openverse, sin clave), para validar
  primero la hipótesis sin costo ni cambios de arquitectura. La generación con IA queda para una iteración futura.
- P2: (#7, #9, #16) ¿IA local o alternativa en la nube? → IA local de Chrome (Gemini Nano) **por ahora**: en dispositivos sin
  ella, esas ideas se ocultan con un aviso. Revisable al evaluar el MVP.
- P4: (#1) ¿Qué algoritmos de repaso entran al MVP? → Opción A: FSRS-6 (`ts-fsrs` 5.4.2, mantiene Node 22) por defecto +
  Leitner como alternativa, intercambiables con el patrón Strategy. Se evaluaron FSRS-6, FSRS-7, SM-2, HLR, Ebisu y
  Leitner con el benchmark abierto srs-benchmark. FSRS-7, SM-2, HLR y Ebisu quedan fuera del MVP.
- P3: (FR-009) ¿Quiénes prueban el MVP? → Solo el dueño del producto. Las señales quedan en su navegador; no hace falta
  backend ni analítica.

## Supuestos
- S1: El periodo de evaluación es de 2 semanas de uso — revertible si se necesita más tiempo para ver efectos en el repaso.
- S2: Los resultados de la evaluación se consultan en una pantalla interna de la app y se pueden exportar como archivo —
  revertible si basta con consultarlos.
- S3: El escape room es una sola sala corta, con 5 a 8 palabras — revertible tras evaluar el PoC.
- S4: La palabra del reto diario sale de una lista propia de palabras de nivel intermedio incluida en la app (no de la
  colección del usuario, para que sea secreta) — revertible si se prefiere otra fuente.
- S5: El MVP se entrega por incrementos, cada uno en su propio PR, dentro de HU-002 — revertible si se prefiere dividirlo en
  varias HU.

## Plan técnico

### Análisis del código existente y del entorno
- Arquitectura actual: dominio (`src/domain/word.js`) + repositorios con contrato (`src/repositories/contracts.js`) +
  raíz de composición (`src/repositories/index.js`) + `RepositoryProvider` + hooks + componentes. Navegación por estado en
  `App.jsx` (2 pestañas). 39 tests sin red; CI con Node 22.
- Colección: `SavedWordsRepository` en `localStorage` (`dictionary-ui:saved-words:v1`), guarda `Word` de dominio.
- Entorno de prueba (P3): Mac M4 Pro, 24 GB de RAM, Chrome 157 → cumple los requisitos de Gemini Nano
  (macOS 13+, ≥ 16 GB RAM, 22 GB libres). La Prompt API está disponible para páginas web desde Chrome 148.
- Librerías verificadas:
  - `ts-fsrs` 5.4.2 (MIT, Node ≥ 20) implementa FSRS-6, el algoritmo más preciso del benchmark srs-benchmark
    (log loss 0.346 frente a 0.469 de HLR y 0.499 de Ebisu). La 6.x añade FSRS-7 pero exige Node ≥ 24 → se usa la 5.x (P4).
  - `react-router-dom` 7.18 (React ≥ 18).
  - `three` 0.187 + `@react-three/fiber` 9.8 + `@react-three/drei` 10.7 → exigen **React 19** (19.3.1 compatible;
    `react-bootstrap` 2.10 lo soporta).
- Imágenes (P1): la API de Wikimedia Commons (`generator=search`, `origin=*`) devuelve miniaturas con licencia y autor,
  sin clave. Openverse se descarta: límite anónimo de 200 búsquedas al día.

### 1. Solución técnica

Se mantienen los principios: la UI solo conoce el dominio, todo dato externo pasa por un repositorio con contrato, y las
implementaciones se eligen en `src/repositories/index.js`.

**Dominio nuevo (`src/domain/`, funciones puras y testeables)**
- `learningEvent.js`: modelo `LearningEvent { id, at, idea, type, term?, correct?, meta? }`. Es la única fuente de las
  métricas (FR-009) y de la gamificación (#18).
- `scheduling/` (#1) — **patrón Strategy** (ver "Patrones de diseño"): contrato `SchedulingStrategy`
  `{ id, createCard(term, now), review(card, grade, now), isDue(card, now), predictRecall?(card, now) }` y un registro
  `strategies` que las elige. Estrategias del MVP (decisión P4):
  - `fsrs6Strategy` (por defecto): envuelve `ts-fsrs` 5.4.2 (FSRS-6), con las 4 calificaciones de FSRS
    (Again, Hard, Good, Easy).
  - `leitnerStrategy`: 5 cajas con intervalos 1, 2, 4, 8 y 16 días; acertar sube de caja, fallar vuelve a la caja 1.
  - El algoritmo activo se elige en el Lab; las tarjetas existentes conservan el algoritmo que las creó.
  - Modo sombra: en cada repaso se registra, además, la probabilidad de recuerdo que predice FSRS-6, para poder medir
    su precisión con tus propios datos más adelante.
- `gamification.js` (#18): `computeProgress(events, today)` → `{ xp, level, streak, achievements[] }`, calculado a partir
  de los eventos (sin estado propio que se pueda desincronizar).
- `metrics.js` (FR-009): `summarizeByIdea(events, cards)` → uso, días activos, aciertos en el repaso, y comparaciones
  "con y sin" para #7 y #12.
- `experiment.js` (#12): `groupOf(term)` asigna cada palabra de forma determinista al grupo "con imagen" o "sin imagen" (50/50).
- `dailyChallenge.js` (#3): `wordOfTheDay(date, list)` determinista y `nextHint(attempts)`.

**Repositorios nuevos (contratos en `contracts.js`, adaptadores en `localStorage` salvo que se indique)**
- `ReviewRepository` (#1): `list()`, `get(term)`, `save(card)`. Al guardar una palabra en la colección se crea su tarjeta.
- `LearningEventRepository` (FR-009): `append(event)`, `list()`, `export()` (descarga JSON, S2).
- `FeatureFlagsRepository` (FR-010): `get()`, `set(flag, enabled)`; todas las ideas activas por defecto.
- `DailyChallengeRepository` (#3): estado del reto de hoy (intentos, resuelto).
- `ImageRepository` (#12): adaptador `createWikimediaCommonsImageRepository` → `findImages(term)` devuelve
  `{ thumbUrl, sourceUrl, license, author }[]`; la UI muestra siempre la atribución.
- `AiTutorRepository` (#7, #9, #16): `availability()`, `createExercise(words, kind)`, `checkSentence(word, sentence)`,
  `checkExplanation(word, explanation)`, `writeStory(words)`, `narrate(roomState, action)`.
  - Adaptador `createChromeBuiltInAiTutor` sobre `LanguageModel` (Prompt API) con `responseConstraint` en JSON Schema
    para respuestas estructuradas.
  - Adaptador `createUnavailableAiTutor` cuando `availability()` no es `available` (FR-011, P2).

**Capacidades del navegador (hooks, sin repositorio)**
- `useSpeechRecognition` (#2): envuelve `SpeechRecognition`, detecta soporte y compara la transcripción normalizada con
  la palabra.
- `useCapabilities` (FR-011): IA local, micrófono y reconocimiento de voz → oculta o avisa en cada idea.

**Navegación** (`react-router-dom`)
- `/` inicio (repasos pendientes, racha, reto del día), `/review`, `/practice` (ejercicios, compañero, pronunciación),
  `/daily`, `/escape`, `/words` (colección actual), `/search` (buscador actual), `/lab` (métricas, flags, exportar).
- `vercel.json` con una regla de reescritura para que las rutas funcionen al recargar.

**PoC escape room (#16)** — `src/features/escapeRoom/`
- Escenario guionizado en `scenario.json`: 1 sala, 5 a 8 objetos, palabras objetivo y condiciones para avanzar (S3).
  La lógica del puzzle es determinista y testeable.
- La IA interpreta lo que el usuario escribe en inglés, narra y da pistas; no decide sola si se avanza.
- Escena 3D con `@react-three/fiber` + `drei`: objetos primitivos o modelos glTF CC0 incluidos en `public/models/`;
  cada objeto es clicable.

### 1.1 Patrones de diseño
- **Repository** (ya existente): acceso a datos y servicios externos (`localStorage`, Commons, Prompt API).
- **Strategy** (nuevo): para los **algoritmos de repaso**. Un algoritmo no es acceso a datos sino una regla de cálculo
  pura; con Strategy se cambia o compara de algoritmo sin tocar repositorios ni UI, y se prueba sin `localStorage`.
  La tarjeta guarda qué estrategia la creó, para no mezclar estados entre algoritmos.
- **Decorator** (ya existente, `withPronunciation`): se reutiliza para registrar eventos de aprendizaje alrededor de
  repositorios sin ensuciar su lógica.

### 2. Archivos existentes que cambian
- `package.json` / `pnpm-lock.yaml`: nuevas dependencias (`ts-fsrs@5`, `react-router-dom@7`; en el incremento 4:
  `react@19`, `react-dom@19`, `three`, `@react-three/fiber`, `@react-three/drei`).
- `src/repositories/contracts.js` e `index.js`: nuevos contratos y su composición.
- `src/App.jsx` y `src/main.jsx`: router y nueva navegación.
- `src/hooks/useSavedWords.js`: al guardar una palabra se crea su tarjeta de repaso y se registra un evento.
- `src/components/WordDetails.jsx`: botones "Practice pronunciation" (#2) e imagen (#12, solo grupo "con imagen").
- `README.md`: nuevas secciones y cómo leer el Lab.

### 3. Entrega por incrementos (S5) — un PR cada uno
| Inc. | Contenido | Ideas | Requiere IA |
|------|-----------|-------|-------------|
| 1 | Router, flags, eventos, Lab con exportación, repaso espaciado, gamificación, pantalla de inicio | #1, #18, FR-009/010 | No |
| 2 | Pronunciación, reto diario, imágenes de Commons con experimento 50/50 | #2, #3, #12 | No |
| 3 | `AiTutorRepository` + adaptador Chrome; ejercicios y personaje compañero | #7, #9 | Sí |
| 4 | Migración a React 19 + three.js; PoC del escape room | #16 | Sí |

Al terminar el incremento 1 ya se puede empezar a medir; cada incremento se publica en producción al fusionarse.

### 4. Flujo de datos principal
Acción del usuario → hook de la idea → repositorio (estado) + `LearningEventRepository.append()` → `computeProgress()`
actualiza XP, racha y logros → el Lab lee eventos y tarjetas con `summarizeByIdea()`.

### 5. Estrategia de pruebas
| Nivel | Qué se prueba | Cubre |
|-------|---------------|-------|
| Unitario | estrategias `fsrs6` y `leitner` (mismo conjunto de pruebas del contrato para ambas), `gamification`, `metrics`, `experiment`, `dailyChallenge`, lógica del escenario del escape room | US-001, 002, 003, 005, 009 |
| Adaptadores | `localStorage` con almacenamiento en memoria; Commons con fixture real; IA de Chrome con un `LanguageModel` falso | US-006, 007, 008 |
| Componentes | Flujos con fakes: repasar, reto diario, pronunciación con `SpeechRecognition` falso, ideas ocultas sin IA, flags | US-001–008, FR-010/011 |
| Regresión | Los 39 tests actuales siguen pasando | FR-012 |
| Manual en producción | Gemini Nano real en tu Chrome, micrófono y escena 3D | AC1, AC3 |

### 6. Radio de impacto
- `useSavedWords` crea tarjetas de repaso: las palabras ya guardadas se migran creando sus tarjetas la primera vez.
- La navegación cambia de pestañas a rutas: las pruebas de `App.test.jsx` se actualizan.
- La migración a React 19 (incremento 4) afecta a toda la app; la cubren los tests existentes.

### 7. Decisiones de arquitectura (requieren ADR y cambios en `specs/`, con aprobación)
- **ADR:** gamificación y métricas derivadas de un registro de eventos local, sin backend.
- **ADR:** IA local con la Prompt API de Chrome detrás de `AiTutorRepository`; sin ella, las ideas se ocultan (P2).
- **ADR (aprobado el 2026-11-19, registrado en `constitution.md`):** migrar a React 19 para usar three.js con
  `@react-three/fiber`. `tech-stack.md` se actualiza al aplicarlo en el incremento 4.
- **`tech-stack.md`:** nuevas librerías y APIs externas (Commons para imágenes, Prompt API).
- **`mission.md`:** métricas de aprendizaje (aciertos a 7 días, días activos por semana).
- Se proponen al cerrar cada incremento, excepto la de React 19, que se propone antes del incremento 4.

### 8. Conformidad con `constitution.md`
- Principios 1–3: se cumplen (dominio puro, nuevos repositorios con contrato, resultados sin excepciones).
- Principio 4 (sin backend ni secretos): se cumple; IA local, Commons sin clave.
- Principio 5 (tests sin red): se cumple con fakes y fixtures.
- "No hace traducción": ningún ejercicio traduce; las explicaciones son en inglés.

### 9. Advertencias
- **Privacidad del reconocimiento de voz (#2):** en Chrome, `SpeechRecognition` envía el audio a los servidores de Google
  salvo que se pida el modo local (`processLocally`) y esté disponible. Se usará el modo local cuando exista y se avisará
  al usuario en caso contrario.
- **Gemini Nano** se descarga la primera vez (varios GB); la app debe mostrar el progreso de la descarga.
- **Atribución obligatoria** en las imágenes con licencia CC BY-SA de Commons.
- **Un solo usuario de prueba (P3):** las comparaciones de #7 y #12 tendrán pocos datos; se tratan como señales, no como
  conclusiones.
- **Alcance:** 4 incrementos; el más incierto es el escape room (incremento 4).
- Depende de los supuestos S1–S5.

## Tareas atómicas
<!-- Una tarea = un commit lógico. Generadas en fase /sdd-tasks. -->

### Incremento 1 — Base de medición, repaso espaciado y gamificación (PR 1)

#### Setup
- [x] [T-001] Instalar `ts-fsrs@5.4.2` y `react-router-dom@7` — `package.json`, `pnpm-lock.yaml`
  Done cuando: `pnpm install --frozen-lockfile` y los 39 tests pasan.

#### Foundational
- [x] [T-002] [P] Modelo `LearningEvent` y `LearningEventRepository` (`localStorage`, exportar JSON) — `src/domain/learningEvent.js`, `src/repositories/learningEvents/`
  Done cuando: los tests de contrato del repositorio (agregar, listar, exportar, datos corruptos) pasan.
- [x] [T-003] [P] `FeatureFlagsRepository` (`localStorage`, todo activo por defecto) — `src/repositories/featureFlags/`
  Done cuando: los tests de activar/desactivar y de valores por defecto pasan.
- [x] [T-004] Router y navegación por rutas; buscador en `/search` y colección en `/words`; reescritura para Vercel — `src/App.jsx`, `src/main.jsx`, `vercel.json`
  Done cuando: los tests de `App` pasan sobre las rutas y la navegación muestra solo las ideas activas.

#### US-001 — Repaso espaciado (#1)
- [x] [T-005] [P] [US-001] Contrato `SchedulingStrategy` + `fsrs6Strategy` + `leitnerStrategy` con un mismo conjunto de pruebas — `src/domain/scheduling/`
  Done cuando: ambas estrategias pasan las pruebas del contrato y las suyas propias.
- [x] [T-006] [US-001] `ReviewRepository` + creación de tarjetas al guardar palabras + migración de las palabras ya guardadas — `src/repositories/review/`, `src/hooks/useSavedWords.js`
  Done cuando: guardar una palabra crea su tarjeta y las palabras previas obtienen tarjeta la primera vez.
- [x] [T-007] [US-001] Pantalla `/review` con calificación, eventos y modo sombra de FSRS-6 — `src/components/review/`, `src/hooks/useReview.js`
  Done cuando: repasar reprograma la tarjeta, registra el evento con la predicción de FSRS-6 y, sin pendientes, muestra el próximo repaso.

#### US-002 — Mecánicas de juego (#18)
- [x] [T-008] [P] [US-002] `computeProgress(events, today)`: XP, niveles, racha y logros — `src/domain/gamification.js`
  Done cuando: los tests de racha (sigue, se reinicia), niveles y logros pasan.
- [x] [T-009] [US-002] Pantalla de inicio `/` con racha, XP, nivel, logros y repasos pendientes — `src/components/home/`
  Done cuando: el test de la pantalla muestra los valores calculados a partir de los eventos.

#### US-009 — Medición (FR-009 / FR-010)
- [x] [T-010] [P] [US-009] `summarizeByIdea(events, cards)` — `src/domain/metrics.js`
  Done cuando: los tests de uso, días activos y aciertos por idea pasan.
- [x] [T-011] [US-009] Pantalla `/lab`: métricas, activar/desactivar ideas, algoritmo de repaso y exportación — `src/components/lab/`
  Done cuando: el test cambia un flag, cambia el algoritmo y exporta los eventos.

#### Cierre del incremento
- [ ] [T-012] Verificación en el navegador y en la vista previa de Vercel; README actualizado — `README.md`
  Done cuando: los flujos de repaso, inicio y Lab funcionan en la vista previa del PR y `validate` está en verde.

### Incremento 2 — Pronunciación, reto diario e imágenes (PR 2)
- [ ] [T-013] `useCapabilities` (micrófono, reconocimiento de voz, IA local) — `src/hooks/useCapabilities.js`
  Done cuando: las ideas sin capacidad se ocultan o muestran un aviso (test con capacidades falsas).
- [ ] [T-014] [US-004] `useSpeechRecognition` (modo local si existe) y práctica de pronunciación — `src/hooks/`, `src/components/pronunciation/`
  Done cuando: con un `SpeechRecognition` falso, acertar y fallar dan la respuesta correcta y registran eventos.
- [ ] [T-015] [P] [US-005] Dominio del reto diario + lista propia de palabras + `DailyChallengeRepository` — `src/domain/dailyChallenge.js`, `src/data/`, `src/repositories/dailyChallenge/`
  Done cuando: la palabra del día es determinista y las pistas avanzan con cada intento fallido.
- [ ] [T-016] [US-005] Pantalla `/daily` con resultado para compartir sin revelar la palabra — `src/components/daily/`
  Done cuando: el test resuelve el reto, bloquea un segundo intento ese día y genera el texto para compartir.
- [ ] [T-017] [P] [US-008] `groupOf(term)` (50/50) + `ImageRepository` de Commons con fixture real — `src/domain/experiment.js`, `src/repositories/images/`
  Done cuando: la asignación es estable y el adaptador devuelve imágenes con licencia y autor.
- [ ] [T-018] [US-008] Imagen con atribución en el detalle de la palabra (solo grupo "con imagen") y "otra imagen" — `src/components/WordDetails.jsx`
  Done cuando: el test muestra la imagen y su atribución solo para el grupo correspondiente.

### Incremento 3 — Tutor de IA local (PR 3)
- [ ] [T-019] Contrato `AiTutorRepository` + adaptador Chrome (Prompt API, `responseConstraint`) + adaptador no disponible + progreso de descarga — `src/repositories/aiTutor/`
  Done cuando: con un `LanguageModel` falso se generan y validan respuestas estructuradas; sin él, `availability()` es `unavailable`.
- [ ] [T-020] [US-006] `/practice`: completar oraciones, oración propia con corrección y mini historia — `src/components/practice/`
  Done cuando: el test con el tutor falso completa los tres tipos de ejercicio y registra eventos.
- [ ] [T-021] [US-007] Personaje compañero que pide explicaciones y las retoma — `src/components/companion/`
  Done cuando: el test valora una explicación, sugiere mejora y vuelve a preguntar la palabra más adelante.

### Incremento 4 — PoC del escape room (PR 4)
- [ ] [T-022] Migrar a React 19 (ADR aprobado) y actualizar `tech-stack.md` — `package.json`
  Done cuando: todos los tests y el build pasan con React 19.
- [ ] [T-023] Instalar `three`, `@react-three/fiber` y `@react-three/drei`; dominio del escenario guionizado con tests — `src/features/escapeRoom/`
  Done cuando: los tests resuelven la sala de principio a fin con la lógica determinista.
- [ ] [T-024] [US-003] Escena 3D con objetos clicables, narración y pistas de la IA, y guardado de palabras nuevas — `src/features/escapeRoom/`
  Done cuando: la sala se puede completar en Chrome con IA local y las palabras nuevas se pueden guardar.

### Polish
- [ ] [T-025] Propuestas de ADR y de cambios en `specs/` (eventos locales, IA local, nuevas librerías, métricas de aprendizaje) — `specs/`
  Done cuando: el humano aprueba o ajusta cada propuesta.
- [ ] [T-026] Verificación de los criterios de aceptación y evaluación tras 2 semanas de uso — `plans/current.md`
  Done cuando: cada criterio tiene evidencia y existe una decisión documentada sobre qué ideas continúan.

Total tareas: 26
Paralelizables: 8 (T-002, T-003, T-005, T-008, T-010, T-015, T-017 y T-023 respecto a la UI)
Por user story: US-001 (3), US-002 (2), US-003 (1), US-004 (1), US-005 (2), US-006 (1), US-007 (1), US-008 (2), US-009 (2)
MVP mínimo: T-001 a T-012 (incremento 1): repaso espaciado, gamificación y medición funcionando de punta a punta.

## Riesgos identificados
<!-- Qué puede salir mal. Ordenados por probabilidad × impacto. -->
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| El alcance de 8 ideas retrasa tener algo evaluable | Alta | Alto | Entregar por incrementos, empezando por #1 y #18 |
| La IA local no está disponible en los equipos de prueba | Media | Alto | Verificarla antes de planificar #7, #9 y #16 |
| Datos insuficientes para decidir con un solo usuario | Media | Alto | Usar comparaciones dentro del mismo usuario (palabras con y sin ejercicio o imagen) durante 2 semanas (S1) |
| El PoC del escape room consume la mayor parte del esfuerzo | Media | Medio | Limitarlo a una sala corta con pocas palabras |

## Contexto relevante de specs/
<!-- Qué secciones de specs/ aplican directamente a este feature. -->
- [x] constitution.md §Principios 1–5, §Lo que este proyecto NO hace (backend propio, cuentas, traducción)
- [x] mission.md §Métricas de éxito (hoy no miden aprendizaje)
- [x] tech-stack.md §Frameworks y librerías, §Dependencias críticas (React 18)

## Decisiones tomadas durante implementación
<!-- Log de micro-decisiones para no repetir discusiones. -->
| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Patrón Strategy para los algoritmos de repaso, además de Repository | Solo Repository | Un algoritmo es cálculo puro, no acceso a datos; Strategy permite cambiarlo y compararlo sin tocar repositorios ni UI |
| `PreferencesRepository` (flags + algoritmo activo) en lugar de un `FeatureFlagsRepository` solo para flags | Un repositorio por cada preferencia | Ambas son preferencias del usuario que se leen juntas en el Lab |
| `LearningProvider` único con eventos, preferencias y tarjetas; progreso y pendientes derivados | Un contexto por cada dato | Evita estados desincronizados entre XP, racha y repasos |
| Toda tarjeta guarda `fsrsShadow` (estado FSRS-6) además del estado de su estrategia | Calcular la sombra solo para Leitner | Un solo camino de código; permite medir el log loss de FSRS-6 con cualquier algoritmo |
| `vercel.json` reescribe todas las rutas a `index.html` | Rutas con `#` | URLs limpias; Vercel sirve primero los archivos estáticos existentes |
| La pantalla de repaso se re-evalúa cada 30 s | Recargar a mano | Las palabras calificadas "Again" vuelven al minuto (paso de aprendizaje de FSRS) |
| FSRS-6 + Leitner (opción A) | FSRS-6/7 + SM-2 + Leitner con Node 24 (opción B) | Mantiene Node 22 y, con un solo usuario, más algoritmos darían muy pocos datos por cada uno |
