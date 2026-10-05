# Museum Exhibit Studio

Dieses fertige Node.js-/TypeScript-Beispiel hat drei Quelldateien:

- `src/curator.ts` enthält das vorgefertigte Hilfsmodul: freigegebene Fakten und das
  Faktauswahlmenü, begrenztes Streaming, deterministische Validierung, eng abgegrenzte Wikipedia-Berechtigungen, die optionale Schreibberechtigung für `exhibit.html`, festen Prompt-Text und
  die Fehlermeldung.
- `src/system-messages.ts` enthält die vorgefertigten Kurator- und Recherche-Systemnachrichten.
- `src/index.ts` enthält den von Lernenden geschriebenen SDK-Code: die Anweisungen in den
  Ausstellungs- und Seiten-Prompts, Sitzungskonfigurationen, den Sitzungsrunner, optionale Recherche,
  Generierung, Validierung und den optionalen HTML-Abschluss.

Die `>>> BEGIN` / `<<< END`-Kommentare in `src/index.ts` sind die benannten Regionen, die die
Lektionen füllen. Jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder
ersetzen.

## Beispiel ausführen

```bash
cd finished/nodejs/museum-exhibit-studio
npm ci
npm start
```

Verwenden Sie `npm run build`, um die Typprüfung auszuführen, ohne ein Modell zu kontaktieren.

## Sicherheitsstruktur

Bei der Generierung wird `approved_fact_lookup` immer registriert und in die Zulassungsliste
aufgenommen; es gibt begrenzte freigegebene Fakten zurück. Bei brauchbarer zitierter Recherche wird
außerdem das schreibgeschützte lokale Tool `approved_wikipedia_fact_lookup` registriert und in die
Zulassungsliste aufgenommen, und der Kurator wird aufgefordert, beide aufzurufen, bevor er den
Wandtext und die Besucherfragen schreibt. Die zweite Abfrage gibt eine Momentaufnahme des
Recherchetexts und der Zitate zurück, keinen Livezugriff auf Wikipedia. Freigegebene Fakten haben
Vorrang; Recherche ist ergänzende Daten, keine Anweisungen oder von Menschen verifizierten Fakten.
Optionale Wikipedia-Recherche läuft in einer separaten Sitzung mit eingeschränkten `search`- und
`readArticle`-Tools, einem Berechtigungshandler, der standardmäßig ablehnt, zitierten `## Sources`
und ohne JSON-Vertrag oder Genehmigungsschleife für vorgeschlagene Ergänzungen. Recherche wird nie
in vom Lehrpersonal freigegebene Fakten übernommen. Abgelehnte Recherche behält den ursprünglichen
Pfad mit einem einzigen Tool bei; fehlgeschlagene Recherche oder eine unbrauchbare zitierte
Zusammenfassung gibt eine Warnung aus und verwendet denselben Fallback. Quellen werden weiterhin
nach der Ausstellung ausgegeben. Bestätigen Sie bei einer erfolgreichen Rechercheausführung, dass
beide lokalen Lookup-Ereignisse vor der Generierung erscheinen.

Nach der Generierung melden deterministische Prüfungen Struktur, Länge des Wandtexts, Besucherfragen
und verbotene Vokabeln. Falls ausgewählt, macht der HTML-Schritt nur `builtin:apply_patch` und
`builtin:create` verfügbar. Sein Berechtigungshandler genehmigt das Schreiben genau von
`exhibit.html` im App-Verzeichnis. Strukturprüfungen belegen keine faktische Fundierung; überprüfen
Sie recherchierte Behauptungen vor der Veröffentlichung.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
