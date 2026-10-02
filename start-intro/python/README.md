# SDK 101 starter: Python

Requires [Python 3.11 or newer](https://www.python.org/downloads/) and authenticated Copilot access.

From the workshop repository root, on Windows PowerShell:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

On macOS/Linux:

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Open this folder in your editor (`code .`) and edit `main.py` by following the
four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One.
Run `.\.venv\Scripts\python.exe main.py` on Windows or
`.venv/bin/python main.py` on macOS/Linux. Using the interpreter directly avoids
activation and execution-policy changes.

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse
`github_podcast_tools.py`, `model_selector.py`, and `permission_prompt.py`
without editing them.

See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official Python SDK API](https://github.com/github/copilot-sdk/tree/main/python)
for reference.
