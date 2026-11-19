# Constitution

> Fuente de verdad del proyecto. Todo agente debe leer este archivo antes de actuar.
> Actualizar cuando cambie la arquitectura, el stack, o las reglas del equipo.

## Misión
<!-- Una oración: qué hace el sistema y para quién. -->
Diccionario web de inglés para buscar palabras, oír su pronunciación con voz humana y guardar una
colección personal.

## Principios de diseño
<!-- Máximo 5 reglas no negociables de arquitectura o producto. -->
1. La UI solo conoce el modelo de dominio (`src/domain`), nunca el formato de una API externa.
2. Todo acceso a datos externos pasa por un repositorio con contrato (`src/repositories/contracts.js`) y
   las implementaciones se eligen solo en la raíz de composición (`src/repositories/index.js`).
3. Los repositorios no lanzan excepciones en casos esperados: devuelven `found`, `not_found` o `error`.
4. Sin backend propio ni secretos en el cliente: solo APIs públicas sin clave.
5. Los tests no dependen de la red: usan fakes en memoria y fixtures con respuestas reales.

## Convenciones de código
<!-- Naming, estructura de carpetas, patrones preferidos. -->
- Lenguaje principal: JavaScript (ES modules) + JSX; React con componentes funcionales y hooks; tipos con JSDoc.
- Estilo: componentes `.jsx` en PascalCase, hooks `useX`, adaptadores `createXRepository`; textos de UI en inglés con ayuda bilingüe (por defecto en español) desde catálogos por idioma en `src/i18n/`.
- Tests: Vitest + Testing Library, junto al archivo probado (`*.test.js[x]`); fixtures reales en `__fixtures__/`.
- Commits: Conventional Commits en inglés (`feat:`, `fix:`, `ci:`…), sin co-autor de IA; una rama por feature y PR hacia `master`.
  `master` está protegida: solo entran cambios por PR con `validate` en verde; no se hace push directo.

## Restricciones conocidas
<!-- Deuda técnica, limitaciones de infraestructura, dependencias críticas. -->
- Las grabaciones de Free Dictionary API devuelven 403/404; el audio humano se obtiene de Wikimedia Commons.
- La colección vive solo en el `localStorage` del navegador: no se sincroniza entre dispositivos.
- No hay linter ni formatter configurados.
- Las APIs de terceros no garantizan disponibilidad (sin SLA).
- Las vistas previas de Vercel requieren iniciar sesión en Vercel.

## Decisiones de arquitectura (ADRs)
<!-- Registro de decisiones importantes y su justificación. Nunca borrar — solo marcar como obsoleto. -->
| Fecha | Decisión | Justificación | Estado |
|-------|----------|---------------|--------|
| 2026-11-18 | Reemplazar el backend .NET local por Free Dictionary API | El backend ya no existe; la API es gratuita y sin clave | activo |
| 2026-11-18 | Patrón repositorio con raíz de composición única | Poder cambiar de API o almacenamiento sin tocar la UI | activo |
| 2026-11-18 | Audio humano desde Wikimedia Commons (decorador `withPronunciation`) | Grabaciones de la API caídas y la voz sintética suena robótica | activo |
| 2026-11-18 | Migrar Create React App → Vite + Vitest | CRA sin mantenimiento | activo |
| 2026-11-18 | Colección en `localStorage` | No hay backend propio | activo |
| 2026-11-18 | CI con GitHub Actions (job `validate`) + CD con la integración GitHub de Vercel + ruleset en `master` sin bypass | Validar cada PR sin guardar secretos en GitHub y publicar sin pasos manuales (HU-001) | activo |
| 2026-11-19 | Migrar de React 18 a React 19 para usar three.js con `@react-three/fiber` 9 (HU-002, incremento 4) | `@react-three/fiber` 9 exige React 19; `react-bootstrap` 2.10 y `react-router-dom` 7 lo soportan | aprobado — se aplica en el incremento 4 de HU-002 |
| 2026-11-19 | Ayuda opcional de traducción al español con la Translator API de Chrome (en el dispositivo), desactivable desde el Lab | Para un principiante, la definición en inglés puede ser tan difícil como la palabra; la traducción local no envía datos ni requiere clave (HU-002, FR-016) | activo |
| 2026-11-19 | NGSL 1.2 (Browne, Culligan y Phillips) como lista base de vocabulario | 2809 palabras más útiles del inglés cotidiano, licencia CC BY-SA 4.0; atribución visible en la app y el archivo derivado se distribuye con la misma licencia (HU-002, #19) | activo |
| 2026-11-19 | Ayuda bilingüe de la UI con catálogo propio por claves, sin librería i18n; preparada para más idiomas | Un principiante no entiende instrucciones solo en inglés; el catálogo por claves no añade dependencias y permite agregar idiomas creando un archivo (HU-002, FR-017) | activo |
| 2026-11-19 | Pictogramas ARASAAC como imagen de cada palabra (API pública sin clave) | Las fotos buscadas por palabra mostraban otro significado ("stand" → puestos de venta, paisajes) incluso filtradas con la IA local; los pictogramas están hechos para aprender vocabulario y van ligados al significado. Licencia CC BY-NC-SA: uso no comercial y atribución visible (autor Sergio Palao, origen ARASAAC, Gobierno de Aragón); si la app pasa a ser comercial hay que retirarlos (HU-002, #12) | activo |

## Lo que este proyecto NO hace
<!-- Scope negativo explícito. Evita scope creep. -->
- Cuentas de usuario ni login.
- Backend propio.
- Enseñar idiomas distintos del inglés. La traducción al español solo existe como ayuda opcional (ver ADR).
- Sincronización entre dispositivos.
- Funcionamiento sin conexión.
