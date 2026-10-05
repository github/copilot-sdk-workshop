# The GitHub Podcast ライブデモ: Java

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限のあるセッションの前に、含まれているスターターで依存関係をコンパイルします:

```powershell
cd start-intro/java
./mvnw compile
```

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`src\main\java\demo\CopilotSdkLiveDemo.java` から始めます。`client`、`isAuthenticated`、`session` という名前付きプレースホルダーが意図的に用意されています。

### 1. クライアントを開始する

`CopilotClient client;` を次のコードに置き換えます:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

このリソースブロックは、ステップ 4 で閉じ中かっこを追加するまで開いたままです。実行する前に 4 つの編集をすべて完了してください。

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`boolean isAuthenticated = false;` を次のコードに置き換えます:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. セッションを作成する

セッションのプレースホルダーを次のコードに置き換えます:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

次のインポートを追加します:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

`// Step 4: Stream events from the assistant.` の下のコメントを次のコードに置き換えます:

```java
session.on(AssistantMessageDeltaEvent.class, event -> {
    String delta = event.getData().deltaContent();
    if (delta != null) {
        System.out.print(delta);
    }
});
session.on(ToolExecutionStartEvent.class, event ->
        System.out.println("\n[Tool call started] " + event.getData().toolName()));
session.on(ToolExecutionCompleteEvent.class, event ->
        System.out.println("\n[Tool call complete]"));
```

これにより、スターターでマークされた場所にストリーミングハンドラーが提供されます。セッションリソースブロックもステップ 4 まで開いたままです。

次のように言います: "セッションは会話そのものです。モデルを選択し、ストリーミングを有効にしました。"

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

`// Step 5: Send the first message.` の下で、プレースホルダー `var config` と、その `if (session != null)` ガードを削除します。これらを次の内容に置き換えます:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

2 つの閉じ中かっこは、ステップ 3 と 1 のセッションおよびクライアントのリソースブロックを終了します。既存のメソッドとクラスの閉じ中かっこはそのままにします。

発話例: 「基本形はこれです。クライアントを開始し、セッションを作成し、イベントをリッスンし、メッセージを送信します。このループが動作すれば、ポッドキャストエージェントへ発展させられます。」

この Hello World チェックポイントを、`java` フォルダーから今すぐ実行します:

```powershell
./mvnw compile exec:java
```

想定される出力: ストリーミングされた 1 文の回答です。`sendAndWait` は完了を待機してエラーを伝播します。リソースブロックは両方の SDK リソースを閉じます。

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後で、あらかじめ用意されたヘルパークラスを使い、同じセッションを根拠に基づくポッドキャストワークフローに作り変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

`com.github.copilot.rpc.SystemMessageConfig` と `com.github.copilot.SystemMessageMode` のインポートを追加します。第 1 幕の `java.util.List` は残します。下で `PermissionPrompt` に置き換えると、`PermissionHandler` インポートは不要になります。

クライアントのリソースブロック内で、認証の後、`var config` の前に追加します:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

ツールを作成します:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

`var config` とそのビルダーチェーンを置き換え、既存の `try (var session = client.createSession(config).get())` ブロックはそのままにします:

```java
var config = new SessionConfig()
        .setModel(selectedModel)
        .setStreaming(true)
        .setTools(List.of(episodeTool, latestEpisodesTool))
        .setAvailableTools(List.of("get_github_podcast_episode", "get_latest_github_podcast_episodes"))
        .setOnPermissionRequest(PermissionPrompt.HANDLER)
        .setSystemMessage(new SystemMessageConfig()
                .setMode(SystemMessageMode.REPLACE)
                .setContent("You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."));
```

次のように言います: "モデルは私のアプリケーションへ任意にアクセスできるわけではありません。2 つの狭く型付けされた機能を付与し、名前で許可リストに登録します。また、Hello World の全承認ハンドラーを `PermissionPrompt` に差し替えます。これは、これらのツールのいずれでもないものを拒否し、実行前に stdin で確認します。"

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

次のように言います: "システムメッセージでは APPEND ではなく REPLACE を使用します。このアプリケーションは、既定のプロンプトを継承する代わりに、このセッション用の完全なエージェント ID と根拠付けルールを提供します。"

### 3. プロンプトを置き換える

既存の制限付き送信内の `.setPrompt(...)` の引数だけを置き換えます:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

モデルステータス行を更新して `selectedModel` を出力します。サブスクリプション、60 秒の待機、2 つのリソースブロックはいずれも変更しません。

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

完成したポッドキャストエージェントを、`java` フォルダーから今すぐ実行します:

```powershell
./mvnw compile exec:java
```

想定されるマイルストーン: モデル選択、10 件のエピソード選択、ツール実行、承認プロンプト、その後に根拠に基づくローンチコピー。
