# 事前準備: マシンをセットアップする

> **時間計測外の準備**  
> 115 分のワークショップを開始する前に、このページを完了してください。

## 準備できるもの

事前準備が終わるまでに、リポジトリのクローン、Copilot CLI の認証、スタータープロジェクトのビルド、Playwright MCP のダウンロードと準備が完了します。

モデル選択とインタラクティブな HTML レポートを含む 9 つのハンズオンステップをすべて実施し、最後に達成を祝い、さらに構築を続けるためのリソースを確認します。

:::language dotnet
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | C# コンソールアプリケーションをビルドして実行します | `dotnet --version` |
| [Node.js 22 以降](https://nodejs.org/) | Playwright MCP サーバーを実行します | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK で使用する Copilot ランタイムを提供します | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ dotnet --version
10.0.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```
:::

:::language nodejs
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [Node.js 22.12 以降](https://nodejs.org/) | TypeScript ワークショップアプリと Playwright MCP を実行します | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | `@github/copilot-sdk` とビルドツールをインストールします | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK で使用する Copilot ランタイムを提供します | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

公式の [Node.js SDK インストールガイド](https://github.com/github/copilot-sdk/tree/main/nodejs) を参照してください。
:::

:::language python
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [Python 3.11 以降](https://www.python.org/downloads/) | 非同期ワークショップアプリケーションを実行します | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | ピン留めされた `github-copilot-sdk` wheel をインストールします | `python -m pip --version` |
| [Node.js 22 以降](https://nodejs.org/) | Playwright MCP サーバーを実行します | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | `COPILOT_CLI_PATH` 経由でローカルランタイムを任意で上書きするために使用します | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Python SDK は初回使用時にピン留めされたランタイムをダウンロードできます。公式の [Python SDK インストールガイド](https://github.com/github/copilot-sdk/tree/main/python) を参照してください。
:::

:::language go
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [Go 1.24 以降](https://go.dev/dl/) | Go ワークショップモジュールをビルドして実行します | `go version` |
| [Node.js 22 以降](https://nodejs.org/) | Playwright MCP サーバーを実行します | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK 用に `PATH` (または `COPILOT_CLI_PATH`) 上に必要です | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

公式の [Go SDK インストールガイド](https://github.com/github/copilot-sdk/tree/main/go) を参照してください。
:::

:::language rust
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [Rust 1.94 以降](https://rustup.rs/) | 非同期 Rust ワークショップクレートをビルドします | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | ロックされた依存関係を解決し、アプリを実行します | `cargo --version` |
| [Node.js 22 以降](https://nodejs.org/) | Playwright MCP サーバーを実行します | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | バンドルされたバイナリだけに依存しない場合に使用されるランタイムです | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ rustc --version
rustc 1.94.x
$ cargo --version
cargo 1.94.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

公式の [Rust SDK インストールガイド](https://github.com/github/copilot-sdk/tree/main/rust) を参照してください。
:::

:::language java
## 必要なもの

| 要件 | ワークショップで必要な理由 | 確認 |
|---|---|---|
| [Java 17 以降](https://adoptium.net/) (JDK) | Maven ワークショップアプリをコンパイルして実行します | `java -version` |
| [Node.js 22 以降](https://nodejs.org/) | Playwright MCP サーバーを実行します | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Java SDK ランタイム用に `PATH` 上に必要です | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot リクエストを承認します | `copilot login` |
| Microsoft Edge (既定) または Google Chrome | Playwright が対象ページを検査できるようにします | ワークショップ前にブラウザーを一度開く |

コマンドは次の形の出力を返すはずです:

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Maven を別途インストールする必要はありません。各 Java プロジェクトには Maven Wrapper (`./mvnw`) が含まれており、初回使用時に適切な Maven バージョンをダウンロードします。Windows では、`./mvnw` の代わりに `mvnw.cmd` を実行します。このトラックでは Maven を使用します。JBang や Gradle に置き換えないでください。公式の [Java SDK インストールガイド](https://github.com/github/copilot-sdk/tree/main/java) を参照してください。
:::

## 1. リポジトリをクローンしてスターターを選択する

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

**リポジトリ内で直接**作業します。コピー手順はありません。使用する言語のスターターディレクトリに移動し、ワークショップ全体を通してそこにとどまります。つまり、追跡対象のリポジトリファイルを編集するため、変更は `git status` に表示されます。これは想定どおりです。クリーンなスターターに戻したい場合は、リポジトリルートから `git checkout -- .` を実行して編集を破棄します。

## 2. Copilot を認証する

[公式セットアップガイド](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) の方法で CLI をインストールし、次を実行します:

```bash
copilot login
```

後続の SDK 呼び出しが GitHub Copilot に到達できるように、ブラウザーでのフローを完了します。

## 3. Playwright MCP をウォームアップする

これを 1 回実行して、ピン留めされたパッケージをダウンロードし、サーバーを起動せずにオプションを表示します:

```bash
npx -y @playwright/mcp@0.0.78 --help
```

全員が同じツール名と動作を確認できるように、パッケージバージョンはピン留めされています。コードは Microsoft Edge を `--browser=msedge` で使用します。代わりに Google Chrome を準備した場合は、ステップ 4 で引数が表示されたときに `--browser=chrome` を使用してください。

:::language dotnet
## 4. スターターに移動してビルドする

後で `dotnet build` が Copilot CLI を見つけられない場合は、現在のターミナル用にパスを設定します:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

.NET スターターに移動してビルドします。以降のすべてのステップでは、このディレクトリにとどまってください:

```bash
cd start-accessibility/dotnet
dotnet build
```

ビルドが成功すると、最後に次のように表示されます:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

ワークショップの残りの部分では `start-accessibility/dotnet` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `copilot` が認識されない | インストール後にターミナルを再起動するか、上記のコマンドで `COPILOT_CLI_BINARY_PATH` を設定します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| NuGet restore がパッケージソースに到達できない | プロキシまたはパッケージソースの設定を確認してから、`dotnet restore` を実行します。 |
| `npx` が認識されない | Node.js 22 以降をインストールし、ターミナルを再起動します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** `dotnet build` が成功し、`copilot login` が完了し、対象ページが開くこと。
:::

:::language nodejs
## 4. スターターに移動してビルドする

後で SDK が Copilot CLI を見つけられない場合は、現在のターミナル用にインストール先を指定します:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Node.js スターターに移動し、依存関係をインストールして、型チェックを実行します。以降のすべてのステップでは、このディレクトリにとどまってください:

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

型チェックが成功すると TypeScript エラーは表示されません (`tsc --noEmit` の出力は空です)。`package.json` の start スクリプトは `tsx src/index.ts` です。

ワークショップの残りの部分では `start-accessibility/nodejs` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `node` または `npm` が認識されない | Node.js 22.12 以降をインストールし、ターミナルを再起動します。 |
| Node バージョンに関するエンジン警告 | Node.js 22.12+ にアップグレードします。スターターでは `"node": ">=22.12.0"` が宣言されています。 |
| `npm install` がロックファイルで失敗する | `start-accessibility/nodejs` にとどまり、`package-lock.json` を保持します。削除しないでください。 |
| `copilot` が認識されない | インストール後にターミナルを再起動するか、上記のコマンドで `COPILOT_CLI_PATH` を設定します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| `npx` が Playwright MCP をダウンロードできない | ネットワークアクセスを確認してから、セクション 3 のウォームアップコマンドを再実行します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** `npm run build` が成功し、`copilot login` が完了し、対象ページが開くこと。
:::

:::language python
## 4. スターターに移動してビルドする

任意: ランタイムをダウンロードする代わりに、インストール済み CLI を SDK に強制的に使用させます:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Python スターターに移動し、仮想環境を作成して、ピン留めされた依存関係をインストールし、コンパイルチェックを実行します。以降のすべてのステップでは、このディレクトリにとどまってください:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="venv-windows">
    <pre><code class="language-powershell">cd start-accessibility/python
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
  <div role="tabpanel" data-panel="venv-unix" hidden>
    <pre><code class="language-bash">cd start-accessibility/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
</div>

インストールが成功すると、`github-copilot-sdk==...` を含む解決済みパッケージが表示されます。コンパイルチェックが成功すると出力は表示されません。以降のステップのために、仮想環境を有効化したままにしてください。

ワークショップの残りの部分では `start-accessibility/python` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

任意で、最初のステップ 1 の実行が速くなるように、今すぐランタイムを事前ダウンロードします:

```bash
python -m copilot download-runtime
```

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `python` が Python 2 を指しているか、存在しない | Python 3.11+ (macOS/Linux では `python3`) を使用し、仮想環境を再作成します。 |
| `pip install` が PyPI に到達できない | プロキシ設定を確認してから、`python -m pip install -r requirements.txt` を再実行します。 |
| パッケージバージョンが正しくない | ピン留めされた `requirements.txt` からのみインストールし、`==` のピン留めを緩めないでください。 |
| 後でランタイムのダウンロードに失敗する | `python -m copilot download-runtime` を実行するか、`COPILOT_CLI_PATH` を動作する CLI に設定します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| `npx` が認識されない | Node.js 22 以降をインストールし、ターミナルを再起動します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** ピン留めされた依存関係のインストールが完了し、`py_compile` が成功し、`copilot login` が完了し、対象ページが開くこと。
:::

:::language go
## 4. スターターに移動してビルドする

Go SDK は、Copilot CLI が `PATH` 上にあること、または `COPILOT_CLI_PATH` で指定されていることを想定しています:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Go スターターに移動し、ロックを適用した状態でビルドします。以降のすべてのステップでは、このディレクトリにとどまってください:

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

ビルドが成功するとエラーは表示されず、スターターディレクトリにバイナリが生成されます。モジュール解決の決定性が保たれるように、`go.sum` はそのまま保持してください。

ワークショップの残りの部分では `start-accessibility/go` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `go: go.mod requires go >= 1.24` | Go 1.24 以降をインストールし、ターミナルを再度開きます。 |
| `missing go.sum entry` | コミット済みの `go.sum` を復元します。ロックを書き換える代わりに `-mod=readonly` でビルドします。 |
| モジュールのダウンロードがブロックされる | `GOPROXY`/プロキシアクセスを構成してから、スターターディレクトリからビルドを再試行します。 |
| `copilot` が認識されない | CLI をインストールし、ターミナルを再起動するか、`COPILOT_CLI_PATH` を設定します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| `npx` が認識されない | Node.js 22 以降をインストールし、ターミナルを再起動します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** `go build -mod=readonly ./...` が成功し、`copilot login` が完了し、対象ページが開くこと。

ステップ 1 の後で参照できる基準が必要な場合は、[`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk) と比較してください。
:::

:::language rust
## 4. スターターに移動してビルドする

後でランタイムの起動時に CLI を解決できない場合は、`COPILOT_CLI_PATH` を設定します:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS または Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Rust スターターに移動し、ロックファイルに照らしてチェックします。以降のすべてのステップでは、このディレクトリにとどまってください:

```bash
cd start-accessibility/rust
cargo check --locked
```

チェックが成功すると、最後に `Finished` 行が表示され、エラーはありません。クレートグラフがピン留めされたままになるように、`Cargo.lock` をコミット済みの状態で保持してください。

ワークショップの残りの部分では `start-accessibility/rust` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `rustc 1.xx is too old` | `rustup update` で Rust 1.94+ をインストールし、ターミナルを再度開きます。 |
| `--locked` でロックファイルが一致しない | スターターの `Cargo.lock` を保持します。制約のない `cargo update` は実行しないでください。 |
| クレートのダウンロードがブロックされる | crates.io へのネットワーク/プロキシアクセスを確認してから、`cargo check` を再試行します。 |
| 後でランタイムを起動できない | `copilot` をインストールして認証するか、`COPILOT_CLI_PATH` を設定します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| `npx` が認識されない | Node.js 22 以降をインストールし、ターミナルを再起動します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** `cargo check --locked` が成功し、`copilot login` が完了し、対象ページが開くこと。

ステップ 1 の後で参照できる基準が必要な場合は、[`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk) と比較してください。
:::

:::language java
## 4. スターターに移動してビルドする

Java SDK は、アプリケーションの起動時に Copilot CLI が `PATH` 上にあることを想定しています。ビルドする前に確認します:

```bash
copilot --version
```

Java スターターに移動し、Maven でコンパイルします。以降のすべてのステップでは、このディレクトリにとどまってください:

```bash
cd start-accessibility/java
./mvnw compile
```

コンパイルが成功すると、最後に次のように表示されます:

```text
[INFO] BUILD SUCCESS
```

`pom.xml` では、`exec-maven-plugin` が `mainClass` `workshop.AccessibilityReport` で既に構成されています。このトラックでは Maven を使い続けてください。

ワークショップの残りの部分では `start-accessibility/java` で作業するため、このターミナルはここに置いておきます。このフォルダーから `code .` を入力して VS Code で開くか、好みのエディターでフォルダーを開いてください。

制御された対象ページを一度開き、到達できることを確認します:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>事前準備のトラブルシューティング</summary>

| 症状 | 対処法 |
|---|---|
| `java` が認識されない | JDK 17+ をインストールしてから、ターミナルを再起動します。 |
| `./mvnw: Permission denied` | `chmod +x mvnw` を実行するか、代わりに `sh mvnw` を使用します。Windows では `mvnw.cmd` を使用します。 |
| コンパイラーリリースエラー | `java -version` が 17 以降を報告することを確認します。POM では `maven.compiler.release` が 17 に設定されています。 |
| 依存関係のダウンロードに失敗する | Maven Central / プロキシ設定を確認してから、`./mvnw compile` を再実行します。 |
| ツールを切り替えたくなる | このワークショップでは Maven を JBang や Gradle に置き換えないでください。 |
| `copilot` が認識されない | CLI をインストールし、ターミナルを再起動して、`copilot --version` を確認します。 |
| Copilot から認証を求められる | `copilot login` を実行し、ブラウザーのフローを完了してから、再試行します。 |
| `npx` が認識されない | Node.js 22 以降をインストールし、ターミナルを再起動します。 |
| 後でブラウザーを起動できない | Edge または Chrome をインストールするか、[Playwright MCP ブラウザー構成](https://github.com/microsoft/playwright-mcp#configuration) に従います。 |

</details>

> **ステップ 1 を始める条件:** `./mvnw compile` が `BUILD SUCCESS` を表示し、`copilot login` が完了し、対象ページが開くこと。

ステップ 1 の後で参照できる基準が必要な場合は、[`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk) と比較してください。
:::

## 詳細情報

これからインストールする SDK のドキュメントは、このワークショップの外部にあります。ステップ 1 の前にブックマークしておく価値があるページは次のとおりです。

- [GitHub Copilot SDK のハウツー](https://docs.github.com/en/copilot/how-tos/copilot-sdk): GitHub 独自の SDK ドキュメントで、この事前準備が反映している前提条件も含まれています。
- [Copilot SDK ドキュメントマップ](https://github.com/github/copilot-sdk/blob/main/docs/README.md): セットアップ、認証、機能、トラブルシューティングのインデックスです。
- [既定のセットアップ: バンドルされた CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md): SDK が Copilot CLI を見つけて起動する方法と、別のバイナリを指定する方法です。
- [デバッグガイド](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md): 実行が出力を生成する前に失敗した場合、最初に確認する場所です。

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

[ステップ 1: 最初の Copilot セッションを作成する](01-first-session.md) に進みます。
