# SDK 101 スターター: Java

[Java 17 以降](https://adoptium.net/) と認証済みの Copilot アクセスが必要です。Maven Wrapper (`./mvnw`) が含まれているため、Maven を別途インストールする必要はありません。Windows では、`./mvnw` の代わりに `mvnw.cmd` を実行します。

ワークショップリポジトリのルートから:

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

このフォルダーをエディターで開き (`code .`)、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある 4 つの番号付き編集に従って `src/main/java/demo/CopilotSdkLiveDemo.java` を編集します。その後、次を実行します:

```shell
./mvnw compile exec:java
```

変更前のエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。`demo` パッケージのツール、モデル選択、権限ヘルパークラスを再利用します。

`./mvnw compile` を実行すると、Copilot プロンプトを送信せずにコンパイルできます。アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 Java SDK API](https://github.com/github/copilot-sdk/tree/main/java) を参照してください。
