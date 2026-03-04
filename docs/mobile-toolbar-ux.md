# Mobile Toolbar UX - Sugerencias

Objetivo
- Mejorar la usabilidad en mobile sin romper el flujo actual del editor.

Estructura propuesta
- Mantener dos filas mobile: acciones arriba y navegacion abajo.
- Orden sugerido:
  - Fila 1: Seleccionar, Highlight, Texto, Pencil, Eliminar, Undo, Redo.
  - Fila 2: Zoom -, %, Zoom +, Ajustar, Crop, Hand.

Ergonomia tactil
- Garantizar hit-area real de 44x44 en botones mobile.
- Habilitar scroll horizontal con scroll-snap en cada fila.
- Agregar fade lateral (izq/der) para indicar overflow.

Feedback visual
- Tool activo: variante default + indicador secundario (borde o ring suave).
- Para Crop y Hand, estado activo muy explicito.
- Ancho fijo en la lectura de zoom (%) para evitar saltos de layout.

Comportamiento mobile
- Cerrar color picker al cambiar de tool (evita UI sucia).
- Cuando se abre modal de crop, bloquear taps del toolbar de fondo.
- Mantener panel contextual solo cuando corresponde (sin cambios).

Refactor opcional
- Definir config de tools y renderizar por mapa para reducir duplicacion entre mobile/desktop.

Validacion
- Tests: 2 filas, orden de botones, tool activo, visibilidad contextual.
- Smoke manual en 360x800 con zoom/crop/pan.
