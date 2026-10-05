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
입력할 수 있게 하는 미리 빌드된 선택기를 호출하고, 이후 단계에서도 재사용할 수 있도록 세션 수명
주기를 작은 러너 하나에 담습니다.

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

- **`tools`** 항목은 *구현*을 담습니다. 여기에서 런타임은 `approved_fact_lookup`라는 함수가 존재하며
  그것을 어떻게 실행할지 알게 됩니다.
- **`availableTools`** 항목은 *허용 목록*입니다. 이 세션에서 모델이 호출하도록 허용된 도구의 이름을
  나열합니다. 등록은 되었지만 허용 목록에 없는 도구는 호출할 수 없습니다.

두 가지가 모두 필요합니다. `approved_fact_lookup`만 지정하는 것은 다른 모든 도구를 함께 제외하는
일이기도 합니다. 이 세션에는 파일 리더, 셸, 브라우저가 제공되지 않습니다.

프롬프트는 세 번째 조각이며, 그중에서도 가장 약합니다. 프롬프트는 모델에게 도구를 호출하고 도구가
반환한 것만 사용하라고 *요청*할 뿐입니다. 3단계 시스템 메시지는 출처에 대해 아무 말도 하지 않으므로,
이 프롬프트는 큐레이터에게 사실이 어디서 오는지 알려 주는 첫 번째 위치입니다. 프롬프트는 실제로
호출이 일어나게 만들지도 못하고, 호출을 막지도 못합니다. 그래도 명시적인
"call `approved_fact_lookup` first" 지시는 유지하십시오. 이 단계에서는 도구 호출이 눈에 보이도록
신뢰성 있게 일어나야 하기 때문입니다.

**실행을 경계 안에 유지하십시오:** 헬퍼에 이미 있는 **120초 생성 타임아웃**을 세션 러너에 명시적으로
전달합니다. 러너는 나중에 검증할 전시 텍스트를 반환하고, 빈 출력을 거부하며, 스트림이 실패하더라도
세션과 클라이언트를 정리합니다. 이것은 모델에 대한 지침이 아니라 애플리케이션 제어입니다.

## 도구를 등록하고 프롬프트 작성하기

:::language dotnet
`Program.cs`를 엽니다. 이 단계에서는 영역 다섯 개가 바뀝니다. `imports` 영역에는 이미 이
단계에 필요한 모든 것이 들어 있습니다.

`Program.cs`의 `choose-facts` 영역에 **INSERT**합니다.

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

`Program.cs`의 `generate` 영역을 **REPLACE**합니다.

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와
세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`Program.cs`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

`Program.cs`의 `generation-config` 영역에 **INSERT**합니다.

```csharp
SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = CuratorStreamer.SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = CuratorSystemMessages.Curator
    }
};
```

`Program.cs`의 `session-runner` 영역에 **INSERT**합니다.

```csharp
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
```

`RunSessionAsync`는 `Helpers/CuratorStreamer.cs`의 `CuratorStreamer.GenerationTimeout`을 사용하며,
`finally`에서 클라이언트를 중지하기 전에 세션을 dispose합니다. 이제 `BuildExhibitPrompt`는 사실을
전혀 받지 않습니다. 대신 도구의 이름을 지정합니다. `CreateApprovedFactLookup`는 내부에서
`BoundFacts`를 호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `CuratorTerminal.ChooseApprovedFacts`는 세 가지
사실 세트를 나열하고, 선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계
적용 목록을 반환합니다. `CuratorPrompts.ExhibitStructure`는 고정된 제목, narrative, 질문
레이아웃이며, 5단계에서 같은 레이아웃을 검사하므로 `Helpers/CuratorPrompts.cs`에 있습니다.
`CuratorStreamer.SelectedModel`은 선택 사항인 `COPILOT_MODEL` 환경 변수를 읽습니다.

**내부 살펴보기:** `Helpers/CuratorFacts.cs`에는 도구가 들어 있으며, 단순한 배선 코드가 아니라
실제 도구 정의이므로 읽어 볼 가치가 있습니다. `CreateApprovedFactLookup`는 교육 담당자가 방금
승인한 경계 적용 목록을 클로저로 캡처하고, `CopilotTool.DefineTool`을 통해
`approved_fact_lookup`라는 이름으로 등록합니다. 핸들러는 매개변수를 받지 않으므로 모델은 어떤
값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다. `SkipPermission = true`도
데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와
`BoundFacts`가 강제하는 `MaximumFactCount`(20), `MaximumFactLength`(500) 경계도 같은 파일에
있습니다.
:::

:::language nodejs
`src/index.ts`를 엽니다. 이 단계에서는 새 헬퍼에 필요한 import부터 시작해 영역 여섯 개가 바뀝니다.

`src/index.ts`의 `imports` 영역을 **REPLACE**합니다.

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  chooseApprovedFacts,
  closeTerminal,
  createApprovedFactLookup,
  describeFailure,
  exhibitStructure,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

`src/index.ts`의 `choose-facts` 영역에 **INSERT**합니다.

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

`src/index.ts`의 `generate` 영역을 **REPLACE**합니다.

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와
세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`src/index.ts`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

`src/index.ts`의 `generation-config` 영역에 **INSERT**합니다.

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: selectedModel(),
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: curatorSystemMessage },
  };
}
```

`src/index.ts`의 `session-runner` 영역에 **INSERT**합니다.

```typescript
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
```

`runSession`은 `src/curator.ts`의 `generationTimeoutMs`를 스트리머에 전달하며, 중첩된
`finally` 블록에서 세션을 disconnect하고 클라이언트를 중지합니다. 이제 `buildExhibitPrompt`는
사실을 전혀 받지 않습니다. 대신 도구의 이름을 지정합니다. `createApprovedFactLookup`는 내부에서
`boundFacts`를 호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `chooseApprovedFacts`는 세 가지 사실 세트를 나열하고,
선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계 적용 목록을 반환합니다.
`exhibitStructure`는 고정된 제목, narrative, 질문 레이아웃이며, 5단계에서 같은 레이아웃을
검사하므로 `src/curator.ts`에 있습니다. `selectedModel`은 선택 사항인 `COPILOT_MODEL` 환경 변수를
읽습니다.

**내부 살펴보기:** `src/curator.ts`에는 도구가 들어 있으며, 단순한 배선 코드가 아니라 실제
`defineTool` 정의이므로 읽어 볼 가치가 있습니다. `createApprovedFactLookup`는 교육 담당자가 방금
승인한 경계 적용 목록을 클로저로 캡처하고,
`parameters: { type: "object", properties: {}, additionalProperties: false }`와 함께
`approved_fact_lookup`를 정의합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수 없고,
요청하면 정확히 그 목록만 받습니다. `skipPermission: true`도 데이터가 애플리케이션 소유이기
때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와 `boundFacts`가 강제하는
`maximumFactCount`(20), `maximumFactLength`(500) 경계도 같은 파일에 있습니다.
:::

:::language python
`main.py`를 엽니다. 이 단계에서는 영역 여섯 개가 바뀝니다.

`main.py`의 `imports` 영역을 **REPLACE**합니다.

```python
from __future__ import annotations

import asyncio
import sys
from collections.abc import Iterable
from typing import Any

from copilot import CopilotClient, PermissionHandler

from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    EXHIBIT_STRUCTURE,
    GENERATION_TIMEOUT_SECONDS,
    choose_approved_facts,
    create_approved_fact_lookup,
    describe_failure,
    selected_model,
    stream_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

`main.py`의 `choose-facts` 영역에 **INSERT**합니다.

```python
        facts = choose_approved_facts()
```

`main.py`의 `generate` 영역을 **REPLACE**합니다.

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와
세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`main.py`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

`main.py`의 `generation-config` 영역에 **INSERT**합니다.

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    return {
        "client_name": "museum-exhibit-studio",
        "model": selected_model(),
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
    }
```

`main.py`의 `session-runner` 영역에 **INSERT**합니다.

```python
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
```

`run_session`은 `curator.py`의 `GENERATION_TIMEOUT_SECONDS`를 스트리머에 전달하며,
`finally` 블록에서 세션을 disconnect하고 클라이언트를 중지합니다. 이제 `build_exhibit_prompt`는
사실을 전혀 받지 않습니다. 대신 도구의 이름을 지정합니다. `create_approved_fact_lookup`는
내부에서 `bound_facts`를 호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `choose_approved_facts`는 세 가지 사실 세트를 나열하고,
선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계 적용 목록을 반환합니다.
`EXHIBIT_STRUCTURE`는 고정된 제목, narrative, 질문 레이아웃이며, 5단계에서 같은 레이아웃을
검사하므로 `curator.py`에 있습니다. `selected_model`은 선택 사항인 `COPILOT_MODEL` 환경 변수를
읽습니다. 이 SDK는 `model=None`을 허용하므로, 설정이 모델 선택을 런타임에 맡길 수 있습니다.

**내부 살펴보기:** `curator.py`에는 도구가 들어 있으며, 단순한 배선 코드가 아니라 실제
`@define_tool` 정의이므로 읽어 볼 가치가 있습니다. `create_approved_fact_lookup`는 교육 담당자가
방금 승인한 경계 적용 목록을 클로저로 캡처하고, 인수를 받지 않는 중첩
`approved_fact_lookup()`에 데코레이터를 적용합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수
없고, 요청하면 정확히 그 목록만 받습니다. `skip_permission=True`도 데이터가 애플리케이션 소유이기
때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와 `bound_facts`가 강제하는
`MAXIMUM_FACT_COUNT`(20), `MAXIMUM_FACT_LENGTH`(500) 경계도 같은 파일에 있습니다.
:::

:::language go
`main.go`를 엽니다. 이 단계에서는 영역 여섯 개가 바뀝니다.

`main.go`의 `imports` 영역을 **REPLACE**합니다.

```go
import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	copilot "github.com/github/copilot-sdk/go"
)

```

`main.go`의 `choose-facts` 영역에 **INSERT**합니다.

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

`main.go`의 `generate` 영역을 **REPLACE**합니다.

```go
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
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와
세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`main.go`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

`main.go`의 `generation-config` 영역에 **INSERT**합니다.

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               SelectedModel(),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

```

`main.go`의 `session-runner` 영역에 **INSERT**합니다.

```go
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

```

`runSession`은 `curator.go`의 `GenerationTimeout`을 스트리머에 전달하고, `defer`를 사용해
클라이언트를 중지하기 전에 세션을 disconnect합니다. 이제 `buildExhibitPrompt`는 사실을 전혀 받지
않습니다. 대신 도구의 이름을 지정합니다. `ApprovedFactLookup`는 내부에서 `BoundFacts`를
호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `curator.go`의 `ChooseApprovedFacts`는 세 가지
사실 세트를 나열하고, 선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계
적용 목록을 반환합니다. `ExhibitStructure`는 고정된 제목, narrative, 질문 레이아웃이며, 5단계에서
같은 레이아웃을 검사하므로 `curator.go`에 있습니다. `SelectedModel`은 선택 사항인
`COPILOT_MODEL` 환경 변수를 읽습니다.

**내부 살펴보기:** `curator.go`에는 도구가 들어 있으며, 단순한 배선 코드가 아니라 실제
`copilot.DefineTool` 정의이므로 읽어 볼 가치가 있습니다. `ApprovedFactLookup`는 교육 담당자가
방금 승인한 경계 적용 목록을 클로저로 캡처하고, 인수 타입이 `struct{}`인 핸들러를 정의합니다.
따라서 모델은 어떤 값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다.
`lookup.SkipPermission = true`도 데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서
설정합니다. 세 가지 사실 세트와 `BoundFacts`가 강제하는 `MaximumFactCount`(20),
`MaximumFactLength`(500) 경계도 같은 파일에 있습니다.
:::

:::language rust
`src/main.rs`를 엽니다. 이 단계에서는 영역 여섯 개가 바뀝니다.

`src/main.rs`의 `imports` 영역을 **REPLACE**합니다.

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, selected_model,
    stream_exhibit,
};
```

`src/main.rs`의 `choose-facts` 영역에 **INSERT**합니다.

```rust
    let facts = choose_approved_facts()?;
```

`src/main.rs`의 `generate` 영역을 **REPLACE**합니다.

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와
세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`src/main.rs`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"#
    )
}
```

`src/main.rs`의 `generation-config` 영역에 **INSERT**합니다.

```rust
fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, RuntimeError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    Ok(config)
}
```

`src/main.rs`의 `session-runner` 영역에 **INSERT**합니다.

```rust
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
```

`run_session`은 `src/lib.rs`의 `GENERATION_TIMEOUT`을 스트리머에 전달하고, 오류를 전파하기 전에
세션을 disconnect하고 클라이언트를 중지합니다. 이제 `build_exhibit_prompt`는 사실을 전혀 받지
않습니다. 대신 도구의 이름을 지정합니다. `approved_fact_lookup`는 내부에서 `bound_facts`를
호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `choose_approved_facts`는 세 가지 사실 세트를 나열하고,
선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계 적용 목록을 반환합니다.
`EXHIBIT_STRUCTURE`는 고정된 제목, narrative, 질문 레이아웃이며, 5단계에서 같은 레이아웃을
검사하므로 `src/lib.rs`에 있습니다. `selected_model`은 선택 사항인 `COPILOT_MODEL` 환경 변수를
읽습니다.

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
`src/main/java/workshop/MuseumExhibitStudio.java`를 엽니다. 이 단계에서는 영역 여섯 개가 바뀝니다.

`src/main/java/workshop/MuseumExhibitStudio.java`의 `imports` 영역을 **REPLACE**합니다.

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;

import java.time.Duration;
import java.util.List;
```

`src/main/java/workshop/MuseumExhibitStudio.java`의 `choose-facts` 영역에 **INSERT**합니다.

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

`src/main/java/workshop/MuseumExhibitStudio.java`의 `generate` 영역을 **REPLACE**합니다.

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

1~3단계의 인라인 클라이언트와 세션은 더 이상 `generate`에 있지 않습니다. 아래의 설정 빌더와 세션 러너로 이동하므로, 이후 단계에서 재사용할 수 있습니다.

`src/main/java/workshop/MuseumExhibitStudio.java`의 `exhibit-prompt` 영역에 **INSERT**합니다.

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

`src/main/java/workshop/MuseumExhibitStudio.java`의 `generation-config` 영역에 **INSERT**합니다.

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
                        .setContent(CuratorSystemMessages.CURATOR));
        return CuratorStreamer.withSelectedModel(config);
    }
```

`src/main/java/workshop/MuseumExhibitStudio.java`의 `session-runner` 영역에 **INSERT**합니다.

```java
    private static String runSession(SessionConfig config, String prompt, Duration timeout) throws Exception {
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
```

`runSession`은 `CuratorStreamer.java`의 `CuratorStreamer.GENERATION_TIMEOUT`을 사용하며, `finally`에서 클라이언트를 중지하기 전에 세션을 닫습니다. 이제 `buildExhibitPrompt`는 사실을 전혀 받지 않습니다. 대신 도구의 이름을 지정합니다. `approvedFactLookup`는 내부에서 `boundFacts`를 호출하므로, 누가 도구를 만들든 같은 경계가 유지됩니다.

헬퍼 호출 세 개 덕분에 이 단계가 짧아집니다. `CuratorTerminal.chooseApprovedFacts`는 세 가지 사실 세트를 나열하고, 선택을 읽고, 사실을 출력한 뒤, 교육 담당자가 확인하거나 직접 입력하면 경계 적용 목록을 반환합니다. `CuratorPrompts.EXHIBIT_STRUCTURE`는 고정된 제목, narrative, 질문 레이아웃이며, 5단계에서 같은 레이아웃을 검사하므로 `CuratorPrompts.java`에 있습니다. `CuratorStreamer.withSelectedModel`은 선택 사항인 `COPILOT_MODEL` 환경 변수를 읽어 세션 config에 적용합니다.

**내부 살펴보기:** `CuratorFacts.java`에는 도구가 들어 있으며, 단순한 배선 코드가 아니라 실제 `ToolDefinition`이므로 읽어 볼 가치가 있습니다. `approvedFactLookup`는 교육 담당자가 방금 승인한 경계 적용 목록 위에 private `ApprovedFactReader`를 만들고, 인수를 받지 않는 `read` 메서드를 바인딩합니다. 따라서 모델은 어떤 값이 돌아올지 조종할 수 없고, 요청하면 정확히 그 목록만 받습니다. `.skipPermission(true)`도 데이터가 애플리케이션 소유이기 때문에 바로 그 자리에서 설정합니다. 세 가지 사실 세트와 `boundFacts`가 강제하는 `MAXIMUM_FACT_COUNT`(20), `MAXIMUM_FACT_LENGTH`(500) 경계도 같은 파일에 있습니다.
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
그러면 실행이 다음 메시지와 함께 중단됩니다.

```text
Could not generate the exhibit: Provide at least one approved fact.
```

사실 선택기는 교육 담당자가 무엇을 입력하든 경계를 적용하며, 경계는 빈 목록을 거부하므로 세션은
전혀 생성되지 않았고 어떤 요청도 전송되지 않았습니다. 스타터에 포함된 오류 처리기는 메시지를
출력하고 상태 코드 1로 종료합니다.

타임아웃을 초과한 실행도 여러분을 무기한 기다리게 두는 대신 같은 방식으로 중단됩니다.

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
