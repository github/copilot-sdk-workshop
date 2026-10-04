# 4단계: 승인된 사실에 근거 두기

> **소요 시간:** 15분

## 빌드할 내용

지금까지 큐레이터는 모델의 기억에 의존해 글을 작성해 왔습니다. 이는 박물관에서는 받아들일 수
없습니다. 전시 설명문은 기관의 공식 주장인데, "모델이 알고 있었다"는 것은 출처가 아니기
때문입니다.

이 단계에서는 교육 담당자가 사실을 제공하고, **애플리케이션**이 자신이 소유한 도구를 통해 그
사실을 큐레이터에게 전달합니다. 미리 빌드된 `approved_fact_lookup` 도구를 등록하고, 모델이 호출할
수 있는 유일한 도구로 설정한 뒤, 한 글자라도 쓰기 전에 먼저 그 도구를 호출하라고 지시하는
프롬프트를 작성합니다. 또한 교육 담당자가 승인된 세 가지 사실 세트 중 하나를 고르거나 직접
입력하도록 하고, 이후 단계에서도 재사용할 수 있도록 세션 수명 주기를 작은 러너 하나에 담습니다.

## 사실을 프롬프트 안이 아니라 도구 뒤에 두어야 하는 이유

사실 목록을 프롬프트 텍스트에 그대로 붙여 넣을 수도 있습니다. 많은 애플리케이션이 그렇게 합니다.
하지만 그러면 사실은 모델이 느슨하게 읽어도 되는 요청의 또 다른 텍스트 조각에 불과해지고, 모델이
필요로 하는지와 무관하게 모든 실행에 전체 목록이 실리게 됩니다.

[**로컬 도구**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)는
다릅니다. 로컬 도구는 여러분의 프로세스 안에서 실행되고, 무엇을 반환할지는 여러분의 코드가
결정하며, 모델이 그것을 요청한 순간이 대화 기록에 남습니다. `approved_fact_lookup`가 바로 그
도구입니다. 이 도구는 인수를 받지 않고 경계가 적용된 승인 사실 목록을 반환하므로, 같은 사실 세트로
두 번 실행하면 같은 질문을 하고 같은 답을 받게 되어 근거 부여가 결정적으로 유지됩니다.

헬퍼는 이미 도구와 경계를 소유하고 있습니다. `boundFacts`는 각 사실의 앞뒤 공백을 제거하고,
빈 항목을 버리며, 비어 있거나 20개를 초과하거나 500자를 넘는 사실이 하나라도 있으면 전체 배치를
거부합니다. 도구 팩토리는 전달받은 어떤 입력에도 이 경계를 적용하므로, 모델에는 경계 없는 목록이
절대로 전달되지 않습니다. 경계는 예의 차원의 문제가 아닙니다. 경계 없는 사실 목록은 비용, 지연,
공격 표면을 예측할 수 없게 만듭니다.

이 도구에는 `skip permission`이 설정되어 있습니다. 화면에서 교육 담당자가 방금 승인한
애플리케이션 소유 데이터만 읽기 때문입니다. 대신 6단계의 외부 Wikipedia 프로세스에는 권한 경계가
적용됩니다.

이것은 접근성 트랙의 `accessibility_rule_lookup`에 대응하는 박물관 버전입니다. 즉, 인수를 받지
않고 애플리케이션이 소유하며, 모델이 다른 방법으로는 접근할 수 없는 큐레이션된 데이터를 전달하는
로컬 도구 하나입니다.

## 두 개의 목록, 서로 다른 두 가지 역할

도구를 등록하려면 두 가지 설정이 필요하며, 이를 혼동하는 것이 이 워크숍에서 가장 흔한 실수입니다.

- **`tools`**는 *구현*을 담습니다. 여기에서 런타임은 `approved_fact_lookup`라는 함수가 존재하며
  그것을 어떻게 실행할지 알게 됩니다.
- **`availableTools`**는 *허용 목록*입니다. 이 세션에서 모델이 호출하도록 허용된 도구의 이름을
  나열합니다. 등록은 되었지만 허용 목록에 없는 도구는 호출할 수 없습니다.

두 가지가 모두 필요합니다. `approved_fact_lookup`만 지정하는 것은 다른 모든 도구를 함께 제외하는
일이기도 합니다. 이 세션에는 파일 리더, 셸, 브라우저가 제공되지 않습니다.

프롬프트는 세 번째 조각이며, 그중에서도 가장 약합니다. 프롬프트는 모델에게 도구를 호출하라고
*요청*할 뿐입니다. 실제로 호출이 일어나게 만들지도 못하고, 호출을 막지도 못합니다. 그래도 명시적인
"먼저 `approved_fact_lookup`를 호출하라"는 지시는 유지하십시오. 이 단계에서는 도구 호출이 눈에
보이도록 신뢰성 있게 일어나야 하기 때문입니다.

**실행을 경계 안에 유지하십시오:** 헬퍼에 이미 있는 **120초 생성 타임아웃**을 세션 러너에 명시적으로
전달합니다. 러너는 나중에 검증할 전시 텍스트를 반환하고, 빈 출력을 거부하며, 스트림이 실패하더라도
세션과 클라이언트를 정리합니다. 이것은 모델에 대한 지침이 아니라 애플리케이션 제어입니다.

## 도구를 등록하고 프롬프트 작성하기

:::language dotnet
`Program.cs`를 엽니다. 파일 상단은 넓히지 마십시오. 이미 `using MuseumExhibitStudio.Helpers;`가
있습니다. 첫 번째 `Console.WriteLine`부터 파일 끝까지를 다음으로 교체합니다.

```csharp
try
{
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
    Console.WriteLine("Approved fact sets:");
    for (var index = 0; index < CuratorFacts.FactSets.Count; index++)
    {
        Console.WriteLine($"{index + 1}. {CuratorFacts.FactSets[index].Label}");
    }

    Console.WriteLine();

    var selectedFactSet = ReadFactSetSelection();
    var approvedFacts = CuratorFacts.BoundFacts(selectedFactSet.Facts);
    for (var index = 0; index < approvedFacts.Length; index++)
    {
        Console.WriteLine($"{index + 1}. {approvedFacts[index]}");
    }

    Console.WriteLine();

    if (!CuratorTerminal.AskYesNo("Use these facts?", defaultYes: true))
    {
        approvedFacts = CuratorFacts.BoundFacts(CuratorTerminal.ReadFacts());
    }

    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);

    return 0;
}
catch (TimeoutException)
{
    Console.Error.WriteLine("The curator did not respond in time. Try again.");
    return 1;
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Could not generate the exhibit: {exception.Message}");
    return 1;
}
finally
{
    CuratorTerminal.CloseTerminal();
}

static string? SelectedModel()
{
    var model = Environment.GetEnvironmentVariable("COPILOT_MODEL");
    return string.IsNullOrWhiteSpace(model) ? null : model.Trim();
}

SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = SystemMessage
    }
};

static async Task<string> RunSessionAsync(SessionConfig config, string prompt, TimeSpan timeout)
{
    await using var client = new CopilotClient();
    try
    {
        await client.StartAsync();
        await using var session = await client.CreateSessionAsync(config);
        var content = await CuratorStreamer.StreamExhibitAsync(session, prompt, timeout);
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("The curator returned no exhibit content.");
        }

        return content;
    }
    finally
    {
        await client.StopAsync();
    }
}

CuratorFactSet ReadFactSetSelection()
{
    var input = CuratorTerminal.AskLine("Choose a fact set [1-3, default 1]: ");
    if (int.TryParse(input, out var selection) &&
        selection >= 1 &&
        selection <= CuratorFacts.FactSets.Count)
    {
        return CuratorFacts.FactSets[selection - 1];
    }

    return CuratorFacts.FactSets[0];
}

static string BuildExhibitPrompt()
{
    return $"""
        Create visitor-facing exhibit text about this application's approved subject.

        Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
        treat them as the complete source of truth for this exhibit.

        Return exactly this structure:

        # <an engaging exhibit title>
        ## Narrative
        <100-140 words, excluding the title and questions>
        ## Visitor questions
        1. <question>
        2. <question>
        3. <question>

        Write exactly three distinct visitor reflection questions. Do not add a preface,
        conclusion, software discussion, or facts the tool did not return.
        """;
}
```

로컬 함수는 top-level statement 뒤에 옵니다. `RunSessionAsync`는 `Helpers/CuratorStreamer.cs`의
`CuratorStreamer.GenerationTimeout`을 사용하며, `finally`에서 클라이언트를 중지하기 전에 세션을
dispose합니다. 이제 `BuildExhibitPrompt`는 사실을 전혀 받지 않습니다. 대신 도구의 이름을
지정합니다. `CreateApprovedFactLookup`는 내부에서 `BoundFacts`를 호출하므로, 누가 도구를 만들든
같은 경계가 유지됩니다.

**내부 살펴보기:** `Helpers/CuratorFacts.cs`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가
아니라 실제 도구 정의이므로 읽어 볼 가치가 있습니다. `CreateApprovedFactLookup`는 교육 담당자가
방금 승인한 경계 적용 목록을 클로저로 캡처하고, `CopilotTool.DefineTool`을 통해
`approved_fact_lookup`라는 이름으로 등록합니다. 핸들러는 매개변수를 받지 않으므로 모델은 어떤
값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다. `SkipPermission = true`도
데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와
`BoundFacts`가 강제하는 `MaximumFactCount`(20), `MaximumFactLength`(500) 경계도 같은 파일에
있습니다.
:::

:::language nodejs
`src/index.ts`를 엽니다. SDK import에 session config 타입을 추가하고, 헬퍼 import도 넓힙니다.

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  askLine,
  askYesNo,
  boundFacts,
  closeTerminal,
  createApprovedFactLookup,
  factSets,
  generationTimeoutMs,
  readFacts,
  streamExhibit,
} from "./curator.js";
```

시스템 메시지 아래에 프롬프트 빌더와 사실 세트 선택기를 추가합니다.

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the
complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return.`;
}

async function chooseFactSet(): Promise<(typeof factSets)[number]> {
  const answer = await askLine("Choose a fact set [1-3, default 1]: ");
  const choice = Number.parseInt(answer, 10);
  if (Number.isInteger(choice) && choice >= 1 && choice <= factSets.length) {
    return factSets[choice - 1] ?? factSets[0];
  }
  return factSets[0];
}
```

`main` 위에 설정 빌더와 재사용 가능한 세션 러너를 추가한 뒤, `main`을 다음으로 교체합니다.

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: process.env.COPILOT_MODEL?.trim() || undefined,
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: systemMessage },
  };
}

async function runSession(
  config: SessionConfig,
  prompt: string,
  timeout: number,
): Promise<string> {
  const client = new CopilotClient();
  try {
    await client.start();
    const session = await client.createSession(config);
    try {
      const content = await streamExhibit(session, prompt, timeout);
      if (!content.trim()) throw new Error("The curator returned no exhibit content.");
      return content;
    } finally {
      await session.disconnect();
    }
  } finally {
    await client.stop();
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  try {
    console.log("=== Museum Exhibit Studio ===");
    console.log();
    console.log("Approved fact sets:");
    factSets.forEach((factSet, index) => console.log(`${index + 1}. ${factSet.label}`));
    console.log();

    const chosenSet = await chooseFactSet();
    let approvedFacts = boundFacts(chosenSet.facts);
    approvedFacts.forEach((fact, index) => console.log(`${index + 1}. ${fact}`));
    console.log();

    if (!(await askYesNo("Use these facts?", true))) {
      approvedFacts = boundFacts(await readFacts());
    }

    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
  } catch (error) {
    const message = describe(error);
    console.error(message.toLocaleLowerCase().includes("timeout")
      ? "The curator did not respond in time. Try again."
      : `Could not generate the exhibit: ${message}`);
    process.exitCode = 1;
  } finally {
    closeTerminal();
  }
}
```

`void main();` 호출은 그대로 둡니다. `runSession`은 `src/curator.ts`의
`generationTimeoutMs`를 스트리머에 전달하며, 중첩된 `finally` 블록에서 세션을 disconnect하고
클라이언트를 중지합니다. 이제 `buildExhibitPrompt`는 사실을 전혀 받지 않습니다. 대신 도구의 이름을
지정합니다. `createApprovedFactLookup`는 내부에서 `boundFacts`를 호출하므로, 누가 도구를 만들든
같은 경계가 유지됩니다.

**내부 살펴보기:** `src/curator.ts`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가 아니라 실제
`defineTool` 정의이므로 읽어 볼 가치가 있습니다. `createApprovedFactLookup`는 교육 담당자가 방금
승인한 경계 적용 목록을 클로저로 캡처하고,
`parameters: { type: "object", properties: {}, additionalProperties: false }`와 함께
`approved_fact_lookup`를 정의합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수 없고,
요청하면 정확히 그 목록만 받습니다. `skipPermission: true`도 데이터가 애플리케이션 소유이기
때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와 `boundFacts`가 강제하는
`maximumFactCount`(20), `maximumFactLength`(500) 경계도 같은 파일에 있습니다.
:::

:::language python
`main.py`를 엽니다. 파일 상단에 `import os`, `import sys`,
`from collections.abc import Iterable`, `from typing import Any`를 추가하고, 헬퍼 import도
넓힙니다.

```python
from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    FACT_SETS,
    GENERATION_TIMEOUT_SECONDS,
    ask_line,
    ask_yes_no,
    bound_facts,
    create_approved_fact_lookup,
    read_facts,
    stream_exhibit,
)
```

`SYSTEM_MESSAGE` 아래에 프롬프트 빌더를 추가합니다.

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return."""
```

`main` 위에 설정 빌더와 세션 러너를 추가한 뒤, `main`과 그 아래 entrypoint를 다음으로
교체합니다.

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    config: dict[str, Any] = {
        "client_name": "museum-exhibit-studio",
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": SYSTEM_MESSAGE},
    }
    model = os.getenv("COPILOT_MODEL")
    if model and model.strip():
        config["model"] = model.strip()
    return config


async def run_session(config: dict[str, Any], prompt: str, timeout: float) -> str:
    client = CopilotClient()
    try:
        await client.start()
        session = await client.create_session(**config)
        try:
            content = await stream_exhibit(session, prompt, timeout)
            if not content.strip():
                raise RuntimeError("The curator returned no exhibit content.")
            return content
        finally:
            await session.disconnect()
    finally:
        await client.stop()


async def main() -> int:
    try:
        print("=== Museum Exhibit Studio ===")
        print()
        print("Approved fact sets:")
        for index, fact_set in enumerate(FACT_SETS, start=1):
            print(f"{index}. {fact_set.label}")
        print()

        choice = ask_line("Choose a fact set [1-3, default 1]: ")
        selected_index = int(choice) - 1 if choice in {"1", "2", "3"} else 0
        facts = list(FACT_SETS[selected_index].facts)
        for index, fact in enumerate(facts, start=1):
            print(f"{index}. {fact}")
        print()

        if not ask_yes_no("Use these facts?", True):
            facts = read_facts()
        facts = bound_facts(facts)

        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
        return 0
    except TimeoutError:
        print("The curator did not respond in time. Try again.", file=sys.stderr)
        return 1
    except Exception as error:
        print(f"Could not generate the exhibit: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
```

`run_session`은 `curator.py`의 `GENERATION_TIMEOUT_SECONDS`를 스트리머에 전달하며,
`finally` 블록에서 세션을 disconnect하고 클라이언트를 중지합니다. 이제 `build_exhibit_prompt`는
사실을 전혀 받지 않습니다. 대신 도구의 이름을 지정합니다. `create_approved_fact_lookup`는
내부에서 `bound_facts`를 호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

**내부 살펴보기:** `curator.py`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가 아니라 실제
`@define_tool` 정의이므로 읽어 볼 가치가 있습니다. `create_approved_fact_lookup`는 교육
담당자가 방금 승인한 경계 적용 목록을 클로저로 캡처하고, 인수를 받지 않는 중첩
`approved_fact_lookup()`에 데코레이터를 적용합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수
없고, 요청하면 정확히 그 목록만 받습니다. `skip_permission=True`도 데이터가 애플리케이션 소유이기
때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와 `bound_facts`가 강제하는
`MAXIMUM_FACT_COUNT`(20), `MAXIMUM_FACT_LENGTH`(500) 경계도 같은 파일에 있습니다.
:::

:::language go
`main.go`를 엽니다. import 블록에 `"errors"`, `"os"`, `"strconv"`, `"strings"`, `"time"`을
추가한 뒤, 시스템 메시지 아래에 프롬프트 빌더를 추가합니다.

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete
source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return.`, ApprovedFactLookupName)
}
```

설정 빌더와 세션 러너를 추가한 뒤, `main`을 얇은 래퍼와 `run` 함수로 교체합니다.

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               strings.TrimSpace(os.Getenv("COPILOT_MODEL")),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: systemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

func runSession(
	ctx context.Context,
	config *copilot.SessionConfig,
	prompt string,
	timeout time.Duration,
) (string, error) {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return "", err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, config)
	if err != nil {
		return "", err
	}
	defer func() { _ = session.Disconnect() }()

	content, err := StreamExhibit(session, prompt, timeout)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(content) == "" {
		return "", errors.New("The curator returned no exhibit content.")
	}
	return content, nil
}

func isTimeout(err error) bool {
	return errors.Is(err, context.DeadlineExceeded) ||
		strings.Contains(strings.ToLower(err.Error()), "timeout")
}

func main() {
	if err := run(); err != nil {
		if isTimeout(err) {
			fmt.Fprintln(os.Stderr, "The curator did not respond in time. Try again.")
		} else {
			fmt.Fprintln(os.Stderr, err)
		}
		os.Exit(1)
	}
}

func run() error {
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
	fmt.Println("Approved fact sets:")
	for index, factSet := range FactSets {
		fmt.Printf("%d. %s\n", index+1, factSet.Label)
	}
	fmt.Println()

	choice := AskLine(fmt.Sprintf("Choose a fact set [1-%d, default 1]: ", len(FactSets)))
	selectedIndex := 0
	if parsed, err := strconv.Atoi(choice); err == nil && parsed >= 1 && parsed <= len(FactSets) {
		selectedIndex = parsed - 1
	}

	facts := append([]string(nil), FactSets[selectedIndex].Facts...)
	for index, fact := range facts {
		fmt.Printf("%d. %s\n", index+1, fact)
	}
	fmt.Println()

	if !AskYesNo("Use these facts?", true) {
		facts = ReadFacts()
	}
	facts, err := BoundFacts(facts)
	if err != nil {
		return err
	}

	ctx := context.Background()
	workingDirectory, err := os.Getwd()
	if err != nil {
		return err
	}

	exhibitConfig, err := generationConfig(workingDirectory, facts)
	if err != nil {
		return err
	}

	fmt.Println()
	if _, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout); err != nil {
		return err
	}
	return nil
}
```

`runSession`은 `curator.go`의 `GenerationTimeout`을 스트리머에 전달하고, `defer`를 사용해 세션을
disconnect하고 클라이언트를 중지합니다. 이제 `buildExhibitPrompt`는 사실을 전혀 받지 않습니다.
대신 도구의 이름을 지정합니다. `ApprovedFactLookup`는 내부에서 `BoundFacts`를 호출하므로, 누가
도구를 만들든 같은 경계가 유지됩니다.

**내부 살펴보기:** `curator.go`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가 아니라 실제
`copilot.DefineTool` 정의이므로 읽어 볼 가치가 있습니다. `ApprovedFactLookup`는 교육 담당자가
방금 승인한 경계 적용 목록을 클로저로 캡처하고, 인수 타입이 `struct{}`인 핸들러를 정의합니다.
따라서 모델은 어떤 값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다.
`lookup.SkipPermission = true`도 데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서
설정합니다. 세 가지 사실 세트와 `BoundFacts`가 강제하는 `MaximumFactCount`(20),
`MaximumFactLength`(500) 경계도 같은 파일에 있습니다.
:::

:::language rust
`src/main.rs`를 엽니다. `use std::error::Error;`, `use std::time::Duration;`를 추가하고,
crate import도 넓힙니다.

```rust
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, FactBoundsError, GENERATION_TIMEOUT, RuntimeError,
    approved_fact_lookup, ask_line, ask_yes_no, bound_facts, fact_sets, read_facts, stream_exhibit,
};
```

`SYSTEM_MESSAGE` 아래에 프롬프트 빌더를 추가합니다.

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return."#
    )
}
```

설정 빌더와 세션 러너를 추가한 뒤, `main`을 얇은 래퍼와 `run` 함수로 교체합니다.

```rust
fn selected_model() -> Option<String> {
    std::env::var("COPILOT_MODEL")
        .ok()
        .map(|model| model.trim().to_owned())
        .filter(|model| !model.is_empty())
}

fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, FactBoundsError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(SYSTEM_MESSAGE),
    );
    Ok(config)
}

async fn run_session(
    config: SessionConfig,
    prompt: String,
    timeout: Duration,
) -> Result<String, RuntimeError> {
    let client = Client::start(ClientOptions::default()).await?;
    let session_result = async {
        let session = client.create_session(config).await?;
        let stream_result = stream_exhibit(&session, prompt, timeout).await;
        let disconnect_result = session.disconnect().await;
        match (stream_result, disconnect_result) {
            (Ok(content), Ok(())) => Ok(content),
            (Err(error), _) => Err(error),
            (Ok(_), Err(error)) => Err(Box::new(error) as RuntimeError),
        }
    }
    .await;
    let stop_result = client.stop().await;
    let content = match (session_result, stop_result) {
        (Ok(content), Ok(())) => content,
        (Err(error), _) => return Err(error),
        (Ok(_), Err(error)) => return Err(Box::new(error) as RuntimeError),
    };
    if content.trim().is_empty() {
        return Err("The curator returned no exhibit content.".into());
    }
    Ok(content)
}

fn is_timeout_error(error: &(dyn Error + 'static)) -> bool {
    let mut current = Some(error);
    while let Some(candidate) = current {
        let message = candidate.to_string().to_lowercase();
        if message.contains("timeout") || message.contains("timed out") {
            return true;
        }
        current = candidate.source();
    }
    false
}

#[tokio::main]
async fn main() {
    if let Err(error) = run().await {
        if is_timeout_error(error.as_ref()) {
            eprintln!("The curator did not respond in time. Try again.");
        } else {
            eprintln!("Could not complete Museum Exhibit Studio: {error}");
        }
        std::process::exit(1);
    }
}

async fn run() -> Result<(), RuntimeError> {
    println!("=== Museum Exhibit Studio ===");
    println!();
    println!("Approved fact sets:");
    for (index, fact_set) in fact_sets().iter().enumerate() {
        println!("{}. {}", index + 1, fact_set.label);
    }
    println!();

    let choice = ask_line("Choose a fact set [1-3, default 1]: ")?;
    let selected_index = choice
        .trim()
        .parse::<usize>()
        .ok()
        .filter(|index| (1..=fact_sets().len()).contains(index))
        .unwrap_or(1)
        - 1;
    let mut facts = fact_sets()[selected_index]
        .facts
        .iter()
        .map(|fact| (*fact).to_owned())
        .collect::<Vec<_>>();
    for (index, fact) in facts.iter().enumerate() {
        println!("{}. {fact}", index + 1);
    }
    println!();

    if !ask_yes_no("Use these facts?", true)? {
        facts = read_facts()?;
    }
    let facts = bound_facts(facts)?;

    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;

    Ok(())
}
```

`run_session`은 `src/lib.rs`의 `GENERATION_TIMEOUT`을 스트리머에 전달하고, 오류를 전파하기 전에
세션을 disconnect하고 클라이언트를 중지합니다. 이제 `build_exhibit_prompt`는 사실을 전혀 받지
않습니다. 대신 도구의 이름을 지정합니다. `approved_fact_lookup`는 내부에서 `bound_facts`를
호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

**내부 살펴보기:** `src/lib.rs`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가 아니라 실제 도구
정의이므로 읽어 볼 가치가 있습니다. `approved_fact_lookup`는 교육 담당자가 방금 승인한 경계 적용
목록을 클로저로 캡처하고, 매개변수 스키마가
`{"type": "object", "properties": {}, "additionalProperties": false}`인 `Tool`을 구성합니다.
따라서 모델은 어떤 값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다.
`.with_skip_permission(true)`도 데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서
설정합니다. 세 가지 사실 세트와 `bound_facts`가 강제하는 `MAXIMUM_FACT_COUNT`(20),
`MAXIMUM_FACT_LENGTH`(500) 경계도 같은 파일에 있습니다.
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java`를 엽니다. 다음 import를 추가한 뒤,
클래스에 프롬프트 빌더와 사실 세트 선택기를 추가합니다.

```java
import com.github.copilot.CopilotSession;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
```

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the
                complete source of truth for this exhibit.

                Return exactly this structure:

                # <an engaging exhibit title>
                ## Narrative
                <100-140 words, excluding the title and questions>
                ## Visitor questions
                1. <question>
                2. <question>
                3. <question>

                Write exactly three distinct visitor reflection questions. Do not add a preface,
                conclusion, software discussion, or facts the tool did not return.
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME);
    }

    private static CuratorFacts.FactSet selectFactSet(String input) {
        if (input != null && !input.isBlank()) {
            try {
                int selected = Integer.parseInt(input.trim());
                if (selected >= 1 && selected <= CuratorFacts.factSets.size()) {
                    return CuratorFacts.factSets.get(selected - 1);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return CuratorFacts.factSets.get(0);
    }
```

클래스에 설정 빌더와 세션 러너를 추가한 뒤, `main`을 교체합니다.

```java
    private static SessionConfig generationConfig(Iterable<String> approvedFacts) {
        SessionConfig config = new SessionConfig()
                .setClientName("museum-exhibit-studio")
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                .setTools(List.of(CuratorFacts.approvedFactLookup(approvedFacts)))
                .setAvailableTools(List.of(CuratorFacts.APPROVED_FACT_LOOKUP_NAME))
                .setStreaming(true)
                .setSystemMessage(new SystemMessageConfig()
                        .setMode(SystemMessageMode.REPLACE)
                        .setContent(SYSTEM_MESSAGE));
        String model = System.getenv("COPILOT_MODEL");
        if (model != null && !model.isBlank()) {
            config.setModel(model.trim());
        }
        return config;
    }

    private static String runSession(SessionConfig config, String prompt, Duration timeout)
            throws Exception {
        try (var client = new CopilotClient()) {
            CopilotSession session = null;
            try {
                client.start().get();
                session = client.createSession(config).get();
                String content = CuratorStreamer.streamExhibit(session, prompt, timeout);
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("The curator returned no exhibit content.");
                }
                return content;
            } finally {
                try {
                    if (session != null) {
                        session.close();
                    }
                } finally {
                    client.stop().get();
                }
            }
        }
    }

    private static boolean isTimeout(Throwable error) {
        Throwable current = error;
        while (current != null) {
            if (current instanceof TimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static String rootMessage(Throwable error) {
        Throwable current = error;
        while (current instanceof ExecutionException && current.getCause() != null) {
            current = current.getCause();
        }
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String message = current.getMessage();
        return message == null || message.isBlank() ? current.getClass().getSimpleName() : message;
    }

    public static void main(String[] args) {
        int exitCode = 0;
        try {
            System.out.println("=== Museum Exhibit Studio ===");
            System.out.println();
            System.out.println("Approved fact sets:");
            for (int index = 0; index < CuratorFacts.factSets.size(); index++) {
                System.out.printf("%d. %s%n", index + 1, CuratorFacts.factSets.get(index).label());
            }
            System.out.println();

            CuratorFacts.FactSet selected =
                    selectFactSet(CuratorTerminal.askLine("Choose a fact set [1-3, default 1]: "));
            List<String> facts = selected.facts();
            for (int index = 0; index < facts.size(); index++) {
                System.out.printf("%d. %s%n", index + 1, facts.get(index));
            }
            System.out.println();

            if (!CuratorTerminal.askYesNo("Use these facts?", true)) {
                facts = CuratorTerminal.readFacts();
            }
            facts = CuratorFacts.boundFacts(facts);

            System.out.println();
            runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
        } catch (Exception exception) {
            exitCode = 1;
            if (isTimeout(exception)) {
                System.err.println("The curator did not respond in time. Try again.");
            } else {
                System.err.println("Could not complete the exhibit studio run: " + rootMessage(exception));
            }
        } finally {
            try {
                CuratorTerminal.close();
            } catch (Exception exception) {
                System.err.println("Could not close the terminal: " + rootMessage(exception));
                exitCode = 1;
            }
        }
        if (exitCode != 0) {
            System.exit(exitCode);
        }
    }
```

`runSession`은 `CuratorStreamer.java`의 `CuratorStreamer.GENERATION_TIMEOUT`을 스트리머에
전달하며, 중첩된 `finally` 블록에서 세션을 닫고 클라이언트를 중지합니다. 이제
`buildExhibitPrompt`는 사실을 전혀 받지 않습니다. 대신 도구의 이름을 지정합니다.
`approvedFactLookup`는 내부에서 `boundFacts`를 호출하므로, 누가 도구를 만들든 같은 경계가
유지됩니다.

**내부 살펴보기:** `CuratorFacts.java`에 이 모든 내용이 들어 있으며, 단순한 배선 코드가 아니라
실제 `ToolDefinition`이므로 읽어 볼 가치가 있습니다. `approvedFactLookup`는 교육 담당자가 방금
승인한 경계 적용 목록 위에 private `ApprovedFactReader`를 만들고, 인수를 받지 않는 `read`
메서드를 바인딩합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수 없고, 요청하면 정확히 그
목록만 받습니다. `.skipPermission(true)`도 데이터가 애플리케이션 소유이기 때문에 바로 그
자리에서 설정합니다. 세 가지 사실 세트와 `boundFacts`가 강제하는 `MAXIMUM_FACT_COUNT`(20),
`MAXIMUM_FACT_LENGTH`(500) 경계도 같은 파일에 있습니다.
:::

## 실행하기

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start
```
:::
:::language python
```bash
.venv/bin/python main.py
```
:::
:::language go
```bash
go run .
```
:::
:::language rust
```bash
cargo run
```
:::
:::language java
```bash
./mvnw compile exec:java
```
:::

이제 애플리케이션은 무엇이든 쓰기 전에 먼저 여러분에게 질문하고, 큐레이터는 한 단어를 쓰기 전에
사실을 가져오는 모습을 눈에 보이게 드러냅니다.

```text
=== Museum Exhibit Studio ===

Approved fact sets:
1. Apollo 11
2. Great Barrier Reef
3. Terracotta Army

Choose a fact set [1-3, default 1]: 2
1. The Great Barrier Reef lies off the coast of Queensland, Australia.
2. It stretches for about 2,300 kilometres.
3. It is made up of more than 2,900 individual reefs.
4. It was added to the UNESCO World Heritage List in 1981.
5. Rising sea temperatures have caused repeated coral bleaching events.

Use these facts? [Y/n]: y

[tool:start] approved_fact_lookup
[tool:done] success=true

# A Reef the Size of a Country
## Narrative
Off the Queensland coast, more than two thousand nine hundred reefs...
## Visitor questions
1. ...
```

`[tool:start] approved_fact_lookup` 줄이 바로 이 단계의 핵심입니다. 큐레이터는 산호초를
기억해 낸 것이 아닙니다. 여러분의 애플리케이션에 사실을 요청했고, 애플리케이션이 응답한 것입니다.

## 도구가 실제로 작동하고 있음을 입증하기

다시 실행하고 1번 또는 3번 세트를 선택해 보십시오. 전시의 주제가 완전히 바뀌고, 도구 이벤트도
매번 다시 나타납니다. 그 실행들 사이에 프롬프트에서는 아무것도 바뀌지 않았습니다. 같은 프롬프트
텍스트가 Terracotta Army 전시를 만든 이유는 도구가 다른 데이터를 반환했기 때문입니다. 이것이
데이터를 실은 프롬프트와, 데이터를 소유한 애플리케이션의 차이입니다.

그다음 확인 프롬프트에서 `n`을 입력하고, 여러분만의 사실 두세 개를 입력한 뒤 빈 줄을 제출해
보십시오. 그러면 큐레이터는 대신 여러분의 주제에 대해 작성합니다. 여러분이 입력한 사실이 도구에
들어갔고, 도구가 그것을 다시 모델에 전달했기 때문입니다.

실패 사례도 시도해 보십시오. `n`을 입력한 뒤 어떤 사실도 입력하지 않고 바로 빈 줄을 제출합니다.
그러면 실행은 `Provide at least one approved fact.`와 함께 중단됩니다. 도구 팩토리가 빈 목록을
기반으로 빌드되기를 거부했으므로, 어떤 요청도 전송되지 않았습니다. 오류 처리기는 이 실패를
보고하고 상태 코드 1로 종료합니다.

세션 러너는 여러분을 무기한 기다리게 두는 대신 타임아웃도 보고합니다.

```text
The curator did not respond in time. Try again.
```

기본 타임아웃은 120초이며, 이것이 큐레이터가 사용할 수 있는 사실이나 도구를 바꾸지는 않습니다.

## 이해도 확인

- 도구를 두 곳에 등록했습니다. `approved_fact_lookup`를 도구 목록에는 넣고 허용 목록에서는
  제외하면 어떻게 됩니까?
- 프롬프트에는 "먼저 `approved_fact_lookup`를 호출하라"고 적혀 있습니다. 그 문장만으로 호출이
  반드시 보장됩니까? 이 단계에서 무엇이 그 도구를 실제로 호출 *가능한 상태*로 만들었습니까?
- 이 도구는 인수를 받지 않고, 주어진 사실 세트에 대해 항상 같은 경계 적용 목록을 반환합니다.
  만약 자유 텍스트 쿼리 인수를 받도록 바꾸면 무엇을 잃게 됩니까?
- 출력 구조는 프롬프트에서 요청했습니다. 지금까지 모델이 그것을 따랐는지는 실제로 무엇이
  검증했습니까?

## 자세히 알아보기

- [Working with hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  런타임이 각 도구 호출 전후에 호출하는 콜백으로, 감사나 애플리케이션 소유 정책에 활용할 수
  있습니다.
- [Post-tool-use hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  모델이 읽기 전에 도구가 반환한 값을 검사하거나 다시 쓰는 방법을 설명합니다.
- [Context clearing and terminal tools](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  도구가 대화 자체에 무엇을 할 수 있는지, 그리고 대부분의 도구가 왜 그렇게 해서는 안 되는지를
  설명합니다.

[구조를 검증하기](museum-06-prove-the-structure.md)로 계속 진행합니다.
