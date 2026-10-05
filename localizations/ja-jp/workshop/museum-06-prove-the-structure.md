# ステップ 5: 構造を検証する

> **所要時間:** 10 分

## 作成するもの

すべての展示の下に出力される PASS/FAIL レポートです。新しいコードは 2 行だけです。セッションランナーがすでに返していたテキストをキャプチャし、それをあらかじめ用意されたバリデーターに渡します。

## 決定論的なチェックで証明できることとできないこと

ヘルパーモジュールのバリデーターは、モデルを含まない通常のコードです。同じテキストが渡されると、常に同じ判定を返します。チェックする内容は次のとおりです:

- レベル 1 タイトルがちょうど 1 つあること
- `## Narrative` セクションがあること
- 100～140 語のナラティブ
- 番号付き項目がちょうど 3 つある `## Visitor questions` セクション
- すべての番号付き項目が疑問符で終わること
- 禁止語彙 (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`) がないこと

これは**構造**に関する契約であり、実際に適用できます。**事実**に関する契約ではありません。完全に構造化された展示でも、承認済みの事実で裏付けられていない主張が含まれることはあります。レポートは最後にそのことを述べます。その文こそが、このアプリケーションの誠実な境界です:

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

ここでバリデーターを書くわけではありません。機械の判定に*反応*すること、そしてそれが何をカバーしていないかを正確に把握することが、このレッスンです。

## バリデーターを接続する

:::language dotnet
`Program.cs` を開きます。このステップでは 2 つのリージョンが変わります。

`Program.cs` の `generate` リージョンを **REPLACE** します。

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

`generate` での変更は 1 つです: `RunSessionAsync` がすでに返していたテキストを、今度は `exhibit` に保持します。

`Program.cs` の `validate` リージョンに **INSERT** します。

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` はすでに `MuseumExhibitStudio.Helpers` 名前空間にあり、その名前空間は `imports` リージョンで取り込まれるため、ファイルの先頭に新しく追加するものはありません。

**中身を見る:** `Helpers/CuratorValidation.cs` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`ValidateExhibit` はテキストを行に分割し、`TitlePattern` の一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、`WordPattern` でナラティブの語数を数え、`QuestionPattern` で番号付き項目を収集し、テキスト全体から `ProhibitedVocabulary` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `Errors` に追加し、`FormatValidation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
:::

:::language nodejs
`src/index.ts` を開きます。このステップでは 3 つのリージョンが変更されます。

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
  formatValidation,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
  validateExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

`src/index.ts` の `generate` リージョンを **REPLACE** します。

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

`generate` での変更は 1 つです: `runSession` がすでに返していたテキストを、今度は `exhibit` に保持します。

`src/index.ts` の `validate` リージョンに **INSERT** します。

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

検証ヘルパーは `src/curator.ts` から来るため、ファイル先頭での唯一の変更はヘルパーの import です。

**中身を見る:** `src/curator.ts` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`validateExhibit` はテキストを行に分割し、`titlePattern` の一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、`wordPattern` でナラティブの語数を数え、`questionPattern` で番号付き項目を収集し、テキスト全体から `prohibitedVocabulary` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `errors` に追加し、`formatValidation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
:::

:::language python
`main.py` を開きます。このステップでは 3 つのリージョンが変更されます。

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
    format_validation,
    selected_model,
    stream_exhibit,
    validate_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

`main.py` の `generate` リージョンを **REPLACE** します。

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

`generate` での変更は 1 つです: `run_session` がすでに返していたテキストを、今度は `exhibit` に保持します。

`main.py` の `validate` リージョンに **INSERT** します。

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` と `validate_exhibit` は `curator.py` から来るため、imports リージョンで両方のヘルパーを指定するようになりました。

**中身を見る:** `curator.py` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`validate_exhibit` はテキストを行に分割し、`_TITLE_PATTERN` の一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、`_WORD_PATTERN` でナラティブの語数を数え、`_QUESTION_PATTERN` で番号付き項目を収集し、テキスト全体から `PROHIBITED_VOCABULARY` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `errors` に追加し、`format_validation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
:::

:::language go
`main.go` を開きます。このステップでは 2 つのリージョンが変わります。

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
	exhibit, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout)
	if err != nil {
		return err
	}
```

`generate` での変更は 1 つです: `runSession` がすでに返していたテキストを、今度は `exhibit` に保持します。

`main.go` の `validate` リージョンに **INSERT** します。

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` と `ValidateExhibit` は同じパッケージの `curator.go` にあるため、追加する import はありません。

**中身を見る:** `curator.go` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`ValidateExhibit` はテキストを行に分割し、タイトルパターンの一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、ナラティブの語数を数え、番号付き項目を収集し、小文字化したテキストから `prohibitedVocabulary` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `validation.Errors` に追加し、`FormatValidation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
:::

:::language rust
`src/main.rs` を開きます。このステップでは 3 つのリージョンが変更されます。

`src/main.rs` の `imports` リージョンを **REPLACE** します。

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, format_validation,
    selected_model, stream_exhibit, validate_exhibit,
};
```

`src/main.rs` の `generate` リージョンを **REPLACE** します。

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

`generate` での変更は 1 つです: `run_session` がすでに返していたテキストを、今度は `exhibit` に保持します。

`src/main.rs` の `validate` リージョンに **INSERT** します。

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` と `validate_exhibit` は `src/lib.rs` から来るため、レポートが出力される前に `imports` リージョンでそれらを取り込みます。

**中身を見る:** `src/lib.rs` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`validate_exhibit` はテキストを行に分割し、タイトルパターンの一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、ナラティブの語数を数え、番号付き項目を収集し、小文字化したテキストから `PROHIBITED_VOCABULARY` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `errors` にプッシュし、`format_validation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java` を開きます。このステップでは 2 つのリージョンが変更されます。

`src/main/java/workshop/MuseumExhibitStudio.java` の `generate` リージョンを **REPLACE** します。

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

`generate` での変更は 1 つです: `runSession` がすでに返していたテキストを、今度は `exhibit` に保持します。

`src/main/java/workshop/MuseumExhibitStudio.java` の `validate` リージョンに **INSERT** します。

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` は同じ `workshop` パッケージ内にあるため、ファイルの先頭に新しく追加するものはありません。

**中身を見る:** `CuratorValidation.java` は、「これを証明するのはアプリケーションであり、モデルではない」ことへの具体的な答えです。`validateExhibit` はテキストを行に分割し、`TITLE_PATTERN` の一致数を数え、`## Narrative` と `## Visitor questions` の見出しを探し、`WORD_PATTERN` でナラティブの語数を数え、`QUESTION_PATTERN` で番号付き項目を収集し、小文字化したテキストから `PROHIBITED_VOCABULARY` の 5 つの用語をスキャンします。失敗した各ルールは平文の文を `errors` に追加し、`formatValidation` がそれらを出力するレポートにレンダリングします。どの時点でもモデルは関与しません。
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

展示はこれまでどおりストリーミングされ、その下に判定が表示されます:

```text
Structural checks passed.
- One level-one title: true
- Narrative section: true
- Narrative length: 126 words (within 100-140: true)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

失敗する実行も同じくらい参考になります。いずれ目にするはずです。通常の原因はナラティブの長さです:

```text
Structural checks found issues:
- One level-one title: true
- Narrative section: true
- Narrative length: 163 words (within 100-140: false)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none
  - The narrative must contain 100-140 words; found 163.

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

実行はそれでも正常に終了します。これは意図的です。レポートは、公開するかどうかを判断する人間のキュレーター向けであり、ビルドゲートではありません。展示を再実行するか、事実リストを絞り込んで、もう一度試してください。

語彙ルールが作動する様子を見るために、意図的に失敗を発生させます。独自の事実を 1 つだけ指定します:

```text
The museum's ticketing terminal was installed in 1998.
```

展示は `terminal` という語を繰り返し、レポートがそれを指摘します。チェックが読むのは出力であり、意図ではありません。

## 理解度を確認する

- レポートは構造が合格したと述べています。展示について、何を伝えて*いない*でしょうか?
- 構造上の失敗はプログラムを停止しません。どのような場合にそれを致命的な失敗扱いにするのが正しく、どのような場合に誤りでしょうか?
- バリデーターは決定論的です。それが、少し賢いモデルベースのレビュアーよりも、博物館にとって重要なのはなぜでしょうか?

## 詳細情報

- [ユーザープロンプト送信フック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md): ランタイムがプロンプトを送信する前に、コードでプロンプトをチェックまたは拒否します。
- [ユーザープロンプト変換フック](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md): ランタイムが実際に構築したモデル向けプロンプトを読み取ります。
- [フックの概要](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md): 後から実行するチェックではなく、ランタイムが適用するチェックが必要な場合に、各フックがターン内のどこに位置するかを示します。

続いて [Wikipedia MCP で調査する](museum-07-wikipedia-research.md) に進みます。
