# ステップ 2: 応答をストリーミングする

> **所要時間:** 10 分

## 表示される内容

ストリーミング対応のセッションを構成し、応答の生成過程を見えるようにします。ほとんどの言語トラックでは、セッションがまだ処理中の間に応答テキストを出力します。Java トラックでは同じストリーミングセッション構成を有効にし、`sendAndWait` から返された完了済みのアシスタントメッセージを出力します。

## ストリーミングで体験がどう変わるか

[**ストリーミング**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)は回答を変えるものではありません。イベントストリームを購読するアプリケーションが、その回答を受け取るタイミングを変えます。完了した 1 件のメッセージを待つ代わりに、セッションはターン全体を通してイベントを発行します:

- アシスタントメッセージのデルタイベントには、応答テキストの新しい断片がそれぞれ含まれます。
- 完了済みアシスタントメッセージイベントには、メッセージ全体が含まれます。
- セッションアイドルイベントは、ターンとツール作業が完了したことを意味します。
- セッションエラーイベントは、失敗したターンを報告します。

## 段階的な出力が快適に感じられる理由

テキストが届く様子が見えると、アプリケーションの応答性が高く感じられます。後ほど、同じイベントストリームにローカルツールと MCP ツールからのアクティビティが表示されます。

セッションの流れは `response deltas -> final message -> idle` になりました。

:::language dotnet
## C# で応答をストリーミングする

### 1. ストリーミングヘルパーを追加する

`Helpers/ResponseStreamer.cs` を作成します:

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

最終メッセージのケースは、デルタを送信せずに完了するランタイムに対応します。エラーの場合は、成功したターンのように見せるのではなく、例外でタスクを完了します。

### 2. ヘルパーを使用する

`Program.cs` で `using HelloCopilotSDK.Helpers;` を追加し、セッションと応答のコードを次の内容に置き換えます:

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

## 実行する

```bash
dotnet run
```

プロセスが終了する前に、箇条書きが段階的に表示され始めるはずです:

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| テキストが最後にだけ表示される | `Streaming = true` がこのセッションの `SessionConfig` にあることを確認します。 |
| テキストが表示される前にアプリケーションが終了する | ヘルパーが `completed.Task` を `SendAsync` の後で await していることを確認します。 |
| テキストが 2 回出力される | `when !receivedDelta` ガードを `AssistantMessageEvent` で維持します。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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
## TypeScript で応答をストリーミングする

### 1. ストリーミングヘルパーを確認する

`src/workshop.ts` を開きます。スターターはすでに `streamResponse` をエクスポートしており、`session.on` で購読し、アシスタントのデルタを出力し、最終メッセージのフォールバックを保持し、セッションエラーを拒否し、アイドル時に解決します:

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

ツール開始と完了の分岐は、このステップでは何も出力せず、後でツールを登録すると役立ちます。

### 2. ヘルパーをエントリポイントに接続する

`src/index.ts` を次の内容に置き換えます:

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

## 実行する

```bash
npm start
```

1 文の応答が、イベントコールバックを通じて段階的に表示され始めるはずです:

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| テキストが最後にだけ表示される | `streaming: true` が `createSession` に渡されていることを確認します。 |
| テキストが表示される前にプロセスが終了する | `streamResponse` が解決前に `session.idle` を待つことを確認します。 |
| テキストが 2 回出力される | `!receivedDelta` ガードを `assistant.message` 分岐で維持します。 |
| モジュール `./workshop.js` が見つからない | ヘルパーは `./workshop.js` としてインポートします。ソースファイルが `workshop.ts` であってもそうします。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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
## Python で応答をストリーミングする

### 1. セッションイベントを購読する

`main.py` を、ストリーミングを有効にし、`AssistantMessageDeltaData` を処理し、`AssistantMessageData` フォールバックを保持し、`SessionErrorData` を表面化し、`SessionIdleData` を待つ async エントリポイントに置き換えます:

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

最終メッセージのケースは、デルタなしで完了するランタイムに対応します。セッションエラーが発生すると `error` が設定され、待機が完了するため、ターンが成功したようには見えません。

## 実行する

```bash
python main.py
```

箇条書きがイベントコールバックを通じて段階的に表示され始めるはずです:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| テキストが最後にだけ表示される | `streaming=True` が `create_session` に渡されていることを確認します。 |
| テキストが表示される前にプロセスが終了する | `await done.wait()` を `session.send` の後で実行していることを確認します。 |
| テキストが 2 回出力される | `not received_delta` ガードを `AssistantMessageData` で維持します。 |
| セッションイベントのインポートエラー | イベント型を `copilot.session_events` からインポートします。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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
## Go で応答をストリーミングする

### 1. ストリーミングヘルパーを追加する

`main.go` で、パッケージの内容を `streamResponse` ヘルパーに置き換えます。このヘルパーは `session.On` で購読し、`AssistantMessageDeltaData` を出力し、`AssistantMessageData` の最終メッセージフォールバックを `SendAndWait` の後に保持し、送信エラーを返します:

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

### 2. ストリーミングセッションを作成してヘルパーを呼び出す

`main` をヘルパーの下に追加します:

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

## 実行する

```bash
go run .
```

箇条書きがイベントコールバックを通じて段階的に表示され始めるはずです:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| テキストが最後にだけ表示される | `Streaming: copilot.Bool(true)` が `SessionConfig` で設定されていることを確認します。 |
| プロセスが出力なしで終了する | `streamResponse` が `SendAndWait` を使用し、そのエラーを返すことを確認します。 |
| テキストが 2 回出力される | `!receivedDelta` ガードを `AssistantMessageData` を出力する前に維持します。 |
| インポートパスエラー | `copilot "github.com/github/copilot-sdk/go"` を使用します。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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
## Rust で応答をストリーミングする

### 1. ストリーミングヘルパーマクロを追加する

`src/main.rs` を `stream_response!` マクロに置き換えます。このマクロは `session.subscribe()` を呼び出し、`tokio::select!` でアシスタントのデルタを出力し、最終メッセージのフォールバックを保持し、送信完了と `session.idle` の両方が発生するまで待ちます:

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

### 2. ストリーミングセッションを作成してマクロを呼び出す

async エントリポイントをマクロの下に追加します:

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

## 実行する

```bash
cargo run
```

箇条書きがイベント購読を通じて段階的に表示され始めるはずです:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| テキストが最後にだけ表示される | `config.streaming = Some(true)` を `create_session` の前に確認します。 |
| テキストが表示される前にプロセスが終了する | `while !sent \|\| !idle` ループを維持し、`session.idle` を待ちます。 |
| テキストが 2 回出力される | `if !received_delta` ガードを `"assistant.message"` で維持します。 |
| 出力がバッファリングされているように見える | デルタ内容の各 `print!` の後に stdout をフラッシュします。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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
## Java で応答をストリーミングする

### 1. セッションでストリーミングを有効にする

Java SDK の実装では、ストリーミング対応の `SessionConfig` と `sendAndWait` を使用し、完了したアシスタントメッセージを出力します。`src/main/java/workshop/AccessibilityReport.java` を次の内容に置き換えます:

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

`setStreaming(true)` は、このステップを他の言語トラックと揃えます。Java の実装は `sendAndWait` から完了済みの応答を待ち、ターンが完了したときにその完全なメッセージを出力します。

## 実行する

```bash
./mvnw compile exec:java
```

完了した応答は、プロセスが終了する前に出力されるはずです:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| 応答が出力されない | `setStreaming(true)` が `SessionConfig` で有効で、`sendAndWait` を呼び出していることを確認します。 |
| プロセスが null 応答で失敗する | `response == null` ガードを維持し、ターンがメッセージなしで完了したら throw します。 |
| Maven がメインクラスを見つけられない | スターターディレクトリから `./mvnw compile exec:java` を実行します。 |

</details>

> **ツールを追加する準備ができています:** 構成した応答パスが回答を出力し、セッションエラーを隠さずにターンを完了できる場合。

<details>
<summary>ステップ 2 の完全な実装</summary>

このステップ 2 の完全な実装と自分の作業を比較します。

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

## 理解度を確認する

完了済み応答の送信がイベントストリーミングより適しているのはどのような場合ですか?

<details>
<summary>回答を確認する</summary>

段階的な出力や中間イベントが不要なバックグラウンド作業や単純なリクエスト/レスポンスコードには、完了済み応答の送信を使用します。

</details>

## 詳細情報

- [ステアリングとキューイング](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  ターンがまだ実行中の間に、別のメッセージを送信して、リダイレクトしたり作業をキューに入れたりします。
- [セッション制限](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  セッションがトークンの生成を開始する前に、AI Credits 予算を設定します。
- [使用状況と課金メトリック](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  同じイベントストリームからトークン数、コンテキストウィンドウの使用状況、コストを読み取ります。

続いて [ステップ 3: アプリケーションが所有する知識を追加する](03-local-tool.md) に進みます。
