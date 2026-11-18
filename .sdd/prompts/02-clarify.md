# Prompt: Clarify

**Fase:** 2 de 5 — Resolución de ambigüedades
**Input requerido:** `plans/current.md` en estado `specify`
**Output:** `plans/current.md` actualizado, ambigüedades resueltas, estado `clarify`

---

## Prompt

Lee `plans/current.md` y `specs/constitution.md`.

El feature está en fase `specify`. Antes de planificar, necesito cerrar ambigüedades.

### Paso 1 — Escanea por categoría

Revisa el spec buscando ambigüedades en estas categorías:

| Categoria | Que buscar |
| --------- | ---------- |
| Alcance funcional | Comportamientos implícitos o sin definir |
| Modelo de datos | Entidades, relaciones o atributos no especificados |
| Flujo de usuario | Pasos no descritos, estados intermedios, navegación |
| Calidad / rendimiento | Términos vagos como "rápido", "escalable", "simple" |
| Integraciones | Dependencias externas sin contrato definido |
| Casos borde | Errores, límites, entradas inesperadas sin cubrir |
| Restricciones | Limitaciones técnicas, legales o de negocio no documentadas |
| Terminología | Conceptos usados sin definir o con posible ambigüedad |
| Señal de completitud | ¿Cómo sabe el usuario que el feature está "listo"? |
| Datos sensibles | ¿Maneja datos personales, financieros o credenciales? ¿Cómo se protegen? |
| Impacto en producción | ¿Toca módulos críticos (pagos, facturación, auth) o datos existentes? ¿Requiere migración? |
| Aislamiento | Si el sistema es multiusuario o multitenant: ¿está claro cómo se separan los datos? |

### Paso 2 — Selecciona máximo 5 preguntas

Elige solo las ambigüedades cuya respuesta afecte:

- Arquitectura o modelo de datos
- Seguridad o privacidad
- Alcance del feature (qué entra y qué no)
- Criterios de aceptación

### Paso 2.1 — Clasifica cada ambigüedad: crítica o menor

| Tipo | Ejemplos | Qué haces |
| ---- | -------- | --------- |
| **Crítica** | Criterios de aceptación ausentes o no medibles, dependencia no resuelta, impacto en producción sin aclarar, manejo de datos sensibles indefinido | **Detente.** Va a la lista de preguntas. No se planifica hasta resolverla. |
| **Menor** | Textos de mensajes, orden de campos, detalles visuales, un default razonable y reversible | No preguntes. Regístrala como supuesto y continúa. |

Registra las menores en `plans/current.md`, sección `## Supuestos` (créala si no existe):

```markdown
## Supuestos
- S1: [supuesto adoptado] — revertible si [condición]
```

Si una ambigüedad crítica excede el límite de 5 preguntas, no la conviertas en supuesto:
repórtala y espera instrucciones.

Descarta ambigüedades que tengan un default obvio y sin riesgo.

### Paso 3 — Haz las preguntas de forma secuencial

Presenta **una pregunta a la vez**. Para cada una:

1. Formula la pregunta con claridad.
2. Propón la respuesta que considerarías más razonable dado el contexto del proyecto.
3. Indica el impacto: qué cambia en el spec según la respuesta.

Formato por pregunta:

```text
**Pregunta [N]/[total estimado]**

[Pregunta clara y específica]

**Recomendado:** [opción o respuesta sugerida] — [razón en una línea]

Alternativas:
- A) [opción]
- B) [opción]
- C) Otro (indica cuál)

Impacto: si eliges A → [consecuencia]; si eliges B → [consecuencia]
```

Espera mi respuesta antes de pasar a la siguiente pregunta.

### Paso 4 — Actualiza el spec después de cada respuesta

Después de cada respuesta aprobada:

- Incorpora la clarificación en la sección correspondiente de `plans/current.md`.
- Agrega una sección `## Clarificaciones` si no existe, con el siguiente formato por ítem: `- P[N]: [pregunta resumida] → [respuesta acordada]`

### Paso 5 — Cierre

Cuando todas las preguntas estén resueltas (o si no hay ambigüedades críticas), reporta:

```text
Clarificaciones completadas: [N] preguntas resueltas
Supuestos registrados: [N]
Secciones actualizadas: [lista]
Estado: listo para planificación
```

Cambia el estado de `plans/current.md` a `clarify`.
