# SDD Bootstrap — Inicialización de Proyecto

Eres un agente de IA ejecutando la inicialización de SDD en este proyecto.
Sigue los pasos en orden estricto. No avances al siguiente paso sin completar el actual.
Ante cualquier duda, pregunta — nunca asumas.

---

## Paso 1 — Identifícate y detecta capacidades

Responde:

1. ¿En qué herramienta estás corriendo? (Claude Code, OpenCode, Cursor, Antigravity, otro)
2. ¿Tienes acceso de lectura al filesystem de este proyecto?
3. ¿Tienes acceso de escritura?
4. ¿Esta herramienta carga automáticamente algún archivo de contexto al iniciar sesión?
   Si sí: ¿qué archivo? Si no sabes con certeza, di que no sabes.
5. ¿Tienes slash commands o shortcuts invocables? ¿Dónde viven sus archivos?
6. ¿Recuerdas contexto entre sesiones de forma autónoma?

**Si no sabes algo con certeza, dilo. No asumas.**

---

## Paso 2 — Detecta si ya fue inicializado

Lee `.sdd/tool-config.md`.

- Si existe y `tool:` no es `unknown` → reporta: "Este proyecto ya fue inicializado para [herramienta] el [fecha]. ¿Quieres reinicializar?"
  - Si sí: continúa al Paso 3
  - Si no: detente aquí
- Si no existe o está vacío → continúa al Paso 3

---

## Paso 3 — Detecta el tipo de proyecto

Analiza el contenido del directorio. Busca archivos fuera de estas carpetas:
`.sdd/`, `specs/`, `plans/`, `.git/`, y archivos como `README.md`.

**Greenfield** si no encuentras ningún archivo de código, configuración técnica,
o documentación de producto fuera de esas rutas.

**Brownfield** si encuentras código fuente, archivos de configuración técnica
(package.json, requirements.txt, Dockerfile, etc.), o documentación técnica existente.

Declara el tipo antes de continuar.

---

## Paso 4 — Valida Layer 1 (Requerido)

Lee `.sdd/layers.md` para la definición completa.

Verifica cada spec buscando líneas con: `_Pendiente_`, `_por definir_`, `_ninguno_`, `_Ejemplo:`.

| Archivo                  | ¿Completo? |
|--------------------------|------------|
| `specs/constitution.md`  | sí / no    |
| `specs/mission.md`       | sí / no    |
| `specs/tech-stack.md`    | sí / no    |
| `specs/structure.md`     | sí / no    |

### Si algún spec está incompleto

**→ Greenfield:**
Lista exactamente qué archivos y secciones faltan.
Indica al humano: "Completa los specs antes de continuar. Sin esta información
no puedo garantizar que el trabajo esté alineado con el proyecto."
Espera confirmación de que fueron completados. No continues hasta recibirla.

**→ Brownfield:**
Analiza el código existente e infiere el contenido de cada spec vacío.
Para cada spec incompleto, propón el contenido basándote en lo que encuentres.
Presenta la propuesta al humano con este formato:

```text
## Propuesta de specs inferidos del código

### specs/constitution.md — secciones faltantes
[contenido propuesto]

### specs/mission.md
[contenido propuesto]

¿Apruebas estos specs o quieres corregir algo antes de que los escriba?
```

Solo escribe los archivos después de recibir aprobación explícita.

---

## Paso 5 — Valida Layer 2 (Recomendado)

Verifica:

1. **Rules file**: ¿existe `.rules.md` en la raíz, o hay una sección "Rules" en el archivo de contexto de la herramienta?
2. **Skills/Commands**: según tus capacidades del Paso 1, ¿los comandos SDD están instalados?

Para cada ítem ausente, pregunta:
"¿Quieres configurar [ítem] ahora o prefieres hacerlo después?"

**Si quiere configurar ahora:**

- **Rules**: pide al humano sus convenciones principales (naming, tests, commits, etc.)
  y crea `.rules.md` con ese contenido.
  
- **Skills/Commands**: si tienes slash commands, instala los 7 prompts SDD:

  ```text
  <path>/sdd-specify.md   ← .sdd/prompts/01-specify.md
  <path>/sdd-clarify.md   ← .sdd/prompts/02-clarify.md
  <path>/sdd-plan.md      ← .sdd/prompts/03-plan.md
  <path>/sdd-tasks.md     ← .sdd/prompts/04-tasks.md
  <path>/sdd-implement.md ← .sdd/prompts/05-implement.md
  <path>/sdd-bug.md       ← .sdd/prompts/06-bug.md
  <path>/sdd-close.md     ← .sdd/prompts/07-close.md
  ```

**Si prefiere después:** registra `pending` en tool-config.md.

---

## Paso 6 — Descubre y sugiere skills

Lee todos los archivos `.md` en `.sdd/skills/` (excluye `README.md`).
Para cada archivo, lee el frontmatter `name`, `description`, y `tags`.

Lee `specs/tech-stack.md` e identifica las tecnologías principales del proyecto.

Cruza los tags de cada skill con el stack detectado y asigna relevancia:

- Tag `universal` → relevancia **Alta**
- Tag coincide con tecnología del stack → relevancia **Alta**
- Tag no coincide → relevancia **Baja**

Presenta la lista al humano con este formato:

```text
## Skills disponibles para este proyecto

| Skill            | Descripción                        | Relevancia |
|------------------|------------------------------------|------------|
| sdd-review       | Revisión de código antes de commit | Alta       |
| sdd-refactor     | Mejora código sin cambiar behavior | Alta       |
| sdd-explain      | Explica código en contexto         | Alta       |
| [otros si existen] | ...                              | ...        |

¿Cuáles quieres instalar? Responde "todos", "ninguno", o lista los nombres.
```

**Si el humano aprueba skills:**

- Si la herramienta tiene slash commands (`slash_commands = yes:<path>`):
  copia los archivos aprobados a `<path>/` con el nombre del skill como nombre de archivo.
- Si no tiene slash commands:
  documenta en tool-config.md cómo invocar cada skill manualmente (pegar el contenido).

**Si prefiere después:** registra `skills_installed: pending` en tool-config.md.

---

## Paso 7 — Informa Layer 3 (Opcional)

Verifica si existen:

- Configuración de MCP servers (`.mcp.json`, settings del agente, o similar)
- Configuración de hooks

Reporta lo que encuentres sin preguntar ni bloquear.
Si no encuentras nada, informa que están disponibles como extensiones opcionales.

**Fuente de historias de usuario.** Pregunta una sola vez, sin bloquear:
"¿De dónde vienen normalmente tus historias de usuario? (Jira u otro gestor / archivos Word, Excel o PDF / texto libre)".

- Gestor de tickets → verifica si hay un MCP de ese gestor conectado. Si lo hay, regístralo en
  `## MCP Servers` de `tool-config.md` indicando que se usa para `/sdd-specify`. Si no lo hay,
  informa que `/sdd-specify` funcionará con texto pegado y que el adapter de la herramienta explica
  cómo conectarlo (por ejemplo `.sdd/agents/claude-code.md §6`). No lo instales sin aprobación.
- Archivos → no requiere configuración; `/sdd-specify` los lee del filesystem si `filesystem_read: yes`.
- Texto libre → no requiere configuración.

Registra la respuesta en `tool-config.md` como `story_source: jira | archivos | texto | <otro>`.

---

## Paso 8 — Configura el archivo de contexto de la herramienta

Basándote en las capacidades del Paso 1:

**Si `context_autoload = file:<path>`:**

Agrega al archivo `<path>` la siguiente sección SDD:

```markdown
## Spec-Driven Development (SDD)

Lee siempre antes de actuar:
- specs/constitution.md — reglas absolutas del proyecto
- specs/mission.md — propósito y métricas
- specs/tech-stack.md — stack tecnológico
- specs/structure.md — arquitectura y módulos
- plans/current.md — feature activo y estado del ciclo

Reglas operativas:
- Nunca actúes sobre suposiciones. Si falta información, pregunta.
- Nunca modifiques specs/ sin aprobación explícita del humano.
- Siempre actualiza plans/current.md después de cada acción significativa.
- Si detectas contradicción entre specs/ y la tarea pedida, señálala antes de actuar.
- Respeta el ciclo: idle → specify → clarify → plan → tasks → implement → review → done
```

**Si `context_autoload = none`:**

Indica: "**ACCIÓN REQUERIDA:** Al inicio de cada sesión pega `.sdd/prompts/00-context.md`."

---

## Paso 9 — Genera `.sdd/tool-config.md`

Crea el archivo con todo lo detectado y configurado:

```markdown
# Tool Configuration

tool: {{TOOL_NAME}}
configured: {{FECHA}}
project_type: greenfield | brownfield

## Capabilities

context_autoload: {{file:<path> | none}}
filesystem_read: {{yes | no}}
filesystem_write: {{yes | no}}
slash_commands: {{yes:<path> | no}}
session_persistence: {{yes | file | no}}

## Layer 1 — Requerido

- specs_complete: {{yes | no}}
- context_file_updated: {{yes — <path> | no — manual required}}

## Layer 2 — Recomendado

- rules_file: {{yes — <path> | no | pending}}
- slash_commands_installed: {{yes — <path> | no | pending}}

## Layer 3 — Opcional

## MCP Servers
{{lista o "ninguno configurado"}}

## Hooks
{{lista o "ninguno configurado"}}

## Cómo iniciar una sesión

{{instrucciones específicas para esta herramienta}}

## Cómo invocar cada fase

| Fase      | Cómo invocarla |
|-----------|----------------|
| specify   | {{comando o instrucción}} |
| clarify   | {{comando o instrucción}} |
| plan      | {{comando o instrucción}} |
| tasks     | {{comando o instrucción}} |
| implement | {{comando o instrucción}} |
| bug       | {{comando o instrucción}} |
| close     | {{comando o instrucción}} |
```

---

## Paso 10 — Reporte final

```text
## SDD Bootstrap completado

Herramienta: {{TOOL_NAME}}
Tipo de proyecto: Greenfield | Brownfield

Layer 1 — Requerido:
  ✅/❌ specs/constitution.md
  ✅/❌ specs/mission.md
  ✅/❌ specs/tech-stack.md
  ✅/❌ specs/structure.md
  ✅/❌ tool-config.md generado

Layer 2 — Recomendado:
  ✅/⚠️ Rules file
  ✅/⚠️ Skills/Commands SDD

Layer 3 — Opcional:
  ✅/➖ MCP Servers
  ✅/➖ Hooks

Estado: LISTO | ADVERTENCIA | BLOQUEADO

{{Si LISTO o ADVERTENCIA:}}
Para empezar el primer feature: {{instrucción específica para invocar specify}}

{{Si BLOQUEADO:}}
Completa los items marcados con ❌ antes de continuar.
```
