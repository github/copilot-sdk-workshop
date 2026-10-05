# Schritt 7: Die Anwendung ausführen und erklären

> **Dauer:** 10 Minuten

## Was Sie anschließend erklären können

Sie führen die vollständige Anwendung aus und erklären ihren Zustand, Tool-Grenzen, die
Berechtigungsgrenze und die Grenzen des Berichts.

## Das gesamte Agentensystem betrachten

:::language dotnet
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

Der fertige Bericht befindet sich außerdem im Projekt
[`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report).
:::

:::language python
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

Der fertige Bericht befindet sich außerdem im Projekt
[`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report).
:::

:::language go
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
Die fertige Anwendung ist ein Agent-Host. Ihre Sitzung koordiniert ein Modell, eine anwendungseigene
Funktion und einen Browser, der in einem anderen Prozess läuft:

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## Das Design über diesen Workshop hinaus nutzen

Wenn Sie diese Grenzen verstehen, können Sie das Design in einer anderen Anwendung wiederverwenden,
anstatt nur den Workshop-Code zu reproduzieren. Eine Datenbanksuche, ein Bereitstellungsdienst oder
ein Issue-Tracker können andere Tools verwenden, aber es gelten dieselben Fragen zu Zuständigkeit
und Vertrauen.

:::language dotnet
Der vollständige Ablauf ist
`URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report`.
:::

:::language nodejs
Der vollständige Ablauf ist
`URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report`.
:::

:::language python
Der vollständige Ablauf ist
`URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report`.
:::

:::language go
Der vollständige Ablauf ist
`URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report`.
:::

:::language rust
Der vollständige Ablauf ist
`URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report`.
:::

:::language java
Der vollständige Ablauf ist
`URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report`.
:::

## Eine Ehrenrunde drehen

Es gibt keinen Code zu ändern. Behalten Sie die Implementierung aus Schritt 6 bei, damit dieser Lauf
die Anwendung testet, die Sie erstellt haben.

## Ausführen

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Java-Warnung zur lokalen Demo:** Dieses explizite Flag ist eine temporäre Problemumgehung für
> [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273). Ohne dieses Flag
> schlägt der Callback geschlossen fehl, sofern er nicht die exakte URL aus dem Berechtigungs-Payload verifizieren kann. Damit
> genehmigt die Sitzung nur die Berechtigungsart `mcp`, jeweils eine Anforderung, im Rahmen der konfigurierten
> Playwright-`browser_navigate`-Zulassungsliste; sie kann das exakte Ziel nicht erzwingen. Verwenden Sie es nur für das
> kontrollierte lokale Workshop-Ziel, niemals für Produktion, gemeinsam genutzte oder nicht vertrauenswürdige URLs.
:::
Verwenden Sie das Workshop-Ziel:

```text
{{TARGET_APP_URL}}
```

Achten Sie auf alle fünf Phasen:

1. Der Client stellt eine Verbindung her und erstellt eine Sitzung.
2. Playwright navigiert zum exakten Ziel und erstellt einen Barrierefreiheits-Snapshot.
3. Der eng gefasste lokale Reader gibt diesen Snapshot des aktuellen Laufs zurück.
4. Der lokale Katalog wird für browsergestützte Befunde aufgerufen.
5. Die Antwort folgt dem Berichtskontrakt und nennt ihre Grenzen.

:::language dotnet
Ihr Transkript variiert, sollte aber diese Form haben:

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
Ihr Transkript variiert, sollte aber diese Form haben:

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse` gibt Tool-Start-/Fertig-Zeilen aus und streamt den Assistententext nach stdout.
:::

:::language python
Ihr Transkript variiert, sollte aber diese Form haben:

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py` startet `report.main`, das nach dem Streamen von Deltas auf `session.idle` wartet.
:::

:::language go
Ihr Transkript variiert, sollte aber diese Form haben:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Erklären Sie, dass `Client` für den Lebenszyklus der Copilot CLI zuständig ist, `Session` eine
Unterhaltung verwaltet und der Berechtigungshandler externe Navigation beschränkt. Der erwartete
Bericht ist an Nachweise gebunden.
:::

:::language rust
Ihr Transkript variiert, sollte aber diese Form haben:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Erklären Sie, dass `Client` die Runtime verwaltet, `Session` Ereignisse verteilt, typisierte Tools
anwendungseigen sind und der Berechtigungshandler nur exakter Navigation vertraut.
:::

:::language java
Ihr Transkript variiert, sollte aber diese Form haben:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Erklären Sie, dass Maven die Java-17-Anwendung kompiliert, `CopilotClient` die Runtime verwaltet und
Tools weiterhin bereichsgebunden bleiben. Standardmäßig akzeptiert der Berechtigungs-Callback nur
die kanonische URL; mit dem expliziten lokalen Demo-Flag ist er auf die konfigurierte Art `mcp`
beschränkt, kann diese URL aber nicht verifizieren.
:::

Das kontrollierte Ziel enthält absichtlich im Browser beobachtbare Probleme: eine fehlende
Textalternative, keine `main`-Landmark, eine unlogische Überschriftenfolge und ein Textfeld ohne
barrierefreien Namen. Vergleichen Sie den Bericht mit dem
[veröffentlichten Ziel-HTML](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html);
akzeptieren Sie keinen Befund, der sowohl im Snapshot als auch im Quelltext fehlt.

<details>
<summary>Fehlerbehebung für den vollständigen Lauf</summary>

| Symptom | Behebung |
|---|---|
| Ein bekanntes Problem wird ausgelassen | Die Agent-Ausgabe kann variieren. Führen Sie den Lauf einmal erneut aus, verlangen Sie aber Nachweise, statt eine vorgegebene Antwort zu erzwingen. |
| Ein gemeldetes Problem ist nicht auf der Seite | Verwerfen Sie es als nicht fundiert; der Prompt verlangt konkrete Browser-Nachweise. |
| Ein Tool wird abgelehnt | Prüfen Sie, ob `browser_navigate` das exakt eingegebene Ziel verwendet. |
| Der Reader findet keinen Snapshot | Behalten Sie die Prompt-Reihenfolge bei: vor dem Aufruf von `read_latest_accessibility_snapshot` navigieren. |
| Die Runtime kann nicht starten | Authentifizieren Sie sich mit `copilot login` erneut, bestätigen Sie, dass die CLI auf dem `PATH` liegt, und führen Sie den Ausführungsbefehl für Ihre Sprache erneut aus. |

</details>

> **Dieser Schritt ist abgeschlossen, wenn:** der Bericht fundiert ist, die Tool-Namen sichtbar sind
> und Sie die Architekturfragen unten beantworten können, ohne den Code zu lesen.

## Verständnis prüfen

1. Welcher Zustand gehört zur Sitzung?
2. Warum ist der WCAG-Katalog lokal?
3. Warum ist Playwright extern?
4. Wo werden Berechtigungen erzwungen?
5. Was ändert sich, wenn ein weiterer MCP-Server hinzugefügt wird?

<details>
<summary>Vergleichen Sie Ihre Erklärung</summary>

1. Zur Sitzung gehören die Nachrichten, die Modellantwort und die Tool-Ergebnisse einer Unterhaltung.
2. Die Anwendung besitzt die Katalogdaten und die deterministische Suche, sodass die Funktion lokal bleibt.
3. Playwright ist eine wiederverwendbare Browser-Fähigkeit mit eigenem Node.js-Prozess und eigenen Abhängigkeiten.
4. Die MCP-Tool-Zulassungsliste stellt nur Navigation bereit, und der Berechtigungshandler genehmigt nur
   das exakte Ziel. Der vertrauenswürdige lokale Reader akzeptiert keinen Pfad und liest nur einen neu generierten
   Snapshot; der Katalog ist ebenfalls schreibgeschützt. Diese anwendungseigenen Tools überspringen die Berechtigungsprüfung.
5. Fügen Sie die Serverkonfiguration hinzu, geben Sie nur benötigte Tools frei, definieren Sie die Vertrauensrichtlinie und beobachten Sie
   die Aufrufe des Servers weiterhin über denselben Ereignisstream der Sitzung.

</details>

## Nächster Schritt

Fahren Sie mit [Schritt 8: Ein Modell auswählen](08-model-selection.md) fort, und verwandeln Sie
Ihre Befunde anschließend in einen interaktiven HTML-Bericht in Schritt 9.

## Weitere Informationen

Die Workshop-Anwendung läuft auf Ihrem Rechner. Diese Seiten behandeln, was sich ändert, wenn
dasselbe Design an anderer Stelle betrieben wird.

- [Backenddienste](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md):
  das SDK serverseitig mit einer headless CLI statt mit einer lokalen CLI ausführen.
- [Skalierung und Mehrmandantenfähigkeit](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md):
  horizontale Skalierung und Isolationsmuster, die die Sitzung eines Benutzers von der eines anderen isoliert halten.
- [OpenTelemetry-Instrumentierung](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md):
  Tool-Aufrufe und Turns nachverfolgen, sobald der Agent dort läuft, wo Sie das Terminal nicht beobachten können.
- [Microsoft Agent Framework-Integration](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md):
  eine Copilot-Sitzung in einem größeren Multi-Agent-Workflow platzieren.
