# Prompt: Implement

**Fase:** 5 de 5 — Implementación
**Input requerido:** `plans/current.md` en estado `tasks`, tarea específica a ejecutar
**Output:** Código implementado, tarea marcada como completa, estado `implement`

---

## Prompt

Lee `plans/current.md`, `specs/constitution.md`, y `specs/tech-stack.md`.

Implementa la siguiente tarea:

```
{{TASK_ID_AND_TITLE}}
```

Antes de empezar:

- Verifica que `plans/current.md` tenga `**Plan aprobado:**` con fecha y que la tarea exista en
  `§Tareas atómicas`. Si falta cualquiera de las dos, **detente** y repórtalo.

Reglas de implementación:
1. Implementa solo lo que dice la tarea. Nada más.
2. Si durante la implementación descubres que la tarea está mal definida o es más compleja de lo esperado, para y reporta — no improvises scope.
3. Sigue todas las convenciones en `specs/constitution.md §Convenciones`.
4. **Prueba primero cuando la tarea tenga comportamiento verificable:** escribe o actualiza el test
   que comprueba el "Done cuando" de la tarea, confirma que falla, y después implementa hasta que pase.
   Si la tarea no tiene comportamiento verificable (estructura, configuración), dilo y omite este paso.
5. **Corre la suite de pruebas** del proyecto (o la parte que toca la tarea) antes de dar la tarea
   por terminada. Si algo falla, la tarea no está terminada: corrige o reporta.
6. No escribas credenciales, tokens ni secretos en el código ni en archivos versionados.
7. Si tomas una micro-decisión de implementación no trivial, regístrala en `plans/current.md §Decisiones tomadas`.
8. Al terminar, marca la tarea como `[x]` en `plans/current.md`.
9. Si esta era la última tarea, cambia el estado del feature a `review`.

Cuando termines, muéstrame:
- Qué archivos creaste o modificaste
- Qué pruebas corriste y su resultado (o por qué no aplicaba)
- Si hay algo que debo revisar manualmente
- La próxima tarea a ejecutar (si aplica)
