# Museum Exhibit Studio: Vorbereitung

> **Dauer:** Ohne Zeitvorgabe  
> **Workshop:** Non-SDLC-Agent

## Was Sie erstellen

Museum Exhibit Studio verwandelt von Lehrkräften freigegebene Fakten in ausstellungsreife Texte für Besucher:

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

Sie erstellen eine stetig wachsende Konsolenanwendung direkt in `start-museum/<language>`. Jeder
Schritt fügt eine Idee hinzu und endet mit einem echten Lauf, sodass der Kurator vor Ihren Augen
entsteht:

| Schritt | Sie fügen hinzu | Sie sehen |
|---|---|---|
| 1 | Einen Client, eine Sitzung, einen Prompt | Museumstext in Ihrem Terminal |
| 2 | Den vorgefertigten Streaming-Drucker | Live eintreffenden Text |
| 3 | Die Kurator-Systemnachricht | Eine andere Stimme und Form |
| 4 | Das Tool für freigegebene Fakten, den Prompt und den begrenzten Sitzungs-Runner | Text, der Ihren Fakten folgt |
| 5 | Den vorgefertigten Validator | Einen strukturellen PASS/FAIL-Bericht |
| 6 | Eine eingegrenzte Wikipedia MCP-Recherchesitzung | Zitierten Hintergrund, der aus der Ausstellung herausgehalten wird |
| 7 | Eine interaktive Seite | `exhibit.html` in Ihrem Browser |
| 8 | Eine Feier und Ressourcen | Ihr nächstes Projekt beginnt hier |

Die sieben praktischen Schritte dauern etwa 90 Minuten. Schließen Sie sie der Reihe nach ab, feiern
Sie dann, was Sie erstellt haben, und erkunden Sie die Ressourcen im letzten Schritt.

Das Starterprojekt enthält bereits die Infrastruktur, die Sie nie selbst schreiben müssen: die
freigegebenen Faktensätze und ihre Grenzen, das Menü zur Faktenauswahl, einen Streaming-Drucker,
deterministische Ausstellungsvalidierung, den eingegrenzten Wikipedia MCP-Server mit seinem
standardmäßig ablehnenden Berechtigungshandler, die Schreibberechtigung für die einzelne Datei
`exhibit.html`, die Systemnachrichten, den festen Prompt-Text für die Ausstellungsstruktur, die
Rechercheanfrage und die Seitenanforderungen sowie die Fehlerbehandlung rund um Ihren Code. **Sie
bearbeiten die Hilfsdateien nie.** Sie schreiben den SDK-Code: die Sitzungseinrichtung, die
Tool-Registrierung und Sitzungskonfigurationen, die Anweisungen in den Ausstellungs- und
Seiten-Prompts sowie einen Sitzungs-Runner.

Sie benötigen eine authentifizierte GitHub Copilot CLI, die Runtime Ihrer Sprache und ein Terminal.
Sie arbeiten direkt im Minimalprojekt unter `start-museum/<language>`, nicht in der fertigen App.
Das abgeschlossene Projekt unter `finished/<language>/museum-exhibit-studio` dient nur als
optionales Referenzmaterial.

## Workshop-Repository klonen

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Bestätigen Sie, dass sich das Terminal im Repository-Stammverzeichnis befindet, bevor Sie in ein Starterprojekt wechseln:

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

Der Befehl muss ohne Ausgabe erfolgreich beendet werden.

Sie erstellen die Museumsanwendung **direkt vor Ort** im Starterverzeichnis Ihrer Sprache. Es gibt
keinen Kopierschritt. Das bedeutet, dass Sie nachverfolgte Repository-Dateien bearbeiten; Ihre
Arbeit erscheint daher in `git status` als geänderte Dateien. Das ist erwartet und korrekt. Wenn Sie
mit einem sauberen Starterprojekt neu beginnen möchten, führen Sie `git checkout -- .` aus dem
Repository-Stammverzeichnis aus, um Ihre Änderungen zu verwerfen.

Wechseln Sie jetzt in das Starterverzeichnis Ihrer Sprache und bleiben Sie dort für jeden Befehl im
Museums- Workshop.

:::language dotnet
Wechseln Sie in das .NET-Starterprojekt, stellen Sie dann den lokalen Einstiegspunkt wieder her, erstellen Sie ihn und führen Sie ihn aus:

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

Bedingung für das Bestehen: Der Build ist erfolgreich und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in Helpers/.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/dotnet`; lassen Sie dieses Terminal daher
hier. Geben Sie aus diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist `Helpers/Curator*.cs` im Namespace `MuseumExhibitStudio.Helpers`. Sie schreiben
jede Lektionsänderung in `Program.cs`.
:::

:::language nodejs
Wechseln Sie in das Node.js-Starterprojekt. Seine Lockfile bewahrt SDK 1.0.11 und das kompatible
Plattformpaket `@github/copilot` 1.0.80:

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

Bedingung für das Bestehen: Der Build ist erfolgreich und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in src/curator.ts.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/nodejs`; lassen Sie dieses Terminal daher
hier. Geben Sie aus diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist `src/curator.ts`, und die Systemnachrichten befinden sich in
`src/system-messages.ts`. Sie schreiben jede Lektionsänderung in `src/index.ts`.
:::

:::language python
Wechseln Sie in das Python-Starterprojekt, erstellen Sie eine isolierte virtuelle Umgebung und installieren Sie SDK 1.0.11:

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

Unter Windows befindet sich der Interpreter unter `.venv/Scripts/python.exe`.

Bestehensbedingung: Die Quelle lässt sich kompilieren und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in curator.py.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/python`; lassen Sie dieses Terminal daher
geöffnet. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist `curator.py`, und die Systemnachrichten befinden sich in `system_messages.py`.
Sie schreiben jede Änderung der Lektion in `main.py`.
:::

:::language go
Wechseln Sie in das Go-Starterprojekt, laden Sie die gesperrte SDK-1.0.11-Abhängigkeit herunter und erstellen Sie es:

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

Bestehensbedingung: Der Build ist erfolgreich und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in curator.go.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/go`; lassen Sie dieses Terminal daher
geöffnet. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist `curator.go`, und die Systemnachrichten befinden sich in `system_messages.go`.
Beide befinden sich im selben `main`-Paket. Sie schreiben jede Änderung der Lektion in `main.go`.
:::

:::language rust
Wechseln Sie in das Rust-Starterprojekt, rufen Sie gesperrte Abhängigkeiten ab und prüfen Sie es:

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

Bestehensbedingung: Cargo lässt `Cargo.lock` unverändert und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in src/lib.rs.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/rust`; lassen Sie dieses Terminal daher
geöffnet. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist das Bibliotheks-Crate `museum_exhibit_studio` in `src/lib.rs`; die
Systemnachrichten befinden sich in `src/system_messages.rs`. Sie schreiben jede Änderung der Lektion
in `src/main.rs`.
:::

:::language java
Wechseln Sie in das Maven-Starterprojekt, lösen Sie die SDK-1.0.11-Abhängigkeit auf, kompilieren Sie
es und führen Sie es mit dem enthaltenen Maven Wrapper aus (keine separate Maven-Installation
erforderlich; verwenden Sie unter Windows `mvnw.cmd` statt `./mvnw`):

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

Bestehensbedingung: Maven ist erfolgreich und das Programm gibt
`=== Museum Exhibit Studio starter ===` gefolgt von
`Pre-built curator helpers are ready in src/main/java/workshop/.` aus.

Sie arbeiten für den Rest des Workshops in `start-museum/java`; lassen Sie dieses Terminal daher
geöffnet. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Ihr Hilfsmodul ist `src/main/java/workshop/Curator*.java`. Sie schreiben jede Änderung der Lektion
in `src/main/java/workshop/MuseumExhibitStudio.java`.
:::

## Funktionsweise von Änderungen

Öffnen Sie den Einstiegspunkt, der am Ende Ihres obigen Einrichtungsblocks genannt wird. Jede
Stelle, an der Sie Code schreiben, ist eine benannte **Region** zwischen zwei
Markierungskommentaren:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Die `BEGIN`-Zeile listet jeden Schritt auf, der die Region ändert; die Datei dient daher zugleich
als Karte des Workshops. Jeder Codeblock in einer Lektion wird durch eine Zeile eingeführt, die
seine Region und eine von zwei Aktionen nennt:

| Aktion | Die Region ist | Was Sie tun |
|---|---|---|
| **INSERT** | Leer | Fügen Sie den Block zwischen den beiden Markierungszeilen ein. |
| **REPLACE** | Enthält Code aus einem früheren Schritt | Löschen Sie alles zwischen den beiden Markierungszeilen und fügen Sie dann den Block ein. |

Ein Block ist immer der vollständige Inhalt seiner Region, Sie führen Code also nie von Hand
zusammen. Lassen Sie die Markierungszeilen und den Code außerhalb der Regionen genau so, wie sie
sind.

## Vertrauensgrenze festlegen

| Steuerung | Was sie tun kann |
|---|---|
| Systemnachricht | Rolle, Ton, Umfang und Ausgabeform steuern |
| Tool-Zulassungsliste | Genau festlegen, welche Tools für eine Sitzung existieren |
| Anwendungscode | Die Daten hinter einem Tool besitzen und Grenzwerte, Timeout, Validierung und Bereinigung erzwingen |
| Menschliche Überprüfung | Entscheiden, ob jede historische Behauptung belegt ist |

Die freigegebenen Fakten der Lehrkraft sind die einzige freigegebene Quelle, und der Kurator
erreicht sie über ein anwendungseigenes Tool. Der Modellspeicher ist kein verifiziertes
Museumswissen, und Prompt-Vorgaben sind keine Autorisierungsgrenze: Nur die Zulassungsliste und der
Berechtigungshandler entscheiden, was die Sitzung tatsächlich tun darf.

## Weitere Informationen

Das SDK hinter dem Kurator ist außerhalb dieses Workshops dokumentiert. Es lohnt sich, diese Seiten
daneben geöffnet zu haben.

- [GitHub Copilot SDK-Anleitungen](https://docs.github.com/en/copilot/how-tos/copilot-sdk): GitHubs
  eigene SDK-Dokumentation, einschließlich der Voraussetzungen, die diese Vorbereitung behandelt.
- [Copilot SDK-Dokumentationsübersicht](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  der Index für Einrichtung, Authentifizierung, Features und Problembehandlung.
- [Standardeinrichtung: die gebündelte CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  wie das SDK die Copilot CLI findet und startet und wie Sie es auf eine andere Binärdatei verweisen.
- [Debugging-Leitfaden](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  die erste Anlaufstelle, wenn ein Lauf fehlschlägt, bevor er eine Ausgabe erzeugt.

:::language dotnet
- [Referenz zum .NET-SDK](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  Paketinstallation und ein Minimalbeispiel für das .NET-SDK.
:::

:::language nodejs
- [Referenz zum Node.js-SDK](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  Paketinstallation und ein Minimalbeispiel für das Node.js-SDK.
:::

:::language python
- [Referenz zum Python-SDK](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  Paketinstallation und ein Minimalbeispiel für das Python-SDK.
:::

:::language go
- [Referenz zum Go-SDK](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  Modulinstallation und ein Minimalbeispiel für das Go-SDK.
:::

:::language rust
- [Referenz zum Rust-SDK](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  Crate-Installation und ein Minimalbeispiel für das Rust-SDK.
:::

:::language java
- [Referenz zum Java-SDK](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  Abhängigkeitskoordinaten und ein Minimalbeispiel für das Java-SDK.
:::

Weiter mit [Ihre erste Kurator-Sitzung](museum-01-first-curator-session.md).
