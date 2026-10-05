# Workshop-Starterprojekte

Wählen Sie das Verzeichnis für die auf der Workshop-Startseite ausgewählte Sprache aus und arbeiten
Sie dann direkt darin. Es gibt keinen Kopierschritt. Wechseln Sie in dieses Verzeichnis, öffnen Sie
denselben Ordner in Ihrem Editor (`code .` von dort aus oder mit dem Ordner-öffnen-Befehl eines
anderen Editors) und bleiben Sie für jeden Befehl dort. Starterprojekte sind absichtlich minimale
Grundgerüste. Der anwendungseigene Katalog der Web Content Accessibility Guidelines (WCAG) und
eingeschränkte Berechtigungs-/Snapshot-Reader-Hilfsfunktionen können für spätere Lektionen vorhanden
sein, aber ihre ausführbaren Einstiegspunkte verdrahten keinen Copilot-Client, keine Sitzung, keinen
Streaming-Fluss, kein lokales Tool, keinen MCP-Server und keinen Bericht, bis der entsprechende
Schritt erreicht ist.

| Sprache | Voraussetzung | Verzeichnis wechseln und überprüfen |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper enthalten) | `cd start-accessibility/java && ./mvnw compile` |

Da Sie diese Dateien direkt bearbeiten, erscheint Ihre Arbeit in `git status`. Das ist erwartet.
Führen Sie `git checkout -- .` aus dem Repository-Stamm aus, um ein sauberes Starterprojekt
wiederherzustellen. Die Tracks für Go, Rust und Java erfordern später beim Ausführen der Anwendung
die [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) auf
`PATH`. SDK-Einrichtung und API-Referenzen sind im
[offiziellen Copilot SDK-Repository](https://github.com/github/copilot-sdk) und im
[Cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook) verfügbar.

Bleiben Sie während des gesamten Workshops in Ihrem Starterverzeichnis. Kehren Sie über die
[Workshop-Startseite](../README.md#workshop-starten) zum interaktiven Viewer zurück; öffnen Sie
das Markdown der Lektionen nicht direkt.
