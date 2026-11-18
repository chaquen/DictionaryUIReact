# Prompt: Specify

**Fase:** 1 de 5 — Definición de requisitos
**Input requerido:** Nombre o descripción del feature, o referencia a la fuente (ticket, archivo, texto pegado)
**Output:** `plans/current.md` actualizado con requisitos y criterios de aceptación

---

## Prompt

Lee `specs/constitution.md`, `specs/mission.md`, y `plans/backlog.md`.

Voy a trabajar en el siguiente feature:

```text
{{FEATURE_NAME_OR_DESCRIPTION}}
```

El valor de arriba puede ser una descripción libre **o una referencia a una fuente externa**:
un código de ticket (`PROJ-123`), la ruta de un archivo (Word, Excel, PDF, Markdown) o texto pegado
de una historia de usuario.

### 0. Ingesta de la fuente (solo si el input es una referencia)

Si el input es una descripción libre, salta a la sección 1.

Si es una referencia:

1. **Obtén la fuente con lo que tengas disponible.** Ticket → la herramienta del gestor
   (Jira, Azure DevOps, Linear…) vía MCP si `.sdd/tool-config.md §MCP Servers` la registra.
   Archivo → léelo del filesystem. Si no tienes ninguna forma de obtenerla, **detente** y pide
   que el humano pegue el contenido. Nunca reconstruyas una historia a partir de su título.
2. **Extrae, sin interpretar todavía:**
   - Título y descripción completa
   - Criterios de aceptación tal como están escritos
   - Prioridad y estimación, si existen
   - Subtareas, tickets vinculados y dependencias o bloqueos
   - Comentarios con decisiones o restricciones
   - Adjuntos o enlaces a diseños
3. **Si la historia ya tiene subtareas creadas**, lístalas y pregunta si el feature cubre la
   historia completa o solo las subtareas pendientes.
4. **Registra el origen** al inicio de `plans/current.md`, en una sección `## Origen`
   (créala si no existe):

```markdown
## Origen
- Fuente: [Jira PROJ-123 | archivo docs/hu-pagos.docx | texto pegado]
- Obtenido: [fecha]
- Criterios de aceptación originales: [copiados textualmente]
```

Los FR-### y US-### que escribas en las secciones siguientes deben poder trazarse a esa fuente.
Si agregas un requisito que la fuente no menciona, márcalo como `[INFERIDO]`.

Tu tarea:

### 1. Requisitos funcionales

Lista los requisitos numerados como `FR-001`, `FR-002`, etc. Cada requisito debe:

- Describir **qué** debe hacer el sistema, no cómo.
- Ser verificable: debe poderse confirmar si se cumple o no.
- Estar redactado en términos de negocio, no técnicos.

### 2. User stories con criterios de aceptación

Para cada requisito principal, escribe al menos una user story con este formato:

```markdown
**US-001** [P1/P2/P3] Como [actor], quiero [acción] para [valor].

- Given [estado inicial]
  When [acción del usuario]
  Then [resultado esperado]
```

Prioridad: P1 = bloqueante, P2 = importante, P3 = deseable.

### 3. Criterios de éxito

Define 2–5 métricas medibles y agnósticas a la tecnología que confirmen que el feature cumplió su objetivo.

Formato: "El usuario puede [acción] en [condición medible]."

### 4. Dependencias y riesgos

- Dependencias con otros módulos o features.
- Riesgos o ambigüedades que deben resolverse antes de implementar.

### 5. Estimación de complejidad

`baja / media / alta` — justificación en una línea.

---

### Marcadores de clarificación

Si hay aspectos críticos que no puedes resolver con el contexto disponible, márcalos así:

```text
[NECESITA CLARIFICACIÓN]: descripción de la duda
```

**Límite:** máximo 3 marcadores. Solo para decisiones que afectan arquitectura, seguridad, o alcance — no detalles menores.

---

No escribas código. No propongas soluciones técnicas todavía.

Actualiza `plans/current.md` con el resultado. Cambia el estado a `specify`.
