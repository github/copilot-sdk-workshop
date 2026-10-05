# Paso 7: Ejecuta y explica la aplicación

> **Tiempo:** 10 minutos

## Qué estarás listo para explicar

Ejecutarás la aplicación completa y explicarás su estado, los límites de herramientas, el límite de
permisos y las limitaciones del informe.

## Ve todo el sistema de agente

:::language dotnet
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

El informe completado también está en [`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report).
:::

:::language python
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

El informe completado también está en [`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report).
:::

:::language go
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
La aplicación terminada es un host de agente. Su sesión coordina un modelo, una función propia de la
aplicación y un navegador que se ejecuta en otro proceso:

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## Lleva el diseño más allá de este taller

Comprender estos límites te permite reutilizar el diseño en otra aplicación en lugar de limitarte a
reproducir el código del taller. Una búsqueda en una base de datos, un servicio de despliegue o un
seguimiento de incidencias pueden usar herramientas diferentes, pero se aplican las mismas preguntas
sobre propiedad y confianza.

:::language dotnet
El flujo completo es
`URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report`.
:::

:::language nodejs
El flujo completo es
`URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report`.
:::

:::language python
El flujo completo es
`URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report`.
:::

:::language go
El flujo completo es
`URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report`.
:::

:::language rust
El flujo completo es
`URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report`.
:::

:::language java
El flujo completo es
`URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report`.
:::

## Da una vuelta de honor

No hay código que cambiar. Mantén en su sitio la implementación del Paso 6 para que esta ejecución
pruebe la aplicación que has creado.

## Ejecútalo

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Advertencia de la demostración local de Java:** Esta marca explícita es una solución temporal para
> [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273). Sin ella,
> la devolución de llamada rechaza por seguridad salvo que pueda verificar la URL exacta de la carga de permisos. Con ella,
> la sesión aprueba solo el tipo de permiso `mcp`, una solicitud cada vez, según la lista de permitidos de
> Playwright `browser_navigate` configurada; no puede exigir el destino exacto. Úsala solo para el
> destino local controlado del taller, nunca para direcciones URL de producción, compartidas o no fiables.
:::
Usa el destino del taller:

```text
{{TARGET_APP_URL}}
```

Observa las cinco fases:

1. El cliente se conecta y crea una sesión.
2. Playwright navega al destino exacto y crea una instantánea de accesibilidad.
3. El lector local acotado devuelve esa instantánea de la ejecución actual.
4. Se llama al catálogo local para buscar hallazgos compatibles con el navegador.
5. La respuesta sigue el contrato del informe y declara sus límites.

:::language dotnet
La transcripción variará, pero debería tener esta forma:

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
La transcripción variará, pero debería tener esta forma:

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse` imprime líneas de inicio/finalización de herramientas y transmite en streaming el texto del asistente a stdout.
:::

:::language python
La transcripción variará, pero debería tener esta forma:

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py` inicia `report.main`, que espera a `session.idle` después de transmitir deltas en streaming.
:::

:::language go
La transcripción variará, pero debería tener esta forma:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explica que `Client` es responsable del ciclo de vida de Copilot CLI, `Session` es responsable de
una conversación y el controlador de permisos restringe la navegación externa. El informe esperado
se ciñe a las evidencias.
:::

:::language rust
La transcripción variará, pero debería tener esta forma:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explica que `Client` administra el entorno de ejecución, `Session` distribuye eventos, las
herramientas tipadas son propias de la aplicación y el controlador de permisos solo confía en la
navegación exacta.
:::

:::language java
La transcripción variará, pero debería tener esta forma:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explica que Maven compila la aplicación Java 17, `CopilotClient` administra el entorno de ejecución
y las herramientas permanecen acotadas. De forma predeterminada, la devolución de llamada de
permisos acepta solo la URL canónica; con la marca explícita de demostración local se limita al tipo
`mcp` configurado, pero no puede verificar esa URL.
:::

El destino controlado incluye intencionadamente problemas observables por el navegador: falta una
alternativa de texto, no hay un punto de referencia `main`, la secuencia de encabezados no es lógica
y hay un cuadro de texto sin nombre accesible. Compara el informe con el
[HTML de destino publicado](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html);
no aceptes un hallazgo que no aparezca ni en la instantánea ni en el código fuente.

<details>
<summary>Solución de problemas de la ejecución completa</summary>

| Síntoma | Corrección |
|---|---|
| Se omite un problema conocido | La salida del agente puede variar. Vuelve a ejecutar una vez, pero exige evidencias en lugar de forzar una respuesta predeterminada. |
| Un problema notificado no está en la página | Recházalo por no estar fundamentado; el prompt requiere evidencias específicas del navegador. |
| Se deniega una herramienta | Comprueba que `browser_navigate` usa el destino introducido exacto. |
| El lector no encuentra ninguna instantánea | Mantén el orden del prompt: navega antes de llamar a `read_latest_accessibility_snapshot`. |
| El entorno de ejecución no puede iniciarse | Vuelve a autenticarte con `copilot login`, confirma que la CLI está en `PATH` y reintenta el comando de ejecución de tu lenguaje. |

</details>

> **Este paso está completo cuando:** el informe está fundamentado, los nombres de las herramientas son visibles,
> y puedes responder a las preguntas de arquitectura siguientes sin leer el código.

## Comprueba lo que has aprendido

1. ¿Qué estado pertenece a la sesión?
2. En el caso del catálogo WCAG, ¿por qué es local?
3. En el caso de Playwright, ¿por qué es externo?
4. ¿Dónde se aplican los permisos?
5. Al añadir otro servidor MCP, ¿qué cambia?

<details>
<summary>Compara tu explicación</summary>

1. La sesión es responsable de los mensajes de una conversación, la respuesta del modelo y los resultados de las herramientas.
2. La aplicación es responsable de los datos del catálogo y la búsqueda determinista, por lo que la función permanece local.
3. Playwright es una capacidad de navegador reutilizable con su propio proceso de Node.js y sus dependencias.
4. La lista de permitidos de herramientas MCP expone solo la navegación, y el controlador de permisos aprueba solo
   el destino exacto. El lector local de confianza no acepta ninguna ruta y lee solo una instantánea
   recién generada; el catálogo también es de solo lectura. Esas herramientas propias de la aplicación omiten el permiso.
5. Añade la configuración del servidor, expón solo las herramientas necesarias, define su directiva de confianza y sigue
   observando sus llamadas mediante el mismo flujo de eventos de sesión.

</details>

## Siguiente paso

Continúa con [Paso 8: Selecciona un modelo](08-model-selection.md) y después convierte tus hallazgos
en un informe HTML interactivo en el Paso 9.

## Más información

La aplicación del taller se ejecuta en tu equipo. Estas páginas explican qué cambia cuando el mismo
diseño se traslada a otro lugar.

- [Servicios de backend](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md):
  ejecutar el SDK en el servidor con una CLI sin interfaz gráfica en lugar de una local.
- [Escalado y multitenencia](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md):
  escalado horizontal y patrones de aislamiento que mantienen la sesión de un usuario aislada de la de otro.
- [Instrumentación de OpenTelemetry](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md):
  trazar llamadas a herramientas y turnos cuando el agente se ejecuta donde no puedes ver el terminal.
- [Integración con Microsoft Agent Framework](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md):
  colocar una sesión de Copilot dentro de un flujo de trabajo multiagente más amplio.
