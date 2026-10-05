# ステップ 2: キュレーターの応答をストリーミングする

> **所要時間:** 10 分

## 作成するもの

同じプロンプトですが、回答は静かな間を置いて届くのではなく、1 語ずつ表示されます。

イベントループは書きません。スターターには、あらかじめ用意されたキュレーターヘルパーとしてストリーミングプリンターがすでに付属しています。[セッションイベント](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)をサブスクライブし、各デルタを標準出力に書き込み、ツールアクティビティを報告し、セッションエラーで失敗し、タイムアウトを強制し、どの実行パスでもサブスクライブを解除し、蓄積した全文を返します。行う作業は、ストリーミングをオンにしてこれを呼び出すことです。

## キュレーターにとってストリーミングが重要な理由

展示コピーは、人が読んで判断する必要のある文章です。届く様子を見ると、実行が終わるかなり前に、語り口が適切か、モデルが水増ししているか、主題から外れているかがすぐにわかります。ストリーミングはツール呼び出しに気づく場所にもなります。これはステップ 4 以降、キュレーターが何かを書く前にアプリケーションの事実ツールを呼び出す必要があるため重要です。

ヘルパーは応答全体を文字列として返すため、ここから先はストリームが終わった後に検査できる完成済みテキストが常に手元にあります。

## ブロッキング呼び出しをストリーマーに置き換える

:::language dotnet
`Program.cs` を開きます。このステップでは 1 つのリージョンが変更されます。

`Program.cs` の `generate` リージョンを **REPLACE** します。

```csharp
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

変更は 2 つです。セッション構成の `Streaming = true` と、`CuratorStreamer.StreamExhibitAsync` です。後者は `SendAndWaitAsync` と、その応答を出力していた行の代わりに使います。ステップ 1 の権限ハンドラーは、あった場所にそのまま残ります。ヘルパーは `Helpers/CuratorStreamer.cs` にあり、編集することはありません。

**中身を見る:** `Helpers/CuratorStreamer.cs` を開き、`StreamExhibitAsync` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。`session.On<SessionEvent>` でサブスクライブし、各 `AssistantMessageDeltaEvent` チャンクが届いた瞬間に追加して書き込み、`[tool:start]` 行をすべての `ToolExecutionStartEvent` に対して、`[tool:done]` 行をすべての `ToolExecutionCompleteEvent` に対して出力し、`SessionIdleEvent` で完了し、`SessionErrorEvent` で失敗状態になります。`Task.Delay` との競争によってタイムアウトが `TimeoutException` になり、サブスクリプションはどの実行パスでも破棄されます。
:::

:::language nodejs
`src/index.ts` を開きます。このステップでは 2 つのリージョンが変更されます。

`src/index.ts` の `imports` リージョンを **REPLACE** します。

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

`src/index.ts` の `generate` リージョンを **REPLACE** します。

```typescript
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
```

`generate` での変更は 2 つです。セッション構成の `streaming: true` と、`streamExhibit` です。後者は `sendAndWait` と、その応答を出力していた行の代わりに使います。ステップ 1 の権限ハンドラーは、あった場所にそのまま残ります。ヘルパーは `src/curator.ts` にあり、編集することはありません。

**中身を見る:** `src/curator.ts` を開き、`streamExhibit` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。`session.on` でサブスクライブし、各 `assistant.message_delta` チャンクが届いた瞬間に標準出力へ書き込み、`[tool:start]` 行をすべての `tool.execution_start` イベントに対して、`[tool:done]` 行をすべての `tool.execution_complete` イベントに対して出力し、`session.idle` で Promise を解決し、`session.error` で拒否します。どちらも届かない場合は `setTimeout` が拒否し、`finish` はどの実行パスでもサブスクライブを解除します。
:::

:::language python
`main.py` を開きます。このステップでは 2 つのリージョンが変更されます。

`main.py` の `imports` リージョンを **REPLACE** します。

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

`main.py` の `generate` リージョンを **REPLACE** します。

```python
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
```

ステップ 1 のイベントリスナー全体が 1 つの呼び出しにまとまります。`stream_exhibit` は `curator.py` にあり、`AssistantMessageDeltaData`、`SessionErrorData`、`SessionIdleData` の照合をすでに行います。編集することはありません。

**中身を見る:** `curator.py` を開き、`stream_exhibit` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。`session.on` でサブスクライブし、各 `AssistantMessageDeltaData` チャンクが届いた瞬間に出力し、`[tool:start]` 行をすべての `ToolExecutionStartData` に対して、`[tool:done]` 行をすべての `ToolExecutionCompleteData` に対して出力し、自身の `done` イベントを `SessionIdleData` で設定し、`SessionErrorData` を `RuntimeError` として再送出します。`asyncio.wait_for` がタイムアウトを適用し、`finally` ブロックはどの実行パスでもサブスクライブを解除します。
:::

:::language go
`main.go` を開きます。このステップでは 1 つのリージョンが変更されます。

`main.go` の `generate` リージョンを **REPLACE** します。

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
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write two sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

変更は 2 つです。セッション構成の `Streaming: copilot.Bool(true)` と、`StreamExhibit` です。後者は `SendAndWait` と、その応答を出力していた行の代わりに使います。ステップ 1 の権限ハンドラーは、あった場所にそのまま残ります。ヘルパーは `curator.go` にあり、編集することはありません。

**中身を見る:** `curator.go` を開き、`StreamExhibit` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。`session.On` でサブスクライブし、各 `AssistantMessageDeltaData` チャンクが届いた瞬間に出力し、`[tool:start]` 行をすべての `ToolExecutionStartData` に対して、`[tool:done]` 行をすべての `ToolExecutionCompleteData` に対して出力し、`SessionErrorData` があれば記録してエラーとして返します。その後、`session.SendAndWait` を、渡されたタイムアウトから作った `context.WithTimeout` の内側で待機し、遅延された `unsubscribe` がどの実行パスでも実行されます。
:::

:::language rust
`src/main.rs` を開きます。このステップでは 2 つのリージョンが変更されます。

`src/main.rs` の `imports` リージョンを **REPLACE** します。

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

`src/main.rs` の `generate` リージョンを **REPLACE** します。

```rust
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
```

`generate` での変更は 2 つです。`config.streaming = Some(true)` と、`stream_exhibit` です。後者は `send_and_wait` と、その応答を出力していた行の代わりに使います。ステップ 1 の権限ハンドラーは、あった場所にそのまま残ります。`stream_exhibit` と `GENERATION_TIMEOUT` はどちらも `museum_exhibit_studio` クレート (`src/lib.rs`) から来ており、編集することはありません。

**中身を見る:** `src/lib.rs` を開き、`stream_exhibit` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。`session.subscribe` でサブスクライブし、各 `assistant.message_delta` チャンクが届いた瞬間に出力してフラッシュし、`[tool:start]` 行をすべての `tool.execution_start` イベントに対して、`[tool:done]` 行をすべての `tool.execution_complete` イベントに対して出力し、`session.idle` で終了し、`session.error` でエラーを返します。送信 Future、イベントストリーム、期限を同時にポーリングするため、イベントがまったく届かない場合でも、渡されたタイムアウトは有効です。
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java` を開きます。このステップでは 1 つのリージョンが変更されます。

`src/main/java/workshop/MuseumExhibitStudio.java` の `generate` リージョンを **REPLACE** します。

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)).get();

                CuratorStreamer.streamExhibit(session,
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

変更は 2 つです。セッション構成の `setStreaming(true)` と、`CuratorStreamer.streamExhibit` です。後者は `sendAndWait` と、その応答を出力していた行の代わりに使います。ステップ 1 の権限ハンドラーは、あった場所にそのまま残ります。ヘルパーはファイルの隣にある `CuratorStreamer.java` にあり、編集することはありません。

**中身を見る:** `CuratorStreamer.java` を開き、`streamExhibit` を一度読んでください。これは SDK イベントループであり、このワークショップでストリーミングが実際にどう動くかを見る最も明快な場所です。イベント型ごとに 1 つのリスナーを登録します。`AssistantMessageDeltaEvent` は各チャンクが届くと出力して蓄積し、`ToolExecutionStartEvent` と `ToolExecutionCompleteEvent` は `[tool:start]` 行と `[tool:done]` 行を出力し、`SessionIdleEvent` は行を終え、`SessionErrorEvent` は捕捉されて再スローされます。渡されたタイムアウトはミリ秒単位で `session.sendAndWait` に渡され、すべてのサブスクリプションは `finally` ブロックで閉じられます。
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

同じ種類の回答が表示されますが、今回は書き込まれていく様子を見ます:

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

テキストは一度に表示されるのではなく、その場で増えていき、最後の語の直後にプログラムが終了します。最後まで何も表示されない場合、セッションはストリーミングしていません。セッション構成にストリーミングフラグを設定したか確認してください。

## 理解度を確認する

- ストリーミングは概念上、2 つの場所でオンになります。セッション構成と、イベントを読み取るコードです。どちらを書き、どちらをヘルパーがすでに所有していましたか？
- ヘルパーは全文の応答テキストを出力しているにもかかわらず返します。ステップ 5 でその戻り値が重要になるのはなぜですか？
- モデルがいつまでもアイドル状態にならない場合、プログラムが永遠に待ち続けるのを止めるものは何ですか？

## 詳細情報

- [ステアリングとキューイング](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md): ターンのストリーミングが終わるのを待たずに、ストリーミング中に別のメッセージを送る方法です。
- [使用状況と課金メトリック](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md): プリンターがすでにサブスクライブしている同じイベントから、トークン数とコストを読み取る方法です。
- [コンテキストのクリア](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md): 使い続けたいセッション内の会話を置き換える方法です。

続けて [ステップ 3: キュレーターに語り口を与える](museum-03-curator-voice.md) に進みます。
