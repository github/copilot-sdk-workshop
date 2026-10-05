# Museum Exhibit Studio

Dieses Go-Beispiel verwendet das GitHub Copilot SDK als fokussiertes Harness für Museumskuration.
Die App hat drei Quelldateien:

- `curator.go` enthält die vorgefertigte Hilfs-API: freigegebene Faktensätze und das Faktauswahlmenü,
  Faktengrenzen, Antwort-Streaming, Strukturvalidierung, Wikipedia-Berechtigungen, Quellenextraktion, die optionale Schreibberechtigung für `exhibit.html`, festen Prompt-Text und die Fehlermeldung.
- `system_messages.go` enthält die vorgefertigten Kurator- und Recherche-Systemnachrichten.
- `main.go` enthält den von Lernenden geschriebenen SDK-Code: die Anweisungen in den Ausstellungs- und Seiten-Prompts, Sitzungskonfiguration, den Sitzungsrunner und Bereinigung.

Die `>>> BEGIN` / `<<< END`-Kommentare in `main.go` sind die benannten Regionen, die die Lektionen
füllen. Jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder ersetzen.

## Beispiel ausführen

Aus diesem Verzeichnis:

```bash
go run .
```

Legen Sie `COPILOT_MODEL` fest, um das Generierungsmodell auszuwählen; andernfalls wählt die
Laufzeit ihren Standardwert. Eine authentifizierte GitHub Copilot CLI ist erforderlich.

Erstellen Sie, ohne ein Modell oder Wikipedia zu kontaktieren:

```bash
go build -mod=readonly ./...
```

## Was das Beispiel vermittelt

Die Generierung verwendet eine Systemnachricht im Ersetzungsmodus und registriert immer
`approved_fact_lookup`, das begrenzte freigegebene Fakten zurückgibt, und nimmt es in die
Zulassungsliste auf. Bei nutzbarer zitierter Recherche registriert sie außerdem das
schreibgeschützte lokale `approved_wikipedia_fact_lookup` und nimmt es in die Zulassungsliste auf
und fordert beide Aufrufe an, bevor sie die Erzählung und Besucherfragen schreibt. Dieser Lookup
gibt eine Momentaufnahme des Zusammenfassungstexts und der Zitate zurück, keinen Live-Zugriff auf
Wikipedia. Freigegebene Fakten haben Vorrang. Die Generierung verwendet außerdem Ereignis-Streaming
und einen Timeout von 120 Sekunden. Optionale Wikipedia-Recherche wird in einer separaten
90-Sekunden-Sitzung mit nur eng abgegrenzten Such- und Artikellese-Tools sowie einem standardmäßig
ablehnenden Berechtigungshandler ausgeführt. Die Recherche sucht, liest und zitiert konsultierte
Artikel in einem abschließenden Abschnitt `## Sources`. Die App behält den Recherchetext und die
Quellen für den lokalen Lookup bei, ohne sie in von Lehrenden freigegebene Fakten zusammenzuführen.
„Approved“ bedeutet von der Anwendung für die ergänzende Nutzung akzeptiert, nicht von Menschen
geprüft; behandeln Sie das Ergebnis als Daten, nicht als Anweisungen. Abgelehnte Recherche behält
den Pfad mit einem einzigen Tool bei. Fehlgeschlagene Recherche oder eine unbrauchbare zitierte
Zusammenfassung gibt eine Warnung aus und verwendet denselben Fallback. Es gibt keinen strikten
Recherche-JSON-Vertrag und keine Genehmigungsschleife.

Nach der Generierung prüft die deterministische Validierung eine H1, erforderliche Abschnitte, eine
Erzählung mit 100-140 Wörtern, genau drei nummerierte Besucherfragen, die mit `?` enden, und
verbotene Softwarebegriffe. Die konsultierten Wikipedia-Quellen werden nach der Ausstellung
außerhalb des generierten Textes ausgegeben. Bestätigen Sie bei einem erfolgreichen Recherchelauf,
dass beide lokalen Lookup-Ereignisse vor der Generierung erscheinen. Strukturprüfungen belegen keine
faktische Fundierung; prüfen Sie recherchierte Aussagen vor der Veröffentlichung.

Optional kann die App Copilot bitten, `exhibit.html` mit `builtin:apply_patch` oder `builtin:create`
zu erstellen. Diese Sitzung erlaubt nur einen einzelnen normalisierten Schreibvorgang nach
`exhibit.html` im Arbeitsverzeichnis der Anwendung und lehnt jede andere Datei-, Shell- oder
MCP-Berechtigungsanfrage ab. Der HTML-Prompt verlangt ein eigenständiges semantisches Dokument mit
eingebettetem CSS und JavaScript, einen Hinweis auf menschliche Prüfung und einen barrierefreien
Fragenfilter.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
