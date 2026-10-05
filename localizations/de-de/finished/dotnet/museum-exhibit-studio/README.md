# Museum Exhibit Studio

Dieses fertige .NET-Beispiel verwendet das GitHub Copilot SDK, um aus freigegebenen Fakten eine
kleine Museumsausstellung zu generieren. Die vorgefertigten `Helpers/Curator*.cs`-Dateien stellen
Faktensätze und das Faktauswahlmenü, Grenzprüfung, Streaming, deterministische Validierung, eng
abgegrenzte Wikipedia-Berechtigungen, die eng abgegrenzte Schreibberechtigung für `exhibit.html`,
festen Prompt-Text und die Fehlermeldung bereit, und `Helpers/CuratorSystemMessages.cs` enthält die
Kurator- und Recherche-Systemnachrichten. `Program.cs` bleibt von Lernenden geschrieben: Der
Einstiegspunkt schreibt die Anweisungen in den Ausstellungs- und Seiten-Prompts, erstellt die drei
Sitzungskonfigurationen und führt jede über einen Sitzungsrunner aus.

Die `>>> BEGIN` / `<<< END`-Kommentare in `Program.cs` sind die benannten Regionen, die die
Lektionen füllen. Jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder
ersetzen, sodass die Datei zeigt, welcher Schritt welchen Teil erzeugt hat.

## Beispiel ausführen

Aus dem Repository-Stammverzeichnis:

```bash
dotnet run --project finished/dotnet/museum-exhibit-studio
```

Legen Sie `COPILOT_MODEL` vor dem Ausführen fest, um ein Modell auszuwählen. Andernfalls wählt die
Copilot-Laufzeit ihren Standardwert. Das Beispiel erfordert eine authentifizierte GitHub Copilot
CLI.

Erstellen Sie, ohne ein Modell zu kontaktieren:

```bash
dotnet build finished/dotnet/museum-exhibit-studio
```

## Was das Beispiel vermittelt

Die Generierungssitzung registriert das anwendungseigene Tool `approved_fact_lookup` immer und nimmt
es in die Zulassungsliste auf. Wenn nutzbare zitierte Recherche vorhanden ist, registriert sie
außerdem `approved_wikipedia_fact_lookup` und nimmt es in die Zulassungsliste auf, und der Prompt
fordert beide Aufrufe an, bevor die Erzählung und die Besucherfragen geschrieben werden. Eine
Systemnachricht im Ersetzungsmodus gibt freigegebenen Fakten Vorrang und behandelt Tool-Ergebnisse
als Daten, nicht als Anweisungen. `CuratorFacts.CreateApprovedFactLookup` begrenzt diese Fakten,
bevor das Modell sie jemals sehen kann, `CuratorFacts.BoundFacts` kürzt und validiert Fakten vor
jedem Generierungs- oder Recherche-Sendevorgang, und `CuratorStreamer.StreamExhibitAsync` streamt
Modellausgabe mit expliziten Timeouts.

Optionale Wikipedia-Recherche ist bewusst leichtgewichtig: Eine separate Sitzung stellt nur eng
abgegrenzte `search`- und `readArticle`-MCP-Tools über `CuratorSafety.WikipediaPermissionHandler`
bereit. Das Modell schreibt Prosanotizen und eine abschließende `## Sources`-Liste. Die App
extrahiert zitierte Quellentitel und URLs und behält den Zusammenfassungstext bei.
`CuratorFacts.CreateApprovedWikipediaFactLookup` gibt eine erfasste Momentaufnahme dieses Texts und
der Zitate ohne Netzwerkzugriff zurück. Recherche ist ergänzend und wird nie in von Lehrenden
freigegebene Fakten zusammengeführt; „approved“ bedeutet von der Anwendung akzeptiert, nicht von
Menschen geprüft. Abgelehnte Recherche behält den Pfad mit einem einzigen Tool bei. Fehlgeschlagene
Recherche oder eine Zusammenfassung ohne Zitate gibt eine Warnung aus und verwendet denselben
Fallback. Quellen werden weiterhin nach der Ausstellung ausgegeben.

Nach der Generierung prüft die deterministische Validierung den Titel, `## Narrative`, die Länge der
Erzählung von 100-140 Wörtern, `## Visitor questions`, genau drei nummerierte Fragen, Fragezeichen
und verbotene Begriffe. Diese Strukturprüfungen belegen keine faktische Fundierung, daher bleibt
eine menschliche Prüfung erforderlich.

Der optionale Abschluss erstellt `exhibit.html` mit `builtin:apply_patch` oder `builtin:create`.
`CuratorSafety.ExhibitWritePermission` erlaubt nur diese einzelne Datei im Arbeitsverzeichnis der
Anwendung und lehnt jede andere Schreib-, Shell- oder MCP-Anfrage ab.

## Manuelle Prüfung

1. Führen Sie das Beispiel aus und akzeptieren Sie einen der integrierten Faktensätze.
2. Aktivieren Sie Recherche und bestätigen Sie, dass beide lokalen Lookup-Ereignisse vor der Ausstellung erscheinen und Quellen
   danach ausgegeben werden. Lehnen Sie Recherche ab und bestätigen Sie, dass nur `approved_fact_lookup` aufgerufen wird.
3. Bestätigen Sie, dass die Ausstellung einen Titel, eine Erzählung mit 100-140 Wörtern und drei Fragen enthält.
4. Bestätigen Sie, dass die Validierungszusammenfassung und der Hinweis auf menschliche Prüfung angezeigt werden.
5. Generieren Sie optional `exhibit.html` und prüfen Sie die eigenständige interaktive Seite in einem Browser.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
