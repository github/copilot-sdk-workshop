# 1단계: 첫 번째 Copilot 세션 만들기

> **소요 시간:** 10분

## 만들 내용

콘솔 애플리케이션을 Copilot 런타임에 연결하고, 대화를 만든 다음, 프롬프트를 전송하고
응답을 출력합니다.

:::language dotnet
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 .NET API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `CopilotClient`는 C# 코드를 이 런타임에
연결합니다.

`CopilotSession`은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는 메시지와
도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인 대화마다
세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `CopilotClient -> CopilotSession -> model response` 구조입니다.
:::

:::language nodejs
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 Node.js API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `CopilotClient`는 TypeScript 코드를 이
런타임에 연결합니다.

`createSession`에서 만든 세션은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는
메시지와 도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인
대화마다 세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `CopilotClient -> session -> model response` 구조입니다.
:::

:::language python
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 Python API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `CopilotClient`는 Python 코드를 이
런타임에 연결합니다.

`create_session`에서 만든 세션은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는
메시지와 도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인
대화마다 세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `CopilotClient -> session -> model response` 구조입니다.
:::

:::language go
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 Go API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `copilot.NewClient`는 Go 코드를 이
런타임에 연결합니다.

`CreateSession`에서 만든 세션은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는
메시지와 도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인
대화마다 세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `Client -> Session -> model response` 구조입니다.
:::

:::language rust
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 Rust API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `Client`는 Rust 코드를 이 런타임에
연결합니다.

`create_session`에서 만든 세션은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는
메시지와 도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인
대화마다 세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `Client -> session -> model response` 구조입니다.
:::

:::language java
## GitHub Copilot SDK와 런타임 알아보기

**GitHub Copilot SDK**는 애플리케이션에서 Copilot을 에이전트로 실행하는 데 사용하는 Java API입니다.
[**Copilot 런타임**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)은
프롬프트를 받고 모델을 호출하며 도구를 관리합니다. `CopilotClient`는 Java 코드를 이
런타임에 연결합니다.

`createSession`에서 만든 세션은 하나의 연속된 대화를 나타냅니다. 대화의 컨텍스트를 구성하는
메시지와 도구 결과를 보관합니다. 애플리케이션에서는 클라이언트 하나를 계속 유지하고, 독립적인
대화마다 세션을 만듭니다.

## 클라이언트와 세션을 분리하는 이유

이러한 책임을 분리하면 개별 대화가 끝난 뒤에도 런타임 연결을 유지할 수 있습니다. 또한 스트리밍과
도구를 다루기 전에 작동하는 간단한 예제를 확인할 수 있습니다.

이 시점의 콘솔 앱은 단순히 `CopilotClient -> session -> model response` 구조입니다.
:::

## 첫 번째 Copilot 세션 시작하기

:::language dotnet
`Program.cs`를 열고 **파일 전체를 바꿉니다**:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
});
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```

ping 호출은 런타임 연결을 확인합니다. 완료 응답 전송은 세션이 유휴 상태가 될 때까지 기다리므로,
최종 답변만 필요할 때 적합합니다.
:::

:::language nodejs
`src/index.ts`를 열고 **파일 전체를 바꿉니다**:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ onPermissionRequest: approveAll });
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`sendAndWait`는 세션이 유휴 상태가 될 때까지 기다리므로, 최종 답변만 필요할 때 적합합니다.
런타임이 정상적으로 종료되도록 `finally` 블록에서 항상 세션과 클라이언트를 중지합니다.
:::

:::language python
`main.py`를 열고 **파일 전체를 바꿉니다**:

```python
import asyncio

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Python은 완료된 응답을 한 번에 반환하는 도우미를 호출하는 대신 세션 이벤트를 수신합니다.
어시스턴트 메시지를 출력하고, 세션 오류를 실패로 처리하며, 종료하기 전에 유휴 이벤트를 기다립니다.
:::

:::language go
`main.go`를 열고 **파일 전체를 바꿉니다**:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```

`SendAndWait`는 세션이 유휴 상태가 될 때까지 기다리므로, 최종 답변만 필요할 때 적합합니다.
`defer`는 종료 과정에서 세션 연결을 끊고 클라이언트를 중지합니다.
:::

:::language rust
`src/main.rs`를 열고 **파일 전체를 바꿉니다**:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client
        .create_session(SessionConfig::default().with_permission_handler(permission::approve_all()))
        .await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
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

`send_and_wait`는 세션이 유휴 상태가 될 때까지 기다리므로, 최종 답변만 필요할 때 적합합니다.
반환하기 전에 세션 연결을 끊고 클라이언트를 중지합니다.
:::

:::language java
`src/main/java/workshop/AccessibilityReport.java`를 열고 **파일 전체를 바꿉니다**:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client
                    .createSession(new SessionConfig().setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`sendAndWait`는 세션이 유휴 상태가 될 때까지 기다리므로, 최종 답변만 필요할 때 적합합니다.
try-with-resources 블록은 `main`이 종료될 때 클라이언트를 닫습니다.
:::

이 세션은 권한 처리기만 설정하므로 SDK의 기본 페르소나(Persona)로 실행됩니다. 여기서 변경하지
않은 설정은 세 가지 모드를 제공하는
[시스템 메시지](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)입니다.
기본값은 `append`입니다. 작성한 콘텐츠가 SDK에서 관리하는 프롬프트 뒤에 추가되며, SDK가 주입하는
환경 컨텍스트, 도구 지침, 보안 가드레일과 함께 기본 CLI 페르소나가 유지됩니다. `replace`는 전체
프롬프트를 작성한 콘텐츠로 바꿉니다. `customize`는 나머지 부분을 유지하면서 어조, 지침, 코드 변경
규칙 등의 개별 섹션을 재정의합니다. 이 워크숍에서는 기본값을 사용하므로 표시되는 모든 답변은 표준
페르소나에서 생성됩니다. 애플리케이션에 고유한 말투나 범위가 필요할 때 나머지 두 모드를 사용합니다.

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
python main.py
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

:::language dotnet
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
=== First Copilot session ===

Connected to the Copilot runtime: ...

Copilot: An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language nodejs
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
This Copilot session is ready and waiting for your next prompt.
```
:::

:::language python
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language go
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language rust
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language java
정확한 응답은 달라질 수 있지만 출력은 다음과 같은 형태여야 합니다:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

<details>
<summary>실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 인증 또는 권한 부여 오류 | `copilot login`을 다시 실행한 다음 프로젝트를 다시 실행합니다. |
| 런타임 실행 파일을 찾을 수 없음 | 사전 점검 지침에 따라 `COPILOT_CLI_BINARY_PATH`를 설정합니다. |
| 요청 시간 초과 | GitHub Copilot에 대한 네트워크 액세스를 확인하고 다시 시도합니다. 이 예제는 실패를 숨기지 않습니다. |

</details>

> **스트리밍을 시작할 준비가 되는 시점:** 터미널에 완전한 Copilot 응답 하나가 출력됩니다.

## 이해도 확인

일반적으로 애플리케이션 수명 동안 유지해야 하는 개체는 무엇이며, 한 대화의 컨텍스트를 소유하는
개체는 무엇입니까?

:::language dotnet
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `CopilotClient`를 유지합니다. `CopilotSession`은 한 대화의 메시지와
도구 컨텍스트를 소유합니다.

</details>
:::

:::language nodejs
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `CopilotClient`를 유지합니다. `createSession`에서 만든 세션은 한 대화의
메시지와 도구 컨텍스트를 소유합니다.

</details>
:::

:::language python
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `CopilotClient`를 유지합니다. `create_session`에서 만든 세션은 한 대화의
메시지와 도구 컨텍스트를 소유합니다.

</details>
:::

:::language go
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `copilot.NewClient`에서 만든 클라이언트를 유지합니다. `CreateSession`에서
만든 세션은 한 대화의 메시지와 도구 컨텍스트를 소유합니다.

</details>
:::

:::language rust
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `Client`를 유지합니다. `create_session`에서 만든 세션은 한 대화의 메시지와
도구 컨텍스트를 소유합니다.

</details>
:::

:::language java
<details>
<summary>답 확인</summary>

런타임 연결 수명 동안 `CopilotClient`를 유지합니다. `createSession`에서 만든 세션은 한 대화의
메시지와 도구 컨텍스트를 소유합니다.

</details>
:::

:::language dotnet
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```csharp
using GitHub.Copilot;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig());
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```
</details>
:::

:::language nodejs
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```typescript
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({});
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
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
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session() as session:
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```
</details>
:::

:::language go
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```
</details>
:::

:::language rust
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client.create_session(SessionConfig::default()).await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
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
</details>
:::

:::language java
<details>
<summary>1단계 전체 구현</summary>

작성한 결과를 다음의 1단계 전체 구현과 비교합니다.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
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

## 자세히 알아보기

- [첫 번째 Copilot 기반 앱 빌드](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  동일한 첫 번째 클라이언트, 세션, 프롬프트를 다루는 GitHub 튜토리얼입니다.
- [세션 재개 및 지속성](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  세션의 대화 상태를 유지하고 다시 시작한 후 재개하는 방법을 설명합니다.
- [컨텍스트 지우기](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  새 세션을 만들지 않고 세션 내부의 대화를 바꾸는 방법을 설명합니다.
- [인증](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  `copilot login` 이후 클라이언트에서 사용할 수 있는 자격 증명을 설명합니다.

[2단계: 응답 스트리밍](02-streaming.md)으로 계속 진행합니다.
