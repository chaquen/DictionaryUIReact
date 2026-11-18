# Adapter: Generic (cualquier agente)

## Cómo usar SDD con cualquier herramienta de IA

Este adapter funciona con cualquier agente que acepte texto como input.

### Inicio de sesión

Siempre empieza pegando esto (ajusta las rutas si tu agente no accede al filesystem):

```
Contexto del proyecto:

[PEGAR CONTENIDO DE specs/constitution.md]
[PEGAR CONTENIDO DE plans/current.md]

Eres un agente operando bajo Spec-Driven Development.
Lee el contexto y espera instrucciones.
```

### Por qué funciona sin acceso a filesystem

Si el agente no puede leer archivos directamente, copias y pegas el contenido
relevante. Es menos cómodo pero igualmente efectivo — la lógica del workflow
no cambia, solo el mecanismo de entrega del contexto.

### Flujo mínimo viable

```
1. Pega 00-context.md (con specs/ embebidas si no hay filesystem)
2. Pega 01-specify.md → reemplaza {{FEATURE_NAME}} → espera output
3. Aprueba o corrige requisitos
4. Pega 02-clarify.md → resuelve ambigüedades
5. Pega 03-plan.md → aprueba plan técnico
6. Pega 04-tasks.md → obtén lista de tareas
7. Pega 05-implement.md por cada tarea → reemplaza {{TASK_ID}}
8. Cuando todas las tareas estén hechas, pega 07-close.md → archiva el feature y arranca el siguiente
```

### Advertencia

Sin acceso a filesystem, el agente no puede actualizar `plans/current.md` directamente.
Debes copiar su output y pegarlo manualmente en el archivo.
Considera esto un costo de fricción aceptable si el agente no tiene otra opción.
