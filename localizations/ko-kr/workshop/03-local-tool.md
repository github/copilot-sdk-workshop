# 3단계: 애플리케이션 소유 지식 추가

> **소요 시간:** 15분

## 추가할 내용

애플리케이션이 소유한 웹 콘텐츠 접근성 지침(WCAG) 카탈로그에서 정확한 성공 기준과 해결 방법을 검색하는 타입이 지정된 로컬 도구를 Copilot에 제공합니다.

## 애플리케이션이 소유한 도구를 Copilot에 제공

**도구 호출**(Tool calling)을 사용하면 모델이 답변을 작성하는 동안 기능을 요청할 수 있습니다. [**로컬 도구(Local tool)**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)는 애플리케이션 프로세스 내에서 실행됩니다. 모델이 도구를 요청할 시점을 결정하지만 데이터, 유효성 검사, 실행, 결과는 계속 코드에서 관리합니다.

이 단계에서는 애플리케이션이 소유한 WCAG 지침을 `accessibility_rule_lookup`으로 공개하고, 해당 도구를 세션에 등록한 후 모델에서 사용할 수 있도록 명시적으로 설정합니다.

## 신뢰할 수 있는 자체 데이터 원본 사용

모델의 일반 지식은 애플리케이션이 소유한 데이터를 대체할 수 없습니다. 이 로컬 도구는 모든 프롬프트에 전체 카탈로그를 넣는 대신 테스트할 수 있는 결정론적 코드에서 작고 정확한 결과를 반환합니다.

여기서 `skip permission`을 사용하는 것은 도구가 애플리케이션 소유 데이터만 읽기 때문입니다. 다음 단계의 외부 MCP 프로세스에는 별도의 권한 경계를 적용합니다.

:::language dotnet
## C# 조회 연결

### 1. 카탈로그 조회 도구 추가

`Helpers/AccessibilityRuleCatalog.cs`의 맨 위에 다음 코드를 삽입합니다.

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

`AccessibilityRuleCatalog` 내부에서 기존 `Rules` 배열 뒤에 다음 코드를 삽입합니다.

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

### 2. 도구 활동 표시

`Helpers/ResponseStreamer.cs`에서 `SessionIdleEvent` 앞에 다음 case를 삽입합니다.

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. 도구 등록 및 요청

`Program.cs`의 세션 구성과 전송 호출을 다음 코드로 바꿉니다.

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

## 실행

```bash
dotnet run
```

도구 이름과 4.1.2에 매핑된 결과가 표시되는지 확인합니다.

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 도구 이벤트가 표시되지 않음 | 이 학습 단계에서는 명시적인 `Use accessibility_rule_lookup` 지침을 유지합니다. |
| 컴파일러에서 `AIFunction`을 찾을 수 없음 | 카탈로그 파일에 `using Microsoft.Extensions.AI;`를 추가합니다. |
| 정확히 일치하는 항목이 없다는 결과가 표시됨 | 프롬프트에 시작 데이터의 키워드인 `accessible name`이 포함되어 있는지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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

카탈로그 도구와 조회 기능은 `Helpers/AccessibilityRuleCatalog.cs`에 있습니다. 도구 시작 및 완료 출력 기능은 `Helpers/ResponseStreamer.cs`에 있습니다.

</details>
:::

:::language nodejs
## TypeScript 조회 연결

### 1. 미리 빌드된 타입 지정 도구 확인

`src/workshop.ts`를 엽니다. 스타터 프로젝트에는 이미 카탈로그를 가져오고 다음 로컬 도구를 정의하는 코드가 있습니다.

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

Zod 스키마는 모델에 타입이 지정된 `query` 인수를 제공합니다. 핸들러는 애플리케이션이 계속 소유하는 `accessibilityRules`를 검색합니다. 이 도구는 애플리케이션 소유의 읽기 전용 데이터만 반환하므로 `skipPermission: true`를 의도적으로 사용합니다.

### 2. 도구 활동 출력 확인

같은 파일에서 `streamResponse`는 이미 도구 수명 주기 이벤트를 출력합니다.

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

모델이 로컬 도구를 호출하는 시점을 확인할 수 있도록 이 분기를 유지합니다.

### 3. 도구 등록 및 요청

`src/index.ts`에서 스트리밍 도우미와 함께 도구를 가져옵니다.

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

세션 생성과 전송 호출을 다음 코드로 바꿉니다.

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

`tools`는 구현을 등록합니다. `availableTools`는 모델이 호출할 수 있는 도구의 허용 목록입니다.

## 실행

```bash
npm start
```

도구 이름과 WCAG 4.1.2 지침이 표시되는지 확인합니다.

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| TypeScript에서 `zod`를 확인할 수 없음 | 스타터 프로젝트 디렉터리에서 `npm install`을 실행합니다. |
| 도구 이벤트가 표시되지 않음 | `tools`와 `availableTools` 모두에 도구 이름을 유지하고, 프롬프트에 명시적인 지침을 유지합니다. |
| 조회 결과와 일치하는 항목이 없음 | 카탈로그에 모두 포함된 `4.1.2` 또는 `accessible name`에 관해 질문합니다. |
| 도구 이벤트가 출력되지 않음 | `streamResponse`가 계속 `tool.execution_start`와 `tool.execution_complete`를 처리하는지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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

타입이 지정된 도구 정의와 도구 활동 출력 기능은 `src/workshop.ts`에 있습니다.

</details>
:::

:::language python
## Python 조회 연결

### 1. 미리 빌드된 타입 지정 도구 확인

`workshop.py`를 엽니다. 스타터 프로젝트에는 이미 매개 변수 모델과 로컬 도구가 정의되어 있습니다.

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

Pydantic은 모델에 표시되는 인수를 설명하고, 핸들러는 애플리케이션이 계속 소유하는 `ACCESSIBILITY_RULES`를 검색합니다. 이 도구는 애플리케이션 소유의 읽기 전용 데이터만 반환하므로 `skip_permission=True`를 의도적으로 사용합니다.

### 2. 도구 등록 및 요청

`main.py`에서 도구를 가져옵니다.

```python
from workshop import accessibility_rule_lookup
```

세션 생성과 전송 호출을 다음 코드로 바꿉니다. 세션 블록 안에 2단계의 이벤트 핸들러를 유지합니다.

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

`tools`는 구현을 등록합니다. `available_tools`는 모델이 호출할 수 있는 도구의 허용 목록입니다.

## 실행

```bash
python main.py
```

응답에는 카탈로그의 WCAG 4.1.2 제목과 권장 사항이 사용되어야 합니다.

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| Python에서 `pydantic`를 가져올 수 없음 | 사전 점검에서 만든 가상 환경을 활성화하고 `requirements.txt`를 다시 설치합니다. |
| 도구가 호출되지 않음 | `tools`와 `available_tools` 모두에 도구를 유지하고, 프롬프트에 명시적인 지침을 유지합니다. |
| 조회 결과와 일치하는 항목이 없음 | 카탈로그에 모두 포함된 `4.1.2` 또는 `accessible name`에 관해 질문합니다. |
| `accessibility_rule_lookup` 가져오기 오류 발생 | `main.py`에 `from workshop import accessibility_rule_lookup`이 있는지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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

타입이 지정된 도구 정의는 `workshop.py`에 있습니다.

</details>
:::

:::language go
## Go 조회 연결

### 1. 타입이 지정된 조회 추가

`main.go`의 import에 `strings`를 추가한 다음, `streamResponse` 앞에 다음 선언을 추가합니다.

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

### 2. 도구 정의 및 등록

`main`의 시작 부분에서 도구를 생성합니다.

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

세션 구성과 마지막 전송 코드를 다음과 같이 바꿉니다.

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

`Tools`는 구현을 등록합니다. `AvailableTools`는 모델이 호출할 수 있는 도구의 허용 목록입니다. 이 도구는 애플리케이션 소유의 읽기 전용 데이터만 반환하므로 `SkipPermission = true`를 의도적으로 사용합니다.

## 실행

```bash
go run .
```

스트리밍 응답에는 WCAG 4.1.2 조회 결과가 사용되어야 합니다.

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `strings`가 정의되지 않음 | 표준 라이브러리의 `strings` import를 추가합니다. |
| 모델에서 도구를 인식할 수 없음 | 도구를 `Tools`에 유지하고 정확한 이름을 `AvailableTools`에 유지합니다. |
| 조회 결과와 일치하는 항목이 없음 | `4.1.2` 또는 `accessible name`에 관해 질문합니다. |
| `DefineTool`에서 빌드 실패 | 핸들러 시그니처가 `(lookupParams, copilot.ToolInvocation) (any, error)`인지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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
## Rust 조회 연결

### 1. 타입이 지정된 핸들러 추가

`src/main.rs`의 위쪽에 다음 import를 추가합니다.

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

범위가 더 좁은 2단계 SDK import를 바꾼 다음, `stream_response` 앞에 타입이 지정된 핸들러를 추가합니다.

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

### 2. 도구 정의 및 등록

`main`의 시작 부분에서 도구를 생성하고 세션 구성에 추가합니다.

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

매크로 호출 뒤에 있는 2단계의 연결 해제 및 클라이언트 종료 코드를 유지합니다. `config.tools`는 구현을 등록합니다. `config.available_tools`는 모델이 호출할 수 있는 도구의 허용 목록입니다. 이 도구는 애플리케이션 소유의 읽기 전용 데이터만 반환하므로 `with_skip_permission(true)`를 의도적으로 사용합니다.

## 실행

```bash
cargo run
```

스트리밍 응답에는 WCAG 4.1.2 조회 결과가 사용되어야 합니다.

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| trait 또는 derive를 확인할 수 없음 | 위에 표시된 `async_trait`, `serde`, 스키마, 도구 import를 유지합니다. |
| 모델에서 도구를 인식할 수 없음 | `config.tools`와 `config.available_tools`를 모두 설정합니다. |
| 조회 결과와 일치하는 항목이 없음 | `4.1.2`에 관해 명시적으로 질문합니다. |
| 핸들러 형식 오류 발생 | `ToolHandler::call`이 `Result<ToolResult, Error>`를 반환하는지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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
## Java 조회 연결

### 1. 타입이 지정된 조회 추가

`src/main/java/workshop/AccessibilityReport.java`에 다음 import를 추가합니다.

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

클래스의 닫는 중괄호 앞에 다음 메서드를 추가합니다.

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

### 2. 도구 정의 및 등록

`main`의 시작 부분에서 도구와 세션 구성을 정의합니다.

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

클라이언트 블록 내부의 세션 생성과 프롬프트를 다음 코드로 바꿉니다.

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

`setTools`는 구현을 등록합니다. `setAvailableTools`는 모델이 호출할 수 있는 도구의 허용 목록입니다. 이 도구는 애플리케이션 소유의 읽기 전용 데이터만 반환하므로 `skipPermission(true)`를 의도적으로 사용합니다. 4단계에서 범위가 지정된 Playwright 핸들러로 바꿀 때까지 1단계의 권한 핸들러를 유지합니다. Java 구현에서는 스트리밍을 사용하도록 설정된 세션에서 `sendAndWait`를 사용하므로 턴이 완료되면 완성된 응답을 출력합니다.

## 실행

```bash
./mvnw compile exec:java
```

응답에는 WCAG 4.1.2 조회 결과가 사용되어야 합니다.

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `ToolDefinition` 또는 `Param`을 확인할 수 없음 | 위에 표시된 두 Copilot 도구 import를 추가합니다. |
| 모델에서 도구를 인식할 수 없음 | 동일한 세션 구성에 `setTools`와 `setAvailableTools`를 모두 유지합니다. |
| 조회 결과와 일치하는 항목이 없음 | `4.1.2`에 관해 명시적으로 질문합니다. |
| 메서드 참조 실패 | `lookupRule`이 `private static`이고 단일 `String`을 받는지 확인합니다. |

</details>

<details>
<summary>3단계 전체 구현</summary>

작성한 버전을 다음의 완전한 3단계 구현과 비교합니다.

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

> **다음 조건을 충족하면 Playwright를 사용할 준비가 된 것입니다:** 답변에서 애플리케이션 카탈로그의 성공 기준 4.1.2를 사용합니다.

## 이해도 확인

애플리케이션 소유의 주문 항목에서 주문 합계를 계산하는 기능은 로컬 도구와 MCP 서버 중 어느 것으로 구현해야 합니까?

<details>
<summary>정답 확인</summary>

일반적으로 로컬 도구로 구현합니다. 애플리케이션이 주문 항목과 결정론적 계산을 소유하므로 프로세스 내 함수가 테스트하기 더 쉽고 프로세스 경계를 넘지 않습니다.

</details>

## 자세히 알아보기

- [후크 사용](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  감사 또는 자체 정책 적용을 위해 런타임이 각 도구 호출 전후에 실행하는 콜백입니다.
- [도구 사용 후 후크](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  모델에서 도구 결과를 확인하기 전에 결과를 검사하거나 다시 작성합니다.
- [사용자 지정 스킬](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  세션에 등록된 도구와 함께 로드되는 재사용 가능한 지침을 패키징합니다.

[4단계: 외부 도구에 안전하게 연결](../../../workshop/04-mcp-safety.md)로 계속 진행합니다.
