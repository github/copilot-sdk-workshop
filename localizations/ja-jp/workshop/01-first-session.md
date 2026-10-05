# ステップ 1: 最初の Copilot セッションを作成する

> **所要時間:** 10 分

## 作成するもの

コンソールアプリケーションを Copilot ランタイムに接続し、会話を作成し、プロンプトを送信して、応答を表示します。

:::language dotnet
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する .NET API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`CopilotClient` は C# コードをそのランタイムに接続します。

`CopilotSession` は、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `CopilotClient -> CopilotSession -> model response` です。
:::

:::language nodejs
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する Node.js API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`CopilotClient` は TypeScript コードをそのランタイムに接続します。

`createSession` から作成したセッションは、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `CopilotClient -> session -> model response` です。
:::

:::language python
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する Python API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`CopilotClient` は Python コードをそのランタイムに接続します。

`create_session` から作成したセッションは、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `CopilotClient -> session -> model response` です。
:::

:::language go
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する Go API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`copilot.NewClient` は Go コードをそのランタイムに接続します。

`CreateSession` から作成したセッションは、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `Client -> Session -> model response` です。
:::

:::language rust
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する Rust API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`Client` は Rust コードをそのランタイムに接続します。

`create_session` から作成したセッションは、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `Client -> session -> model response` です。
:::

:::language java
## GitHub Copilot SDK とランタイムについて理解する

**GitHub Copilot SDK** は、アプリケーションが Copilot をエージェントとして実行するために使用する Java API です。[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md) はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。`CopilotClient` は Java コードをそのランタイムに接続します。

`createSession` から作成したセッションは、継続する 1 つの会話を表します。会話のコンテキストを構成するメッセージとツール結果を保持します。アプリケーションでは 1 つのクライアントを維持し、独立した会話ごとにセッションを作成してください。

## クライアントとセッションを分けておく理由

これらの責任を分けておくと、ランタイム接続を個々の会話より長く存続させることができます。また、ストリーミングやツールが登場する前に、小さな動作例を確認できます。

この時点で、コンソールアプリは単純に `CopilotClient -> session -> model response` です。
:::

## 最初の Copilot セッションを起動する

:::language dotnet
`Program.cs` を開き、**ファイル全体を置き換えます**:

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

ping によってランタイム接続を検証します。完了応答の送信はセッションがアイドルになるまで待つため、完成した回答だけが必要な場合に適しています。
:::

:::language nodejs
`src/index.ts` を開き、**ファイル全体を置き換えます**:

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

`sendAndWait` はセッションがアイドルになるまで待つため、完成した回答だけが必要な場合に適しています。ランタイムがクリーンに終了するように、`finally` ブロックでは必ずセッションとクライアントを停止してください。
:::

:::language python
`main.py` を開き、**ファイル全体を置き換えます**:

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

Python では、単一の完了応答ヘルパーを呼び出す代わりに、セッションイベントをリッスンします。アシスタントメッセージを表示し、セッションエラーを失敗として扱い、終了する前にアイドルイベントを待ちます。
:::

:::language go
`main.go` を開き、**ファイル全体を置き換えます**:

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

`SendAndWait` はセッションがアイドルになるまで待つため、完成した回答だけが必要な場合に適しています。終了時に `defer` がセッションを切断し、クライアントを停止します。
:::

:::language rust
`src/main.rs` を開き、**ファイル全体を置き換えます**:

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

`send_and_wait` はセッションがアイドルになるまで待つため、完成した回答だけが必要な場合に適しています。戻る前にセッションを切断し、クライアントを停止します。
:::

:::language java
`src/main/java/workshop/AccessibilityReport.java` を開き、**ファイル全体を置き換えます**:

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

`sendAndWait` はセッションがアイドルになるまで待つため、完成した回答だけが必要な場合に適しています。try-with-resources ブロックは、`main` の終了時にクライアントを閉じます。
:::

このセッションでは権限ハンドラーだけを設定し、それ以外は設定しないため、SDK の既定のペルソナで実行されます。ここで触れていない設定が [システムメッセージ](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message) で、これには 3 つのモードがあります。`append` が既定値です。指定したコンテンツは SDK が管理するプロンプトの後に追加され、環境コンテキスト、ツール指示、SDK が注入するセキュリティガードレールとともに、既定の CLI ペルソナが保持されます。`replace` はプロンプト全体を指定したコンテンツに置き換えます。`customize` は残りを保持したまま、トーン、ガイドライン、コード変更ルールなどの個別セクションをオーバーライドします。このワークショップでは既定値のままにするため、表示されるすべての回答は標準ペルソナから生成されます。アプリケーションに独自の語り口やスコープが必要な場合は、他の 2 つのモードを使用してください。

## 実行する

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
正確な応答は異なりますが、出力は次の形になります:

```text
=== First Copilot session ===

Connected to the Copilot runtime: ...

Copilot: An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language nodejs
正確な応答は異なりますが、出力は次の形になります:

```text
This Copilot session is ready and waiting for your next prompt.
```
:::

:::language python
正確な応答は異なりますが、出力は次の形になります:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language go
正確な応答は異なりますが、出力は次の形になります:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language rust
正確な応答は異なりますが、出力は次の形になります:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language java
正確な応答は異なりますが、出力は次の形になります:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

<details>
<summary>この実行のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| 認証または承認エラー | `copilot login` をもう一度実行してから、プロジェクトを再実行します。 |
| ランタイム実行ファイルが見つからない | 事前準備の手順に従って `COPILOT_CLI_BINARY_PATH` を設定します。 |
| 要求がタイムアウトする | GitHub Copilot へのネットワークアクセスを確認して再試行します。この例では失敗を隠しません。 |

</details>

> **ストリーミングに進む準備ができる条件:** ターミナルに完全な Copilot 応答が 1 つ表示されること。

## 理解度を確認する

通常、アプリケーションの存続期間中に保持するべきオブジェクトはどれで、1 つの会話のコンテキストを所有するオブジェクトはどれですか？

:::language dotnet
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `CopilotClient` を保持します。`CopilotSession` は 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language nodejs
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `CopilotClient` を保持します。`createSession` から作成したセッションは 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language python
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `CopilotClient` を保持します。`create_session` から作成したセッションは 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language go
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `copilot.NewClient` から作成したクライアントを保持します。`CreateSession` から作成したセッションは 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language rust
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `Client` を保持します。`create_session` から作成したセッションは 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language java
<details>
<summary>回答を確認する</summary>

ランタイム接続の存続期間中は `CopilotClient` を保持します。`createSession` から作成したセッションは 1 つの会話のメッセージとツールコンテキストを所有します。

</details>
:::

:::language dotnet
<details>
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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
<summary>ステップ 1 の完全な実装</summary>

作業内容を、この完全なステップ 1 の実装と比較してください。

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

## 詳細情報

- [Copilot 搭載の初めてのアプリを構築する](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  同じ最初のクライアント、セッション、プロンプトを扱う GitHub のチュートリアル。
- [セッションの再開と永続化](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  セッションの会話状態を保持する方法と、再起動後に再開する方法。
- [コンテキストのクリア](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  新しいセッションを作成せずに、セッション内の会話を置き換えます。
- [認証](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  `copilot login` の後に進んだらクライアントが使用できる認証情報。

続いて [ステップ 2: 応答をストリーミングする](02-streaming.md) に進みます。
