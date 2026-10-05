# Paso 8: Selecciona un modelo

> **Tiempo:** 10 minutos  
> **Requisito previo:** Completa el Paso 7: Ejecuta y explica la aplicación.

## Qué vas a personalizar

Vas a listar los modelos disponibles para el usuario con sesión iniciada y usar el modelo
seleccionado para la sesión del informe.

## Cómo funciona la selección de modelo

Un **modelo** es el modelo de lenguaje de gran tamaño específico al que el entorno de ejecución
envía cada turno. Los [modelos disponibles a través de GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
cambian con el tiempo y varían según la cuenta, así que una aplicación pregunta al entorno de
ejecución cuáles puede usar en lugar de fijar un nombre en el código.

:::language dotnet
El entorno de ejecución de Copilot puede exponer más de un modelo. `ListModelsAsync` devuelve los
modelos disponibles para la cuenta actual. `SessionConfig.Model` selecciona uno al crear una sesión.
:::

:::language nodejs
El entorno de ejecución de Copilot puede exponer más de un modelo. `client.listModels()` devuelve
los modelos disponibles para la cuenta actual. Pasa el id elegido como `model` cuando llames a
`createSession`.
:::

:::language python
El entorno de ejecución de Copilot puede exponer más de un modelo. `await client.list_models()`
devuelve los modelos disponibles para la cuenta actual. Pasa el id elegido como `model` cuando
llames a `create_session`.
:::

:::language go
El entorno de ejecución de Copilot puede exponer más de un modelo. `client.ListModels(ctx)` devuelve
los modelos disponibles para la cuenta actual. Establece `SessionConfig.Model` cuando crees una
sesión.
:::

:::language rust
El entorno de ejecución de Copilot puede exponer más de un modelo. `client.list_models().await?`
devuelve los modelos disponibles para la cuenta actual (usa `models().list()` internamente).
Establece `SessionConfig.model` cuando crees una sesión.
:::

:::language java
El entorno de ejecución de Copilot puede exponer más de un modelo. `client.listModels()` devuelve
los modelos disponibles para la cuenta actual. Llama a `SessionConfig.setModel(selectedId)` cuando
crees una sesión.
:::

## Cambia de modelo sin cambiar la arquitectura

Cambiar el modelo puede afectar a la latencia, las capacidades y la facturación. No cambia las
herramientas locales, la configuración MCP ni la directiva de permisos; por eso este tema va después
de la arquitectura principal.

:::language dotnet
La selección de modelo configura `CopilotSession`. No sustituye el cliente ni ninguno de los dos límites de herramientas.
:::

:::language nodejs
La selección de modelo configura la sesión creada por `createSession`. No sustituye el cliente ni
ninguno de los dos límites de herramientas.
:::

:::language python
La selección de modelo configura la sesión creada por `create_session`. No sustituye el cliente ni
ninguno de los dos límites de herramientas.
:::

:::language go
La selección de modelo configura `SessionConfig`. No sustituye el cliente ni ninguno de los dos límites de herramientas.
:::

:::language rust
La selección de modelo configura `SessionConfig`. No sustituye el cliente ni ninguno de los dos límites de herramientas.
:::

:::language java
La selección de modelo configura `SessionConfig`. No sustituye el cliente ni ninguno de los dos límites de herramientas.
:::

:::language dotnet
## Añade un selector de modelo

Crea `Helpers/ModelSelector.cs`:

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
Después de `PingAsync` en `Program.cs`, inserta:

```csharp
var selectedModel = await ModelSelector.SelectAsync(client);
```
:::
:::language dotnet
Luego añade `Model = selectedModel` a `SessionConfig`:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = selectedModel,
    Streaming = true,
    // Keep the existing permission, local-tool, and MCP configuration.
});
```
:::
No elimines el resto de la configuración de sesión del Paso 6.

:::language nodejs
## Añade un selector de modelo

Crea `src/model-selector.ts`:

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

En `src/report.ts`, importa el auxiliar y llámalo después de `client.start()`:

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

Mantén todos los ajustes de herramientas, MCP y permisos existentes del Paso 6. Añade solo `model: selectedModel`.
:::

:::language python
## Añade un selector de modelo

Crea `model_selector.py`:

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

En `report.py`, importa el auxiliar y pasa `model=` a `create_session` sin eliminar la configuración
de herramientas del Paso 6:

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

Sigue iniciando con `python main.py` para que el punto de entrada existente siga importando `report.main`.
:::

:::language go
## Añade un selector de modelo

Añade este auxiliar cerca del principio de `main.go` (o en un archivo hermano del mismo paquete):

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

Añade `"strconv"` al bloque de importación si aún no está presente. Después de `client.Start`,
selecciona un modelo y establece `SessionConfig.Model`:

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

Mantén todos los ajustes de herramientas, MCP y permisos existentes del Paso 6. Añade solo `Model: selectedModel`.
:::

:::language rust
## Añade un selector de modelo

Añade este auxiliar en `src/main.rs`:

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

Después de `Client::start`, selecciona un modelo y establece `config.model` antes de `create_session`:

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

Mantén todos los ajustes de herramientas, MCP y permisos existentes del Paso 6. Añade solo `config.model`.
:::

:::language java
## Añade un selector de modelo

Crea `src/main/java/workshop/ModelSelector.java`:

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

En `src/main/java/workshop/AccessibilityReport.java`, después de `client.start().get()`, selecciona
un modelo y llama a `SessionConfig.setModel(selectedId)`:

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

Mantén todos los ajustes de herramientas, MCP y permisos existentes del Paso 6. Añade solo
`SessionConfig.setModel(selectedModel)`. En concreto, conserva el rechazo predeterminado cuando el
destino no es exacto y la solución temporal `--allow-local-demo-mcp`, activada explícitamente, para
[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273); esa alternativa
aprueba solo el tipo `mcp` y no puede demostrar la URL de destino.
:::

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
:::
Introduce la URL de destino del taller, elige un modelo y confirma que siguen ejecutándose las mismas herramientas acotadas.

<details>
<summary>Solución de problemas de este paso</summary>

| Síntoma | Corrección |
|---|---|
| No se muestra ningún modelo | El auxiliar recurre al valor predeterminado de la cuenta; verifica la autenticación si no lo esperabas. |
| Un número está fuera del intervalo | El auxiliar usa el primer modelo de forma segura. |
| Las herramientas desaparecen | Añade solo la selección de modelo; conserva la configuración existente de herramientas, MCP y permisos. |
| Error de autenticación al listar modelos | Ejecuta `copilot login` de nuevo y vuelve a ejecutar la aplicación. |

</details>

> **Este paso está completo cuando:** se nombra el modelo seleccionado y el informe sigue usando ambos
> tipos de herramientas acotados.

## Comprueba lo que has aprendido

Respecto al Paso 1, ¿por qué se dejó para más adelante la selección de modelo?

<details>
<summary>Comprueba tu respuesta</summary>

La selección de modelo es configuración, no un concepto central de agente. Dejarla hasta el final te
lleva a una respuesta útil de Copilot antes y mantiene la primera lección centrada en clientes y
sesiones.

</details>

## Más información

- [Usa tu propia clave](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md):
  dirigir una sesión a tus propias credenciales y modelos de OpenAI, Azure o Anthropic.
- [Compatibilidad entre SDK y CLI](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  qué opciones expone cada SDK, incluido el listado de modelos y los mensajes del sistema.
- [Identidad administrada de Azure](https://github.com/github/copilot-sdk/blob/main/docs/setup/azure-managed-identity.md):
  acceder a modelos de Microsoft Foundry sin almacenar una clave en la aplicación.

Continúa con [Paso 9: Genera un informe HTML interactivo](09-interactive-html-report.md).
