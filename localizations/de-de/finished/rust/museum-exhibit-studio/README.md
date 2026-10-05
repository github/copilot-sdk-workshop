# Museum Exhibit Studio

Dieses Rust-Beispiel verwendet das GitHub Copilot SDK als fokussierten Agent-Harness für einen Bereich außerhalb der Softwareentwicklung. Vorgefertigte Hilfsfunktionen liegen in `src/lib.rs`: freigegebene Faktensätze und das Menü zur Faktenauswahl, Streaming, Validierung, eingeschränkte Berechtigungen, fester Prompt-Text und die Fehlermeldung. Die Kurator- und Recherche-Systemnachrichten sind in `src/system_messages.rs` vorgefertigt. Der von Lernenden geschriebene SDK-Code liegt in `src/main.rs`: die Anweisungen in den Ausstellungs- und Seiten-Prompts, die Sitzungskonfiguration und der Sitzungs-Runner.

Die Kommentare `>>> BEGIN` / `<<< END` in `src/main.rs` sind die benannten Regionen, die in den Lektionen gefüllt werden. Jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder ersetzen.

## Beispiel ausführen

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

Setzen Sie `COPILOT_MODEL`, um ein Generierungsmodell auszuwählen. Das Beispiel erfordert eine authentifizierte GitHub Copilot CLI.

Prüfen Sie, ohne ein Modell zu kontaktieren:

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## Was das Beispiel vermittelt

Die Generierungs-Sitzung verwendet eine Kurator-Systemnachricht im Ersetzungsmodus, validiert
freigegebene Fakten, streamt mit einem Timeout von 120 Sekunden, registriert `approved_fact_lookup`
immer und nimmt es in die Zulassungsliste auf, weist leere Ausgabe zurück und gibt deterministische
Strukturvalidierung aus. Bei brauchbarer zitierter Recherche registriert sie außerdem das
schreibgeschützte lokale Tool `approved_wikipedia_fact_lookup` und nimmt es in die Zulassungsliste
auf; beide Aufrufe werden angefordert, bevor der Wandtext und die Besucherfragen geschrieben werden.

Optionale Wikipedia-Recherche ist getrennt: Sie stellt nur eingeschränkte MCP-Tools `search` und
`readArticle` bereit, verwendet einen Berechtigungshandler, der standardmäßig ablehnt, und erzeugt
eine Zusammenfassung und zitierte Quellen. Der neue lokale Lookup gibt eine Momentaufnahme dieses
Texts und der Zitate zurück, ohne Livezugriff auf Wikipedia und ohne Recherche in vom Lehrpersonal
freigegebene Fakten zu übernehmen. Freigegebene Fakten haben Vorrang; „freigegebene“ Recherche ist
von der Anwendung akzeptierte ergänzende Daten, keine von Menschen verifizierten Fakten und keine
Anweisungen. Abgelehnte Recherche behält den Pfad mit einem einzigen Tool bei. Fehlgeschlagene
Recherche oder eine unbrauchbare zitierte Zusammenfassung gibt eine Warnung aus und verwendet
denselben Fallback. Quellen werden nach der Ausstellung ausgegeben; erfolgreiche Recherche sollte
beide lokalen Lookup-Ereignisse vor der Generierung zeigen. Strukturprüfungen belegen keine
faktische Fundierung; überprüfen Sie daher recherchierte Behauptungen vor der Veröffentlichung.

Optionale HTML-Generierung verwendet `builtin:apply_patch` oder `builtin:create` mit einem Ein-Datei-Berechtigungshandler, der nur `exhibit.html` im Arbeitsverzeichnis der Anwendung schreiben kann.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
