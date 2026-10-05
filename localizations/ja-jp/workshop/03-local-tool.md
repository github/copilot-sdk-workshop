# ステップ 3: アプリケーションが所有する知識を追加する

> **所要時間:** 15 分

## 追加する内容

Copilot に、アプリケーションが所有する Web Content Accessibility Guidelines (WCAG) カタログから正確な基準と修正策を取得する型付きローカルツールを渡します。

## アプリが所有するツールを Copilot に渡す

**ツール呼び出し**を使うと、モデルは回答に取り組む間に機能を要求できます。[**ローカルツール**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)はアプリケーションプロセス内で実行されます。モデルがいつ要求するかを決めますが、データ、検証、実行、結果は引き続きコードが所有します。

このステップでは、アプリケーションが所有する WCAG ガイダンスを `accessibility_rule_lookup` として公開し、そのツールをセッションに登録し、モデルが使用できるよう明示的に指定します。

## 独自の信頼できる情報源を用意する

モデルの一般知識は、アプリケーションが所有するデータの代わりにはなりません。このローカルツールは、毎回のプロンプトにカタログ全体を入れる代わりに、テスト可能な決定論的コードから小さく正確な結果を返します。

`skip permission` はここでは意図的です。このツールはアプリケーションが所有するデータを読み取るだけだからです。次のステップの外部 MCP プロセスでは、代わりに権限境界を使用します。

:::language dotnet
## C# の検索を接続する

### 1. カタログ検索ツールを追加する

`Helpers/AccessibilityRuleCatalog.cs` の先頭に次を挿入します:

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

`AccessibilityRuleCatalog` 内の既存の `Rules` 配列の後に、次を挿入します:

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

### 2. ツールのアクティビティを表示する

`Helpers/ResponseStreamer.cs` で、`SessionIdleEvent` の前に次のケースを挿入します:

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. ツールを登録して要求する

`Program.cs` のセッション構成と送信呼び出しを置き換えます:

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

## 実行する

```bash
dotnet run
```

ツール名と、それが 4.1.2 に対応付けられていることを探します:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| ツールイベントが表示されない | この学習ステップでは、明示的な `Use accessibility_rule_lookup` 指示を維持します。 |
| コンパイラが `AIFunction` を見つけられない | カタログファイルに `using Microsoft.Extensions.AI;` を追加します。 |
| 結果に完全一致がないと表示される | プロンプトに、スターターデータ内のキーワードである `accessible name` が含まれていることを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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

カタログツールと検索は `Helpers/AccessibilityRuleCatalog.cs` にあります。ツール開始と完了の出力は `Helpers/ResponseStreamer.cs` にあります。

</details>
:::

:::language nodejs
## TypeScript の検索を接続する

### 1. あらかじめ用意された型付きツールを確認する

`src/workshop.ts` を開きます。スターターはすでにカタログをインポートし、このローカルツールを定義しています:

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

Zod スキーマは、モデルから見える型付き `query` 引数を定義します。ハンドラーは、引き続きアプリケーションが所有する `accessibilityRules` を検索します。`skipPermission: true` は意図的です。このツールはアプリケーションが所有する読み取り専用データだけを返すためです。

### 2. ツールアクティビティの出力を確認する

同じファイルで、`streamResponse` はすでにツールのライフサイクルイベントを出力します:

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

モデルがローカルツールを呼び出すタイミングを確認できるように、これらの分岐を維持します。

### 3. ツールを登録して要求する

`src/index.ts` で、ストリーミングヘルパーと一緒にツールをインポートします:

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

セッション作成と送信呼び出しを置き換えます:

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

`tools` は実装を登録します。`availableTools` はモデルが呼び出せる許可リストです。

## 実行する

```bash
npm start
```

ツール名と WCAG 4.1.2 のガイダンスを探します:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| TypeScript が `zod` を解決できない | スターターディレクトリで `npm install` を実行します。 |
| ツールイベントが表示されない | ツール名を `tools` と `availableTools` の両方に保持し、プロンプト内の明示的な指示も維持します。 |
| 検索で一致が返らない | `4.1.2` または `accessible name` について尋ねます。どちらもカタログに含まれています。 |
| ツールイベントがまったく出力されない | `streamResponse` が引き続き `tool.execution_start` と `tool.execution_complete` を処理していることを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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

型付きツール定義とツールアクティビティの出力は `src/workshop.ts` にあります。

</details>
:::

:::language python
## Python の検索を接続する

### 1. あらかじめ用意された型付きツールを確認する

`workshop.py` を開きます。スターターはすでにパラメーターモデルとローカルツールを定義しています:

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

Pydantic はモデルから見える引数を記述し、ハンドラーは、引き続きアプリケーションが所有する `ACCESSIBILITY_RULES` を検索します。`skip_permission=True` は意図的です。このツールはアプリケーションが所有する読み取り専用データだけを返すためです。

### 2. ツールを登録して要求する

`main.py` で、ツールをインポートします:

```python
from workshop import accessibility_rule_lookup
```

セッション作成と送信呼び出しを置き換えます。ステップ 2 のイベントハンドラーはセッションブロック内に保持します:

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

`tools` は実装を登録します。`available_tools` はモデルが呼び出せる許可リストです。

## 実行する

```bash
python main.py
```

応答では、カタログの WCAG 4.1.2 タイトルと推奨事項を使用するはずです:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| Python が `pydantic` をインポートできない | 事前準備の仮想環境をアクティブ化し、`requirements.txt` を再インストールします。 |
| ツールが呼び出されない | `tools` と `available_tools` の両方に保持し、プロンプト内の明示的な指示も維持します。 |
| 検索で一致が返らない | `4.1.2` または `accessible name` について尋ねます。どちらもカタログに含まれています。 |
| `accessibility_rule_lookup` のインポートエラー | `from workshop import accessibility_rule_lookup` が `main.py` にあることを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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

型付きツール定義は `workshop.py` にあります。

</details>
:::

:::language go
## Go の検索を接続する

### 1. 型付き検索を追加する

`strings` を `main.go` のインポートに追加し、`streamResponse` の前に次の宣言を追加します:

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

### 2. ツールを定義して登録する

`main` の開始時に、ツールを作成します:

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

セッション構成と最後の送信を置き換えます:

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

`Tools` は実装を登録します。`AvailableTools` はモデルが呼び出せる許可リストです。`SkipPermission = true` は意図的です。このツールはアプリケーションが所有する読み取り専用データだけを返すためです。

## 実行する

```bash
go run .
```

ストリーミングされた応答では、WCAG 4.1.2 の検索結果を使用するはずです:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| `strings` が未定義 | 標準ライブラリの `strings` インポートを追加します。 |
| モデルからツールが見えない | ツールを `Tools` に、その正確な名前を `AvailableTools` に保持します。 |
| 検索で一致が返らない | `4.1.2` または `accessible name` について尋ねます。 |
| `DefineTool` でビルドが失敗する | ハンドラーシグネチャが `(lookupParams, copilot.ToolInvocation) (any, error)` であることを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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
## Rust の検索を接続する

### 1. 型付きハンドラーを追加する

`src/main.rs` の先頭付近に次のインポートを追加します:

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

より狭いステップ 2 の SDK インポートを置き換え、`stream_response` の前に型付きハンドラーを追加します:

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

### 2. ツールを定義して登録する

`main` の開始時に、ツールを作成してセッション構成に追加します:

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

マクロ呼び出しの後に、ステップ 2 の切断とクライアントのシャットダウンを保持します。`config.tools` は実装を登録します。`config.available_tools` はモデルが呼び出せる許可リストです。`with_skip_permission(true)` は意図的です。このツールはアプリケーションが所有する読み取り専用データだけを返すためです。

## 実行する

```bash
cargo run
```

ストリーミングされた応答では、WCAG 4.1.2 の検索結果を使用するはずです:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| trait または derive が解決されない | 上に示した `async_trait`、`serde`、schema、tool のインポートを維持します。 |
| モデルからツールが見えない | `config.tools` と `config.available_tools` の両方を設定します。 |
| 検索で一致が返らない | `4.1.2` について明示的に尋ねます。 |
| ハンドラー型エラー | `ToolHandler::call` が `Result<ToolResult, Error>` を返すことを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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
## Java の検索を接続する

### 1. 型付き検索を追加する

`src/main/java/workshop/AccessibilityReport.java` に次のインポートを追加します:

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

クラスの閉じ波かっこの前にこのメソッドを追加します:

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

### 2. ツールを定義して登録する

`main` の開始時に、ツールとセッション構成を定義します:

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

セッション作成と、クライアントブロック内のプロンプトを置き換えます:

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

`setTools` は実装を登録します。`setAvailableTools` はモデルが呼び出せる許可リストです。`skipPermission(true)` は意図的です。このツールはアプリケーションが所有する読み取り専用データだけを返すためです。ステップ 4 でスコープ付き Playwright ハンドラーに置き換えるまでは、ステップ 1 の権限ハンドラーを保持します。Java の実装では `sendAndWait` を使用するストリーミング対応セッションを使うため、ターンが完了すると完了済み応答を出力します。

## 実行する

```bash
./mvnw compile exec:java
```

応答では、WCAG 4.1.2 の検索結果を使用するはずです:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| `ToolDefinition` または `Param` が解決されない | 上に示した 2 つの Copilot ツールインポートを追加します。 |
| モデルからツールが見えない | 同じセッション構成で `setTools` と `setAvailableTools` を維持します。 |
| 検索で一致が返らない | `4.1.2` について明示的に尋ねます。 |
| メソッド参照が失敗する | `lookupRule` が `private static` で、1 つの `String` を受け取ることを確認します。 |

</details>

<details>
<summary>ステップ 3 の完全な実装</summary>

このステップ 3 の完全な実装と自分のバージョンを比較します。

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

> **Playwright の準備ができています:** 回答がアプリケーションカタログの基準 4.1.2 を使用している場合。

## 理解度を確認する

アプリケーションが所有する明細から注文合計を計算する処理は、ローカルツールと MCP サーバーのどちらにするべきですか?

<details>
<summary>回答を確認する</summary>

通常はローカルツールです。アプリケーションが明細と決定論的な計算を所有しているため、プロセス内関数の方がテストしやすく、プロセス境界を越えません。

</details>

## 詳細情報

- [フックの操作](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  各ツール呼び出しの前後でランタイムが呼び出すコールバックです。監査や独自のポリシーに使用できます。
- [ツール使用後フック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  モデルがツール結果を見る前に、その結果を検査または書き換えます。
- [カスタムスキル](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  セッションが登録するツールの横で読み込まれる再利用可能な指示をパッケージ化します。

続いて [ステップ 4: 外部ツールを安全に接続する](04-mcp-safety.md) に進みます。
