# 8단계: 모델 선택

> **소요 시간:** 10분  
> **필수 조건:** 7단계: 애플리케이션 실행 및 설명을 완료합니다.

## 사용자 지정할 내용

로그인한 사용자가 이용할 수 있는 모델을 나열하고 보고서 세션에 선택한 모델을 사용합니다.

## 모델 선택 작동 방식

**모델**은 런타임이 각 턴을 전송하는 특정 대규모 언어 모델입니다.
[GitHub Copilot을 통해 이용할 수 있는 모델](https://docs.github.com/en/copilot/reference/ai-models/supported-models)은
시간이 지나면서 변경되고 계정마다 다르므로, 애플리케이션은 이름을 하드 코딩하는 대신 런타임에 사용할 수 있는 모델을 요청합니다.

:::language dotnet
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `ListModelsAsync`는 현재 계정에서 이용할 수 있는 모델을 반환합니다.
세션을 생성할 때 `SessionConfig.Model`로 모델 하나를 선택합니다.
:::

:::language nodejs
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `client.listModels()`는 현재 계정에서 이용할 수 있는 모델을 반환합니다.
`createSession`을 호출할 때 선택한 id를 `model`로 전달합니다.
:::

:::language python
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `await client.list_models()`는 현재 계정에서 이용할 수 있는 모델을 반환합니다.
`create_session`을 호출할 때 선택한 id를 `model`로 전달합니다.
:::

:::language go
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `client.ListModels(ctx)`는 현재 계정에서 이용할 수 있는 모델을 반환합니다.
세션을 생성할 때 `SessionConfig.Model`을 설정합니다.
:::

:::language rust
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `client.list_models().await?`는 현재 계정에서 이용할 수 있는 모델을 반환합니다
(내부적으로 `models().list()`를 사용합니다). 세션을 생성할 때 `SessionConfig.model`을 설정합니다.
:::

:::language java
Copilot 런타임은 둘 이상의 모델을 제공할 수 있습니다. `client.listModels()`는 현재 계정에서 이용할 수 있는 모델을 반환합니다.
세션을 생성할 때 `SessionConfig.setModel(selectedId)`을 호출합니다.
:::

## 아키텍처를 변경하지 않고 모델 교체

모델을 변경하면 지연 시간, 기능, 요금에 영향을 줄 수 있습니다. 로컬 도구, MCP 구성 또는 권한 정책은 변경되지 않으므로
핵심 아키텍처를 다룬 후에 이 주제를 설명합니다.

:::language dotnet
모델 선택은 `CopilotSession`을 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language nodejs
모델 선택은 `createSession`이 생성한 세션을 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language python
모델 선택은 `create_session`이 생성한 세션을 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language go
모델 선택은 `SessionConfig`를 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language rust
모델 선택은 `SessionConfig`를 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language java
모델 선택은 `SessionConfig`를 구성합니다. 클라이언트 또는 두 도구 경계 중 어느 것도 대체하지 않습니다.
:::

:::language dotnet
## 모델 선택기 추가

`Helpers/ModelSelector.cs`를 생성합니다.

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
`Program.cs`의 `PingAsync` 뒤에 다음을 삽입합니다.

```csharp
var selectedModel = await ModelSelector.SelectAsync(client);
```
:::
:::language dotnet
그런 다음 `SessionConfig`에 `Model = selectedModel`을 추가합니다.

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = selectedModel,
    Streaming = true,
    // Keep the existing permission, local-tool, and MCP configuration.
});
```
:::
6단계의 나머지 세션 구성을 제거하지 않습니다.

:::language nodejs
## 모델 선택기 추가

`src/model-selector.ts`를 생성합니다.

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

`src/report.ts`에서 도우미를 가져오고 `client.start()` 뒤에 호출합니다.

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

6단계의 기존 도구, MCP 및 권한 설정을 모두 유지합니다. `model: selectedModel`만 추가합니다.
:::

:::language python
## 모델 선택기 추가

`model_selector.py`를 생성합니다.

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

`report.py`에서 도우미를 가져오고 6단계의 도구 구성을 제거하지 않은 채 `create_session`에 `model=`을 전달합니다.

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

기존 진입점에서 계속 `report.main`을 가져오도록 `python main.py`를 통해 실행합니다.
:::

:::language go
## 모델 선택기 추가

이 도우미를 `main.go`의 위쪽 근처 또는 같은 패키지의 다른 파일에 추가합니다.

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

아직 없다면 import 블록에 `"strconv"`를 추가합니다. `client.Start` 뒤에서 모델을 선택하고
`SessionConfig.Model`을 설정합니다.

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

6단계의 기존 도구, MCP 및 권한 설정을 모두 유지합니다. `Model: selectedModel`만 추가합니다.
:::

:::language rust
## 모델 선택기 추가

이 도우미를 `src/main.rs`에 추가합니다.

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

`Client::start` 뒤에서 모델을 선택하고 `create_session` 전에 `config.model`을 설정합니다.

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

6단계의 기존 도구, MCP 및 권한 설정을 모두 유지합니다. `config.model`만 추가합니다.
:::

:::language java
## 모델 선택기 추가

`src/main/java/workshop/ModelSelector.java`를 생성합니다.

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

`src/main/java/workshop/AccessibilityReport.java`에서 `client.start().get()` 뒤에
모델을 선택하고 `SessionConfig.setModel(selectedId)`을 호출합니다.

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

6단계의 기존 도구, MCP 및 권한 설정을 모두 유지합니다.
`SessionConfig.setModel(selectedModel)`만 추가합니다. 특히 기본 exact-target 거부와
[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)에 대해 명시적으로 선택하는
`--allow-local-demo-mcp` 해결 방법을 유지합니다. 이 대체 방법은 `mcp` 종류만 승인하며 대상 URL을 증명할 수 없습니다.
:::

## 실행

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
워크숍 대상 URL을 입력한 다음 모델을 선택하고 범위가 지정된 동일한 도구가 계속 실행되는지 확인합니다.

<details>
<summary>이 단계의 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 모델이 나열되지 않음 | 도우미는 계정 기본값으로 대체합니다. 예상하지 못한 결과라면 인증을 확인합니다. |
| 숫자가 범위를 벗어남 | 도우미는 첫 번째 모델을 안전하게 사용합니다. |
| 도구가 사라짐 | 모델 선택만 추가하고 기존 도구, MCP 및 권한 구성을 유지합니다. |
| 모델을 나열하는 동안 인증 오류 발생 | `copilot login`을 다시 실행한 다음 애플리케이션을 다시 실행합니다. |

</details>

> **이 단계의 완료 조건:** 선택한 모델의 이름이 표시되고 보고서에서 범위가 지정된 두 도구 유형을 계속 사용합니다.

## 이해도 확인

모델 선택을 1단계에서 제외한 이유는 무엇입니까?

<details>
<summary>정답 확인</summary>

모델 선택은 핵심 에이전트 개념이 아니라 구성에 해당합니다. 마지막까지 미루면 유용한 Copilot 응답을 더 빨리 얻을 수 있고,
첫 번째 학습 내용을 클라이언트와 세션에 집중할 수 있습니다.

</details>

## 자세히 알아보기

- [사용자 고유 키 사용](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md):
  세션이 자체 OpenAI, Azure 또는 Anthropic 자격 증명과 모델을 사용하도록 지정합니다.
- [SDK 및 CLI 호환성](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  모델 나열과 시스템 메시지를 포함하여 각 SDK에서 제공하는 옵션을 설명합니다.
- [Azure 관리 ID](https://github.com/github/copilot-sdk/blob/main/docs/setup/azure-managed-identity.md):
  애플리케이션에 키를 저장하지 않고 Microsoft Foundry 모델에 접근합니다.

[9단계: 대화형 HTML 보고서 생성](09-interactive-html-report.md)으로 계속 진행합니다.
