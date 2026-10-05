# 3단계: 큐레이터에 목소리 부여하기

> **소요 시간:** 10분

## 빌드할 내용

같은 스트리밍 호출, 같은 주제이지만 이제 응답은 챗봇이 아니라 박물관의 목소리처럼 들립니다.
세션에
[system message](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)
하나를 제공하고 replace 모드로 전환합니다. 또한 두 문장 대신 다섯 문장을 요청하므로, 차이를 들을
수 있을 만큼 충분한 텍스트가 생깁니다.

이것이 **애플리케이션 소유 정책**(application-owned policy)의 첫 번째 조각입니다. 프롬프트는
실행마다 바뀌는 작업 데이터입니다. 시스템 메시지는 이 에이전트가 누구인지, 무엇을 말해도 되는지,
출력은 어떤 형태여야 하는지를 오래 유지되는 방식으로 선언합니다.

## `replace` 모드와 시스템 메시지로 할 수 있는 일과 할 수 없는 일

대부분의 SDK 세션은 범용 코딩 어시스턴트 페르소나로 시작합니다. `replace` 모드는 그것을 버리고
여러분의 페르소나를 설치하므로, 큐레이터는 박물관 모자를 쓴 코딩 어시스턴트가 아닙니다. 기본
페르소나를 확장하려면 `append`를 사용하고, 기본 페르소나가 작업에 맞지 않다면 `replace`를
사용합니다. 박물관 큐레이터에게는 기본 페르소나가 맞지 않습니다.

세 번째 모드도 있습니다. `customize`는 나머지는 유지한 채 SDK가 관리하는 프롬프트의 개별 섹션,
즉 tone, guidelines, code change rules 등을 재정의하므로 전체를 다시 쓰지 않고도 특정 부분만
바꿀 수 있습니다. 기본 프롬프트가 대체로 맞고 몇몇 섹션만 맞지 않을 때 사용하십시오. 기본
`append` 모드에서는 SDK가 환경 컨텍스트, 도구 지침, 보안 가드레일을 자동 주입하고 CLI 페르소나도
유지됩니다. 반면 `replace`는 완전한 제어권을 주는 대신 이러한 섹션들을 포기하게 만듭니다. 그래서
이제 사용할 메시지에는 자체 범위와 한계가 명시적으로 적혀 있습니다.

시스템 메시지는 **강제 수단이 아니라 지침**입니다. 어조, 범위, 구조를 형성하고, 모델이 엉뚱한
방향으로 벗어나지 않도록 강하게 유도합니다. 하지만 도구 호출을 막거나, 실행 시간을 제한하거나,
주장이 사실인지 입증할 수는 없습니다. 그런 일에는 허용 목록, 타임아웃, 검증이 필요하며, 이는
4단계와 5단계에서 다룹니다.

## 큐레이터 시스템 메시지의 내용

런타임은 세션의 모든 프롬프트보다 앞서 시스템 메시지를 보냅니다. 프롬프트는 하나의 요청이고,
시스템 메시지는 모든 요청이 그 아래에서 답변되는 상시 지침입니다. 다음은 이 단계부터 큐레이터가
따르는 메시지입니다.

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

각 단락은 한 가지 역할을 합니다.

- **역할.** 첫 줄은 모델을 큐레이터로 만듭니다. replace 모드에서는 이것이 남는 유일한 페르소나입니다.
- **목소리.** 두 번째 단락은 대상 독자와 어조를 설정합니다.
- **범위.** 세 번째 단락은 소프트웨어 주제와 자체 지침에 관한 이야기를 배제하고, 큐레이터에게
  갖고 있지 않은 접근 권한이 있다고 주장하지 말라고 지시합니다.
- **출력.** 마지막 단락은 큐레이터가 프롬프트에서 요청하는 구조를 그대로 따르고, 그 주변에 아무것도
  덧붙이지 않게 합니다.

이 메시지는 사실이 어디서 오는지는 말하지 않으므로, 지금은 큐레이터가 모델의 기억을 바탕으로
씁니다. 4단계에서는 애플리케이션이 소유한 도구와 그것을 사용하라고 큐레이터에게 지시하는
프롬프트로 그 간극을 메웁니다.

## 세션에 큐레이터 시스템 메시지 제공하기

이 메시지는 길고, 여러분이 입력해야 하는 코드가 아니라 애플리케이션이 소유한 텍스트이므로 다른
시스템 메시지와 함께 미리 빌드된 헬퍼 파일에 포함되어 제공됩니다. 이 단계에서 여러분의 작업은
설정입니다. 즉, 메시지를 replace 모드로 설치하는 설정 하나를 추가합니다.

:::language dotnet
`Program.cs`를 엽니다. 이 단계에서는 영역 하나가 바뀝니다.

위 메시지는 이미 `CuratorSystemMessages.Curator`로
`Helpers/CuratorSystemMessages.cs`에 작성되어 있습니다.

`Program.cs`의 `generate` 영역을 **REPLACE**합니다.

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true,
        SystemMessage = new SystemMessageConfig
        {
            Mode = SystemMessageMode.Replace,
            Content = CuratorSystemMessages.Curator
        }
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

`generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된 메시지를 콘텐츠로 사용하는
replace 모드의 `SystemMessage`가 추가됩니다. 프롬프트는 두 문장 대신 다섯 문장을 요청하므로,
목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두 2단계에서 남긴
그대로입니다.

**내부 살펴보기:** `Helpers/CuratorSystemMessages.cs`에는 이 애플리케이션이 사용하는 모든 시스템
메시지가 들어 있으므로, 긴 텍스트가 `Program.cs` 밖에 유지됩니다. `Curator`는 방금 세션에 전달한
메시지입니다. `CuratorWithResearch`와 `Research`는 6단계를 위한 것입니다. 스트리밍 호출과 그
120초 기본값은 모두 `Helpers/CuratorStreamer.cs`에서 오며, `GenerationTimeout`과
`ResearchTimeout`도 그곳에 선언되어 있습니다.
:::

:::language nodejs
`src/index.ts`를 엽니다. 이 단계에서는 영역 두 개가 바뀝니다.

위 메시지는 이미 `curatorSystemMessage`로
`src/system-messages.ts`에 작성되어 있습니다.

`src/index.ts`의 `imports` 영역을 **REPLACE**합니다.

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

새 줄 하나: `./system-messages.js`에서 가져오는 import입니다.

`src/index.ts`의 `generate` 영역을 **REPLACE**합니다.

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
      systemMessage: { mode: "replace", content: curatorSystemMessage },
    });

    await streamExhibit(
      session,
      "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

`generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된 메시지를 콘텐츠로 사용하는
replace 모드의 `systemMessage`가 추가됩니다. 프롬프트는 두 문장 대신 다섯 문장을 요청하므로,
목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두 2단계에서 남긴
그대로입니다.

**내부 살펴보기:** `src/system-messages.ts`에는 이 애플리케이션이 사용하는 모든 시스템 메시지가
들어 있으므로, 긴 텍스트가 `src/index.ts` 밖에 유지됩니다. `curatorSystemMessage`는 방금 세션에
전달한 메시지입니다. `curatorWithResearchSystemMessage`와 `researchSystemMessage`는 6단계를
위한 것입니다. `streamExhibit`와 그 120초 기본값 `generationTimeoutMs`는 모두
`src/curator.ts`에 선언되어 있으며, 6단계에서 사용하는 90초 `researchTimeoutMs`도 그 옆에
있습니다.
:::

:::language python
`main.py`를 엽니다. 이 단계에서는 영역 두 개가 바뀝니다.

위 메시지는 이미 `CURATOR_SYSTEM_MESSAGE`로 `system_messages.py`에 작성되어 있습니다.

`main.py`의 `imports` 영역을 **REPLACE**합니다.

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

새 줄 하나: `system_messages`에서 가져오는 import입니다.

`main.py`의 `generate` 영역을 **REPLACE**합니다.

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
                system_message={"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
            ) as session:
                await stream_exhibit(
                    session,
                    "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

`generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된 메시지를 콘텐츠로 사용하는
replace 모드의 `system_message`가 추가됩니다. 프롬프트는 두 문장 대신 다섯 문장을 요청하므로,
목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두 2단계에서 남긴
그대로입니다.

**내부 살펴보기:** `system_messages.py`에는 이 애플리케이션이 사용하는 모든 시스템 메시지가 들어
있으므로, 긴 텍스트가 `main.py` 밖에 유지됩니다. `CURATOR_SYSTEM_MESSAGE`는 방금 세션에 전달한
메시지입니다. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE`와 `RESEARCH_SYSTEM_MESSAGE`는 6단계를 위한
것입니다. `stream_exhibit`와 그 120초 기본값 `GENERATION_TIMEOUT_SECONDS`는 모두
`curator.py`에 선언되어 있으며, 6단계에서 사용하는 90초 `RESEARCH_TIMEOUT_SECONDS`도 그 옆에
있습니다.
:::

:::language go
`main.go`를 엽니다. 이 단계에서는 영역 하나가 바뀝니다.

위 메시지는 이미 같은 `main` 패키지에 있는 `system_messages.go`에서
`CuratorSystemMessage`로 작성되어 있습니다.

`main.go`의 `generate` 영역을 **REPLACE**합니다.

```go
	ctx := context.Background()
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write five sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

`generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된 메시지를 콘텐츠로 사용하는
replace 모드의 `SystemMessage`가 추가됩니다. 프롬프트는 두 문장 대신 다섯 문장을 요청하므로,
목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두 2단계에서 남긴
그대로입니다.

**내부 살펴보기:** `system_messages.go`에는 이 애플리케이션이 사용하는 모든 시스템 메시지가 들어
있으므로, 긴 텍스트가 `main.go` 밖에 유지됩니다. `CuratorSystemMessage`는 방금 세션에 전달한
메시지입니다. `CuratorWithResearchSystemMessage`와 `ResearchSystemMessage`는 6단계를 위한
것입니다. `GenerationTimeout`은 `curator.go`에서 `StreamExhibit` 옆에 선언된 120초 상수이며,
6단계에서 사용하는 90초 `ResearchTimeout`도 그 옆에 있습니다.
:::

:::language rust
`src/main.rs`를 엽니다. 이 단계에서는 영역 두 개가 바뀝니다.

위 메시지는 이미 `CURATOR_SYSTEM_MESSAGE`로
`src/system_messages.rs`에 작성되어 있으며, `museum_exhibit_studio` crate에서 re-export합니다.

`src/main.rs`의 `imports` 영역을 **REPLACE**합니다.

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

`src/main.rs`의 `generate` 영역을 **REPLACE**합니다.

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

`imports`에 새 이름 두 개가 추가됩니다. SDK의 `SystemMessageConfig`와 crate의
`CURATOR_SYSTEM_MESSAGE`입니다. `generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된
메시지를 콘텐츠로 사용하는 replace 모드의 `system_message`가 추가됩니다. 프롬프트는 두 문장 대신
다섯 문장을 요청하므로, 목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두
2단계에서 남긴 그대로입니다.

**내부 살펴보기:** `src/system_messages.rs`에는 이 애플리케이션이 사용하는 모든 시스템 메시지가 들어
있으므로, 긴 텍스트가 `src/main.rs` 밖에 유지됩니다. `CURATOR_SYSTEM_MESSAGE`는 방금 세션에
전달한 메시지입니다. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE`와 `RESEARCH_SYSTEM_MESSAGE`는
6단계를 위한 것입니다. `GENERATION_TIMEOUT`은 `src/lib.rs`에서 `stream_exhibit` 옆에 선언된
120초 상수이며, 6단계에서 사용하는 90초 `RESEARCH_TIMEOUT`도 그 옆에 있습니다.
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java`를 엽니다. 이 단계에서는 영역 두 개가 바뀝니다.

위 메시지는 이미 파일 옆의 `CuratorSystemMessages.java`에 `CuratorSystemMessages.CURATOR`로 작성되어 있습니다.

`src/main/java/workshop/MuseumExhibitStudio.java`의 `imports` 영역을 **REPLACE**합니다.

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

`src/main/java/workshop/MuseumExhibitStudio.java`의 `generate` 영역을 **REPLACE**합니다.

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)
                        .setSystemMessage(new SystemMessageConfig()
                                .setMode(SystemMessageMode.REPLACE)
                                .setContent(CuratorSystemMessages.CURATOR))).get();

                CuratorStreamer.streamExhibit(session,
                        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

새 import 두 개는 `SystemMessageMode`와 `SystemMessageConfig`입니다. `generate`에서 두 가지가 바뀝니다. 세션 config에는 미리 빌드된 메시지를 콘텐츠로 사용하는 `replace` 모드의 시스템 메시지가 추가됩니다. 프롬프트는 두 문장 대신 다섯 문장을 요청하므로, 목소리를 들을 수 있을 만큼 충분한 텍스트가 생깁니다. 영역의 나머지는 모두 2단계에서 남긴 그대로입니다.

**내부 살펴보기:** `CuratorSystemMessages.java`에는 이 애플리케이션이 사용하는 모든 시스템 메시지가 들어 있으므로, 긴 텍스트가 entrypoint 밖에 유지됩니다. `CURATOR`는 방금 세션에 전달한 메시지입니다. `CURATOR_WITH_RESEARCH`와 `RESEARCH`는 6단계를 위한 것입니다. 호출 중인 두 개 인수 버전의 `CuratorStreamer.streamExhibit`는 `GENERATION_TIMEOUT`을 적용합니다. 이는 `CuratorStreamer.java`에 선언된 120초 상수이며, 6단계에서 사용하는 90초 `RESEARCH_TIMEOUT`도 그 옆에 선언되어 있습니다.
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

어조가 눈에 띄게 달라집니다. 2단계의 응답과 3단계의 응답을 비교해 보십시오.

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath. A third kept watch from
        lunar orbit. They stayed on the surface for less than a day. What they carried home was
        small: rock, film, and a new sense of how far people could go.
```

다섯 문장을 요청했기 때문에 응답이 더 길어졌습니다. 주목할 변화는 목소리입니다. 도입부가
사라지고, 문체의 격이 올라가며, 추가로 도와주겠다는 말 없이 응답이 끝납니다.

## 프롬프트 바꾸기

이제 기본 코딩 어시스턴트라면 기꺼이 대답할 질문으로 범위 단락을 테스트합니다.
`generate` 영역에서 프롬프트 텍스트를 다음으로 바꿉니다.

```text
Tell me about how git worktrees work.
```

다시 실행합니다. 정확한 표현은 달라질 수 있지만, 큐레이터는 git을 설명하는 대신 요청을 거절하고
전시 작업으로 방향을 돌립니다. 시스템 메시지가 소프트웨어 엔지니어링, 코딩, 터미널, 리포지토리를
논의하지 말라고 했고, replace 모드에는 답변할 코딩 페르소나가 남아 있지 않기 때문입니다.

런타임이 그 거절을 강제한 것은 아닙니다. 모델은 지침을 따랐고, 지침은 무엇을 허용하거나
금지하지 않은 채 동작을 형성합니다. 4단계로 넘어갈 때 이 차이를 기억한 뒤, 프롬프트를 다섯
문장짜리 Apollo 11 텍스트로 되돌리십시오.

## 이해도 확인

- 이 에이전트에 `append`가 아니라 `replace`를 사용하는 이유는 무엇입니까?
- 시스템 메시지가 안정적으로 개선하는 것 하나와, 보장할 수 없는 것 하나를 말해 보십시오.
- 시스템 메시지는 큐레이터의 목소리와 범위를 설정하지만 출처에 대해서는 아무 말도 하지 않습니다.
  지금 모델은 Apollo 11에 대한 세부 사항을 어디서 가져오고 있으며, 그것이 박물관에는 왜 문제입니까?

## 자세히 알아보기

- [SDK and CLI compatibility](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  `systemMessage`가 append와 replace를 모두 지원하는지, 그리고 각 SDK가 그 밖에 무엇을 노출하는지
  확인할 수 있습니다.
- [Custom agents](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md):
  이름이 있는 에이전트에 자체 시스템 프롬프트와 자체 범위 제한 도구를 부여하는 방법을 설명합니다.
- [Custom skills](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  긴 메시지 하나 대신 지속적인 지침을 재사용 가능한 모듈로 패키징하는 방법을 설명합니다.

[승인된 사실에 근거 두기](museum-04-approved-facts.md)로 계속 진행합니다.
