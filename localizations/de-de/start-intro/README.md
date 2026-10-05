# SDK 101-Starterprojekte

Die vollständigen Starterprojekte für den 30-minütigen SDK 101-Workshop befinden sich hier. Klonen
Sie **dieses Workshop-Repository einmal**, wählen Sie eine Sprache aus und bearbeiten Sie deren
Einstiegspunkt direkt. Es gibt kein separates Repository zum Klonen und kein Projekt zum Kopieren.

| Sprache | Voraussetzung | Hinweise zum Starterprojekt | Demo-Leitfaden | Einstiegspunkt |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [Einrichtung](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [Einrichtung](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [Einrichtung](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [Einrichtung](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [Einrichtung](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [Einrichtung](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

Schließen Sie die [Vorbereitung](../workshop/intro-00-preflight.md) vor der zeitlich begrenzten
Sitzung ab. Authentifizieren Sie sich mit `copilot auth login`, wechseln Sie in
`start-intro/<language>` und öffnen Sie diesen Ordner in Ihrem Editor (`code .` für VS Code).
Bleiben Sie für Abhängigkeits- und Ausführbefehle in diesem Ordner.

Die Einstiegspunkte enthalten absichtlich Platzhalter. Öffnen Sie **`LIVE_DEMO.md`** neben Ihrem
gewählten Einstiegspunkt. Folgen Sie **den vier Bearbeitungen des ersten Akts**: Client starten,
Authentifizierung prüfen, Sitzung erstellen und Hello World senden. Folgen Sie dann **Zweiter Akt**,
um ein Modell und eine Episode auszuwählen, der Sitzung ihre Fähigkeiten zu gewähren und den Prompt
zu ersetzen.

Die Workshop-Website zeigt dieselben Leitfadenabschnitte in ihrer
[Hello-World-Lektion](../workshop/intro-02-hello-world.md) und
[Podcast-Lektion](../workshop/intro-03-podcast-agent.md); sie vermittelt keine andere
Implementierung. Diese Hilfsfunktionen umfassen Modell- und Episodenauswahl, typisierte
RSS-Lookup-Tools und interaktive Tool-Genehmigung. Lassen Sie sie während des Workshops unverändert.

Abhängigkeiten und die verfügbaren Lockfiles sind enthalten. Smoke-Builds benötigen keine
Copilot-Authentifizierung und keinen Live-Prompt. Zum Ausführen der fertigen Anwendung ist
Copilot-Zugriff erforderlich; der Podcast-Workflow benötigt außerdem Zugriff auf den offiziellen
RSS-Feed. Ihre direkten Bearbeitungen erscheinen in `git status`; das ist erwartet.

## Quelle

Diese Starterquelltexte und `LIVE_DEMO.md`-Leitfäden wurden aus
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro) bei
Revision [`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97)
importiert. Die Leitfäden behalten die Zwei-Akt-Abfolge und die vier nummerierten
Hello-World-Bearbeitungen der Quelle bei. Lokale Anpassungen verwenden die Pfade dieses Repositorys,
begrenzen die Abschlusswartezeiten, schließen SDK-Ressourcen, beschränken Hello World auf eine leere
Tool-Zulassungsliste und liefern die fehlenden Java/Rust-Streaming-Abonnements. Go behält ein
Abonnement bei, statt jedes Textfragment zweimal auszugeben. Node.js lässt den begrenzten
Send-Aufruf Sitzungsfehler weitergeben, statt aus einem Callback zu werfen. Seine RSS-Hilfsfunktion
verwendet parserbasierte XML-Decodierung und Extraktion von HTML in reinen Text, mit
Regressionstests für CDATA, Entitätsdecodierung und Ausschluss von script/style. Alle sechs
RSS-Hilfsfunktionen verwenden endliche Netzwerk-Timeouts von zehn Sekunden. Java weist
XML-DOCTYPE-Deklarationen und externe Ressourcen zurück, während es Metadaten zur Dauer mit
Namespace liest. Python und Rust erkennen die Berechtigungs-Payloads der benutzerdefinierten Tools
des SDK; Rust liest Genehmigungen in einem abgekoppelten Eingabe-Thread, sodass ein Turn-Timeout die
Runtime dennoch herunterfahren kann. Das Upstream-Repository ist eine Quellenangabe, keine
Einrichtungsvoraussetzung.
