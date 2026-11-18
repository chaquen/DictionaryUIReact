---
name: sdd-checklist
description: Valida que los requisitos del feature estén bien escritos — no que la implementación funcione
tags: [universal]
---

Lee `plans/current.md`.

Este skill genera un checklist de **calidad de requisitos** — no de implementación.
Concepto clave: son "unit tests para los requisitos". El objetivo es detectar
requisitos vagos, incompletos, inconsistentes o no verificables *antes* de implementar.

## Lo que NO debe estar en este checklist

❌ "Verificar que el botón muestra el texto correcto"
❌ "Confirmar que el login funciona"
❌ "Testear que la API responde en menos de 200ms"

Esos son tests de implementación. Este checklist es anterior a la implementación.

## Lo que SÍ debe estar

✅ "¿Está especificado el texto exacto del botón?" [Completitud]
✅ "¿Los criterios de aceptación del login son medibles y no ambiguos?" [Claridad]
✅ "¿El tiempo de respuesta esperado está cuantificado con un valor específico?" [Claridad]

## Categorías a revisar

Para cada categoría, genera entre 1 y 3 ítems según lo que encuentres en el spec:

- **Completitud** — ¿Están definidos todos los comportamientos necesarios?
- **Claridad** — ¿Los términos vagos están cuantificados? ("rápido", "fácil", "suficiente")
- **Consistencia** — ¿Los requisitos se contradicen entre secciones?
- **Criterios de aceptación** — ¿Son medibles, verificables, y no dependen de juicio subjetivo?
- **Cobertura de escenarios** — ¿Están cubiertos los casos borde y de error?
- **Requisitos no funcionales** — ¿Rendimiento, seguridad, accesibilidad están especificados si aplican?
- **Supuestos** — ¿Los supuestos están documentados explícitamente?
- **Ambigüedades** — ¿Quedan marcadores `[NECESITA CLARIFICACIÓN]` sin resolver?

## Formato de cada ítem

```text
- [ ] CHK-NNN ¿[pregunta sobre la calidad del requisito]? [Categoria, FR-NNN o US-NNN si aplica]
```

Numera desde CHK-001. Si el archivo ya existe con ítems previos, continúa la numeración.

## Al terminar

Presenta el checklist completo y pregunta:
"¿Quieres que resuelva algún ítem ahora actualizando el spec, o procedemos con el plan?"

No modifiques `plans/current.md` sin aprobación explícita.
