# SDK 101 スターター: Rust

[Rust 1.94 以降](https://rustup.rs/) と認証済みの Copilot アクセスが必要です。Windows では、既定の MSVC ツールチェーンにも C++ ビルドツールと Windows SDK が必要です。セッションの前に [Rust のインストール手順](https://doc.rust-lang.org/book/ch01-01-installation.html) を完了してください。

ワークショップリポジトリのルートから:

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

このフォルダーをエディターで開き (`code .`)、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある 4 つの番号付き編集に従って `src/main.rs` を編集します。その後、次を実行します:

```shell
cargo run --locked
```

変更前のエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。`src/workshop.rs` は編集せずに再利用します。

アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 Rust SDK API](https://github.com/github/copilot-sdk/tree/main/rust) を参照してください。
