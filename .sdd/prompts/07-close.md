# Prompt: Close

**Uso:** Cuando el feature en `plans/current.md` está en estado `review` y fue verificado
**Input requerido:** `plans/current.md` en estado `review`
**Output:** Feature archivado en `plans/done/`, `plans/current.md` reseteado a `idle`, siguiente feature sugerido

---

## Prompt

Lee `plans/current.md` y `plans/backlog.md`.

El feature actual está en fase `review`. Antes de cerrarlo a `done`:

### Paso 1 — Confirma que está listo para cerrar

Verifica:

- Todos los criterios de aceptación están marcados `[x]`
- Todas las tareas atómicas están marcadas `[x]`
- No quedan `[NECESITA CLARIFICACIÓN]` sin resolver

Si algo falta, repórtalo y **detente** — no cierres un feature incompleto.

Si hay ítems que quedaron pendientes de verificación manual (por ejemplo, algo que no se pudo probar en este entorno — una integración externa, un servicio que no estaba disponible), pregunta explícitamente:

```text
"[Ítem] no se verificó de forma completa: [detalle].
¿Confirmas que fue probado por tu cuenta y el feature puede cerrarse igual?"
```

Espera confirmación explícita antes de continuar. No asumas que "probablemente funciona".

### Paso 2 — Archiva el feature

- Crea la carpeta `plans/done/` si no existe.
- Copia el contenido completo de `plans/current.md` a `plans/done/<slug-del-feature>.md`
  (slug: nombre del feature en minúsculas, espacios por guiones).
- En la copia archivada, cambia `**Estado:**` a `done` y agrega una línea `**Cerrado:** <fecha>`.

### Paso 3 — Registra decisiones estructurales pendientes

Revisa `plans/current.md §Decisiones tomadas durante implementación`. Si alguna decisión debería
vivir en `specs/` de forma permanente (una convención nueva, una restricción descubierta, un ADR
real), propónla al humano — no la escribas todavía:

```text
## Propuesta: incorporar a specs/

**Archivo:** specs/<archivo>.md §<sección>
**Contenido propuesto:** [...]
**Origen:** decisión tomada durante implementación de [feature]

¿Apruebas incorporarlo a specs/?
```

Solo escribe en `specs/` con aprobación explícita del humano — misma regla que en cualquier otra fase.

### Paso 4 — Resetea el ciclo activo

Reemplaza el contenido de `plans/current.md` por la plantilla vacía: `Estado: idle`, sin feature en
curso, todas las secciones en blanco (usa la plantilla original del kit como referencia).

### Paso 5 — Sugiere el siguiente feature

Lee `plans/backlog.md §Prioridad Alta`.

- Si hay un ítem: repórtalo y pregunta si lo promueves a `plans/current.md` para arrancar `specify`.
- Si `Prioridad Alta` está vacío: repórtalo y espera instrucciones — no promuevas automáticamente
  algo de Prioridad Media.

```text
Feature cerrado: [nombre] → archivado en plans/done/<slug>.md

Siguiente en el backlog (Prioridad Alta): [nombre | "vacío"]
¿Lo promuevo a plans/current.md y empezamos specify?
```

---

No avances a `specify` del siguiente feature sin que el humano lo confirme explícitamente.
