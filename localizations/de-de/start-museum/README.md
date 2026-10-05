# Museum Exhibit Studio-Starterprojekte

Wählen Sie das Verzeichnis für Ihre Workshop-Sprache aus und arbeiten Sie direkt darin. Nachdem Sie
in dieses Verzeichnis gewechselt sind, öffnen Sie denselben Ordner in Ihrem Editor (`code .` von
dort aus oder mit dem Befehl eines anderen Editors zum Öffnen von Ordnern) und lassen Ihr Terminal
dort. Diese Starterprojekte enthalten fixierte Abhängigkeiten, einen als benannte Regionen
angelegten Einstiegspunkt, ein vorgefertigtes Kurator-Hilfsmodul und eine vorgefertigte Datei mit
den Systemnachrichten. Die Hilfsdateien enthalten die Infrastruktur, die Sie nie schreiben müssen:
die freigegebenen Faktensätze, ihre Grenzen und das Menü, über das Lehrende sie auswählen oder
eingeben können, das vorgefertigte lokale Tool `approved_fact_lookup`, das diese Fakten an den
Kurator übergibt, das vorgefertigte lokale Tool `approved_wikipedia_fact_lookup`, das erfasste
Recherchen und Zitate zurückgibt, wenn verwertbare Recherche vorhanden ist, einen Drucker für
Streaming-Ausgaben, deterministische Ausstellungsvalidierung, den bereichsgebundenen
Wikipedia-MCP-Server und seinen standardmäßig ablehnenden Berechtigungshandler, die
Schreibberechtigung für die einzelne Datei `exhibit.html`, den festen Prompt-Text
(Ausstellungsstruktur, Rechercheanforderung und Seitenanforderungen), den `COPILOT_MODEL`-Lookup und
die Fehlermeldung. Die Systemnachrichten-Datei enthält die drei langen Nachrichten, unter denen die
Sitzungen ausgeführt werden: die des Kurators, die des Kurators, sobald Recherche verfügbar ist, und
die des Rechercheassistenten. Sie bearbeiten die Hilfsdateien nie.

Die Starterprojekte enthalten **nicht** die Anweisungen des Ausstellungs-Prompts, die
Sitzungskonfiguration, die Tool-Registrierung oder den Sitzungs-Runner. Diese Bestandteile schreiben
Sie während der Lektionen: zuerst eine Sitzung, dann Streaming, dann die Stimme des Kurators
(Installation der vorgefertigten Systemnachricht), die Registrierung des Fakten-Tools und dessen
Prompt mit einem begrenzten Sitzungs-Runner, den Validierungsbericht, bereichsgebundene
Wikipedia-Recherche und eine interaktive `exhibit.html`-Seite. Beginnen Sie mit
[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md).

## Aufbau des Einstiegspunkts

Der Einstiegspunkt des Starterprojekts liefert die feste Struktur des Programms (Einstiegsfunktion,
Fehlerhandler, Bereinigung) und eine Reihe leerer benannter Regionen. Eine Region besteht aus zwei
Markierungskommentaren, und ihre `BEGIN`-Zeile listet jeden Schritt auf, der sie betrifft:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Jeder Codeblock einer Lektion nennt seine Region und eine von zwei Aktionen. **INSERT** bedeutet,
dass die Region leer ist: Fügen Sie den Block zwischen den Markierungszeilen ein. **REPLACE**
bedeutet, dass die Region Code aus einem früheren Schritt enthält: Löschen Sie alles zwischen den
Markierungszeilen und fügen Sie dann den Block ein. Ein Block ist immer der vollständige Inhalt
seiner Region. Bearbeiten Sie niemals eine Markierungszeile oder den Code außerhalb der Regionen.

| Region | Enthält | Schritte |
|---|---|---|
| `imports` | Importe | 1, dann immer, wenn ein Schritt neue Namen benötigt |
| `banner` | Programmbanner | 1 |
| `choose-facts` | Aufruf der Faktenauswahl | 4 |
| `research` | Optionaler Wikipedia-Recherchedurchlauf | 6 |
| `generate` | Aufruf zur Ausstellungsgenerierung | 1 bis 6 |
| `validate` | Validierungsbericht | 5 |
| `sources` | Konsultierte Quellen | 6 |
| `exhibit-page` | Optionale `exhibit.html`-Sitzung | 7 |
| `exhibit-prompt` | Ausstellungs-Prompt-Builder | 4, 6 |
| `html-prompt` | Seiten-Prompt-Builder | 7 |
| `generation-config` | Konfiguration der Generierungssitzung | 4, 6 |
| `research-config` | Konfiguration der Recherche-Sitzung | 6 |
| `html-config` | Konfiguration der Seitensitzung | 7 |
| `session-runner` | Sitzungs-Runner | 4 |

Schritt 6 registriert unter bestimmten Bedingungen die Wikipedia-Suche zusammen mit der Suche in
freigegebenen Fakten und fordert den Kurator auf, beide aufzurufen, bevor er die Erzählung und
Besucherfragen schreibt. Recherche bleibt ergänzend und ist nicht von Lehrenden verifiziert;
freigegebene Fakten haben Vorrang. Wenn Recherche abgelehnt wird oder keine verwertbare
Zusammenfassung mit Zitaten eingeht, arbeitet die Generierung nur mit `approved_fact_lookup`.

| Sprache | Hilfsmodul | Systemnachrichten | Verzeichnis wechseln, erstellen und ausführen |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

Wenn Sie das Starterprojekt ausführen, gibt es seine Identität aus, startet Copilot nicht und
erfordert keine Authentifizierung. Da Sie diese Dateien direkt bearbeiten, erscheint Ihre Arbeit in
`git status`. Das ist so vorgesehen. Führen Sie `git checkout -- .` im Stammverzeichnis des
Repositorys aus, um ein sauberes Starterprojekt wiederherzustellen.

Jedes Starterprojekt fixiert bereits die Abhängigkeiten, die die fertige App benötigt, daher
bearbeiten Sie während des Workshops nie ein Projektmanifest. Das Rust-Starterprojekt erstellt die
Library-Crate `museum_exhibit_studio` aus `src/lib.rs`; importieren Sie die Hilfsfunktionen daraus
in `src/main.rs`.
