# SDK 101 スターター: Go

[Go 1.24 以降](https://go.dev/dl/) と認証済みの Copilot アクセスが必要です。

ワークショップリポジトリのルートから:

```shell
cd start-intro/go
go mod download
```

このフォルダーをエディターで開き（`code .`）、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある番号付きの 4 つの編集に従って `main.go` を編集します。次に実行します:

```shell
go run .
```

手を加えていないエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。`helpers.go` と `permission_prompt.go` は編集せずに再利用します。

Copilot プロンプトを送信せずにコンパイルするには、`go build -mod=readonly ./...` を実行します。アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 Go SDK API](https://github.com/github/copilot-sdk/tree/main/go) を参照してください。
