# Museum Exhibit Studio

Esta muestra completa de Node.js/TypeScript tiene tres archivos fuente:

- `src/curator.ts` contiene el módulo auxiliar ya preparado: hechos aprobados y el
  menú de selección de hechos, streaming acotado, validación determinista, permisos de Wikipedia
  con ámbito limitado, el permiso de escritura opcional de `exhibit.html`, texto fijo del prompt y
  el mensaje de error.
- `src/system-messages.ts` contiene los mensajes del sistema del conservador y de investigación ya preparados.
- `src/index.ts` contiene el código del SDK escrito por el alumno: las instrucciones en los
  prompts de exposición y de página, configuraciones de sesión, el ejecutor de sesión, investigación opcional,
  generación, validación y el proyecto final HTML opcional.

Los comentarios `>>> BEGIN` / `<<< END` de `src/index.ts` son las regiones con nombre que rellenan
las lecciones. Cada línea `BEGIN` enumera los pasos que insertan o reemplazan esa región.

## Ejecuta el ejemplo

```bash
cd finished/nodejs/museum-exhibit-studio
npm ci
npm start
```

Usa `npm run build` para comprobar tipos sin contactar con un modelo.

## Estructura de seguridad

La generación siempre registra e incluye en la lista de permitidos `approved_fact_lookup`, que
devuelve hechos aprobados acotados. Con investigación citada utilizable, también registra e incluye
en la lista de permitidos la herramienta local de solo lectura `approved_wikipedia_fact_lookup` y
pide al conservador que llame a ambas antes de escribir la narrativa y las preguntas de visitantes.
La segunda búsqueda devuelve una instantánea del cuerpo de la investigación y las citas, no acceso
en vivo a Wikipedia. Los hechos aprobados tienen prioridad; la investigación son datos
complementarios, no instrucciones ni hechos verificados por humanos. La investigación opcional en
Wikipedia se ejecuta en una sesión aparte con herramientas `search` y `readArticle` con ámbito, un
controlador de permisos que deniega de forma predeterminada, `## Sources` citado y sin contrato JSON
ni bucle de aprobación de adiciones propuestas. La investigación nunca se fusiona con los hechos
aprobados por educadores. Si se rechaza la investigación, se conserva la ruta original de una sola
herramienta; si la investigación falla o el resumen citado no es utilizable, se imprime una
advertencia y se aplica la misma alternativa. Las fuentes siguen imprimiéndose después de la
exposición. En una ejecución de investigación correcta, confirma que ambos eventos de búsqueda local
aparecen antes de la generación.

Después de la generación, las comprobaciones deterministas informan de la estructura, la longitud de
la narrativa, las preguntas de visitantes y el vocabulario prohibido. Si se selecciona, el paso HTML
expone solo `builtin:apply_patch` y `builtin:create`. Su controlador de permisos aprueba escribir
exactamente `exhibit.html` en el directorio de la aplicación. Las comprobaciones estructurales no
demuestran una base factual; revisa las afirmaciones investigadas antes de publicar.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
