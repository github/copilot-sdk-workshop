# Museum Exhibit Studio

Este ejemplo de Python usa el GitHub Copilot SDK como un estudio de exposiciones de museo enfocado.
La aplicación terminada tiene tres módulos:

- `curator.py` contiene los auxiliares ya preparados del taller: conjuntos de hechos aprobados y
  el menú de selección de hechos, validación de hechos acotada, streaming, comprobaciones
  estructurales deterministas, permisos de Wikipedia con ámbito, permiso de escritura de
  `exhibit.html` con ámbito, texto de prompt fijo y el mensaje de error.
- `system_messages.py` contiene los mensajes del sistema ya preparados del conservador y de
  investigación.
- `main.py` contiene el código del SDK escrito por el alumno: las instrucciones de los prompts
  de exposición y de página, la configuración de sesión, el ejecutor de sesión, la validación y la
  generación HTML opcional.

Los comentarios `>>> BEGIN` / `<<< END` de `main.py` son las regiones con nombre que rellenan las
lecciones. Cada línea `BEGIN` enumera los pasos que insertan o sustituyen esa región.

## Ejecuta el ejemplo

Desde este directorio, crea un entorno e instala la dependencia anclada:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Establece `COPILOT_MODEL` para seleccionar un modelo; de lo contrario, el runtime elige su valor
predeterminado. Se requiere GitHub Copilot CLI autenticado.

La investigación en Wikipedia requiere Node.js porque la sesión de investigación inicia el paquete
anclado `wikipedia-mcp@1.0.3` mediante `npx`. Rechazar la investigación no inicia el servidor MCP.

Comprueba el código fuente sin contactar con un modelo:

```powershell
python -m py_compile *.py
```

## Qué enseña el ejemplo

La generación siempre registra e incluye en la lista de permitidos `approved_fact_lookup`, que
devuelve los hechos aprobados acotados. Con investigación citada utilizable, también registra e
incluye en la lista de permitidos la herramienta local de solo lectura
`approved_wikipedia_fact_lookup`, y solicita ambas llamadas antes de escribir la narrativa y las
preguntas de visitantes. La segunda búsqueda devuelve una instantánea del cuerpo del resumen y las
citas, no acceso en vivo a Wikipedia. Los hechos aprobados tienen prioridad sobre la investigación
complementaria. También usa un mensaje del sistema del conservador en modo replace, streaming, un
tiempo de espera de 120 segundos y validación estructural determinista. Los módulos importados no
tienen efectos secundarios; `main.py` solo se ejecuta detrás de la protección
`if __name__ == "__main__"`.

La investigación opcional en Wikipedia está separada intencionadamente de la generación. La sesión
de investigación expone solo herramientas MCP de búsqueda en Wikipedia y lectura de artículos con
ámbito, usa un controlador de permisos que deniega de forma predeterminada, pide un resumen en prosa
y analiza una lista final `## Sources`. Tanto el resumen como las citas se conservan para la
búsqueda local, pero nunca se fusionan con los hechos aprobados por educadores. "Approved" significa
investigación aceptada por la aplicación, no hechos verificados por humanos; trátala como datos, no
como instrucciones. Rechazar la investigación conserva la ruta de una sola herramienta. Si la
investigación falla o el resumen citado no es utilizable, se imprime una advertencia y se aplica la
misma alternativa. No hay contrato JSON estricto de investigación ni bucle de aprobación de
adiciones propuestas.

Después de la validación, el cierre opcional HTML expone solo `builtin:apply_patch` y
`builtin:create` y aprueba escribir exactamente `exhibit.html` en el directorio de trabajo de la
aplicación. El prompt pide un único archivo HTML semántico independiente con CSS y JavaScript
insertados, una advertencia de revisión humana y un filtro de preguntas accesible.

Las directrices del prompt y la validación estructural no son límites de autorización ni de base
factual. Las afirmaciones generadas siguen requiriendo revisión humana o un evaluador aparte.

## Comprobación manual

1. Ejecuta con cada conjunto de hechos integrado y confirma que los hechos seleccionados se imprimen
   antes de la generación.
2. Confirma que la exposición tiene un título, una narrativa de 100-140 palabras y tres preguntas
   de visitantes.
3. Inspecciona el resumen de validación y el descargo sobre la base factual.
4. Rechaza la investigación y confirma que el único evento de herramienta es `approved_fact_lookup`.
5. Acepta la investigación y confirma que ambos eventos de búsqueda local aparecen antes de la generación y que las fuentes
   se imprimen después de la exposición, no dentro de ella.
6. Acepta `exhibit.html` y confirma que solo se escribe ese archivo.

Esta es la aplicación con la que acaba un alumno después de las lecciones de museo, no una
arquitectura de referencia aparte. El punto de entrada mantiene un pequeño ejecutor de sesión que
inicia el cliente, crea la sesión, impone el tiempo de espera, rechaza la salida en blanco y realiza
la limpieza en todas las rutas de ejecución; los pasos de investigación, generación y HTML opcional
lo reutilizan con distintas configuraciones de sesión. Sigue el itinerario desde
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
