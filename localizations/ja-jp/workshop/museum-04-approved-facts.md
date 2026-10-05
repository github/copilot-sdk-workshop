# ステップ 4: 承認済みの事実に基づかせる

> **所要時間:** 15 分

## 作成するもの

これまで、キュレーターはモデルの記憶から書いてきました。これは博物館では受け入れられません。展示ラベルは組織としての主張であり、「モデルが知っていた」は情報源ではありません。

このステップでは、教育担当者が事実を提供し、**アプリケーション**が所有するツールを通してキュレーターに渡します。あらかじめ用意された `approved_fact_lookup` ツールを登録し、それをモデルが呼び出せる唯一のツールにして、書き始める前に呼び出すようキュレーターに命じるプロンプトを書きます。また、教育担当者が 3 つの承認済みファクトセットのいずれかを選ぶか独自に入力できる、あらかじめ用意された選択ヘルパーを呼び出し、セッションのライフサイクルを以降のステップで再利用する小さなランナーにまとめます。

## 事実をプロンプト内ではなくツールの背後に置く理由

事実のリストをプロンプトテキストに貼り付けることもできます。多くのアプリケーションはそうしています。ただし、その場合、事実はモデルが自由に大まかに解釈できるリクエスト内の言葉にすぎず、モデルが必要としているかどうかにかかわらず、毎回カタログ全体を渡すことになります。

[**ローカルツール**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)は違います。アプリケーションのプロセス内で実行され、返す内容はアプリケーションのコードが決め、トランスクリプトにはモデルがそれを要求した瞬間が記録されます。`approved_fact_lookup` がそのツールです。引数は取らず、上限が定められた承認済みの事実リストを返すため、同じファクトセットで 2 回実行すると同じ質問をして同じ答えを受け取ります — グラウンディングは決定的なままです。

ヘルパーはすでにツールと上限を所有しています。`boundFacts` はすべての事実をトリミングし、空白を削除し、バッチが空、20 件を超える、または 500 文字を超える事実を含む場合に拒否します。ツールファクトリは、渡されたものが何であれそれらの上限を適用するため、モデルに上限のないリストが渡されることはありません。上限は単なる作法ではありません: 上限のない事実リストは、コスト、レイテンシ、攻撃対象領域を予測不能にします。

このツールでは `skip permission` が設定されています。教育担当者が画面で承認したばかりの、アプリケーション所有のデータを読むだけだからです。ステップ 6 の外部 Wikipedia プロセスには、代わりに権限境界を設けます。

これは、アクセシビリティトラックの `accessibility_rule_lookup` に相当する博物館版です。引数を取らない、アプリケーション所有のローカルツール 1 つが、モデルが他の方法では到達できないキュレーション済みデータを渡します。

## 2 つのリスト、2 つの異なる役割

ツールの登録には 2 つの設定が必要で、この 2 つを混同することがこのワークショップで最もよくある間違いです:

- **`tools`** には*実装*を入れます。ここでランタイムは、`approved_fact_lookup` という関数が存在することと、その実行方法を知ります。
- **`availableTools`** は*許可リスト*です。このセッションでモデルに呼び出しを許可するツール名を列挙します。登録されていても許可リストにないツールは呼び出せません。

両方が必要です。`approved_fact_lookup` だけを指定すると、他のすべてのツールも除外されます。このセッションは、ファイルリーダー、シェル、ブラウザーを提供しません。

3 つ目の要素はプロンプトで、これが最も弱い要素です。プロンプトは、ツールを呼び出し、ツールが返したものだけを使うようモデルに*依頼*します。ステップ 3 のシステムメッセージは情報源について何も述べていないため、このプロンプトが、キュレーターに事実の出どころを伝える最初の場所です。プロンプトは呼び出しを発生させるものではなく、呼び出しを止めることもできません。明示的な "call `approved_fact_lookup` first" という指示は残してください — この段階では、ツール呼び出しを確実にして、それを確認できるようにしたいからです。

**実行を制限内に保つ:** ヘルパーにすでにある **120 秒の生成タイムアウト** をセッションランナーに明示的に渡します。ランナーは後の検証のために展示テキストを返し、空の出力を拒否し、ストリームが失敗してもセッションとクライアントをクリーンアップします。これらはアプリケーションの制御であり、モデルへの指示ではありません。

## ツールを登録してプロンプトを組み立てる

:::language dotnet
`Program.cs` を開きます。このステップでは 5 つのリージョンが変更されます。`imports` リージョンには、このステップに必要なものがすでにすべて揃っています。

`Program.cs` の `choose-facts` リージョンに **INSERT** します。

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

`Program.cs` の `generate` リージョンを **REPLACE** します。

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`Program.cs` の `exhibit-prompt` リージョンに **INSERT** します。

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

`Program.cs` の `generation-config` リージョンに **INSERT** します。

```csharp
SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = CuratorStreamer.SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = CuratorSystemMessages.Curator
    }
};
```

`Program.cs` の `session-runner` リージョンに **INSERT** します。

```csharp
static async Task<string> RunSessionAsync(SessionConfig config, string prompt, TimeSpan timeout)
{
    await using var client = new CopilotClient();
    try
    {
        await client.StartAsync();
        await using var session = await client.CreateSessionAsync(config);
        var content = await CuratorStreamer.StreamExhibitAsync(session, prompt, timeout);
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("The curator returned no exhibit content.");
        }

        return content;
    }
    finally
    {
        await client.StopAsync();
    }
}
```

`RunSessionAsync` は `Helpers/CuratorStreamer.cs` の `CuratorStreamer.GenerationTimeout` を使い、`finally` でクライアントを停止する前にセッションを破棄します。`BuildExhibitPrompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`CreateApprovedFactLookup` は内部で `BoundFacts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`CuratorTerminal.ChooseApprovedFacts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`CuratorPrompts.ExhibitStructure` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`Helpers/CuratorPrompts.cs` にあります。`CuratorStreamer.SelectedModel` は任意の `COPILOT_MODEL` 環境変数を読み取ります。

**中身を見る:** `Helpers/CuratorFacts.cs` にはツールが含まれており、単なるつなぎ込みではなく実際のツール定義なので読む価値があります。`CreateApprovedFactLookup` は教育担当者が承認したばかりの上限付きリストをクロージャで捕捉し、`CopilotTool.DefineTool` を通じて `approved_fact_lookup` という名前で登録します。ハンドラーはパラメーターを取らないため、モデルは返ってくる内容を誘導できません — 要求すると、そのリストそのものを受け取ります。データはアプリケーション所有なので、`SkipPermission = true` がそこで設定されています。3 つのファクトセットと、`BoundFacts` によって適用される `MaximumFactCount` (20) および `MaximumFactLength` (500) の上限は同じファイルにあります。
:::

:::language nodejs
`src/index.ts` を開きます。このステップでは 6 つのリージョンが変更されます。新しいヘルパーが必要とするインポートから始めます。

`src/index.ts` の `imports` リージョンを **REPLACE** します。

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  chooseApprovedFacts,
  closeTerminal,
  createApprovedFactLookup,
  describeFailure,
  exhibitStructure,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

`src/index.ts` の `choose-facts` リージョンに **INSERT** します。

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

`src/index.ts` の `generate` リージョンを **REPLACE** します。

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`src/index.ts` の `exhibit-prompt` リージョンに **INSERT** します。

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

`src/index.ts` の `generation-config` リージョンに **INSERT** します。

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: selectedModel(),
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: curatorSystemMessage },
  };
}
```

`src/index.ts` の `session-runner` リージョンに **INSERT** します。

```typescript
async function runSession(
  config: SessionConfig,
  prompt: string,
  timeout: number,
): Promise<string> {
  const client = new CopilotClient();
  try {
    await client.start();
    const session = await client.createSession(config);
    try {
      const content = await streamExhibit(session, prompt, timeout);
      if (!content.trim()) throw new Error("The curator returned no exhibit content.");
      return content;
    } finally {
      await session.disconnect();
    }
  } finally {
    await client.stop();
  }
}
```

`runSession` は `src/curator.ts` の `generationTimeoutMs` をストリーマーに渡します。入れ子の `finally` ブロックはセッションを切断し、クライアントを停止します。`buildExhibitPrompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`createApprovedFactLookup` は内部で `boundFacts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`chooseApprovedFacts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`exhibitStructure` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`src/curator.ts` にあります。`selectedModel` は任意の `COPILOT_MODEL` 環境変数を読み取ります。

**中身を見る:** `src/curator.ts` にはツールが含まれており、単なるつなぎ込みではなく実際の `defineTool` 定義なので読む価値があります。`createApprovedFactLookup` は教育担当者が承認したばかりの上限付きリストをクロージャで捕捉し、`parameters: { type: "object", properties: {}, additionalProperties: false }` で `approved_fact_lookup` を定義するため、モデルは返ってくる内容を誘導できません — 要求すると、そのリストそのものを受け取ります。データはアプリケーション所有なので、`skipPermission: true` がそこで設定されています。3 つのファクトセットと、`boundFacts` によって適用される `maximumFactCount` (20) および `maximumFactLength` (500) の上限は同じファイルにあります。
:::

:::language python
`main.py` を開きます。このステップでは 6 つのリージョンが変更されます。

`main.py` の `imports` リージョンを **REPLACE** します。

```python
from __future__ import annotations

import asyncio
import sys
from collections.abc import Iterable
from typing import Any

from copilot import CopilotClient, PermissionHandler

from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    EXHIBIT_STRUCTURE,
    GENERATION_TIMEOUT_SECONDS,
    choose_approved_facts,
    create_approved_fact_lookup,
    describe_failure,
    selected_model,
    stream_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

`main.py` の `choose-facts` リージョンに **INSERT** します。

```python
        facts = choose_approved_facts()
```

`main.py` の `generate` リージョンを **REPLACE** します。

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`main.py` の `exhibit-prompt` リージョンに **INSERT** します。

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

`main.py` の `generation-config` リージョンに **INSERT** します。

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    return {
        "client_name": "museum-exhibit-studio",
        "model": selected_model(),
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
    }
```

`main.py` の `session-runner` リージョンに **INSERT** します。

```python
async def run_session(config: dict[str, Any], prompt: str, timeout: float) -> str:
    client = CopilotClient()
    try:
        await client.start()
        session = await client.create_session(**config)
        try:
            content = await stream_exhibit(session, prompt, timeout)
            if not content.strip():
                raise RuntimeError("The curator returned no exhibit content.")
            return content
        finally:
            await session.disconnect()
    finally:
        await client.stop()
```

`run_session` は `curator.py` の `GENERATION_TIMEOUT_SECONDS` をストリーマーに渡します。その `finally` ブロックはセッションを切断し、クライアントを停止します。`build_exhibit_prompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`create_approved_fact_lookup` は内部で `bound_facts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`choose_approved_facts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`EXHIBIT_STRUCTURE` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`curator.py` にあります。`selected_model` は任意の `COPILOT_MODEL` 環境変数を読み取ります。この SDK は `model=None` を受け入れるため、構成ではモデルの選択をランタイムに任せられます。

**中身を見る:** `curator.py` にはツールが含まれており、単なるつなぎ込みではなく実際の `@define_tool` 定義なので読む価値があります。`create_approved_fact_lookup` は教育担当者が承認したばかりの上限付きリストをクロージャで捕捉し、引数を取らない入れ子の `approved_fact_lookup()` をデコレートするため、モデルは返ってくる内容を誘導できません — 要求すると、そのリストそのものを受け取ります。データはアプリケーション所有なので、`skip_permission=True` がそこで設定されています。3 つのファクトセットと、`bound_facts` によって適用される `MAXIMUM_FACT_COUNT` (20) および `MAXIMUM_FACT_LENGTH` (500) の上限は同じファイルにあります。
:::

:::language go
`main.go` を開きます。このステップでは 6 つのリージョンが変更されます。

`main.go` の `imports` リージョンを **REPLACE** します。

```go
import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	copilot "github.com/github/copilot-sdk/go"
)

```

`main.go` の `choose-facts` リージョンに **INSERT** します。

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

`main.go` の `generate` リージョンを **REPLACE** します。

```go
	ctx := context.Background()
	workingDirectory, err := os.Getwd()
	if err != nil {
		return err
	}

	exhibitConfig, err := generationConfig(workingDirectory, facts)
	if err != nil {
		return err
	}

	fmt.Println()
	if _, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout); err != nil {
		return err
	}
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`main.go` の `exhibit-prompt` リージョンに **INSERT** します。

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

`main.go` の `generation-config` リージョンに **INSERT** します。

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               SelectedModel(),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

```

`main.go` の `session-runner` リージョンに **INSERT** します。

```go
func runSession(
	ctx context.Context,
	config *copilot.SessionConfig,
	prompt string,
	timeout time.Duration,
) (string, error) {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return "", err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, config)
	if err != nil {
		return "", err
	}
	defer func() { _ = session.Disconnect() }()

	content, err := StreamExhibit(session, prompt, timeout)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(content) == "" {
		return "", errors.New("The curator returned no exhibit content.")
	}
	return content, nil
}

```

`runSession` は `curator.go` の `GenerationTimeout` をストリーマーに渡し、クライアントを停止する前にセッションを切断するために `defer` を使います。`buildExhibitPrompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`ApprovedFactLookup` は内部で `BoundFacts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`curator.go` の `ChooseApprovedFacts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`ExhibitStructure` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`curator.go` にあります。`SelectedModel` は任意の `COPILOT_MODEL` 環境変数を読み取ります。

**中身を見る:** `curator.go` にはツールが含まれており、単なるつなぎ込みではなく実際の `copilot.DefineTool` 定義なので読む価値があります。`ApprovedFactLookup` は教育担当者が承認したばかりの上限付きリストをクロージャで捕捉し、引数型が `struct{}` のハンドラーを定義するため、モデルは返ってくる内容を誘導できません — 要求すると、そのリストそのものを受け取ります。データはアプリケーション所有なので、`lookup.SkipPermission = true` がそこで設定されています。3 つのファクトセットと、`BoundFacts` によって適用される `MaximumFactCount` (20) および `MaximumFactLength` (500) の上限は同じファイルにあります。
:::

:::language rust
`src/main.rs` を開きます。このステップでは 6 つのリージョンが変更されます。

`src/main.rs` の `imports` リージョンを **REPLACE** します。

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, selected_model,
    stream_exhibit,
};
```

`src/main.rs` の `choose-facts` リージョンに **INSERT** します。

```rust
    let facts = choose_approved_facts()?;
```

`src/main.rs` の `generate` リージョンを **REPLACE** します。

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`src/main.rs` の `exhibit-prompt` リージョンに **INSERT** します。

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"#
    )
}
```

`src/main.rs` の `generation-config` リージョンに **INSERT** します。

```rust
fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, RuntimeError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    Ok(config)
}
```

`src/main.rs` の `session-runner` リージョンに **INSERT** します。

```rust
async fn run_session(
    config: SessionConfig,
    prompt: String,
    timeout: Duration,
) -> Result<String, RuntimeError> {
    let client = Client::start(ClientOptions::default()).await?;
    let session_result = async {
        let session = client.create_session(config).await?;
        let stream_result = stream_exhibit(&session, prompt, timeout).await;
        let disconnect_result = session.disconnect().await;
        match (stream_result, disconnect_result) {
            (Ok(content), Ok(())) => Ok(content),
            (Err(error), _) => Err(error),
            (Ok(_), Err(error)) => Err(Box::new(error) as RuntimeError),
        }
    }
    .await;
    let stop_result = client.stop().await;
    let content = match (session_result, stop_result) {
        (Ok(content), Ok(())) => content,
        (Err(error), _) => return Err(error),
        (Ok(_), Err(error)) => return Err(Box::new(error) as RuntimeError),
    };
    if content.trim().is_empty() {
        return Err("The curator returned no exhibit content.".into());
    }
    Ok(content)
}
```

`run_session` は `src/lib.rs` の `GENERATION_TIMEOUT` をストリーマーに渡し、エラーを伝播する前にセッションを切断してクライアントを停止します。`build_exhibit_prompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`approved_fact_lookup` は内部で `bound_facts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`choose_approved_facts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`EXHIBIT_STRUCTURE` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`src/lib.rs` にあります。`selected_model` は任意の `COPILOT_MODEL` 環境変数を読み取ります。

**中身を見る:** `src/lib.rs` にはこれらすべてが含まれており、単なるつなぎ込みではなく実際のツール定義なので読む価値があります。`approved_fact_lookup` は教育担当者が承認したばかりの上限付きリストをクロージャで捕捉し、パラメータースキーマが `{"type": "object", "properties": {}, "additionalProperties": false}` の `Tool` を構築するため、モデルは返ってくる内容を誘導できません — 要求すると、そのリストそのものを受け取ります。データはアプリケーション所有なので、`.with_skip_permission(true)` がそこで設定されています。3 つのファクトセットと、`bound_facts` によって適用される `MAXIMUM_FACT_COUNT` (20) および `MAXIMUM_FACT_LENGTH` (500) の上限は同じファイルにあります。
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java` を開きます。このステップでは 6 つのリージョンが変更されます。

`src/main/java/workshop/MuseumExhibitStudio.java` の `imports` リージョンを **REPLACE** します。

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;

import java.time.Duration;
import java.util.List;
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `choose-facts` リージョンに **INSERT** します。

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `generate` リージョンを **REPLACE** します。

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

ステップ 1–3 でインラインに置いていたクライアントとセッションは、`generate` から外します。下の構成ビルダーとセッションランナーに移すことで、以降のステップで再利用できます。

`src/main/java/workshop/MuseumExhibitStudio.java` の `exhibit-prompt` リージョンに **INSERT** します。

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `generation-config` リージョンに **INSERT** します。

```java
    private static SessionConfig generationConfig(Iterable<String> approvedFacts) {
        SessionConfig config = new SessionConfig()
                .setClientName("museum-exhibit-studio")
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                .setTools(List.of(CuratorFacts.approvedFactLookup(approvedFacts)))
                .setAvailableTools(List.of(CuratorFacts.APPROVED_FACT_LOOKUP_NAME))
                .setStreaming(true)
                .setSystemMessage(new SystemMessageConfig()
                        .setMode(SystemMessageMode.REPLACE)
                        .setContent(CuratorSystemMessages.CURATOR));
        return CuratorStreamer.withSelectedModel(config);
    }
```

`src/main/java/workshop/MuseumExhibitStudio.java` の `session-runner` リージョンに **INSERT** します。

```java
    private static String runSession(SessionConfig config, String prompt, Duration timeout) throws Exception {
        try (var client = new CopilotClient()) {
            CopilotSession session = null;
            try {
                client.start().get();
                session = client.createSession(config).get();
                String content = CuratorStreamer.streamExhibit(session, prompt, timeout);
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("The curator returned no exhibit content.");
                }
                return content;
            } finally {
                try {
                    if (session != null) {
                        session.close();
                    }
                } finally {
                    client.stop().get();
                }
            }
        }
    }
```

`runSession` は `CuratorStreamer.java` の `CuratorStreamer.GENERATION_TIMEOUT` を使い、`finally` でクライアントを停止する前にセッションを閉じます。`buildExhibitPrompt` は事実を一切受け取らなくなり、代わりにツール名を指定します。`approvedFactLookup` は内部で `boundFacts` を呼び出すため、誰がツールを作っても上限は保たれます。

3 つのヘルパー呼び出しのおかげで、このステップは短くなります。`CuratorTerminal.chooseApprovedFacts` は 3 つのファクトセットを一覧表示し、選択を読み取り、事実を出力し、教育担当者が確認するか独自のものを入力したら上限付きリストを返します。`CuratorPrompts.EXHIBIT_STRUCTURE` は固定のタイトル、ナラティブ、質問のレイアウトです。ステップ 5 で同じレイアウトをチェックするため、`CuratorPrompts.java` にあります。`CuratorStreamer.withSelectedModel` は任意の `COPILOT_MODEL` 環境変数を読み取り、セッション構成に適用します。

**中身を見る:** `CuratorFacts.java` にはツールが含まれており、周辺のつなぎ込みコードではなく実際の `ToolDefinition` なので、一読する価値があります。`approvedFactLookup` は、教育担当者が直前に承認した上限付きリストに対して非公開の `ApprovedFactReader` を構築し、引数なしの `read` メソッドをバインドします。そのため、モデルは返される内容を誘導できません。問い合わせると、そのリストだけを正確に受け取ります。データはアプリケーションが所有するため、そこで `.skipPermission(true)` が設定されています。3 つの事実セットと、`boundFacts` が適用する `MAXIMUM_FACT_COUNT` (20) と `MAXIMUM_FACT_LENGTH` (500) の上限も同じファイルにあります。
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

これで、アプリケーションは何かを書き始める前に聞き取りを行い、キュレーターが一語も書く前に事実を取得する様子が見えるようになります:

```text
=== Museum Exhibit Studio ===

Approved fact sets:
1. Apollo 11
2. Great Barrier Reef
3. Terracotta Army

Choose a fact set [1-3, default 1]: 2
1. The Great Barrier Reef lies off the coast of Queensland, Australia.
2. It stretches for about 2,300 kilometres.
3. It is made up of more than 2,900 individual reefs.
4. It was added to the UNESCO World Heritage List in 1981.
5. Rising sea temperatures have caused repeated coral bleaching events.

Use these facts? [Y/n]: y

[tool:start] approved_fact_lookup
[tool:done] success=true

# A Reef the Size of a Country
## Narrative
Off the Queensland coast, more than two thousand nine hundred reefs...
## Visitor questions
1. ...
```

`[tool:start] approved_fact_lookup` 行が、このステップの要点です。キュレーターがサンゴ礁を思い出したのではありません。アプリケーションに事実を問い合わせ、アプリケーションが答えました。

## ツールが処理を担っていることを証明する

もう一度実行し、セット 1 または 3 を選びます。展示の題材が完全に変わり、そのたびにツールイベントが再び表示されます。これらの実行の間でプロンプトは何も変わっていません。同じプロンプトテキストから兵馬俑の展示が生成されたのは、ツールが別のデータを返したからです。これが、データを抱え込むプロンプトと、データを所有するアプリケーションの違いです。

次に、確認で `n` と答え、独自の事実を 2 つか 3 つ入力して、空行を送信します。すると、キュレーターはその題材について書きます。入力した事実がツールに入り、ツールがそれをモデルに返したためです。

失敗ケースも試します。`n` と答え、事実を何も入力せずにすぐ空行を送信します。実行は次のように停止します:

```text
Could not generate the exhibit: Provide at least one approved fact.
```

事実の選択処理は、教育担当者が入力した内容を上限内に収めます。また、その上限チェックは空のリストを拒否するため、セッションは一切作成されず、リクエストも送信されません。スターターに付属するエラーハンドラーがメッセージを出力し、ステータス 1 で終了します。

タイムアウトを超過した実行も、無期限に待たせるのではなく同じ方法で停止します:

```text
The curator did not respond in time. Try again.
```

通常のタイムアウトは 120 秒です。キュレーターが使用できる事実やツールは変わりません。

## 理解度を確認する

- ツールを 2 か所に登録しました。`approved_fact_lookup` をツールリストには入れたものの、許可リストから外した場合はどうなるでしょうか?
- プロンプトには "Call `approved_fact_lookup` first." と書かれています。この文は呼び出しが行われることを保証しますか? このステップで、そもそもツールを呼び出し*可能*にしたものは何でしたか?
- このツールは引数を取らず、特定の事実セットに対して常に同じ上限付きリストを返します。代わりに自由入力のクエリ引数を取るようにした場合、何を失うでしょうか?
- 出力構造はプロンプトで要求されています。ここまでで、モデルが実際にそれに従ったことを何が検証しましたか?

## 詳細情報

- [フックの使用](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md): ランタイムが各ツール呼び出しの前後で呼び出すコールバック。コードが所有する監査やポリシーに使います。
- [ツール使用後フック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md): モデルが読む前に、ツールが返した内容を検査または書き換えます。
- [コンテキストのクリアとターミナルツール](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md): ツールが会話自体に対して何を実行できるか、そしてほとんどのツールがそうすべきでない理由です。

続いて [構造を検証する](museum-06-prove-the-structure.md) に進みます。
