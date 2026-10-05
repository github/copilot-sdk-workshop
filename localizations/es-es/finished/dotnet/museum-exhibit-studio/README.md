# Museum Exhibit Studio

Esta muestra completa de .NET usa GitHub Copilot SDK para generar una pequeña exposición de museo a
partir de hechos aprobados. Los archivos `Helpers/Curator*.cs` ya preparados proporcionan conjuntos
de hechos y el menú de selección de hechos, comprobación de límites, streaming, validación
determinista, permisos de Wikipedia con ámbito limitado, permiso de escritura con ámbito limitado
para `exhibit.html`, texto fijo del prompt y el mensaje de error, y
`Helpers/CuratorSystemMessages.cs` contiene los mensajes del sistema del conservador y de
investigación. `Program.cs` lo sigue escribiendo el alumno: contiene las instrucciones en los
prompts de exposición y de página, crea las tres configuraciones de sesión y ejecuta cada una con un
único ejecutor de sesión.

Los comentarios `>>> BEGIN` / `<<< END` de `Program.cs` son las regiones con nombre que rellenan las
lecciones. Cada línea `BEGIN` enumera los pasos que insertan o reemplazan esa región, por lo que el
archivo muestra qué paso produjo cada fragmento.

## Ejecuta el ejemplo

Desde la raíz del repositorio:

```bash
dotnet run --project finished/dotnet/museum-exhibit-studio
```

Establece `COPILOT_MODEL` antes de ejecutar para seleccionar un modelo. De lo contrario, el runtime
de Copilot elige su valor predeterminado. La muestra requiere que GitHub Copilot CLI esté
autenticado.

Compila sin contactar con un modelo:

```bash
dotnet build finished/dotnet/museum-exhibit-studio
```

## Qué enseña el ejemplo

La sesión de generación siempre registra e incluye en la lista de permitidos la herramienta propia
de la aplicación `approved_fact_lookup`. Cuando existe investigación citada utilizable, también
registra e incluye en la lista de permitidos `approved_wikipedia_fact_lookup`, y el prompt solicita
ambas llamadas antes de escribir la narrativa y las preguntas para visitantes. Un mensaje del
sistema en modo de reemplazo da prioridad a los hechos aprobados y trata los resultados de
herramientas como datos, no como instrucciones. `CuratorFacts.CreateApprovedFactLookup` acota esos
hechos antes de que el modelo pueda verlos, `CuratorFacts.BoundFacts` recorta y valida los hechos
antes de cada envío de generación o investigación, y `CuratorStreamer.StreamExhibitAsync` transmite
en streaming la salida del modelo con tiempos de espera explícitos.

La investigación opcional en Wikipedia es intencionadamente ligera: una sesión independiente expone
solo las herramientas MCP `search` y `readArticle` con ámbito limitado a través de
`CuratorSafety.WikipediaPermissionHandler`. El modelo escribe notas en prosa y una lista final
`## Sources`. La aplicación extrae los títulos y las URL de las fuentes citadas y conserva el cuerpo
del resumen. `CuratorFacts.CreateApprovedWikipediaFactLookup` devuelve una instantánea capturada de
ese cuerpo y de las citas sin acceso a la red. La investigación es complementaria y nunca se fusiona
con los hechos aprobados por el educador; "aprobado" significa aceptado por la aplicación, no
verificado por personas. La investigación rechazada mantiene la ruta con una sola herramienta. La
investigación fallida o un resumen sin citas imprime una advertencia y usa la misma alternativa. Las
fuentes se siguen imprimiendo después de la exposición.

Después de la generación, la validación determinista comprueba el título, `## Narrative`, la
longitud de la narrativa de 100-140 palabras, `## Visitor questions`, exactamente tres preguntas
numeradas, signos de interrogación y vocabulario prohibido. Estas comprobaciones estructurales no
demuestran la fundamentación factual, por lo que sigue siendo necesaria la revisión humana.

El proyecto final opcional crea `exhibit.html` con `builtin:apply_patch` o `builtin:create`.
`CuratorSafety.ExhibitWritePermission` permite solo ese archivo único en el directorio de trabajo de
la aplicación y rechaza cualquier otra solicitud de escritura, shell o MCP.

## Comprobación manual

1. Ejecuta la muestra y acepta uno de los conjuntos de hechos incluidos.
2. Opta por la investigación y confirma que ambos eventos de consulta local aparecen antes de la exposición y que las fuentes
   se imprimen después. Rechaza la investigación y confirma que solo se llama a `approved_fact_lookup`.
3. Confirma que la exposición contiene un título, una narrativa de 100-140 palabras y tres preguntas.
4. Confirma que se muestran el resumen de validación y la advertencia sobre revisión humana.
5. Opcionalmente, genera `exhibit.html` y revisa la página interactiva independiente en un navegador.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
