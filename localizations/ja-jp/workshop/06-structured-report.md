# ステップ 6: 構造化レポートを生成する

> **所要時間:** 10 分

## 生成するもの

ページ証拠、基準の対応付け、修復方法、レビューで確認できる範囲の限界を明確に分けた、簡潔なレポートを生成します。

## 証拠と解釈を明確に分ける

エージェントの応答には **証拠** と **解釈** が含まれます。証拠とは、アクセシブルな名前のない入力など、Playwright が観察したものです。解釈とは、その証拠とカタログ結果に基づく基準の対応付けと修復です。

明確な出力契約は、何を含め、何を除外し、不確実性をどう扱うかをエージェントに伝えます。レビューが網羅的であると主張せずに、レポートの一貫性を高めます。

## 結果を過度に主張せず実用性を保つ

1 つの自動スナップショットでは、アクセシビリティ適合性を確立できません。レポートは、作り上げた統計、装飾的な重大度ラベル、ページが WCAG に合格または不合格であるという広範な主張を避け、確信度の高い検出事項に絞る必要があります。

エージェントはこれで、`browser evidence + catalog result` を境界付けられた再現可能なレポートに変換します。

## レポートに契約を与える

:::language dotnet
### 1. レポート契約を追加する

`Helpers/Prompts.cs` を作成します。

```csharp
namespace HelloCopilotSDK.Helpers;

public static class Prompts
{
    public static string CreateReportPrompt(Uri targetUri) => $"""
        Prepare an evidence-based accessibility review of {targetUri.AbsoluteUri}.

        1. Use browser_navigate to open that exact URL.
        2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
        3. Identify three to five high-confidence issues supported by the snapshot.
        4. Call accessibility_rule_lookup for each issue before recommending a fix.

        Return only this structure:

        # Accessibility review
        ## Finding 1: <short name>
        - Evidence: <specific element or page structure observed in the browser>
        - WCAG criterion: <criterion and title returned by the catalog>
        - Recommended remediation: <specific implementation change>

        Repeat the finding section as needed.

        ## Review limits
        State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.

        Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.
        """;
}
```
:::
:::language dotnet
### 2. 契約を使用する

`Program.cs` の最後の send 呼び出しを置き換えます。

```csharp
Console.WriteLine($"\nAnalyzing: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(session, Prompts.CreateReportPrompt(targetUri));
```
:::

:::language nodejs
### 1. レポート契約を追加する

`src/workshop.ts` で、`reportPrompt` を追加または置き換えます。

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.`;
}
```
:::
:::language nodejs
### 2. レポートエントリポイントを作成する

URL 解析、セッション構成、プロンプトを含む `src/report.ts` を作成または置き換えます。

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, reportPrompt, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true, onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try { await streamResponse(session, reportPrompt(target)); } finally { await session.disconnect(); }
} finally { await client.stop(); }
```
:::
:::language nodejs
### 3. パッケージの start をレポートエントリポイントに向ける

パッケージの start コマンドがレポートエントリポイントを起動するように、`src/index.ts` を置き換えます。

```typescript
import "./report.js";
```
:::

:::language python
### 1. レポート契約を追加する

`workshop.py` で、`report_prompt` を追加または置き換えます。

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."""
```
:::
:::language python
### 2. レポートエントリポイントを作成する

URL 解析、セッション構成、ストリーミング、レポートプロンプトを含む `report.py` を作成または置き換えます。

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData, ToolExecutionCompleteData, ToolExecutionStartData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target, report_prompt


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True, on_permission_request=permission_for_target(target), tools=[accessibility_rule_lookup, create_snapshot_reader(".")], available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"], mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}}) as session:
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
                    case ToolExecutionStartData(tool_name=name): print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success): print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData(): done.set()
            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```
:::
:::language python
### 3. ドキュメント化されたコマンドをレポートエントリポイントに向ける

ドキュメント化されたコマンドがレポートエントリポイントを起動するように、`main.py` を置き換えます。

```python
from report import main

import asyncio

if __name__ == "__main__":
    asyncio.run(main())
```
:::

:::language go
### 1. レポート契約を追加する

`main.go` で、`reportPrompt` を追加します。

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot for browser-observable evidence.
3. Call accessibility_rule_lookup before each recommendation.

Return only:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific browser evidence>
- WCAG criterion: <catalog result>
- Recommended remediation: <specific change>
## Review limits
State that this focused review is not a full WCAG conformance audit.`, target)
}
```
:::
:::language go
### 2. 対象を解析して契約を使用する

URL 引数を検証し、3 ツールセッションを構築し、レポートプロンプトを送信するように `main` を置き換えます。

```go
func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "Usage: go run . <http-or-https-url>")
		return
	}
	target := os.Args[1]
	if !strings.Contains(target, "://") {
		target = "https://" + target
	}
	parsed, err := url.ParseRequestURI(target)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		fmt.Fprintln(os.Stderr, "Enter an absolute HTTP or HTTPS URL.")
		return
	}

	workingDirectory, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
	lookup.SkipPermission = true
	readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
	readSnapshot.SkipPermission = true

	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()
	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
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
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()
	if err := streamResponse(session, reportPrompt(target)); err != nil {
		panic(err)
	}
}
```
:::

:::language rust
### 1. レポート契約を追加する

`src/main.rs` で、`report_prompt` を追加します。

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."#
    )
}
```
:::
:::language rust
### 2. 対象を解析して契約を使用する

URL 引数を検証し、3 ツールセッションを構築し、レポートプロンプトを送信するように `main` を置き換えます。

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let argument = std::env::args()
        .nth(1)
        .ok_or("Usage: cargo run -- <http-or-https-url>")?;
    let target_text = if argument.contains("://") {
        argument
    } else {
        format!("https://{argument}")
    };
    let target = Url::parse(&target_text)?;
    if !matches!(target.scheme(), "http" | "https") || target.host_str().is_none() {
        return Err("Enter an absolute HTTP or HTTPS URL.".into());
    }

    let working_directory = std::env::current_dir()?;
    let lookup = Tool::new("accessibility_rule_lookup")
        .with_description("Looks up read-only WCAG guidance maintained by this application.")
        .with_parameters(schema_for::<LookupParams>())
        .with_skip_permission(true)
        .with_handler(Arc::new(AccessibilityRuleLookup));
    let reader = Tool::new("read_latest_accessibility_snapshot")
        .with_description(
            "Reads the newest Playwright accessibility snapshot created during this run.",
        )
        .with_parameters(
            serde_json::json!({"type": "object", "properties": {}, "additionalProperties": false}),
        )
        .with_skip_permission(true)
        .with_handler(Arc::new(SnapshotReader::new(&working_directory)));

    let mut config = SessionConfig::default();
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

    let client = Client::start(ClientOptions::default()).await?;
    let session = client.create_session(config).await?;
    stream_response!(session, report_prompt(&target));
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
:::

:::language java
### 1. レポート契約を追加する

`src/main/java/workshop/AccessibilityReport.java` で、`reportPrompt` を追加します。

```java
private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.

            Return only this structure:
            # Accessibility review
            ## Finding 1: <short name>
            - Evidence: <specific element or page structure observed in the browser>
            - WCAG criterion: <criterion and title returned by the catalog>
            - Recommended remediation: <specific implementation change>
            Repeat the finding section as needed.
            ## Review limits
            State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
            Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.""".formatted(target);
}
```

ステップ 4 の権限コールバックは変更せずに維持します。制御されたワークショップ対象に対して `--allow-local-demo-mcp` を明示的に渡さない限り、fail-closed のままです。この一時的な `mcp` 種類専用フォールバックは、[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273) が要求ペイロードを公開していないため、正確な URL を証明しません。使い捨てのローカルワークショップデモ以外では使用しないでください。
:::
:::language java
### 2. 対象を解析して契約を使用する

URL 引数を検証し、3 ツールセッションを構築し、レポートプロンプトを送信するように `main` を置き換えます。

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

public static void main(String[] args) throws Exception {
    RunOptions options = parseRunOptions(args);
    URI target = options.target();
    Path workingDirectory = Path.of("").toAbsolutePath().normalize();
    if (options.allowLocalDemoMcp()) {
        System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
                + "so this run approves only the mcp permission kind, not an exact target. "
                + "Use only with the controlled workshop target.");
    }
    var lookup = ToolDefinition.from(
            "accessibility_rule_lookup",
            "Looks up read-only WCAG guidance maintained by this application.",
            Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
            AccessibilityReport::lookupRule).skipPermission(true);
    var readSnapshot = ToolDefinition.from(
            "read_latest_accessibility_snapshot",
            "Reads the newest Playwright accessibility snapshot created during this run.",
            new SnapshotReader(workingDirectory)::read).skipPermission(true);

    var config = new SessionConfig()
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

    try (var client = new CopilotClient()) {
        client.start().get();
        var session = client.createSession(config).get();
        var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
        if (response == null) {
            throw new IllegalStateException("Copilot completed without an assistant message.");
        }
        System.out.println(response.getData().content());
    }
}
```

実装の `parseTarget` とフォールバックヘルパーは `main` の横に維持します。

```java
private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme()) || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
        } else if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp);
}

private static String usage() {
    return "Usage: ./mvnw compile exec:java -Dexec.args=\"["
            + LOCAL_DEMO_MCP_FLAG + "] <http-or-https-url>\"";
}

private record RunOptions(URI target, boolean allowLocalDemoMcp) {
}
```
:::

## 実行する

:::language dotnet
```bash
dotnet run
```

アプリが URL を求めたら、次を貼り付けます。

```text
{{TARGET_APP_URL}}
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

レポートはこの形に従う必要があります。

```text
# Accessibility review
## Finding 1: Input has no accessible name
- Evidence: The snapshot contains a textbox with no accessible name.
- WCAG criterion: 4.1.2 Name, Role, Value
- Recommended remediation: Associate a visible label using matching for and id values.

## Review limits
This focused review uses browser-observable evidence and is not a full WCAG conformance audit.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| 出力に根拠のない件数が含まれる | サポートされていない統計を報告しないようプロンプトに記載されていることを確認します。 |
| 検出事項に具体的な要素または構造がない | 根拠がないものとして扱います。レポート契約の証拠要件を維持します。 |
| 応答が WCAG 適合性を主張する | 必須の **Review limits** セクションと明示的な禁止を維持します。 |
| パッケージがまだ以前のエントリポイントを実行する | 使用する言語の start コマンドをステップ 6 のレポートエントリポイントに向けます。 |
| URL が拒否される | HTTP または HTTPS URL を渡します。スキームがない場合は自動的に `https://` に変更されます。 |

</details>

> **最終実行の準備ができた目安:** 各検出事項に具体的なブラウザー証拠、カタログ基準、修復が含まれ、レポートが限界で終わります。

## 理解度を確認する

レポート内で、どの内容が直接証拠で、どの内容がモデルの解釈ですか。

<details>
<summary>回答を確認する</summary>

Playwright が返す要素またはページ構造が証拠です。基準を選択し、修復を書くことは、その証拠とカタログ結果に基づく解釈です。

</details>

:::language dotnet
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/dotnet/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/dotnet/accessibility-report) プロジェクトを使用します。

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Accessibility Report Generator ===\n");

Console.Write("Enter URL to analyze: ");
var urlInput = Console.ReadLine()?.Trim();

if (string.IsNullOrWhiteSpace(urlInput))
{
    Console.Error.WriteLine("Enter a URL to analyze.");
    return;
}

if (!urlInput.Contains("://", StringComparison.Ordinal))
{
    urlInput = $"https://{urlInput}";
}

if (!Uri.TryCreate(urlInput, UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Enter an absolute HTTP or HTTPS URL.");
    return;
}

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"\nConnected to the Copilot runtime: {ping.Message}\n");

var workingDirectory = Directory.GetCurrentDirectory();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri),
    Tools =
    [
        AccessibilityRuleCatalog.CreateLookupTool(),
        PlaywrightSnapshotReader.CreateTool(workingDirectory)
    ],
    AvailableTools =
    [
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate"
    ],
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["playwright"] = new McpStdioServerConfig
        {
            Command = "npx",
            Args = ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
            WorkingDirectory = workingDirectory,
            Tools = ["browser_navigate"]
        }
    }
});

Console.WriteLine($"Analyzing: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(session, Prompts.CreateReportPrompt(targetUri));
```
</details>
:::

:::language nodejs
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report) プロジェクトを使用します。

`src/index.ts`:

```typescript
import "./report.js";
```

`src/report.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, reportPrompt, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true, onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try { await streamResponse(session, reportPrompt(target)); } finally { await session.disconnect(); }
} finally { await client.stop(); }
```

`reportPrompt`（`src/workshop.ts`）:

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.`;
}
```
</details>
:::

:::language python
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report) プロジェクトを使用します。

`main.py`:

```python
from report import main

import asyncio

if __name__ == "__main__":
    asyncio.run(main())
```

`report.py`:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData, ToolExecutionCompleteData, ToolExecutionStartData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target, report_prompt


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True, on_permission_request=permission_for_target(target), tools=[accessibility_rule_lookup, create_snapshot_reader(".")], available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"], mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}}) as session:
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
                    case ToolExecutionStartData(tool_name=name): print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success): print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData(): done.set()
            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

`report_prompt`（`workshop.py`）:

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."""
```
</details>
:::

:::language go
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/go/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/accessibility-report) プロジェクトを使用します。レポート契約とエントリポイント:

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot for browser-observable evidence.
3. Call accessibility_rule_lookup before each recommendation.

Return only:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific browser evidence>
- WCAG criterion: <catalog result>
- Recommended remediation: <specific change>
## Review limits
State that this focused review is not a full WCAG conformance audit.`, target)
}

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "Usage: go run . <http-or-https-url>")
		return
	}
	target := os.Args[1]
	if !strings.Contains(target, "://") {
		target = "https://" + target
	}
	parsed, err := url.ParseRequestURI(target)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		fmt.Fprintln(os.Stderr, "Enter an absolute HTTP or HTTPS URL.")
		return
	}

	workingDirectory, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
	lookup.SkipPermission = true
	readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
	readSnapshot.SkipPermission = true

	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()
	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
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
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()
	if err := streamResponse(session, reportPrompt(target)); err != nil {
		panic(err)
	}
}
```
</details>
:::

:::language rust
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/rust/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/accessibility-report) プロジェクトを使用します。レポート契約とエントリポイント:

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."#
    )
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let argument = std::env::args()
        .nth(1)
        .ok_or("Usage: cargo run -- <http-or-https-url>")?;
    let target_text = if argument.contains("://") {
        argument
    } else {
        format!("https://{argument}")
    };
    let target = Url::parse(&target_text)?;
    if !matches!(target.scheme(), "http" | "https") || target.host_str().is_none() {
        return Err("Enter an absolute HTTP or HTTPS URL.".into());
    }

    let working_directory = std::env::current_dir()?;
    let lookup = Tool::new("accessibility_rule_lookup")
        .with_description("Looks up read-only WCAG guidance maintained by this application.")
        .with_parameters(schema_for::<LookupParams>())
        .with_skip_permission(true)
        .with_handler(Arc::new(AccessibilityRuleLookup));
    let reader = Tool::new("read_latest_accessibility_snapshot")
        .with_description(
            "Reads the newest Playwright accessibility snapshot created during this run.",
        )
        .with_parameters(
            serde_json::json!({"type": "object", "properties": {}, "additionalProperties": false}),
        )
        .with_skip_permission(true)
        .with_handler(Arc::new(SnapshotReader::new(&working_directory)));

    let mut config = SessionConfig::default();
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

    let client = Client::start(ClientOptions::default()).await?;
    let session = client.create_session(config).await?;
    stream_response!(session, report_prompt(&target));
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
</details>
:::

:::language java
<details>
<summary>ステップ 6 の完全な実装</summary>

比較には、[`finished/java/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/accessibility-report) プロジェクトを使用します。レポート契約、引数解析、エントリポイント:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

public static void main(String[] args) throws Exception {
    RunOptions options = parseRunOptions(args);
    URI target = options.target();
    Path workingDirectory = Path.of("").toAbsolutePath().normalize();
    if (options.allowLocalDemoMcp()) {
        System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
                + "so this run approves only the mcp permission kind, not an exact target. "
                + "Use only with the controlled workshop target.");
    }
    var lookup = ToolDefinition.from(
            "accessibility_rule_lookup",
            "Looks up read-only WCAG guidance maintained by this application.",
            Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
            AccessibilityReport::lookupRule).skipPermission(true);
    var readSnapshot = ToolDefinition.from(
            "read_latest_accessibility_snapshot",
            "Reads the newest Playwright accessibility snapshot created during this run.",
            new SnapshotReader(workingDirectory)::read).skipPermission(true);

    var config = new SessionConfig()
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

    try (var client = new CopilotClient()) {
        client.start().get();
        var session = client.createSession(config).get();
        var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
        if (response == null) {
            throw new IllegalStateException("Copilot completed without an assistant message.");
        }
        System.out.println(response.getData().content());
    }
}

private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme()) || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
        } else if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp);
}

private static String usage() {
    return "Usage: ./mvnw compile exec:java -Dexec.args=\"["
            + LOCAL_DEMO_MCP_FLAG + "] <http-or-https-url>\"";
}

private record RunOptions(URI target, boolean allowLocalDemoMcp) {
}

private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.

            Return only this structure:
            # Accessibility review
            ## Finding 1: <short name>
            - Evidence: <specific element or page structure observed in the browser>
            - WCAG criterion: <criterion and title returned by the catalog>
            - Recommended remediation: <specific implementation change>
            Repeat the finding section as needed.
            ## Review limits
            State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
            Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.""".formatted(target);
}
```
</details>
:::

## 詳細情報

- [ユーザープロンプト送信済みフック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md): ランタイムがプロンプトを送信する前に、コード内でプロンプトを変更または拒否します。
- [ユーザープロンプト変換済みフック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md): ランタイムがテキストから実際に構築したモデル向けプロンプトを検査します。
- [引用](https://github.com/github/copilot-sdk/blob/main/docs/features/citations.md): 応答内の範囲を、それを裏付ける資料に結び付ける実験的な方法です。

[ステップ 7: アプリケーションを実行して説明する](07-run-explain.md)に進みます。
