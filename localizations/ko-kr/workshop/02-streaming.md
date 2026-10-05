# 2단계: 응답 스트리밍

> **소요 시간:** 10분

## 확인할 내용

스트리밍이 활성화된 세션을 구성하고 완성되는 과정을 표시합니다. 대부분의 언어 과정에서는
세션이 아직 작업 중일 때 응답 텍스트를 출력합니다. Java 과정에서도 동일한 스트리밍 세션
구성을 활성화하지만, `sendAndWait`가 반환한 완성된 어시스턴트 메시지를 출력합니다.

## 스트리밍으로 달라지는 사용자 경험

[**스트리밍(Streaming)**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)은
답변 자체를 바꾸지 않습니다. 이벤트 스트림을 구독하는 애플리케이션이 답변을 받는 시점을
바꿉니다. 하나의 완성된 메시지를 기다리는 대신 세션은 턴이 진행되는 동안 계속 이벤트를
내보냅니다.

- 어시스턴트 메시지 델타 이벤트에는 새로 생성된 응답 텍스트 조각이 각각 포함됩니다.
- 완성된 어시스턴트 메시지 이벤트에는 전체 메시지가 포함됩니다.
- 세션 유휴 이벤트는 턴과 모든 도구 작업이 완료되었음을 의미합니다.
- 세션 오류 이벤트는 실패한 턴을 보고합니다.

## 점진적 출력이 더 나은 경험을 제공하는 이유

텍스트가 도착하는 즉시 표시하면 애플리케이션의 응답성이 더 뛰어난 것처럼 느껴집니다.
이후에는 동일한 이벤트 스트림에서 로컬 도구와 MCP 도구의 활동도 표시합니다.

이제 세션 흐름은 `response deltas -> final message -> idle`입니다.

:::language dotnet
## C#에서 응답 스트리밍

### 1. 스트리밍 도우미 추가

`Helpers/ResponseStreamer.cs`를 만듭니다.

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

최종 메시지를 처리하는 분기는 런타임이 델타를 보내지 않고 완료되는 경우에 대응합니다.
오류가 발생하면 성공한 턴처럼 보이지 않도록 예외와 함께 작업을 완료합니다.

### 2. 도우미 사용

`Program.cs`에 `using HelloCopilotSDK.Helpers;`를 추가한 다음, 세션 및 응답 코드를
다음과 같이 바꿉니다.

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("\nCopilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

## 실행

```bash
dotnet run
```

프로세스가 종료되기 전에 글머리 기호 항목이 점진적으로 표시되기 시작해야 합니다.

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 텍스트가 마지막에만 표시됨 | 이 세션의 `SessionConfig`에 `Streaming = true`가 있는지 확인합니다. |
| 텍스트가 표시되기 전에 애플리케이션이 종료됨 | 도우미가 `SendAsync` 이후에 `completed.Task`를 기다리는지 확인합니다. |
| 텍스트가 두 번 출력됨 | `AssistantMessageEvent`에 `when !receivedDelta` 가드를 유지합니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`Helpers/ResponseStreamer.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

`Program.cs`:

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Streaming from Copilot ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("Copilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

</details>
:::

:::language nodejs
## TypeScript에서 응답 스트리밍

### 1. 스트리밍 도우미 살펴보기

`src/workshop.ts`를 엽니다. 스타터 프로젝트는 이미 `streamResponse`를 내보냅니다.
이 함수는 `session.on`으로 구독하고, 어시스턴트 델타를 출력하며, 최종 메시지 폴백을 유지하고,
세션 오류가 발생하면 Promise를 거부하며, 유휴 상태가 되면 완료됩니다.

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

도구 시작 및 완료 분기는 이 단계에서는 호출되지 않지만, 이후에 도구를 등록하면
유용하게 사용됩니다.

### 2. 도우미를 진입점에 연결

`src/index.ts`를 다음 내용으로 바꿉니다.

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

## 실행

```bash
npm start
```

한 문장으로 된 응답이 이벤트 콜백을 통해 점진적으로 표시되기 시작해야 합니다.

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 텍스트가 마지막에만 표시됨 | `createSession`에 `streaming: true`가 전달되는지 확인합니다. |
| 텍스트가 표시되기 전에 프로세스가 종료됨 | `streamResponse`가 완료되기 전에 `session.idle`을 기다리는지 확인합니다. |
| 텍스트가 두 번 출력됨 | `assistant.message` 분기에 `!receivedDelta` 가드를 유지합니다. |
| `./workshop.js` 모듈을 찾을 수 없음 | 소스 파일이 `workshop.ts`이더라도 도우미를 `./workshop.js`로 가져옵니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`src/workshop.ts` (`streamResponse`):

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
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
## Python에서 응답 스트리밍

### 1. 세션 이벤트 구독

`main.py`를 스트리밍을 활성화하고, `AssistantMessageDeltaData`를 처리하며,
`AssistantMessageData` 폴백을 유지하고, `SessionErrorData`를 노출하며,
`SessionIdleData`를 기다리는 비동기 진입점으로 바꿉니다.

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
)


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
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
                "Explain accessible names in three short bullet points."
            )
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

최종 메시지를 처리하는 분기는 런타임이 델타 없이 완료되는 경우에 대응합니다.
세션 오류가 발생하면 `error`를 설정하고 대기를 완료하여 턴이 성공한 것처럼 보이지 않게 합니다.

## 실행

```bash
python main.py
```

글머리 기호 항목이 이벤트 콜백을 통해 점진적으로 표시되기 시작해야 합니다.

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 텍스트가 마지막에만 표시됨 | `create_session`에 `streaming=True`가 전달되는지 확인합니다. |
| 텍스트가 표시되기 전에 프로세스가 종료됨 | `session.send` 이후에 `await done.wait()`를 호출하는지 확인합니다. |
| 텍스트가 두 번 출력됨 | `AssistantMessageData`에 `not received_delta` 가드를 유지합니다. |
| 세션 이벤트 import 오류 | `copilot.session_events`에서 이벤트 형식을 import합니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`main.py`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
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
            await session.send("Explain accessible names in three short bullet points.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Go에서 응답 스트리밍

### 1. 스트리밍 도우미 추가

`main.go`의 패키지 내용을 `session.On`으로 구독하고,
`AssistantMessageDeltaData`를 출력하며, `SendAndWait` 이후에
`AssistantMessageData` 폴백을 유지하고, 전송 오류를 반환하는 `streamResponse`
도우미로 바꿉니다.

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

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
```

### 2. 스트리밍 세션 생성 및 도우미 호출

도우미 아래에 `main`을 추가합니다.

```go
func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

## 실행

```bash
go run .
```

글머리 기호 항목이 이벤트 콜백을 통해 점진적으로 표시되기 시작해야 합니다.

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 텍스트가 마지막에만 표시됨 | `SessionConfig`에 `Streaming: copilot.Bool(true)`가 설정되어 있는지 확인합니다. |
| 프로세스가 출력 없이 종료됨 | `streamResponse`가 `SendAndWait`를 사용하고 오류를 반환하는지 확인합니다. |
| 텍스트가 두 번 출력됨 | `AssistantMessageData`를 출력하기 전에 `!receivedDelta` 가드를 유지합니다. |
| import 경로 오류 | `copilot "github.com/github/copilot-sdk/go"`를 사용합니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`main.go`:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

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
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

</details>
:::

:::language rust
## Rust에서 응답 스트리밍

### 1. 스트리밍 도우미 매크로 추가

`src/main.rs`를 `session.subscribe()`를 호출하고, `tokio::select!`로 어시스턴트
델타를 출력하며, 최종 메시지 폴백을 유지하고, 전송 완료와 `session.idle`이 모두
발생할 때까지 기다리는 `stream_response!` 매크로로 바꿉니다.

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

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
```

### 2. 스트리밍 세션 생성 및 매크로 호출

매크로 아래에 비동기 진입점을 추가합니다.

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

## 실행

```bash
cargo run
```

글머리 기호 항목이 이벤트 구독을 통해 점진적으로 표시되기 시작해야 합니다.

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 텍스트가 마지막에만 표시됨 | `create_session`을 호출하기 전에 `config.streaming = Some(true)`인지 확인합니다. |
| 텍스트가 표시되기 전에 프로세스가 종료됨 | `while !sent \|\| !idle` 루프를 유지하고 `session.idle`을 기다립니다. |
| 텍스트가 두 번 출력됨 | `"assistant.message"`에 `if !received_delta` 가드를 유지합니다. |
| 출력이 버퍼링된 것처럼 보임 | 델타 콘텐츠를 `print!`로 출력할 때마다 표준 출력을 플러시합니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`src/main.rs`:

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

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
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

</details>
:::

:::language java
## Java에서 응답 스트리밍

### 1. 세션에서 스트리밍 활성화

Java SDK 구현에서는 스트리밍이 활성화된 `SessionConfig`와 `sendAndWait`를 사용한 다음,
완성된 어시스턴트 메시지를 출력합니다. `src/main/java/workshop/AccessibilityReport.java`를
다음 내용으로 바꿉니다.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`setStreaming(true)`를 사용하면 이 단계가 다른 언어 과정과 동일하게 구성됩니다.
Java 구현은 `sendAndWait`에서 완성된 응답을 기다렸다가 턴이 끝나면 전체 메시지를 출력합니다.

## 실행

```bash
./mvnw compile exec:java
```

프로세스가 종료되기 전에 완성된 응답이 출력되어야 합니다.

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>이번 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 응답이 출력되지 않음 | `SessionConfig`에 `setStreaming(true)`가 있고 `sendAndWait`를 호출하는지 확인합니다. |
| null 응답으로 프로세스가 실패함 | `response == null` 가드를 유지하고 메시지 없이 턴이 완료되면 예외를 발생시킵니다. |
| Maven이 메인 클래스를 찾지 못함 | 스타터 디렉터리에서 `./mvnw compile exec:java`를 실행합니다. |

</details>

> **다음 조건을 충족하면 도구를 추가할 준비가 된 것입니다.** 구성된 응답 경로가 답변을 출력하고,
> 세션 오류를 숨기지 않은 채 턴을 완료합니다.

<details>
<summary>2단계 전체 구현</summary>

작성한 내용을 다음의 전체 2단계 구현과 비교합니다.

`src/main/java/workshop/AccessibilityReport.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

</details>
:::

## 이해도 확인

이벤트 스트리밍보다 완료 응답 전송 방식이 더 적합한 경우는 언제입니까?

<details>
<summary>정답 확인</summary>

점진적 출력이나 중간 이벤트가 필요하지 않은 백그라운드 작업 또는 단순한 요청/응답 코드에는
완료 응답 전송 방식을 사용합니다.

</details>

## 자세히 알아보기

- [방향 전환 및 큐잉](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  턴이 아직 실행 중일 때 방향을 바꾸거나 작업을 큐에 추가하기 위해 다른 메시지를 보냅니다.
- [세션 제한](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  세션에서 토큰 생성을 시작하기 전에 AI Credits 예산을 설정합니다.
- [사용량 및 청구 메트릭](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  동일한 이벤트 스트림에서 토큰 수, 컨텍스트 창 사용량 및 비용을 읽습니다.

[3단계: 애플리케이션 소유 지식 추가](03-local-tool.md)로 계속 진행합니다.
