# やり遂げました！

GitHub Copilot SDK を使って、最初のセッションから、ブラウザーで開いて探索できるインタラクティブレポートまで、Accessibility Reviewer を構築しました。作成したものを少し楽しんでください。

## 組み合わせたもの

- 選択したモデルを使用するストリーミング Copilot セッション。
- 権限がコードで適用される、アプリケーション所有の WCAG ガイダンスとスコープ付き Playwright MCP 検査。
- 動作するフィルターを備えたスタンドアロン HTML レポート内の、証拠に基づく検出事項。

各検出事項の背後にある証拠を確認し続けてください。生成されたレポートはアクセシビリティの調査に役立ちますが、ページがすべての WCAG 要件を満たしていることを証明するものではありません。

## プロジェクトと SDK

作業内容を完成版プロジェクトと比較するか、SDK を次のアプリケーションに取り入れます。

:::language dotnet
- [完成版 .NET Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/dotnet/accessibility-report)
- [GitHub Copilot SDK for .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
:::
:::language nodejs
- [完成版 Node.js Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report)
- [GitHub Copilot SDK for Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs)
:::
:::language python
- [完成版 Python Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report)
- [GitHub Copilot SDK for Python](https://github.com/github/copilot-sdk/tree/main/python)
:::
:::language go
- [完成版 Go Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/accessibility-report)
- [GitHub Copilot SDK for Go](https://github.com/github/copilot-sdk/tree/main/go)
:::
:::language rust
- [完成版 Rust Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/accessibility-report)
- [GitHub Copilot SDK for Rust](https://github.com/github/copilot-sdk/tree/main/rust)
:::
:::language java
- [完成版 Java Accessibility Reviewer](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/accessibility-report)
- [GitHub Copilot SDK for Java](https://github.com/github/copilot-sdk/tree/main/java)
:::

## 詳細情報

- [Copilot SDK cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook): 学んだことを土台に構築するための実践的なレシピ。
- [Copilot SDK documentation](https://github.com/github/copilot-sdk/tree/main/docs): セッション構成、ツール、認証、デプロイのガイダンス。
- [Playwright MCP](https://github.com/microsoft/playwright-mcp): アプリケーションの許可リストを狭く保ちながら、ブラウザー機能を探索する方法。
- [Model Context Protocol](https://modelcontextprotocol.io/): エージェントが使用した外部ツールの背後にある標準を理解するための資料。

## 構築を続ける

管理している別のページを試すか、同じセッションとツールのパターンを別の開発者ワークフローに適応させます。新しい機能を追加する前に、アプリケーションが何を適用する必要があるかを決めてください。

下の **ワークショップハブに戻る** を使用して、選択した言語で Museum Exhibit Studio を試すか、前のステップに戻ってインタラクティブレポートを改善します。
