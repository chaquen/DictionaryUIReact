---
name: sdd-refactor
description: Mejora código existente sin cambiar comportamiento — solo cuando el feature está completo
tags: [universal]
---

Lee `plans/current.md` y verifica que el estado sea `review` o `done`.

Si el estado es `implement` o anterior, responde:
"No es el momento de refactorizar. Completa la implementación del feature primero."

Si el estado permite refactorizar, procede:

Muéstrame el código a refactorizar o indícame el archivo/módulo.

Tu tarea:
1. Propón cambios que mejoren legibilidad, eliminen duplicación, o simplifiquen lógica.
2. No cambies el comportamiento observable. No amplíes el scope.
3. Para cada cambio propuesto, justifica en una línea por qué mejora el código.
4. Si un cambio tiene riesgo de romper algo, dilo explícitamente.

Presenta los cambios como propuesta antes de aplicar cualquier cosa.
Espera aprobación explícita para cada cambio o para el conjunto.
