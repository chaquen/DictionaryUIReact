# Plan Activo

> Un feature a la vez. Este archivo representa el único trabajo en curso.
> Estado del ciclo: idle → specify → clarify → plan → tasks → implement → review → done

## Origen
- Fuente: texto libre en chat — "Agregamos entonces un ci y cd eso debe entrar como hu",
  a continuación de la decisión de publicar la app en Vercel.
- Obtenido: 2026-11-18
- Criterios de aceptación originales: ninguno (la fuente no los define; todos los de abajo son propuestos).

## Feature en curso
**Nombre:** HU-001 — Integración y despliegue continuos (CI/CD)
**Estado:** done
**Cerrado:** 2026-11-18
**Plan aprobado:** 2026-11-18
**Inicio:** 2026-11-18
**Deadline estimado:** -

---

## Requisitos
<!-- Qué debe hacer este feature. Funcional, no técnico. -->

- **FR-001** Todo cambio propuesto hacia la rama principal se valida automáticamente: se ejecutan las
  pruebas y se genera la versión de producción.
- **FR-002** El resultado de la validación (aprobada / fallida, con acceso al detalle) es visible en el
  cambio propuesto antes de fusionarlo.
- **FR-003** Todo cambio fusionado en la rama principal se publica automáticamente en la URL pública de
  producción, solo si su validación fue aprobada.
- **FR-004** [INFERIDO] Si una publicación falla, la versión publicada anterior sigue disponible sin
  interrupción.
- **FR-005** [INFERIDO] Cada cambio propuesto obtiene una URL de vista previa para probarlo antes de fusionarlo.
- **FR-006** [INFERIDO] Ninguna credencial del proceso de publicación queda guardada en el repositorio.

### User stories

**US-001** [P1] Como desarrollador, quiero que cada cambio propuesto se valide automáticamente para no
fusionar código roto.

- Given un PR abierto hacia `master`
  When se sube un commit al PR
  Then se ejecutan las pruebas y la generación de la versión de producción, y el PR muestra el resultado.
- Given un commit que rompe una prueba
  When termina la validación
  Then el PR la muestra como fallida, con acceso al detalle del error.

**US-002** [P1] Como dueño del producto, quiero que lo fusionado en la rama principal se publique solo
para que los usuarios vean la última versión sin pasos manuales.

- Given un cambio con la validación aprobada
  When se fusiona en `master`
  Then la nueva versión queda disponible en la URL de producción sin intervención manual.
- Given un cambio cuya validación falla en `master`
  When termina la validación
  Then no se publica y producción sigue mostrando la versión anterior.

**US-003** [P2] Como revisor, quiero una URL de vista previa por cada PR para probar el cambio en
un entorno real antes de aprobarlo.

- Given un PR abierto
  When su versión se genera correctamente
  Then el PR muestra un enlace a una vista previa funcional, distinta de producción.

**US-004** [P3] Como visitante del repositorio, quiero ver en el README el estado de la validación y
el enlace a la app publicada, para saber si el proyecto está sano y dónde probarlo.

- Given el README en GitHub
  When lo abro
  Then veo el estado de la última validación de `master` y el enlace a producción.

## Criterios de aceptación
<!-- Condiciones verificables. Si no son verificables, no son criterios. -->
- [x] AC1 — El 100 % de los PR hacia `master` muestran el resultado de la validación antes de poder fusionarse.
  Evidencia: PR #2 y PR #3 muestran el check `validate`.
- [x] AC2 — Un PR con una prueba fallida queda marcado como fallido.
  Evidencia: PR #3 (temporal) — `validate` en rojo: "expected 'hello' to be 'hello-broken-on-purpose'" (1 fallida, 38 aprobadas).
- [x] AC3 — Un merge a `master` con la validación aprobada está visible en producción en menos de 5 minutos, sin pasos manuales.
  Evidencia: PR #2 fusionado a las 19:11:00 UTC (merge 290357f); estado "Vercel" en `success` del despliegue de producción a las
  19:11:13 UTC (13 s); `validate` en `master` en verde (19:11:05 → 19:11:26). El código de la app no cambió en esta HU, así que
  el bundle publicado es idéntico: la evidencia es el despliegue registrado, no un cambio visible.
- [x] AC4 — Un cambio con la validación fallida nunca llega a producción.
  Evidencia: PR #3 con `mergeStateStatus: BLOCKED` por el ruleset sin bypass; se cerró sin fusionar.
  No se intentó forzar el merge, para no arriesgar producción.
- [x] AC5 — La validación de un PR termina en menos de 5 minutos.
  Evidencia: 19 s, 21 s y 41 s en las tres ejecuciones.
- [x] AC6 — No hay tokens ni credenciales en el repositorio.
  Evidencia: `git grep` de patrones de token, secreto, clave o contraseña sin resultados; la integración de Vercel no usa secretos en GitHub.

### Criterios de éxito
- El desarrollador puede saber si un PR es seguro de fusionar sin ejecutar nada en local.
- El usuario final puede ver un cambio fusionado en producción en menos de 5 minutos.
- Ningún cambio que rompa las pruebas llega a producción.

### Dependencias
- Cuenta de Vercel y proyecto vinculado al repositorio: la crea y conecta el humano.
- La protección de rama en GitHub (exigir validación antes de fusionar) la configura el dueño del repo.
- Las pruebas no dependen de la red (ya se cumple), condición para una validación estable.

### Complejidad
**baja** — app estática, sin variables de entorno obligatorias, pruebas rápidas y sin red.

## Clarificaciones
- P1: ¿Quién publica en producción? → La integración de Vercel con GitHub. FR-003 se garantiza porque
  `master` solo acepta cambios por PR con la validación aprobada (P3). Sin tokens en GitHub (FR-006).
- P2: ¿Las vistas previas por PR entran en el alcance? → Sí; las genera la misma integración de Vercel (US-003 / FR-005).
- P3: ¿Se bloquea el merge a `master` si la validación falla? → Sí, con protección de rama que exige la validación
  aprobada. La activa el dueño del repo en GitHub, siguiendo pasos documentados.

## Supuestos
- S1: La validación corre en GitHub Actions (el repositorio está en GitHub) — revertible si se prefiere otro proveedor.
- S2: La rama de producción es `master` — revertible si se renombra a `main`.
- S3: La validación usa la misma versión de Node que el entorno local y Vercel (22.x LTS) — revertible si Vercel exige otra.
- S4: La protección de rama también aplica a administradores, para que nadie publique en producción saltándose la validación — revertible si el dueño necesita pushes directos de emergencia.

## Plan técnico

### Análisis del código existente
- App estática Vite 8 + React 18; scripts `test:run` (Vitest, 39 tests sin red) y `build` (genera `dist/`).
- Gestor de paquetes pnpm 11.1.2 en local, lockfile `pnpm-lock.yaml` (formato v9). `package.json` no declara `packageManager` ni `engines`.
- No existe `.github/`, `vercel.json` ni `.nvmrc`. No hay variables de entorno obligatorias (`VITE_DICTIONARY_API_URL` es opcional).
- No hay secretos versionados.

### 1. Solución técnica
- **Validación (CI):** workflow de GitHub Actions `CI`, job `validate`, que se dispara en `pull_request` hacia `master`
  y en `push` a `master`. Pasos: checkout → instalar pnpm (versión de `packageManager`) → Node desde `.nvmrc`
  con caché de pnpm → `pnpm install --frozen-lockfile` → `pnpm test:run` → `pnpm build`.
  `permissions: contents: read`, `timeout-minutes: 10` y `concurrency` que cancela ejecuciones viejas del mismo PR.
- **Publicación (CD):** integración GitHub de Vercel (P1). Producción = `master`; cada PR recibe una vista previa (P2).
  Vercel detecta Vite: build `pnpm build`, salida `dist`, Node 22.x. No requiere `vercel.json`.
- **Bloqueo de merge:** protección de rama en `master` que exige PR y el check `validate` aprobado, sin excepciones
  para administradores (P3, S4).

### 2. Archivos existentes que cambian
- `package.json`: agregar `"packageManager": "pnpm@11.1.2"`, para que CI (y Corepack) usen la misma versión de pnpm que en local.
- `README.md`: badge de estado del workflow, enlace a producción y sección "CI/CD" con los pasos manuales de configuración.

### 3. Archivos nuevos
- `.github/workflows/ci.yml`: el workflow de validación (US-001).
- `.nvmrc` (`22`): una sola fuente de la versión de Node para CI y desarrolladores (S3).

### 4. Flujo
1. Se abre o actualiza un PR → GitHub Actions ejecuta `validate` y Vercel genera la vista previa → ambos aparecen como checks en el PR.
2. La protección de rama impide fusionar mientras `validate` no esté aprobado.
3. Merge a `master` → Vercel publica en producción; Actions vuelve a validar `master` (alimenta el badge).

### 5. Estrategia de pruebas
| Verificación | Criterio de aceptación |
|--------------|------------------------|
| `pnpm install --frozen-lockfile && pnpm test:run && pnpm build` en local con Node 22 | Base de la validación |
| El PR de esta HU muestra `validate` en verde y su duración | AC1, AC5 |
| PR temporal con un test roto a propósito → `validate` en rojo y merge bloqueado; luego se cierra sin fusionar | AC2, AC4 |
| El PR muestra la URL de vista previa de Vercel y la app funciona en ella | US-003 |
| Tras el merge, la URL de producción muestra el cambio en < 5 min | AC3 |
| `git grep` sin tokens ni credenciales | AC6 |

### 6. Radio de impacto
- No cambia código de la aplicación. `packageManager` solo afecta la versión de pnpm usada por herramientas.
- Con la protección de rama activa, nadie (ni el dueño) podrá hacer push directo a `master`.

### 7. Decisiones de arquitectura
- Requiere un ADR nuevo: "CI con GitHub Actions + CD con la integración GitHub de Vercel, con protección de rama".
  También hay que actualizar `specs/tech-stack.md §Infraestructura` (Deploy y CI/CD pasan de "se configura en HU-001" a configurados).
  Se propondrá en la fase close, con aprobación.

### 8. Conformidad con constitution.md
- Principio 4 (sin secretos): se cumple; la integración de Vercel no necesita tokens en GitHub.
- Principio 5 (tests sin red): se cumple; la validación no depende de APIs externas.
- Convención de commits: `ci:` y `docs:`.

### 9. Advertencias
- **Pasos manuales del humano** (no los puede hacer el agente):
  - H1: crear la cuenta o proyecto en Vercel e importar `chaquen/DictionaryUIReact`.
  - H2: activar la protección de rama en GitHub. Alternativa: el agente la configura con `gh api`, con permiso explícito.
- **Versión de pnpm en Vercel:** Vercel elige pnpm según el lockfile. Si la instalación falla en la vista previa,
  habrá que activar Corepack en Vercel (`ENABLE_EXPERIMENTAL_COREPACK=1`). Se verifica en el PR de esta HU.
- **Versión de Node:** en local se usa Node 24 y en CI/Vercel Node 22 (S3). Las pruebas deben pasar en ambas.
- **Sin linter:** la validación solo cubre tests y build (restricción conocida).
- Depende de los supuestos S1–S4.

## Tareas atómicas
<!-- Una tarea = un commit lógico. Generadas en fase /sdd-tasks. -->

### Setup
- [x] [T-001] [P] Fijar la versión de Node — `.nvmrc`
  Done cuando: `.nvmrc` contiene `22` y la suite pasa con Node 22.
- [x] [T-002] [P] Declarar el gestor de paquetes — `package.json` (`packageManager`)
  Done cuando: `pnpm install --frozen-lockfile` termina sin modificar `pnpm-lock.yaml`.

### US-001 — Validación de PR (P1)
- [x] [T-003] [US-001] Crear el workflow de validación — `.github/workflows/ci.yml`
  Done cuando: el YAML es válido y, en el PR de esta HU, el check `validate` ejecuta tests y build en verde.
  Evidencia: PR #2 — check `validate` en verde en 19 s (run 44367091528, 2026-11-18).

### US-002 / US-003 — Publicación y vistas previas (P1 / P2) — pasos humanos
- [x] [T-004] [US-002] [US-003] (Humano, H1) Importar el repositorio en Vercel
  Done cuando: el PR muestra la URL de vista previa y existe la URL de producción de `master`.
  Evidencia: el humano importó el repo; producción en https://dictionary-ui-react.vercel.app responde 200 y una búsqueda real
  ("hello") muestra resultados en 718 ms. El PR #2 muestra el check "Vercel" en verde y un comentario con la URL de vista previa
  (protegida con inicio de sesión de Vercel).
- [x] [T-005] [US-002] (Humano, H2, o el agente con permiso explícito) Protección de rama en `master`
  Done cuando: un PR con `validate` en rojo no se puede fusionar, ni siquiera por administradores.
  Evidencia: ruleset "master protection" (id 27571303), activo y sin bypass, configurado por el agente con `gh api` y con permiso del humano:
  exige PR, check `validate` aprobado, bloquea force push y borrado de `master`. La prueba de bloqueo con un test roto queda en T-007.

### US-004 — Estado visible en el README (P3)
- [x] [T-006] [US-004] Badge, enlace a producción y sección CI/CD — `README.md`
  Done cuando: el README muestra el badge del workflow, el enlace a producción y los pasos H1/H2.
  Evidencia: badge, enlace a producción y pasos H1/H2 en el README.

### Polish
- [x] [T-007] Verificación end-to-end de los criterios de aceptación
  Done cuando: AC1–AC6 marcados con evidencia (PR temporal con test roto cerrado sin fusionar, tiempos medidos).
  Evidencia: AC1–AC6 marcados en §Criterios de aceptación.

Total tareas: 7
Paralelizables: 2 (T-001, T-002)
Por user story: US-001 (1), US-002 (2), US-003 (1, compartida con T-004), US-004 (1)
MVP mínimo: T-001, T-002, T-003 (validación de PR funcionando end-to-end)

## Riesgos identificados
<!-- Qué puede salir mal. Ordenados por probabilidad × impacto. -->
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Push directo a `master` publica sin validar | Baja | Alto | Protección de rama sin excepciones (S4) |
| Vercel publica aunque la validación de `master` falle tras el merge | Baja | Medio | Solo entran PR validados; revertir el merge si ocurre |
| Versión de Node distinta entre local, CI y Vercel | Baja | Medio | Fijar la misma versión en los tres entornos |

## Contexto relevante de specs/
<!-- Qué secciones de specs/ aplican directamente a este feature. -->
- [x] constitution.md §Principios de diseño 4 y 5, §Convenciones (commits)
- [x] tech-stack.md §Runtime (Node, pnpm), §Infraestructura (Deploy, CI/CD)
- [x] structure.md §Puntos de entrada (test, prod)

## Decisiones tomadas durante implementación
<!-- Log de micro-decisiones para no repetir discusiones. -->
| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Acciones en sus últimas versiones mayores: `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6` | Versiones anteriores (v4) | Runtime de Node vigente en los runners |
| La versión de pnpm se toma de `packageManager` y la de Node de `.nvmrc` | Fijarlas dentro del workflow | Una sola fuente de verdad para local, CI y Corepack |
| La protección de rama se documenta como *ruleset* de GitHub | Regla clásica de *branch protection* | Los rulesets son el mecanismo actual y permiten bloquear el bypass a administradores |
| Las vistas previas de Vercel quedan protegidas con Vercel Authentication (valor por defecto) | Hacerlas públicas | Solo los miembros del equipo de Vercel pueden abrirlas; la URL aparece en el PR (US-003) |
| Ruleset con 0 aprobaciones de revisión requeridas | Exigir 1 aprobación | Proyecto de un solo desarrollador: con 1 aprobación nadie podría fusionar sus propios PR |
| T-001/T-002 verificados con Node 22.23.5 en local: 39 tests y build OK, lockfile sin cambios | — | Evidencia del "Done cuando" |
