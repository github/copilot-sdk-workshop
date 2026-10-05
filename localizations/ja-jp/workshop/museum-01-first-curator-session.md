# ステップ 1: 最初のキュレーターセッション

> **所要時間:** 10 分

## 作成するもの

約 10 分で、ターミナルに本物の博物館向けコピーが表示されます。Copilot ランタイムに接続し、1 つの会話を開き、1 つのプロンプトを送信して、返ってきた内容を出力します。

システムメッセージはありません。事実カタログもありません。ツールもありません。インターフェイスもありません。実装対象は何もありません — SDK を直接呼び出します。スターターがすでにコードの周囲にラップしているエラーハンドラーを除けば、あらかじめ用意されたキュレーターヘルパーはステップ 2 で必要になるまで待機します。

## クライアントとセッションを理解する

[**Copilot ランタイム**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)はプロンプトを受け取り、モデルを呼び出し、ツールを管理します。**クライアント**はアプリケーションをそのランタイムに接続します。**セッション**は 1 つの継続的な会話です。コンテキストを構成するメッセージとツール結果を保持します。

1 つの作業に対して 1 つのクライアントを生かしたままにし、独立した会話ごとにセッションを作成します。現時点でのアプリケーションは単純に `client -> session -> printed response` です。

## 送信前に権限リクエストに応答する

ランタイムは、ツール呼び出しを実行してよいかどうかを独自には決めません。アプリケーションに問い合わせ、セッションの[権限ハンドラー](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)がそれに応答します。権限ハンドラーなしでセッションを作成すると、リクエストは拒否されません。イベントとして発行され、手動解決待ちのまま残るため、実行は停止し、決して届かない応答を待ちます。

この最初のセッションには approve-all ハンドラーを与え、すべてのリクエストに応答があるようにします。これはマネージド設定が無効な場合にリクエストを承認するもので、安全対策ではなく既定値です。ステップ 4 ではこのセッションを実際に制約するものを示し、ステップ 6 と 7 では、範囲を絞ったハンドラーに置き換えます。

## セッションを書く

ここから先の各コードブロックは、エントリポイント内のリージョン名と、**INSERT** または **REPLACE** のどちらかを示します。INSERT は空のリージョンを埋めます。REPLACE は、リージョンの 2 つのマーカー行の間にあるものを削除してから貼り付けることを意味します。[事前準備](museum-00-preflight.md)では、マーカー行を "編集のしくみ" の下に示しています。

:::language dotnet
`Program.cs` を開きます。このステップでは 3 つのリージョンが変更されます。

`Program.cs` の `imports` リージョンを **REPLACE** します。

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;
```

`Program.cs` の `banner` リージョンを **REPLACE** します。

```csharp
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
```

`Program.cs` の `generate` リージョンに **INSERT** します。

```csharp
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

`SendAndWaitAsync` はセッションがアイドル状態になるまでブロックするため、完了した回答を 1 回の呼び出しで取得できます。`await using` は終了時にセッションとクライアントを破棄します。`PermissionHandler.ApproveAll` は `GitHub.Copilot.Rpc` から来ており、そのため 2 つ目の `using` があります。

リージョンを囲む `try`/`catch`/`finally` はスターターに付属しています。何かが例外をスローすると、`CuratorTerminal.DescribeFailure` からのメッセージを 1 つ出力し、ゼロ以外のコードで終了します。

ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーは、`Helpers/CuratorFacts.cs`、`Helpers/CuratorStreamer.cs`、`Helpers/CuratorValidation.cs`、`Helpers/CuratorSafety.cs`、`Helpers/CuratorPrompts.cs`、`Helpers/CuratorSystemMessages.cs`、`Helpers/CuratorTerminal.cs` にあります。これらのファイルは編集せず、読むだけです。
:::

:::language nodejs
`src/index.ts` を開きます。このステップでは 3 つのリージョンが変更されます。

`src/index.ts` の `imports` リージョンを **REPLACE** します。

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure } from "./curator.js";
```

`src/index.ts` の `banner` リージョンを **REPLACE** します。

```typescript
    console.log("=== Museum Exhibit Studio ===");
    console.log();
```

`src/index.ts` の `generate` リージョンに **INSERT** します。

```typescript
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
```

`sendAndWait` はセッションがアイドル状態になるまでブロックするため、完了した回答を 1 回の呼び出しで取得できます。`approveAll` は `CopilotClient` と一緒に SDK からインポートされます。

リージョンを囲む `try`/`catch`/`finally` はスターターに付属しています。何かが例外をスローすると、`src/curator.ts` 内の `describeFailure` からのメッセージを 1 つ出力し、ゼロ以外の終了コードを設定します。

ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーモジュールは `src/curator.ts` にあり、ステップ 3 で使うシステムメッセージは `src/system-messages.ts` にあります。これらのファイルは編集せず、読むだけです。
:::

:::language python
`main.py` を開きます。このステップでは 3 つのリージョンが変更されます。

`main.py` の `imports` リージョンを **REPLACE** します。

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData

from curator import describe_failure
```

`main.py` の `banner` リージョンを **REPLACE** します。

```python
        print("=== Museum Exhibit Studio ===")
        print()
```

`main.py` の `generate` リージョンに **INSERT** します。

```python
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
```

Python は、1 つのブロッキングヘルパーを呼び出すのではなく、セッションイベントをリッスンします。アシスタントメッセージを出力し、セッションエラーを失敗として扱い、アイドル状態になるのを待ってから終了します。ステップ 2 では、このリスナー全体を 1 つのヘルパー呼び出しに置き換えます。

リージョンを囲む `try`/`except` はスターターに付属しています。何かが例外をスローすると、`curator.py` 内の `describe_failure` からのメッセージを 1 つ出力し、ゼロ以外のコードで終了します。

このファイルの隣にある `curator.py` は、ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーモジュールで、`system_messages.py` にはステップ 3 で使うシステムメッセージが入っています。これらのファイルは編集せず、読むだけです。
:::

:::language go
`main.go` を開きます。このステップでは 3 つのリージョンが変更されます。

`main.go` の `imports` リージョンを **REPLACE** します。

```go
import (
	"context"
	"fmt"
	"os"

	copilot "github.com/github/copilot-sdk/go"
)

```

`main.go` の `banner` リージョンを **REPLACE** します。

```go
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
```

`main.go` の `generate` リージョンに **INSERT** します。

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
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	response, err := session.SendAndWait(ctx, copilot.MessageOptions{
		Prompt: "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
	})
	if err != nil {
		return err
	}
	if response == nil {
		return fmt.Errorf("The curator returned no content.")
	}
	if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
		fmt.Println(message.Content)
	}
```

`SendAndWait` はセッションがアイドル状態になるまでブロックするため、完了した回答を 1 回の呼び出しで取得できます。遅延クリーンアップは終了時にセッションを切断し、クライアントを停止します。`copilot.PermissionHandler.ApproveAll` は権限リクエストに応答するため、実行は停滞しません。

リージョンを囲む `main`/`run` ラッパーとエラーハンドラーはスターターに付属しています。何かがエラーを返すと、`main` は `curator.go` 内の `DescribeFailure` からのメッセージを 1 つ出力し、ゼロ以外のコードで終了します。

ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーは `curator.go` にあり、ステップ 3 で使うシステムメッセージは `system_messages.go` にあります。これらのファイルは編集せず、読むだけです。
:::

:::language rust
`src/main.rs` を開きます。このステップでは 3 つのリージョンが変更されます。

`src/main.rs` の `imports` リージョンを **REPLACE** します。

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{RuntimeError, describe_failure};
```

`src/main.rs` の `banner` リージョンを **REPLACE** します。

```rust
    println!("=== Museum Exhibit Studio ===");
    println!();
```

`src/main.rs` の `generate` リージョンに **INSERT** します。

```rust
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
```

`send_and_wait` はセッションがアイドル状態になるまでブロックするため、完了した回答を 1 回の呼び出しで取得できます。`with_permission_handler(permission::approve_all())` は、セッションがまだ単純な間にツールリクエストが停滞しないようにします。

リージョンを囲む `main` ラッパー、`run` 関数、終了コード、エラーハンドラーはスターターに付属しています。何かが例外をスローすると、ラッパーは `src/lib.rs` 内の `describe_failure` からのメッセージを 1 つ出力し、ゼロ以外のコードで終了します。

ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーは `src/lib.rs` にあり、ステップ 3 で使うシステムメッセージは `src/system_messages.rs` にあります。これらのファイルは編集せず、読むだけです。
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java` を開きます。このステップでは 3 つのリージョンが変更されます。

`src/main/java/workshop/MuseumExhibitStudio.java` の `imports` リージョンに **INSERT** します。

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `banner` リージョンを **REPLACE** します。

```java
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `generate` リージョンに **INSERT** します。

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();

                var response = session.sendAndWait(new MessageOptions().setPrompt(
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.")).get();
                if (response == null) {
                    throw new IllegalStateException("The curator returned no content.");
                }
                System.out.println(response.getData().content());
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

`sendAndWait` はセッションがアイドル状態になるまでブロックするため、完了した回答を 1 回の呼び出しで取得できます。try-with-resources ブロックを抜けるとクライアントが閉じ、`client.stop().get()` が実行される前にセッションが閉じられます。`PermissionHandler.APPROVE_ALL` は `com.github.copilot.rpc` から来ており、そのためそのインポートがあります。

`main`/`run` のスキャフォールディング、トップレベルの `try`/`catch`/`finally`、終了コード処理はスターターに付属しています。何かが例外をスローすると、エラーハンドラーは `CuratorTerminal.describeFailure` を通じてメッセージを 1 つ出力し、ゼロ以外のコードで終了します。

ステップ 2 から呼び出し始める、あらかじめ用意されたヘルパーは、ファイルの隣の `src/main/java/workshop/` にあります: `CuratorFacts.java`、`CuratorStreamer.java`、`CuratorValidation.java`、`CuratorSafety.java`、`CuratorPrompts.java`、`CuratorSystemMessages.java`、`CuratorTerminal.java` です。これらのファイルは編集せず、読むだけです。
:::

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

正確な文言は異なりますが、出力は次のような形になります:

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

短い間を置いて、博物館らしい文章が 2 文届きます。まだ何もストリーミングされず、語り口もまだ強制されず、モデルが尋ねた主題を越えて踏み出すことを止めるものもありません。次の 3 つのステップでは、それらを扱います。

## 理解度を確認する

- セッションが保持し、クライアントが保持しないものは何ですか？
- 応答は短い間を置いて一度に届きました。現在のコードのどの部分がそれを引き起こしていますか？
- セッションはすべての権限リクエストを保留のままにせず応答しました。それによってセッションは安全になりましたか、それとも完了できるようになっただけですか？
- このステップには、モデルが Apollo 11 について主張できる内容を制限するものはありません。今のところ回答をおおむねトピック内に留めている唯一のものは何ですか？

## 詳細情報

- [最初の Copilot 搭載アプリを構築する](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started): 同じ最初のクライアント、セッション、プロンプトに関する GitHub のチュートリアルです。
- [セッションの再開と永続化](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md): セッションが保持するものと、後で会話を再開する方法です。
- [認証](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md): `copilot login` の先に進んだときにクライアントが使用できる資格情報です。

続けて [ステップ 2: キュレーターの応答をストリーミングする](museum-02-stream-the-curator.md) に進みます。
