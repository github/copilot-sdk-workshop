# ステップ 3: ポッドキャストエージェントを構築する

> **所要時間:** 12 分

## 同じデモを続ける

完了したばかりの Hello World アプリケーションを残します。同じ **`LIVE_DEMO.md`** の **第 2 幕: ポッドキャストエージェントに作り変える** に従います。このレッスンでは、その幕を直接表示します。

ガイドの 3 つの変更を行います: モデルと実際のエピソードを選択し、セッションに機能と識別情報を与えてから、プロンプトを置き換えます。フィードパーサーを書いたり別のプロジェクトを始めたりする代わりに、あらかじめ用意されたヘルパーを再利用します。

:::language dotnet
`start-intro/dotnet/Program.cs` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::
:::language nodejs
`start-intro/nodejs/src/index.ts` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::
:::language python
`start-intro/python/main.py` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::
:::language go
`start-intro/go/main.go` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::
:::language java
`start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::
:::language rust
`start-intro/rust/src/main.rs` で続けます。[デモガイドの第 2 幕](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent)。
:::

## 第 2 幕: ポッドキャストエージェントに作り変える

<!-- LIVE_DEMO -->

## 実行する

Hello World と同じフォルダーと実行コマンドを使用します。モデルと実際のエピソードの 1 つを選択します。`y` で承認する前に、要求されたツール名を読んでください。Enter キーを押すと要求は拒否されます。拒否は検索の成功ではありません。

モデル選択、エピソード選択、ツール開始イベント、承認プロンプト、ツール完了イベント、その後にストリーミングされるローンチコピーが表示されるはずです。

アプリケーションは、モデルが要求するツール呼び出しの前にエピソードリストを取得します。権限ハンドラーが管理するのはモデルが要求したツールであり、アプリケーションが行うすべてのネットワークリクエストではありません。既存のイベント処理とクリーンアップは残してください。

## 理解度を確認する

2 つのツール登録、それらの許可リスト、権限ハンドラー、システムメッセージを見つけます。Hello World から何が変わったかを説明します。

結果を、選択したエピソードの RSS メタデータと比較します。280 文字未満の投稿を求めても、**コード内で制限が強制されるわけではありません**。システムメッセージは、事実の正確性やスポンサーに関する安全性を証明しません。**公開する前に**主張と長さをレビューしてください。このワークショップ中は何も投稿しないでください。

## この実行のトラブルシューティング

- **エピソードリストがない:** 公式 RSS フィードへのアクセスを確認してください。検索に失敗した代わりに作り上げた事実で代用しないでください。
- **承認プロンプトがない:** 2 つのツール名、それらの許可リスト、置き換えた権限ハンドラーを確認してください。
- **入力待ち:** インタラクティブなターミナルを使用し、そのプロンプトに回答してください。
- **検索が拒否される:** 適切であれば再実行し、想定される読み取り専用ツールを承認してください。拒否をバイパスするためにハンドラーを削除しないでください。

続けて [まとめと次のステップ](intro-04-wrap-up.md) に進みます。

## 詳細情報

- [Copilot SDK とツール API](https://github.com/github/copilot-sdk)
- [同梱のスターターとデモガイド](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
