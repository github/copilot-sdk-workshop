# Etapa 3: Adicione conhecimento pertencente ao aplicativo

> **Tempo:** 15 minutos

## O que você vai adicionar

Você vai dar ao Copilot uma ferramenta local tipada que recupera um critério e uma remediação exatos
do catálogo de Web Content Accessibility Guidelines (WCAG) pertencente ao aplicativo.

## Dê ao Copilot uma ferramenta pertencente ao aplicativo

A **chamada de ferramentas** permite que o modelo solicite uma capacidade enquanto trabalha em uma
resposta. Uma [**ferramenta local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
é executada dentro do processo do aplicativo. O modelo decide quando solicitá-la, mas seu código
ainda controla os dados, a validação, a execução e o resultado.

Nesta etapa, você expõe a orientação de WCAG pertencente ao aplicativo como
`accessibility_rule_lookup`, registra essa ferramenta na sessão e a disponibiliza explicitamente
para o modelo.

## Traga sua própria fonte da verdade

O conhecimento geral do modelo não substitui os dados pertencentes ao aplicativo. Esta ferramenta
local retorna um resultado pequeno e exato a partir de código determinístico que você pode testar,
em vez de colocar o catálogo completo em cada prompt.

`skip permission` é deliberado aqui porque a ferramenta apenas lê dados pertencentes ao aplicativo.
O processo MCP externo na próxima etapa usará um limite de permissão.

:::language dotnet
## Conecte a consulta em C#

### 1. Adicione a ferramenta de consulta ao catálogo

No início de `Helpers/AccessibilityRuleCatalog.cs`, insira:

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

Dentro de `AccessibilityRuleCatalog`, depois do array `Rules` existente, insira:

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

### 2. Mostre a atividade da ferramenta

Em `Helpers/ResponseStreamer.cs`, insira estes casos antes de `SessionIdleEvent`:

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. Registre e solicite a ferramenta

Substitua a configuração da sessão e a chamada de envio em `Program.cs`:

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

## Execute

```bash
dotnet run
```

Procure o nome da ferramenta e o mapeamento dela para 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| Nenhum evento de ferramenta aparece | Mantenha a instrução explícita `Use accessibility_rule_lookup` nesta etapa de aprendizado. |
| O compilador não consegue encontrar `AIFunction` | Adicione `using Microsoft.Extensions.AI;` ao arquivo de catálogo. |
| O resultado informa que não há correspondência exata | Confirme que o prompt contém `accessible name`, uma palavra-chave nos dados do projeto inicial. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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

A ferramenta de catálogo e a consulta ficam em `Helpers/AccessibilityRuleCatalog.cs`. A impressão do
início e da conclusão da ferramenta fica em `Helpers/ResponseStreamer.cs`.

</details>
:::

:::language nodejs
## Conecte a consulta em TypeScript

### 1. Inspecione a ferramenta tipada já incluída

Abra `src/workshop.ts`. O projeto inicial já importa o catálogo e define esta ferramenta local:

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

O esquema Zod dá ao modelo um argumento `query` tipado. O manipulador pesquisa `accessibilityRules`,
que permanece pertencente ao aplicativo. `skipPermission: true` é intencional porque esta ferramenta
retorna apenas dados somente leitura pertencentes ao aplicativo.

### 2. Confirme a impressão da atividade da ferramenta

No mesmo arquivo, `streamResponse` já imprime eventos do ciclo de vida da ferramenta:

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

Mantenha esses ramos para ver quando o modelo chama a ferramenta local.

### 3. Registre e solicite a ferramenta

Em `src/index.ts`, importe a ferramenta com o auxiliar de streaming:

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

Substitua a criação da sessão e a chamada de envio:

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

`tools` registra a implementação. `availableTools` é a lista de permissões que o modelo pode chamar.

## Execute

```bash
npm start
```

Procure o nome da ferramenta e a orientação para WCAG 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| TypeScript não consegue resolver `zod` | Execute `npm install` na pasta do projeto inicial. |
| Nenhum evento de ferramenta aparece | Mantenha o nome da ferramenta em `tools` e `availableTools`, e mantenha a instrução explícita no prompt. |
| A consulta não retorna correspondência | Pergunte sobre `4.1.2` ou `accessible name`, ambos representados no catálogo. |
| Eventos de ferramenta nunca são impressos | Confirme que `streamResponse` ainda manipula `tool.execution_start` e `tool.execution_complete`. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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

A definição da ferramenta tipada e a impressão da atividade da ferramenta ficam em `src/workshop.ts`.

</details>
:::

:::language python
## Conecte a consulta em Python

### 1. Inspecione a ferramenta tipada já incluída

Abra `workshop.py`. O projeto inicial já define o modelo de parâmetros e a ferramenta local:

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

O Pydantic descreve o argumento visível para o modelo enquanto o manipulador pesquisa
`ACCESSIBILITY_RULES`, que permanece pertencente ao aplicativo. `skip_permission=True` é intencional
porque esta ferramenta retorna apenas dados somente leitura pertencentes ao aplicativo.

### 2. Registre e solicite a ferramenta

Em `main.py`, importe a ferramenta:

```python
from workshop import accessibility_rule_lookup
```

Substitua a criação da sessão e a chamada de envio. Mantenha o manipulador de eventos da Etapa 2 dentro do bloco da sessão:

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

`tools` registra a implementação. `available_tools` é a lista de permissões que o modelo pode chamar.

## Execute

```bash
python main.py
```

A resposta deve usar o título e a recomendação de WCAG 4.1.2 do catálogo:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| Python não consegue importar `pydantic` | Ative o ambiente virtual da preparação e reinstale `requirements.txt`. |
| A ferramenta não é chamada | Mantenha-a em `tools` e `available_tools`, e mantenha a instrução explícita no prompt. |
| A consulta não retorna correspondência | Pergunte sobre `4.1.2` ou `accessible name`, ambos representados no catálogo. |
| Erro de importação para `accessibility_rule_lookup` | Confirme que `from workshop import accessibility_rule_lookup` está presente em `main.py`. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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

A definição da ferramenta tipada fica em `workshop.py`.

</details>
:::

:::language go
## Conecte a consulta em Go

### 1. Adicione a consulta tipada

Adicione `strings` às importações em `main.go`; depois, adicione estas declarações antes de `streamResponse`:

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

### 2. Defina e registre a ferramenta

No início de `main`, crie a ferramenta:

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

Substitua a configuração da sessão e o envio final:

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

`Tools` registra a implementação. `AvailableTools` é a lista de permissões que o modelo pode chamar.
`SkipPermission = true` é intencional porque esta ferramenta retorna apenas dados somente leitura
pertencentes ao aplicativo.

## Execute

```bash
go run .
```

A resposta transmitida em streaming deve usar o resultado da consulta para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| `strings` não está definido | Adicione a importação `strings` da biblioteca padrão. |
| O modelo não consegue ver a ferramenta | Mantenha a ferramenta em `Tools` e seu nome exato em `AvailableTools`. |
| A consulta não retorna correspondência | Pergunte sobre `4.1.2` ou `accessible name`. |
| A compilação falha em `DefineTool` | Confirme que a assinatura do manipulador é `(lookupParams, copilot.ToolInvocation) (any, error)`. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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
## Conecte a consulta em Rust

### 1. Adicione o manipulador tipado

Adicione estas importações perto do início de `src/main.rs`:

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

Substitua as importações mais restritas do SDK na Etapa 2; depois, adicione o manipulador tipado antes de `stream_response`:

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

### 2. Defina e registre a ferramenta

No início de `main`, crie a ferramenta e adicione-a à configuração da sessão:

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

Mantenha a desconexão da Etapa 2 e o desligamento do cliente após a chamada da macro. `config.tools`
registra a implementação. `config.available_tools` é a lista de permissões que o modelo pode chamar.
`with_skip_permission(true)` é intencional porque esta ferramenta retorna apenas dados somente
leitura pertencentes ao aplicativo.

## Execute

```bash
cargo run
```

A resposta transmitida em streaming deve usar o resultado da consulta para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| Um trait ou derive não foi resolvido | Mantenha as importações de `async_trait`, `serde`, schema e ferramenta mostradas acima. |
| O modelo não consegue ver a ferramenta | Defina tanto `config.tools` quanto `config.available_tools`. |
| A consulta não retorna correspondência | Pergunte explicitamente sobre `4.1.2`. |
| Erros de tipo do manipulador | Confirme que `ToolHandler::call` retorna `Result<ToolResult, Error>`. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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
## Conecte a consulta em Java

### 1. Adicione a consulta tipada

Adicione estas importações a `src/main/java/workshop/AccessibilityReport.java`:

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

Adicione este método antes da chave de fechamento da classe:

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

### 2. Defina e registre a ferramenta

No início de `main`, defina a ferramenta e a configuração da sessão:

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

Substitua a criação da sessão e o prompt dentro do bloco do cliente:

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

`setTools` registra a implementação. `setAvailableTools` é a lista de permissões que o modelo pode
chamar. `skipPermission(true)` é intencional porque esta ferramenta retorna apenas dados somente
leitura pertencentes ao aplicativo. Mantenha o manipulador de permissões da Etapa 1 até que a Etapa
4 o substitua pelo manipulador com escopo do Playwright. A implementação Java usa uma sessão com
streaming habilitado e `sendAndWait`, por isso imprime a resposta concluída quando o turno termina.

## Execute

```bash
./mvnw compile exec:java
```

A resposta deve usar o resultado da consulta para WCAG 4.1.2:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| `ToolDefinition` ou `Param` não foi resolvido | Adicione as duas importações de ferramenta do Copilot mostradas acima. |
| O modelo não consegue ver a ferramenta | Mantenha `setTools` e `setAvailableTools` na mesma configuração de sessão. |
| A consulta não retorna correspondência | Pergunte explicitamente sobre `4.1.2`. |
| A referência de método falha | Confirme que `lookupRule` é `private static` e aceita uma única `String`. |

</details>

<details>
<summary>Implementação completa da Etapa 3</summary>

Compare sua versão com esta implementação completa da Etapa 3.

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

> **Você estará pronto para o Playwright quando:** a resposta usar o critério 4.1.2 do catálogo do aplicativo.

## Verifique seu entendimento

Calcular o total de um pedido a partir de itens de linha pertencentes ao aplicativo deve ser uma
ferramenta local ou um servidor MCP?

<details>
<summary>Verifique sua resposta</summary>

Geralmente, uma ferramenta local. O aplicativo possui os itens de linha e o cálculo determinístico,
portanto uma função executada no próprio processo é mais fácil de testar e não cruza um limite de
processo.

</details>

## Saiba mais

- [Como trabalhar com hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  callbacks que o runtime invoca em torno de cada chamada de ferramenta, para auditoria ou política sob seu controle.
- [Hook pós-uso de ferramenta](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspecionar ou reescrever o resultado de uma ferramenta antes que o modelo o veja.
- [Skills personalizadas](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  empacotar instruções reutilizáveis que são carregadas junto às ferramentas que uma sessão registra.

Continue para [Etapa 4: Conecte uma ferramenta externa com segurança](04-mcp-safety.md).
