# GitHub Podcast ライブデモ: Python

## セッション前

1. このマシンがまだ認証されていない場合は、`copilot auth login` を実行します。
2. 時間制限付きセッションの前に、含まれているスターターで環境を作成します:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux では、`.\.venv\Scripts\python.exe` の代わりに `.venv/bin/python` を使用します。

## デモの紹介

発話例: 「The GitHub Podcast 用のポッドキャストエージェントを構築します。実際のエピソードを選択し、公式 RSS フィードから検証済みメタデータを取得し、その事実をスポンサーに配慮したソーシャルコピーに変換できます。」

発話例: 「まず、可能な限り最小の Copilot SDK 会話から始め、その後で目的、アイデンティティ、アプリケーション所有のツールを与えます。」

## 第 1 幕: Hello World

`main.py` から始めます。`client`、`is_authenticated`、`session` 用の名前付きプレースホルダーが意図的に用意されています。ストリーミングイベントハンドラーと完了待機はそのままにします。

### 1. クライアントを開始する

`client: CopilotClient` を次の内容に置き換えます:

```python
client = CopilotClient()
await client.start()
```

発話例: 「クライアントは Copilot ランタイムへの接続です。明示的に開始することで、アプリケーションがそのライフサイクルを所有します。」

### 2. 認証を確認する

`is_authenticated = False` とその `if` ブロックを次の内容に置き換えます:

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

発話例: 「セッションを作成する前に、このマシンがサインインしているかどうかをランタイムに問い合わせることができます。」

### 3. セッションを作成する

`session = None` を次の内容に置き換えます:

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

ファイル先頭の SDK インポートの範囲を広げます:

```python
from copilot import CopilotClient, PermissionHandler
```

発話例: 「セッションが会話です。モデルを選び、ストリーミングを有効にしました。下のイベントハンドラーは、各テキストフラグメントが到着するたびに出力します。」

発話例: 「このハンドラーは権限要求に応答します。空のツール許可リストは、この演習のツール機能を削除します。すべて承認するだけでは安全境界にはなりません。」

### 4. Hello World を送信する

`# Step 5: Send the first message.` から `main()` の末尾までを、このインデントされたブロックで置き換えます。モジュールの `if __name__ == "__main__":` ブロックはそのままにします:

```python
    try:
        await session.send(
            "Hello world! In one sentence, say what the Copilot SDK helps a Python app do."
        )
        await asyncio.wait_for(done.wait(), timeout=60)
        if error is not None:
            raise error
        print()
    finally:
        await session.disconnect()
        await client.stop()
```

発話例: 「基本形はこれです。クライアントを開始し、セッションを作成し、イベントをリッスンし、メッセージを送信します。このループが動作すれば、ポッドキャストエージェントへ発展させられます。」

この Hello World チェックポイントを `start-intro/python` から実行します:

```powershell
.\.venv\Scripts\python.exe main.py
```

macOS/Linux の場合:

```bash
.venv/bin/python main.py
```

想定される出力: ストリーミングされた 1 文の回答が表示され、その後 `SessionIdleData` がプログラムを完了します。

## 第 2 幕: ポッドキャストエージェントに作り変える

Hello World の後で、あらかじめ用意されたヘルパーを使い、同じセッションを根拠に基づくポッドキャストワークフローに作り変えます。

発話例: 「会話は動作しています。次はポッドキャストエージェントに変えます。これは、選択した GitHub Podcast エピソードを調査し、事実を作り出すことなくローンチコピーを準備できる、焦点を絞ったアシスタントです。」

### 1. 発表者に選ばせる

インポートを追加します:

```python
from github_podcast_tools import (
    get_latest,
    get_latest_github_podcast_episodes,
    get_github_podcast_episode,
    pick_episode,
)
from model_selector import select_model
from permission_prompt import permission_prompt
```

下で `permission_prompt` が `PermissionHandler` を置き換えるため、SDK インポートを元に戻して絞り込みます:

```python
from copilot import CopilotClient
```

認証チェックの後に追加します:

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

発話例: 「これにより、デモをライブのままにできます。その場でモデルを選択し、実際の最新 10 件の GitHub Podcast エピソードから選べます。その選択がポッドキャストエージェントの課題になります。」

### 2. セッションに機能を与える

ツール付きでセッションを作成します:

```python
session = await client.create_session(
    model=model,
    streaming=True,
    tools=[get_github_podcast_episode, get_latest_github_podcast_episodes],
    available_tools=["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
    on_permission_request=permission_prompt,
    system_message={
        "mode": "replace",
        "content": "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
    },
)
```

発話例: 「モデルがアプリケーションへ任意にアクセスできるわけではありません。範囲の狭い型付き機能を 2 つ付与し、名前で許可リストに追加し、Hello World のすべて承認するハンドラーを、プロンプトを表示するハンドラーに差し替えます。これにより、ツールが実行される前の承認ポイントとして関与し続けられます。」

発話例: 「これらのツールによって、これは汎用チャットボットではなくエージェントになります。アプリケーションが制御する信頼済みデータソースに対してアクションを実行できます。」

発話例: 「システムメッセージは append ではなく replace を使用します。このアプリケーションは、既定のプロンプトを継承するのではなく、このセッションの完全なエージェント ID とグラウンディングルールを提供します。」

### 3. プロンプトを置き換える

プロンプトを次の内容に置き換えます:

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

発話例: 「エージェントがエピソードツールを呼び出すことを決定し、読み取り専用ルックアップ を承認します。その応答は、作り出された詳細ではなく公式フィードに基づきます。」

イベントハンドラー、完了待機、クリーンアップは変更しません。既存の `try` ブロック内の `session.send(...)` 呼び出しだけを置き換えます。モデルステータス行を更新して、選択された `model` を出力します。

同じフォルダーから完成したポッドキャストエージェントを実行します:

```powershell
.\.venv\Scripts\python.exe main.py
```

macOS/Linux の場合:

```bash
.venv/bin/python main.py
```

想定されるマイルストーン: モデル選択、10 件のエピソード選択、`[Tool call started]`、承認プロンプト、`[Tool call complete]`、その後にストリーミングされたローンチコピー。
