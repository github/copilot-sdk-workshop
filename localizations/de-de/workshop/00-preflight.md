# Vorbereitung: Rechner einrichten

> **Vorbereitung ohne Zeitvorgabe**  
> Schließen Sie diese Seite ab, bevor Sie den 115-minütigen Workshop starten.

## Was Sie vorbereitet haben

Am Ende der Vorbereitung haben Sie das Repository geklont, die Copilot CLI authentifiziert, das
Starterprojekt gebaut sowie Playwright MCP heruntergeladen und einsatzbereit.

Folgen Sie allen neun praktischen Schritten, einschließlich Modellauswahl und interaktivem
HTML-Bericht, und schließen Sie dann mit einer Feier und Ressourcen zum Weiterbauen ab.

:::language dotnet
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | Erstellt die C#-Konsolenanwendung und führt sie aus | `dotnet --version` |
| [Node.js 22 oder neuer](https://nodejs.org/) | Führt den Playwright-MCP-Server aus | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Stellt die vom SDK verwendete Copilot-Laufzeit bereit | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ dotnet --version
10.0.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```
:::

:::language nodejs
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [Node.js 22.12 oder neuer](https://nodejs.org/) | Führt die TypeScript-Workshop-App und Playwright MCP aus | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | Installiert `@github/copilot-sdk` und Buildtools | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Stellt die vom SDK verwendete Copilot-Laufzeit bereit | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Weitere Informationen finden Sie im offiziellen
[Node.js-SDK-Installationsleitfaden](https://github.com/github/copilot-sdk/tree/main/nodejs).
:::

:::language python
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [Python 3.11 oder neuer](https://www.python.org/downloads/) | Führt die asynchrone Workshop-Anwendung aus | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | Installiert das fixierte `github-copilot-sdk`-Wheel | `python -m pip --version` |
| [Node.js 22 oder neuer](https://nodejs.org/) | Führt den Playwright-MCP-Server aus | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Optionale lokale Laufzeitüberschreibung über `COPILOT_CLI_PATH` | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Das Python SDK kann bei der ersten Verwendung eine fixierte Laufzeit herunterladen. Weitere
Informationen finden Sie im offiziellen
[Python-SDK-Installationsleitfaden](https://github.com/github/copilot-sdk/tree/main/python).
:::

:::language go
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [Go 1.24 oder neuer](https://go.dev/dl/) | Erstellt das Go-Workshop-Modul und führt es aus | `go version` |
| [Node.js 22 oder neuer](https://nodejs.org/) | Führt den Playwright-MCP-Server aus | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Für das SDK auf `PATH` (oder `COPILOT_CLI_PATH`) erforderlich | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Weitere Informationen finden Sie im offiziellen
[Go-SDK-Installationsleitfaden](https://github.com/github/copilot-sdk/tree/main/go).
:::

:::language rust
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [Rust 1.94 oder neuer](https://rustup.rs/) | Erstellt die asynchrone Rust-Workshop-Crate | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | Löst gesperrte Abhängigkeiten auf und führt die App aus | `cargo --version` |
| [Node.js 22 oder neuer](https://nodejs.org/) | Führt den Playwright-MCP-Server aus | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Laufzeit, die verwendet wird, wenn nicht ausschließlich ein gebündeltes Binary genutzt wird | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ rustc --version
rustc 1.94.x
$ cargo --version
cargo 1.94.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Weitere Informationen finden Sie im offiziellen
[Rust-SDK-Installationsleitfaden](https://github.com/github/copilot-sdk/tree/main/rust).
:::

:::language java
## Was Sie benötigen

| Anforderung | Warum der Workshop sie benötigt | Überprüfen |
|---|---|---|
| [Java 17 oder neuer](https://adoptium.net/) (JDK) | Kompiliert die Maven-Workshop-App und führt sie aus | `java -version` |
| [Node.js 22 oder neuer](https://nodejs.org/) | Führt den Playwright-MCP-Server aus | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Für die Java-SDK-Laufzeit auf `PATH` erforderlich | `copilot --version` |
| [GitHub Copilot-Zugriff](https://github.com/features/copilot) | Autorisiert Copilot-Anfragen | `copilot login` |
| Microsoft Edge (Standard) oder Google Chrome | Ermöglicht Playwright, die Zielseite zu prüfen | Öffnen Sie den Browser einmal vor dem Workshop |

Ihre Befehle sollten eine Ausgabe in dieser Form zurückgeben:

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Es ist keine separate Maven-Installation erforderlich: Jedes Java-Projekt enthält den Maven Wrapper
(`./mvnw`), der bei der ersten Verwendung die richtige Maven-Version herunterlädt. Führen Sie unter
Windows `mvnw.cmd` statt `./mvnw` aus. Verwenden Sie für diesen Track Maven. Verwenden Sie weder
JBang noch Gradle als Ersatz. Weitere Informationen finden Sie im offiziellen
[Java-SDK-Installationsleitfaden](https://github.com/github/copilot-sdk/tree/main/java).
:::

## 1. Repository klonen und Starterprojekt auswählen

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Sie arbeiten **direkt im Repository**. Es gibt keinen Kopierschritt: Sie wechseln in das
Starterverzeichnis für Ihre Sprache und bleiben dort während des gesamten Workshops. Das bedeutet,
dass Sie nachverfolgte Repository-Dateien bearbeiten; Ihre Änderungen erscheinen also in
`git status`. Das ist so vorgesehen. Wenn Sie wieder ein sauberes Starterprojekt möchten, führen Sie
`git checkout -- .` im Stammverzeichnis des Repositorys aus, um Ihre Änderungen zu verwerfen.

## 2. Copilot authentifizieren

Installieren Sie die CLI mit der Methode aus dem [offiziellen Einrichtungsleitfaden](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli),
und führen Sie dann aus:

```bash
copilot login
```

Schließen Sie den Browser-Flow ab, damit spätere SDK-Aufrufe GitHub Copilot erreichen können.

## 3. Playwright MCP vorbereiten

Führen Sie dies einmal aus, um das festgelegte Paket herunterzuladen und seine Optionen auszugeben, ohne einen Server zu starten:

```bash
npx -y @playwright/mcp@0.0.78 --help
```

Die Paketversion ist festgelegt, damit alle dieselben Tool-Namen und dasselbe Verhalten sehen. Der
Code verwendet Microsoft Edge mit `--browser=msedge`. Wenn Sie stattdessen Google Chrome vorbereitet
haben, verwenden Sie `--browser=chrome`, wenn das Argument in Schritt 4 erscheint.

:::language dotnet
## 4. Zum Starterprojekt wechseln und es erstellen

Wenn `dotnet build` die Copilot CLI später nicht finden kann, legen Sie ihren Pfad für das aktuelle Terminal fest:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Wechseln Sie in das .NET-Starterprojekt und erstellen Sie es. Bleiben Sie für jeden späteren Schritt in diesem Verzeichnis:

```bash
cd start-accessibility/dotnet
dotnet build
```

Ein erfolgreicher Build endet mit:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Sie arbeiten für den Rest des Workshops in `start-accessibility/dotnet`, lassen Sie dieses Terminal
also hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `copilot` wird nicht erkannt | Starten Sie das Terminal nach der Installation neu, oder legen Sie `COPILOT_CLI_BINARY_PATH` mit dem obigen Befehl fest. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| Die NuGet-Wiederherstellung kann die Paketquelle nicht erreichen | Prüfen Sie die Proxy- oder Paketquelleneinstellungen, und führen Sie dann `dotnet restore` aus. |
| `npx` wird nicht erkannt | Installieren Sie Node.js 22 oder neuer und starten Sie das Terminal neu. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** `dotnet build` erfolgreich ist, `copilot login` abgeschlossen ist und die Zielseite
> sich öffnet.
:::

:::language nodejs
## 4. Zum Starterprojekt wechseln und es erstellen

Wenn das SDK die Copilot CLI später nicht finden kann, geben Sie für das aktuelle Terminal den Pfad zu Ihrer Installation an:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Wechseln Sie in das Node.js-Starterprojekt, installieren Sie die Abhängigkeiten und führen Sie die
Typprüfung aus. Bleiben Sie für jeden späteren Schritt in diesem Verzeichnis:

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

Eine erfolgreiche Typprüfung endet ohne TypeScript-Fehler (leere Ausgabe von `tsc --noEmit`). Das
Startskript in `package.json` ist `tsx src/index.ts`.

Sie arbeiten für den Rest des Workshops in `start-accessibility/nodejs`, lassen Sie dieses Terminal
also hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `node` oder `npm` wird nicht erkannt | Installieren Sie Node.js 22.12 oder neuer und starten Sie das Terminal neu. |
| Engine-Warnung zur Node-Version | Aktualisieren Sie auf Node.js 22.12+; das Starterprojekt deklariert `"node": ">=22.12.0"`. |
| `npm install` schlägt an der Lockfile fehl | Bleiben Sie in `start-accessibility/nodejs` und behalten Sie die Datei `package-lock.json`; löschen Sie sie nicht. |
| `copilot` wird nicht erkannt | Starten Sie das Terminal nach der Installation neu, oder legen Sie `COPILOT_CLI_PATH` mit dem obigen Befehl fest. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| `npx` kann Playwright MCP nicht herunterladen | Prüfen Sie den Netzwerkzugriff und führen Sie dann den Vorbereitungsbefehl aus Abschnitt 3 erneut aus. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** `npm run build` erfolgreich ist, `copilot login` abgeschlossen ist und die Zielseite
> sich öffnet.
:::

:::language python
## 4. Zum Starterprojekt wechseln und es erstellen

Optional: Erzwingen Sie, dass das SDK Ihre installierte CLI verwendet, statt eine Runtime herunterzuladen:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Wechseln Sie in das Python-Starterprojekt, erstellen Sie eine virtuelle Umgebung, installieren Sie
die festgelegten Abhängigkeiten und führen Sie eine Kompilierungsprüfung aus. Bleiben Sie für jeden
späteren Schritt in diesem Verzeichnis:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="venv-windows">
    <pre><code class="language-powershell">cd start-accessibility/python
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
  <div role="tabpanel" data-panel="venv-unix" hidden>
    <pre><code class="language-bash">cd start-accessibility/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
</div>

Eine erfolgreiche Installation gibt die aufgelösten Pakete aus, einschließlich
`github-copilot-sdk==...`. Eine erfolgreiche Kompilierungsprüfung gibt nichts aus. Lassen Sie die
virtuelle Umgebung für spätere Schritte aktiviert.

Sie arbeiten für den Rest des Workshops in `start-accessibility/python`, lassen Sie dieses Terminal
also hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Optional: Laden Sie die Runtime jetzt vorab herunter, damit die erste Ausführung von Schritt 1 schneller ist:

```bash
python -m copilot download-runtime
```

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `python` verweist auf Python 2 oder fehlt | Verwenden Sie Python 3.11+ (`python3` unter macOS/Linux) und erstellen Sie die venv neu. |
| `pip install` kann PyPI nicht erreichen | Prüfen Sie die Proxy-Einstellungen, und führen Sie dann `python -m pip install -r requirements.txt` erneut aus. |
| Falsche Paketversionen | Installieren Sie nur aus der festgelegten `requirements.txt`; lockern Sie die `==`-Versionsfixierungen nicht. |
| Runtime-Download schlägt später fehl | Führen Sie `python -m copilot download-runtime` aus, oder legen Sie `COPILOT_CLI_PATH` auf eine funktionierende CLI fest. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| `npx` wird nicht erkannt | Installieren Sie Node.js 22 oder neuer und starten Sie das Terminal neu. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** die festgelegten Abhängigkeiten installiert sind, `py_compile` erfolgreich ist, `copilot login`
> abgeschlossen ist und die Zielseite sich öffnet.
:::

:::language go
## 4. Zum Starterprojekt wechseln und es erstellen

Das Go-SDK erwartet die Copilot CLI auf `PATH` oder über `COPILOT_CLI_PATH`:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Wechseln Sie in das Go-Starterprojekt und führen Sie den Build mit erzwungener Lockfile aus. Bleiben
Sie für jeden späteren Schritt in diesem Verzeichnis:

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

Ein erfolgreicher Build gibt keine Fehler aus und erzeugt eine Binärdatei im Starterverzeichnis.
Lassen Sie `go.sum` intakt, damit die Modulauflösung deterministisch bleibt.

Sie arbeiten für den Rest des Workshops in `start-accessibility/go`, lassen Sie dieses Terminal also
hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `go: go.mod requires go >= 1.24` | Installieren Sie Go 1.24 oder neuer und öffnen Sie das Terminal erneut. |
| `missing go.sum entry` | Stellen Sie die eingecheckte `go.sum` wieder her; bauen Sie mit `-mod=readonly`, statt die Lockfile neu zu schreiben. |
| Moduldownload blockiert | Konfigurieren Sie `GOPROXY`/Proxyzugriff, und versuchen Sie den Build dann aus dem Starterverzeichnis erneut. |
| `copilot` wird nicht erkannt | Installieren Sie die CLI, starten Sie das Terminal neu, oder legen Sie `COPILOT_CLI_PATH` fest. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| `npx` wird nicht erkannt | Installieren Sie Node.js 22 oder neuer und starten Sie das Terminal neu. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** `go build -mod=readonly ./...` erfolgreich ist, `copilot login` abgeschlossen ist und
> die Zielseite sich öffnet.

Vergleichen Sie bei Bedarf mit [`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)
als späterem Referenzpunkt nach Schritt 1.
:::

:::language rust
## 4. Zum Starterprojekt wechseln und es erstellen

Wenn der Runtime-Start die CLI später nicht findet, legen Sie `COPILOT_CLI_PATH` fest:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS oder Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Wechseln Sie in das Rust-Starterprojekt und prüfen Sie es gegen die Lockfile. Bleiben Sie für jeden
späteren Schritt in diesem Verzeichnis:

```bash
cd start-accessibility/rust
cargo check --locked
```

Eine erfolgreiche Prüfung endet mit einer `Finished`-Zeile und ohne Fehler. Behalten Sie
`Cargo.lock` eingecheckt, damit der Crate-Graph fixiert bleibt.

Sie arbeiten für den Rest des Workshops in `start-accessibility/rust`, lassen Sie dieses Terminal
also hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `rustc 1.xx is too old` | Installieren Sie Rust 1.94+ mit `rustup update` und öffnen Sie das Terminal erneut. |
| Lockfile stimmt nicht mit `--locked` überein | Behalten Sie die `Cargo.lock` des Starterprojekts; führen Sie kein uneingeschränktes `cargo update` aus. |
| Crate-Download blockiert | Prüfen Sie den Netzwerk-/Proxyzugriff auf crates.io, und versuchen Sie dann `cargo check` erneut. |
| Runtime kann später nicht starten | Installieren und authentifizieren Sie `copilot`, oder legen Sie `COPILOT_CLI_PATH` fest. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| `npx` wird nicht erkannt | Installieren Sie Node.js 22 oder neuer und starten Sie das Terminal neu. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** `cargo check --locked` erfolgreich ist, `copilot login` abgeschlossen ist und die
> Zielseite sich öffnet.

Vergleichen Sie bei Bedarf mit [`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)
als späterem Referenzpunkt nach Schritt 1.
:::

:::language java
## 4. Zum Starterprojekt wechseln und es erstellen

Das Java-SDK erwartet die Copilot CLI beim Start der Anwendung auf `PATH`. Überprüfen Sie dies vor
dem Build:

```bash
copilot --version
```

Wechseln Sie in das Java-Starterprojekt und kompilieren Sie es mit Maven. Bleiben Sie für jeden späteren Schritt in diesem Verzeichnis:

```bash
cd start-accessibility/java
./mvnw compile
```

Eine erfolgreiche Kompilierung endet mit:

```text
[INFO] BUILD SUCCESS
```

Die `pom.xml` konfiguriert bereits `exec-maven-plugin` mit `mainClass`
`workshop.AccessibilityReport`. Bleiben Sie für diesen Track bei Maven.

Sie arbeiten für den Rest des Workshops in `start-accessibility/java`, lassen Sie dieses Terminal
also hier. Geben Sie in diesem Ordner `code .` ein, um ihn in VS Code zu öffnen, oder öffnen Sie den
Ordner in Ihrem bevorzugten Editor.

Öffnen Sie die kontrollierte Zielseite einmal, um sicherzustellen, dass Sie sie erreichen können:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Problembehandlung für die Vorbereitung</summary>

| Symptom | Behebung |
|---|---|
| `java` wird nicht erkannt | Installieren Sie JDK 17+, und starten Sie dann das Terminal neu. |
| `./mvnw: Permission denied` | Führen Sie `chmod +x mvnw` aus, oder verwenden Sie stattdessen `sh mvnw`. Verwenden Sie unter Windows `mvnw.cmd`. |
| Fehler beim Compiler-Release | Prüfen Sie, ob `java -version` 17 oder neuer meldet; das POM setzt `maven.compiler.release` auf 17. |
| Download der Abhängigkeiten schlägt fehl | Prüfen Sie die Einstellungen für Maven Central/Proxy, und führen Sie dann `./mvnw compile` erneut aus. |
| Wunsch, Tools zu wechseln | Ersetzen Sie Maven in diesem Workshop nicht durch JBang oder Gradle. |
| `copilot` wird nicht erkannt | Installieren Sie die CLI, starten Sie das Terminal neu, und prüfen Sie `copilot --version`. |
| Copilot fordert Sie zur Authentifizierung auf | Führen Sie `copilot login` aus, schließen Sie den Browserablauf ab und versuchen Sie es dann erneut. |
| `npx` wird nicht erkannt | Installieren Sie Node.js 22 oder neuer und starten Sie das Terminal neu. |
| Der Browser kann später nicht starten | Installieren Sie Edge oder Chrome, oder folgen Sie der [Browserkonfiguration für Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Starten Sie Schritt 1, wenn:** `./mvnw compile` `BUILD SUCCESS` ausgibt, `copilot login` abgeschlossen ist und die
> Zielseite sich öffnet.

Vergleichen Sie bei Bedarf mit [`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)
als späterem Referenzpunkt nach Schritt 1.
:::

## Weitere Informationen

Das SDK, das Sie gleich installieren, ist außerhalb dieses Workshops dokumentiert. Diese Seiten
sollten Sie vor Schritt 1 als Lesezeichen speichern.

- [Anleitungen zum GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk): GitHubs
  eigene SDK-Dokumentation, einschließlich der Voraussetzungen, die diese Vorbereitung nachbildet.
- [Dokumentationsübersicht zum Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  der Index für Einrichtung, Authentifizierung, Features und Problembehandlung.
- [Standardeinrichtung: die gebündelte CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  wie das SDK die Copilot CLI findet und startet und wie Sie eine andere Binärdatei angeben.
- [Debugging-Leitfaden](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  die erste Stelle, an der Sie nachsehen sollten, wenn eine Ausführung fehlschlägt, bevor sie eine Ausgabe erzeugt.

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

Weiter mit [Schritt 1: Die erste Copilot-Sitzung erstellen](01-first-session.md).
