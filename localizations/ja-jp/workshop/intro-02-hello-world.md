# ステップ 2: ストリーミングで Hello World

> **所要時間:** 10 分

## スターターから始める

事前準備で開いた `start-intro` フォルダーのエントリポイントを編集します。コードの横で **`LIVE_DEMO.md`** を開きます。このレッスンでは、別の実装ではなく、その同じファイルの **第 1 幕: Hello World** を表示します。

番号付き 4 つの編集を順に行います: **クライアントを起動し、認証を確認し、セッションを作成し、Hello World を送信します**。スターターが提供するイベント処理は残します。Java と Rust では、マークされた場所に不足しているイベント購読を含めます。実行する前に 4 つすべての編集を完了してください。

:::language dotnet
`start-intro/dotnet` で作業し、`Program.cs` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md)。
:::
:::language nodejs
`start-intro/nodejs` で作業し、`src/index.ts` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md)。
:::
:::language python
`start-intro/python` で作業し、`main.py` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md)。
:::
:::language go
`start-intro/go` で作業し、`main.go` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md)。
:::
:::language java
`start-intro/java` で作業し、`src/main/java/demo/CopilotSdkLiveDemo.java` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md)。
:::
:::language rust
`start-intro/rust` で作業し、`src/main.rs` を編集します。[ローカルデモガイドを開く](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md)。
:::

## 第 1 幕: Hello World

<!-- LIVE_DEMO -->

## 実行する

選択した言語フォルダーから、デモガイドのチェックポイントコマンドを使用します。実際にストリーミングされる 1 文の回答が表示され、その後プログラムが終了するはずです。スターターのバナーや認証メッセージだけでは、Hello World が成功したことにはなりません。

セッションは権限ハンドラー付きの**空のツール許可リスト**を使用します。すべて承認する設定自体は安全境界ではありません。この最初の演習では、空の許可リストがツール機能を取り除きます。次の幕で両方の設定を置き換えます。

## 理解度を確認する

行った 4 つの編集を指し示してください。クライアントとセッションが異なる理由と、どのイベントがターンの完了を報告するかを説明します。

## この実行のトラブルシューティング

- **実際の応答がない:** エントリポイントを保存し、ガイドの 4 つの手順をすべて完了してください。
- **認証エラー:** 同じ環境で `copilot auth login` を実行してください。
- **モデルを利用できない:** スターターの優先モデルを、アカウントで利用可能な ID に変更してください。次の幕でモデルピッカーを紹介します。
- **ターンが停止する:** 権限ハンドラーと空の許可リストを維持し、CLI 接続と完了待機を確認してください。

続けて [ポッドキャストエージェントを構築する](intro-03-podcast-agent.md) に進みます。

## 詳細情報

- [Copilot SDK の言語 API](https://github.com/github/copilot-sdk)
- [同梱のスターターとデモガイド](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
