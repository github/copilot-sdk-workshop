# SDK 101 スターター: Python

[Python 3.11 以降](https://www.python.org/downloads/) と認証済みの Copilot アクセスが必要です。

ワークショップリポジトリのルートから、Windows PowerShell で実行します:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux の場合:

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

このフォルダーをエディターで開き (`code .`)、[LIVE_DEMO.md](LIVE_DEMO.md) の第 1 幕にある 4 つの番号付き編集に従って `main.py` を編集します。Windows では `.\.venv\Scripts\python.exe main.py` を、macOS/Linux では `.venv/bin/python main.py` を実行します。インタープリターを直接使用すると、アクティブ化や実行ポリシーの変更を避けられます。

変更前のエントリポイントは意図的に未完成であり、動作する Hello World ではありません。ポッドキャストエージェントについては、同じガイドの第 2 幕に進みます。`github_podcast_tools.py`、`model_selector.py`、`permission_prompt.py` は編集せずに再利用します。

アクセスチェックとトラブルシューティングについては [事前準備](../../workshop/intro-00-preflight.md) を、リファレンスについては [公式 Python SDK API](https://github.com/github/copilot-sdk/tree/main/python) を参照してください。
