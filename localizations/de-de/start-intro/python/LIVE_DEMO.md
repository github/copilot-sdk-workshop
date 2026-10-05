# Die GitHub Podcast-Live-Demo: Python

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Computer noch nicht authentifiziert ist.
2. Erstellen Sie vor der zeitlich begrenzten Sitzung eine Umgebung im enthaltenen Starterprojekt:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Verwenden Sie unter macOS/Linux `.venv/bin/python` statt `.\.venv\Scripts\python.exe`.

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Beginnen Sie mit `main.py`. Die Datei enthält absichtlich benannte Platzhalter für `client`, `is_authenticated` und `session`. Lassen Sie den Streaming-Ereignishandler und die Wartezeit bis zum Abschluss unverändert.

### 1. Client starten

Ersetzen Sie `client: CopilotClient` durch:

```python
client = CopilotClient()
await client.start()
```

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `is_authenticated = False` und den zugehörigen `if`-Block durch:

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Sitzung erstellen

Ersetzen Sie `session = None` durch:

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

Erweitern Sie den SDK-Import oben in der Datei:

```python
from copilot import CopilotClient, PermissionHandler
```

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt, Streaming aktiviert, und der Ereignishandler unten gibt bereits jedes Textfragment aus, sobald es ankommt.“

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Ersetzen Sie alles von `# Step 5: Send the first message.` bis zum Ende von `main()` durch diesen
eingerückten Block. Behalten Sie den `if __name__ == "__main__":`-Block des Moduls bei:

```python
    try:
        await session.send(
            "Hello world! In one sentence, say what the Copilot SDK helps a Python app do."
        )
        await asyncio.wait_for(done.wait(), timeout=60)
        if error is not None:
            raise error
        print()
    finally:
        await session.disconnect()
        await client.stop()
```

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, auf Ereignisse lauschen und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Führen Sie diesen Hello World-Checkpoint aus `start-intro/python` aus:

```powershell
.\.venv\Scripts\python.exe main.py
```

Unter macOS/Linux:

```bash
.venv/bin/python main.py
```

Erwartete Ausgabe: eine gestreamte Antwort in einem Satz, gefolgt von `SessionIdleData`, wodurch das Programm abgeschlossen wird.

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Verwenden Sie nach Hello World die vorab geschriebenen Hilfsfunktionen, um dieselbe Sitzung in einen auf Fakten gestützten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Fügen Sie Importe hinzu:

```python
from github_podcast_tools import (
    get_latest,
    get_latest_github_podcast_episodes,
    get_github_podcast_episode,
    pick_episode,
)
from model_selector import select_model
from permission_prompt import permission_prompt
```

Beschränken Sie den SDK-Import wieder, da `permission_prompt` unten `PermissionHandler` ersetzt:

```python
from copilot import CopilotClient
```

Nach der Authentifizierungsprüfung:

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Erstellen Sie die Sitzung mit Tools:

```python
session = await client.create_session(
    model=model,
    streaming=True,
    tools=[get_github_podcast_episode, get_latest_github_podcast_episodes],
    available_tools=["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
    on_permission_request=permission_prompt,
    system_message={
        "mode": "replace",
        "content": "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
    },
)
```

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng begrenzte, typisierte Fähigkeiten, nehme sie nach Namen in die Zulassungsliste auf und tausche den Alles-genehmigen-Handler von Hello World gegen einen aus, der mich auffordert, damit ich der Genehmigungspunkt bleibe, bevor ein Tool ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet replace, nicht append. Meine Anwendung liefert die vollständige Agentenidentität und die Fundierungsregel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Ersetzen Sie den Prompt durch:

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Behalten Sie Ereignishandler, Wartezeit bis zum Abschluss und Bereinigung unverändert bei. Ersetzen
Sie nur den `session.send(...)`-Aufruf im vorhandenen `try`-Block. Aktualisieren Sie die
Modellstatuszeile, sodass sie das ausgewählte `model` ausgibt.

Führen Sie den fertigen Podcast-Agenten aus demselben Ordner aus:

```powershell
.\.venv\Scripts\python.exe main.py
```

Unter macOS/Linux:

```bash
.venv/bin/python main.py
```

Erwartete Meilensteine: Modellauswahl, Auswahl aus zehn Episoden, `[Tool call started]`, Genehmigungs-Prompt, `[Tool call complete]`, danach gestreamter Launch-Text.
