# Vorbereitung: Auf SDK 101 vorbereiten

> **Dauer:** Zeitlich unbegrenzte Vorbereitung, vor dem 30-minütigen Workshop

## Was Sie erstellen

Beginnen Sie mit einem streamenden Hello World und verwandeln Sie es dann in einen kleinen
Startassistenten für The GitHub Podcast. Sie schreiben die SDK-Verbindung und die
Sitzungskonfiguration; das Starterprojekt enthält bereits Tools zum Nachschlagen von Episoden und
Hilfsfunktionen für die Terminalauswahl.

Die vier zeitlich festgelegten Lektionen ergeben insgesamt **30 Minuten**: SDK-Grundlagen (5), Hello
World (10), Podcast-Agent (12) und Zusammenfassung (3). Schließen Sie Installation,
Authentifizierung und Abhängigkeitsdownloads vorab ab, damit die Sitzung auf das SDK fokussiert
bleibt.

## Zugriff prüfen

Sie benötigen Git, einen Editor, ein Terminal, Netzwerkzugriff und ein aktives GitHub
Copilot-Abonnement oder eine Testversion mit Zugriff auf ein unterstütztes Modell. Installieren Sie
die [Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli), und führen
Sie dann diese Befehle in Ihrem Terminal aus:

```shell
git --version
copilot --version
copilot auth login
```

Schließen Sie die Browser-Anmeldung ab, falls Sie dazu aufgefordert werden. Verwenden Sie für den
Workshop dasselbe Konto und dieselbe Terminalumgebung. Fügen Sie keine Tokens in Ihre Quelldateien
ein. Das Podcast-Beispiel benötigt außerdem Zugriff auf den
[offiziellen RSS-Feed](https://feeds.simplecast.com/ioCY0vfY).

## Starter abrufen

Alle sechs SDK 101-Starterprojekte und ihre vorgefertigten Hilfsfunktionen sind in `start-intro/` in
**diesem Workshop-Repository** enthalten. Klonen Sie es einmal:

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Wenn Sie dieses Repository bereits geklont haben, verwenden Sie diesen Checkout; klonen Sie kein
weiteres Repository und kopieren Sie kein Starterprojekt. Wählen Sie unten nur eine Sprache aus.
Alle Befehle beginnen im Stammverzeichnis dieses Repositorys. Installieren Sie nur die Runtime
dieser Sprache. Behalten Sie die vorhandenen Abhängigkeitsversionen bei; Sie müssen kein Projekt
scaffolden und das SDK nicht erneut installieren.

Jeder Sprachordner enthält außerdem **`LIVE_DEMO.md`**. Öffnen Sie die Datei neben dem
Einstiegspunkt. Nehmen Sie während der zeitlich begrenzten Sitzung die vier nummerierten Änderungen
aus Act One vor, führen Sie Hello World aus und fahren Sie dann mit Act Two in derselben Datei und
Anwendung fort.

:::language dotnet
### .NET vorbereiten

Installieren Sie das [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/).

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

Öffnen Sie `start-intro/dotnet` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`Program.cs`. Später führen Sie `dotnet run` aus diesem Ordner aus.

Informationen zur CLI-Erkennung finden Sie in der [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md),
einschließlich `COPILOT_CLI_BINARY_PATH`, falls der Download der gebündelten Runtime blockiert wird.
:::

:::language nodejs
### Node.js vorbereiten

Installieren Sie [Node.js 22.12 oder neuer](https://nodejs.org/).

```shell
node --version
cd start-intro/nodejs
npm ci
```

Öffnen Sie `start-intro/nodejs` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`src/index.ts`. Später führen Sie `npm start` aus diesem Ordner aus.

Lesen Sie die [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::

:::language python
### Python vorbereiten

Installieren Sie [Python 3.11 oder neuer](https://www.python.org/downloads/). Verwenden Sie eine
isolierte Umgebung. Unter Windows PowerShell:

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Unter macOS/Linux:

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Öffnen Sie `start-intro/python` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`main.py`. Wir verwenden in den Lektionen den Interpreter der Umgebung direkt, daher sind eine
Aktivierung und Änderungen an der PowerShell-Ausführungsrichtlinie nicht erforderlich.

Lesen Sie die [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::

:::language go
### Go vorbereiten

Installieren Sie [Go 1.24 oder neuer](https://go.dev/dl/).

```shell
go version
cd start-intro/go
go mod download
```

Öffnen Sie `start-intro/go` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`main.go`. Später führen Sie `go run .` aus diesem Ordner aus.

Lesen Sie die [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::

:::language java
### Java vorbereiten

Installieren Sie [Java 17 oder neuer](https://adoptium.net/). Keine separate Maven-Installation ist
erforderlich: Das Starterprojekt enthält den Maven Wrapper (`./mvnw`), der bei der ersten Verwendung
die richtige Maven-Version herunterlädt. Führen Sie unter Windows `mvnw.cmd` statt `./mvnw` aus.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

Öffnen Sie `start-intro/java` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`src/main/java/demo/CopilotSdkLiveDemo.java`. Später führen Sie `./mvnw compile exec:java` aus
diesem Ordner aus.

Lesen Sie die [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::

:::language rust
### Rust vorbereiten

Installieren Sie [Rust 1.94 oder neuer](https://rustup.rs/). Unter Windows benötigt die
standardmäßige MSVC-Toolchain außerdem die C++-Buildtools und das Windows SDK, die im
[Rust-Installationsleitfaden](https://doc.rust-lang.org/book/ch01-01-installation.html) beschrieben
sind. Schließen Sie diese Einrichtung vor der Sitzung ab.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Öffnen Sie `start-intro/rust` in Ihrem Editor (`code .` für VS Code). Ihr Einstiegspunkt ist
`src/main.rs`. Später führen Sie `cargo run --locked` aus diesem Ordner aus. Die Vorabprüfung
befüllt den Kompilierungscache; planen Sie zusätzliche Vorbereitungszeit für den ersten Build der
Rust-Abhängigkeiten ein.

Lesen Sie die [Starter-README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Bereitschaftsprüfung

Sie sind bereit, wenn die Authentifizierung abgeschlossen ist, die Abhängigkeiten heruntergeladen
sind und der ausgewählte Einstiegspunkt in Ihrem Editor geöffnet ist. Der unveränderte
Einstiegspunkt ist **absichtlich unvollständig**: Platzhalter können beim Kompilieren fehlschlagen
oder eine Authentifizierungsmeldung ausgeben, ohne Ihre echte Anmeldung zu prüfen. Behandeln Sie das
nicht als funktionierende Anwendung. Die Hello-World-Lektion ergänzt die fehlenden Teile.

Lassen Sie die Hilfsdateien des Starterprojekts unverändert. Sie erweitern das Projekt direkt in
`start-intro/`; Ihre Änderungen erscheinen erwartungsgemäß in `git status`.

## Problembehandlung vor der Sitzung

- **CLI nicht gefunden:** Schließen Sie die CLI-Installation ab und öffnen Sie Ihr Terminal erneut. Befolgen Sie
  die Starter-README Ihrer Sprache, falls das SDK die native ausführbare Datei nicht finden kann.
- **Anmeldung schlägt fehl:** Prüfen Sie vor der Sitzung Ihr Abonnement, die Organisationsrichtlinie und das Browserkonto.
  Eine erfolgreiche Anmeldung allein garantiert keinen Modellzugriff.
- **Download von Abhängigkeiten schlägt fehl:** Beheben Sie jetzt den Proxy- oder Paketregistrierungszugriff.
  Ersetzen Sie angeheftete Abhängigkeiten nicht durch nicht zugehörige SDK-Versionen.
- **RSS-Feed blockiert:** Sorgen Sie vor der Podcast-Lektion für Zugriff auf den offiziellen Feed.
  Ersetzen Sie ihn nicht durch erfundene Episodenfakten.

Fahren Sie mit [SDK-Grundlagen](intro-01-sdk-basics.md) fort.

## Weitere Informationen

- [Enthaltene Intro-Starterprojekte](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [Offizielles Copilot SDK](https://github.com/github/copilot-sdk)
