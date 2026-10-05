# ステップ 4: まとめと次のステップ

> **所要時間:** 3 分

## 作成したもの

30 分のガイド付き作業で、アプリケーションを Copilot に接続し、応答をストリーミングし、セッションに焦点を絞った識別情報と読み取り専用のポッドキャストツールを与えました。インストールと認証は事前準備で別途行いました。

## 理解度を確認する

アプリケーションを次の順序で説明します:

1. **クライアント**が接続を開始し、認証を確認します。
2. **セッション**が会話とその構成を保持します。
3. **プロンプト**がこのエピソードのタスクを割り当てます。
4. **ツール**が、要求され承認されたときに RSS の事実を提供します。
5. **イベント**が応答を出力し、ツールアクティビティを示します。
6. アプリケーションは完了を待機し、失敗を明示し、リソースを閉じます。

## 結果を示す

選択したエピソード、ツール呼び出しのマイルストーン、結果の見出しと投稿を指し示してください。ゲスト、トピック、スポンサー、リンクが捏造されていないことを確認します。投稿に求められた長さを手動で確認します。

次に、ツール許可リストと権限ハンドラーを指し示してください。システムメッセージがそのどちらの代わりにもならない理由を説明します。作成したのは入門用デモであり、生成されたコピーを自動公開しても安全であることを証明したわけではありません。

:::language dotnet
作業内容は `start-intro/dotnet/Program.cs` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [.NET スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md) をレビューしてください。
:::
:::language nodejs
作業内容は `start-intro/nodejs/src/index.ts` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [Node.js スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md) をレビューしてください。
:::
:::language python
作業内容は `start-intro/python/main.py` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [Python スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md) をレビューしてください。
:::
:::language go
作業内容は `start-intro/go/main.go` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [Go スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md) をレビューしてください。
:::
:::language java
作業内容は `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [Java スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md) をレビューしてください。
:::
:::language rust
作業内容は `start-intro/rust/src/main.rs` にあります。[Hello World](intro-02-hello-world.md) と [ポッドキャストエージェント](intro-03-podcast-agent.md) のレッスン、および [Rust スターターノート](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md) をレビューしてください。
:::

## より深いワークショップを選ぶ

上部の **Hub** を使用してワークショップピッカーに戻ります。言語選択は保持されます。次から選択してください:

- **Accessibility Reviewer (115 分):** ページを調査し、ローカルガイダンスと Playwright MCP を組み合わせ、証拠に基づくレポートを生成します。
- **Museum Exhibit Studio (90 分):** キュレーターのペルソナを構築し、承認済みの事実を使用し、構造をチェックして、スコープされた Wikipedia 調査を追加します。

各長めのワークショップには、それぞれの事前準備とスターターがあります。これらは次のステップであり、この 30 分トラックを完了するための追加要件ではありません。

## 詳細情報

- [公式 Copilot SDK](https://github.com/github/copilot-sdk)
- [SDK クックブック](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [同梱のイントロスターター](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
