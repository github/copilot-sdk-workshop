# 1단계: 첫 번째 큐레이터 세션

> **소요 시간:** 10분

## 빌드할 내용

약 10분 만에 터미널에서 실제 박물관 설명문을 만듭니다. Copilot 런타임에 연결하고, 대화 하나를 연 다음,
프롬프트 하나를 보내고 반환된 내용을 출력합니다.

시스템 메시지도, 사실 카탈로그도, 도구도, 인터페이스도 없습니다. 구현 대상으로 삼을 것도 없습니다.
SDK를 직접 호출하며, 미리 빌드된 큐레이터 헬퍼는 2단계에서 필요할 때까지 건드리지 않습니다.

## 클라이언트와 세션 알아보기

[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고, 모델을 호출하며, 도구를 관리합니다. **클라이언트**는 애플리케이션을 해당 런타임에
연결합니다. **세션**은 하나의 연속된 대화로, 컨텍스트를 구성하는 메시지와 도구 결과를 보관합니다.

하나의 작업을 진행하는 동안 클라이언트 하나를 계속 실행하고, 독립적인 대화마다 세션을 만듭니다.
현재 애플리케이션은 단순히 `client -> session -> printed response` 구조입니다.

## 전송하기 전에 권한 요청에 응답하기

런타임은 도구 호출 실행 허용 여부를 자체적으로 결정하지 않습니다. 애플리케이션에 묻고,
세션의 [권한 처리기(Permission handler)](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)가
응답합니다. 권한 처리기 없이 세션을 만들면 요청이 거부되는 것이 아니라 이벤트로 발생한 뒤 수동으로
처리할 때까지 보류됩니다. 따라서 실행이 중단되고, 결코 도착하지 않을 응답을 기다리게 됩니다.

모든 요청에 응답하도록 이 첫 번째 세션에 전체 승인 처리기를 지정합니다. 이 처리기는 관리형 설정이
비활성화되어 있을 때 요청을 승인하며, 안전장치가 아니라 기본값입니다. 4단계에서는 이 세션을 실제로
제한하는 요소를 살펴보고, 6단계와 7단계에서는 이 처리기를 범위가 좁고 제한적인 처리기로 교체합니다.

## 세션 작성하기

:::language dotnet
`Program.cs`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;

Console.WriteLine("=== Museum Exhibit Studio ===");
Console.WriteLine();

await using var client = new CopilotClient();
await client.StartAsync();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    ClientName = "museum-exhibit-studio",
    OnPermissionRequest = PermissionHandler.ApproveAll
});

var response = await session.SendAndWaitAsync(
    "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

if (response is null)
{
    throw new InvalidOperationException("The curator returned no content.");
}

Console.WriteLine(response.Data.Content);

await client.StopAsync();
```

`SendAndWaitAsync`는 세션이 유휴 상태가 될 때까지 차단하므로, 한 번의 호출로 완성된 응답을 받습니다.
`await using`은 종료 과정에서 세션과 클라이언트를 해제합니다. `PermissionHandler.ApproveAll`은
`GitHub.Copilot.Rpc`에서 제공되므로 두 번째 `using`이 필요합니다.

2단계부터 호출할 미리 빌드된 헬퍼는 `Helpers/CuratorFacts.cs`,
`Helpers/CuratorStreamer.cs`, `Helpers/CuratorValidation.cs`, `Helpers/CuratorSafety.cs`,
`Helpers/CuratorTerminal.cs`에 있습니다. 이 파일은 편집하지 않고 읽기만 합니다.
:::

:::language nodejs
`src/index.ts`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";

async function main(): Promise<void> {
  console.log("=== Museum Exhibit Studio ===");
  console.log();

  const client = new CopilotClient();
  await client.start();
  const session = await client.createSession({
    clientName: "museum-exhibit-studio",
    onPermissionRequest: approveAll,
  });

  const response = await session.sendAndWait({
    prompt: "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
  });
  console.log(response?.data && "content" in response.data ? response.data.content : response);

  await session.disconnect();
  await client.stop();
}

void main();
```

`sendAndWait`는 세션이 유휴 상태가 될 때까지 차단하므로, 한 번의 호출로 완성된 응답을 받습니다.
`approveAll`은 `CopilotClient`와 함께 SDK에서 가져옵니다.

이 파일과 같은 위치의 `src/curator.ts`는 2단계부터 호출할 미리 빌드된 헬퍼 모듈입니다.
이 파일은 편집하지 않고 읽기만 합니다.
:::

:::language python
`main.py`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

```python
import asyncio

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    print("=== Museum Exhibit Studio ===")
    print()

    async with CopilotClient() as client:
        async with await client.create_session(
            client_name="museum-exhibit-studio",
            on_permission_request=PermissionHandler.approve_all,
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None

            def on_event(event) -> None:
                nonlocal error
                match event.data:
                    case AssistantMessageData(content=content):
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(
                "Write two sentences of museum wall text about the Apollo 11 Moon landing."
            )
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Python에서는 하나의 차단 헬퍼를 호출하는 대신 세션 이벤트를 수신합니다. 어시스턴트 메시지를 출력하고,
세션 오류를 실패로 처리하며, 종료하기 전에 유휴 상태가 될 때까지 기다립니다. 2단계에서는 이 리스너
전체를 하나의 헬퍼 호출로 교체합니다.

이 파일과 같은 위치의 `curator.py`는 해당 교체 작업을 담당하는 미리 빌드된 헬퍼 모듈입니다.
이 파일은 편집하지 않고 읽기만 합니다.
:::

:::language go
`main.go`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

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
	})
	if err != nil {
		panic(err)
	}
	defer func() { _ = session.Disconnect() }()

	response, err := session.SendAndWait(ctx, copilot.MessageOptions{
		Prompt: "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
	})
	if err != nil {
		panic(err)
	}
	if response == nil {
		panic("The curator returned no content.")
	}
	if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
		fmt.Println(message.Content)
	}
}
```

`curator.go`는 이미 같은 `main` 패키지에 있으므로, 필요해지는 즉시 해당 헬퍼가 범위에 포함됩니다.
`SendAndWait`는 세션이 유휴 상태가 될 때까지 차단합니다.
:::

:::language rust
`src/main.rs`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::RuntimeError;

#[tokio::main]
async fn main() -> Result<(), RuntimeError> {
    println!("=== Museum Exhibit Studio ===");
    println!();

    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    let session = client.create_session(config).await?;

    let response = session
        .send_and_wait(MessageOptions::new(
            "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

`src/lib.rs`는 미리 빌드된 헬퍼를 제공하는 `museum_exhibit_studio` 라이브러리 크레이트이며,
편집하지 않습니다. 오늘은 이 라이브러리에서 `RuntimeError`라는 이름 하나를 가져옵니다. 이는
`Box<dyn Error + Send + Sync>`에 대한 크레이트의 별칭입니다. 2단계부터 호출하는 모든 헬퍼는
이 형식으로 실패를 보고하므로, 처음부터 `main`이 이 형식을 반환하게 하면 학습 과정이 확장되어도
`?`가 계속 작동합니다.

`with_permission_handler`는 업데이트된 구성을 반환하므로, 반환된 값에 나머지 필드를 계속 설정합니다.
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java`를 열고 **파일 전체를 다음 내용으로 교체합니다**.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
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
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            try {
                var response = session.sendAndWait(new MessageOptions().setPrompt(
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.")).get();
                if (response == null) {
                    throw new IllegalStateException("The curator returned no content.");
                }
                System.out.println(response.getData().content());
            } finally {
                session.close();
                client.stop().get();
            }
        }
    }
}
```

`sendAndWait`는 세션이 유휴 상태가 될 때까지 차단합니다. try-with-resources 블록은 `main`이
종료될 때 클라이언트를 닫습니다. `PermissionHandler.APPROVE_ALL`은
`com.github.copilot.rpc`에서 제공됩니다.

2단계부터 호출할 미리 빌드된 헬퍼는 파일과 같은 위치인 `src/main/java/workshop/`에 있습니다.
해당 파일은 `CuratorFacts.java`, `CuratorStreamer.java`, `CuratorValidation.java`,
`CuratorSafety.java`, `CuratorTerminal.java`입니다. 이 파일은 편집하지 않고 읽기만 합니다.
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

정확한 문구는 달라질 수 있지만, 출력은 다음과 같은 형태입니다.

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

잠시 기다리면 박물관 설명문과 비슷한 두 문장이 도착합니다. 아직 스트리밍되지 않고, 어조도 적용되지
않으며, 모델이 요청한 주제를 벗어난 내용을 생성하지 못하도록 막는 요소도 없습니다. 다음 세 단계에서
이러한 사항을 다룹니다.

## 이해도 확인

- 세션에는 보관되지만 클라이언트에는 보관되지 않는 것은 무엇입니까?
- 응답이 잠시 후 한 번에 도착했습니다. 현재 코드의 어느 부분이 이러한 동작을 유발합니까?
- 세션은 모든 권한 요청을 보류하지 않고 응답했습니다. 이로 인해 세션이 더 안전해졌습니까, 아니면
  단지 완료할 수 있게 되었습니까?
- 이 단계에서는 모델이 Apollo 11에 관해 주장할 수 있는 내용을 제한하지 않습니다. 현재 답변이 대략
  주제에 맞게 유지되도록 하는 유일한 요소는 무엇입니까?

## 자세히 알아보기

- [첫 번째 Copilot 기반 앱 빌드](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  동일한 첫 번째 클라이언트, 세션, 프롬프트를 다루는 GitHub 튜토리얼입니다.
- [세션 재개 및 지속성](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  세션이 보관하는 내용과 나중에 대화를 다시 이어가는 방법을 설명합니다.
- [인증](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  `copilot login` 이후 클라이언트가 사용할 수 있는 자격 증명을 설명합니다.

[큐레이터 응답 스트리밍](museum-02-stream-the-curator.md)으로 계속 진행합니다.
