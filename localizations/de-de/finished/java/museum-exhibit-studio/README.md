# Museum Exhibit Studio

Dieses Maven-CLI-Beispiel verwendet das GitHub Copilot SDK als fokussierten Museumskurations-Agenten. Eine Museumspädagogin oder ein Museumspädagoge wählt einen von drei freigegebenen Faktensätzen aus oder gibt eigene begrenzte Fakten ein, streamt optional eng abgegrenzte Wikipedia-Hintergrundrecherche, generiert besucherorientierten Ausstellungstext, validiert dessen Struktur und kann sich für einen `exhibit.html`-Abschluss entscheiden.

## Ausführen

Aus diesem Verzeichnis:

```bash
./mvnw compile exec:java
```

Legen Sie `COPILOT_MODEL` fest, um ein Modell auszuwählen; andernfalls wählt die Copilot-Laufzeit ihren Standardwert. Das Beispiel erfordert eine authentifizierte GitHub Copilot CLI.

Kompilieren Sie, ohne ein Modell zu kontaktieren:

```bash
./mvnw compile
```

## Was es demonstriert

Der von Lernenden geschriebene Einstiegspunkt `MuseumExhibitStudio` erstellt Sitzungen direkt mit `new CopilotClient()`. Die vorgefertigten `Curator*`-Hilfsfunktionen stellen freigegebene Fakten und das Faktauswahlmenü, Streaming, Validierung, eng abgegrenzte Berechtigungen, Quellenextraktion, festen Prompt-Text, die Fehlermeldung und (in `CuratorSystemMessages.java`) die Kurator- und Recherche-Systemnachrichten bereit. Die `>>> BEGIN` / `<<< END`-Kommentare im Einstiegspunkt sind die benannten Regionen, die die Lektionen füllen; jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder ersetzen.

Prompt-Anweisungen sind keine Autorisierungsgrenze, daher tut die Anwendung außerdem Folgendes:

- registriert `approved_fact_lookup` immer und nimmt es in die Zulassungsliste auf, wobei das schreibgeschützte lokale
  `approved_wikipedia_fact_lookup` nur hinzugefügt wird, wenn nutzbare zitierte Recherche vorhanden ist;
- beschränkt Recherche über einen standardmäßig ablehnenden Berechtigungshandler auf den konfigurierten Wikipedia MCP-Server und `wikipedia-search` / `wikipedia-readArticle`;
- erfasst den Recherchetext und die abschließenden `## Sources`-Zitate für den zweiten lokalen Lookup,
  ohne sie jemals in von Lehrenden freigegebene Fakten zusammenzuführen oder der Generierung Live-Zugriff auf Wikipedia zu geben;
- begrenzt Eingaben vor jedem Senden an das Modell auf 20 Fakten mit jeweils höchstens 500 Zeichen;
- verwendet explizite Timeouts, lehnt leere Ausstellungsausgabe ab und trennt Sitzungen / beendet Clients bei Erfolg und Fehler;
- prüft eine H1, erforderliche Abschnitte, eine Erzählung mit 100-140 Wörtern, genau drei nummerierte Fragen, die mit `?` enden, und verbotenes Softwarevokabular; und
- erlaubt optional `builtin:apply_patch` und `builtin:create`, nur `exhibit.html` im Arbeitsverzeichnis der Anwendung zu schreiben.

Der Kurator wird angewiesen, beide lokalen Lookups aufzurufen, bevor er die Erzählung und
Besucherfragen schreibt, wenn Recherche vorhanden ist. Freigegebene Fakten haben Vorrang vor
ergänzender Recherche, die Daten sind, keine Anweisungen. „Approved“-Recherche bedeutet von der
Anwendung akzeptiert, nicht von Menschen geprüft. Abgelehnte Recherche behält den Pfad mit einem
einzigen Tool bei. Fehlgeschlagene Recherche oder eine unbrauchbare zitierte Zusammenfassung gibt
eine Warnung aus und verwendet denselben Fallback. Bestätigen Sie bei einem erfolgreichen
Recherchelauf beide Lookup-Ereignisse; Quellen werden weiterhin nach der Ausstellung ausgegeben. Der
Validator kann keine semantische faktische Fundierung belegen. Generierte Aussagen erfordern
weiterhin menschliche Prüfung oder einen separaten Evaluator.

## Optionales HTML-Abschlussprojekt

Antworten Sie bei Aufforderung mit yes, um `exhibit.html` zu generieren. Das angeheftete Java SDK
1.0.11 bewahrt Berechtigungsfelder wie `fileName`, sodass der strikte Berechtigungshandler einen
Schreibvorgang nur genehmigt, wenn dessen normalisierter Pfad exakt `exhibit.html` in diesem
Verzeichnis ist. Fehlende Pfaddaten, andere Dateipfade und Nicht-Schreibanforderungen bleiben
abgelehnt; es gibt keinen breiten Schreib-Fallback.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
