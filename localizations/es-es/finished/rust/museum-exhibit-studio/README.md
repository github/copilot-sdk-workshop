# Museum Exhibit Studio

Este ejemplo de Rust usa el GitHub Copilot SDK como un arnés de agente enfocado, no orientado a ingeniería de software. Los auxiliares ya preparados están en `src/lib.rs`: conjuntos de hechos aprobados y el menú de selección de hechos, streaming, validación, permisos con ámbito, texto de prompt fijo y el mensaje de error. Los mensajes del sistema del conservador y de investigación están ya preparados en `src/system_messages.rs`. El código del SDK escrito por el alumno está en `src/main.rs`: las instrucciones de los prompts de exposición y de página, la configuración de sesión y el ejecutor de sesión.

Los comentarios `>>> BEGIN` / `<<< END` de `src/main.rs` son las regiones con nombre que rellenan las lecciones. Cada línea `BEGIN` enumera los pasos que insertan o sustituyen esa región.

## Ejecuta el ejemplo

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

Establece `COPILOT_MODEL` para seleccionar un modelo de generación. El ejemplo requiere GitHub Copilot CLI autenticado.

Comprueba sin contactar con un modelo:

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## Qué enseña el ejemplo

La sesión de generación usa un mensaje del sistema del conservador de sustitución, valida hechos
aprobados, transmite en streaming con un tiempo de espera de 120 segundos, siempre registra e
incluye en la lista de permitidos `approved_fact_lookup`, rechaza la salida en blanco e imprime
validación estructural determinista. Con investigación citada utilizable, también registra e incluye
en la lista de permitidos la herramienta local de solo lectura `approved_wikipedia_fact_lookup`, y
solicita ambas llamadas antes de escribir la narrativa y las preguntas de visitantes.

La investigación opcional en Wikipedia está separada: expone solo herramientas MCP `search` y
`readArticle` con ámbito, usa un controlador de permisos que deniega de forma predeterminada y
produce un resumen y fuentes citadas. La nueva búsqueda local devuelve una instantánea de ese cuerpo
y esas citas, sin acceso en vivo a Wikipedia ni fusión de la investigación con hechos aprobados por
educadores. Los hechos aprobados tienen prioridad; la investigación "approved" son datos
complementarios aceptados por la aplicación, no hechos verificados por humanos ni instrucciones.
Rechazar la investigación conserva la ruta de una sola herramienta. Si la investigación falla o el
resumen citado no es utilizable, se imprime una advertencia y se aplica la misma alternativa. Las
fuentes se imprimen después de la exposición; una investigación correcta debe mostrar ambos eventos
de búsqueda local antes de la generación. Las comprobaciones estructurales no demuestran una base
factual, así que revisa las afirmaciones investigadas antes de publicar.

La generación HTML opcional usa `builtin:apply_patch` o `builtin:create` con un controlador de permisos de archivo único que solo puede escribir `exhibit.html` en el directorio de trabajo de la aplicación.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
