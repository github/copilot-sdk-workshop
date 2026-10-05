# 事前準備: SDK 101 の準備をする

> **所要時間:** 30 分のワークショップ前の時間制限なしの準備

## 作成するもの

ストリーミングの Hello World から始め、それを The GitHub Podcast 用の小さなローンチアシスタントに作り変えます。SDK 接続とセッション構成を記述します。スターターには、エピソード検索ツールとターミナル選択ヘルパーがすでに含まれています。

4 つの時間制レッスンは合計 **30 分** です。SDK の基本 (5)、Hello World (10)、ポッドキャストエージェント (12)、まとめ (3) です。インストール、認証、依存関係のダウンロードは事前に完了して、セッションを SDK に集中できるようにしてください。

## アクセスを確認する

Git、エディター、ターミナル、ネットワークアクセス、サポートされているモデルにアクセスできる有効な GitHub Copilot サブスクリプションまたは試用版が必要です。[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)をインストールし、ターミナルで次のコマンドを実行します:

```shell
git --version
copilot --version
copilot auth login
```

求められた場合は、ブラウザーでのサインインを完了します。ワークショップでは同じアカウントとターミナル環境を使用してください。トークンをソースファイルに貼り付けないでください。ポッドキャストの例では、[公式 RSS フィード](https://feeds.simplecast.com/ioCY0vfY)へのアクセスも必要です。

## スターターを取得する

6 つすべての SDK 101 スターターと、あらかじめ用意されたヘルパーは、**このワークショップリポジトリ** の `start-intro/` に含まれています。1 回だけクローンします:

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

このリポジトリをすでにクローンしている場合は、そのチェックアウトを使用してください。別のリポジトリをクローンしたり、スタータープロジェクトをコピーしたりしないでください。以下から 1 つの言語だけを選びます。すべてのコマンドはこのリポジトリのルートから開始します。その言語のランタイムだけをインストールしてください。既存の依存関係バージョンを維持します。プロジェクトをスキャフォールディングしたり、SDK を再度インストールしたりする必要はありません。

各言語フォルダーには **`LIVE_DEMO.md`** も含まれています。エントリポイントの横で開いてください。時間制限付きセッションでは、第 1 幕の番号付き 4 つの編集を行い、Hello World を実行してから、同じファイルとアプリケーションで第 2 幕に進みます。

:::language dotnet
### .NET を準備する

[.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) をインストールします。

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

`start-intro/dotnet` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `Program.cs` です。後でこのフォルダーから `dotnet run` を実行します。

同梱ランタイムのダウンロードがブロックされる場合の `COPILOT_CLI_BINARY_PATH` を含む CLI の検出方法については、[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md) を参照してください。
:::

:::language nodejs
### Node.js を準備する

[Node.js 22.12 以降](https://nodejs.org/) をインストールします。

```shell
node --version
cd start-intro/nodejs
npm ci
```

`start-intro/nodejs` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `src/index.ts` です。後でこのフォルダーから `npm start` を実行します。

[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md) を参照してください。
:::

:::language python
### Python を準備する

[Python 3.11 以降](https://www.python.org/downloads/) をインストールします。分離環境を使用してください。Windows PowerShell では次のようにします:

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux の場合:

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

`start-intro/python` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `main.py` です。レッスンでは環境のインタープリターを直接使用するため、アクティブ化や PowerShell の実行ポリシー変更は不要です。

[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md) を参照してください。
:::

:::language go
### Go を準備する

[Go 1.24 以降](https://go.dev/dl/) をインストールします。

```shell
go version
cd start-intro/go
go mod download
```

`start-intro/go` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `main.go` です。後でこのフォルダーから `go run .` を実行します。

[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md) を参照してください。
:::

:::language java
### Java を準備する

[Java 17 以降](https://adoptium.net/) をインストールします。個別に Maven をインストールする必要はありません: スターターには Maven Wrapper (`./mvnw`) が含まれており、初回使用時に適切な Maven バージョンをダウンロードします。Windows では `mvnw.cmd` を `./mvnw` の代わりに実行します。

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

`start-intro/java` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `src/main/java/demo/CopilotSdkLiveDemo.java` です。後でこのフォルダーから `./mvnw compile exec:java` を実行します。

[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md) を参照してください。
:::

:::language rust
### Rust を準備する

[Rust 1.94 以降](https://rustup.rs/) をインストールします。Windows では、既定の MSVC ツールチェーンにも [Rust インストールガイド](https://doc.rust-lang.org/book/ch01-01-installation.html) に記載されている C++ ビルドツールと Windows SDK が必要です。セッション前にそのセットアップを完了してください。

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

`start-intro/rust` をエディターで開きます (VS Code の場合は `code .`)。エントリポイントは `src/main.rs` です。後でこのフォルダーから `cargo run --locked` を実行します。事前チェックでコンパイルキャッシュがウォームアップされます。初回の Rust 依存関係ビルドには追加の準備時間を見込んでください。

[スターター README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md) を参照してください。
:::

## 準備完了チェック

認証が完了し、依存関係がダウンロードされ、選択したエントリポイントがエディターで開かれていれば準備完了です。未変更のエントリポイントは**意図的に未完成**です: プレースホルダーによってコンパイルに失敗したり、実際のログインを確認せずに認証メッセージが表示されたりすることがあります。これを動作するアプリケーションとして扱わないでください。Hello World レッスンでそれらを埋めます。

スターターのヘルパーファイルは変更しないでください。`start-intro/` 内でプロジェクトをその場で育てます。編集内容が `git status` に表示されますが、これは想定どおりです。

## セッション前のトラブルシューティング

- **CLI が見つからない:** CLI のインストールを完了し、ターミナルを開き直してください。SDK がネイティブ実行可能ファイルを見つけられない場合は、言語のスターター README に従ってください。
- **サインインに失敗する:** セッション前にサブスクリプション、組織ポリシー、ブラウザーアカウントを確認してください。ログインが成功しただけではモデルへのアクセスは保証されません。
- **依存関係のダウンロードに失敗する:** プロキシまたはパッケージレジストリへのアクセスを今解決してください。固定された依存関係を無関係な SDK バージョンに置き換えないでください。
- **RSS フィードがブロックされる:** ポッドキャストレッスンの前に公式フィードへのアクセスを解決してください。作り上げたエピソードの事実で代用しないでください。

続けて [SDK の基本](intro-01-sdk-basics.md) に進みます。

## 詳細情報

- [同梱のイントロスターター](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [公式 Copilot SDK](https://github.com/github/copilot-sdk)
