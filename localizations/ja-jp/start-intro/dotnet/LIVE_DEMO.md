# The GitHub Podcast ライブデモ

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限のあるセッションの前に、含まれているスターターで作業し、依存関係を復元します:

```powershell
cd start-intro/dotnet
dotnet restore
```

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`Program.cs` から始めます。`client`、`isAuthenticated`、`session` という名前付きプレースホルダーが意図的に用意されています。ストリーミングイベントハンドラーと完了待機はそのままにします。

### 1. クライアントを開始する

`CopilotClient client;` を次のコードに置き換えます:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`var isAuthenticated = false;` を次のコードに置き換えます:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. セッションを作成する

先頭に `using GitHub.Copilot.Rpc;` を追加します。`CopilotSession session = null!;` を次のコードに置き換えます:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

発話例: 「セッションが会話です。モデルを選び、ストリーミングを有効にしました。下のイベントハンドラーは、各テキストフラグメントが到着するたびに出力します。」

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

`// Step 5: Send the first message.` の下に、次のように入力します:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

最後の `await complete.Task;` を次のコードに置き換えます:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

既存のイベントハンドラーはすでに提供されています。5 つ目の編集演習ではありません。デルタを出力し、セッションエラーを表示し、アイドル時に終了します。`await using` は、実行後にクライアントとセッションを閉じます。

発話例: 「基本形はこれです。クライアントを開始し、セッションを作成し、イベントをリッスンし、メッセージを送信します。このループが動作すれば、ポッドキャストエージェントへ発展させられます。」

想定される出力: ストリーミングされた 1 文の回答に続いて、既存の `SessionIdleEvent` がプログラムを完了します。

`start-intro/dotnet` から、この Hello World チェックポイントを実行します:

```powershell
dotnet run
```

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後、あらかじめ用意された `Helpers` と `Tools` のヘルパーを追加し、同じセッションをグラウンディングされたポッドキャストワークフローに変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

あらかじめ用意されたヘルパー用の using を追加します:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

認証後、完了シグナルとセッションの前に、ピッカーを追加し、最新 10 件のエピソードから 1 つを選択します:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

アプリケーション所有のツールを作成します:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Hello World の `SessionConfig` フィールドを次の内容に置き換え、`await using var session = await client.CreateSessionAsync(...)` はそのままにします:

```csharp
Model = model,
Streaming = true,
Tools = [episodeTool, latestEpisodesTool],
AvailableTools = ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
OnPermissionRequest = PermissionPrompt.RequestAsync,
SystemMessage = new SystemMessageConfig
{
    Mode = SystemMessageMode.Replace,
    Content = "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."
}
```

発話例: 「モデルがアプリケーションへ任意にアクセスできるわけではありません。範囲の狭い型付き機能を 2 つ付与し、名前で許可リストに追加し、Hello World のすべて承認するハンドラーを、プロンプトを表示するハンドラーに差し替えます。これにより、ツールが実行される前の承認ポイントとして関与し続けられます。」

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

発話例: 「システムメッセージは Append ではなく Replace を使用します。このアプリケーションは、既定のプロンプトを継承するのではなく、このセッションの完全なエージェント ID とグラウンディングルールを提供します。」

### 3. プロンプトを置き換える

Hello World を、選択済みでグラウンディングされたエピソード要求に置き換えます:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

想定されるマイルストーン: モデル選択、10 件のエピソード選択、`[Tool call started]`、承認プロンプト、`[Tool call complete]`、その後にストリーミングされたローンチコピー。

モデルステータス行を更新して、`Model` ではなく選択した `model` を使用します。イベントハンドラー、上限付き完了待機、`await using` 宣言はそのままにします。

同じフォルダーから完成したポッドキャストエージェントを実行します:

```powershell
dotnet run
```
