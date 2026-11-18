---
name: sdd-analyze
description: Revisa consistencia entre spec, plan y tasks — detecta gaps, duplicados y violaciones a la constitution
tags: [universal]
---

Lee los siguientes archivos:

- `specs/constitution.md` — reglas no negociables del proyecto
- `plans/current.md` — spec, plan y tareas del feature activo

Este skill hace un análisis de consistencia **solo lectura** — no modifica ningún archivo
sin aprobación explícita.

## Qué detectar

### 1. Cobertura

- ¿Cada FR-### del spec tiene al menos una tarea en la lista de tasks?
- ¿Cada user story (US-###) tiene tareas asociadas?
- ¿Hay tareas que no se pueden trazar a ningún requisito?

### 2. Ambigüedades sin resolver

- ¿Quedan marcadores `[NECESITA CLARIFICACIÓN]` en el spec o el plan?
- ¿Hay términos vagos sin cuantificar en los criterios de aceptación?

### 3. Consistencia interna

- ¿Los criterios de aceptación del spec coinciden con los "Done cuando" de las tareas?
- ¿El stack técnico del plan coincide con `specs/tech-stack.md`?
- ¿La estructura de módulos del plan coincide con `specs/structure.md`?

### 4. Conformidad con la constitution

- ¿Algún requisito o decisión de diseño viola los principios de `specs/constitution.md`?
- ¿Hay restricciones documentadas en la constitution que el plan ignora?

### 5. Duplicados y contradicciones

- ¿Hay requisitos que se repiten o se contradicen entre secciones?
- ¿Hay tareas duplicadas o con objetivos solapados?

## Formato del reporte

```text
## Análisis de consistencia — [nombre del feature]

### Cobertura
| Requisito | Tareas relacionadas | Estado |
| --------- | ------------------- | ------ |
| FR-001    | T-003, T-004        | OK     |
| FR-002    | ninguna             | GAP    |

### Hallazgos
| ID  | Severidad | Descripcion                                      |
| --- | --------- | ------------------------------------------------ |
| A01 | CRITICO   | FR-002 no tiene ninguna tarea asignada           |
| A02 | MEDIO     | "rendimiento aceptable" no está cuantificado     |
| A03 | BAJO      | T-007 y T-009 tienen objetivos similares         |

Severidades: CRITICO (bloquea implementar), MEDIO (riesgo), BAJO (mejora)

### Resumen
- Requisitos cubiertos: N/M
- Hallazgos críticos: N
- Recomendacion: [proceder / resolver antes de implementar]
```

## Al terminar

Si hay hallazgos CRITICO, indica claramente qué debe resolverse antes de avanzar.
Si solo hay MEDIO o BAJO, pregunta: "¿Quieres que corrija alguno de estos hallazgos en el spec o el plan?"

No apliques ninguna corrección sin aprobación explícita.
