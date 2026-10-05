# SDK 101-Starterprojekt: Python

Erfordert [Python 3.11 oder neuer](https://www.python.org/downloads/) und authentifizierten Copilot-Zugriff.

Vom Stammverzeichnis des Workshop-Repositorys aus in Windows PowerShell:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Unter macOS/Linux:

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie `main.py`, indem Sie den vier
nummerierten Änderungen im Ersten Akt von [LIVE_DEMO.md](LIVE_DEMO.md) folgen. Führen Sie unter
Windows `.\.venv\Scripts\python.exe main.py` oder unter macOS/Linux `.venv/bin/python main.py` aus.
Die direkte Verwendung des Interpreters vermeidet Aktivierungs- und
Ausführungsrichtlinienänderungen.

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem Zweiten Akt für den Podcast-Agenten fort. Verwenden Sie
`github_podcast_tools.py`, `model_selector.py` und `permission_prompt.py` wieder, ohne sie zu
bearbeiten.

Informationen zu Zugriffsprüfungen und Problembehebung finden Sie unter
[Vorbereitung](../../workshop/intro-00-preflight.md), die
[offizielle Python-SDK-API](https://github.com/github/copilot-sdk/tree/main/python) dient als
Referenz.
