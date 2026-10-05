# SDK 101 スターター: Node.js

[Node.js 22.12 以降](https://nodejs.org/) と認証済みの Copilot アクセスが必要です。

ワークショップリポジトリのルートから:

```shell
cd start-intro/nodejs
npm ci
```

このフォルダーをエディターで開き (`code .`)、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある 4 つの番号付き編集に従って `src/index.ts` を編集します。その後、次を実行します:

```shell
npm start
```

変更前のエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。`src/github-podcast-tools.ts`、`src/model-selector.ts`、`src/permission-prompt.ts` は編集せずに再利用します。

`npm run build` を実行すると、Copilot プロンプトを送信せずに型チェックできます。`npm test` を実行すると、Copilot 認証やネットワークリクエストなしで、モック化したフィード応答を使って RSS 解析の回帰を確認できます。アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 Node.js SDK API](https://github.com/github/copilot-sdk/tree/main/nodejs) を参照してください。
