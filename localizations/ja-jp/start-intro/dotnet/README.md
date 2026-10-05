# SDK 101 スターター: .NET

[.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) と認証済みの Copilot アクセスが必要です。

ワークショップリポジトリのルートから:

```shell
cd start-intro/dotnet
dotnet restore
```

このフォルダーをエディターで開き（`code .`）、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある番号付きの 4 つの編集に従って `Program.cs` を編集します。次に実行します:

```shell
dotnet run
```

手を加えていないエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。あらかじめ用意された `Helpers/` と `Tools/` のコードは編集せずに再利用します。

SDK には互換性のあるランタイムがバンドルされています。そのダウンロードがブロックされる場合、または CLI が見つからない場合は、先にネイティブの Copilot CLI をインストールして認証します。リポジトリの `Directory.Build.props` は一般的な CLI の場所を認識します。別のインストールを使用する場合は、`COPILOT_CLI_BINARY_PATH` をそのネイティブ実行可能ファイルに設定します。たとえば Windows PowerShell では:

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 .NET SDK API](https://github.com/github/copilot-sdk/tree/main/dotnet) を参照してください。
