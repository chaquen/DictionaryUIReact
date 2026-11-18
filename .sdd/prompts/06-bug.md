# Prompt: Bug

**Uso:** Cuando hay un bug en producción o desarrollo
**Output:** Análisis, hipótesis, fix, verificación

---

## Prompt: Bug Create (reportar)

Lee `specs/constitution.md` y `specs/structure.md`.

Tengo el siguiente bug:

```
{{BUG_DESCRIPTION}}
```

Contexto adicional:
- Comportamiento esperado: ...
- Comportamiento actual: ...
- Pasos para reproducir: ...
- Entorno (dev/staging/prod): ...

Tu tarea:
1. Reformula el bug de forma precisa y sin ambigüedad.
2. Identifica los módulos o archivos probablemente involucrados.
3. Lista hipótesis ordenadas por probabilidad (máximo 3).
4. Indica qué evidencia confirmaría o descartaría cada hipótesis (un log, una traza, un test que
   reproduzca el bug, un `EXPLAIN`, un conteo de filas) y cómo obtenerla.

Reglas del diagnóstico:

- **Una hipótesis no está confirmada porque "tenga sentido".** Solo se confirma con evidencia.
- **No asumas que un módulo hace lo que su nombre sugiere.** Lee el código real, de la entrada
  (controlador, handler) hasta el dato (query, procedimiento almacenado).
- **Si el código versionado puede no reflejar lo que corre** (funciones de base de datos,
  configuración de servidor), dilo y pide la versión viva antes de concluir.
- Si el bug es de rendimiento, pide la métrica correcta: no solo cuántas veces se llama o cuánto
  tarda cada llamada, sino el **tiempo total acumulado** (llamadas × duración). Es la que decide
  qué vale la pena optimizar.

---

## Prompt: Bug Fix (implementar fix)

Hipótesis confirmada: `{{HYPOTHESIS}}`

Implementa el fix mínimo que resuelve el bug sin introducir cambios colaterales.

Antes de tocar código:

- **Encuentra todos los llamadores** de lo que vas a cambiar (busca el nombre en todo el
  repositorio, no solo en el módulo donde viste el bug). Eso define el radio de impacto.
- Si vas a modificar algo en un entorno compartido (una función en una base de datos de pruebas,
  un archivo de configuración), **saca primero un respaldo verificado** del estado actual.

Reglas:
- Fix quirúrgico. No refactorices de paso.
- No cambies reglas de negocio dentro de un fix. Si el fix las cambia, es una decisión del humano: pregunta.
- Si el fix es de rendimiento, compara la versión anterior y la nueva con los mismos datos:
  deben devolver exactamente el mismo resultado antes de declarar el fix correcto.
- Si el fix requiere cambiar más de 3 archivos, para y propón un plan antes.
- Escribe o actualiza el test que habría detectado este bug.
- Si la causa raíz es una limitación estructural, **propón** documentarla en `specs/constitution.md §Restricciones conocidas` — no la escribas sin aprobación (regla de `specs/`).
