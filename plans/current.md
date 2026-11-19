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

### Ampliación del alcance (2026-11-19, tras probar el incremento 1)
- Fuente: texto libre en chat — "algo que aún no me gusta es que tengo que buscar las palabras y si estoy aprendiendo
  cómo voy a buscar… cuáles son las palabras más comunes que dan valor al aprendizaje".
- Decisiones del humano: nueva idea #19 dentro de HU-002, primera del incremento 2; fuente NGSL; reconsiderar la regla de
  "no traducción" para una ayuda opcional en español (requiere ADR).

### Ampliación 2 (2026-11-19, tras probar la ruta en Chrome local)
- Fuente: notas del humano N1 ("si no sé inglés, ¿cómo voy a entender?") y N2 ("falta algo visual que ayude a ver qué
  palabra es").
- Decisiones del humano: UI bilingüe (inglés + línea de ayuda en español) preparada para otros idiomas, sin librería i18n;
  imagen siempre que exista una buena, sin experimento 50/50.

## Feature en curso
**Nombre:** HU-002 — MVP de aprendizaje: explorar ideas y encontrar el valor real
**Estado:** implement
**Plan aprobado:** 2026-11-19 (ampliación #19 / FR-016 aprobada el 2026-11-19; ampliación 2 — FR-017 y cambio de FR-006 —
aprobada el 2026-11-19, con sus cambios en specs)
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
- **FR-006** (#12 Imágenes) Cada palabra se muestra con una imagen que ayude a reconocerla y recordarla, siempre que exista
  una buena (en la ruta y en el detalle); el usuario puede pedir otra. (Cambiado por N2: antes solo al 50 % de las palabras.)
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
- **FR-013** (#19 Ruta de vocabulario esencial) La app propone cada día palabras nuevas en orden de utilidad (las más
  frecuentes del inglés cotidiano) sin que el usuario tenga que buscarlas; las que el usuario decide aprender entran al
  repaso espaciado.
- **FR-014** (#19) Una prueba de nivel corta detecta qué palabras ya conoce el usuario para no proponérselas.
- **FR-015** (#19) La app muestra qué porcentaje de un texto común en inglés cubren las palabras que el usuario domina.
- **FR-016** (Ayuda en español) El usuario puede ver, si lo pide, la traducción al español de una palabra o definición;
  la ayuda se puede desactivar (ADR aprobado).
- **FR-017** (Ayuda bilingüe, N1) Las instrucciones, mensajes y botones se muestran en inglés con una línea de ayuda en el
  idioma del usuario debajo o al lado (por defecto español). Los textos de ayuda viven en un catálogo por idioma para poder
  agregar otros idiomas más adelante. La ayuda se puede apagar ("sin ayuda").

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

- Given una palabra nueva de la ruta o una palabra de mi colección
  When la veo o abro su detalle
  Then veo una imagen relacionada (si existe una buena) y puedo pedir otra si no me ayuda.

**US-013** [P1] (FR-017) Como principiante que casi no lee inglés, quiero que las instrucciones y los botones tengan una
ayuda en mi idioma, para saber qué hacer en cada pantalla.

- Given cualquier pantalla de la app con la ayuda activa (por defecto, en español)
  When la abro
  Then cada título, instrucción, mensaje y botón muestra en inglés su texto y, junto a él, la ayuda en español.
- Given que elijo "sin ayuda" en el Lab
  When vuelvo a la pantalla
  Then solo veo el inglés.

**US-010** [P1] (#19) Como estudiante, quiero que la app me proponga las palabras más útiles para aprender, para no
tener que adivinar qué buscar.

- Given que terminé la prueba de nivel
  When abro "Learn"
  Then veo las palabras nuevas de hoy, empezando por las más frecuentes que aún no conozco, con definición simple y audio.
- Given una palabra propuesta
  When elijo "Learn it"
  Then se guarda en mi colección y entra al repaso; si elijo "I know it", no vuelve a aparecer.
- Given que aprendí la cuota del día
  When vuelvo a "Learn"
  Then veo que terminé por hoy y puedo pedir más palabras si quiero.

**US-011** [P1] (#19) Como estudiante, quiero ver cuánto inglés cotidiano entiendo con mis palabras, para notar mi avance.

- Given palabras que conozco o domino
  When abro el inicio o "Learn"
  Then veo el porcentaje de un texto común que cubren, y sube cuando domino palabras nuevas.

**US-012** [P2] (FR-016) Como estudiante principiante, quiero ver una ayuda en español cuando la definición en inglés es
difícil, para entender la palabra sin salir de la app.

- Given una palabra o definición en inglés
  When pido "Show in Spanish"
  Then veo su traducción al español; si mi navegador no puede traducir, se me avisa y el resto sigue funcionando.

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
| #12 Imágenes | Una imagen ayuda a reconocer y recordar la palabra | ≥ 60 % de las palabras nuevas muestran imagen y se pide "otra imagen" en < 30 % de ellas; como señal secundaria, aciertos de repaso de palabras con imagen frente a las que no encontraron una |
| Ayuda bilingüe (FR-017) | Con instrucciones en su idioma, el principiante usa la app sin atascarse | El humano completa la prueba de nivel y su primera sesión de repaso sin pedir ayuda externa; la ayuda sigue activa tras 2 semanas |
| #16 Escape room | Un objetivo narrativo motiva a usar el inglés | ≥ 60 % de quienes empiezan la sala la terminan |
| #18 Mecánicas de juego | Rachas y logros aumentan la constancia | Más días activos por semana con las mecánicas activas que sin ellas |
| #19 Ruta de vocabulario | Proponer palabras útiles elimina la fricción de no saber qué estudiar | ≥ 70 % de las palabras nuevas llegan por la ruta y no por búsqueda; ≥ 5 palabras nuevas por día activo |
| Ayuda en español | Una pista en español evita que el principiante se atasque | Se usa en ≥ 20 % de las palabras nuevas sin bajar los aciertos del repaso |

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

- P5: (#19) ¿Dónde entra la ruta de vocabulario? → En HU-002, como lo primero del incremento 2.
- P6: (#19) ¿Fuente de palabras? → NGSL 1.2 (Browne, Culligan y Phillips; CC BY-SA 4.0, con atribución visible).
- P7: (FR-016) ¿Se reconsidera la regla "no hace traducción"? → Sí: ayuda opcional en español. ADR aprobado y registrado en `constitution.md` (2026-11-19).
- P8: (N1) ¿En qué idioma va la UI? → Bilingüe: inglés + ayuda en el idioma del usuario, por defecto español, en títulos,
  instrucciones, mensajes y botones ("Learn it · Aprender"). Se apaga con "sin ayuda".
- P9: (N1) ¿Librería i18n? → No: por ahora solo español, con un catálogo propio por claves (sin dependencias ni servidor)
  preparado para otros idiomas. Más adelante, los demás idiomas se traducirían en el equipo con la Translator API y se
  guardarían en caché (opción elegida por el humano para cuando se amplíe).
- P10: (N2) ¿Imagen al 50 % (experimento) o siempre? → Siempre que exista una buena; se elimina el experimento 50/50.
- P11: (N2, tras probar "control") ¿Qué se muestra cuando no hay imagen? → Ambas: Wikidata (imágenes de los sentidos del
  lexema) como segunda fuente; la frase de ejemplo destacada se muestra siempre (ajustado por el humano).
- P12: (#12) ¿Cuántas fuentes de imágenes? → Al menos tres (pedido del humano): Wikipedia, Wikidata y Openverse (P1 ya
- P13: (#12) ¿Cómo evitar imágenes sin relación ("stand" → un paisaje)? → Filtrar con la IA local de Chrome (Gemini Nano,
  Prompt API multimodal): mira cada candidata junto con la definición y descarta las que no corresponden; si ninguna sirve,
  queda solo el ejemplo. Adelanta parte de T-019. Donde no hay IA local, funciona como antes.
- P14: (#12) Las fotos siguen sin convencer al humano incluso filtradas. ¿Alternativa? → Pictogramas ARASAAC (CC BY-NC-SA,
  ADR aprobado). Las palabras sin pictograma exacto muestran solo el ejemplo de uso; se quitan las fotos de la app (los
  adaptadores de fotos y el filtro con IA local quedan en el código como alternativas, fuera de la raíz de composición).
  Cobertura medida en #301–330: 16 de 30 palabras.
  admitía Openverse: gratis y sin clave).

## Supuestos
- S1: El periodo de evaluación es de 2 semanas de uso — revertible si se necesita más tiempo para ver efectos en el repaso.
- S2: Los resultados de la evaluación se consultan en una pantalla interna de la app y se pueden exportar como archivo —
  revertible si basta con consultarlos.
- S3: El escape room es una sola sala corta, con 5 a 8 palabras — revertible tras evaluar el PoC.
- S4: La palabra del reto diario sale de la NGSL, en el rango de frecuencia del usuario y fuera de su colección, para que
  sea secreta (actualizado tras P6) — revertible si se prefiere otra fuente.
- S6: La cuota por defecto es de 10 palabras nuevas al día, ajustable en el Lab — revertible tras ver el uso real.
- S7: Las 100 palabras más frecuentes de la NGSL (sobre todo gramaticales: "the", "be", "and"…) se consideran conocidas
  y no se proponen; sí cuentan para la cobertura — revertible si la prueba de nivel muestra lo contrario.
- S8: En la ruta se usan las definiciones en inglés simple de la NGSL; el detalle completo de Free Dictionary se abre a pedido.
- S9: Una palabra cuenta como "dominada" cuando su estado FSRS-6 (sombra) tiene una estabilidad de 21 días o más, con
  cualquier algoritmo — revertible si el umbral resulta demasiado exigente.
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
- ~~`experiment.js` (#12): `groupOf(term)` asigna cada palabra al grupo "con imagen" o "sin imagen" (50/50).~~ Eliminado por P10 (ver 1.3).
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

### 1.2 Ampliación: ruta de vocabulario (#19) y ayuda en español (FR-016)
- **Datos NGSL** (`src/data/ngsl/`): `ngsl-1.2.json` generado una sola vez a partir de `NGSL_12_stats.csv` (rango y
  frecuencia por millón) y `NGSL_12_with_English_definitions.xlsx` (categoría y definición en inglés simple), más
  `ATTRIBUTION.md` con la cita y la licencia CC BY-SA 4.0. Se carga con `import()` dinámico para no engordar la carga inicial.
  Verificado: 2809 palabras; las 100 más frecuentes cubren el 55 % de un texto común, 1000 el 78 % y la lista completa el 85 %
  (frecuencias por lema; el 92 % que publica la NGSL cuenta familias de palabras).
- **Repositorio `VocabularyListRepository`** → `list()` devuelve `{ term, rank, perMillion, partOfSpeech, simpleDefinition }`
  ordenadas por frecuencia. Adaptador `createNgslVocabularyRepository`; permite añadir otras listas (NGSL-Spoken, académica).
- **Repositorio `LearningPathRepository`** (`localStorage`): palabras marcadas como conocidas, resultado de la prueba de nivel
  y palabras nuevas aprendidas por día.
- **Dominio `learningPath.js`**: `placementSample(list)` (5 palabras por franja de frecuencia), `estimateStart(answers)`,
  `todaysNewWords(list, known, saved, quota)`, `coverage(list, knownOrMastered)` y `isMastered(card)` (S9).
- **Pantalla `/learn`**: prueba de nivel la primera vez; luego las palabras nuevas de hoy, cada una con definición simple,
  audio humano y botones "Learn it" (busca el `Word` completo en el diccionario, lo guarda y crea su tarjeta) e
  "I know it". Medidor de cobertura en `/learn` y en el inicio.
- **Repositorio `TranslationRepository`** (tras aprobar el ADR): `availability(from, to)`, `translate(text, from, to)`.
  Adaptador `createChromeTranslatorRepository` sobre la Translator API de Chrome (en el dispositivo, solo escritorio; el
  modelo se descarga la primera vez y `create()` exige un clic del usuario) y adaptador no disponible.
  Botón "Show in Spanish" en la ruta y en la respuesta del repaso; flag `translation` en el Lab; eventos de uso.

### 1.3 Ampliación 2: ayuda bilingüe (FR-017) e imagen siempre (FR-006 cambiado)
- **Catálogo de ayuda** (`src/i18n/`): `help.es.js` exporta un objeto plano `{ 'learn.placement.title': 'Which of these
  words do you know?' → '¿Cuáles de estas palabras conoces?' … }` con claves por pantalla; cada clave lleva un comentario
  con el contexto para quien traduzca. `helpLanguages.js` lista los idiomas disponibles (hoy solo `es`) y cómo cargarlos
  (`import()` dinámico, para que agregar `pt` o `fr` sea crear un archivo y una línea).
- **Componentes**: `<Bi id="…">English</Bi>` muestra el inglés y, debajo, la ayuda (texto gris más pequeño, `lang="es"`);
  `<BiLabel>` (antes `<BiButton>`) muestra "Learn it · Aprender" dentro del botón. Si falta una clave, solo se ve el inglés (y un aviso en
  desarrollo). Un test recorre las claves usadas y comprueba que existen en `help.es.js`.
- **Preferencia** `helpLanguage` (`'es'` por defecto, `'none'` = sin ayuda) en `PreferencesRepository`; selector en el Lab.
  "Show in Spanish" (FR-016) pasa a traducir al idioma de ayuda elegido.
- **Imágenes**: `ImageRepository` sobre Wikimedia (`findImages(term)` → `{ url, width, height, title, author, license,
  licenseUrl, pageUrl }`, sin clave, con fixtures reales). Implementado así: la imagen principal del artículo de Wikipedia
  en inglés con el mismo nombre (nuevo host: `en.wikipedia.org`) y otras imágenes del artículo; licencia, autor y
  miniatura desde Commons. Los archivos que no están en Commons se descartan. Si Wikipedia no da imagen (desambiguación o
  palabra abstracta), una consulta SPARQL a Wikidata (nuevo host: `query.wikidata.org`) busca las imágenes (P18) de los
  conceptos a los que apuntan los sentidos del lexema inglés (P5137). Si tampoco hay, `/learn` muestra una frase de
  ejemplo del diccionario con la palabra resaltada y "Show in Spanish" (P11) + `ImageCard` con atribución y "Another image". Se muestra en `NewWordCard`
  (`/learn`) y en `WordDetails`. Sin `groupOf`/experimento. Si no hay imagen buena (palabras abstractas), no se muestra nada.
  Eventos `IMAGE_SHOWN` e `IMAGE_REJECTED` ("otra imagen") para la señal de éxito.

### 2. Archivos existentes que cambian
- `package.json` / `pnpm-lock.yaml`: nuevas dependencias (`ts-fsrs@5`, `react-router-dom@7`; en el incremento 4:
  `react@19`, `react-dom@19`, `three`, `@react-three/fiber`, `@react-three/drei`).
- `src/repositories/contracts.js` e `index.js`: nuevos contratos y su composición.
- `src/App.jsx` y `src/main.jsx`: router y nueva navegación.
- `src/hooks/useSavedWords.js`: al guardar una palabra se crea su tarjeta de repaso y se registra un evento.
- `src/components/WordDetails.jsx`: botones "Practice pronunciation" (#2) e imagen (#12, siempre que exista una buena).
- Todas las pantallas (`src/components/**`): textos con ayuda bilingüe (FR-017).
- `README.md`: nuevas secciones y cómo leer el Lab.

### 3. Entrega por incrementos (S5) — un PR cada uno
| Inc. | Contenido | Ideas | Requiere IA |
|------|-----------|-------|-------------|
| 1 | Router, flags, eventos, Lab con exportación, repaso espaciado, gamificación, pantalla de inicio | #1, #18, FR-009/010 | No |
| 2 | **Ruta de vocabulario NGSL y cobertura**, ayuda en español, pronunciación, reto diario (palabras de la NGSL), imágenes de Commons siempre que exista una buena, ayuda bilingüe | #19, FR-016, FR-017, #2, #3, #12 | Traducción local (Translator API) |
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
- [x] [T-012] Verificación en el navegador y en la vista previa de Vercel; README actualizado — `README.md`
  Done cuando: los flujos de repaso, inicio y Lab funcionan en la vista previa del PR y `validate` está en verde.
  Evidencia: PR #5 con `validate` en verde (24 s). La vista previa exige login de Vercel, así que, con acuerdo del humano,
  se verificó en producción tras el merge (77fad33): `/`, `/lab`, `/review`, `/words`, `/search` y una ruta inexistente
  responden 200; cargar `/lab` y recargar `/review` directamente renderizan la app sin recursos con error.

### Incremento 2 — Ruta de vocabulario, ayuda en español, pronunciación, reto diario e imágenes (PR 2)
- [x] [T-027] [US-010] Datos NGSL 1.2 en JSON con atribución y licencia — `src/data/ngsl/`
  Done cuando: el JSON tiene 2809 palabras con rango, frecuencia, categoría y definición, y `ATTRIBUTION.md` cita la fuente.
- [x] [T-028] [P] [US-010] [US-011] `VocabularyListRepository` (NGSL) + `LearningPathRepository` + dominio `learningPath.js` — `src/repositories/vocabulary/`, `src/repositories/learningPath/`, `src/domain/learningPath.js`
  Done cuando: los tests de muestra de nivel, palabras de hoy, cobertura y palabra dominada pasan.
- [x] [T-029] [US-010] Pantalla `/learn`: prueba de nivel, palabras nuevas de hoy, "Learn it" e "I know it" — `src/components/learn/`
  Done cuando: el test hace la prueba de nivel, aprende una palabra (queda en la colección con tarjeta) y descarta otra.
- [x] [T-030] [US-011] Medidor de cobertura en `/learn` y en el inicio — `src/components/`
  Done cuando: el porcentaje sube en el test al marcar o dominar palabras.
- [x] [T-031] [US-012] `TranslationRepository` (Translator API de Chrome) + "Show in Spanish" + flag — `src/repositories/translation/`, `src/components/`
  Done cuando: con un `Translator` falso se muestra la traducción; sin él, aparece el aviso y nada se rompe.
  Evidencia: tests con traductor falso (ok, no disponible, sin respuesta). En el navegador integrado la API existe pero
  nunca responde: tras 5 s se muestra "Translation is not available" y la ruta sigue funcionando. **Falta probar la
  traducción real en Chrome 157 del humano** (tras publicar). Verificado por el humano en Chrome 157 con el servidor
  local (2026-11-19): descarga el modelo y traduce.
- [ ] [T-013] `useCapabilities` (micrófono, reconocimiento de voz, IA local) — `src/hooks/useCapabilities.js`
  Done cuando: las ideas sin capacidad se ocultan o muestran un aviso (test con capacidades falsas).
- [ ] [T-014] [US-004] `useSpeechRecognition` (modo local si existe) y práctica de pronunciación — `src/hooks/`, `src/components/pronunciation/`
  Done cuando: con un `SpeechRecognition` falso, acertar y fallar dan la respuesta correcta y registran eventos.
- [ ] [T-015] [P] [US-005] Dominio del reto diario + lista propia de palabras + `DailyChallengeRepository` — `src/domain/dailyChallenge.js`, `src/data/`, `src/repositories/dailyChallenge/`
  Done cuando: la palabra del día es determinista y las pistas avanzan con cada intento fallido.
- [ ] [T-016] [US-005] Pantalla `/daily` con resultado para compartir sin revelar la palabra — `src/components/daily/`
  Done cuando: el test resuelve el reto, bloquea un segundo intento ese día y genera el texto para compartir.
- [x] [T-033] [US-013] Catálogo de ayuda `help.es.js` + `<Bi>`/`<BiLabel>`/`<HelpLine>` + preferencia `helpLanguage` y selector en el Lab — `src/i18n/`
  Done cuando: los tests muestran inglés + español, solo inglés con "sin ayuda", y fallan si una clave usada no existe en el catálogo.
  Evidencia: `src/i18n/help.test.jsx` (claves estáticas de todo el código y claves de GRADES, ACHIEVEMENTS, IDEAS y
  STRATEGIES) y test de App "bilingual help" (español por defecto, "No help" deja solo inglés).
- [x] [T-034] [US-013] Aplicar la ayuda bilingüe a todas las pantallas (inicio, búsqueda, colección, learn, repaso, progreso, Lab, menú) — `src/components/**`
  Done cuando: ninguna instrucción, mensaje o botón queda sin clave de ayuda y todos los tests pasan.
  Evidencia: inicio, búsqueda, colección, learn, prueba de nivel, repaso, Lab, menú, detalle, traducción e imágenes
  usan `<Bi>`/`<BiLabel>`/`<HelpLine>`; en el Lab las tablas de métricas quedan solo en inglés (no son instrucciones).
- [x] [T-017] [P] [US-008] `ImageRepository` de Wikipedia + Commons con fixtures reales (cambiado por N2: sin `groupOf` 50/50) — `src/repositories/images/`
  Done cuando: el adaptador devuelve imágenes con licencia, autor y miniatura, y una lista vacía para palabras sin imagen.
  Evidencia: `WikimediaImageRepository.test.js` con fixtures reales ("ball": 6 imágenes; "guy": página de desambiguación → ninguna).
- [x] [T-018] [US-008] Imagen con atribución y "Another image" en la tarjeta de `/learn` y en el detalle de la palabra — `src/components/`
  Done cuando: el test muestra la imagen y su atribución, cambia de imagen al pedir otra y no muestra nada si no hay imagen.
  Evidencia: tests de App "images (#12)" (eventos `image_shown` e `image_rejected`). En el navegador: "image" muestra foto,
  autor, licencia y "Another image"; "yesterday" no muestra imagen. 127 tests y build en verde; consola sin errores.
  Ampliado (P11): "station" (desambiguación en Wikipedia) muestra una estación de tren desde Wikidata; "control" (sin
  imagen en ninguna fuente) muestra el ejemplo destacado. 131 tests en verde; consola sin errores.
  Ajuste estético pedido por el humano: miniatura de 200 px (4:3, esquinas redondeadas) junto a la definición, botón
  redondo "otra imagen" sobre la foto, crédito en una sola línea pequeña (autor · licencia) y el ejemplo de uso siempre
  visible, haya o no imagen.
  Tras probar "stand" (una sola imagen, sin opción de cambiarla): Wikipedia y Wikidata se consultan en paralelo y se
  combinan (imagen principal del artículo, imágenes de los sentidos, otras del artículo) para tener más alternativas en
  ↻. El botón ✕ "Hide image" se probó y se quitó por decisión del humano. Se probó ocultar las imágenes de los
  verbos y **se revirtió por decisión del humano**: quitaba un recurso que ya existía.
  Tercera fuente (P12): Openverse (`api.openverse.org`, fotos con licencia abierta de Flickr, museos, etc.). Un compuesto
  `combineImageRepositories` consulta las fuentes en paralelo, intercala sus resultados para ↻, ignora la que falle o
  tarde más de 8 s y muestra las primeras imágenes en cuanto responde una fuente (`onPartial`). Verificado: en "product",
  ↻ pasa de la foto de Wikidata a una de Openverse con su autor y licencia. 139 tests en verde.
  Tras "stand" con fotos de puestos de venta: para verbos (definición NGSL "to …") Openverse busca la acción con la forma
  "-ing" ("person standing" y "standing", intercaladas), sus resultados van primero y luego los de Wikimedia (no se oculta
  ninguno); dentro de Openverse se ordenan primero los títulos que nombran la palabra. Se precargan las imágenes de las 2
  palabras siguientes porque una búsqueda nueva en Openverse tarda ~10 s (límite por fuente: 15 s). Corregido: Openverse
  no encuentra nada si el espacio va como "+" (se envía %20). Verificado: "stand" muestra "Landscape with Person Standing
  on Mountain Top" (CC0). Límite conocido: la búsqueda es por palabras clave; con verbos abstractos ("control") la
  calidad sigue siendo irregular. 155 tests en verde.
  P13: imágenes que no cargan se saltan solas (antes quedaba la imagen rota). Filtro de relevancia con IA local:
  `ChromeImageJudgeRepository` (Prompt API multimodal: imagen + definición → booleano, veredictos en caché, 20 s máx.) y el
  decorador `withImageRelevance` (juzga hasta 6 candidatas una por una, muestra la primera confirmada al instante, deja al
  final las que no pudo juzgar y descarta las rechazadas; sin IA local o sin definición, pasa todo igual). Tarjeta
  "Local AI image check" en el Lab para ver el estado y descargar el modelo con un clic. 165 tests en verde. En el
  navegador integrado la IA local no está disponible (se muestran las imágenes sin filtrar).
  Prueba en el Chrome 157 del humano: el filtro corría, pero la pregunta directa ("¿la imagen muestra el significado?")
  aprobó el paisaje porque hay una persona diminuta de pie. Se probaron 4 formas de preguntar con Gemini Nano; la elegida
  es en dos pasos: (1) con la imagen, "¿cuál es el tema principal?"; (2) solo texto, "¿ese tema es un buen ejemplo de la
  palabra? sí/no" (con el formato booleano respondía "no" a todo). Resultado con la app real: paisaje, caricatura y
  escena nocturna rechazados; pelotas y billetes aceptados; ~1,5 s por imagen. Límite: el modelo no es determinista y
  a veces acepta imágenes dudosas (una persona en una reunión para "money").
  P14: `ArasaacImageRepository` (búsqueda en inglés, solo palabras clave exactas, el sentido verbal primero si la
  definición NGSL es de verbo usando el tipo de palabra de ARASAAC, 404 = sin pictograma y se guarda en caché). La app
  usa solo pictogramas; la tarjeta de IA local del Lab se quitó. Pictograma con fondo blanco y sin recorte; atribución
  en cada imagen y en el pie de Learn. 168 tests en verde.
  Tras "whole" (tres puntos en un óvalo, convención de comunicación aumentativa que no se entiende sola), el humano eligió
  (a) mostrar debajo del pictograma su significado según ARASAAC, con "Show in Spanish", cuando dice algo útil (muchos
  vienen vacíos o como "Common."), y (b) solo pictogramas de sustantivos y verbos (tipos 2 y 3 de ARASAAC); los adjetivos
  y adverbios abstractos quedan con el ejemplo. 172 tests en verde.

#### Notas de la prueba del humano en Chrome local (2026-11-19, en curso)
| # | Nota | Pantalla | Estado |
|---|------|----------|--------|
| N1 | Las instrucciones están en inglés: un principiante no entiende qué hacer ("si no sé inglés, ¿cómo voy a entender?"). Choca con `constitution.md` ("textos de UI en inglés"): cambiarlo requiere aprobación | `/learn` (prueba de nivel) y el resto | Decidido (P8, P9): FR-017, T-033/T-034 |
| N2 | Falta algo visual que ayude a reconocer la palabra. Relacionado con T-017/T-018 (#12), que hoy solo muestra imagen al 50 % de las palabras (experimento) | `/learn` (tarjeta de palabra nueva) | Decidido (P10): FR-006 cambiado, T-017/T-018 |
| N3 | "Show in Spanish" responde "Translation is not available in this browser" en el Chrome real del humano | `/learn` | Resuelto: la prueba fallida fue en Safari (no tiene la API). En Chrome 157 `availability` da `downloadable` y la traducción funciona |

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

- [ ] [T-032] Agregar el archivo `LICENSE` del repositorio (pedido del humano: va al final de todo) — `LICENSE`
  Done cuando: el humano elige la licencia del código y existe `LICENSE` en la raíz; los datos NGSL mantienen su licencia
  CC BY-SA 4.0 propia en `src/data/ngsl/`.

Total tareas: 34 (5 añadidas por la ampliación #19 / FR-016, 2 por la ampliación 2 y 1 por pedido del humano)
Paralelizables: 8 (T-002, T-003, T-005, T-008, T-010, T-015, T-017 y T-023 respecto a la UI)
Por user story: US-001 (3), US-002 (2), US-003 (1), US-004 (1), US-005 (2), US-006 (1), US-007 (1), US-008 (2), US-009 (2), US-010 (3), US-011 (2), US-012 (1), US-013 (2)
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
| Datos NGSL en un `import()` dinámico (chunk de 185 kB, 69 kB comprimido) | Incluirlos en el bundle principal | No penalizar la carga inicial |
| Script reproducible `scripts/build_ngsl.py` (solo biblioteca estándar) | Convertir a mano | CC BY-SA pide indicar los cambios; el script los documenta |
| La prueba de nivel se detiene en la primera franja con < 60 % de palabras conocidas | Recorrer siempre las 6 franjas | Menos pasos para principiantes |
| "Learn it" guarda el `Word` completo de Free Dictionary y, si no existe, uno armado con la definición NGSL | Guardar solo la definición NGSL | Mantiene audio, ejemplos y sinónimos en el repaso |
| Las palabras guardadas registran su origen (`meta.source`: `learn` o `search`) | Deducirlo después | Mide la hipótesis "≥ 70 % de las palabras nuevas llegan por la ruta" |
| La consulta de disponibilidad del traductor tiene un límite de 5 s | Esperar indefinidamente | En el navegador integrado de Claude la API existe pero no responde nunca |
| Ayuda bilingüe con catálogo propio por claves (`src/i18n/help.es.js`) | i18next + react-i18next | Decisión del humano (P9): solo español por ahora, sin dependencias; el catálogo por claves permite agregar idiomas después |
| Imagen siempre que exista una buena | Experimento 50/50 por palabra | Decisión del humano (P10): la falta de apoyo visual ya es una señal de valor; la otra mitad quedaba sin ayuda |
| Imagen = imagen principal del artículo de Wikipedia con el mismo nombre (+ otras del artículo); licencia y autor desde Commons | Búsqueda de texto en Commons | Probado con palabras reales: la búsqueda en Commons devuelve resultados poco relacionados ("guy" → Alice Guy). El artículo exacto acierta con sustantivos concretos ("ball", "money"); con palabras de varios sentidos puede mostrar otro sentido ("lead" → el metal, "write" → la piedra de Rosetta), y las desambiguaciones y muchas palabras abstractas no dan imagen: en las ranks 704–713 solo 4 de 10 tienen imagen. "Another image" y el evento `image_rejected` miden esto; la meta de ≥ 60 % puede no cumplirse en rangos abstractos |
| La ayuda dentro de botones y enlaces va con `aria-hidden`; la de títulos e instrucciones, como elemento hermano | Ayuda dentro del mismo elemento | Los controles conservan su nombre accesible en inglés y los tests existentes siguen valiendo |
| Los verbos muestran la misma imagen que se encuentre, aunque sea del sustantivo | Ocultarla y dejar solo el ejemplo (probado y revertido) | Decisión del humano: la imagen ya existe y ocultarla le quita un recurso |
| Verbos: Openverse busca la acción ("person standing") y va primero; Wikimedia después | Mismo orden que sustantivos; ocultar Wikimedia | La búsqueda por palabra trae el sustantivo ("stand" → puestos de venta); el humano pidió no quitar recursos |
| Cobertura como "meta de lectura" (X / 95 palabras de cada 100), con una frase de ejemplo con huecos para las palabras aún no conocidas y una nota de por qué sube rápido al principio | "Your words cover X % of everyday English text" | El humano no entendía el dato: las 100 palabras más frecuentes (supuesto S7) ya cubren el 55 % de un texto, pero cubrir no es entender; leer con comodidad exige ~95 % |
| Repaso: los botones de calificación se ven desde el inicio; "Show answer" queda como enlace opcional | Paso obligatorio "Show answer" antes de calificar | Pedido del humano: era un clic inútil; la respuesta sigue a un clic para quien quiera comprobar antes de calificarse |
| Pictogramas ARASAAC en lugar de fotos; sin pictograma, solo el ejemplo | Pictograma + fotos filtradas; curar a mano las 2809 palabras | Decisión del humano (P14): las fotos por palabra clave seguían mostrando otros significados |
| Filtro de relevancia con la IA local de Chrome (decorador sobre el compuesto de imágenes) | Generar ilustraciones (Pollinations: dibujó a una persona sentada para "stand" y con marca de agua); quitar Openverse | Decisión del humano (P13); no envía datos fuera del equipo y reutiliza la IA local prevista para T-019 |
| Openverse como tercera fuente, en su propio adaptador, unida por un repositorio compuesto | Meterla en el adaptador de Wikimedia; Pixabay/Unsplash/Pexels | Patrón repositorio: cada fuente se cambia o quita en la raíz de composición; las otras opciones exigen clave en el cliente (lo prohíbe la constitución) |
| Las imágenes se muestran a medida que responde cada fuente (límite 8 s por fuente) | Esperar a todas con un límite de 4 s | Openverse a veces tarda más de 4 s o responde 5xx; así no retrasa las imágenes de Wikimedia |
| Wikidata con una sola consulta SPARQL, en paralelo con Wikipedia y combinadas | Wikidata solo como respaldo; API `wbsearchentities` + `wbgetentities` (3 consultas) | Menos consultas por palabra y menos riesgo de límite de uso (429) |
| "Images" (#12) es una idea más que se puede apagar en el Lab | Imagen siempre fija | Cumple FR-010 (cada idea se activa o desactiva por separado) |
| FSRS-6 + Leitner (opción A) | FSRS-6/7 + SM-2 + Leitner con Node 24 (opción B) | Mantiene Node 22 y, con un solo usuario, más algoritmos darían muy pocos datos por cada uno |
