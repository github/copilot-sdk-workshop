# Paso 3: Añade conocimiento propio de la aplicación

> **Tiempo:** 15 minutos

## Qué añadirás

Darás a Copilot una herramienta local con tipo que recupera un criterio y una corrección exactos del
catálogo Web Content Accessibility Guidelines (WCAG) propio de la aplicación.

## Da a Copilot una herramienta propia de tu aplicación

Las **llamadas a herramientas** permiten que el modelo solicite una capacidad mientras trabaja en
una respuesta. Una [**herramienta local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
se ejecuta dentro del proceso de tu aplicación. El modelo decide cuándo solicitarla, pero tu código
sigue controlando los datos, la validación, la ejecución y el resultado.

En este paso, expones orientación de WCAG propia de la aplicación como `accessibility_rule_lookup`,
registras esa herramienta con la sesión y la pones explícitamente a disposición del modelo.

## Trae tu propia fuente de verdad

El conocimiento general del modelo no sustituye a los datos que pertenecen a tu aplicación. Esta
herramienta local devuelve un resultado pequeño y exacto desde código determinista que puedes
probar, en lugar de poner todo el catálogo en cada prompt.

`skip permission` es deliberado aquí porque la herramienta solo lee datos propios de la aplicación.
El proceso MCP externo del paso siguiente usará en su lugar un límite de permisos.

:::language dotnet
## Conecta la búsqueda en C#

### 1. Añade la herramienta de búsqueda en el catálogo

En la parte superior de `Helpers/AccessibilityRuleCatalog.cs`, inserta:

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

Dentro de `AccessibilityRuleCatalog`, después del array `Rules` existente, inserta:

```csharp
public static AIFunction CreateLookupTool() => CopilotTool.DefineTool(
    ([Description("The accessibility issue or WCAG criterion to look up.")] string query) =>
        Task.FromResult(Lookup(query)),
    toolOptions: new CopilotToolOptions { SkipPermission = true },
    factoryOptions: new AIFunctionFactoryOptions
    {
        Name = "accessibility_rule_lookup",
        Description = "Looks up read-only WCAG guidance maintained by this application."
    });

public static AccessibilityRule Lookup(string query)
{
    var normalizedQuery = query.Trim();
    return Rules.FirstOrDefault(rule =>
               normalizedQuery.Contains(rule.Criterion, StringComparison.OrdinalIgnoreCase) ||
               normalizedQuery.Contains(rule.Title, StringComparison.OrdinalIgnoreCase) ||
               rule.Keywords.Any(keyword =>
                   normalizedQuery.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
           ?? new AccessibilityRule(
               "No exact match",
               "Criterion not found",
               "The issue is not represented in the workshop catalog.",
               "Verify the evidence and consult the complete WCAG reference.",
               []);
}
```

### 2. Muestra la actividad de la herramienta

En `Helpers/ResponseStreamer.cs`, inserta estos casos antes de `SessionIdleEvent`:

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. Registra y solicita la herramienta

Sustituye la configuración de la sesión y la llamada de envío en `Program.cs`:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    Tools = [AccessibilityRuleCatalog.CreateLookupTool()],
    AvailableTools = ["accessibility_rule_lookup"]
});

Console.WriteLine("\nCopilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Use accessibility_rule_lookup to explain how to fix an input with no accessible name.");
```

## Ejecútalo

```bash
dotnet run
```

Busca el nombre de la herramienta y su asignación a 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| No aparece ningún evento de herramienta | Mantén la instrucción explícita `Use accessibility_rule_lookup` en este paso de aprendizaje. |
| El compilador no encuentra `AIFunction` | Añade `using Microsoft.Extensions.AI;` al archivo del catálogo. |
| El resultado dice que no hay coincidencia exacta | Confirma que el prompt contiene `accessible name`, una palabra clave de los datos iniciales. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`Program.cs`:

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Application-owned WCAG guidance ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    Tools = [AccessibilityRuleCatalog.CreateLookupTool()],
    AvailableTools = ["accessibility_rule_lookup"]
});

Console.WriteLine("Copilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Use accessibility_rule_lookup to explain how to fix an input with no accessible name.");
```

La herramienta de catálogo y la búsqueda están en `Helpers/AccessibilityRuleCatalog.cs`. La
impresión del inicio y la finalización de herramientas está en `Helpers/ResponseStreamer.cs`.

</details>
:::

:::language nodejs
## Conecta la búsqueda en TypeScript

### 1. Inspecciona la herramienta con tipo ya preparada

Abre `src/workshop.ts`. El proyecto inicial ya importa el catálogo y define esta herramienta local:

```typescript
export const accessibilityRuleLookup = defineTool("accessibility_rule_lookup", {
  description: "Looks up read-only WCAG guidance maintained by this application.",
  parameters: z.object({ query: z.string().describe("The accessibility issue or WCAG criterion to look up.") }),
  skipPermission: true,
  handler: async ({ query }) => {
    const normalized = query.trim().toLowerCase();
    return accessibilityRules.find((rule) => normalized.includes(rule.criterion.toLowerCase()) || normalized.includes(rule.title.toLowerCase()) || rule.keywords.some((keyword) => normalized.includes(keyword))) ?? noMatch;
  },
});
```

El esquema de Zod da al modelo un argumento `query` con tipo. El controlador busca en
`accessibilityRules`, que sigue siendo propio de la aplicación. `skipPermission: true` es
intencional porque esta herramienta solo devuelve datos de solo lectura propios de la aplicación.

### 2. Confirma la impresión de actividad de la herramienta

En el mismo archivo, `streamResponse` ya imprime eventos del ciclo de vida de herramientas:

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

Mantén esas ramas para poder ver cuándo el modelo llama a la herramienta local.

### 3. Registra y solicita la herramienta

En `src/index.ts`, importa la herramienta junto con el auxiliar de streaming:

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

Sustituye la creación de la sesión y la llamada de envío:

```typescript
const session = await client.createSession({
  streaming: true,
  tools: [accessibilityRuleLookup],
  availableTools: ["accessibility_rule_lookup"],
});
try {
  await streamResponse(
    session,
    "Use accessibility_rule_lookup to explain WCAG 4.1.2.",
  );
} finally {
  await session.disconnect();
}
```

`tools` registra la implementación. `availableTools` es la lista de permitidos de herramientas que el modelo puede llamar.

## Ejecútalo

```bash
npm start
```

Busca el nombre de la herramienta y la orientación para WCAG 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| TypeScript no puede resolver `zod` | Ejecuta `npm install` en la carpeta del proyecto inicial. |
| No aparece ningún evento de herramienta | Mantén el nombre de la herramienta tanto en `tools` como en `availableTools`, y conserva la instrucción explícita en el prompt. |
| La búsqueda no devuelve ninguna coincidencia | Pregunta por `4.1.2` o `accessible name`, ambos representados en el catálogo. |
| Los eventos de herramienta nunca se imprimen | Confirma que `streamResponse` siga gestionando `tool.execution_start` y `tool.execution_complete`. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    tools: [accessibilityRuleLookup],
    availableTools: ["accessibility_rule_lookup"],
  });
  try {
    await streamResponse(session, "Use accessibility_rule_lookup to explain WCAG 4.1.2.");
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

La definición de la herramienta con tipo y la impresión de actividad de herramientas están en `src/workshop.ts`.

</details>
:::

:::language python
## Conecta la búsqueda en Python

### 1. Inspecciona la herramienta con tipo ya preparada

Abre `workshop.py`. El proyecto inicial ya define el modelo de parámetros y la herramienta local:

```python
class LookupParams(BaseModel):
    query: str = Field(description="The accessibility issue or WCAG criterion to look up.")


@define_tool(name="accessibility_rule_lookup", description="Looks up read-only WCAG guidance maintained by this application.", skip_permission=True)
def accessibility_rule_lookup(params: LookupParams) -> dict[str, object]:
    query = params.query.strip().lower()
    rule = next((item for item in ACCESSIBILITY_RULES if item.criterion.lower() in query or item.title.lower() in query or any(keyword in query for keyword in item.keywords)), None)
    if rule is None:
        return {"criterion": "No exact match", "title": "Criterion not found", "when_it_applies": "The issue is not represented in the workshop catalog.", "recommendation": "Verify the evidence and consult the complete WCAG reference."}
    return rule.__dict__
```

Pydantic describe el argumento visible para el modelo, mientras el controlador busca en
`ACCESSIBILITY_RULES`, que sigue siendo propio de la aplicación. `skip_permission=True` es
intencional porque esta herramienta solo devuelve datos de solo lectura propios de la aplicación.

### 2. Registra y solicita la herramienta

En `main.py`, importa la herramienta:

```python
from workshop import accessibility_rule_lookup
```

Sustituye la creación de la sesión y la llamada de envío. Mantén el controlador de eventos del Paso 2 dentro del bloque de la sesión:

```python
async with await client.create_session(
    streaming=True,
    tools=[accessibility_rule_lookup],
    available_tools=["accessibility_rule_lookup"],
) as session:
    done = asyncio.Event()
    error: RuntimeError | None = None
    received_delta = False

    def on_event(event) -> None:
        nonlocal error, received_delta
        match event.data:
            case AssistantMessageDeltaData(delta_content=delta) if delta:
                received_delta = True
                print(delta, end="", flush=True)
            case AssistantMessageData(content=content) if content and not received_delta:
                print(content)
            case SessionErrorData(message=message):
                error = RuntimeError(message)
                done.set()
            case SessionIdleData():
                done.set()

    session.on(on_event)
    await session.send(
        "Use accessibility_rule_lookup to explain WCAG 4.1.2."
    )
    await done.wait()
    if error is not None:
        raise error
```

`tools` registra la implementación. `available_tools` es la lista de permitidos de herramientas que el modelo puede llamar.

## Ejecútalo

```bash
python main.py
```

La respuesta debería usar el título y la recomendación de WCAG 4.1.2 del catálogo:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| Python no puede importar `pydantic` | Activa el entorno virtual de preparación y reinstala `requirements.txt`. |
| No se llama a la herramienta | Mantenla tanto en `tools` como en `available_tools`, y conserva la instrucción explícita en el prompt. |
| La búsqueda no devuelve ninguna coincidencia | Pregunta por `4.1.2` o `accessible name`, ambos representados en el catálogo. |
| Error de importación de `accessibility_rule_lookup` | Confirma que `from workshop import accessibility_rule_lookup` esté presente en `main.py`. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`main.py`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData

from workshop import accessibility_rule_lookup


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            tools=[accessibility_rule_lookup],
            available_tools=["accessibility_rule_lookup"],
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send("Use accessibility_rule_lookup to explain WCAG 4.1.2.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

La definición de la herramienta con tipo está en `workshop.py`.

</details>
:::

:::language go
## Conecta la búsqueda en Go

### 1. Añade la búsqueda con tipo

Añade `strings` a las importaciones en `main.go` y después añade estas declaraciones antes de `streamResponse`:

```go
type lookupParams struct {
	Query string `json:"query" jsonschema:"The accessibility issue or WCAG criterion to look up."`
}

func accessibilityRuleLookup(params lookupParams, _ copilot.ToolInvocation) (any, error) {
	query := strings.ToLower(params.Query)
	if strings.Contains(query, "4.1.2") || strings.Contains(query, "accessible name") {
		return map[string]string{
			"criterion":      "4.1.2",
			"title":          "Name, Role, Value",
			"recommendation": "Associate each input with a visible label.",
		}, nil
	}
	return map[string]string{
		"criterion":      "No exact match",
		"recommendation": "Verify the evidence and consult the WCAG reference.",
	}, nil
}
```

### 2. Define y registra la herramienta

Al principio de `main`, crea la herramienta:

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

Sustituye la configuración de la sesión y el envío final:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:      copilot.Bool(true),
	Tools:          []copilot.Tool{lookup},
	AvailableTools: []string{"accessibility_rule_lookup"},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()

if err := streamResponse(
	session,
	"Use accessibility_rule_lookup to explain WCAG 4.1.2.",
); err != nil {
	panic(err)
}
```

`Tools` registra la implementación. `AvailableTools` es la lista de permitidos de herramientas que
el modelo puede llamar. `SkipPermission = true` es intencional porque esta herramienta solo devuelve
datos de solo lectura propios de la aplicación.

## Ejecútalo

```bash
go run .
```

La respuesta transmitida en streaming debería usar el resultado de búsqueda para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| `strings` no está definido | Añade la importación `strings` de la biblioteca estándar. |
| El modelo no puede ver la herramienta | Mantén la herramienta en `Tools` y su nombre exacto en `AvailableTools`. |
| La búsqueda no devuelve ninguna coincidencia | Pregunta por `4.1.2` o `accessible name`. |
| La compilación falla en `DefineTool` | Confirma que la firma del controlador sea `(lookupParams, copilot.ToolInvocation) (any, error)`. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`main.go`:

```go
package main

import (
	"context"
	"fmt"
	"strings"

	copilot "github.com/github/copilot-sdk/go"
)

type lookupParams struct {
	Query string `json:"query" jsonschema:"The accessibility issue or WCAG criterion to look up."`
}

func accessibilityRuleLookup(params lookupParams, _ copilot.ToolInvocation) (any, error) {
	query := strings.ToLower(params.Query)
	if strings.Contains(query, "4.1.2") || strings.Contains(query, "accessible name") {
		return map[string]string{
			"criterion":      "4.1.2",
			"title":          "Name, Role, Value",
			"recommendation": "Associate each input with a visible label.",
		}, nil
	}
	return map[string]string{
		"criterion":      "No exact match",
		"recommendation": "Verify the evidence and consult the WCAG reference.",
	}, nil
}

func streamResponse(session *copilot.Session, prompt string) error {
	receivedDelta := false
	unsubscribe := session.On(func(event copilot.SessionEvent) {
		if delta, ok := event.Data.(*copilot.AssistantMessageDeltaData); ok {
			receivedDelta = true
			fmt.Print(delta.DeltaContent)
		}
	})
	defer unsubscribe()
	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{Prompt: prompt})
	if err == nil && !receivedDelta && response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Print(message.Content)
		}
	}
	fmt.Println()
	return err
}

func main() {
	lookup := copilot.DefineTool(
		"accessibility_rule_lookup",
		"Looks up read-only WCAG guidance maintained by this application.",
		accessibilityRuleLookup,
	)
	lookup.SkipPermission = true

	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming:      copilot.Bool(true),
		Tools:          []copilot.Tool{lookup},
		AvailableTools: []string{"accessibility_rule_lookup"},
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Use accessibility_rule_lookup to explain WCAG 4.1.2."); err != nil {
		panic(err)
	}
}
```

</details>
:::

:::language rust
## Conecta la búsqueda en Rust

### 1. Añade el controlador con tipo

Añade estas importaciones cerca de la parte superior de `src/main.rs`:

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

Sustituye las importaciones más reducidas del SDK del Paso 2 y después añade el controlador con tipo antes de `stream_response`:

```rust
#[derive(Deserialize, JsonSchema)]
struct LookupParams {
    /// The accessibility issue or WCAG criterion to look up.
    query: String,
}

struct AccessibilityRuleLookup;

#[async_trait]
impl ToolHandler for AccessibilityRuleLookup {
    async fn call(&self, invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let params: LookupParams = serde_json::from_value(invocation.arguments)?;
        let result = if params.query.to_lowercase().contains("4.1.2") {
            r#"{"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}"#
        } else {
            r#"{"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}"#
        };
        Ok(ToolResult::Text(result.to_owned()))
    }
}
```

### 2. Define y registra la herramienta

Al principio de `main`, crea la herramienta y añádela a la configuración de la sesión:

```rust
let lookup = Tool::new("accessibility_rule_lookup")
    .with_description("Looks up read-only WCAG guidance maintained by this application.")
    .with_parameters(schema_for::<LookupParams>())
    .with_skip_permission(true)
    .with_handler(Arc::new(AccessibilityRuleLookup));

let client = Client::start(ClientOptions::default()).await?;
let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup]);
config.available_tools = Some(vec!["accessibility_rule_lookup".to_owned()]);
let session = client.create_session(config).await?;

stream_response!(
    session,
    "Use accessibility_rule_lookup to explain WCAG 4.1.2.".to_owned()
);
```

Mantén la desconexión y el cierre del cliente del Paso 2 después de la llamada a la macro.
`config.tools` registra la implementación. `config.available_tools` es la lista de permitidos de
herramientas que el modelo puede llamar. `with_skip_permission(true)` es intencional porque esta
herramienta solo devuelve datos de solo lectura propios de la aplicación.

## Ejecútalo

```bash
cargo run
```

La respuesta transmitida en streaming debería usar el resultado de búsqueda para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| Un trait o derive no se resuelve | Mantén las importaciones de `async_trait`, `serde`, esquema y herramienta mostradas arriba. |
| El modelo no puede ver la herramienta | Define tanto `config.tools` como `config.available_tools`. |
| La búsqueda no devuelve ninguna coincidencia | Pregunta explícitamente por `4.1.2`. |
| Errores de tipo del controlador | Confirma que `ToolHandler::call` devuelva `Result<ToolResult, Error>`. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`src/main.rs`:

```rust
use std::io::{self, Write};
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;

#[derive(Deserialize, JsonSchema)]
struct LookupParams {
    /// The accessibility issue or WCAG criterion to look up.
    query: String,
}

struct AccessibilityRuleLookup;

#[async_trait]
impl ToolHandler for AccessibilityRuleLookup {
    async fn call(&self, invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let params: LookupParams = serde_json::from_value(invocation.arguments)?;
        let result = if params.query.to_lowercase().contains("4.1.2") {
            r#"{"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}"#
        } else {
            r#"{"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}"#
        };
        Ok(ToolResult::Text(result.to_owned()))
    }
}

macro_rules! stream_response {
    ($session:expr, $prompt:expr) => {{
        let mut events = $session.subscribe();
        let send = $session.send($prompt);
        tokio::pin!(send);
        let mut sent = false;
        let mut idle = false;
        let mut received_delta = false;

        while !sent || !idle {
            tokio::select! {
                result = &mut send, if !sent => {
                    result?;
                    sent = true;
                }
                event = events.recv() => {
                    let event = event?;
                    match event.event_type.as_str() {
                        "assistant.message_delta" => {
                            if let Some(delta) = event.data.get("deltaContent").and_then(|value| value.as_str()) {
                                received_delta = true;
                                print!("{delta}");
                                io::stdout().flush()?;
                            }
                        }
                        "assistant.message" if !received_delta => {
                            if let Some(content) = event.data.get("content").and_then(|value| value.as_str()) {
                                print!("{content}");
                                io::stdout().flush()?;
                            }
                        }
                        "session.error" => {
                            let message = event.data.get("message").and_then(|value| value.as_str())
                                .unwrap_or("Copilot session failed");
                            return Err(std::io::Error::new(std::io::ErrorKind::Other, message.to_owned()).into());
                        }
                        "session.idle" => idle = true,
                        _ => {}
                    }
                }
            }
        }
        println!();
    }};
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let lookup = Tool::new("accessibility_rule_lookup")
        .with_description("Looks up read-only WCAG guidance maintained by this application.")
        .with_parameters(schema_for::<LookupParams>())
        .with_skip_permission(true)
        .with_handler(Arc::new(AccessibilityRuleLookup));

    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    config.tools = Some(vec![lookup]);
    config.available_tools = Some(vec!["accessibility_rule_lookup".to_owned()]);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Use accessibility_rule_lookup to explain WCAG 4.1.2.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

</details>
:::

:::language java
## Conecta la búsqueda en Java

### 1. Añade la búsqueda con tipo

Añade estas importaciones a `src/main/java/workshop/AccessibilityReport.java`:

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

Añade este método antes de la llave de cierre de la clase:

```java
private static String lookupRule(String query) {
    if (query.toLowerCase(java.util.Locale.ROOT).contains("4.1.2")) {
        return """
                {"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}""";
    }
    return """
            {"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}""";
}
```

### 2. Define y registra la herramienta

Al principio de `main`, define la herramienta y la configuración de la sesión:

```java
var lookup = ToolDefinition.from(
        "accessibility_rule_lookup",
        "Looks up read-only WCAG guidance maintained by this application.",
        Param.of(String.class, "query",
                "The accessibility issue or WCAG criterion to look up."),
        AccessibilityReport::lookupRule).skipPermission(true);
var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup))
        .setAvailableTools(List.of("accessibility_rule_lookup"))
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
```

Sustituye la creación de la sesión y el prompt dentro del bloque de cliente:

```java
var session = client.createSession(config).get();
var response = session.sendAndWait(new MessageOptions()
        .setPrompt("Use accessibility_rule_lookup to explain WCAG 4.1.2."))
        .get();
if (response == null) {
    throw new IllegalStateException("Copilot completed without an assistant message.");
}
System.out.println(response.getData().content());
```

`setTools` registra la implementación. `setAvailableTools` es la lista de permitidos de herramientas
que el modelo puede llamar. `skipPermission(true)` es intencional porque esta herramienta solo
devuelve datos de solo lectura propios de la aplicación. Mantén el controlador de permisos del Paso
1 hasta que el Paso 4 lo sustituya por el controlador de Playwright con ámbito. La implementación de
Java usa una sesión con streaming habilitado y `sendAndWait`, por lo que imprime la respuesta
completada cuando termina el turno.

## Ejecútalo

```bash
./mvnw compile exec:java
```

La respuesta debería usar el resultado de búsqueda para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| `ToolDefinition` o `Param` no se resuelven | Añade las dos importaciones de herramientas de Copilot mostradas arriba. |
| El modelo no puede ver la herramienta | Mantén `setTools` y `setAvailableTools` en la misma configuración de sesión. |
| La búsqueda no devuelve ninguna coincidencia | Pregunta explícitamente por `4.1.2`. |
| Falla la referencia al método | Confirma que `lookupRule` sea `private static` y acepte un solo `String`. |

</details>

<details>
<summary>Implementación completa del Paso 3</summary>

Compara tu versión con esta implementación completa del Paso 3.

`AccessibilityReport.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        var lookup = ToolDefinition.from(
                "accessibility_rule_lookup",
                "Looks up read-only WCAG guidance maintained by this application.",
                Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
                AccessibilityReport::lookupRule).skipPermission(true);
        var config = new SessionConfig()
                .setStreaming(true)
                .setTools(List.of(lookup))
                .setAvailableTools(List.of("accessibility_rule_lookup"))
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);

        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(config).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Use accessibility_rule_lookup to explain WCAG 4.1.2."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }

    private static String lookupRule(String query) {
        if (query.toLowerCase(java.util.Locale.ROOT).contains("4.1.2")) {
            return """
                    {"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}""";
        }
        return """
                {"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}""";
    }
}
```

</details>
:::

> **Estarás listo para Playwright cuando:** la respuesta use el criterio 4.1.2 del catálogo de la aplicación.

## Comprueba lo que has aprendido

¿Calcular el total de un pedido a partir de líneas de pedido propias de la aplicación debería ser
una herramienta local o un servidor MCP?

<details>
<summary>Comprueba tu respuesta</summary>

Normalmente, una herramienta local. La aplicación posee las líneas de pedido y el cálculo
determinista, así que una función en proceso es más fácil de probar y no cruza un límite de proceso.

</details>

## Más información

- [Trabajar con hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  callbacks que el runtime invoca alrededor de cada llamada a herramienta, para auditoría o políticas
  propias.
- [Hook posterior al uso de herramientas](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspeccionar o reescribir el resultado de una herramienta antes de que lo vea el modelo.
- [Skills personalizados](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  empaquetar instrucciones reutilizables que se cargan junto a las herramientas que registra una
  sesión.

Continúa con [Paso 4: Conecta una herramienta externa de forma segura](04-mcp-safety.md).
