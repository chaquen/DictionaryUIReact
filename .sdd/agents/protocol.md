# SDD Tool Capability Protocol

Define el contrato que todo agente debe cumplir para operar bajo SDD.
Los adapters son implementaciones de este protocolo para herramientas conocidas.
El bootstrap detecta estas capacidades automáticamente en herramientas nuevas.

---

## Capacidades requeridas

### CONTEXT_AUTOLOAD
¿El agente carga un archivo de contexto automáticamente al iniciar sesión?

| Valor | Descripción |
|-------|-------------|
| `file:<path>` | Lee el archivo en esa ruta (ej: `file:CLAUDE.md`, `file:AGENTS.md`) |
| `none` | No hay autoload — el contexto debe pasarse manualmente cada sesión |

**Impacto en SDD:** Si es `file:<path>`, la sección SDD se inyecta en ese archivo una sola vez y el agente la lee en cada sesión. Si es `none`, el usuario debe pegar `00-context.md` al inicio de cada sesión.

---

### FILESYSTEM_READ / FILESYSTEM_WRITE
¿El agente puede leer y/o escribir archivos del proyecto?

| Valor | Descripción |
|-------|-------------|
| `yes` | Acceso directo al filesystem |
| `no` | Solo puede recibir contenido via copy-paste |

**Impacto en SDD:** Si `FILESYSTEM_WRITE=no`, el agente genera el contenido correcto pero el usuario debe pegarlo manualmente en los archivos.

---

### SLASH_COMMANDS
¿El agente soporta comandos slash (`/comando`)?

| Valor | Descripción |
|-------|-------------|
| `yes:<path>` | Soporta slash commands; los archivos viven en `<path>` (ej: `yes:.claude/commands/`) |
| `no` | Sin slash commands — los prompts se invocan pegando manualmente |

**Impacto en SDD:** Si es `yes:<path>`, el bootstrap instala los 6 prompts SDD como slash commands en esa ruta.

---

### SESSION_PERSISTENCE
¿El agente recuerda el contexto entre sesiones sin intervención?

| Valor | Descripción |
|-------|-------------|
| `yes` | Memoria persistente entre sesiones |
| `file` | Persiste si hay un archivo de contexto autoload |
| `no` | Cada sesión empieza de cero |

**Impacto en SDD:** Si es `no`, el usuario siempre debe iniciar la sesión con `00-context.md`.

---

## Capability Map

Una vez detectadas, las capacidades se registran en `.sdd/tool-config.md`:

```yaml
tool: <nombre>
context_autoload: file:CLAUDE.md | none
filesystem_read: yes | no
filesystem_write: yes | no
slash_commands: yes:.claude/commands/ | no
session_persistence: yes | file | no
```

---

## Comportamiento mínimo exigido a todo agente SDD

Independientemente de sus capacidades técnicas, cualquier agente operando bajo SDD debe:

1. **Leer `plans/current.md`** antes de cualquier acción (directamente o vía paste)
2. **No modificar `specs/`** sin aprobación explícita del humano
3. **Actualizar `plans/current.md`** después de cada acción significativa
4. **Preguntar** si falta información antes de asumir
5. **Señalar contradicciones** entre `specs/` y la tarea pedida antes de actuar
6. **Respetar el estado del ciclo**: `idle → specify → clarify → plan → tasks → implement → review → done`
