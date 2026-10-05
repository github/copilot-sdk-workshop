# ステップ 7: アプリケーションを実行して説明する

> **所要時間:** 10 分

## 説明できるようになること

完全なアプリケーションを実行し、その状態、ツール境界、権限境界、レポートの制限事項を説明します。

## エージェントシステム全体を見る

:::language dotnet
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

完成したレポートは、[`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report) にもあります。
:::

:::language python
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

完成したレポートは、[`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report) にもあります。
:::

:::language go
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
完成版アプリはエージェントホストです。そのセッションは、モデル、アプリケーション所有の関数、別プロセスで実行されるブラウザーを調整します。

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## このワークショップを超えて設計を活用する

これらの境界を理解すると、ワークショップコードを再現するだけでなく、別のアプリケーションで設計を再利用できます。データベース検索、デプロイサービス、Issue トラッカーでは異なるツールを使用する場合がありますが、同じ所有権と信頼の問いが当てはまります。

:::language dotnet
完全なフローは `URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report` です。
:::

:::language nodejs
完全なフローは `URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report` です。
:::

:::language python
完全なフローは `URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report` です。
:::

:::language go
完全なフローは `URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report` です。
:::

:::language rust
完全なフローは `URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report` です。
:::

:::language java
完全なフローは `URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report` です。
:::

## 勝利の一周をする

変更するコードはありません。この実行で構築したアプリケーションをテストできるように、ステップ 6 の実装を維持します。

## 実行する

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Java local-demo の警告:** この明示的なフラグは、[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273) に対する一時的な回避策です。このフラグがない場合、コールバックは権限ペイロードから正確な URL を検証できない限り、フェイルクローズします。このフラグがある場合、セッションは構成済みの Playwright `browser_navigate` 許可リストの下で、`mcp` 権限種別のみを 1 回に 1 つずつ承認しますが、正確な対象を強制できません。管理されたローカルワークショップ対象にのみ使用し、本番、共有、または信頼されていない URL には決して使用しないでください。
:::
ワークショップの対象を使用します:

```text
{{TARGET_APP_URL}}
```

5 つのステージすべてを確認します:

1. クライアントが接続し、1 つのセッションを作成します。
2. Playwright が正確な対象に移動し、アクセシビリティスナップショットを作成します。
3. 範囲を絞ったローカルリーダーが、その現在の実行のスナップショットを返します。
4. ブラウザーでサポートされる検出事項についてローカルカタログが呼び出されます。
5. 応答がレポート契約に従い、制限事項を明示します。

:::language dotnet
トランスクリプトは異なりますが、次のような形になるはずです:

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
トランスクリプトは異なりますが、次のような形になるはずです:

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse` はツールの start/done 行を出力し、アシスタントのテキストを stdout にストリーミングします。
:::

:::language python
トランスクリプトは異なりますが、次のような形になるはずです:

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py` は `report.main` を起動します。これは差分をストリーミングした後、`session.idle` を待機します。
:::

:::language go
トランスクリプトは異なりますが、次のような形になるはずです:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`Client` が Copilot CLI のライフサイクルを所有し、`Session` が 1 つの会話を所有し、権限ハンドラーが外部ナビゲーションをゲートすることを説明します。想定されるレポートは証拠に基づいています。
:::

:::language rust
トランスクリプトは異なりますが、次のような形になるはずです:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`Client` がランタイムを管理し、`Session` がイベントをディスパッチし、型付きツールはアプリケーションが所有し、権限ハンドラーは正確なナビゲーションのみを信頼することを説明します。
:::

:::language java
トランスクリプトは異なりますが、次のような形になるはずです:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Maven が Java 17 アプリケーションをコンパイルし、`CopilotClient` がランタイムを管理し、ツールのスコープが維持されることを説明します。既定では、権限コールバックは正規 URL のみを受け入れます。明示的な local-demo フラグを使うと、構成済みの `mcp` 種別に制限されますが、その URL は検証できません。
:::

管理された対象には、ブラウザーから観察できる問題が意図的に含まれています。代替テキストの欠落、`main` ランドマークなし、論理的でない見出し順序、アクセシブル名のないテキストボックスです。レポートを[公開されている対象 HTML](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html)と比較します。スナップショットとソースの両方に存在しない検出事項は受け入れないでください。

<details>
<summary>完全な実行のトラブルシューティング</summary>

| 症状 | 修正 |
|---|---|
| 既知の問題が省略される | エージェントの出力は変動することがあります。1 回再実行してもかまいませんが、あらかじめ決めた回答を強制するのではなく、証拠を必須にしてください。 |
| 報告された問題がページに存在しない | 根拠がないものとして却下します。プロンプトは具体的なブラウザー証拠を要求しています。 |
| ツールが拒否される | `browser_navigate` が入力された正確な対象を使用していることを確認してください。 |
| リーダーがスナップショットを見つけられない | プロンプトの順序を維持してください。`read_latest_accessibility_snapshot` を呼び出す前にナビゲーションします。 |
| ランタイムを開始できない | `copilot login` で再認証し、CLI が `PATH` 上にあることを確認して、使用している言語の実行コマンドを再試行します。 |

</details>

> **このステップが完了する条件:** レポートに根拠があり、ツール名が表示され、コードを読まなくても以下のアーキテクチャの質問に答えられること。

## 理解度を確認する

1. セッションに属する状態は何ですか。
2. WCAG カタログがローカルなのはなぜですか。
3. Playwright が外部にあるのはなぜですか。
4. 権限はどこで適用されますか。
5. 別の MCP サーバーを追加すると何が変わりますか。

<details>
<summary>説明を比較する</summary>

1. セッションは、1 つの会話のメッセージ、モデル応答、ツール結果を所有します。
2. アプリケーションがカタログデータと決定論的な検索を所有するため、関数はローカルのままです。
3. Playwright は、独自の Node.js プロセスと依存関係を持つ再利用可能なブラウザー機能です。
4. MCP ツールの許可リストはナビゲーションのみを公開し、権限ハンドラーは正確な対象のみを承認します。信頼されたローカルリーダーはパスを受け取らず、新しく生成されたスナップショットだけを読み取ります。カタログも読み取り専用です。これらのアプリケーション所有ツールは権限をスキップします。
5. サーバー構成を追加し、必要なツールだけを公開し、その信頼ポリシーを定義し、同じセッションイベントストリームを通じて呼び出しを観察し続けます。

</details>

## 次のステップ

[ステップ 8: モデルを選択する](08-model-selection.md)に進み、ステップ 9 で検出事項をインタラクティブな HTML レポートに変換します。

## 詳細情報

ワークショップアプリケーションはマシン上で実行されます。これらのページでは、同じ設計を別の場所に移したときに何が変わるかを説明します。

- [バックエンドサービス](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md): ローカル CLI ではなくヘッドレス CLI に対して SDK をサーバー側で実行する方法。
- [スケーリングとマルチテナンシー](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md): 水平スケーリングと、あるユーザーのセッションを別のユーザーのセッションから切り離す分離パターン。
- [OpenTelemetry インストルメンテーション](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md): ターミナルを見られない場所でエージェントが実行された後に、ツール呼び出しとターンをトレースする方法。
- [Microsoft Agent Framework 統合](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md): より大きなマルチエージェントワークフローの中に Copilot セッションを配置する方法。
