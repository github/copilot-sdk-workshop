# Museum Exhibit Studio スターター

ワークショップで使う言語のディレクトリを選び、その中で直接作業します。そこに移動したら、同じフォルダーをエディターで開き (その中から `code .` を実行するか、ほかのエディターのフォルダーを開くコマンドを使います)、ターミナルもその場所のままにします。これらのスターターには、ピン留めされた依存関係、名前付きリージョンとして配置されたエントリポイント、あらかじめ用意されたキュレーターヘルパーモジュール、システムメッセージを保持するあらかじめ用意されたファイルが含まれています。ヘルパーには、実装する必要のない下回りの処理が含まれています。承認済みの事実セットとその範囲、教育者がそれらを選択または入力できるメニュー、それらの事実をキュレーターに渡すあらかじめ用意された `approved_fact_lookup` ローカルツール、利用可能な調査がある場合に取得済みの調査と引用を返すあらかじめ用意された `approved_wikipedia_fact_lookup` ローカルツール、ストリーミングプリンター、決定論的な展示検証、スコープ付き Wikipedia MCP サーバーと既定で拒否する権限ハンドラー、単一ファイル `exhibit.html` の書き込み権限、固定のプロンプトテキスト (展示構造、調査リクエスト、ページ要件)、`COPILOT_MODEL` ルックアップ、失敗メッセージです。システムメッセージファイルには、セッションが実行時に使う 3 つの長いメッセージ、つまりキュレーター用、調査が利用可能になった後のキュレーター用、調査アシスタント用が含まれています。ヘルパーは編集しません。

スターターには、展示プロンプトの指示、セッション構成、ツール登録、セッションランナーは**含まれていません**。これらはレッスン中に作成します。1 つのセッション、続いてストリーミング、その後にキュレーターの語り口 (あらかじめ用意されたシステムメッセージのインストール)、事実ツールの登録と制限付きセッションランナーを使ったそのプロンプト、検証レポート、スコープ付き Wikipedia 調査、インタラクティブな `exhibit.html` ページを作成します。[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md) から開始します。

## エントリポイントの構成

スターターのエントリポイントには、プログラムの固定された形 (エントリ関数、エラーハンドラー、クリーンアップ) と、空の名前付きリージョン一式が用意されています。リージョンは 2 つのマーカーコメントで構成され、その `BEGIN` 行には、そのリージョンに触れるすべてのステップが一覧表示されます:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

各レッスンのコードブロックには、リージョン名と 2 つのアクションのいずれかが示されています。**INSERT** は、そのリージョンが空であることを意味します。ブロックをマーカー行の間に貼り付けます。**REPLACE** は、そのリージョンに以前のステップのコードが含まれていることを意味します。マーカー行の間をすべて削除してから、ブロックを貼り付けます。ブロックは常にリージョンの完全な内容です。マーカー行やリージョン外のコードは決して編集しないでください。

| リージョン | 保持する内容 | ステップ |
|---|---|---|
| `imports` | インポート | 1、その後は新しい名前が必要になるステップごと |
| `banner` | プログラムバナー | 1 |
| `choose-facts` | 事実選択呼び出し | 4 |
| `research` | 任意の Wikipedia 調査パス | 6 |
| `generate` | 展示生成呼び出し | 1 から 6 |
| `validate` | 検証レポート | 5 |
| `sources` | 参照したソース | 6 |
| `exhibit-page` | 任意の `exhibit.html` セッション | 7 |
| `exhibit-prompt` | 展示プロンプトビルダー | 4、6 |
| `html-prompt` | ページプロンプトビルダー | 7 |
| `generation-config` | 生成セッション構成 | 4、6 |
| `research-config` | 調査セッション構成 | 6 |
| `html-config` | ページセッション構成 | 7 |
| `session-runner` | セッションランナー | 4 |

ステップ 6 では、承認済み事実ルックアップと並べて Wikipedia ルックアップを条件付きで登録し、展示解説文と来館者の質問を書く前に両方を呼び出すようキュレーターに依頼します。調査は補足のままで、教育者による検証済みではありません。承認済みの事実が優先されます。調査を拒否した場合、または引用付きの有用な要約を受け取れなかった場合、生成には `approved_fact_lookup` だけが使われます。

| 言語 | ヘルパーモジュール | システムメッセージ | ディレクトリを移動し、ビルドして実行 |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

スターターを実行すると、その識別情報が出力されるだけで、Copilot は起動せず、認証も必要ありません。これらのファイルをその場で編集するため、作業内容は `git status` に表示されます。これは想定どおりです。クリーンなスターターに戻すには、リポジトリルートから `git checkout -- .` を実行します。

すべてのスターターは、完成版アプリに必要な依存関係をすでにピン留めしているため、ワークショップ中にプロジェクトマニフェストを編集することはありません。Rust スターターは `src/lib.rs` から `museum_exhibit_studio` ライブラリクレートをビルドします。`src/main.rs` では、そこからヘルパーをインポートします。
