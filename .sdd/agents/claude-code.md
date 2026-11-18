# Adapter: Claude Code

> Implementación de referencia del protocolo `.sdd/agents/protocol.md`
> Bootstrap completado — capacidades documentadas.

## Capability Map

```yaml
tool: Claude Code
context_autoload: file:CLAUDE.md
filesystem_read: yes
filesystem_write: yes
slash_commands: yes:.claude/commands/
session_persistence: file
```

---

## Setup inicial (una sola vez por proyecto)

### 1. Inyectar contexto SDD en CLAUDE.md

Añade al final de `CLAUDE.md` (créalo si no existe en la raíz del proyecto):

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

Workflow en .sdd/prompts/ — usa el slash command correspondiente a cada fase.
```

### 2. Instalar slash commands

```bash
mkdir -p .claude/commands
cp .sdd/prompts/01-specify.md .claude/commands/sdd-specify.md
cp .sdd/prompts/02-clarify.md .claude/commands/sdd-clarify.md
cp .sdd/prompts/03-plan.md .claude/commands/sdd-plan.md
cp .sdd/prompts/04-tasks.md .claude/commands/sdd-tasks.md
cp .sdd/prompts/05-implement.md .claude/commands/sdd-implement.md
cp .sdd/prompts/06-bug.md .claude/commands/sdd-bug.md
cp .sdd/prompts/07-close.md .claude/commands/sdd-close.md
```

### 3. (Opcional) Instalar el subagente ejecutor

Separa quién planea de quién ejecuta: la conversación principal hace `specify → clarify → plan → tasks`
contigo, y cuando el plan está aprobado, un subagente implementa las tareas en segundo plano sin
llenar la conversación. Es una capacidad de Claude Code: el núcleo del kit no depende de esto.

```bash
mkdir -p .claude/agents
cat > .claude/agents/sdd-executor.md <<'EOF'
---
name: sdd-executor
description: Implementa tareas de plans/current.md cuando el plan ya fue aprobado. Úsalo después de /sdd-tasks, cuando el humano pida implementar varias tareas sin supervisión paso a paso.
tools: Read, Write, Edit, Grep, Glob, Bash
---

Eres el ejecutor de un proyecto bajo Spec-Driven Development.

Antes de escribir código:
1. Lee specs/constitution.md, specs/tech-stack.md y plans/current.md.
2. Verifica que plans/current.md tenga "**Plan aprobado:**" con fecha. Si no lo tiene, detente y repórtalo.

Para cada tarea pendiente, en orden, sigue las reglas de .sdd/prompts/05-implement.md.

Detente y reporta (no improvises) si:
- Una tarea está mal definida o requiere cambiar algo fuera del plan.
- Una prueba falla y la corrección no es obvia.
- Necesitas modificar specs/.

Al terminar, reporta: tareas completadas, archivos modificados, pruebas corridas con su resultado
y lo que quedó pendiente.
EOF
```

Para usarlo: cuando `/sdd-tasks` termine, pide "implementa las tareas con sdd-executor".

### 4. (Opcional) Instalar el subagente revisor

Primera revisión del diff antes de un commit o PR, en segundo plano y de solo lectura. No modifica
archivos: solo reporta. Aplica el skill `.sdd/skills/review.md`.

```bash
mkdir -p .claude/agents
cat > .claude/agents/sdd-reviewer.md <<'EOF'
---
name: sdd-reviewer
description: Revisa solo el diff del cambio actual contra specs/ y plans/current.md antes de un commit o PR. Úsalo cuando el feature llegue a review o antes de pedir revisión humana. Solo lectura.
tools: Read, Grep, Glob, Bash
---

Eres el revisor de un proyecto bajo Spec-Driven Development. Eres de solo lectura:
nunca modificas, creas ni borras archivos, y solo usas Bash para comandos de lectura
(git diff, git log, git status, correr pruebas).

1. Obtén el diff: `git diff <rama base>...HEAD` y `git diff` para cambios sin commitear.
   Si no sabes cuál es la rama base, pregunta.
2. Lee specs/constitution.md y plans/current.md.
3. Aplica las instrucciones de .sdd/skills/review.md sobre ese diff y usa su formato de reporte.
4. Corre la suite de pruebas si el proyecto la tiene y reporta el resultado.
5. Termina con el veredicto: "listo para revisión humana" o "requiere cambios".
EOF
```

Para usarlo: cuando el feature esté en `review`, pide "revisa el diff con sdd-reviewer".

### 5. (Opcional) Instalar el subagente analizador

Verifica la consistencia entre spec, plan y tareas antes de implementar (trazabilidad FR → tareas,
ambigüedades pendientes, conformidad con la constitución). Solo lectura. Aplica el skill
`.sdd/skills/analyze.md`.

```bash
mkdir -p .claude/agents
cat > .claude/agents/sdd-analyzer.md <<'EOF'
---
name: sdd-analyzer
description: Analiza la consistencia entre spec, plan y tareas de plans/current.md antes de implementar. Úsalo después de /sdd-tasks y antes de /sdd-implement. Solo lectura.
tools: Read, Grep, Glob
---

Eres el analizador de consistencia de un proyecto bajo Spec-Driven Development.
Eres de solo lectura: nunca modificas archivos.

1. Lee specs/constitution.md, specs/tech-stack.md, specs/structure.md y plans/current.md.
2. Aplica las instrucciones de .sdd/skills/analyze.md y usa su formato de reporte.
3. Si hay hallazgos CRITICO, termina diciendo claramente que no se debe implementar hasta resolverlos.
EOF
```

Flujo sugerido con los tres subagentes: `/sdd-tasks` → `sdd-analyzer` → `sdd-executor` → `sdd-reviewer` → `/sdd-close`.

### 6. (Opcional) Conectar Jira para la ingesta de historias

`/sdd-specify` puede recibir un código de ticket (`PROJ-123`) y traer la historia completa si hay un
MCP del gestor de tickets conectado. Para Excel, Word o PDF no hace falta MCP: se leen del filesystem.

Atlassian ofrece un MCP remoto oficial. Al momento de escribir esto se conecta así:

```bash
claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse
```

> La URL y el transporte del MCP de Atlassian pueden cambiar. Antes de usarlo, verifícalos en la
> documentación oficial de Atlassian ("Atlassian Remote MCP Server"). La primera vez se abre el
> navegador para autorizar con tu cuenta de Atlassian. Otros gestores (Azure DevOps, Linear,
> GitHub Issues) tienen sus propios MCP: el flujo de `/sdd-specify` es el mismo.

Después de conectarlo, regístralo en `.sdd/tool-config.md`:

```yaml
## MCP Servers
- atlassian: lectura de historias de Jira para /sdd-specify
```

No guardes tokens ni credenciales en `.mcp.json` si ese archivo se versiona.

---

## Cómo iniciar una sesión

Solo abre el proyecto en Claude Code. El contexto SDD carga automáticamente desde `CLAUDE.md`.

No se requiere ninguna acción manual al inicio de sesión.

---

## Cómo invocar cada fase

| Fase      | Comando         | Placeholder a reemplazar |
|-----------|-----------------|--------------------------|
| specify   | `/sdd-specify`  | `{{FEATURE_NAME}}`       |
| clarify   | `/sdd-clarify`  | ninguno                  |
| plan      | `/sdd-plan`     | ninguno                  |
| tasks     | `/sdd-tasks`    | ninguno                  |
| implement | `/sdd-implement`| `{{TASK_ID}}`            |
| bug       | `/sdd-bug`      | `{{BUG_DESCRIPTION}}`    |
| close     | `/sdd-close`    | ninguno                  |
