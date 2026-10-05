# 4단계: 외부 도구를 안전하게 연결하기

> **소요 시간:** 20분

## 연결할 내용

Playwright를 MCP를 통해 시작하고, 제공한 워크숍 대상만 탐색하도록 제한하고,
접근성 트리를 검사한 뒤 페이지 제목을 보고합니다.

## MCP와 신뢰 경계 알아보기

[**Model Context Protocol (MCP)**](https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md)는
애플리케이션 외부에서 구현된 재사용 가능한 기능을 에이전트에 연결하는 표준 방식입니다.
이 워크숍에서는 SDK가 Playwright MCP 서버를 별도의 `npx` 프로세스로 시작합니다.
Playwright는 브라우저 자동화를 처리하고, 연결 구성은 애플리케이션이 담당합니다.

이 프로세스 경계는 **신뢰 경계**이기도 합니다.
[permission handler](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)는
요청된 작업이 실행되기 전에 런타임이 호출하는 콜백이며, 각 외부 작업을 진행시킬지 결정합니다.

| 항목 | 로컬 WCAG 도구 | Playwright MCP |
|---|---|---|
| 구현 주체 | 이 애플리케이션 | 외부 Playwright 패키지 |
| 실행 위치 | 동일한 애플리케이션 프로세스 | 별도의 Node.js 프로세스 |
| 적합한 용도 | 애플리케이션 소유 데이터와 결정론적 로직 | 재사용 가능한 브라우저 기능 |
| 신뢰 처리 방식 | 읽기 전용 도구는 권한 검사를 건너뜀 | 도구 목록과 사용자 지정 handler가 접근을 제한함 |

WCAG 조회와 범위가 좁은 snapshot reader는 프로세스 내부에 유지됩니다.
`CopilotSession -> Playwright MCP -> browser`는 프로세스 경계를 가로지릅니다.

## Playwright에 가드레일 적용하기

브라우저 인수는 워크숍 기본값인 Microsoft Edge를 사용합니다. 대신 Google Chrome을 준비했다면
`--browser=chrome`을 사용합니다.

세션 도구 allowlist는 관련 없는 런타임 도구를 제외합니다. MCP 서버의 도구 목록은 탐색만 노출합니다.
Playwright MCP 0.0.78에서는 탐색 시 자동 접근성 트리를 `.playwright-mcp/`에 기록합니다.
애플리케이션의 snapshot reader는 인수를 받지 않으며, 세션이 시작된 뒤 생성된 최신 Playwright
snapshot만 읽습니다.

`browser_snapshot`은 선택적 `filename` 인수로 파일을 쓸 수 있으므로 두 allowlist 모두에 포함하지 않습니다.
런타임은 read-only로 표시된 MCP 도구를 permission delegate를 호출하지 않고 자동 허용할 수 있으므로,
handler만으로는 해당 인수를 안정적으로 정제할 수 없습니다. 프롬프트에 의존하는 대신 도구를 제거해
해당 기능 자체를 닫습니다.

reader는 경로를 받지 않습니다. 기존 파일, 중첩 파일, symbolic link, 빈 파일, 1MB보다 큰 snapshot은
무시합니다. 탐색은 시작 시 제공한 대상과 전체 canonical URL이 일치할 때만 승인됩니다. scheme과 host는
URL 표준에 따라 대소문자를 구분하지 않고 비교합니다. path, query, fragment는 대소문자를 구분해
일치해야 합니다.

handler는 요청마다 정확히 하나의 결정을 반환하며, 여기서는 사용 가능한 종류 중 두 가지만 필요합니다.
`approve-once`는 현재 요청 한 번만 허용합니다. `reject`는 요청을 거부하고 모델에 feedback 메시지를
전달할 수 있으므로, 호출이 거부되더라도 조용히 실패하지 않고 이유가 함께 돌아옵니다.
이 워크숍에서는 사용하지 않지만 두 가지 종류가 더 있습니다. `user-not-available`은 확인해 줄 사용자가
없기 때문에 거부하고, `no-result`는 아예 응답하지 않아 대신 다른 연결된 클라이언트가 요청에 답할 수
있도록 합니다. `approve-for-session`, `approve-for-location`, `approve-permanently`처럼 더 넓은 승인 범위는
이번 한 번의 호출을 넘어 결정을 기억합니다. 각 SDK는 이 이름들을 자체 명명 규칙에 맞게 표기합니다.

:::language dotnet
## C#에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`Program.cs`의 맨 위에서 `using` 문 다음이자 배너 앞에 다음 코드를 삽입합니다.

```csharp
if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}
```

### 2. 미리 준비된 permission handler 살펴보기

`Helpers/WorkshopPermissionHandler.cs`를 엽니다. 미리 준비된 handler는 정확한 대상에 대한
탐색에만 일회성 승인을 반환합니다. 그 밖의 모든 외부 요청은 거부됩니다.

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows Playwright to navigate only to the exact requested target.")
        };

        return Task.FromResult(decision);
    };
}
```

현재 .NET SDK는 MCP 권한 도구 이름 앞에 서버 이름을 붙입니다(예: `playwright-browser_navigate`).
반면 MCP 구성에서는 `browser_navigate`를 사용합니다. `IsPlaywrightTool`은 광범위한 와일드카드 대신
이 두 가지 정확한 형식만 허용합니다.

> **SDK 참고:** 버전 1.0.7에는 `PermissionHandler.ApproveAll`이 포함되어 있지만, 기본 제공되는
> 범위 지정 handler는 없습니다. 그래서 스타터에는 직접 작성한 delegate가 포함되어 있습니다.
> 현재 `PermissionDecision`은 evaluation-only로 표시되어 있으므로, 해당 helper 하나에 국소적으로
> `GHCP001` 억제가 포함되어 있습니다.

### 3. 미리 준비된 snapshot-reader 경계 살펴보기

`Helpers/PlaywrightSnapshotReader.cs`를 엽니다. 이 reader는 도구가 생성될 때 기존 snapshot을 캡처하고,
모델이 제공한 인수는 받지 않으며, `page-*.yml`이라는 이름의 새 직접 자식만 선택하고,
symbolic link와 과도하게 큰 파일은 거부한 다음 텍스트를 반환합니다.

```csharp
public static AIFunction CreateTool(string workingDirectory)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(workingDirectory);

    var outputDirectory = Path.GetFullPath(Path.Combine(workingDirectory, ".playwright-mcp"));
    var existingSnapshots = Directory.Exists(outputDirectory)
        ? Directory.EnumerateFiles(outputDirectory, "page-*.yml", SearchOption.TopDirectoryOnly)
            .Select(Path.GetFullPath)
            .ToHashSet(PathComparer)
        : new HashSet<string>(PathComparer);

    return CopilotTool.DefineTool(
        () => Task.FromResult(ReadLatestSnapshot(outputDirectory, existingSnapshots)),
        toolOptions: new CopilotToolOptions { SkipPermission = true },
        factoryOptions: new AIFunctionFactoryOptions
        {
            Name = "read_latest_accessibility_snapshot",
            Description = "Reads the newest Playwright accessibility snapshot created during this run."
        });
}
```

이 adapter는 읽기 전용이고, 애플리케이션이 선택한 저장소를 사용하며, 애플리케이션 자체가 구현하므로
권한 검사를 건너뜁니다. 이는 일반적인 파일 reader보다 더 좁은 기능 범위입니다.

### 4. Playwright MCP와 범위 지정 권한 추가하기

세션 구성을 다음 코드로 바꿉니다.

```csharp
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
```

### 5. 브라우저 증거 요청하기

마지막 send 호출을 다음 코드로 바꿉니다.

```csharp
Console.WriteLine($"\nInspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and report the page title
    plus one sentence describing its main content.
    """);
```

## 실행

```bash
dotnet run -- "{{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다.

다음과 같은 출력이 나타나는지 확인합니다.

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True

Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 위의 정확한 대상 URL을 사용합니다. handler는 다른 URL과 도구를 의도적으로 거부합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| 컴파일러가 permission helper를 찾지 못함 | `using HelloCopilotSDK.Helpers;`가 포함되어 있고 helper 파일이 프로젝트에 있는지 확인합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}

Console.WriteLine("=== Scoped Playwright MCP access ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

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

Console.WriteLine($"Inspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and return the page title
    plus one sentence describing its main content.
    """);
```

</details>
:::

:::language nodejs
## TypeScript에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`src/index.ts`의 맨 위에서 진입점 설정을 다음 코드로 바꿉니다.

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import {
  accessibilityRuleLookup,
  createSnapshotReader,
  permissionForTarget,
  streamResponse,
} from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("Enter an absolute HTTP or HTTPS URL.");
}
```

### 2. 미리 준비된 permission handler 살펴보기

`src/workshop.ts`를 엽니다. 미리 준비된 handler는 정확한 대상에 대한 Playwright 탐색만 승인합니다.

```typescript
export function permissionForTarget(target: URL): PermissionHandler {
  return (request) => {
    if (
      request.kind === "mcp" &&
      request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" ||
        request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" &&
      sameUrl(request.args.url, target)
    ) {
      return { kind: "approve-once" };
    }
    return {
      kind: "reject",
      feedback:
        "This workshop allows Playwright to navigate only to the exact requested target.",
    };
  };
}

function sameUrl(requested: string, allowed: URL): boolean {
  try {
    const parsed = new URL(requested);
    return (
      parsed.protocol.toLowerCase() === allowed.protocol.toLowerCase() &&
      parsed.hostname.toLowerCase() === allowed.hostname.toLowerCase() &&
      parsed.port === allowed.port &&
      parsed.username === allowed.username &&
      parsed.password === allowed.password &&
      parsed.pathname === allowed.pathname &&
      parsed.search === allowed.search &&
      parsed.hash === allowed.hash
    );
  } catch {
    return false;
  }
}
```

런타임이 권한 요청에서 서버 이름에 접두사를 붙일 수 있으므로 `browser_navigate`와
`playwright-browser_navigate`를 모두 허용합니다.

### 3. 미리 준비된 snapshot-reader 경계 살펴보기

계속해서 `src/workshop.ts`에서 snapshot reader가 생성 시점의 기존 파일을 캡처하고,
모델이 제공한 경로는 받지 않는다는 점을 확인합니다.

```typescript
export function createSnapshotReader(workingDirectory: string) {
  const outputDirectory = resolve(workingDirectory, ".playwright-mcp");
  const existingSnapshots = safeSnapshotNames(outputDirectory).then(
    (names) => new Set(names.map((name) => resolve(outputDirectory, name))),
  );
  return defineTool("read_latest_accessibility_snapshot", {
    description:
      "Reads the newest Playwright accessibility snapshot created during this run.",
    parameters: z.object({}),
    skipPermission: true,
    handler: async () => {
      const baseline = await existingSnapshots;
      const candidates = await Promise.all(
        (await safeSnapshotNames(outputDirectory)).map(async (name) => {
          const path = resolve(outputDirectory, name);
          const details = await lstat(path);
          return { path, details };
        }),
      );
      const snapshot = candidates
        .filter(
          ({ path, details }) =>
            !baseline.has(path) &&
            !details.isSymbolicLink() &&
            details.isFile() &&
            details.size > 0 &&
            details.size <= maxSnapshotBytes,
        )
        .sort((left, right) => right.details.mtimeMs - left.details.mtimeMs)[0];
      if (!snapshot) {
        throw new Error(
          "No current-run Playwright snapshot is available. Call browser_navigate first.",
        );
      }
      return readFile(snapshot.path, "utf8");
    },
  });
}
```

### 4. Playwright MCP와 범위 지정 권한 추가하기

`src/index.ts`에서 세 개 도구의 allowlist와 Playwright MCP를 사용해 세션을 생성합니다.

```typescript
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
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
    await streamResponse(
      session,
      `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`,
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`availableTools`는 런타임이 붙인 MCP 이름인 `playwright-browser_navigate`를 사용하지만,
MCP 서버 구성에는 여전히 접두사 없는 `browser_navigate`를 나열합니다.

## 실행

```bash
npm start -- "{{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다.

다음과 같은 출력이 나타나는지 확인합니다.

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true

Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 위의 정확한 대상 URL을 사용합니다. handler는 다른 URL과 도구를 의도적으로 거부합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| TypeScript가 helper를 확인하지 못함 | import 경로가 `.js`로 끝나는지 확인하고 스타터 디렉터리에서 `npm install`을 실행합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try {
    await streamResponse(session, `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

</details>
:::

:::language python
## Python에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`main.py`의 맨 위에서 시작 URL을 검증합니다.

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
)

from workshop import (
    accessibility_rule_lookup,
    create_snapshot_reader,
    permission_for_target,
)


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
```

### 2. 미리 준비된 permission handler 살펴보기

`workshop.py`를 엽니다. 미리 준비된 handler는 정확한 대상에 대한 Playwright 탐색만 승인합니다.

```python
def permission_for_target(target: str):
    def handler(request, _invocation):
        if (
            getattr(request, "kind", None) == "mcp"
            and request.server_name == "playwright"
            and request.tool_name
            in {"browser_navigate", "playwright-browser_navigate"}
            and isinstance(request.args, dict)
            and isinstance(request.args.get("url"), str)
            and _same_url(request.args["url"], target)
        ):
            return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback=(
                "This workshop allows Playwright to navigate only to the exact requested target."
            )
        )

    return handler


def _same_url(requested: str, allowed: str) -> bool:
    try:
        left, right = urlsplit(requested), urlsplit(allowed)
        return (
            left.scheme.lower(),
            left.hostname.lower() if left.hostname else "",
            left.port,
            left.username,
            left.password,
            left.path,
            left.query,
            left.fragment,
        ) == (
            right.scheme.lower(),
            right.hostname.lower() if right.hostname else "",
            right.port,
            right.username,
            right.password,
            right.path,
            right.query,
            right.fragment,
        )
    except ValueError:
        return False
```

### 3. 미리 준비된 snapshot-reader 경계 살펴보기

계속해서 `workshop.py`에서 snapshot reader가 생성 시점의 기존 파일을 캡처하고,
모델이 제공한 경로는 받지 않는다는 점을 확인합니다.

```python
def create_snapshot_reader(working_directory: str):
    output_directory = Path(working_directory, ".playwright-mcp").resolve()
    existing = (
        {path.resolve() for path in output_directory.glob("page-*.yml")}
        if output_directory.is_dir()
        else set()
    )

    @define_tool(
        name="read_latest_accessibility_snapshot",
        description=(
            "Reads the newest Playwright accessibility snapshot created during this run."
        ),
        skip_permission=True,
    )
    def read_latest_accessibility_snapshot() -> str:
        candidates = [
            path
            for path in output_directory.glob("page-*.yml")
            if path.resolve() not in existing
            and not path.is_symlink()
            and path.is_file()
            and 0 < path.stat().st_size <= MAX_SNAPSHOT_BYTES
        ]
        if not candidates:
            raise FileNotFoundError(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
            )
        return max(candidates, key=lambda path: path.stat().st_mtime).read_text(
            encoding="utf-8"
        )

    return read_latest_accessibility_snapshot
```

### 4. Playwright MCP와 범위 지정 권한 추가하기

`main.py`의 세션 생성 블록을 다음 코드로 바꿉니다.

```python
    async with CopilotClient() as client:
        async with await client.create_session(
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
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(
                f"Use browser_navigate to open {target}, then "
                "read_latest_accessibility_snapshot and report the page title."
            )
            await done.wait()
            if error is not None:
                raise error
```

`available_tools`는 런타임이 붙인 MCP 이름인 `playwright-browser_navigate`를 사용하지만,
MCP 서버 구성에는 여전히 접두사 없는 `browser_navigate`를 나열합니다.

## 실행

```bash
python main.py "{{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다.

탐색과 snapshot 활동이 나타난 뒤, 다음과 같은 페이지 제목을 확인합니다.

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 위의 정확한 대상 URL을 사용합니다. handler는 다른 URL과 도구를 의도적으로 거부합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| workshop helper import 오류가 발생함 | 사전 점검에서 만든 가상 환경을 활성화하고 `workshop.py`가 `main.py` 옆에 있는지 확인합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

`main.py`:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
            mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}},
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
            await session.send(f"Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Go에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`main.go`의 `main` 시작 부분에서 시작 URL을 검증합니다.

```go
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
```

### 2. permission handler 추가하기

`main` 앞에 정확한 URL 일치 검사와 permission handler를 추가합니다.

```go
func sameURL(requested, allowed string) bool {
	left, leftErr := url.Parse(requested)
	right, rightErr := url.Parse(allowed)
	userInfo := func(value *url.Userinfo) string {
		if value == nil {
			return ""
		}
		return value.String()
	}
	return leftErr == nil && rightErr == nil &&
		strings.EqualFold(left.Scheme, right.Scheme) &&
		strings.EqualFold(left.Hostname(), right.Hostname()) &&
		left.Port() == right.Port() &&
		userInfo(left.User) == userInfo(right.User) &&
		left.EscapedPath() == right.EscapedPath() &&
		left.RawQuery == right.RawQuery &&
		left.Fragment == right.Fragment
}

func permissionForTarget(target string) copilot.PermissionHandlerFunc {
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
		feedback := "This workshop allows Playwright to navigate only to the exact requested target."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

권한 경로에서는 접두사가 없는 Playwright 도구 이름과 접두사가 붙은 도구 이름을 모두 허용합니다.

### 3. snapshot-reader 경계 추가하기

계속해서 `main` 앞에 인수를 받지 않는 snapshot reader를 추가합니다.

```go
const maxSnapshotBytes = 1_000_000

func snapshotReader(workingDirectory string) func(struct{}, copilot.ToolInvocation) (string, error) {
	outputDirectory := filepath.Join(workingDirectory, ".playwright-mcp")
	existing := map[string]struct{}{}
	if entries, err := os.ReadDir(outputDirectory); err == nil {
		for _, entry := range entries {
			if strings.HasPrefix(entry.Name(), "page-") && strings.HasSuffix(entry.Name(), ".yml") {
				existing[filepath.Join(outputDirectory, entry.Name())] = struct{}{}
			}
		}
	}

	return func(_ struct{}, _ copilot.ToolInvocation) (string, error) {
		entries, err := os.ReadDir(outputDirectory)
		if err != nil {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		type candidate struct {
			path string
			mod  time.Time
		}
		var candidates []candidate
		for _, entry := range entries {
			path := filepath.Join(outputDirectory, entry.Name())
			info, err := entry.Info()
			if _, existed := existing[path]; existed || err != nil || entry.IsDir() ||
				entry.Type()&os.ModeSymlink != 0 || !info.Mode().IsRegular() ||
				info.Size() == 0 || info.Size() > maxSnapshotBytes ||
				!strings.HasPrefix(entry.Name(), "page-") || !strings.HasSuffix(entry.Name(), ".yml") {
				continue
			}
			candidates = append(candidates, candidate{path, info.ModTime()})
		}
		if len(candidates) == 0 {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		sort.Slice(candidates, func(i, j int) bool { return candidates[i].mod.Before(candidates[j].mod) })
		contents, err := os.ReadFile(candidates[len(candidates)-1].path)
		return string(contents), err
	}
}
```

### 4. Playwright MCP와 범위 지정 권한 추가하기

`main`에서 두 개의 로컬 도구를 정의하고 세션 구성을 다음 코드로 바꿉니다.

```go
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
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

새 helper에 필요한 import인 `encoding/json`, `net/url`, `path/filepath`, `sort`,
`time`, 그리고 `"github.com/github/copilot-sdk/go/rpc"`를 추가합니다.

## 실행

```bash
go run . "{{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다.

다음과 같은 페이지 제목을 확인합니다.

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 위의 정확한 대상 URL을 사용합니다. handler는 다른 URL과 도구를 의도적으로 거부합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| import가 누락됨 | `encoding/json`, `net/url`, `path/filepath`, `sort`, `time`, 그리고 `rpc` 패키지를 추가합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

`main.go` 세션 구성:

```go
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
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

</details>
:::

:::language rust
## Rust에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`src/main.rs`의 `main` 시작 부분에서 시작 URL을 검증합니다.

```rust
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
```

### 2. permission handler 추가하기

`main` 앞에 정확한 대상용 permission handler를 추가합니다.

```rust
struct ScopedPermissions {
    target: Url,
}

fn permission_payload(
    extra: &serde_json::Value,
) -> Option<&serde_json::Map<String, serde_json::Value>> {
    match extra.get("permissionRequest") {
        Some(request) => request.as_object(),
        None => extra.as_object(),
    }
}

#[async_trait]
impl PermissionHandler for ScopedPermissions {
    async fn handle(
        &self,
        _session_id: SessionId,
        _request_id: RequestId,
        request: PermissionRequestData,
    ) -> PermissionResult {
        let payload = permission_payload(&request.extra);
        let server = payload
            .and_then(|payload| payload.get("serverName"))
            .and_then(serde_json::Value::as_str);
        let tool = payload
            .and_then(|payload| payload.get("toolName"))
            .and_then(serde_json::Value::as_str);
        let requested = payload
            .and_then(|payload| payload.get("args"))
            .and_then(|args| args.get("url"))
            .and_then(serde_json::Value::as_str)
            .and_then(|value| Url::parse(value).ok());
        if server == Some("playwright")
            && matches!(
                tool,
                Some("browser_navigate" | "playwright-browser_navigate")
            )
            && requested
                .as_ref()
                .is_some_and(|url| same_url(url, &self.target))
        {
            PermissionResult::approve_once()
        } else {
            PermissionResult::reject(Some(
                "This workshop allows Playwright to navigate only to the exact requested target."
                    .to_owned(),
            ))
        }
    }
}

fn same_url(left: &Url, right: &Url) -> bool {
    left.scheme().eq_ignore_ascii_case(right.scheme())
        && left
            .host_str()
            .unwrap_or_default()
            .eq_ignore_ascii_case(right.host_str().unwrap_or_default())
        && left.port() == right.port()
        && left.username() == right.username()
        && left.password() == right.password()
        && left.path() == right.path()
        && left.query() == right.query()
        && left.fragment() == right.fragment()
}
```

### 3. snapshot-reader 경계 추가하기

`main` 앞에 인수를 받지 않는 snapshot reader를 추가합니다.

```rust
const MAX_SNAPSHOT_BYTES: u64 = 1_000_000;

struct SnapshotReader {
    output_directory: PathBuf,
    existing: HashSet<PathBuf>,
}

impl SnapshotReader {
    fn new(working_directory: &Path) -> Self {
        let output_directory = working_directory.join(".playwright-mcp");
        let existing = std::fs::read_dir(&output_directory)
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let name = entry.file_name();
                let name = name.to_string_lossy();
                (name.starts_with("page-") && name.ends_with(".yml")).then(|| entry.path())
            })
            .collect();
        Self {
            output_directory,
            existing,
        }
    }
}

#[async_trait]
impl ToolHandler for SnapshotReader {
    async fn call(&self, _invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let entries =
            match std::fs::read_dir(&self.output_directory) {
                Ok(entries) => entries,
                Err(_) => return Ok(ToolResult::Text(
                    "No current-run Playwright snapshot is available. Call browser_navigate first."
                        .to_owned(),
                )),
            };
        let newest = entries
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                let name = entry.file_name();
                let name = name.to_string_lossy();
                let metadata = std::fs::symlink_metadata(&path).ok()?;
                (!self.existing.contains(&path)
                    && name.starts_with("page-")
                    && name.ends_with(".yml")
                    && !metadata.file_type().is_symlink()
                    && metadata.is_file()
                    && metadata.len() > 0
                    && metadata.len() <= MAX_SNAPSHOT_BYTES)
                    .then_some((metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH), path))
            })
            .max_by_key(|(modified, _)| *modified);
        let Some((_, path)) = newest else {
            return Ok(ToolResult::Text(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
                    .to_owned(),
            ));
        };
        match std::fs::read_to_string(path) {
            Ok(contents) => Ok(ToolResult::Text(contents)),
            Err(_) => Ok(ToolResult::Text(
                "The current-run Playwright snapshot could not be read.".to_owned(),
            )),
        }
    }
}
```

### 4. Playwright MCP와 범위 지정 권한 추가하기

`main`에서 두 개의 로컬 도구를 정의하고, MCP를 구성한 뒤, permission handler를 설치합니다.

```rust
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
stream_response!(
    session,
    format!(
        "Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title."
    )
);
session.disconnect().await?;
client.stop().await?;
```

새 helper에 필요한 import로
`github_copilot_sdk::handler::{PermissionHandler, PermissionResult}`,
`McpServerConfig`, `McpStdioServerConfig`, `PermissionRequestData`, `PermissionRequestKind`,
`RequestId`, `SessionId`, `indexmap::IndexMap`, `url::Url`를 추가합니다.

## 실행

```bash
cargo run -- "{{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다.

다음과 같은 페이지 제목을 확인합니다.

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 위의 정확한 대상 URL을 사용합니다. handler는 다른 URL과 도구를 의도적으로 거부합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| trait 또는 type을 확인할 수 없음 | 위에 나온 permission, MCP, `IndexMap`, `Url` import를 그대로 유지합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

`src/main.rs`의 세션 구성:

```rust
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
stream_response!(session, mcp_safety_prompt(&target));
```

</details>
:::

:::language java
## Java에서 범위가 지정된 Playwright 액세스 연결하기

### 1. 하나의 제어된 대상만 허용하기

`src/main/java/workshop/AccessibilityReport.java`의 `main` 시작 부분에서 시작 URL을 검증합니다.

```java
RunOptions options = parseRunOptions(args);
URI target = options.target();
Path workingDirectory = Path.of("").toAbsolutePath().normalize();
if (options.allowLocalDemoMcp()) {
    System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
            + "so this run approves only the mcp permission kind, not an exact target. "
            + "Use only with the controlled workshop target.");
}
```

파서 helper를 추가합니다.

```java
private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme())
                    || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}
```

### 2. permission handler 추가하기

세션 구성에서 정확한 대상에 대한 Playwright 탐색만 승인합니다.

```java
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    // SDK 문제 #2273으로 인해 현재는 정확한 검사에 필요한 MCP 요청 필드를 확인할 수 없습니다.
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows Playwright to navigate only to the exact requested target. "
                            + "MCP requests without target data remain denied unless the explicit "
                            + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
})
```

> **임시 Java SDK 제한과 local-demo fallback:** 기본 동작은 fail-closed입니다. 즉,
> 구성된 Playwright 탐색이 정확히 입력한 URL임을 payload로 증명하는 `mcp` 요청만 승인합니다.
> 현재 Java SDK 릴리스는 이러한 MCP 요청 필드를 노출하지 않으므로
> ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)), 기본 경로는
> 추측하지 않고 해당 요청을 거부합니다. 제어된 워크숍 대상에서만 `--allow-local-demo-mcp`를
> 전달합니다. 이 명시적 플래그는 한 번에 하나의 `mcp` 요청만 승인하며, **`APPROVE_ALL`을 사용하지
> 않습니다.** 또한 MCP 구성은 여전히 Playwright `browser_navigate`만 노출합니다. SDK payload를
> 사용할 수 없는 동안에는 정확한 URL을 강제할 수 없습니다. 프로덕션, 공유 대상, 신뢰할 수 없는
> 대상에서는 절대 이 옵션을 활성화하지 않습니다.

이 옵션 파서를 `parseTarget` 옆에 추가합니다.

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

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

URL 일치 helper를 추가합니다.

```java
private static boolean isExactNavigation(Map<String, Object> request, URI target) {
    if (request == null
            || !"playwright".equals(request.get("serverName"))
            || !(request.get("toolName") instanceof String toolName)
            || !("browser_navigate".equals(toolName)
                    || "playwright-browser_navigate".equals(toolName))
            || !(request.get("args") instanceof Map<?, ?> args)
            || !(args.get("url") instanceof String requested)) {
        return false;
    }
    try {
        return sameUrl(new URI(requested), target);
    } catch (URISyntaxException ignored) {
        return false;
    }
}

private static boolean sameUrl(URI requested, URI allowed) {
    return equalsIgnoreCase(requested.getScheme(), allowed.getScheme())
            && equalsIgnoreCase(requested.getHost(), allowed.getHost())
            && requested.getPort() == allowed.getPort()
            && java.util.Objects.equals(requested.getRawUserInfo(), allowed.getRawUserInfo())
            && java.util.Objects.equals(requested.getRawPath(), allowed.getRawPath())
            && java.util.Objects.equals(requested.getRawQuery(), allowed.getRawQuery())
            && java.util.Objects.equals(requested.getRawFragment(), allowed.getRawFragment());
}

private static boolean equalsIgnoreCase(String left, String right) {
    return left == null ? right == null : right != null && left.equalsIgnoreCase(right);
}
```

### 3. snapshot-reader 경계 추가하기

현재 실행에서 생성된 Playwright 파일만 반환하는, 인수를 받지 않는 snapshot reader를 등록합니다.

```java
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);
```

중첩 reader 클래스를 추가합니다.

```java
private static final class SnapshotReader {
    private final Path outputDirectory;
    private final Set<Path> existing;

    private SnapshotReader(Path workingDirectory) throws IOException {
        outputDirectory = workingDirectory.resolve(".playwright-mcp").normalize();
        existing = new HashSet<>();
        if (Files.isDirectory(outputDirectory, LinkOption.NOFOLLOW_LINKS)) {
            try (Stream<Path> paths = Files.list(outputDirectory)) {
                paths.filter(SnapshotReader::isSnapshotName).forEach(existing::add);
            }
        }
    }

    private String read() {
        try (Stream<Path> paths = Files.list(outputDirectory)) {
            Path newest = paths
                    .filter(path -> !existing.contains(path))
                    .filter(SnapshotReader::isSnapshotName)
                    .filter(path -> !Files.isSymbolicLink(path))
                    .filter(SnapshotReader::isSafeSnapshot)
                    .max(Comparator.comparing(this::modifiedTime))
                    .orElseThrow(() -> new IllegalStateException(
                            "No current-run Playwright snapshot is available. Call browser_navigate first."));
            return Files.readString(newest, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No current-run Playwright snapshot is available. Call browser_navigate first.",
                    exception);
        }
    }

    private static boolean isSnapshotName(Path path) {
        String name = path.getFileName().toString();
        return name.startsWith("page-") && name.endsWith(".yml");
    }

    private static boolean isSafeSnapshot(Path path) {
        try {
            BasicFileAttributes attributes = Files.readAttributes(
                    path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
            return attributes.isRegularFile()
                    && !attributes.isSymbolicLink()
                    && attributes.size() > 0
                    && attributes.size() <= MAX_SNAPSHOT_BYTES;
        } catch (IOException exception) {
            return false;
        }
    }

    private java.nio.file.attribute.FileTime modifiedTime(Path path) {
        try {
            return Files.getLastModifiedTime(path, LinkOption.NOFOLLOW_LINKS);
        } catch (IOException exception) {
            return java.nio.file.attribute.FileTime.fromMillis(0);
        }
    }
}
```

### 4. Playwright MCP와 범위 지정 권한 추가하기

전체 세션 구성을 만들고 브라우저 증거 프롬프트를 전송합니다.

```java
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
    var response = session.sendAndWait(new MessageOptions().setPrompt(
            """
            Open %s with browser_navigate.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Return the observed page title only.

            The permission handler must approve only this exact Playwright navigation target."""
                    .formatted(target))).get();
    if (response == null) {
        throw new IllegalStateException("Copilot completed without an assistant message.");
    }
    System.out.println(response.getData().content());
}
```

MCP와 permission import를 추가합니다.

```java
import com.github.copilot.rpc.McpStdioServerConfig;
import com.github.copilot.rpc.PermissionRequestResult;
```

## 실행

```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

처음 실행할 때는 `npx`가 Playwright를 시작하므로 더 오래 걸릴 수 있습니다. 이 명령은 위에서 설명한
임시 local-demo fallback을 의도적으로 활성화합니다. 엄격한 fail-closed 정책을 유지하려면 이 플래그를
생략합니다.

다음과 같은 페이지 제목을 확인합니다.

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>이 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `npx`를 시작할 수 없음 | 사전 점검용 MCP 명령을 다시 실행하고 Node.js가 `PATH`에 있는지 확인합니다. |
| Playwright가 브라우저를 찾지 못함 | Edge 또는 Chrome을 설치하거나, Playwright MCP 설명에 따라 설치된 브라우저를 구성합니다. |
| 권한 요청이 거부됨 | 기본 handler는 요청 payload가 없거나 정확하지 않으면 의도적으로 거부합니다. SDK가 대상을 제공하는 경우에는 정확한 대상을 사용하고, 이 제어된 대상에서만 [#2273](https://github.com/github/copilot-sdk/issues/2273)가 수정될 때까지 `--allow-local-demo-mcp`를 추가합니다. |
| 현재 실행의 snapshot을 사용할 수 없음 | 프롬프트 순서를 유지합니다. `browser_navigate`를 먼저 호출한 뒤 `read_latest_accessibility_snapshot`을 호출합니다. |
| MCP 또는 permission type을 확인할 수 없음 | `McpStdioServerConfig`와 `PermissionRequestResult` import를 추가합니다. |

</details>

<details>
<summary>4단계 전체 구현</summary>

작업한 내용을 이 전체 4단계 구현과 비교합니다.

`AccessibilityReport.java`의 세션 구성:

```java
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
```

</details>
:::

> **도구를 결합할 준비가 되었는지 확인하는 기준:** 터미널에 이름이 지정된 Playwright 도구 활동이 표시되고
> 대상 페이지 제목이 출력됩니다.

## 이해도 확인

여기서는 왜 Playwright를 또 다른 애플리케이션 소유 callback이 아니라 MCP 서버로 사용하나요?

<details>
<summary>정답 확인</summary>

Playwright는 자체 종속성과 함께 별도 프로세스에서 재사용 가능한 브라우저 자동화를 제공합니다.
MCP는 브라우저 로직을 애플리케이션의 도메인 코드로 옮기지 않고 이를 연결해 주며,
권한은 그 프로세스 경계를 보호합니다.

</details>

## 자세히 알아보기

- [Model Context Protocol](https://modelcontextprotocol.io/): Playwright 서버가 구현하는 개방형 표준이며,
  도구 이름의 어휘도 여기에서 가져옵니다.
- [MCP debugging](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/mcp-debugging.md):
  시작되지 않거나 예상과 다른 도구를 노출하는 서버를 진단합니다.
- [Hook error handling](https://github.com/github/copilot-sdk/blob/main/docs/hooks/error-handling.md):
  도구 호출이나 handler가 실패했을 때 세션이 어떻게 동작할지 결정합니다.
- [Plugin directories](https://github.com/github/copilot-sdk/blob/main/docs/features/plugin-directories.md):
  MCP 서버, skill, hook을 하나의 단위로 세션에 로드할 수 있도록 함께 묶습니다.

[5단계: 로컬 도구와 MCP 도구 결합하기](05-combine-tools.md)로 계속 진행합니다.
