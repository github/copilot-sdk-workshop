# GitHub Copilot SDK ワークショップ

今すぐ開始: http://github.github.com/copilot-sdk-workshop/

.NET、Node.js/TypeScript、Python、Go、Rust、または Java で学べる、3 つのハンズオン GitHub Copilot SDK ワークショップから 1 つを選択します:

- **SDK 101 (30 分):** ストリーミングの Hello World から始め、[同梱の入門スターター](start-intro/README.md)に含まれるあらかじめ用意された RSS ツールを使用して、小さなポッドキャストエージェントを構築します。
- **Accessibility Reviewer:** Web ページを検査し、アプリケーションが所有する WCAG ガイダンスを参照して、証拠に基づくレポートを生成する SDLC 開発者ツールを構築します。
- **Museum Exhibit Studio:** 教育担当者が承認した事実を来館者向けの展示コピーに変換する、SDLC ではないキュレーターを構築します。決定論的な機能境界の背後で、ローカル検索を通じて引用付き Wikipedia 調査を任意で追加できます。

SDK を初めて使う場合は、SDK 101 から始めます。入門ワークショップとより深いワークショップを通して、次のことを行います:

1. Copilot クライアントと会話セッションを作成します。
2. 永続的なエージェントポリシーをタスク固有のデータから分離します。
3. 厳密にスコープ指定されたツール許可リストを使用して、ローカルツールと MCP ツールのどちらを使うかを選択します。
4. アプリケーションコードで、機能、入力、タイムアウト、検証、ライフサイクルの境界を適用します。
5. モデルが推論できることと、アプリケーションが証明する必要があることを説明します。

SDK 101 には、ちょうど 30 分のガイド付きレッスンがあります。Accessibility Reviewer は約 115 分、Museum Exhibit Studio は約 90 分を見込んでください。マシンのセットアップ、認証、依存関係のダウンロードは、各ワークショップの時間制限のない事前準備で別途行います。2 つのより深いワークショップには、それぞれのインタラクティブな HTML レッスンが含まれ、最後は達成のお祝いとリソースで締めくくられます。

## ワークショップを開始する

リポジトリの **Deploy to GitHub Pages** ワークフローによって生成された GitHub Pages URL を開きます。ワークショップの成果を選択し、言語を選択してから、選択したワークショップを開始します。このサイトは実行時に Pages のベース URL を導出するため、組織またはユーザーの Pages ホスト名はハードコードされていません。

クローンからサイトをプレビューするには:

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

<http://localhost:8000/docs/> を開きます。`file://` URL で `step.html` を開かないでください。ブラウザーはレッスンビューアーが使用する Markdown リクエストをブロックします。

## 使用する言語のワークショップ

このワークショップでは、ロケールに合わせて複数の言語を提供しています:

[English](../../README.md) | [한국어](../ko-kr/README.md) | 日本語 | [Português (Brasil)](../pt-br/README.md) | [Español](../es-es/README.md) | [Français](../fr-fr/README.md) | [Deutsch](../de-de/README.md)

さらに言語サポートを追加する場合は、[`docs/locale-registry.js`](../../docs/locale-registry.js) にロケールを追加し、`localizations/` ディレクトリの下にローカライズされたドキュメントを追加します。

## 前提条件

6 つすべてではなく、選択した言語のランタイムをインストールします。各トラックの事前準備では、該当する要件が示されます。Node.js SDK 101 にはバージョン 22.12 以降が必要で、その Java スターターには Maven 3.9 以降も必要です。

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 以降](https://nodejs.org/)
- [Python 3.11 以降](https://www.python.org/downloads/)
- [Go 1.24 以降](https://go.dev/dl/)
- [Rust 1.94 以降](https://rustup.rs/)
- [Java 17 以降](https://adoptium.net/)
- [GitHub Copilot CLI をインストールする](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- GitHub Copilot サブスクリプションまたは試用版
- ブラウザーベースの演習用の Microsoft Edge (ワークショップの既定) または Google Chrome

事前準備では、インストールチェック、認証、OS 固有のコマンド、想定される出力、トラブルシューティングを順に確認します。

## リポジトリのレイアウト

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## 変更を検証する

```bash
bash scripts/validate-workshop.sh
```

このコマンドは、レッスン構造、内部リンク、サイト動作フック、プロジェクトの網羅性、入門トラックの正確な 30 分レッスン枠をチェックします。また、各 Museum スターターに Museum レッスンを適用し、結果が完成版のエントリポイントと等しいことをチェックします。その後、ブラウザーに依存しない言語選択、サイトフロー、完了テストを実行し、Copilot を認証したり、ブラウザーを起動したり、プロンプトを送信したりせずに、すべての入門、アクセシビリティ、Museum スターター、すべての完成版プロジェクト、Blazor 対象を復元、ビルド、または構文チェックします。Museum プロジェクトにはテスト、モック、フィクスチャが同梱されていないため、そのターゲットは復元とビルドのみを行います。

1 つのスモークビルドターゲットを実行するには、言語 ID を渡します:

```bash
bash scripts/validate-workshop.sh nodejs
```

Pull Request では、コンテンツ検証と 6 つすべての言語のスモークビルドが別々の GitHub Actions ジョブとして実行されるため、失敗すると影響を受けた SDK トラックを特定できます。

## SDK 101 ワークショップ

[`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md) から始めます。時間制限のあるセッションの**前に**、選択したランタイムをインストールし、Copilot を認証して、依存関係をダウンロードします。4 つのガイド付きレッスンは、SDK の基本 (5 分)、ストリーミングで Hello World (10 分)、ポッドキャストエージェント (12 分)、まとめ (3 分) です。

学習者はこのリポジトリを 1 回だけクローンし、[`start-intro/<language>`](start-intro/README.md) のエントリポイントを編集します。スターターには、すべてのソースファイル、依存関係マニフェスト、ロックファイル、RSS 検索、モデルとエピソードの選択、インタラクティブなツール承認のためのあらかじめ用意されたヘルパーが含まれています。2 つ目のリポジトリクローンや、より長いワークショップは必要ありません。

スターターのエントリポイントの横にある `LIVE_DEMO.md` を開きます。ハンズオンワークショップは、ソースデモの**4 つの hello-world 編集**に沿って進みます。クライアントを開始し、認証を確認し、セッションを作成し、メッセージを送信します。同じアプリケーションで**第 2 幕**に進み、モデルとエピソードを選択し、機能を付与して、プロンプトを置き換えます。Web サイトはこれらのローカルガイドセクションを直接レンダリングするため、エディターガイドとオンラインワークショップで同じコードを学べます。

このトラックでは、クライアント/セッションのライフサイクル、ストリーミング、ローカルツールの登録、焦点を絞ったシステムメッセージ、権限を扱います。MCP、自動出力検証、HTML の総仕上げは、より深いワークショップで扱います。公開する前に、生成されたポッドキャストコピーをそのソースと照合して確認します。

## Museum Exhibit Studio ワークショップ

Museum Exhibit Studio スターターは `start-museum/<language>` の下にあり、完成した参照は `finished/<language>/museum-exhibit-studio` の下にあります。各スターターには、学習者が編集しない、あらかじめ用意されたキュレーターヘルパーモジュールが 1 つ同梱されています。承認済みの事実セットとその境界、事実選択メニュー、ストリーミングプリンター、決定論的な展示検証、既定で拒否する権限ハンドラーを備えたスコープ指定済み Wikipedia MCP サーバー、単一ファイル `exhibit.html` の書き込み権限、キュレーターと調査のシステムメッセージ (それぞれ専用ヘルパーファイル内)、固定のプロンプトテキスト (展示構造、調査リクエスト、ページ要件)、エントリポイントが出力する失敗メッセージが含まれます。

学習者は `start-museum/<language>` で直接作業し、レッスンを通じてその 1 つのプロジェクトを育て、各ステップで実行します。セッションのセットアップ、ツール登録、3 つのセッション構成 (それぞれが置換モードであらかじめ用意されたシステムメッセージをインストールします)、展示とページのプロンプト内の指示、ライフサイクルとタイムアウトを所有する 1 つのセッションランナーという SDK コードを記述します。完成版サンプルは、別個の参照アーキテクチャではなく、学習者が最終的に作るものです。

学習者がコードを書くすべての場所は、スターターのエントリポイント内の名前付きリージョンです。これらは 2 つのマーカーコメントで区切られ、`BEGIN` 行にはそのリージョンに触れるステップが列挙されています:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

各レッスンコードブロックは、``**REPLACE** region `generation-config` in `Program.cs`:`` のような行で導入され、そのリージョンの完全な内容を保持します。INSERT は空のリージョンを埋め、REPLACE は以前のステップでそこに置かれた内容を上書きします。マーカー行は移動せず、どのレッスンもファイル全体を置き換えません。コンテンツ検証は各レッスンブロックをスターターに適用し、結果が完成版アプリのエントリポイントと等しいことを要求するため、レッスンが完成版アプリからずれることはありません。Museum レッスンのコードを変更するときは、完成版エントリポイントも一致するように変更し、その逆も同様です。

学習者向けトラックは [`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md) から始まり、7 つのステップを進みます。最初のセッション、ストリーミング、キュレーターの語り口、承認済みの事実、構造チェック、Wikipedia MCP 調査、続いてインタラクティブな `exhibit.html` の総仕上げを行い、[達成のお祝いとリソース](workshop/museum-09-complete.md)で終了します。

使用可能な引用付き調査が存在する場合、キュレーターは展示解説文と来館者の質問を書く前に、`approved_fact_lookup` と読み取り専用の `approved_wikipedia_fact_lookup` を呼び出します。2 つ目のツールは、ライブの Wikipedia アクセスや人間が検証した事実ではなく、キャプチャされた調査を返します。承認済みの事実が優先され、辞退、失敗、または引用のない調査では単一ツールの生成パスが維持されます。構造検証は事実に基づいていることを証明しないため、公開前に調査済みの主張を確認してください。

Rust チェックは、すべてのワークショッププロジェクトで 1 つの Cargo ターゲットディレクトリを共有し、SDK 依存関係のコンパイルの繰り返しを避けます。

## デプロイ

検証に合格したら、`main` にプッシュします。[Pages ワークフロー](../../.github/workflows/deploy.yml)は、`docs/` に加えて `workshop/` の Markdown レッスンと `localizations/` の下の翻訳を公開します。ビルドとコンテンツ検証は、検証ワークフローで別々に実行されます。

リポジトリ設定で GitHub Pages を有効にし、ソースとして **GitHub Actions** を選択します。デプロイジョブは、その環境内で正規のワークショップ URL を報告します。

デプロイワークフローは、公開されたすべての HTML ページ、サイトアセット、Markdown レッスンを検証します。既定では、GitHub Pages から返された URL をチェックします。代わりに将来の公開ドメインまたはカスタムドメインを検証するには、リポジトリ Actions 変数 `WORKSHOP_SITE_URL` をそのサイトのベース URL に設定します。同じチェックを手動で実行することもできます:

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## 参考資料

- [GitHub Copilot SDK for .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK for Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK for Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK for Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK for Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK for Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Copilot SDK cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Copilot SDK API and source](https://github.com/github/copilot-sdk)
- [GitHub Copilot CLI をインストールする](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## ライセンス

このプロジェクトは [MIT License](../../LICENSE) の下でライセンスされています。

このワークショップは、教育目的で現状のまま提供されます。完全な本番サービスとしてではなく、概念とパターンを示すことを目的としています。
