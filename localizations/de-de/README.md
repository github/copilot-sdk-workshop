# GitHub Copilot SDK-Workshops

Starten Sie heute: http://github.github.com/copilot-sdk-workshop/

Wählen Sie einen von drei praxisorientierten GitHub Copilot SDK-Workshops in .NET,
Node.js/TypeScript, Python, Go, Rust oder Java aus:

- **SDK 101 (30 Minuten):** Beginnen Sie mit einem gestreamten Hello World und erstellen Sie dann einen kleinen Podcast-Agenten mit vorgefertigten RSS-Tools aus dem
  [enthaltenen Intro-Starterprojekt](start-intro/README.md).
- **Accessibility Reviewer:** Erstellen Sie ein SDLC-Entwicklertool, das eine Webseite prüft,
  anwendungseigene WCAG-Anleitungen heranzieht und einen evidenzbasierten Bericht erzeugt.
- **Museum Exhibit Studio:** Erstellen Sie einen Kurator außerhalb des SDLC, der von Lehrenden freigegebene Fakten in
  für Besucher aufbereitete Ausstellungstexte umwandelt, optional angereichert durch zitierte Wikipedia-Recherche über einen lokalen
  Lookup hinter deterministischen Fähigkeitsgrenzen.

Beginnen Sie mit SDK 101, wenn Sie neu im SDK sind. In den einführenden und vertiefenden Workshops werden Sie:

1. Einen Copilot-Client und eine Konversationssitzung erstellen.
2. Eine dauerhafte Agent-Richtlinie von aufgabenspezifischen Daten trennen.
3. Zwischen lokalen Tools und MCP-Tools mit eng begrenzten Tool-Zulassungslisten wählen.
4. Grenzen für Fähigkeiten, Eingaben, Timeouts, Validierung und Lebenszyklus im Anwendungscode durchsetzen.
5. Erklären, was das Modell ableiten kann und was die Anwendung belegen muss.

SDK 101 umfasst genau 30 Minuten angeleitete Lektionen. Rechnen Sie mit etwa 115 Minuten für
Accessibility Reviewer oder 90 Minuten für Museum Exhibit Studio. Rechnereinrichtung,
Authentifizierung und Downloads von Abhängigkeiten erfolgen separat in einer ungetakteten
Vorbereitung für jeden Workshop. Die beiden vertiefenden Workshops enthalten ihre interaktiven
HTML-Lektionen und enden mit einer Feier und Ressourcen.

## Workshop starten

Öffnen Sie die GitHub Pages-URL, die vom **Deploy to GitHub Pages**-Workflow des Repositorys erzeugt
wird. Wählen Sie ein Workshop-Ergebnis, wählen Sie eine Sprache und starten Sie dann den
ausgewählten Workshop. Die Website leitet ihre Pages-Basis-URL zur Laufzeit ab, sodass kein
Organisations- oder Benutzer-Hostname für Pages hartcodiert ist.

So zeigen Sie eine Vorschau der Website aus einem Klon an:

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

Öffnen Sie <http://localhost:8000/docs/>. Öffnen Sie `step.html` nicht mit einer `file://`-URL;
Browser blockieren die Markdown-Anfragen, die vom Lektionsviewer verwendet werden.

## Workshop in Ihrer Sprache

Dieser Workshop stellt mehrere Sprachen in Ihrem Gebietsschema bereit:

[English](../../README.md) | [한국어](../ko-kr/README.md) | [日本語](../ja-jp/README.md) | [Português (Brasil)](../pt-br/README.md) | [Español](../es-es/README.md) | [Français](../fr-fr/README.md) | Deutsch

Wenn Sie weitere Sprachunterstützung hinzufügen möchten, fügen Sie weitere Gebietsschemas zu
[`docs/locale-registry.js`](../../docs/locale-registry.js) hinzu und fügen Sie anschließend
lokalisierte Dokumente im Verzeichnis `localizations/` hinzu.

## Voraussetzungen

Installieren Sie die Laufzeitumgebung für die von Ihnen gewählte Sprache, nicht alle sechs. Die
Vorbereitung jedes Tracks enthält die jeweils geltenden Anforderungen; Node.js SDK 101 erfordert
Version 22.12 oder neuer, und sein Java-Starter erfordert außerdem Maven 3.9 oder neuer.

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 oder neuer](https://nodejs.org/)
- [Python 3.11 oder neuer](https://www.python.org/downloads/)
- [Go 1.24 oder neuer](https://go.dev/dl/)
- [Rust 1.94 oder neuer](https://rustup.rs/)
- [Java 17 oder neuer](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- GitHub Copilot-Abonnement oder Testversion
- Microsoft Edge (Workshop-Standard) oder Google Chrome für browserbasierte Übungen

Die Vorbereitung führt durch Installationsprüfungen, Authentifizierung, betriebssystemspezifische
Befehle, erwartete Ausgabe und Problembehandlung.

## Repository-Aufbau

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## Änderung validieren

```bash
bash scripts/validate-workshop.sh
```

Der Befehl prüft die Lektionsstruktur, interne Links, Hooks für das Website-Verhalten,
Projektabdeckung und das exakte 30-Minuten-Zeitbudget des Einführungstracks. Außerdem wendet er die
Museum-Lektionen auf jedes Museum-Starterprojekt an und prüft, ob das Ergebnis dem fertigen
Einstiegspunkt entspricht. Anschließend führt er browserunabhängige Tests für Sprachauswahl,
Website-Ablauf und Abschluss aus und stellt jedes Intro-, Barrierefreiheits- und
Museum-Starterprojekt, jedes fertige Projekt und das Blazor-Ziel wieder her, erstellt es oder prüft
die Syntax, ohne Copilot zu authentifizieren, einen Browser zu starten oder einen Prompt zu senden.
Die Museum-Projekte enthalten keine Tests, Mocks oder Fixtures, daher werden ihre Ziele nur
wiederhergestellt und erstellt.

Übergeben Sie eine Sprach-ID, um ein einzelnes Smoke-Build-Ziel auszuführen:

```bash
bash scripts/validate-workshop.sh nodejs
```

Pull Requests führen Inhaltsvalidierung und alle sechs Sprach-Smoke-Builds als separate GitHub
Actions-Jobs aus, sodass ein Fehler den betroffenen SDK-Track identifiziert.

## SDK 101-Workshop

Beginnen Sie bei [`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md). Installieren
Sie Ihre gewählte Laufzeitumgebung, authentifizieren Sie Copilot und laden Sie Abhängigkeiten
**vor** der zeitlich begrenzten Sitzung herunter. Die vier angeleiteten Lektionen sind
SDK-Grundlagen (5 Minuten), Hello World per Streaming (10 Minuten), ein Podcast-Agent (12 Minuten)
und Zusammenfassung (3 Minuten).

Lernende klonen dieses Repository einmal und bearbeiten den Einstiegspunkt in
[`start-intro/<language>`](start-intro/README.md). Das Starterprojekt enthält alle Quelldateien,
Abhängigkeitsmanifeste, Lockfiles und vorgefertigte Hilfsfunktionen für RSS-Lookups, Modell- und
Episodenauswahl sowie interaktive Tool-Genehmigung. Kein zweiter Repository-Klon und kein längerer
Workshop ist erforderlich.

Öffnen Sie `LIVE_DEMO.md` neben dem Einstiegspunkt des Starterprojekts. Der praxisorientierte
Workshop folgt den **vier Hello World-Bearbeitungsschritten** der Quelldemo: Client starten,
Authentifizierung prüfen, die Sitzung erstellen und eine Nachricht senden. Fahren Sie mit **Zweiter
Akt** in derselben Anwendung fort, um ein Modell und eine Episode auszuwählen, Fähigkeiten zu
gewähren und den Prompt zu ersetzen. Die Website rendert diese lokalen Leitfadenabschnitte direkt,
sodass Editor-Leitfaden und Online-Workshop denselben Code vermitteln.

Der Track behandelt den Lebenszyklus von Client und Sitzung, Streaming, Registrierung lokaler Tools,
eine fokussierte Systemnachricht und Berechtigungen. MCP, automatisierte Ausgabevalidierung und
HTML-Abschlussprojekte gehören zu den vertiefenden Workshops. Prüfen Sie den generierten
Podcast-Text vor der Veröffentlichung anhand seiner Quelle.

## Museum Exhibit Studio-Workshop

Museum Exhibit Studio-Starterprojekte befinden sich unter `start-museum/<language>`, die fertigen
Referenzen unter `finished/<language>/museum-exhibit-studio`. Jedes Starterprojekt enthält ein
vorgefertigtes Kurator-Hilfsmodul, das Lernende nie bearbeiten: freigegebene Faktensätze, deren
Grenzen und das Faktauswahlmenü, einen Streaming-Ausgeber, deterministische Ausstellungsvalidierung,
den eng abgegrenzten Wikipedia MCP-Server mit seinem standardmäßig ablehnenden Berechtigungshandler,
die Schreibberechtigung für die Einzeldatei `exhibit.html`, die Kurator- und
Recherche-Systemnachrichten (in ihrer eigenen Hilfsdatei), den festen Prompt-Text
(Ausstellungsstruktur, Rechercheanfrage, Seitenanforderungen) und die Fehlermeldung, die der
Einstiegspunkt ausgibt.

Lernende arbeiten direkt in `start-museum/<language>` und bauen dieses eine Projekt über die
Lektionen hinweg aus, wobei sie es bei jedem Schritt ausführen. Sie schreiben den SDK-Code: die
Sitzungseinrichtung, Tool-Registrierung und die drei Sitzungskonfigurationen (von denen jede eine
vorgefertigte Systemnachricht im Ersetzungsmodus installiert), die Anweisungen in den Ausstellungs-
und Seiten-Prompts sowie einen Sitzungsrunner, der den Lebenszyklus und den Timeout verwaltet. Das
fertige Beispiel ist das, womit Lernende am Ende arbeiten, keine separate Referenzarchitektur.

Jede Stelle, an der Lernende Code schreiben, ist eine benannte Region im Einstiegspunkt des
Starterprojekts, begrenzt durch zwei Markierungskommentare, deren `BEGIN`-Zeile die Schritte
auflistet, die sie berühren:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Jeder Lektions-Codeblock wird durch eine Zeile wie ``**REPLACE** region `generation-config` in
`Program.cs`:`` eingeleitet und enthält den vollständigen Inhalt dieser Region. INSERT füllt eine
leere Region; REPLACE überschreibt, was ein früherer Schritt dort eingefügt hat. Markierungszeilen
werden nie verschoben, und keine Lektion ersetzt die ganze Datei. Die Inhaltsvalidierung wendet
jeden Lektionsblock auf das Starterprojekt an und verlangt, dass das Ergebnis dem fertigen
Einstiegspunkt entspricht, sodass eine Lektion nicht von der fertigen App abweichen kann. Wenn Sie
Museum-Lektionscode ändern, ändern Sie den fertigen Einstiegspunkt entsprechend und umgekehrt.

Der Lernenden-Track beginnt bei
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md), läuft dann durch sieben
Schritte — erste Sitzung, Streaming, Kuratorstimme, freigegebene Fakten, Strukturprüfungen und
Wikipedia MCP-Recherche, gefolgt von einem interaktiven `exhibit.html`-Abschluss — und endet mit
[Feier und Ressourcen](workshop/museum-09-complete.md).

Wenn nutzbare zitierte Recherche vorhanden ist, ruft der Kurator `approved_fact_lookup` und das
schreibgeschützte `approved_wikipedia_fact_lookup` auf, bevor er die Erzählung und die
Besucherfragen schreibt. Das zweite Tool gibt erfasste Recherche zurück, keinen Live-Zugriff auf
Wikipedia und keine von Menschen geprüften Fakten. Freigegebene Fakten haben Vorrang, und
abgelehnte, fehlgeschlagene oder nicht zitierte Recherche behält den Generierungspfad mit einem
einzigen Tool bei. Strukturvalidierung belegt keine faktische Fundierung; prüfen Sie recherchierte
Aussagen vor der Veröffentlichung.

Rust-Prüfungen verwenden über alle Workshop-Projekte hinweg ein gemeinsames Cargo-Zielverzeichnis
und vermeiden so wiederholte Kompilierung der SDK-Abhängigkeiten.

## Bereitstellung

Nachdem die Validierung bestanden wurde, pushen Sie nach `main`. Der
[Pages-Workflow](../../.github/workflows/deploy.yml) veröffentlicht `docs/` sowie die
Markdown-Lektionen in `workshop/` und deren Übersetzungen unter `localizations/`. Build- und
Inhaltsvalidierung werden separat im Validierungsworkflow ausgeführt.

Aktivieren Sie GitHub Pages in den Repository-Einstellungen und wählen Sie **GitHub Actions** als
Quelle aus. Der Bereitstellungsjob meldet die kanonische Workshop-URL in seiner Umgebung.

Der Bereitstellungsworkflow überprüft jede veröffentlichte HTML-Seite, jedes Website-Asset und jede
Markdown-Lektion. Er prüft standardmäßig die von GitHub Pages zurückgegebene URL. Um stattdessen
eine zukünftige öffentliche oder benutzerdefinierte Domain zu validieren, setzen Sie die
Repository-Actions-Variable `WORKSHOP_SITE_URL` auf die Basis-URL dieser Website. Sie können
dieselbe Prüfung manuell ausführen:

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## Referenzen

- [GitHub Copilot SDK für .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK für Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK für Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK für Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK für Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK für Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Copilot SDK-Kochbuch](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Copilot SDK-API und -Quellcode](https://github.com/github/copilot-sdk)
- [GitHub Copilot CLI installieren](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](../../LICENSE) lizenziert.

Dieser Workshop wird wie besehen zu Bildungszwecken bereitgestellt. Er soll Konzepte und Muster
demonstrieren, nicht als vollständiger Produktionsdienst dienen.
