# ワークショップスターター

ワークショップのホームページで選択した言語のディレクトリを選び、その中で直接作業します。コピー手順はありません。そのディレクトリに移動し、その同じフォルダーをエディターで開き（その中から `code .` を実行するか、他のエディターのフォルダーを開くコマンドを使用します）、すべてのコマンドでその場所に留まります。スターターは意図的に最小限のスキャフォールドです。アプリケーション所有の Web Content Accessibility Guidelines (WCAG) カタログと、スコープ指定された権限/スナップショットリーダーヘルパーが後のレッスン用に存在する場合がありますが、実行可能なエントリポイントは、対応するステップまで Copilot クライアント、セッション、ストリーミングフロー、ローカルツール、MCP サーバー、レポートを配線しません。

| 言語 | 前提条件 | ディレクトリを移動して確認 |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper 同梱) | `cd start-accessibility/java && ./mvnw compile` |

これらのファイルはその場で編集するため、作業内容は `git status` に表示されます。これは想定どおりです。クリーンなスターターに戻すには、リポジトリルートから `git checkout -- .` を実行します。Go、Rust、Java トラックでは、後でアプリケーションを実行するときに [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) が `PATH` 上にある必要があります。SDK のセットアップと API リファレンスは、[公式 Copilot SDK リポジトリ](https://github.com/github/copilot-sdk) と [クックブック](https://github.com/github/copilot-sdk/tree/main/cookbook) で確認できます。

ワークショップ全体を通してスターターディレクトリに留まってください。[ワークショップホームページ](../README.md#ワークショップを開始する)からインタラクティブビューアーに戻り、レッスンの Markdown を直接開かないでください。
