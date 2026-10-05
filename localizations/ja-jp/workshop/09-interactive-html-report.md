# ステップ 9: インタラクティブな HTML レポートを生成する

> **所要時間:** 15 分  
> **前提条件:** 「ステップ 8: モデルを選択する」を完了していること。

## 作成するもの

Markdown レポートはターミナルでは便利ですが、検出事項はブラウザーの方が探索しやすくなります。同じレポートセッションでスタンドアロンの `accessibility-report.html` ファイルを 1 つ作成し、ローカルで開いて検出事項をフィルターします。

## 範囲を絞った書き込み機能を追加する

以前のアプリケーション所有ツールは読み取り専用で、Playwright は 1 つの正確な URL にしか移動できません。このステップでは、`builtin:apply_patch` と `builtin:create` という 2 つのランタイム組み込みツールを追加します。どちらのツールでもレポートファイルを作成できます。

ただし、すべてのファイル変更を承認するという意味では**ありません**。既存のブラウザーナビゲーションルールを維持し、書き込みは、アプリケーション作業ディレクトリ内の `accessibility-report.html` を直接対象にする場合にのみ承認します。シェルコマンド、その他のファイル書き込み、その他すべての権限要求は拒否してください。

レポートプロンプトは引き続き証拠ベースです。HTML 成果物を書き込む前に、ナビゲーションし、現在の実行のスナップショットを読み取り、カタログガイダンスを参照する必要があります。

:::language dotnet
## .NET の書き込み権限のスコープを設定する

`Helpers/WorkshopPermissionHandler.cs` の `CreateForTarget` を置き換えます。ヘルパーはアプリケーションディレクトリも受け取るようになり、正規化された 1 つのレポートパスだけを許可します:

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget,
    string workingDirectory)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);
    var reportPath = Path.GetFullPath(Path.Combine(workingDirectory, "accessibility-report.html"));

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            PermissionRequestWrite write
                when Path.GetFullPath(write.FileName).Equals(reportPath, StringComparison.OrdinalIgnoreCase) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows only exact target navigation and writing accessibility-report.html.")
        };

        return Task.FromResult(decision);
    };
}
```

既存のヘルパーメソッドは保持します。`Program.cs` では、既存の `workingDirectory` を渡し、ソース修飾付きの組み込みツールを追加します:

```csharp
OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri, workingDirectory),
AvailableTools =
[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create"
],
```

`Helpers/Prompts.cs` の `CreateReportPrompt` の本文を置き換えます:

```csharp
public static string CreateReportPrompt(Uri targetUri) => $"""
    Prepare an evidence-based accessibility review of {targetUri.AbsoluteUri}.

    1. Use browser_navigate to open that exact URL.
    2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
    3. Identify three to five high-confidence issues supported by the snapshot.
    4. Call accessibility_rule_lookup for each issue before recommending a fix.
    5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

    Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
    JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
    finding count, review limits, and one finding card per supported issue with its evidence, WCAG
    criterion, and remediation. Add an accessible text filter that updates a visible result count
    and filters cards by finding name, criterion, or evidence. Escape all finding text before
    inserting it into HTML. Make keyboard focus visible.

    Do not write any other file. After the write succeeds, respond only with:
    Created accessibility-report.html
    """;
```
:::

:::language nodejs
## Node.js の書き込み権限のスコープを設定する

`src/workshop.ts` で、`permissionForTarget` を、正確なナビゲーションを維持し、正規化されたレポートパスだけを追加するバージョンに置き換えます:

```typescript
export function permissionForTarget(target: URL, workingDirectory: string): PermissionHandler {
  const reportPath = resolve(workingDirectory, "accessibility-report.html");
  return (request) => {
    if (request.kind === "mcp" && request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" || request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" && sameUrl(request.args.url, target)) {
      return { kind: "approve-once" };
    }
    if (request.kind === "write" && typeof request.fileName === "string" &&
      resolve(workingDirectory, request.fileName) === reportPath) {
      return { kind: "approve-once" };
    }
    return { kind: "reject", feedback: "This workshop allows only exact target navigation and writing accessibility-report.html." };
  };
}
```

`src/report.ts` で、作業ディレクトリをハンドラーに渡し、組み込みツールを `availableTools` に追加します:

```typescript
onPermissionRequest: permissionForTarget(target, process.cwd()),
availableTools: [
  "accessibility_rule_lookup",
  "read_latest_accessibility_snapshot",
  "playwright-browser_navigate",
  "builtin:apply_patch",
  "builtin:create",
],
```

`src/workshop.ts` の `reportPrompt` を置き換えます:

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`;
}
```
:::

:::language python
## Python の書き込み権限のスコープを設定する

`workshop.py` で、`permission_for_target` をこのパス対応バージョンに置き換えます:

```python
def permission_for_target(target: str, working_directory: str):
    report_path = Path(working_directory, "accessibility-report.html").resolve()

    def handler(request, _invocation):
        if getattr(request, "kind", None) == "mcp" and request.server_name == "playwright" and request.tool_name in {"browser_navigate", "playwright-browser_navigate"} and isinstance(request.args, dict) and isinstance(request.args.get("url"), str) and _same_url(request.args["url"], target):
            return PermissionDecisionApproveOnce()
        if getattr(request, "kind", None) == "write" and isinstance(getattr(request, "file_name", None), str):
            candidate = Path(request.file_name)
            candidate = candidate if candidate.is_absolute() else Path(working_directory, candidate)
            if candidate.resolve() == report_path:
                return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback="This workshop allows only exact target navigation and writing accessibility-report.html.")

    return handler
```

`report.py` で、現在のディレクトリを権限ハンドラーに渡し、ソース修飾付きの組み込みツールを追加します:

```python
on_permission_request=permission_for_target(target, "."),
available_tools=[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create",
],
```

`workshop.py` の `report_prompt` を置き換えます:

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"""
```
:::

:::language go
## Go の書き込み権限のスコープを設定する

`main.go` の `permissionForTarget` を置き換えます。書き込み分岐は相対ファイル名をアプリケーション作業ディレクトリに対して解決するため、同階層または親のパスは拒否されます:

```go
func permissionForTarget(target, workingDirectory string) copilot.PermissionHandlerFunc {
	reportPath := filepath.Join(workingDirectory, "accessibility-report.html")
	return func(request copilot.PermissionRequest, _ copilot.PermissionInvocation) (rpc.PermissionDecision, error) {
		raw, _ := json.Marshal(request)
		var value map[string]any
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "mcp" && value["serverName"] == "playwright" {
			toolName, _ := value["toolName"].(string)
			args, _ := value["args"].(map[string]any)
			requested, _ := args["url"].(string)
			if (toolName == "browser_navigate" || toolName == "playwright-browser_navigate") && sameURL(requested, target) {
				return &rpc.PermissionDecisionApproveOnce{}, nil
			}
		}
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "write" {
			if fileName, ok := value["fileName"].(string); ok {
				candidate := fileName
				if !filepath.IsAbs(candidate) {
					candidate = filepath.Join(workingDirectory, candidate)
				}
				if filepath.Clean(candidate) == reportPath {
					return &rpc.PermissionDecisionApproveOnce{}, nil
				}
			}
		}
		feedback := "This workshop allows only exact target navigation and writing accessibility-report.html."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

`workingDirectory` をヘルパーに渡し、ソース修飾付きの組み込みツールを追加します:

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

`reportPrompt` を置き換えます:

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`, target)
}
```
:::

:::language rust
## Rust の書き込み権限のスコープを設定する

`ScopedPermissions` に `report_path: PathBuf` を追加します。ステップ 4 の `permission_payload` 抽出は保持してください。SDK がネストされた `permissionRequest` オブジェクトを送信した場合はそれを優先し、古いペイロードでは直接のオブジェクトにフォールバックし、不正な形式のネスト値は拒否します。次に、拒否する `else` の前にこの書き込み分岐を追加します:

```rust
let file_name = permission_payload(&request.extra)
    .and_then(|payload| payload.get("fileName"))
    .and_then(serde_json::Value::as_str);
let report_write = request.kind == Some(PermissionRequestKind::Write)
    && file_name.is_some_and(|name| {
    let candidate = Path::new(name);
    let candidate = if candidate.is_absolute() {
        candidate.to_path_buf()
    } else {
        self.report_path.parent().unwrap_or(Path::new("")).join(candidate)
    };
    candidate == self.report_path
    });

if report_write {
    PermissionResult::approve_once()
} else if server == Some("playwright")
    && matches!(tool, Some("browser_navigate" | "playwright-browser_navigate"))
    && requested.as_ref().is_some_and(|url| same_url(url, &self.target))
{
    PermissionResult::approve_once()
} else {
    PermissionResult::reject(Some(
        "This workshop allows only exact target navigation and writing accessibility-report.html."
            .to_owned(),
    ))
}
```

権限ハンドラーを作成するときに、新しいフィールドを設定し、組み込みツールを追加します:

```rust
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
    "builtin:apply_patch".to_owned(),
    "builtin:create".to_owned(),
]);
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
    report_path: working_directory.join("accessibility-report.html"),
}));
```

`report_prompt` を置き換えます:

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"#
    )
}
```
:::

:::language java
## Java の書き込み権限のスコープを設定する

`src/main/java/workshop/AccessibilityReport.java` で、`isExactNavigation` の横にこのヘルパーを追加します:

```java
private static boolean isReportWrite(Map<String, Object> request, Path workingDirectory) {
    if (request == null || !(request.get("fileName") instanceof String fileName)) {
        return false;
    }
    Path candidate = Path.of(fileName);
    if (!candidate.isAbsolute()) {
        candidate = workingDirectory.resolve(candidate);
    }
    return candidate.normalize().equals(
            workingDirectory.resolve("accessibility-report.html").normalize());
}
```

> **重要な Java 安全性警告:** 既定のハンドラーは引き続きフェイルクローズのままです。正確な対象の検証後にのみ MCP 要求を承認し、`accessibility-report.html` のパス検証後にのみ書き込み要求を承認します。現在の Java SDK リリースでは、これらの権限要求フィールドは公開されません ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273))。既存の `--allow-local-demo-mcp` フラグは `mcp` 種別に限定されています。ステップ 9 ではさらに `--allow-local-demo-write` が必要です。このフラグは `write` 種別と `builtin:apply_patch` / `builtin:create` ツール許可リストに限定されていますが、**出力パスを強制できません**。両方のフラグは、この使い捨ての管理されたローカルワークショップ対象にのみ有効にしてください。どちらのフォールバックも、本番、共有、または信頼されていないワークツリーには決して使用しないでください。

別個の書き込みフォールバックを追加するには、ステップ 4 のパーサーを次に置き換えます:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";
private static final String LOCAL_DEMO_WRITE_FLAG = "--allow-local-demo-write";

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    boolean allowLocalDemoWrite = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
            continue;
        }
        if (LOCAL_DEMO_WRITE_FLAG.equals(arg)) {
            if (allowLocalDemoWrite) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_WRITE_FLAG + " at most once.");
            }
            allowLocalDemoWrite = true;
            continue;
        }
        if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp, allowLocalDemoWrite);
}

private record RunOptions(URI target, boolean allowLocalDemoMcp, boolean allowLocalDemoWrite) {
}
```

既存の `setAvailableTools` 呼び出しと権限コールバックを拡張します:

```java
.setAvailableTools(List.of(
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate",
        "builtin:apply_patch",
        "builtin:create"))
// Keep the existing MCP server configuration.
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if ("write".equals(request.getKind())
            && isReportWrite(request.getExtensionData(), workingDirectory)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoWrite() && "write".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows only exact target navigation and writing accessibility-report.html. "
                            + "Requests without target or path data remain denied unless the explicit "
                            + "local-demo fallback for that permission kind is enabled."));
})
```

`reportPrompt` を置き換えます:

```java
private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.
            5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

            Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
            JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
            finding count, review limits, and one finding card per supported issue with its evidence, WCAG
            criterion, and remediation. Add an accessible text filter that updates a visible result count
            and filters cards by finding name, criterion, or evidence. Escape all finding text before
            inserting it into HTML. Make keyboard focus visible.

            Do not write any other file. After the write succeeds, respond only with:
            Created accessibility-report.html""".formatted(target);
}
```
:::

## 実行する

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
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp --allow-local-demo-write {{TARGET_APP_URL}}"
```
:::

ワークショップの対象を使用します:

```text
{{TARGET_APP_URL}}
```

ツールトランスクリプトには、既存のナビゲーション、スナップショット、カタログ呼び出しに加えて、`apply_patch` または `create` を使用した書き込みが含まれている必要があります。ブラウザーで `accessibility-report.html` を開きます。フィルターに検出事項、WCAG 基準、または証拠行の単語を入力し、表示されるカードと結果数が更新されることを確認します。

<details>
<summary>このステップのトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| 書き込みが拒否される | 既定のハンドラーでは、正確な `accessibility-report.html` パスが必要です。Java SDK のペイロードフィールドが利用できない場合は、管理されたローカルデモにのみ `--allow-local-demo-write` を使用してください。これは `write` 種別を承認しますが、パスは証明できません。 |
| 複数のファイルが要求される | 新しい組み込み機能には `builtin:apply_patch` と `builtin:create` だけを保持してください。既定のハンドラーは他のパスを拒否します。Java local-demo 書き込みフォールバックはその保証を行えません。 |
| フィルターが機能しない | 生成されたドキュメントには、カードをフィルターし、ライブ結果数を更新する埋め込み JavaScript が含まれている必要があります。エージェントが必須要素を省略した場合は 1 回再実行してください。 |
| レポートがスタイルなしで読み込まれる | CSS と JavaScript は 1 つの HTML ファイルに埋め込んだままにしてください。プロンプトは外部アセットとライブラリを意図的に禁止しています。 |

</details>

> **このステップが完了する条件:** `accessibility-report.html` がローカルで開き、証拠に基づく検出事項をフィルターできること。既定の厳密なハンドラーでは、セッションは他のファイルパスを承認しません。Java local-demo 書き込みフォールバックは、意図的にその保証を行えません。

## 理解度を確認する

名前付きの 2 つの組み込み書き込みツールを許可する方が、ファイルシステムアクセスを広く承認するより安全なのはなぜですか。

<details>
<summary>回答を確認する</summary>

`builtin:apply_patch` と `builtin:create` は、必要なファイル書き込み機能だけを公開します。既定の権限コールバックは、両方の機能を 1 つの正規化された出力パスに結び付けます。既存のローカルツールとスコープ付き Playwright ナビゲーションは変えずに、モデルがシェルコマンドを使用したり別のファイルを書き込んだりできないようにします。Java local-demo フォールバックは、SDK が権限ペイロードフィールドを公開していない間の明示的な例外であるため、管理されたローカル対象に限定し続ける必要があります。

</details>

## 詳細情報

- [ツール使用前フック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md): プロンプトではなくコードで、ツール呼び出しを実行前に承認、拒否、または書き換える方法。
- [フックリファレンス](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md): SDK が公開するすべてのフックと、それぞれが受け取る入力。
- [ローカル CLI セットアップ](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md): SDK が起動する CLI を制御する方法。これにより、書き込まれるファイルの配置先が決まります。

お祝いと、構築を続けるためのリソースについては、[ステップ 10: やり遂げました！](10-complete.md)に進みます。
