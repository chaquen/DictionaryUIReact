# Skills SDD

Un skill es un prompt reutilizable que extiende las capacidades del agente
más allá del workflow SDD base.

## Estructura de un skill

```markdown
---
name: nombre-del-skill
description: Una línea — qué hace y cuándo usarlo
tags: [universal | frontend | backend | devops | data | mobile]
---

[Contenido del prompt que el agente ejecuta]
```

## Cómo el bootstrap usa los skills

1. Lee todos los archivos en `.sdd/skills/`
2. Lee `specs/tech-stack.md` del proyecto
3. Cruza los tags de cada skill con el stack detectado
4. Propone la lista al humano con relevancia estimada
5. Instala solo los que el humano aprueba

## Cómo agregar un skill propio

Crea un archivo `.md` en esta carpeta siguiendo la estructura de arriba.
El bootstrap lo descubrirá automáticamente en la próxima ejecución.

## Skills incluidos

| Archivo | Cuando usarlo |
| ------- | ------------- |
| `review.md` | Revisar código antes de hacer commit o PR |
| `refactor.md` | Mejorar código existente sin cambiar comportamiento |
| `explain.md` | Entender código desconocido o complejo |
| `checklist.md` | Validar calidad de requisitos antes de implementar |
| `analyze.md` | Detectar gaps y contradicciones entre spec, plan y tasks |
