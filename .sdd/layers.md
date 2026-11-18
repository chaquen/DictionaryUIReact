# SDD Project Layers

Fuente de verdad para bootstrap y pre-flight.
Define qué debe existir en cada capa, cómo detectarlo, y qué hacer si falta.

---

## Layer 1 — Requerido

**Bloquea cualquier trabajo si falta. No hay excepciones.**

| Ítem                    | Cómo verificar que está completo                                               |
|-------------------------|--------------------------------------------------------------------------------|
| `.sdd/tool-config.md`   | El archivo existe y `tool:` no es `unknown`                                    |
| `specs/constitution.md` | Sin líneas con `_Pendiente_`, `_por definir_`, `_ninguno_`, o `_Ejemplo:`      |
| `specs/mission.md`      | Ídem                                                                           |
| `specs/tech-stack.md`   | Ídem                                                                           |
| `specs/structure.md`    | Ídem                                                                           |

### Remediación por tipo de proyecto

**Greenfield** (proyecto nuevo, sin código fuente previo):

- El humano debe llenar los specs manualmente
- El agente no puede inferir lo que no existe
- Flujo: bootstrap detecta vacíos → lista qué falta → espera confirmación humana → continúa

**Brownfield** (proyecto existente con código fuente):

- El agente analiza el código existente e infiere el contenido de los specs
- Propone el contenido para aprobación humana antes de escribir
- Flujo: bootstrap detecta vacíos + código → propone specs → humano aprueba → agente escribe

### Señales para detectar Greenfield vs Brownfield

El agente busca archivos fuera de `.sdd/`, `specs/`, `plans/` y `README.md`.

- Sin archivos externos → **Greenfield**
- Con código, configuración técnica, o documentación de producto → **Brownfield**

---

## Layer 2 — Recomendado

**No bloquea. Genera advertencia y pregunta si el humano quiere configurarlo ahora.**

| Ítem          | Descripción                                          | Señal de ausencia                                    |
|---------------|------------------------------------------------------|------------------------------------------------------|
| Rules file    | Convenciones de código del proyecto                  | No existe `.rules.md` ni sección "Rules" en contexto |
| SDD Commands  | Los 6 prompts SDD instalados como shortcuts          | `slash_commands_installed: no` en tool-config.md     |
| Skills        | Skills adicionales descubiertos y aprobados          | `skills_installed: none` en tool-config.md           |

### Rules

Si el humano quiere configurarlo durante el bootstrap:

- Pedir las convenciones principales (naming, tests, commits, estructura de carpetas)
- Crear `.rules.md` en la raíz del proyecto con ese contenido

Si prefiere después: registrar `pending` en tool-config.md.

### SDD Commands

Instalar los 6 prompts SDD según la ruta de la herramienta (`slash_commands_path` en tool-config.md).
Si la herramienta no tiene slash commands, documentar cómo invocarlos manualmente.

### Skills

Los skills viven en `.sdd/skills/`. El bootstrap los **descubre y sugiere** — nunca instala sin aprobación.

**Flujo de discovery:**

1. Leer todos los archivos `.md` en `.sdd/skills/` (excluir `README.md`)
2. Leer `specs/tech-stack.md`
3. Para cada skill, evaluar relevancia cruzando sus `tags` con el stack detectado
4. Presentar la lista al humano con relevancia estimada
5. Instalar solo los aprobados

**Criterios de relevancia:**

- Tag `universal` → siempre sugerir con alta relevancia
- Tag coincide con tecnología en tech-stack → sugerir con alta relevancia
- Tag no coincide → sugerir con baja relevancia, dejar que el humano decida

Si el humano prefiere después: registrar `skills_installed: pending` en tool-config.md.

---

## Layer 3 — Opcional

**No bloquea, no advierte. Solo informa si está configurado.**

| Ítem        | Descripción                                   | Cómo detectar                                        |
|-------------|-----------------------------------------------|------------------------------------------------------|
| MCP Servers | Herramientas externas conectadas al agente (p. ej. el gestor de tickets que alimenta `/sdd-specify`) | Archivo `.mcp.json` o settings del agente            |
| Subagentes  | Ejecutor, revisor y analizador, si la herramienta los soporta (ver el adapter) | `.claude/agents/` o equivalente de la herramienta    |
| Hooks       | Automatizaciones en eventos del agente        | Archivo `.hooks.json` o settings del agente          |

### Registro

Si están configurados, documentar en `.sdd/tool-config.md`:

```yaml
## MCP Servers
- nombre: descripción y para qué se usa en este proyecto

## Hooks
- evento: qué hace y cuándo se activa
```

---

## Estado del proyecto

El bootstrap y el pre-flight reportan el estado combinando los tres layers:

| Estado        | Condición                              | Acción del agente      |
|---------------|----------------------------------------|------------------------|
| `LISTO`       | Layer 1 completo                       | Proceder normalmente   |
| `ADVERTENCIA` | Layer 1 completo, Layer 2 incompleto   | Proceder con aviso     |
| `BLOQUEADO`   | Layer 1 incompleto                     | Detener toda acción    |
