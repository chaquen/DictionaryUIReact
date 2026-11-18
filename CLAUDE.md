# DictionaryUIReact

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

Workflow en .sdd/prompts/ — usa el prompt correspondiente a cada fase (ver .sdd/tool-config.md).
