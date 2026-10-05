# Museum Exhibit Studio: 事前準備

> **所要時間:** 時間制限なし  
> **ワークショップ:** 非 SDLC エージェント

## 作成するもの

Museum Exhibit Studio は、教育担当者が承認した事実を、来館者向けの展示コピーに変換します:

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

`start-museum/<language>` 内で、1 つのコンソールアプリケーションをその場で少しずつ拡張していきます。各ステップで 1 つの考え方を追加し、実際の実行で終えるため、キュレーターが目の前で形になっていきます:

| ステップ | 追加するもの | 表示されるもの |
|---|---|---|
| 1 | クライアント、セッション、1 つのプロンプト | ターミナル内の展示コピー |
| 2 | あらかじめ用意されたストリーミングプリンター | ライブで到着するテキスト |
| 3 | キュレーターのシステムメッセージ | 異なる語り口と形 |
| 4 | 承認済みの事実ツール、プロンプト、制限付きセッションランナー | 事実に沿ったコピー |
| 5 | あらかじめ用意された検証ツール | PASS/FAIL の構造化レポート |
| 6 | スコープされた Wikipedia 調査セッション | 展示には含めない引用付きの背景情報 |
| 7 | インタラクティブページ | ブラウザーの `exhibit.html` |
| 8 | 達成のお祝いとリソース | 次のプロジェクトはここから |

7 つのハンズオンステップには約 90 分かかります。順番に完了してから、作成したものを祝い、最後のステップでリソースを調べます。

スターターには、書く必要がないはずの基盤処理がすでに含まれています: 承認済みのファクトセットとその上限、ファクト選択メニュー、ストリーミングプリンター、決定論的な展示検証、既定で拒否する権限ハンドラー付きのスコープされた Wikipedia MCP サーバー、単一ファイル `exhibit.html` への書き込み権限、システムメッセージ、展示構造用の固定プロンプトテキスト、調査リクエスト、ページ要件、コード周辺のエラー処理です。**ヘルパーファイルは決して編集しません。** 書くのは SDK コードです: セッション設定、ツール登録とセッション構成、展示プロンプトとページプロンプト内の指示、そして 1 つのセッションランナーです。

認証済みの GitHub Copilot CLI、使用する言語のランタイム、ターミナルが必要です。完成版アプリではなく、`start-museum/<language>` の下にある最小限のプロジェクトで直接作業します。`finished/<language>/museum-exhibit-studio` の下にある完成済みプロジェクトは、任意の参照資料にすぎません。

## ワークショップリポジトリをクローンする

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

スターターに移動する前に、ターミナルがリポジトリルートにあることを確認します:

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

このコマンドは、出力なしで正常終了する必要があります。

博物館アプリケーションは、使用する言語のスターターディレクトリ内で**その場で**構築します。コピー手順はありません。つまり、追跡対象のリポジトリファイルを編集するため、作業内容は変更済みファイルとして `git status` に表示されます。これは想定どおりで正しい状態です。クリーンなスターターからやり直したい場合は、リポジトリルートから `git checkout -- .` を実行して編集を破棄します。

ここで使用する言語のスターターディレクトリに移動し、Museum Exhibit Studio ワークショップのすべてのコマンドをそこで実行します。

:::language dotnet
.NET スターターに移動してから、そのローカルエントリポイントを復元、ビルド、実行します:

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

合格条件: ビルドが成功し、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in Helpers/.` を出力します。

ワークショップの残りは `start-museum/dotnet` で作業するため、このターミナルはこの場所のままにします。このフォルダーから `code .` を入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `Helpers/Curator*.cs` で、`MuseumExhibitStudio.Helpers` 名前空間にあります。各レッスンの変更はすべて `Program.cs` に書きます。
:::

:::language nodejs
Node.js スターターに移動します。そのロックファイルは SDK 1.0.11 と互換性のある `@github/copilot` 1.0.80 プラットフォームパッケージを保持しています:

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

合格条件: ビルドが成功し、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in src/curator.ts.` を出力します。

ワークショップの残りは `start-museum/nodejs` で作業するため、このターミナルはこの場所のままにします。このフォルダーから `code .` を入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `src/curator.ts` で、システムメッセージは `src/system-messages.ts` にあります。各レッスンの変更はすべて `src/index.ts` に書きます。
:::

:::language python
Python スターターに移動し、分離された仮想環境を作成して、SDK 1.0.11 をインストールします:

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

Windows では、インタープリターは `.venv/Scripts/python.exe` にあります。

合格条件: ソースがコンパイルされ、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in curator.py.` を出力します。

ワークショップの残りでは `start-museum/python` で作業するため、このターミナルはこのままにします。このフォルダーから `code .` と入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `curator.py` で、システムメッセージは `system_messages.py` にあります。各レッスンの変更はすべて `main.py` に書き込みます。
:::

:::language go
Go スターターに移動し、ロックされた SDK 1.0.11 の依存関係をダウンロードして、ビルドします:

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

合格条件: ビルドが成功し、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in curator.go.` を出力します。

ワークショップの残りでは `start-museum/go` で作業するため、このターミナルはこのままにします。このフォルダーから `code .` と入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `curator.go` で、システムメッセージは `system_messages.go` にあります。どちらも同じ `main` パッケージ内にあります。各レッスンの変更はすべて `main.go` に書き込みます。
:::

:::language rust
Rust スターターに移動し、ロックされた依存関係をフェッチして、チェックします:

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

合格条件: Cargo が `Cargo.lock` を変更せず、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in src/lib.rs.` を出力します。

ワークショップの残りでは `start-museum/rust` で作業するため、このターミナルはこのままにします。このフォルダーから `code .` と入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `museum_exhibit_studio` ライブラリクレートで、`src/lib.rs` にあり、システムメッセージは `src/system_messages.rs` にあります。各レッスンの変更はすべて `src/main.rs` に書き込みます。
:::

:::language java
Maven スターターに移動し、SDK 1.0.11 を解決してコンパイルし、付属の Maven Wrapper で実行します (Maven を別途インストールする必要はありません。Windows では `mvnw.cmd` を `./mvnw` の代わりに使用します):

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

合格条件: Maven が成功し、プログラムが `=== Museum Exhibit Studio starter ===` を出力し、その後に `Pre-built curator helpers are ready in src/main/java/workshop/.` を出力します。

ワークショップの残りでは `start-museum/java` で作業するため、このターミナルはこのままにします。このフォルダーから `code .` と入力して VS Code で開くか、お好みのエディターでフォルダーを開きます。

ヘルパーモジュールは `src/main/java/workshop/Curator*.java` です。各レッスンの変更はすべて `src/main/java/workshop/MuseumExhibitStudio.java` に書き込みます。
:::

## 編集のしくみ

上のセットアップブロックの末尾で指定されたエントリポイントを開きます。コードを書く場所はすべて、2 つのマーカーコメントで囲まれた名前付き**リージョン**です:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

`BEGIN` 行にはそのリージョンに触れるすべてのステップが列挙されているため、ファイルはワークショップの地図も兼ねます。レッスン内の各コードブロックは、そのリージョン名と 2 つの操作のどちらかを示す行で導入されます:

| 操作 | リージョンの状態 | 行うこと |
|---|---|---|
| **INSERT** | 空 | 2 つのマーカー行の間にブロックを貼り付けます。 |
| **REPLACE** | 以前のステップのコードが入っている | 2 つのマーカー行の間をすべて削除してから、ブロックを貼り付けます。 |

ブロックは常にそのリージョンの完全な内容なので、コードを手作業でマージすることはありません。マーカー行と、リージョン外のコードは、そのまま正確に残してください。

## 信頼境界を確立する

| 制御 | できること |
|---|---|
| システムメッセージ | 役割、トーン、範囲、出力形式を導く |
| ツール許可リスト | セッションに存在するツールを正確に決める |
| アプリケーションコード | ツールの背後にあるデータを所有し、制限、タイムアウト、検証、クリーンアップを強制する |
| 人によるレビュー | すべての歴史的主張に裏付けがあるかを判断する |

教育担当者の承認済みの事実が唯一の承認済みソースであり、キュレーターはアプリケーション所有の 1 つのツールを通じてそこに到達します。モデルの記憶は検証済みの博物館知識ではなく、プロンプトガイダンスは認可境界ではありません。セッションが実際にできることを決めるのは、許可リストと権限ハンドラーだけです。

## 詳細情報

キュレーターの背後にある SDK は、このワークショップの外でドキュメント化されています。次のページを横に開いておくと役立ちます。

- [GitHub Copilot SDK how-tos](https://docs.github.com/en/copilot/how-tos/copilot-sdk): この事前準備で扱う前提条件を含む、GitHub 独自の SDK ドキュメントです。
- [Copilot SDK ドキュメントマップ](https://github.com/github/copilot-sdk/blob/main/docs/README.md): セットアップ、認証、機能、トラブルシューティングの索引です。
- [既定のセットアップ: バンドルされた CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md): SDK が Copilot CLI を見つけて起動する方法と、別のバイナリを指す方法です。
- [デバッグガイド](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md): 実行が出力を生成する前に失敗したとき、最初に確認する場所です。

:::language dotnet
- [.NET SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md): .NET SDK のパッケージのインストールと最小限の例です。
:::

:::language nodejs
- [Node.js SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md): Node.js SDK のパッケージのインストールと最小限の例です。
:::

:::language python
- [Python SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/python/README.md): Python SDK のパッケージのインストールと最小限の例です。
:::

:::language go
- [Go SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/go/README.md): Go SDK のモジュールのインストールと最小限の例です。
:::

:::language rust
- [Rust SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/rust/README.md): Rust SDK のクレートのインストールと最小限の例です。
:::

:::language java
- [Java SDK リファレンス](https://github.com/github/copilot-sdk/blob/main/java/README.md): Java SDK の依存関係座標と最小限の例です。
:::

続けて [ステップ 1: 最初のキュレーターセッション](museum-01-first-curator-session.md) に進みます。
