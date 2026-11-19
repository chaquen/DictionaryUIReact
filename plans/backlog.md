# Backlog

> Features pendientes en orden de prioridad.
> Solo el primero de "Prioridad Alta" pasa a current.md cuando el feature activo cierra.

## Prioridad Alta
- [x] HU-001 — Integración y despliegue continuos (CI/CD) → cerrada el 2026-11-18, archivada en `plans/done/hu-001-ci-cd.md`
- [ ] HU-002 — MVP de aprendizaje: explorar ideas y encontrar el valor real → **en curso** en `plans/current.md`
  - Prueba de concepto (PoC): #16 Escape room narrativo + #18 Mecánicas de juego transversales
  - A evaluar: #1 Repaso espaciado · #2 Pronunciación con tu voz · #3 Reto diario · #7 Ejercicios generados con IA ·
    #9 Personaje compañero · #12 Imágenes que ayudan a recordar

## Prioridad Media
- [ ] Avance visible en la meta de lectura (pedido del humano, 2026-11-19). Validado: las palabras sí suman, pero cada una
  pesa poco (#301 "control" = 0,032 %, #700 "fit" = 0,014 %) y el número redondeado a enteros no cambia hasta marcar
  30–70 palabras; además "Learn it" solo cuenta al dominar la palabra (estabilidad ≥ 21 días, S9). Hacer:
  - Mostrar el avance al marcar o aprender una palabra (p. ej. "+0,03 % → 66,4 %") y la meta con un decimal.
  - Enlace "How is this calculated? · ¿Cómo se calcula?" que despliega una explicación corta: peso por frecuencia,
    las 100 palabras más comunes dadas por sabidas (S7), la prueba de nivel, "I know it" suma al instante, "Learn it"
    suma al dominarla, y por qué la meta es 95.
- [ ] Test real de nivel del usuario (pedido del humano, 2026-11-19). Hoy el nivel sale de lo que el usuario **dice**
  saber (marca palabras en la prueba de nivel) más el supuesto S7 (las 100 palabras más frecuentes se dan por sabidas);
  nada lo comprueba. Idea: verificar con preguntas (elegir el significado, completar una frase, escuchar y elegir) por
  franjas de frecuencia, y ajustar el punto de partida y la meta de lectura con lo que el usuario demuestra.
- [ ] Fusionar los significados repetidos por categoría gramatical en palabras con varias etimologías (p. ej. "bank")

## Prioridad Baja / Ideas
<!-- Lluvia de ideas del 2026-11-19. No descartadas: candidatas para la siguiente iteración tras evaluar HU-002. -->
- [ ] #4 Extensión de Chrome que captura palabras con su contexto (choca con "no hace traducción" si traduce; la extensión no comparte `localStorage` con la web)
- [ ] #5 Vocabulario previo de una serie, canción o artículo
- [ ] #6 Realidad aumentada "etiqueta tu casa" (WebXR, solo móvil)
- [ ] #8 Diálogos situacionales con personajes y voz
- [ ] #10 Cómic de tus palabras con globos para completar
- [ ] #11 Escenas 3D que se construyen describiéndolas en inglés
- [ ] #13 Un mundo 3D que crece con cada palabra aprendida
- [ ] #14 Palacio de la memoria 3D
- [ ] #15 Describe lo que ves (descubrir el vocabulario que falta)
- [ ] #17 Juego arcade (palabras que caen, defensa de torres)

## Descartados (con razón documentada)
| Feature | Razón de descarte | Fecha |
|---------|------------------|-------|
| -       | -                | -     |
