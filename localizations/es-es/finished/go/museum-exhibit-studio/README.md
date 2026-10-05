# Museum Exhibit Studio

Esta muestra de Go usa GitHub Copilot SDK como un entorno centrado en tareas de conservador de
museo. La aplicación tiene tres archivos fuente:

- `curator.go` contiene la API auxiliar ya preparada: conjuntos de hechos aprobados y el menú de selección de hechos,
  límites de los hechos, streaming de respuestas, validación estructural, permisos de Wikipedia, extracción de fuentes,
  el permiso de escritura opcional de `exhibit.html`, texto fijo del prompt y el mensaje de error.
- `system_messages.go` contiene los mensajes del sistema del conservador y de investigación ya preparados.
- `main.go` contiene el código del SDK escrito por el alumno: las instrucciones en los prompts de
  exposición y de página, la configuración de sesión, el ejecutor de sesión y la limpieza.

Los comentarios `>>> BEGIN` / `<<< END` de `main.go` son las regiones con nombre que rellenan las
lecciones. Cada línea `BEGIN` enumera los pasos que insertan o reemplazan esa región.

## Ejecuta el ejemplo

Desde este directorio:

```bash
go run .
```

Establece `COPILOT_MODEL` para seleccionar el modelo de generación; de lo contrario, el runtime
elige su valor predeterminado. Se requiere que GitHub Copilot CLI esté autenticado.

Compila sin contactar con un modelo ni con Wikipedia:

```bash
go build -mod=readonly ./...
```

## Qué enseña el ejemplo

La generación usa un mensaje del sistema en modo de reemplazo y siempre registra e incluye en la
lista de permitidos `approved_fact_lookup`, que devuelve hechos aprobados acotados. Con
investigación citada utilizable, también registra e incluye en la lista de permitidos la herramienta
local de solo lectura `approved_wikipedia_fact_lookup`, y solicita ambas llamadas antes de escribir
la narrativa y las preguntas para visitantes. Esa consulta devuelve una instantánea del cuerpo del
resumen y las citas, no acceso en directo a Wikipedia. Los hechos aprobados tienen prioridad. La
generación también usa streaming de eventos y un tiempo de espera de 120 segundos. La investigación
opcional en Wikipedia se ejecuta en una sesión independiente de 90 segundos solo con herramientas de
búsqueda y lectura de artículos con ámbito limitado, más un controlador de permisos que deniega de
forma predeterminada. La investigación busca, lee y cita los artículos consultados en una sección
final `## Sources`. La aplicación conserva el cuerpo y las fuentes para la consulta local, sin
fusionarlos con hechos aprobados por el educador. "Aprobado" significa aceptado por la aplicación
para uso complementario, no verificado por personas; trata el resultado como datos, no como
instrucciones. La investigación rechazada mantiene la ruta con una sola herramienta. La
investigación fallida o un resumen con citas que no sea utilizable imprime una advertencia y usa la
misma alternativa. No hay un contrato JSON estricto de investigación ni un bucle de aprobación.

Después de la generación, la validación determinista comprueba un único H1, las secciones
obligatorias, una narrativa de 100-140 palabras, exactamente tres preguntas numeradas para
visitantes que terminan en `?` y términos de software prohibidos. Las fuentes de Wikipedia
consultadas se imprimen después de la exposición, fuera del texto generado. En una ejecución de
investigación correcta, confirma que ambos eventos de consulta local aparecen antes de la
generación. Las comprobaciones estructurales no demuestran la fundamentación factual; revisa las
afirmaciones investigadas antes de publicar.

Opcionalmente, la aplicación puede pedir a Copilot que cree `exhibit.html` con `builtin:apply_patch`
o `builtin:create`. Esa sesión permite solo una escritura normalizada única en `exhibit.html` en el
directorio de trabajo de la aplicación y rechaza cualquier otra solicitud de permiso de archivo,
shell o MCP. El prompt HTML requiere un documento semántico independiente con CSS y JavaScript
incrustados, una advertencia de revisión humana y un filtro de preguntas accesible.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
