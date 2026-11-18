# Prompt: Tasks

**Fase:** 4 de 5 — Descomposición en tareas atómicas
**Input requerido:** `plans/current.md` en estado `plan`
**Output:** Lista de tareas atómicas en `plans/current.md`, estado `tasks`

---

## Prompt

Lee `plans/current.md`.

Verifica que `plans/current.md §Feature en curso` tenga `**Plan aprobado:**` con fecha.
Si no lo tiene, **detente** y responde: "El plan no ha sido aprobado. Ejecuta o termina la fase plan primero."

El plan técnico está aprobado. Descompónlo en tareas atómicas organizadas por fases.

### Fases

Organiza las tareas en este orden:

1. **Setup** — estructura de directorios, dependencias, configuración inicial.
2. **Foundational** — infraestructura bloqueante que otras tareas necesitan (DB, auth, modelos base). Debe completarse antes de las user stories.
3. **User Stories** — una fase por cada user story, en orden de prioridad (P1 primero). Cada user story debe ser independientemente implementable.
4. **Polish** — validaciones cross-cutting, logging, manejo de errores global, cleanup.

### Reglas para tareas atómicas

- Completable en una sola sesión (< 2 horas).
- Produce un estado funcional del código (no deja el sistema roto).
- Corresponde lógicamente a un commit.
- Tiene criterio de "done" claro y verificable.

### Formato de cada tarea

```text
- [ ] [T-NNN] [P?] [US-N?] Título de la tarea — archivo/módulo afectado
  Done cuando: criterio verificable en una línea
```

**Marcadores:**

- `[P]` — tarea paralelizable: no depende de otras tareas pendientes en la misma fase, trabaja sobre archivos distintos.
- `[US-N]` — user story a la que pertenece (US-001, US-002, etc.). Obligatorio en fases de user stories.

**Ejemplos:**

```text
- [ ] [T-001] Crear estructura de directorios según plan
  Done cuando: árbol de carpetas existe y está commiteado

- [ ] [T-005] [P] Implementar middleware de autenticación — src/middleware/auth.cs
  Done cuando: middleware rechaza requests sin token válido (test unitario pasa)

- [ ] [T-012] [P] [US-001] Crear modelo User — src/models/User.cs
  Done cuando: modelo persiste y recupera usuario con todos sus campos

- [ ] [T-014] [US-001] Implementar UserService — src/services/UserService.cs
  Done cuando: servicio crea, lee, actualiza y elimina usuarios (tests pasan)
```

### Al final

Agrega un resumen:

```text
Total tareas: N
Paralelizables: N
Por user story: US-001 (N tareas), US-002 (N tareas), ...
MVP mínimo: tareas necesarias para que US-001 funcione end-to-end
```

Actualiza `plans/current.md §Tareas`. Cambia estado a `tasks`.
