# Schritt 2: Hello World per Streaming

> **Dauer:** 10 Minuten

## Mit dem Starterprojekt beginnen

Bearbeiten Sie den Einstiegspunkt im Ordner `start-intro`, den Sie während der Vorbereitung geöffnet
haben. Öffnen Sie die zugehörige **`LIVE_DEMO.md`** neben dem Code. Diese Lektion zeigt **Act One:
Hello World** aus derselben Datei, keine separate Implementierung.

Befolgen Sie die vier nummerierten Änderungen der Reihe nach: **Client starten, Authentifizierung
prüfen, Sitzung erstellen und Hello World senden**. Behalten Sie die vom Starterprojekt
bereitgestellte Ereignisbehandlung bei; Java und Rust enthalten das fehlende Abonnement an der
markierten Stelle. Schließen Sie alle vier Änderungen ab, bevor Sie die Anwendung ausführen.

:::language dotnet
Arbeiten Sie in `start-intro/dotnet` und bearbeiten Sie `Program.cs`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
Arbeiten Sie in `start-intro/nodejs` und bearbeiten Sie `src/index.ts`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
Arbeiten Sie in `start-intro/python` und bearbeiten Sie `main.py`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
Arbeiten Sie in `start-intro/go` und bearbeiten Sie `main.go`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
Arbeiten Sie in `start-intro/java` und bearbeiten Sie `src/main/java/demo/CopilotSdkLiveDemo.java`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
Arbeiten Sie in `start-intro/rust` und bearbeiten Sie `src/main.rs`.
[Öffnen Sie den lokalen Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## Erster Akt: Hello World

<!-- LIVE_DEMO -->

## Ausführen

Verwenden Sie den Prüfpunktbefehl in Ihrem Demoleitfaden aus dem ausgewählten Sprachordner. Erwarten
Sie eine echte, gestreamte einsätzige Antwort und danach das Programmende. Allein das Banner des
Starterprojekts oder eine Authentifizierungsmeldung ist kein erfolgreiches Hello World.

Die Sitzung verwendet eine **leere Tool-Zulassungsliste** mit einem Berechtigungshandler. Alles zu
genehmigen ist für sich genommen keine Sicherheitsgrenze; die leere Zulassungsliste entfernt
Tool-Fähigkeiten für diese erste Übung. Der nächste Akt ersetzt beide Einstellungen.

## Verständnis prüfen

Zeigen Sie auf die vier Änderungen, die Sie vorgenommen haben. Erklären Sie, warum Client und
Sitzung unterschiedlich sind und welches Ereignis meldet, dass der Turn abgeschlossen ist.

## Problembehandlung für diesen Lauf

- **Keine echte Antwort:** Speichern Sie den Einstiegspunkt und schließen Sie alle vier Schritte des Leitfadens ab.
- **Authentifizierungsfehler:** Führen Sie `copilot auth login` in derselben Umgebung aus.
- **Modell nicht verfügbar:** Ändern Sie das bevorzugte Modell des Starterprojekts in eine ID, die für
  Ihr Konto verfügbar ist. Der nächste Akt führt die Modellauswahl ein.
- **Turn bleibt hängen:** Behalten Sie den Berechtigungshandler und die leere Zulassungsliste bei; prüfen Sie die CLI-Konnektivität
  und das Warten auf den Abschluss.

Fahren Sie mit [Den Podcast-Agenten erstellen](intro-03-podcast-agent.md) fort.

## Weitere Informationen

- [Copilot SDK-Sprach-APIs](https://github.com/github/copilot-sdk)
- [Enthaltene Starterprojekte und Demoleitfäden](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
