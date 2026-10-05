# GitHub Podcast ライブデモ: Node.js

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限付きセッションの前に、含まれているスターターで依存関係をインストールします:

```powershell
cd start-intro/nodejs
npm ci
```

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`src\index.ts` を開きます。`client`、認証、`session`、最初のプロンプト用のプレースホルダーがあります。

### 1. クライアントを開始する

`let client: CopilotClient;` を次の内容に置き換えます:

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

`try` ブロックは、ステップ 4 でその `finally` ブロックを追加するまで開いたままにします。実行する前に 4 つの編集をすべて完了してください。

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`const isAuthenticated = false;` とそれに続く `if` ブロックを次の内容に置き換えます:

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. ストリーミングセッションを作成する

`let session: CopilotSession;` を次の内容に置き換えます:

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

ファイルの先頭にある SDK インポートに `approveAll` を追加します:

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

発話例: 「セッションが会話です。モデルを選び、ストリーミングを有効にしました。下のイベントハンドラーは、各テキストフラグメントが到着するたびに出力します。」

セッションの `try` ブロックもステップ 4 まで開いたままにします。既存のストリーミングハンドラーはそのままにします。

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

`// Step 5: Send the first message.` の下に、次のように入力します:

```typescript
await session.sendAndWait({
    prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Node.js app do.",
}, 60_000);
console.log();
} finally {
  await session.disconnect();
}
} finally {
  await client.stop();
}
```

発話例: 「基本形はこれです。クライアントを開始し、セッションを作成し、イベントをリッスンし、メッセージを送信します。このループが動作すれば、ポッドキャストエージェントへ発展させられます。」

この Hello World チェックポイントを、`nodejs` フォルダーから今すぐ実行します:

```powershell
npm start
```

想定される出力: ストリーミングされた 1 文の回答が表示され、その後 `sendAndWait` がターンを完了します。これはセッションエラーを伝播し、待機時間を 60 秒に制限します。2 つの `finally` ブロックがセッションとクライアントを閉じます。

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後で、`src` のあらかじめ用意されたヘルパーを使い、同じセッションを根拠に基づくポッドキャストワークフローに作り変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

インポートを追加します:

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

下で `permissionPrompt` に置き換えるため、SDK インポートから `approveAll` を削除します:

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

クライアントの `try` ブロック内で、認証の後、セッション作成の前に次を追加します:

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

セッション構成を次の内容に置き換えます:

```typescript
const session = await client.createSession({
  model: selectedModel,
  streaming: true,
  tools: [episodeTool, latestEpisodesTool],
  availableTools: ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
  onPermissionRequest: permissionPrompt,
  systemMessage: {
    mode: "replace",
    content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
  },
});
```

この構成の後のセッション `try` ブロックはそのままにします。

発話例: 「モデルがアプリケーションへ任意にアクセスできるわけではありません。範囲の狭い型付き機能を 2 つ付与し、名前で許可リストに追加し、Hello World のすべて承認するハンドラーを、プロンプトを表示するハンドラーに差し替えます。これにより、ツールが実行される前の承認ポイントとして関与し続けられます。」

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

発話例: 「システムメッセージは append ではなく replace を使用します。このアプリケーションは、既定のプロンプトを継承するのではなく、このセッションの完全なエージェント ID とグラウンディングルールを提供します。」

### 3. プロンプトを置き換える

既存の `sendAndWait` 呼び出し内のプロンプトだけを次の内容に置き換えます:

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

完成したポッドキャストエージェントを、`nodejs` フォルダーから今すぐ実行します:

```powershell
npm start
```

想定されるマイルストーン: モデル選択、10 件のエピソード選択、`[Tool call started]`、承認プロンプト、`[Tool call complete]`、その後にストリーミングされたローンチコピー。

モデルステータス行を更新して `selectedModel` を使用します。イベントハンドラー、60 秒のタイムアウト、2 つの `finally` ブロックはそのままにします。
