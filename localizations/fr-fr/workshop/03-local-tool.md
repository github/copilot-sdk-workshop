# Étape 3 : Ajoutez des connaissances propres à l'application

> **Durée :** 15 minutes

## Ce que vous allez ajouter

Vous allez donner à Copilot un outil local typé qui récupère un critère exact et une correction dans
le catalogue Web Content Accessibility Guidelines (WCAG) propre à l'application.

## Donnez à Copilot un outil propre à votre application

**L'appel d'outil** permet au modèle de demander une capacité pendant qu'il travaille sur une
réponse. Un [**outil local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
s'exécute dans le processus de votre application. Le modèle décide quand le demander, mais votre
code reste propriétaire des données, de la validation, de l'exécution et du résultat.

Dans cette étape, vous exposez les conseils WCAG propres à l'application sous la forme
`accessibility_rule_lookup`, enregistrez cet outil auprès de la session et le rendez explicitement
disponible pour le modèle.

## Apportez votre propre source de vérité

Les connaissances générales du modèle ne remplacent pas les données que votre application possède.
Cet outil local renvoie un petit résultat exact depuis du code déterministe que vous pouvez tester,
au lieu de placer le catalogue complet dans chaque prompt.

`skip permission` est volontaire ici, car l'outil ne fait que lire des données propres à
l'application. Le processus MCP externe de l'étape suivante utilisera plutôt une frontière
d'autorisation.

:::language dotnet
## Configurez la recherche C#

### 1. Ajoutez l'outil de recherche dans le catalogue

En haut de `Helpers/AccessibilityRuleCatalog.cs`, insérez :

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

Dans `AccessibilityRuleCatalog`, après le tableau `Rules` existant, insérez :

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

### 2. Affichez l'activité de l'outil

Dans `Helpers/ResponseStreamer.cs`, insérez ces cas avant `SessionIdleEvent` :

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. Enregistrez et demandez l'outil

Remplacez la configuration de session et l'appel d'envoi dans `Program.cs` :

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

## Exécutez-le

```bash
dotnet run
```

Recherchez le nom de l'outil et sa correspondance avec 4.1.2 :

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Aucun événement d'outil n'apparaît | Conservez l'instruction explicite `Use accessibility_rule_lookup` dans cette étape d'apprentissage. |
| Le compilateur ne trouve pas `AIFunction` | Ajoutez `using Microsoft.Extensions.AI;` au fichier de catalogue. |
| Le résultat indique qu'aucune correspondance exacte n'est trouvée | Vérifiez que le prompt contient `accessible name`, un mot-clé dans les données de départ. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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

L'outil de catalogue et la recherche se trouvent dans `Helpers/AccessibilityRuleCatalog.cs`.
L'affichage du démarrage et de la fin d'outil se trouve dans `Helpers/ResponseStreamer.cs`.

</details>
:::

:::language nodejs
## Configurez la recherche TypeScript

### 1. Inspectez l'outil typé fourni

Ouvrez `src/workshop.ts`. Le projet de départ importe déjà le catalogue et définit cet outil local :

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

Le schéma Zod donne au modèle un argument `query` typé. Le gestionnaire recherche dans
`accessibilityRules`, qui reste propre à l'application. `skipPermission: true` est intentionnel, car
cet outil ne renvoie que des données en lecture seule propres à l'application.

### 2. Vérifiez l'affichage de l'activité de l'outil

Dans le même fichier, `streamResponse` affiche déjà les événements de cycle de vie des outils :

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

Conservez ces branches afin de voir quand le modèle appelle l'outil local.

### 3. Enregistrez et demandez l'outil

Dans `src/index.ts`, importez l'outil avec l'utilitaire de streaming :

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

Remplacez la création de session et l'appel d'envoi :

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

`tools` enregistre l'implémentation. `availableTools` est la liste d'autorisation des outils que le modèle peut appeler.

## Exécutez-le

```bash
npm start
```

Recherchez le nom de l'outil et les conseils pour WCAG 4.1.2 :

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| TypeScript ne peut pas résoudre `zod` | Exécutez `npm install` dans le dossier du projet de départ. |
| Aucun événement d'outil n'apparaît | Conservez le nom de l'outil à la fois dans `tools` et `availableTools`, et conservez l'instruction explicite dans le prompt. |
| La recherche ne renvoie aucune correspondance | Posez une question sur `4.1.2` ou `accessible name`, tous deux représentés dans le catalogue. |
| Les événements d'outil ne s'affichent jamais | Vérifiez que `streamResponse` traite toujours `tool.execution_start` et `tool.execution_complete`. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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

La définition de l'outil typé et l'affichage de l'activité de l'outil se trouvent dans `src/workshop.ts`.

</details>
:::

:::language python
## Configurez la recherche Python

### 1. Inspectez l'outil typé fourni

Ouvrez `workshop.py`. Le projet de départ définit déjà le modèle de paramètres et l'outil local :

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

Pydantic décrit l'argument visible par le modèle tandis que le gestionnaire recherche dans
`ACCESSIBILITY_RULES`, qui reste propre à l'application. `skip_permission=True` est intentionnel
parce que cet outil ne renvoie que des données en lecture seule propres à l'application.

### 2. Enregistrez et demandez l'outil

Dans `main.py`, importez l'outil :

```python
from workshop import accessibility_rule_lookup
```

Remplacez la création de session et l'appel d'envoi. Conservez le gestionnaire d'événements de l'étape 2 dans le bloc de session :

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

`tools` enregistre l'implémentation. `available_tools` est la liste d'autorisation des outils que le modèle peut appeler.

## Exécutez-le

```bash
python main.py
```

La réponse doit utiliser le titre et la recommandation WCAG 4.1.2 du catalogue :

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Python ne peut pas importer `pydantic` | Activez l'environnement virtuel de préparation et réinstallez `requirements.txt`. |
| L'outil n'est pas appelé | Conservez-le à la fois dans `tools` et `available_tools`, et conservez l'instruction explicite dans le prompt. |
| La recherche ne renvoie aucune correspondance | Posez une question sur `4.1.2` ou `accessible name`, tous deux représentés dans le catalogue. |
| Erreur d'importation pour `accessibility_rule_lookup` | Vérifiez que `from workshop import accessibility_rule_lookup` est présent dans `main.py`. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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

La définition de l'outil typé se trouve dans `workshop.py`.

</details>
:::

:::language go
## Configurez la recherche Go

### 1. Ajoutez la recherche typée

Ajoutez `strings` aux imports dans `main.go`, puis ajoutez ces déclarations avant `streamResponse` :

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

### 2. Définissez et enregistrez l'outil

Au début de `main`, créez l'outil :

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

Remplacez la configuration de session et l'envoi final :

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

`Tools` enregistre l'implémentation. `AvailableTools` est la liste d'autorisation des outils que le
modèle peut appeler. `SkipPermission = true` est intentionnel, car cet outil ne renvoie que des
données en lecture seule propres à l'application.

## Exécutez-le

```bash
go run .
```

La réponse diffusée en streaming doit utiliser le résultat de recherche pour WCAG 4.1.2 :

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `strings` n'est pas défini | Ajoutez l'import `strings` de la bibliothèque standard. |
| Le modèle ne voit pas l'outil | Conservez l'outil dans `Tools` et son nom exact dans `AvailableTools`. |
| La recherche ne renvoie aucune correspondance | Posez une question sur `4.1.2` ou `accessible name`. |
| La compilation échoue sur `DefineTool` | Vérifiez que la signature du gestionnaire est `(lookupParams, copilot.ToolInvocation) (any, error)`. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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
## Configurez la recherche Rust

### 1. Ajoutez le gestionnaire typé

Ajoutez ces imports près du haut de `src/main.rs` :

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

Remplacez les imports SDK plus restreints de l'étape 2, puis ajoutez le gestionnaire typé avant `stream_response` :

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

### 2. Définissez et enregistrez l'outil

Au début de `main`, créez l'outil et ajoutez-le à la configuration de session :

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

Conservez la déconnexion et l'arrêt du client de l'étape 2 après l'appel de la macro. `config.tools`
enregistre l'implémentation. `config.available_tools` est la liste d'autorisation des outils que le
modèle peut appeler. `with_skip_permission(true)` est intentionnel, car cet outil ne renvoie que des
données en lecture seule propres à l'application.

## Exécutez-le

```bash
cargo run
```

La réponse diffusée en streaming doit utiliser le résultat de recherche pour WCAG 4.1.2 :

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Un trait ou une dérivation n'est pas résolu | Conservez les imports `async_trait`, `serde`, de schéma et d'outil indiqués ci-dessus. |
| Le modèle ne voit pas l'outil | Définissez à la fois `config.tools` et `config.available_tools`. |
| La recherche ne renvoie aucune correspondance | Posez explicitement une question sur `4.1.2`. |
| Erreurs de type du gestionnaire | Vérifiez que `ToolHandler::call` renvoie `Result<ToolResult, Error>`. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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
## Configurez la recherche Java

### 1. Ajoutez la recherche typée

Ajoutez ces imports à `src/main/java/workshop/AccessibilityReport.java` :

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

Ajoutez cette méthode avant l'accolade fermante de la classe :

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

### 2. Définissez et enregistrez l'outil

Au début de `main`, définissez l'outil et la configuration de session :

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

Remplacez la création de session et le prompt dans le bloc client :

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

`setTools` enregistre l'implémentation. `setAvailableTools` est la liste d'autorisation des outils
que le modèle peut appeler. `skipPermission(true)` est intentionnel, car cet outil ne renvoie que
des données en lecture seule propres à l'application. Conservez le gestionnaire d'autorisations de
l'étape 1 jusqu'à ce que l'étape 4 le remplace par le gestionnaire Playwright à portée limitée.
L'implémentation Java utilise une session avec streaming activé et `sendAndWait`, donc elle affiche
la réponse terminée lorsque le tour se termine.

## Exécutez-le

```bash
./mvnw compile exec:java
```

La réponse doit utiliser le résultat de recherche pour WCAG 4.1.2 :

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `ToolDefinition` ou `Param` n'est pas résolu | Ajoutez les deux imports d'outil Copilot indiqués ci-dessus. |
| Le modèle ne voit pas l'outil | Conservez `setTools` et `setAvailableTools` sur la même configuration de session. |
| La recherche ne renvoie aucune correspondance | Posez explicitement une question sur `4.1.2`. |
| La référence de méthode échoue | Vérifiez que `lookupRule` est `private static` et accepte un seul `String`. |

</details>

<details>
<summary>Implémentation complète de l'étape 3</summary>

Comparez votre version avec cette implémentation complète de l'étape 3.

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

> **Vous êtes prêt pour Playwright quand :** la réponse utilise le critère 4.1.2 du catalogue de l'application.

## Vérifiez votre compréhension

Le calcul d'un total de commande à partir de lignes d'article propres à l'application doit-il être
un outil local ou un serveur MCP ?

<details>
<summary>Vérifiez votre réponse</summary>

Généralement, un outil local. L'application possède les lignes d'article et le calcul déterministe ;
une fonction dans le processus est donc plus facile à tester et ne franchit pas de frontière de
processus.

</details>

## En savoir plus

- [Utiliser les hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  callbacks que le runtime invoque autour de chaque appel d'outil, pour l'audit ou la politique dont vous êtes propriétaire.
- [Hook après utilisation d'outil](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspection ou réécriture d'un résultat d'outil avant que le modèle le voie.
- [Compétences personnalisées](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  regroupement d'instructions réutilisables qui se chargent à côté des outils qu'une session enregistre.

Continuez avec [Étape 4 : Connectez un outil externe en toute sécurité](04-mcp-safety.md).
