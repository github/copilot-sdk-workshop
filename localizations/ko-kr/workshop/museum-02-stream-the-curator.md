# 2단계: 큐레이터 응답 스트리밍

> **소요 시간:** 10분

## 빌드할 내용

같은 프롬프트를 사용하지만, 응답이 한동안 조용히 멈춘 뒤 한꺼번에 도착하는 대신 단어마다
차례로 나타납니다.

이벤트 루프를 직접 작성하지는 않습니다. 스타터에는 미리 빌드된 큐레이터 헬퍼 안에 이미 스트리밍
출력기가 포함되어 있습니다. 이 출력기는
[session events](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)를
구독하고, 각 델타를 표준 출력에 기록하며, 도구 활동을 보고하고, 세션 오류가 발생하면 실패 처리하고,
타임아웃을 적용하며, 모든 경로에서 구독을 해제한 뒤, 누적한 전체 텍스트를 반환합니다. 여러분의
작업은 스트리밍을 켜고 이를 호출하는 것입니다.

## 큐레이터에게 스트리밍이 중요한 이유

전시 설명문은 사람이 읽고 판단해야 하는 산문입니다. 텍스트가 생성되는 모습을 보면 어조가 맞는지,
모델이 불필요하게 장황해지는지, 주제에서 벗어나고 있는지를 실행이 끝나기 훨씬 전에 바로 알 수
있습니다. 스트리밍은 도구 호출을 확인할 자리도 제공합니다. 이는 4단계 이후 중요해집니다. 그때부터는
큐레이터가 무엇이든 쓰기 전에 애플리케이션의 사실 조회 도구를 먼저 호출해야 하기 때문입니다.

헬퍼는 전체 응답을 문자열로 반환하므로, 이제부터는 스트림이 끝난 뒤에도 항상 완성된 텍스트를
검토할 수 있습니다.

## 차단 호출을 스트리머로 교체하기

:::language dotnet
`Program.cs`의 전체 내용을 다음으로 교체합니다.

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;

Console.WriteLine("=== Museum Exhibit Studio ===");
Console.WriteLine();

await using var client = new CopilotClient();
await client.StartAsync();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    ClientName = "museum-exhibit-studio",
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Streaming = true
});

await CuratorStreamer.StreamExhibitAsync(
    session,
    "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

await client.StopAsync();
```

변경점은 두 가지입니다. 세션 구성에 `Streaming = true`를 추가하고, `SendAndWaitAsync` 대신
`CuratorStreamer.StreamExhibitAsync`를 사용합니다. 1단계의 권한 처리기는 정확히 그 자리에
그대로 둡니다. 이 헬퍼는 `Helpers/CuratorStreamer.cs`에 있으며, 절대 수정하지 않습니다.

**내부 살펴보기:** `Helpers/CuratorStreamer.cs`를 열고 `StreamExhibitAsync`를 한 번 읽어
보십시오. 이 함수가 SDK 이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장
명확하게 보여 주는 지점입니다. `session.On<SessionEvent>`로 구독하고,
`AssistantMessageDeltaEvent` 청크가 도착하는 즉시 이를 이어 붙여 출력하며,
`ToolExecutionStartEvent`마다 `[tool:start]` 줄을, `ToolExecutionCompleteEvent`마다
`[tool:done]` 줄을 출력하고, `SessionIdleEvent`에서 완료되며, `SessionErrorEvent`에서는
실패 처리합니다. `Task.Delay` 경쟁으로 타임아웃을 `TimeoutException`으로 바꾸고, 모든 경로에서
구독이 해제됩니다.
:::

:::language nodejs
`src/index.ts`의 전체 내용을 다음으로 교체합니다.

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { streamExhibit } from "./curator.js";

async function main(): Promise<void> {
  console.log("=== Museum Exhibit Studio ===");
  console.log();

  const client = new CopilotClient();
  await client.start();
  const session = await client.createSession({
    clientName: "museum-exhibit-studio",
    onPermissionRequest: approveAll,
    streaming: true,
  });

  await streamExhibit(
    session,
    "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
  );

  await session.disconnect();
  await client.stop();
}

void main();
```

변경점은 두 가지입니다. 세션 구성에 `streaming: true`를 추가하고, `sendAndWait` 대신
`streamExhibit`를 사용합니다. 1단계의 권한 처리기는 정확히 그 자리에 그대로 둡니다. 이 헬퍼는
`src/curator.ts`에 있으며, 절대 수정하지 않습니다.

**내부 살펴보기:** `src/curator.ts`를 열고 `streamExhibit`를 한 번 읽어 보십시오. 이 함수가 SDK
이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장 명확하게 보여 주는
지점입니다. `session.on`으로 구독하고, `assistant.message_delta` 청크가 도착하는 즉시 이를
표준 출력에 기록하며, `tool.execution_start` 이벤트마다 `[tool:start]` 줄을,
`tool.execution_complete` 이벤트마다 `[tool:done]` 줄을 출력하고, `session.idle`에서
프라미스를 resolve하며, `session.error`에서 reject합니다. 둘 중 어느 것도 오지 않으면
`setTimeout`이 reject하고, `finish`는 모든 경로에서 구독을 해제합니다.
:::

:::language python
`main.py`의 전체 내용을 다음으로 교체합니다.

```python
import asyncio

from copilot import CopilotClient, PermissionHandler

from curator import stream_exhibit


async def main() -> None:
    print("=== Museum Exhibit Studio ===")
    print()

    async with CopilotClient() as client:
        async with await client.create_session(
            client_name="museum-exhibit-studio",
            on_permission_request=PermissionHandler.approve_all,
            streaming=True,
        ) as session:
            await stream_exhibit(
                session,
                "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
            )


if __name__ == "__main__":
    asyncio.run(main())
```

1단계의 전체 이벤트 리스너가 하나의 호출로 축약됩니다. `stream_exhibit`는 `curator.py`에 있으며,
이미 `AssistantMessageDeltaData`, `SessionErrorData`, `SessionIdleData`에 대한 매칭을
처리하므로 절대 수정하지 않습니다.

**내부 살펴보기:** `curator.py`를 열고 `stream_exhibit`를 한 번 읽어 보십시오. 이 함수가 SDK
이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장 명확하게 보여 주는
지점입니다. `session.on`으로 구독하고, `AssistantMessageDeltaData` 청크를 도착 즉시 출력하며,
`ToolExecutionStartData`마다 `[tool:start]` 줄을, `ToolExecutionCompleteData`마다
`[tool:done]` 줄을 출력하고, `SessionIdleData`에서 `done` 이벤트를 설정하며,
`SessionErrorData`는 `RuntimeError`로 다시 발생시킵니다. `asyncio.wait_for`가 타임아웃을
적용하고, `finally` 블록이 모든 경로에서 구독을 해제합니다.
:::

:::language go
`main.go`의 전체 내용을 다음으로 교체합니다.

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()

	ctx := context.Background()
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		panic(err)
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Streaming:           copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write two sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		panic(err)
	}
}
```

변경점은 두 가지입니다. 세션 구성에 `Streaming: copilot.Bool(true)`를 추가하고,
`SendAndWait` 대신 `StreamExhibit`를 사용합니다. 1단계의 권한 처리기는 정확히 그 자리에 그대로
둡니다. `StreamExhibit`와 `GenerationTimeout`은 같은 패키지의 `curator.go`에서 오며, 그 파일은
절대 수정하지 않습니다.

**내부 살펴보기:** `curator.go`를 열고 `StreamExhibit`를 한 번 읽어 보십시오. 이 함수가 SDK
이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장 명확하게 보여 주는
지점입니다. `session.On`으로 구독하고, `AssistantMessageDeltaData` 청크를 도착 즉시 출력하며,
`ToolExecutionStartData`마다 `[tool:start]` 줄을, `ToolExecutionCompleteData`마다
`[tool:done]` 줄을 출력하고, 모든 `SessionErrorData`를 기록해 오류로 반환합니다. 그런 다음
전달한 타임아웃으로 만든 `context.WithTimeout` 안에서 `session.SendAndWait`를 기다리며, 지연된
`unsubscribe`가 모든 경로에서 실행됩니다.
:::

:::language rust
`src/main.rs`의 전체 내용을 다음으로 교체합니다.

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, stream_exhibit};

#[tokio::main]
async fn main() -> Result<(), RuntimeError> {
    println!("=== Museum Exhibit Studio ===");
    println!();

    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

변경점은 두 가지입니다. `config.streaming = Some(true)`를 추가하고, `send_and_wait` 대신
`stream_exhibit`를 사용합니다. 1단계의 권한 처리기는 정확히 그 자리에 그대로 둡니다.
`stream_exhibit`와 `GENERATION_TIMEOUT`은 모두 `src/lib.rs`의 `museum_exhibit_studio`
크레이트에서 오며, 그 파일은 절대 수정하지 않습니다.

**내부 살펴보기:** `src/lib.rs`를 열고 `stream_exhibit`를 한 번 읽어 보십시오. 이 함수가 SDK
이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장 명확하게 보여 주는
지점입니다. `session.subscribe`로 구독하고, `assistant.message_delta` 청크를 도착 즉시
출력하고 flush하며, `tool.execution_start` 이벤트마다 `[tool:start]` 줄을,
`tool.execution_complete` 이벤트마다 `[tool:done]` 줄을 출력하고, `session.idle`에서
종료되며, `session.error`에서는 오류를 반환합니다. 전송 future, 이벤트 스트림, 마감 시각을 함께
poll하므로, 이벤트가 전혀 오지 않더라도 전달한 타임아웃이 유지됩니다.
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java`의 전체 내용을 다음으로 교체합니다.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class MuseumExhibitStudio {
    private MuseumExhibitStudio() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();

        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setClientName("museum-exhibit-studio")
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                    .setStreaming(true)).get();
            try {
                CuratorStreamer.streamExhibit(session,
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                session.close();
                client.stop().get();
            }
        }
    }
}
```

변경점은 두 가지입니다. 세션 구성에 `setStreaming(true)`를 추가하고, `sendAndWait` 대신
`CuratorStreamer.streamExhibit`를 사용합니다. 1단계의 권한 처리기는 정확히 그 자리에 그대로
둡니다. 이 헬퍼는 파일 옆의 `CuratorStreamer.java`에 있으며, 절대 수정하지 않습니다.

**내부 살펴보기:** `CuratorStreamer.java`를 열고 `streamExhibit`를 한 번 읽어 보십시오. 이 함수가
SDK 이벤트 루프이며, 이 워크숍에서 스트리밍이 실제로 어떻게 동작하는지 가장 명확하게 보여 주는
지점입니다. 이벤트 형식마다 하나의 리스너를 등록합니다. `AssistantMessageDeltaEvent`는 각
청크를 도착 즉시 출력하고 누적하며, `ToolExecutionStartEvent`와 `ToolExecutionCompleteEvent`는
`[tool:start]`와 `[tool:done]` 줄을 출력하고, `SessionIdleEvent`는 줄을 마무리하며,
`SessionErrorEvent`는 캡처되어 다시 throw됩니다. 전달하는 타임아웃은 밀리초 단위로
`session.sendAndWait`에 전달되며, 모든 구독은 `finally` 블록에서 닫힙니다.
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

이번에도 비슷한 종류의 응답이 나오지만, 이번에는 작성되는 과정을 직접 볼 수 있습니다.

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

텍스트가 한꺼번에 나타나는 대신 같은 자리에서 점점 늘어나며, 마지막 단어가 출력된 직후 프로그램이
종료됩니다. 맨 끝까지 아무것도 보이지 않는다면 세션이 스트리밍되지 않는 것입니다. 세션 구성에
스트리밍 플래그를 설정했는지 확인하십시오.

## 이해도 확인

- 스트리밍은 개념적으로 두 곳에서 켜집니다. 세션 구성과 이벤트를 읽는 코드입니다. 여러분이 작성한
  것은 어느 쪽이고, 헬퍼가 이미 담당하고 있던 것은 어느 쪽입니까?
- 헬퍼는 응답을 출력했는데도 전체 응답 텍스트를 반환합니다. 이 반환값이 5단계에서 왜 중요합니까?
- 모델이 유휴 상태가 되지 않으면 프로그램이 영원히 기다리지 않도록 막는 것은 무엇입니까?

## 자세히 알아보기

- [Steering and queueing](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  턴 스트리밍이 끝나기를 기다리지 않고, 스트리밍 도중 다른 메시지를 보내는 방법을 설명합니다.
- [Usage and billing metrics](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  출력기가 이미 구독 중인 동일한 이벤트에서 토큰 수와 비용을 읽는 방법을 설명합니다.
- [Context clearing](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  계속 사용할 세션 안에서 대화를 교체하는 방법을 설명합니다.

[큐레이터에 목소리 부여하기](museum-03-curator-voice.md)로 계속 진행합니다.
