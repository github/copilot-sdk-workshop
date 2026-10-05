# Étape 8 : Sélectionnez un modèle

> **Durée :** 10 minutes  
> **Prérequis :** Terminez l'étape 7 : Exécutez et expliquez l'application.

## Ce que vous allez personnaliser

Vous allez répertorier les modèles disponibles pour l'utilisateur connecté et utiliser le modèle
sélectionné pour la session de rapport.

## Fonctionnement de la sélection du modèle

Un **modèle** est le grand modèle de langage précis auquel le runtime envoie chaque tour. Les
[modèles disponibles via GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
changent avec le temps et diffèrent selon le compte ; une application demande donc au runtime ceux
qu'elle peut utiliser au lieu de coder un nom en dur.

:::language dotnet
Le runtime Copilot peut exposer plusieurs modèles. `ListModelsAsync` renvoie les modèles disponibles
pour le compte actuel. `SessionConfig.Model` en sélectionne un lorsque vous créez une session.
:::

:::language nodejs
Le runtime Copilot peut exposer plusieurs modèles. `client.listModels()` renvoie les modèles
disponibles pour le compte actuel. Passez l'identifiant choisi comme `model` lorsque vous appelez
`createSession`.
:::

:::language python
Le runtime Copilot peut exposer plusieurs modèles. `await client.list_models()` renvoie les modèles
disponibles pour le compte actuel. Passez l'identifiant choisi comme `model` lorsque vous appelez
`create_session`.
:::

:::language go
Le runtime Copilot peut exposer plusieurs modèles. `client.ListModels(ctx)` renvoie les modèles
disponibles pour le compte actuel. Définissez `SessionConfig.Model` lorsque vous créez une session.
:::

:::language rust
Le runtime Copilot peut exposer plusieurs modèles. `client.list_models().await?` renvoie les modèles
disponibles pour le compte actuel (il utilise `models().list()` en interne). Définissez
`SessionConfig.model` lorsque vous créez une session.
:::

:::language java
Le runtime Copilot peut exposer plusieurs modèles. `client.listModels()` renvoie les modèles
disponibles pour le compte actuel. Appelez `SessionConfig.setModel(selectedId)` lorsque vous créez
une session.
:::

## Changez de modèle sans modifier l'architecture

Changer de modèle peut affecter la latence, les capacités et la facturation. Cela ne modifie pas les
outils locaux, la configuration MCP ni la politique d'autorisation ; c'est pourquoi ce sujet arrive
après l'architecture de base.

:::language dotnet
La sélection du modèle configure `CopilotSession`. Elle ne remplace pas le client ni aucun des deux périmètres d'outils.
:::

:::language nodejs
La sélection du modèle configure la session créée par `createSession`. Elle ne remplace pas le
client ni aucun des deux périmètres d'outils.
:::

:::language python
La sélection du modèle configure la session créée par `create_session`. Elle ne remplace pas le
client ni aucun des deux périmètres d'outils.
:::

:::language go
La sélection du modèle configure `SessionConfig`. Elle ne remplace pas le client ni aucun des deux périmètres d'outils.
:::

:::language rust
La sélection du modèle configure `SessionConfig`. Elle ne remplace pas le client ni aucun des deux périmètres d'outils.
:::

:::language java
La sélection du modèle configure `SessionConfig`. Elle ne remplace pas le client ni aucun des deux périmètres d'outils.
:::

:::language dotnet
## Ajoutez un sélecteur de modèle

Créez `Helpers/ModelSelector.cs` :

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ModelSelector
{
    public static async Task<string?> SelectAsync(CopilotClient client)
    {
        var models = (await client.ListModelsAsync())?.ToList();
        if (models is null || models.Count is 0)
        {
            Console.WriteLine("No model list was returned; using the account default.");
            return null;
        }

        Console.WriteLine("Available models:");
        for (var index = 0; index < models.Count; index++)
        {
            Console.WriteLine($"{index + 1}. {models[index].Name}");
        }

        Console.Write($"Choose 1-{models.Count} [1]: ");
        var valid = int.TryParse(Console.ReadLine(), out var choice) &&
                    choice >= 1 &&
                    choice <= models.Count;
        var selected = models[(valid ? choice : 1) - 1];

        Console.WriteLine($"Using {selected.Name}\n");
        return selected.Id;
    }
}
```
:::
:::language dotnet
Après `PingAsync` dans `Program.cs`, insérez :

```csharp
var selectedModel = await ModelSelector.SelectAsync(client);
```
:::
:::language dotnet
Ensuite, ajoutez `Model = selectedModel` à `SessionConfig` :

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = selectedModel,
    Streaming = true,
    // Keep the existing permission, local-tool, and MCP configuration.
});
```
:::
Ne supprimez pas le reste de la configuration de session de l'étape 6.

:::language nodejs
## Ajoutez un sélecteur de modèle

Créez `src/model-selector.ts` :

```typescript
import type { CopilotClient } from "@github/copilot-sdk";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function selectModel(client: CopilotClient): Promise<string | undefined> {
  const models = await client.listModels();
  const [defaultModel] = models;
  if (!defaultModel) {
    console.log("No model list was returned; using the account default.");
    return undefined;
  }

  console.log("Available models:");
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name}`);
  });

  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`Choose 1-${models.length} [1]: `)).trim();
    const choice = Number.parseInt(answer, 10);
    const selected =
      Number.isInteger(choice) && choice >= 1 && choice <= models.length
        ? models[choice - 1] ?? defaultModel
        : defaultModel;
    console.log(`Using ${selected.name}\n`);
    return selected.id;
  } finally {
    rl.close();
  }
}
```

Dans `src/report.ts`, importez l'utilitaire et appelez-le après `client.start()` :

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { selectModel } from "./model-selector.js";
import {
  accessibilityRuleLookup,
  createSnapshotReader,
  permissionForTarget,
  reportPrompt,
  streamResponse,
} from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("Enter an absolute HTTP or HTTPS URL.");
}

const client = new CopilotClient();
await client.start();
try {
  const selectedModel = await selectModel(client);
  const session = await client.createSession({
    model: selectedModel,
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: [
      "accessibility_rule_lookup",
      "read_latest_accessibility_snapshot",
      "playwright-browser_navigate",
    ],
    mcpServers: {
      playwright: {
        command: "npx",
        args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
        workingDirectory: process.cwd(),
        tools: ["browser_navigate"],
      },
    },
  });
  try {
    await streamResponse(session, reportPrompt(target));
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

Conservez tous les paramètres existants d'outils, MCP et d'autorisation de l'étape 6. Ajoutez uniquement `model: selectedModel`.
:::

:::language python
## Ajoutez un sélecteur de modèle

Créez `model_selector.py` :

```python
from __future__ import annotations

from copilot import CopilotClient


async def select_model(client: CopilotClient) -> str | None:
    models = await client.list_models()
    if not models:
        print("No model list was returned; using the account default.")
        return None

    print("Available models:")
    for index, model in enumerate(models, start=1):
        print(f"{index}. {model.name}")

    answer = input(f"Choose 1-{len(models)} [1]: ").strip()
    try:
        choice = int(answer)
    except ValueError:
        choice = 1
    if choice < 1 or choice > len(models):
        choice = 1

    selected = models[choice - 1]
    print(f"Using {selected.name}\n")
    return selected.id
```

Dans `report.py`, importez l'utilitaire et passez `model=` à `create_session` sans supprimer la
configuration d'outils de l'étape 6 :

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
    ToolExecutionCompleteData,
    ToolExecutionStartData,
)

from model_selector import select_model
from workshop import (
    accessibility_rule_lookup,
    create_snapshot_reader,
    permission_for_target,
    report_prompt,
)


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")

    async with CopilotClient() as client:
        selected_model = await select_model(client)
        async with await client.create_session(
            model=selected_model,
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=[
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate",
            ],
            mcp_servers={
                "playwright": {
                    "command": "npx",
                    "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
                    "working_directory": ".",
                    "tools": ["browser_navigate"],
                }
            },
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
                    case ToolExecutionStartData(tool_name=name):
                        print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success):
                        print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Continuez à lancer via `python main.py` afin que le point d'entrée existant importe toujours `report.main`.
:::

:::language go
## Ajoutez un sélecteur de modèle

Ajoutez cet utilitaire près du début de `main.go` (ou dans un fichier adjacent du même package) :

```go
func selectModel(ctx context.Context, client *copilot.Client) (string, error) {
	models, err := client.ListModels(ctx)
	if err != nil {
		return "", err
	}
	if len(models) == 0 {
		fmt.Println("No model list was returned; using the account default.")
		return "", nil
	}

	fmt.Println("Available models:")
	for index, model := range models {
		fmt.Printf("%d. %s\n", index+1, model.Name)
	}

	fmt.Printf("Choose 1-%d [1]: ", len(models))
	var answer string
	fmt.Scanln(&answer)
	choice := 1
	if parsed, parseErr := strconv.Atoi(strings.TrimSpace(answer)); parseErr == nil {
		choice = parsed
	}
	if choice < 1 || choice > len(models) {
		choice = 1
	}

	selected := models[choice-1]
	fmt.Printf("Using %s\n\n", selected.Name)
	return selected.ID, nil
}
```

Ajoutez `"strconv"` au bloc d'importation si ce n'est pas déjà présent. Après `client.Start`,
sélectionnez un modèle et définissez `SessionConfig.Model` :

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()

selectedModel, err := selectModel(context.Background(), client)
if err != nil {
	panic(err)
}

session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{lookup, readSnapshot},
	AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"},
	OnPermissionRequest: permissionForTarget(target),
	MCPServers: map[string]copilot.MCPServerConfig{
		"playwright": copilot.MCPStdioServerConfig{
			Command:          "npx",
			Args:             []string{"-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"},
			WorkingDirectory: workingDirectory,
			Tools:            []string{"browser_navigate"},
		},
	},
})
```

Conservez tous les paramètres existants d'outils, MCP et d'autorisation de l'étape 6. Ajoutez uniquement `Model: selectedModel`.
:::

:::language rust
## Ajoutez un sélecteur de modèle

Ajoutez cet utilitaire dans `src/main.rs` :

```rust
async fn select_model(client: &Client) -> Result<Option<String>, Box<dyn std::error::Error>> {
    // list_models caches the catalog; it calls models().list() on first use.
    let models = client.list_models().await?;
    if models.is_empty() {
        println!("No model list was returned; using the account default.");
        return Ok(None);
    }

    println!("Available models:");
    for (index, model) in models.iter().enumerate() {
        println!("{}. {}", index + 1, model.name);
    }

    print!("Choose 1-{} [1]: ", models.len());
    io::stdout().flush()?;
    let mut answer = String::new();
    io::stdin().read_line(&mut answer)?;
    let choice = answer.trim().parse::<usize>().unwrap_or(1);
    let index = if (1..=models.len()).contains(&choice) {
        choice - 1
    } else {
        0
    };
    let selected = &models[index];
    println!("Using {}\n", selected.name);
    Ok(Some(selected.id.clone()))
}
```

Après `Client::start`, sélectionnez un modèle et définissez `config.model` avant `create_session` :

```rust
let client = Client::start(ClientOptions::default()).await?;
let selected_model = select_model(&client).await?;

let mut config = SessionConfig::default();
config.model = selected_model;
config.streaming = Some(true);
config.tools = Some(vec![lookup, reader]);
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
]);
config.mcp_servers = Some(IndexMap::from([(
    "playwright".to_owned(),
    McpServerConfig::Stdio(McpStdioServerConfig {
        command: "npx".to_owned(),
        args: vec![
            "-y".to_owned(),
            "@playwright/mcp@0.0.78".to_owned(),
            "--browser=msedge".to_owned(),
            "--output-dir".to_owned(),
            ".playwright-mcp".to_owned(),
            "--output-mode".to_owned(),
            "file".to_owned(),
        ],
        tools: Some(vec!["browser_navigate".to_owned()]),
        working_directory: Some(working_directory.display().to_string()),
        ..Default::default()
    }),
)]));
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
}));

let session = client.create_session(config).await?;
```

Conservez tous les paramètres existants d'outils, MCP et d'autorisation de l'étape 6. Ajoutez uniquement `config.model`.
:::

:::language java
## Ajoutez un sélecteur de modèle

Créez `src/main/java/workshop/ModelSelector.java` :

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.ModelInfo;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class ModelSelector {
    private ModelSelector() {
    }

    public static String select(CopilotClient client) throws Exception {
        List<ModelInfo> models = client.listModels().get();
        if (models == null || models.isEmpty()) {
            System.out.println("No model list was returned; using the account default.");
            return null;
        }

        System.out.println("Available models:");
        for (int index = 0; index < models.size(); index++) {
            System.out.println((index + 1) + ". " + models.get(index).getName());
        }

        System.out.print("Choose 1-" + models.size() + " [1]: ");
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String answer = reader.readLine();
        int choice = 1;
        try {
            if (answer != null && !answer.isBlank()) {
                choice = Integer.parseInt(answer.trim());
            }
        } catch (NumberFormatException ignored) {
            choice = 1;
        }
        if (choice < 1 || choice > models.size()) {
            choice = 1;
        }

        ModelInfo selected = models.get(choice - 1);
        System.out.println("Using " + selected.getName() + System.lineSeparator());
        return selected.getId();
    }
}
```

Dans `src/main/java/workshop/AccessibilityReport.java`, après `client.start().get()`, sélectionnez
un modèle et appelez `SessionConfig.setModel(selectedId)` :

```java
try (var client = new CopilotClient()) {
    client.start().get();
    String selectedModel = ModelSelector.select(client);

    var config = new SessionConfig()
            .setModel(selectedModel)
            .setStreaming(true)
            .setTools(List.of(lookup, readSnapshot))
            .setAvailableTools(List.of(
                    "accessibility_rule_lookup",
                    "read_latest_accessibility_snapshot",
                    "playwright-browser_navigate"))
            .setMcpServers(Map.of("playwright", new McpStdioServerConfig()
                    .setCommand("npx")
                    .setArgs(List.of("-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"))
                    .setWorkingDirectory(workingDirectory.toString())
                    .setTools(List.of("browser_navigate"))))
            .setOnPermissionRequest((request, ignored) -> {
                if ("mcp".equals(request.getKind())
                        && isExactNavigation(request.getExtensionData(), target)) {
                    return java.util.concurrent.CompletableFuture.completedFuture(
                            PermissionRequestResult.approveOnce());
                }
                if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
                    return java.util.concurrent.CompletableFuture.completedFuture(
                            PermissionRequestResult.approveOnce());
                }
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.reject(
                                "This workshop allows Playwright to navigate only to the exact requested target. "
                                        + "MCP requests without target data remain denied unless the explicit "
                                        + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
            });

    var session = client.createSession(config).get();
    var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
    if (response == null) {
        throw new IllegalStateException("Copilot completed without an assistant message.");
    }
    System.out.println(response.getData().content());
}
```

Conservez tous les paramètres existants d'outils, MCP et d'autorisation de l'étape 6. Ajoutez
uniquement `SessionConfig.setModel(selectedModel)`. En particulier, conservez le rejet par défaut de
toute cible non exacte et la solution de contournement `--allow-local-demo-mcp` activée
explicitement pour [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273) ;
cette solution de repli approuve uniquement le type `mcp` et ne peut pas vérifier l'URL cible.
:::

## Exécutez-le

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
:::
Saisissez l'URL cible de l'atelier, puis choisissez un modèle et confirmez que les mêmes outils à périmètre limité s'exécutent toujours.

<details>
<summary>Dépannage de cette étape</summary>

| Symptôme | Correction |
|---|---|
| Aucun modèle n'est répertorié | L'utilitaire revient au modèle par défaut du compte ; vérifiez l'authentification si ce n'est pas attendu. |
| Un nombre est hors plage | L'utilitaire utilise le premier modèle en toute sécurité. |
| Des outils disparaissent | Ajoutez seulement la sélection du modèle ; conservez la configuration existante d'outils, MCP et d'autorisation. |
| Erreur d'authentification lors de l'énumération des modèles | Exécutez `copilot login` à nouveau, puis réexécutez l'application. |

</details>

> **Cette étape est terminée lorsque :** le modèle sélectionné est nommé et le rapport utilise toujours les deux
> types d'outils à périmètre limité.

## Vérifiez votre compréhension

Pourquoi la sélection du modèle a-t-elle été déplacée hors de l'étape 1 ?

<details>
<summary>Vérifiez votre réponse</summary>

La sélection du modèle relève de la configuration plutôt que d'un concept central d'agent. La
repousser jusqu'à la fin vous permet d'obtenir plus vite une réponse Copilot utile et garde la
première leçon centrée sur les clients et les sessions.

</details>

## En savoir plus

- [Utiliser votre propre clé](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md) :
  diriger une session vers vos propres identifiants et modèles OpenAI, Azure ou Anthropic.
- [Compatibilité du SDK et du CLI](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md) :
  les options exposées par chaque SDK, y compris la liste des modèles et les messages système.
- [Identité managée Azure](https://github.com/github/copilot-sdk/blob/main/docs/setup/azure-managed-identity.md) :
  atteindre les modèles Microsoft Foundry sans stocker de clé dans l'application.

Continuez avec [Étape 9 : Générez un rapport HTML interactif](09-interactive-html-report.md).
