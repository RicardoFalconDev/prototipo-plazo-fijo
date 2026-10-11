# Plazo fijo · Prototipo navegable

**Tu ahorro, en números claros.** Prototipo funcional del rediseño de la simulación y constitución de un plazo fijo (caso de Product Design).

🔗 **Prototipo:** https://ricardofalcondev.github.io/prototipo-plazo-fijo/

> Prototipo de diseño. No es una app oficial ni mueve dinero. Tasas, mínimos y saldos son ilustrativos.

## Cómo se ve
- **En el celular:** ocupa toda la pantalla y usa la barra de estado y la navegación nativas del teléfono. El botón atrás de Android vuelve de pantalla y cierra las hojas. Se puede "Agregar a la pantalla de inicio" para abrirlo como app (sin barra del navegador).
- **En la computadora:** se muestra dentro de un teléfono simulado (360 × 800) con barra de estado y navegación de Android.
- Forzar un modo: `?modo=nativo` o `?modo=telefono`.

## Ir directo a una pantalla
Agregá `?pantalla=` al link: `01`, `02`, `03`, `05`, `06`, `07`, `08`, `09` (flujo) o `A`, `B`, `C`, `D` (estados).
Ej.: `https://ricardofalcondev.github.io/prototipo-plazo-fijo/?pantalla=05`

## Qué se puede probar
- Simulación en vivo: tipo de plazo fijo, monto, plazo (30/60/90 o fecha personalizada) y resultado con ganancia, vencimiento (corrido a día hábil) y TNA.
- Estados: monto menor al mínimo, saldo insuficiente (probá con $ 5.000), error de conexión (`?pantalla=C`) y operación pendiente (`?pantalla=D`).
- Ayuda "¿Qué es un plazo fijo?" y "¿Qué es la TNA?".
- Analítica de demostración en la consola del navegador (`[analytics]`).

## Movimiento (Framer Motion)
- Cambio de pantalla y de plazo instantáneos.
- Resultado: tarjeta de alto fijo; esqueleto inmediato mientras responde el servicio (2 s simulados) y fundido secuencial, sin mostrar valores viejos.
- Hojas inferiores con resorte y cierre arrastrando hacia abajo; selector de moneda con indicador deslizante.
- Monto inválido: sacudida + vibración (celular). Éxito: el check se dibuja y el contenido entra escalonado.
- Respeta "reducir movimiento" del sistema.

## Sistema de diseño
Los estilos usan los mismos tokens del archivo de Figma (`src/styles/tokens.css`: primitivos, semánticos, espaciado, radios, tipografía y elevación, con los nombres del code syntax de Figma).

## Desarrollo
```bash
npm install
npm run dev
```
Cada push a `main` publica en GitHub Pages (`.github/workflows/deploy.yml`).
