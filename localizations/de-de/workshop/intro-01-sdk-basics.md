# Schritt 1: SDK-Grundlagen

> **Dauer:** 5 Minuten

## Das SDK in einem Satz

Mit dem GitHub Copilot SDK kann Ihre Anwendung eine Copilot-Unterhaltung starten, ihre Antworten
streamen und bestimmte Anwendungsfunktionen als Tools verfügbar machen.

Das SDK ist kein Modell, das Sie selbst hosten. Ihre Anwendung verbindet sich mit der
**Copilot-Runtime**, die Modellanforderungen und Tool-Aufrufe koordiniert.

| Begriff | Funktion in diesem Workshop |
| --- | --- |
| Client | Startet die Runtime, verbindet sich mit ihr und prüft die Authentifizierung. |
| Sitzung | Enthält eine Unterhaltung, ihre Konfiguration, Nachrichten und Tool-Ergebnisse. |
| Prompt | Weist eine Aufgabe für diesen Turn zu, etwa das Schreiben eines Satzes. |
| Ereignis | Meldet ein Textfragment, Tool-Aktivität, einen Fehler oder einen abgeschlossenen Turn. |
| Tool | Eine benannte Anwendungsfunktion, die das Modell anfordern kann, etwa eine RSS-Abfrage. |

Die grundlegende Schleife ist:

```text
Your app -> client -> session -> prompt
                              <- response events
Your app <- permission request <- tool request
Your app -> tool result        -> next model response
```

Ein Client kann mehrere Sitzungen bedienen. Erstellen Sie für diese Einführung pro
Programmausführung einen Client und eine Sitzung, und schließen Sie anschließend beide. Sie
benötigen weder einen Webserver noch ein Agent-Framework oder eine Datenbank.

## Anwendung öffnen

Öffnen Sie **`LIVE_DEMO.md`** neben dem Einstiegspunkt unten. **Act One** darin ist die praktische
Abfolge für diesen Workshop:

1. Starten Sie den Client.
2. Prüfen Sie die Authentifizierung.
3. Erstellen Sie die Sitzung.
4. Senden Sie Hello World.

Der `Step 4`-Kommentar des Starterprojekts markiert die Ereignisbehandlung, die im Leitfaden
bereitgestellt oder gezeigt wird; das Senden ist im Code als `Step 5` markiert. Das sind Stellen im
Gerüst, keine zusätzlichen Übungen über die vier Änderungen des Leitfadens hinaus.

:::language dotnet
Öffnen Sie in Ihrem Ordner `start-intro/dotnet` die Datei `Program.cs`. Suchen Sie die Platzhalter
für Client, Authentifizierung und Sitzung. Der Ereignishandler gibt gestreamten Text bereits aus und
verfolgt den Abschluss des Turns.
:::
:::language nodejs
Öffnen Sie in Ihrem Ordner `start-intro/nodejs` die Datei `src/index.ts`. Suchen Sie die Platzhalter
für Client, Authentifizierung und Sitzung. Der Ereignishandler zeigt bereits, welche Ereignisse die
Anwendung beobachten kann.
:::
:::language python
Öffnen Sie in Ihrem Ordner `start-intro/python` die Datei `main.py`. Suchen Sie die Platzhalter für
Client, Authentifizierung und Sitzung. Der Ereignishandler gibt gestreamten Text bereits aus und
signalisiert, wenn der Turn beendet ist.
:::
:::language go
Öffnen Sie in Ihrem Ordner `start-intro/go` die Datei `main.go`. Suchen Sie die Platzhalter für
Client, Authentifizierung und Sitzung. Der Ereignishandler gibt gestreamten Text und Tool-Aktivität
bereits aus.
:::
:::language java
Öffnen Sie in Ihrem Ordner `start-intro/java` die Datei
`src/main/java/demo/CopilotSdkLiveDemo.java`. Suchen Sie die Platzhalter für Client,
Authentifizierung und Sitzung. Die nächste Lektion zeigt, wo Sie die fehlenden Abonnements
hinzufügen, während Sie dem Demoleitfaden folgen.
:::
:::language rust
Öffnen Sie in Ihrem Ordner `start-intro/rust` die Datei `src/main.rs`. Suchen Sie die Platzhalter
für Client, Authentifizierung und Sitzung. Die nächste Lektion zeigt, wo Sie das fehlende Abonnement
hinzufügen, während Sie dem Demoleitfaden folgen.
:::

## Was Sie steuern

Die **Anwendung** wählt das Modell, die Sitzungsidentität, die verfügbar gemachten Tools und die
Berechtigungsrichtlinie aus. Das **Modell** schlägt Text und Tool-Aufrufe innerhalb dieser
Einrichtung vor. Der Berechtigungshandler beantwortet, ob eine angeforderte Fähigkeit ausgeführt
werden darf.

Streaming ändert, wie Sie eine Antwort anzeigen, nicht ihre Vertrauenswürdigkeit. Eine
Systemnachricht lenkt das Verhalten; sie ist kein Mechanismus zur Zugriffssteuerung und kein Beleg
für faktische Richtigkeit. Mit einem Tool kann die Anwendung echte Quelldaten bereitstellen, aber
Sie prüfen den entstandenen Text weiterhin.

Im ersten Lauf ist die Aufgabe nur ein einsätziges Hello World. Im zweiten Lauf gewährt die
Anwendung zwei vorgefertigte, schreibgeschützte RSS-Tools und fordert Sie auf, deren Verwendung zu
genehmigen. In diesem Track schreiben wir keinen Feedparser und konfigurieren kein MCP.

## Verständnis prüfen

Zeigen Sie, wo der Client gestartet und wo die Sitzung erstellt wird. Erklären Sie den Unterschied
in einem Satz: Der Client verbindet sich mit der Runtime; die Sitzung ist die Unterhaltung.

Fahren Sie mit [Hello World per Streaming](intro-02-hello-world.md) fort.

## Weitere Informationen

- [Überblick über das Copilot SDK und Sprach-APIs](https://github.com/github/copilot-sdk)
- [Agentenschleife der Runtime](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
