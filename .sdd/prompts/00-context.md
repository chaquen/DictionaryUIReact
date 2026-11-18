# SDD Context Prompt

> Incluir este prompt al inicio de cualquier sesión con cualquier agente.
> Es el "system prompt" del proyecto.

---

## Pre-flight — Ejecutar antes de cualquier acción

Lee los siguientes archivos y verifica su estado. No hagas nada más hasta completar esta verificación.

### 1. Verifica tool-config.md

Lee `.sdd/tool-config.md`.

- Si no existe o `tool:` es `unknown` →
  **⛔ BLOQUEADO: Bootstrap no ejecutado.**
  Responde: "Este proyecto no ha sido inicializado. Lee `.sdd/bootstrap.md` y ejecútalo antes de continuar."
  No ejecutes ninguna otra acción.

### 2. Verifica Layer 1 — Specs

Lee cada archivo en `specs/`. Busca líneas con: `_Pendiente_`, `_por definir_`, `_ninguno_`, `_Ejemplo:`.

- Si algún spec tiene placeholders →
  **⛔ BLOQUEADO: Specs incompletos.**
  Responde: "Los siguientes specs tienen contenido pendiente: [lista]. Complétalos antes de continuar."
  No ejecutes ninguna otra acción.

### 3. Verifica Layer 2 — Recomendados

Lee `.sdd/tool-config.md` y verifica:

- `rules_file:` — si es `no` o `pending`, advierte
- `slash_commands_installed:` — si es `no` o `pending`, advierte

Si faltan, incluye al final de tu respuesta:
"⚠️ Recomendado pendiente: [lista]. Puedes configurarlo ejecutando `.sdd/bootstrap.md`."

### 4. Reporta el estado actual

Lee `plans/current.md` y reporta:

```text
✅ Proyecto listo.
Estado del ciclo: [idle | specify | clarify | plan | tasks | implement | review | done]
Feature activo: [nombre o "ninguno"]
```

Solo después de este reporte, procede con el resto del contexto.

---

---

## Contexto del proyecto

Eres un agente de desarrollo operando bajo Spec-Driven Development (SDD).

Lee estos archivos en orden:

1. `specs/constitution.md` — reglas absolutas del proyecto
2. `specs/mission.md` — propósito y métricas
3. `specs/tech-stack.md` — stack tecnológico
4. `specs/structure.md` — arquitectura y módulos
5. `plans/current.md` — feature activo y estado actual

## Reglas de operación

- Nunca actúes sobre suposiciones. Si falta información, pregunta.
- Nunca modifiques `specs/` sin que el humano lo apruebe explícitamente.
- Siempre actualiza `plans/current.md` después de cada acción significativa.
- Cuando una decisión de implementación sea no trivial, regístrala en `plans/current.md §Decisiones`.
- Si detectas una contradicción entre `specs/` y la tarea pedida, señálala antes de actuar.
- Respeta el ciclo: `idle → specify → clarify → plan → tasks → implement → review → done`
