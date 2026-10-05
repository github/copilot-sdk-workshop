# Etapa 8: Selecione um modelo

> **Tempo:** 10 minutos  
> **Pré-requisito:** Conclua a Etapa 7: Execute e explique o aplicativo.

## O que você vai personalizar

Você vai listar os modelos disponíveis para o usuário conectado e usar o modelo selecionado para a
sessão de relatório.

## Como a seleção de modelo funciona

Um **modelo** é o grande modelo de linguagem específico para o qual o runtime envia cada turno. Os
[modelos disponíveis pelo GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
mudam ao longo do tempo e variam conforme a conta, então um aplicativo pergunta ao runtime quais
pode usar em vez de codificar um nome de forma fixa.

:::language dotnet
O runtime do Copilot pode expor mais de um modelo. `ListModelsAsync` retorna os modelos disponíveis
para a conta atual. `SessionConfig.Model` seleciona um deles quando você cria uma sessão.
:::

:::language nodejs
O runtime do Copilot pode expor mais de um modelo. `client.listModels()` retorna os modelos
disponíveis para a conta atual. Passe o ID escolhido como `model` ao chamar `createSession`.
:::

:::language python
O runtime do Copilot pode expor mais de um modelo. `await client.list_models()` retorna os modelos
disponíveis para a conta atual. Passe o ID escolhido como `model` ao chamar `create_session`.
:::

:::language go
O runtime do Copilot pode expor mais de um modelo. `client.ListModels(ctx)` retorna os modelos
disponíveis para a conta atual. Defina `SessionConfig.Model` quando criar uma sessão.
:::

:::language rust
O runtime do Copilot pode expor mais de um modelo. `client.list_models().await?` retorna os modelos
disponíveis para a conta atual (ele usa `models().list()` nos bastidores). Defina
`SessionConfig.model` quando criar uma sessão.
:::

:::language java
O runtime do Copilot pode expor mais de um modelo. `client.listModels()` retorna os modelos
disponíveis para a conta atual. Chame `SessionConfig.setModel(selectedId)` quando criar uma sessão.
:::

## Troque modelos sem alterar a arquitetura

Alterar o modelo pode afetar a latência, a capacidade e o faturamento. Isso não altera as
ferramentas locais, a configuração MCP nem a política de permissões, por isso este tópico vem depois
da arquitetura principal.

:::language dotnet
A seleção de modelo configura `CopilotSession`. Ela não substitui o cliente nem nenhum dos limites de ferramenta.
:::

:::language nodejs
A seleção de modelo configura a sessão criada por `createSession`. Ela não substitui o cliente nem
nenhum dos limites de ferramenta.
:::

:::language python
A seleção de modelo configura a sessão criada por `create_session`. Ela não substitui o cliente nem
nenhum dos limites de ferramenta.
:::

:::language go
A seleção de modelo configura `SessionConfig`. Ela não substitui o cliente nem nenhum dos limites de ferramenta.
:::

:::language rust
A seleção de modelo configura `SessionConfig`. Ela não substitui o cliente nem nenhum dos limites de ferramenta.
:::

:::language java
A seleção de modelo configura `SessionConfig`. Ela não substitui o cliente nem nenhum dos limites de ferramenta.
:::

:::language dotnet
## Adicione um seletor de modelo

Crie `Helpers/ModelSelector.cs`:

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
Depois de `PingAsync` em `Program.cs`, insira:

```csharp
var selectedModel = await ModelSelector.SelectAsync(client);
```
:::
:::language dotnet
Em seguida, adicione `Model = selectedModel` a `SessionConfig`:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = selectedModel,
    Streaming = true,
    // Keep the existing permission, local-tool, and MCP configuration.
});
```
:::
Não remova o restante da configuração da sessão da Etapa 6.

:::language nodejs
## Adicione um seletor de modelo

Crie `src/model-selector.ts`:

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

Em `src/report.ts`, importe o auxiliar e chame-o depois de `client.start()`:

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

Mantenha todas as configurações existentes de ferramentas, MCP e permissões da Etapa 6. Adicione apenas `model: selectedModel`.
:::

:::language python
## Adicione um seletor de modelo

Crie `model_selector.py`:

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

Em `report.py`, importe o auxiliar e passe `model=` para `create_session` sem remover a configuração
de ferramentas da Etapa 6:

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

Continue iniciando por meio de `python main.py` para que o ponto de entrada existente ainda importe `report.main`.
:::

:::language go
## Adicione um seletor de modelo

Adicione este auxiliar perto do início de `main.go` (ou em um arquivo irmão no mesmo pacote):

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

Adicione `"strconv"` ao bloco de importação se ele ainda não estiver presente. Depois de
`client.Start`, selecione um modelo e defina `SessionConfig.Model`:

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

Mantenha todas as configurações existentes de ferramentas, MCP e permissões da Etapa 6. Adicione apenas `Model: selectedModel`.
:::

:::language rust
## Adicione um seletor de modelo

Adicione este auxiliar em `src/main.rs`:

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

Depois de `Client::start`, selecione um modelo e defina `config.model` antes de `create_session`:

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

Mantenha todas as configurações existentes de ferramentas, MCP e permissões da Etapa 6. Adicione apenas `config.model`.
:::

:::language java
## Adicione um seletor de modelo

Crie `src/main/java/workshop/ModelSelector.java`:

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

Em `src/main/java/workshop/AccessibilityReport.java`, depois de `client.start().get()`, selecione um
modelo e chame `SessionConfig.setModel(selectedId)`:

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

Mantenha todas as configurações existentes de ferramenta, MCP e permissão da Etapa 6. Adicione
apenas `SessionConfig.setModel(selectedModel)`. Em especial, preserve a rejeição padrão de destino
exato e a solução alternativa `--allow-local-demo-mcp` explicitamente habilitada para
[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273); esse fallback aprova
apenas o tipo `mcp` e não consegue comprovar a URL de destino.
:::

## Execute

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
Insira a URL de destino do workshop, escolha um modelo e confirme que as mesmas ferramentas com escopo ainda são executadas.

<details>
<summary>Solucionar problemas desta etapa</summary>

| Sintoma | Correção |
|---|---|
| Nenhum modelo é listado | O auxiliar faz fallback para o padrão da conta; verifique a autenticação se isso for inesperado. |
| Um número está fora do intervalo | O auxiliar usa o primeiro modelo com segurança. |
| As ferramentas desaparecem | Adicione apenas a seleção de modelo; mantenha a configuração existente de ferramenta, MCP e permissão. |
| Erro de autenticação ao listar modelos | Execute `copilot login` novamente e, em seguida, execute o aplicativo outra vez. |

</details>

> **Esta etapa estará concluída quando:** o modelo selecionado for nomeado e o relatório ainda usar os dois
> tipos de ferramenta com escopo.

## Verifique seu entendimento

Por que a seleção de modelo foi movida para fora da Etapa 1?

<details>
<summary>Verifique sua resposta</summary>

A seleção de modelo é configuração, não um conceito central de agente. Deixá-la para o fim leva você
a uma resposta útil do Copilot mais cedo e mantém a primeira lição focada em clientes e sessões.

</details>

## Saiba mais

- [Traga sua própria chave](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md):
  apontar uma sessão para suas próprias credenciais e modelos OpenAI, Azure ou Anthropic.
- [Compatibilidade entre SDK e CLI](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  quais opções cada SDK expõe, incluindo listagem de modelos e mensagens de sistema.
- [Identidade gerenciada do Azure](https://github.com/github/copilot-sdk/blob/main/docs/setup/azure-managed-identity.md):
  acessar modelos do Microsoft Foundry sem armazenar uma chave no aplicativo.

Continue para [Etapa 9: Gere um relatório HTML interativo](09-interactive-html-report.md).
