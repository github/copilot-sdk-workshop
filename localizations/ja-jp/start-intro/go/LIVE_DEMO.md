# The GitHub Podcast ライブデモ: Go

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限のあるセッションの前に、含まれているスターターで依存関係をダウンロードします:

```powershell
cd start-intro/go
go mod download
go mod verify
```

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`main.go` から始めます。`client`、`isAuthenticated`、`session` という名前付きプレースホルダーが意図的に用意されています。イベントハンドラーはそのままにします。

### 1. クライアントを開始する

`var client *copilot.Client` とその次の `_ = client` を次のコードに置き換えます:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`isAuthenticated := false` を次のコードに置き換えます:

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. セッションを作成する

セッションのプレースホルダーを次のコードに置き換えます:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               preferredModel,
	Streaming:           copilot.Bool(true),
	AvailableTools:      []string{},
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

発話例: 「セッションが会話です。モデルを選び、ストリーミングを有効にしました。下のイベントハンドラーは、各テキストフラグメントが到着するたびに出力します。」

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

インポートに `"time"` を追加します。`// Step 5: Send the first message.` の下で、`_ = context.Background()` を次のコードに置き換えます:

```go
ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
defer cancel()
if _, err := session.SendAndWait(ctx, copilot.MessageOptions{
	Prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Go app do.",
}); err != nil {
	panic(err)
}
fmt.Println()
```

既存のイベントサブスクリプションはそのままにします。`streamResponse` も呼び出さないでください。そのヘルパーは 2 つ目のサブスクリプションを追加し、各テキストフラグメントを 2 回出力してしまいます。

発話例: 「基本形はこれです。クライアントを開始し、セッションを作成し、イベントをリッスンし、メッセージを送信します。このループが動作すれば、ポッドキャストエージェントへ発展させられます。」

`go` フォルダーから、この Hello World チェックポイントを今すぐ実行します:

```powershell
go run .
```

想定される出力: ストリーミングされた 1 文の回答に続いて、`SendAndWait` がターンを完了します。

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後、あらかじめ用意された `helpers.go` と `permission_prompt.go` のヘルパーを使用して、同じセッションをグラウンディングされたポッドキャストワークフローに変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

認証が完了した後、セッションを作成する前に:

```go
selectedModel, err := selectModel(context.Background(), client, preferredModel)
if err != nil {
	panic(err)
}
latestEpisodes, err := getLatestEpisodes()
if err != nil {
	panic(err)
}
selectedEpisode, err := pickEpisode(latestEpisodes)
if err != nil {
	panic(err)
}
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

ツールを作成します:

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

セッションを作成します:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{episodeTool, latestEpisodesTool},
	AvailableTools:      []string{"get_github_podcast_episode", "get_latest_github_podcast_episodes"},
	OnPermissionRequest: permissionPrompt,
	SystemMessage: &copilot.SystemMessageConfig{
		Mode:    "replace",
		Content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

発話例: 「モデルがアプリケーションへ任意にアクセスできるわけではありません。範囲の狭い型付き機能を 2 つ付与し、名前で許可リストに追加し、Hello World のすべて承認するハンドラーを `permission_prompt.go` の `permissionPrompt` に差し替えます。このハンドラーは、これらのツール以外を拒否し、ツールを実行する前に stdin で確認を求めます。」

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

発話例: 「システムメッセージは append ではなく replace を使用します。このアプリケーションは、既定のプロンプトを継承するのではなく、このセッションの完全なエージェント ID とグラウンディングルールを提供します。」

### 3. プロンプトを置き換える

既存の上限付き送信の直前にプロンプトを構築します:

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

`MessageOptions` フィールドを `Prompt: prompt` に変更します。モデルステータス行を更新して `selectedModel` を出力します。既存のサブスクリプション、上限付きコンテキスト、エラーチェック、遅延クリーンアップはそのままにし、2 つ目のサブスクリプションは追加しないでください。

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

`go` フォルダーから完成したポッドキャストエージェントを今すぐ実行します:

```powershell
go run .
```

想定されるマイルストーン: モデル選択、10 件のエピソード選択、`[Tool call started]`、承認プロンプト、`[Tool call complete]`、その後にストリーミングされたローンチコピー。
