# Schritt 3: Den Podcast-Agenten erstellen

> **Dauer:** 12 Minuten

## Mit derselben Demo fortfahren

Behalten Sie die Hello-World-Anwendung, die Sie gerade fertiggestellt haben. Folgen Sie **Act Two:
Turn It Into A Podcast Agent** in derselben **`LIVE_DEMO.md`**. Diese Lektion zeigt diesen Akt
direkt.

Nehmen Sie die drei Änderungen des Leitfadens vor: Wählen Sie ein Modell und eine echte Episode aus,
geben Sie der Sitzung ihre Fähigkeiten und Identität und ersetzen Sie anschließend den Prompt.
Verwenden Sie die vorgefertigten Hilfsfunktionen wieder, statt einen Feedparser zu schreiben oder
ein anderes Projekt zu starten.

:::language dotnet
Fahren Sie in `start-intro/dotnet/Program.cs` fort.
[Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
Fahren Sie in `start-intro/nodejs/src/index.ts` fort.
[Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
Fahren Sie in `start-intro/python/main.py` fort. [Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
Fahren Sie in `start-intro/go/main.go` fort. [Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
Fahren Sie in `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java` fort.
[Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
Fahren Sie in `start-intro/rust/src/main.rs` fort. [Act Two in Ihrem Demoleitfaden](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## Zweiter Akt: In einen Podcast-Agenten verwandeln

<!-- LIVE_DEMO -->

## Ausführen

Verwenden Sie denselben Ordner und denselben Ausführungsbefehl wie bei Hello World. Wählen Sie ein
Modell und eine der echten Episoden aus. Lesen Sie den angeforderten Tool-Namen, bevor Sie ihn mit
`y` genehmigen. Durch Drücken der Eingabetaste lehnen Sie die Anfrage ab; eine Ablehnung ist keine
erfolgreiche Abfrage.

Erwarten Sie die Modellauswahl, die Episodenauswahl, ein Tool-Start-Ereignis, einen Genehmigungs-
Prompt, ein Tool-Abgeschlossen-Ereignis und anschließend gestreamten Ankündigungstext.

Die Anwendung ruft die Episodenliste vor einem vom Modell angeforderten Tool-Aufruf ab. Der
Berechtigungshandler steuert vom Modell angeforderte Tools, nicht jede Netzwerkanfrage, die Ihre
Anwendung stellt. Behalten Sie die vorhandene Ereignisbehandlung und Bereinigung bei.

## Verständnis prüfen

Suchen Sie die beiden Tool-Registrierungen, ihre Zulassungsliste, den Berechtigungshandler und die
Systemnachricht. Erklären Sie, was sich gegenüber Hello World geändert hat.

Vergleichen Sie das Ergebnis mit den RSS-Metadaten der ausgewählten Episode. Die Aufforderung zu
einem Beitrag mit weniger als 280 Zeichen **erzwingt die Begrenzung nicht im Code**. Eine
Systemnachricht beweist weder faktische Richtigkeit noch Sicherheit in Bezug auf Sponsoren. Prüfen
Sie Behauptungen und Länge **vor der Veröffentlichung**; veröffentlichen Sie während dieses
Workshops nichts.

## Problembehandlung für diesen Lauf

- **Keine Episodenliste:** Prüfen Sie den Zugriff auf den offiziellen RSS-Feed; ersetzen Sie
  eine fehlgeschlagene Abfrage nicht durch erfundene Fakten.
- **Kein Genehmigungs-Prompt:** Prüfen Sie beide Tool-Namen, ihre Zulassungsliste und den
  ersetzten Berechtigungshandler.
- **Warten auf Eingabe:** Verwenden Sie ein interaktives Terminal und beantworten Sie dessen Prompt.
- **Abgelehnte Abfrage:** Führen Sie die Anwendung erneut aus und genehmigen Sie gegebenenfalls das erwartete schreibgeschützte Tool.
  Entfernen Sie den Handler nicht, um eine Ablehnung zu umgehen.

Fahren Sie mit [Zusammenfassung und nächste Schritte](intro-04-wrap-up.md) fort.

## Weitere Informationen

- [Copilot SDK und Tool-APIs](https://github.com/github/copilot-sdk)
- [Enthaltene Starterprojekte und Demoleitfäden](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
