# GitHub Podcast ライブデモ: Rust

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限付きセッションの前に、含まれているスターターで依存関係をダウンロードして確認します:

```powershell
cd start-intro/rust
cargo check --locked
```

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`src\main.rs` から始めます。`client`、`is_authenticated`、セッション用の名前付きプレースホルダーが意図的に用意されています。

このインポートを追加します:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

既存の `SessionConfig` インポートを置き換えます。`std::io::{self, Write}` はそのままにします。

### 1. クライアントを開始する

クライアントのプレースホルダーを次の内容に置き換えます:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`let is_authenticated = false;` とその `if` ブロックを次の内容に置き換えます:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. セッションを作成する

`let session_is_created = false;` と空の `if session_is_created { ... }` ブロックを次の内容に置き換えます:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

次のように言います: "セッションは会話そのものです。モデルを選択し、ストリーミングを有効にしました。"

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

`// Step 5: Send the first message.` の下で、3 行の `let _ = ...` プレースホルダー行を次の内容に置き換えます:

```rust
let prompt = "Hello world! In one sentence, say what the Copilot SDK helps a Rust app do.".to_owned();
let turn = async {
    let mut events = session.subscribe();
    let send = session.send(MessageOptions::new(prompt));
    tokio::pin!(send);
    let mut sent = false;
    let mut idle = false;
    while !sent || !idle {
        tokio::select! {
            result = &mut send, if !sent => {
                result?;
                sent = true;
            }
            event = events.recv() => {
                let event = event?;
                match event.event_type.as_str() {
                    "assistant.message_delta" => {
                        if let Some(delta) = event.data.get("deltaContent").and_then(|v| v.as_str()) {
                            print!("{delta}");
                            io::stdout().flush()?;
                        }
                    }
                    "tool.execution_start" => println!("\n[Tool call started] {}", event.data),
                    "tool.execution_complete" => println!("\n[Tool call complete]"),
                    "session.error" => {
                        return Err(format!("Copilot session failed: {}", event.data).into());
                    }
                    "session.idle" => idle = true,
                    _ => {}
                }
            }
        }
    }
    Ok::<(), Box<dyn std::error::Error>>(())
};
let result = tokio::time::timeout(Duration::from_secs(60), turn).await;
session.disconnect().await?;
client.stop().await?;
result??;
println!();
```

最後の `Ok(())` はそのままにします。このループは不足しているストリーミングサブスクリプションを提供し、送信前にリッスンし、送信完了とアイドル状態の両方を待機します。セッションとクライアントを閉じた後に、エラーまたは 60 秒のタイムアウトを表示します。

次のように言います: "これが基本形です。クライアントを開始し、セッションを作成し、イベントをサブスクライブし、メッセージを送信します。このループが動作したら、ポッドキャストエージェントに発展させることができます。"

この Hello World チェックポイントを、`rust` フォルダーから今すぐ実行します:

```powershell
cargo run --locked
```

想定される出力: ターミナルにストリーミング表示される 1 文の回答、その後にプログラムが終了します。

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後で、`src\workshop.rs` のあらかじめ用意されたコードを使い、同じセッションを根拠に基づくポッドキャストワークフローに作り変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

次を追加します:

```rust
mod workshop;
```

既存の型インポートに `SystemMessageConfig` を追加します:

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

認証の後、`config` を構築する前に追加します:

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

セッションを作成します:

```rust
let mut config = SessionConfig::default();
config.model = selected_model;
config.streaming = Some(true);
config.tools = Some(vec![workshop::episode_tool(), workshop::latest_episodes_tool()]);
config.available_tools = Some(vec![
    "get_github_podcast_episode".to_owned(),
    "get_latest_github_podcast_episodes".to_owned(),
]);
config.permission_handler = Some(workshop::permission_prompt());
config = config.with_system_message(
    SystemMessageConfig::new()
        .with_mode("replace")
        .with_content(
            "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
        ),
);
let session = client.create_session(config).await?;
```

次のように言います: "モデルは私のアプリケーションへ任意にアクセスできるわけではありません。2 つの狭く型付けされた機能を付与し、名前で許可リストに登録します。また、Hello World の全承認ハンドラーを `workshop::permission_prompt` に差し替えます。これは、これらのツールのいずれでもないものを拒否し、実行前に stdin で確認します。"

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

発話例: 「システムメッセージは append ではなく replace を使用します。このアプリケーションは、既定のプロンプトを継承するのではなく、このセッションの完全なエージェント ID とグラウンディングルールを提供します。」

### 3. プロンプトを置き換える

`let prompt = ...` 行だけを置き換えます。ストリーミングループ、タイムアウト、クリーンアップはそのままにします:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

完成したポッドキャストエージェントを、`rust` フォルダーから今すぐ実行します:

```powershell
cargo run --locked
```

想定されるマイルストーン: モデル選択、10 件のエピソード選択、ツール実行、承認プロンプト、その後に根拠に基づくローンチコピー。
