# ステップ 3: キュレーターに語り口を与える

> **所要時間:** 10 分

## 作成するもの

同じストリーミング呼び出し、同じ主題です。しかし回答はチャットボットではなく、博物館のように聞こえるようになります。セッションに 1 つの[システムメッセージ](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)を与え、replace モードに切り替えます。また、2 文ではなく 5 文を求めるため、違いがわかるだけの十分なテキストがあります。

これは**アプリケーション所有ポリシー**の最初の 1 つです。プロンプトは実行ごとに変わるタスクデータです。システムメッセージは、このエージェントが何者で、何について話せて、どのような形で出力するかを示す永続的な宣言です。

## replace モードと、システムメッセージにできること・できないこと

ほとんどの SDK セッションは、汎用のコーディングアシスタントのペルソナで始まります。`replace` モードはそれを破棄して独自のペルソナをインストールするため、キュレーターは博物館の帽子をかぶったコーディングアシスタントではありません。既定のペルソナを拡張したい場合は `append` を使い、既定のペルソナが作業に適さない場合は `replace` を使います。博物館のキュレーターには適していません。

3 つ目のモードがあります。`customize` は SDK が管理するプロンプトの個別セクション (トーン、ガイドライン、コード変更ルールなど) を、残りを保ったまま上書きするため、全体を言い直さずに特定の部分だけ変更できます。既定のプロンプトがほぼ適切で、一部のセクションだけが合わないときに使います。既定の `append` モードでは、SDK が環境コンテキスト、ツールの指示、セキュリティガードレールを自動的に挿入し、CLI のペルソナも残ります。`replace` は完全な制御を渡す一方でそれらのセクションを手放すため、これから使うメッセージは自身の範囲と制限を明示しています。

システムメッセージは**ガイダンスであり、強制ではありません**。トーン、範囲、構造を形作り、モデルが脱線しないよう強く促します。ツール呼び出しを止めたり、実行時間に上限をかけたり、主張が正しいと証明したりはできません。それには許可リスト、タイムアウト、検証が必要です — ステップ 4 と 5 で扱います。

## キュレーターのシステムメッセージの内容

ランタイムは、セッション内のすべてのプロンプトの前にシステムメッセージを送信します。プロンプトは 1 つのリクエストで、システムメッセージはすべてのリクエストが従って回答される継続的な指示です。このステップ以降、キュレーターは次のシステムメッセージの下で動作します:

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

各段落には 1 つの役割があります:

- **役割。** 最初の行でモデルをキュレーターにします。replace モードでは、これが残る唯一のペルソナです。
- **語り口。** 2 番目の段落で対象読者とトーンを設定します。
- **範囲。** 3 番目の段落で、ソフトウェアの話題や自身の指示について話すことを除外し、持っていないアクセス権があると主張しないようキュレーターに指示します。
- **出力。** 最後の段落で、プロンプトが求める構造に従い、その前後に何も返さないようキュレーターに指示します。

メッセージは事実の出どころについて何も述べていないため、今のところキュレーターはモデルの記憶から書きます。ステップ 4 では、アプリケーションが所有するツールと、それを使うようキュレーターに指示するプロンプトで、そのギャップを埋めます。

## セッションにキュレーターのシステムメッセージを設定する

メッセージは長く、入力する必要のあるコードではなくアプリケーションが所有するテキストなので、他のシステムメッセージと一緒に、あらかじめ用意されたヘルパーファイルに含まれています。このステップで行う作業は構成です。replace モードでメッセージを組み込む設定を 1 つ追加します。

:::language dotnet
`Program.cs` を開きます。このステップでは 1 つのリージョンが変更されます。

上のメッセージは、`Helpers/CuratorSystemMessages.cs` の `CuratorSystemMessages.Curator` としてすでに書かれています。

`Program.cs` の `generate` リージョンを **REPLACE** します。

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

`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする replace モードの `SystemMessage` が追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `Helpers/CuratorSystemMessages.cs` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストは `Program.cs` の外に保たれます。`Curator` は、セッションに渡したばかりのメッセージです。`CuratorWithResearch` と `Research` はステップ 6 用です。ストリーミング呼び出しと、その 120 秒の既定値はどちらも `Helpers/CuratorStreamer.cs` から来ており、そこで `GenerationTimeout` と `ResearchTimeout` が宣言されています。
:::

:::language nodejs
`src/index.ts` を開きます。このステップでは 2 つのリージョンが変更されます。

上のメッセージは、`src/system-messages.ts` の `curatorSystemMessage` としてすでに書かれています。

`src/index.ts` の `imports` リージョンを **REPLACE** します。

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

新しい行は 1 行だけです: `./system-messages.js` からのインポートです。

`src/index.ts` の `generate` リージョンを **REPLACE** します。

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

`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする replace モードの `systemMessage` が追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `src/system-messages.ts` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストは `src/index.ts` の外に保たれます。`curatorSystemMessage` は、セッションに渡したばかりのメッセージです。`curatorWithResearchSystemMessage` と `researchSystemMessage` はステップ 6 用です。`streamExhibit` とその 120 秒の既定値である `generationTimeoutMs` はどちらも `src/curator.ts` で宣言されており、ステップ 6 で使う 90 秒の `researchTimeoutMs` も同じ場所にあります。
:::

:::language python
`main.py` を開きます。このステップでは 2 つのリージョンが変更されます。

上のメッセージは、`system_messages.py` の `CURATOR_SYSTEM_MESSAGE` としてすでに書かれています。

`main.py` の `imports` リージョンを **REPLACE** します。

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

新しい行は 1 行だけです: `system_messages` からのインポートです。

`main.py` の `generate` リージョンを **REPLACE** します。

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

`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする replace モードの `system_message` が追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `system_messages.py` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストは `main.py` の外に保たれます。`CURATOR_SYSTEM_MESSAGE` は、セッションに渡したばかりのメッセージです。`CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` と `RESEARCH_SYSTEM_MESSAGE` はステップ 6 用です。`stream_exhibit` とその 120 秒の既定値である `GENERATION_TIMEOUT_SECONDS` はどちらも `curator.py` で宣言されており、ステップ 6 で使う 90 秒の `RESEARCH_TIMEOUT_SECONDS` も同じ場所にあります。
:::

:::language go
`main.go` を開きます。このステップでは 1 つのリージョンが変更されます。

上のメッセージは、同じ `main` パッケージにある `system_messages.go` の `CuratorSystemMessage` としてすでに書かれています。

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

`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする replace モードの `SystemMessage` が追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `system_messages.go` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストは `main.go` の外に保たれます。`CuratorSystemMessage` は、セッションに渡したばかりのメッセージです。`CuratorWithResearchSystemMessage` と `ResearchSystemMessage` はステップ 6 用です。`GenerationTimeout` は、`curator.go` で `StreamExhibit` のそばに宣言されている 120 秒の定数で、ステップ 6 で使う 90 秒の `ResearchTimeout` も同じ場所にあります。
:::

:::language rust
`src/main.rs` を開きます。このステップでは 2 つのリージョンが変更されます。

上のメッセージは、`museum_exhibit_studio` クレートが再エクスポートしている `src/system_messages.rs` の `CURATOR_SYSTEM_MESSAGE` としてすでに書かれています。

`src/main.rs` の `imports` リージョンを **REPLACE** します。

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

`src/main.rs` の `generate` リージョンを **REPLACE** します。

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

新しい名前が `imports` に 2 つあります: SDK の `SystemMessageConfig` とクレートの `CURATOR_SYSTEM_MESSAGE` です。`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする replace モードの `system_message` が追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `src/system_messages.rs` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストは `src/main.rs` の外に保たれます。`CURATOR_SYSTEM_MESSAGE` は、セッションに渡したばかりのメッセージです。`CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` と `RESEARCH_SYSTEM_MESSAGE` はステップ 6 用です。`GENERATION_TIMEOUT` は `src/lib.rs` で `stream_exhibit` のそばに宣言されている 120 秒の定数で、ステップ 6 で使う 90 秒の `RESEARCH_TIMEOUT` も同じ場所にあります。
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java` を開きます。このステップでは 2 つのリージョンが変更されます。

上のメッセージは、ファイルの隣にある `CuratorSystemMessages.java` の `CuratorSystemMessages.CURATOR` としてすでに書かれています。

`src/main/java/workshop/MuseumExhibitStudio.java` の `imports` リージョンを **REPLACE** します。

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `generate` リージョンを **REPLACE** します。

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

新しいインポートは 2 つです: `SystemMessageMode` と `SystemMessageConfig` です。`generate` で 2 か所変更します。セッション構成に、あらかじめ用意されたメッセージを内容とする `replace` モードのシステムメッセージが追加されます。プロンプトは 2 文ではなく 5 文を求めるようになり、語り口がわかるだけの十分なテキストが得られます。リージョン内の他の部分はすべて、ステップ 2 で残したままです。

**中身を見る:** `CuratorSystemMessages.java` には、このアプリケーションで使うすべてのシステムメッセージが含まれているため、長いテキストはエントリポイントの外に保たれます。`CURATOR` は、セッションに渡したばかりのメッセージです。`CURATOR_WITH_RESEARCH` と `RESEARCH` はステップ 6 用です。呼び出している 2 引数の `CuratorStreamer.streamExhibit` は、`CuratorStreamer.java` で宣言されている 120 秒の定数 `GENERATION_TIMEOUT` を適用し、ステップ 6 で使う 90 秒の `RESEARCH_TIMEOUT` も同じ場所にあります。
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

語り口の変化ははっきり見えます。ステップ 2 の回答とステップ 3 の回答を比較します:

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath. A third kept watch from
        lunar orbit. They stayed on the surface for less than a day. What they carried home was
        small: rock, film, and a new sense of how far people could go.
```

回答が長いのは、5 文を求めたからです。注目する変化は語り口です。前置きが消え、文体が格調高くなり、さらに手伝えると申し出なくなります。

## プロンプトを変更する

ここで、既定のコーディングアシスタントなら喜んで答える質問で、範囲の段落をテストします。`generate` リージョンで、プロンプトのテキストを次のように変更します:

```text
Tell me about how git worktrees work.
```

もう一度実行します。正確な文言は異なりますが、キュレーターは git を説明する代わりに、回答を断って展示の作業に戻します。システムメッセージは、ソフトウェアエンジニアリング、コーディング、ターミナル、リポジトリについて議論しないよう指示しており、replace モードでは、答えるためのコーディングペルソナは残っていません。

ランタイムはその拒否を強制していません。モデルがガイダンスに従っただけであり、ガイダンスは何かを許可または禁止するものではなく、振る舞いを形作るものです。ステップ 4 に進む前にこの違いを覚えておき、その後プロンプトを Apollo 11 の 5 文のテキストに戻します。

## 理解度を確認する

- なぜこのエージェントでは `append` ではなく `replace` を使うのでしょうか？
- システムメッセージによって確実に改善されることを 1 つ、保証できないことを 1 つ挙げてください。
- システムメッセージはキュレーターの語り口と範囲を設定しますが、情報源については何も述べていません。モデルは今、Apollo 11 の詳細をどこから得ているのでしょうか。また、それが博物館にとって問題なのはなぜでしょうか？

## 詳細情報

- [SDK と CLI の互換性](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md): `systemMessage` が append と replace の両方をサポートすることと、各 SDK が他に何を公開しているかを確認できます。
- [カスタムエージェント](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md): 名前付きエージェントに独自のシステムプロンプトと、独自にスコープされたツールを与える方法。
- [カスタムスキル](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md): 永続的な指示を 1 つの長いメッセージではなく、再利用可能なモジュールとしてパッケージ化する方法。

続けて [ステップ 4: 承認済みの事実に基づかせる](museum-04-approved-facts.md) に進みます。
