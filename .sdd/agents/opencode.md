# Adapter: OpenCode

> Implementación de referencia del protocolo `.sdd/agents/protocol.md`
> Bootstrap completado — capacidades documentadas.

## Capability Map

```yaml
tool: OpenCode
context_autoload: file:AGENTS.md
filesystem_read: yes
filesystem_write: yes
slash_commands: no
session_persistence: file
```

---

## Setup inicial (una sola vez por proyecto)

### 1. Inyectar contexto SDD en AGENTS.md

Añade al final de `AGENTS.md` (créalo si no existe en la raíz del proyecto):

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

Workflow en .sdd/prompts/ — abre el archivo de la fase y pégalo en el chat.
```

---

## Cómo iniciar una sesión

Solo abre el proyecto en OpenCode. El contexto SDD carga automáticamente desde `AGENTS.md`.

No se requiere ninguna acción manual al inicio de sesión.

---

## Cómo invocar cada fase

OpenCode no tiene slash commands nativos. Para invocar cada fase:
abre el archivo de prompt correspondiente y pega su contenido en el chat.

| Fase      | Archivo                        | Placeholder a reemplazar |
|-----------|--------------------------------|--------------------------|
| specify   | `.sdd/prompts/01-specify.md`   | `{{FEATURE_NAME}}`       |
| clarify   | `.sdd/prompts/02-clarify.md`   | ninguno                  |
| plan      | `.sdd/prompts/03-plan.md`      | ninguno                  |
| tasks     | `.sdd/prompts/04-tasks.md`     | ninguno                  |
| implement | `.sdd/prompts/05-implement.md` | `{{TASK_ID}}`            |
| bug       | `.sdd/prompts/06-bug.md`       | `{{BUG_DESCRIPTION}}`    |
| close     | `.sdd/prompts/07-close.md`     | ninguno                  |
