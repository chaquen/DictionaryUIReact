# Prompt: Plan

**Fase:** 3 de 5 — Plan de implementación técnica
**Input requerido:** `plans/current.md` en estado `clarify`, `specs/tech-stack.md`, `specs/structure.md`
**Output:** Plan técnico detallado en `plans/current.md`, estado `plan`

---

## Prompt

Lee `plans/current.md`, `specs/tech-stack.md`, y `specs/structure.md`.

Las ambigüedades están resueltas. Ahora necesito el plan técnico de implementación.

### Paso 1 — Analiza el código existente antes de planificar

Un plan escrito sin leer el código es genérico. En greenfield, salta al Paso 2.
En brownfield, revisa y anota lo que encuentres:

1. Estructura de carpetas raíz → stack y patrón arquitectónico real
2. Archivos de dependencias (`package.json`, `requirements.txt`, `composer.json`, `*.csproj`…) → versiones exactas
3. Configuración → variables de entorno, conexiones, feature flags
4. Módulos relacionados con el feature → identificados por nombre o funcionalidad
5. Modelos de datos que el feature toca o crea, y sus migraciones
6. Rutas o endpoints existentes → para no duplicar ni romper contratos
7. Tests existentes → framework y patrones que ya usa el proyecto
8. Convenciones reales de naming, aunque difieran de `specs/`

Si lo que encuentras contradice `specs/tech-stack.md` o `specs/structure.md`, **señálalo**:
no actualices `specs/` por tu cuenta.

**Señales de alerta** — si aparecen, inclúyelas en el plan como advertencia:

- Módulos que el feature va a modificar y que no tienen tests
- Credenciales o secretos escritos en el código o en archivos versionados
- Dependencias críticas desactualizadas o sin mantenimiento
- Lógica que el feature necesita y que ya existe duplicada en otro lugar
- Cualquier cosa que pueda romperse al tocar el módulo (llamadores, contratos públicos)

### Paso 2 — Escribe el plan

Sé específico: nombra archivos, clases, funciones, tablas y columnas. "Crear el servicio" no es
un plan; "Crear `src/services/invoice_service.py` con `create_invoice()` y `void_invoice()`" sí.

1. **Solución técnica:** módulos, funciones o componentes a crear o modificar.
2. **Archivos existentes que cambian** y cómo cambian.
3. **Archivos nuevos** y por qué.
4. **Flujo de datos o de control** principal del feature.
5. **Estrategia de pruebas:** qué se prueba en cada nivel (unitario, integración, end-to-end)
   y qué criterio de aceptación cubre cada prueba.
6. **Radio de impacto:** qué otros módulos o llamadores se ven afectados.
7. **Decisiones de arquitectura:** si el plan requiere un ADR antes de implementar.
8. **Conformidad:** confirma que el plan no viola ninguna regla de `specs/constitution.md`.
   Si la viola, dilo y propone la alternativa.
9. **Advertencias:** las señales de alerta del Paso 1 y los supuestos de `plans/current.md §Supuestos`
   de los que depende el plan.

### Paso 3 — Compuerta de aprobación

Presenta el plan y termina con esta pregunta, textual:

```text
¿Apruebas este plan? Responde "aprobado" para continuar, o indica qué cambiar.
```

Hasta recibir aprobación explícita:

- No escribas código.
- No crees archivos fuera de `plans/current.md`.
- No avances a la fase `tasks`.

Cuando el humano apruebe, registra en `plans/current.md §Feature en curso`:
`**Plan aprobado:** [fecha]`.

Actualiza `plans/current.md` con el plan técnico. Cambia estado a `plan`.
