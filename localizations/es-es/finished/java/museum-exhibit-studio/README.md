# Museum Exhibit Studio

Esta muestra de Maven CLI usa GitHub Copilot SDK como un agente centrado en tareas de conservador de museo. Un educador de museo elige uno de tres conjuntos de hechos aprobados o introduce sus propios hechos acotados, opcionalmente transmite en streaming investigación de contexto de Wikipedia con ámbito limitado, genera texto de exposición dirigido a visitantes, valida su estructura y puede optar por un proyecto final `exhibit.html`.

## Ejecutar

Desde este directorio:

```bash
./mvnw compile exec:java
```

Establece `COPILOT_MODEL` para seleccionar un modelo; de lo contrario, el runtime de Copilot elige su valor predeterminado. La muestra requiere que GitHub Copilot CLI esté autenticado.

Compila sin contactar con un modelo:

```bash
./mvnw compile
```

## Qué demuestra

El punto de entrada `MuseumExhibitStudio` escrito por el alumno crea sesiones directamente con `new CopilotClient()`. Los auxiliares `Curator*` ya preparados proporcionan hechos aprobados y el menú de selección de hechos, streaming, validación, permisos con ámbito limitado, extracción de fuentes, texto fijo del prompt, el mensaje de error y (en `CuratorSystemMessages.java`) los mensajes del sistema del conservador y de investigación. Los comentarios `>>> BEGIN` / `<<< END` del punto de entrada son las regiones con nombre que rellenan las lecciones; cada línea `BEGIN` enumera los pasos que insertan o reemplazan esa región.

Las indicaciones del prompt no son un límite de autorización, así que la aplicación también:

- siempre registra e incluye en la lista de permitidos `approved_fact_lookup`, y añade la herramienta local de solo lectura
  `approved_wikipedia_fact_lookup` solo cuando existe investigación citada utilizable;
- limita la investigación al servidor MCP de Wikipedia configurado y a `wikipedia-search` / `wikipedia-readArticle` mediante un controlador de permisos que deniega de forma predeterminada;
- captura el cuerpo de la investigación y las citas finales de `## Sources` para la segunda consulta local,
  sin fusionarlas nunca con hechos aprobados por el educador ni dar a la generación acceso en directo a Wikipedia;
- acota la entrada a 20 hechos de 500 caracteres como máximo cada uno antes de cada envío al modelo;
- usa tiempos de espera explícitos, rechaza la salida de exposición en blanco y desconecta sesiones / detiene clientes en caso de éxito y de error;
- comprueba un único H1, las secciones obligatorias, una narrativa de 100-140 palabras, exactamente tres preguntas numeradas que terminan en `?`, y vocabulario de software prohibido; y
- opcionalmente permite que `builtin:apply_patch` y `builtin:create` escriban solo `exhibit.html` en el directorio de trabajo de la aplicación.

El conservador recibe instrucciones para llamar a ambas consultas locales antes de escribir la
narrativa y las preguntas para visitantes cuando existe investigación. Los hechos aprobados tienen
prioridad sobre la investigación complementaria, que se trata como datos, no como instrucciones. La
investigación "aprobada" significa aceptada por la aplicación, no verificada por personas. La
investigación rechazada mantiene la ruta con una sola herramienta. La investigación fallida o un
resumen con citas que no sea utilizable imprime una advertencia y usa la misma alternativa. Confirma
ambos eventos de consulta en una ejecución de investigación correcta; las fuentes se siguen
imprimiendo después de la exposición. El validador no puede demostrar la fundamentación factual
semántica. Las afirmaciones generadas siguen requiriendo revisión humana o un evaluador aparte.

## Proyecto final HTML opcional

Cuando se te pida, responde yes para generar `exhibit.html`. El SDK de Java 1.0.11 fijado conserva
campos de permiso como `fileName`, así que el controlador de permisos estricto aprueba una escritura
solo cuando su ruta normalizada es exactamente `exhibit.html` en este directorio. Los datos de ruta
ausentes, otras rutas de archivo y las solicitudes que no son de escritura siguen denegadas; no hay
una alternativa amplia de escritura.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
