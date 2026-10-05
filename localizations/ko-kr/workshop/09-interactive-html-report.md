# 9단계: 대화형 HTML 보고서 생성

> **소요 시간:** 15분  
> **필수 조건:** 8단계: 모델 선택을 완료해야 합니다.

## 빌드할 항목

Markdown 보고서는 터미널에서 유용하지만, 브라우저에서는 발견 사항을 더 쉽게 살펴볼 수 있습니다.
동일한 보고서 세션에서 독립 실행형 `accessibility-report.html` 파일 하나를 생성한 다음,
로컬에서 열어 발견 사항을 필터링합니다.

## 제한된 쓰기 기능 추가

앞에서 추가한 애플리케이션 소유 도구는 읽기 전용이며, Playwright는 정확히 하나의
URL로만 이동할 수 있습니다. 이 단계에서는 두 가지 런타임 기본 제공 도구인 `builtin:apply_patch`와 `builtin:create`를
추가합니다. 두 도구 모두 보고서 파일을 생성할 수 있습니다.

그렇다고 해서 모든 파일 변경을 승인하는 것은 **아닙니다**. 기존 브라우저 탐색 규칙을 유지하고,
애플리케이션 작업 디렉터리의 `accessibility-report.html`을 직접 대상으로 하는 쓰기만
승인합니다. 셸 명령, 다른 파일 쓰기 및 그 밖의 모든 권한 요청은 거부합니다.

보고서 프롬프트는 계속 근거를 기반으로 합니다. HTML 아티팩트를 작성하기 전에 페이지로 이동하고,
현재 실행의 스냅샷을 읽고, 카탈로그 지침을 조회해야 합니다.

:::language dotnet
## .NET 쓰기 권한 범위 지정

`Helpers/WorkshopPermissionHandler.cs`의 `CreateForTarget`을 교체합니다. 이제 이 헬퍼는
애플리케이션 디렉터리도 받아 정규화된 보고서 경로 하나만 허용합니다.

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

기존 헬퍼 메서드는 그대로 유지합니다. `Program.cs`에서 기존 `workingDirectory`를 전달하고
소스가 명시된 기본 제공 도구를 추가합니다.

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

`Helpers/Prompts.cs`에서 `CreateReportPrompt`의 본문을 교체합니다.

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
## Node.js 쓰기 권한 범위 지정

`src/workshop.ts`에서 `permissionForTarget`을 정확한 탐색 권한은 유지하면서
정규화된 보고서 경로만 추가하는 버전으로 교체합니다.

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

`src/report.ts`에서 작업 디렉터리를 핸들러에 전달하고 기본 제공 도구를
`availableTools`에 추가합니다.

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

`src/workshop.ts`에서 `reportPrompt`를 교체합니다.

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
## Python 쓰기 권한 범위 지정

`workshop.py`에서 `permission_for_target`을 다음과 같이 경로를 인식하는 버전으로 교체합니다.

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

`report.py`에서 현재 디렉터리를 권한 핸들러에 전달하고 소스가 명시된
기본 제공 도구를 추가합니다.

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

`workshop.py`에서 `report_prompt`를 교체합니다.

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
## Go 쓰기 권한 범위 지정

`main.go`에서 `permissionForTarget`을 교체합니다. 쓰기 분기는 상대 파일 이름을
애플리케이션 작업 디렉터리를 기준으로 해석하므로 형제 또는 부모 경로는 거부됩니다.

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

`workingDirectory`를 헬퍼에 전달하고 소스가 명시된 기본 제공 도구를 추가합니다.

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

`reportPrompt`를 교체합니다.

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
## Rust 쓰기 권한 범위 지정

`ScopedPermissions`에 `report_path: PathBuf`를 추가합니다. 4단계의 `permission_payload` 추출은 그대로 유지합니다.
SDK가 중첩된 `permissionRequest` 객체를 보내면 이 객체를 우선 사용하고, 이전 페이로드에서는 직접
객체로 대체하며, 잘못된 중첩 값은 거부합니다. 그런 다음 거부하는 `else` 앞에 다음 쓰기 분기를 추가합니다.

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

권한 핸들러를 생성할 때 새 필드를 설정하고 기본 제공 도구를 추가합니다.

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

`report_prompt`를 교체합니다.

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
## Java 쓰기 권한 범위 지정

`src/main/java/workshop/AccessibilityReport.java`에서 `isExactNavigation` 옆에 다음 헬퍼를 추가합니다.

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

> **중요한 Java 안전 경고:** 기본 핸들러는 계속 실패 시 차단(fail-closed) 방식으로 동작합니다. MCP
> 요청은 정확한 대상 검증을 통과한 후에만 승인하고, 쓰기 요청은
> `accessibility-report.html` 경로 검증을 통과한 후에만 승인합니다. 현재 Java SDK 릴리스는 이러한
> 권한 요청 필드를 제공하지 않습니다([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)).
> 기존 `--allow-local-demo-mcp` 플래그는 `mcp` 종류로 제한됩니다. 9단계에서는 추가로
> `--allow-local-demo-write`가 필요합니다. 이 플래그는 `write` 종류와
> `builtin:apply_patch` / `builtin:create` 도구 허용 목록으로 제한되지만 **출력 경로를 강제할 수 없습니다**.
> 두 플래그는 폐기 가능한 통제된 로컬 워크숍 대상에만
> 사용합니다. 프로덕션, 공유 또는 신뢰할 수 없는 worktree에서는 두 대체 방법을 절대 사용하지 않습니다.

별도의 쓰기 대체 방법을 추가하려면 4단계 파서를 다음 코드로 교체합니다.

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

기존 `setAvailableTools` 호출과 권한 콜백을 확장합니다.

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

`reportPrompt`를 교체합니다.

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
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp --allow-local-demo-write {{TARGET_APP_URL}}"
```
:::

워크숍 대상을 사용합니다.

```text
{{TARGET_APP_URL}}
```

도구 트랜스크립트에는 기존 탐색, 스냅샷 및 카탈로그 호출과 함께
`apply_patch` 또는 `create`를 사용하는 쓰기가 포함되어야 합니다. 브라우저에서 `accessibility-report.html`을 엽니다.
발견 사항 이름, WCAG 기준 또는 근거 줄의 단어를 필터에 입력하고 표시되는 카드와 결과
개수가 업데이트되는지 확인합니다.

<details>
<summary>이 단계의 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 쓰기가 거부됨 | 기본 핸들러에는 정확한 `accessibility-report.html` 경로가 필요합니다. Java SDK 페이로드 필드를 사용할 수 없다면 통제된 로컬 데모에서만 `--allow-local-demo-write`를 사용합니다. 이 플래그는 `write` 종류를 승인하지만 경로를 검증할 수 없습니다. |
| 두 개 이상의 파일이 요청됨 | 새 기본 제공 기능에는 `builtin:apply_patch`와 `builtin:create`만 유지합니다. 기본 핸들러는 다른 경로를 거부하지만, Java 로컬 데모 쓰기 대체 방법은 이를 보장할 수 없습니다. |
| 필터가 작동하지 않음 | 생성된 문서에는 카드를 필터링하고 실시간 결과 개수를 업데이트하는 내장 JavaScript가 포함되어야 합니다. 에이전트가 필수 요소를 누락했다면 한 번 다시 실행합니다. |
| 보고서가 스타일 없이 로드됨 | CSS와 JavaScript는 단일 HTML 파일에 포함합니다. 프롬프트는 의도적으로 외부 자산과 라이브러리를 허용하지 않습니다. |

</details>

> **다음을 충족하면 이 단계가 완료됩니다.** `accessibility-report.html`이 로컬에서 열리고
> 근거가 뒷받침된 발견 사항을 필터링합니다. 기본 정확 일치 핸들러를 사용하면 세션에서 다른
> 파일 경로를 승인하지 않습니다. Java 로컬 데모 쓰기 대체 방법은 의도적으로 이를 보장할 수 없습니다.

## 이해도 확인

이름이 지정된 기본 제공 쓰기 도구 두 개만 허용하는 것이 파일 시스템 액세스를 광범위하게 승인하는 것보다 안전한 이유는 무엇입니까?

<details>
<summary>정답 확인</summary>

`builtin:apply_patch`와 `builtin:create`는 필요한 파일 쓰기 기능만 제공합니다.
기본 권한 콜백은 두 기능을 정규화된 출력 경로 하나에 바인딩합니다.
모델은 셸 명령을 사용하거나 다른 파일에 쓸 수 없으며,
기존 로컬 도구와 범위가 지정된 Playwright 탐색은 변경되지 않습니다.
Java 로컬 데모 대체 방법은 SDK가 권한 페이로드 필드를 생략하는 동안 사용하는 명시적 예외이므로,
통제된 로컬 대상으로만 제한해야 합니다.

</details>

## 자세히 알아보기

- [도구 사용 전 훅](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md):
  도구 호출이 실행되기 전에 프롬프트가 아닌 코드에서 승인, 거부 또는 재작성합니다.
- [훅 참조](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md):
  SDK에서 제공하는 모든 훅과 각 훅이 받는 입력을 설명합니다.
- [로컬 CLI 설정](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md):
  SDK가 시작할 CLI를 제어하며, 이에 따라 작성된 파일이 저장되는 위치가 결정됩니다.

축하와 계속 빌드하는 데 도움이 되는 리소스를 확인하려면 [10단계: 완료했습니다!](10-complete.md)로 이동합니다.
