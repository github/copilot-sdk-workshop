# SDK 101 スターター

30 分の SDK 101 ワークショップ用の完全なスタータープロジェクトはここにあります。**このワークショップリポジトリを 1 回だけ**クローンし、1 つの言語を選択して、そのエントリポイントをその場で編集します。別にクローンするリポジトリやコピーするプロジェクトはありません。

| 言語 | 前提条件 | スターターメモ | デモガイド | エントリポイント |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [セットアップ](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [セットアップ](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [セットアップ](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [セットアップ](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [セットアップ](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [セットアップ](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

時間制限のあるセッションの前に [事前準備](../workshop/intro-00-preflight.md) を完了します。`copilot auth login` で認証し、`start-intro/<language>` に移動して、そのフォルダーをエディターで開きます（VS Code の場合は `code .`）。依存関係と実行コマンドでは、そのフォルダーに留まってください。

エントリポイントには意図的にプレースホルダーが含まれています。選択したエントリポイントの横にある **`LIVE_DEMO.md`** を開きます。**第 1 幕の 4 つの編集**に従います: クライアントを開始し、認証を確認し、セッションを作成し、Hello World を送信します。次に **第 2 幕**に従って、モデルとエピソードを選択し、セッションに機能を付与し、プロンプトを置き換えます。

ワークショップ Web サイトでは、[Hello World レッスン](../workshop/intro-02-hello-world.md) と [ポッドキャストレッスン](../workshop/intro-03-podcast-agent.md) に同じガイドセクションが表示されます。別の実装を教えるものではありません。これらのヘルパーには、モデルとエピソードの選択、型付き RSS ルックアップツール、対話型ツール承認が含まれます。ワークショップ中は変更しないでください。

依存関係と利用可能なロックファイルは含まれています。スモークビルドには Copilot 認証やライブプロンプトは不要です。完成したアプリケーションを実行するには Copilot アクセスが必要です。ポッドキャストワークフローには、公式 RSS フィードへのアクセスも必要です。その場で行った編集は `git status` に表示されます。これは想定どおりです。

## ソース

これらのスターターソースと `LIVE_DEMO.md` ガイドは、[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro) のリビジョン [`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97) からインポートされました。ガイドは、ソースの 2 幕構成と、番号付きの 4 つの Hello World 編集を維持しています。ローカルでの適応では、このリポジトリのパスを使用し、完了待機に上限を設け、SDK リソースを閉じ、Hello World を空のツール許可リストに制限し、不足していた Java/Rust のストリーミングサブスクリプションを追加しています。Go は、各テキストフラグメントを 2 回出力する代わりに 1 つのサブスクリプションを維持します。Node.js では、コールバックから例外をスローする代わりに、上限付き送信でセッションエラーを伝播できます。その RSS ヘルパーは、パーサーベースの XML デコードと HTML からプレーンテキストへの抽出を使用し、CDATA、エンティティデコード、script/style 除外のリグレッションテストを備えています。6 つすべての RSS ヘルパーは、有限の 10 秒ネットワークタイムアウトを使用します。Java は、名前空間付きの duration メタデータを読み取る際に XML DOCTYPE 宣言と外部リソースを拒否します。Python と Rust は SDK のカスタムツール権限ペイロードを認識します。Rust は、ターンのタイムアウトでもランタイムをシャットダウンできるように、切り離された入力スレッドで承認を読み取ります。アップストリームリポジトリは帰属表示であり、セットアップ要件ではありません。
