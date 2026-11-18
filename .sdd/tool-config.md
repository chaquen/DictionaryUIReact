# Tool Configuration

tool: Claude Code
configured: 2026-11-18
project_type: brownfield

## Capabilities

context_autoload: file:CLAUDE.md
filesystem_read: yes
filesystem_write: yes
slash_commands: yes:.claude/commands/
session_persistence: file

## Layer 1 — Requerido

- specs_complete: yes
- context_file_updated: yes — CLAUDE.md

## Layer 2 — Recomendado

- rules_file: no — las convenciones viven en specs/constitution.md §Convenciones
- slash_commands_installed: pending
- skills_installed: pending

## Layer 3 — Opcional

story_source: texto

## MCP Servers
ninguno configurado para este proyecto

## Hooks
ninguno configurado

## Cómo iniciar una sesión

Abre Claude Code en la raíz del proyecto. `CLAUDE.md` se carga solo e indica leer `specs/` y `plans/current.md`.

## Cómo invocar cada fase

Hasta instalar los slash commands, pide la fase por su nombre y el agente sigue el prompt correspondiente.

| Fase      | Cómo invocarla |
|-----------|----------------|
| specify   | "fase specify: <feature>" → `.sdd/prompts/01-specify.md` |
| clarify   | "fase clarify" → `.sdd/prompts/02-clarify.md` |
| plan      | "fase plan" → `.sdd/prompts/03-plan.md` |
| tasks     | "fase tasks" → `.sdd/prompts/04-tasks.md` |
| implement | "implementa T-NNN" → `.sdd/prompts/05-implement.md` |
| bug       | "fase bug: <descripción>" → `.sdd/prompts/06-bug.md` |
| close     | "fase close" → `.sdd/prompts/07-close.md` |
