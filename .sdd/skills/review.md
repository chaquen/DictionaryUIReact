---
name: sdd-review
description: Revisión del diff antes de commit o PR — bugs, seguridad, pruebas, inconsistencias con specs y con el plan
tags: [universal]
---

Lee `specs/constitution.md` y `plans/current.md`.

Revisa el código que te voy a mostrar o el diff actual del proyecto.

**Alcance:** revisa solo el cambio (el diff contra la rama base, o los archivos que te indique),
no el repositorio completo. Lee el código alrededor del cambio solo para entenderlo. Si encuentras
un problema grave fuera del diff, menciónalo aparte, sin mezclarlo con la revisión.

Tu tarea:
1. Identifica bugs o errores lógicos concretos (no estilísticos).
2. Señala cualquier inconsistencia con `specs/constitution.md` o el feature en `plans/current.md`.
3. Verifica que el cambio cubra lo que piden las tareas y criterios de aceptación de
   `plans/current.md`, y que no agregue alcance que no estaba en el plan.
4. Revisa seguridad en el código modificado:
   - Credenciales, tokens o secretos escritos en el código o en archivos versionados (`.env*`, configuración)
   - Entradas sin validar; queries armadas concatenando texto (inyección SQL o de comandos)
   - Endpoints nuevos sin autenticación o autorización
   - Rutas de archivo construidas con datos del usuario (path traversal)
   - Datos sensibles escritos en logs
5. Verifica que el código nuevo o modificado tenga pruebas y que las existentes no se hayan
   debilitado o borrado para que pasen.
6. Detecta código duplicado o que podría reutilizar algo ya existente.
7. Si hay algo que violaría una regla de `.rules.md`, indícalo.

Formato de respuesta:

```
## Revisión

### Bugs / Errores
- [descripción concreta + línea si aplica]

### Seguridad
- [hallazgo + archivo:línea + severidad: crítica / alta / media]

### Inconsistencias con specs o con el plan
- [qué viola y dónde está documentado]

### Pruebas
- [qué falta probar o qué prueba se debilitó]

### Mejoras obvias
- [solo si son claras y de bajo riesgo]

### Sin observaciones
[si no encontraste nada relevante]
```

Termina con un veredicto: **listo para revisión humana** o **requiere cambios** (si hay
hallazgos de seguridad críticos o altos, o bugs, siempre es "requiere cambios").

No propongas refactorizaciones grandes. No cambies el scope del feature.
Solo reporta — no modifiques nada sin que lo pida explícitamente.
