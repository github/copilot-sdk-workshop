# Museum Exhibit Studio

Dieses Python-Beispiel verwendet das GitHub Copilot SDK als fokussiertes Studio für
Museumsausstellungen. Die fertige App hat drei Module:

- `curator.py` enthält die vorgefertigten Workshop-Hilfsfunktionen: freigegebene Faktensätze und
  das Menü zur Faktenauswahl, begrenzte Faktenvalidierung, Streaming, deterministische
  Strukturprüfungen, eingeschränkte Wikipedia-Berechtigungen, eingeschränkte Schreibberechtigung
  für `exhibit.html`, festen Prompt-Text und die Fehlermeldung.
- `system_messages.py` enthält die vorgefertigten Kurator- und Recherche-Systemnachrichten.
- `main.py` enthält den von Lernenden geschriebenen SDK-Code: die Anweisungen in den
  Ausstellungs- und Seiten-Prompts, die Sitzungskonfiguration, den Sitzungs-Runner,
  die Validierung und die optionale HTML-Generierung.

Die Kommentare `>>> BEGIN` / `<<< END` in `main.py` sind die benannten Regionen, die in den
Lektionen gefüllt werden. Jede `BEGIN`-Zeile listet die Schritte auf, die diese Region einfügen oder
ersetzen.

## Beispiel ausführen

Erstellen Sie aus diesem Verzeichnis eine Umgebung und installieren Sie die fixierte Abhängigkeit:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Setzen Sie `COPILOT_MODEL`, um ein Modell auszuwählen; andernfalls wählt die Runtime ihren
Standardwert. Eine authentifizierte GitHub Copilot CLI ist erforderlich.

Für Wikipedia-Recherche ist Node.js erforderlich, weil die Recherche-Sitzung das fixierte Paket
`wikipedia-mcp@1.0.3` über `npx` startet. Wenn Sie Recherche ablehnen, wird der MCP-Server nicht
gestartet.

Prüfen Sie den Quelltext, ohne ein Modell zu kontaktieren:

```powershell
python -m py_compile *.py
```

## Was das Beispiel vermittelt

Bei der Generierung wird `approved_fact_lookup` immer registriert und in die Zulassungsliste
aufgenommen; es gibt die begrenzten freigegebenen Fakten zurück. Bei brauchbarer zitierter Recherche
wird außerdem das schreibgeschützte lokale Tool `approved_wikipedia_fact_lookup` registriert und in
die Zulassungsliste aufgenommen, und beide Aufrufe werden angefordert, bevor der Wandtext und die
Besucherfragen geschrieben werden. Die zweite Abfrage gibt eine Momentaufnahme des
Zusammenfassungstexts und der Zitate zurück, keinen Livezugriff auf Wikipedia. Freigegebene Fakten
haben Vorrang vor ergänzender Recherche. Außerdem verwendet sie eine Kurator-Systemnachricht im
Replace-Modus, Streaming, ein Timeout von 120 Sekunden und deterministische Strukturvalidierung.
Importierte Module haben keine Nebenwirkungen; `main.py` wird nur hinter dem
`if __name__ == "__main__"`-Guard ausgeführt.

Optionale Wikipedia-Recherche ist absichtlich von der Generierung getrennt. Die Recherche-Sitzung
stellt nur eingeschränkte Wikipedia-Such- und Artikel-Lese-Tools bereit, verwendet einen
Berechtigungshandler, der standardmäßig ablehnt, fordert eine Prosazusammenfassung an und parst eine
nachgestellte `## Sources`-Liste. Sowohl Zusammenfassung als auch Zitate werden für die lokale
Abfrage beibehalten, aber nie in vom Lehrpersonal freigegebene Fakten übernommen. „Freigegeben“
bedeutet von der Anwendung akzeptierte Recherche, nicht von Menschen verifizierte Fakten; behandeln
Sie sie als Daten, nicht als Anweisungen. Abgelehnte Recherche behält den Pfad mit einem einzigen
Tool bei. Fehlgeschlagene Recherche oder eine unbrauchbare zitierte Zusammenfassung gibt eine
Warnung aus und verwendet denselben Fallback. Es gibt keinen strikten JSON-Vertrag für Recherche und
keine Genehmigungsschleife für vorgeschlagene Ergänzungen.

Nach der Validierung macht der optionale HTML-Abschluss nur `builtin:apply_patch` und
`builtin:create` verfügbar und genehmigt das Schreiben genau von `exhibit.html` im
Arbeitsverzeichnis der Anwendung. Der Prompt verlangt eine eigenständige semantische HTML-Datei mit
eingebettetem CSS und JavaScript, einen Hinweis auf menschliche Prüfung und einen barrierefreien
Fragenfilter.

Prompt-Anleitung und Strukturvalidierung sind keine Autorisierungs- oder Fundierungsgrenzen.
Generierte Behauptungen erfordern weiterhin eine menschliche Prüfung oder einen separaten Evaluator.

## Manuelle Prüfung

1. Führen Sie das Beispiel mit jedem integrierten Faktensatz aus und bestätigen Sie, dass die
   ausgewählten Fakten vor der Generierung ausgegeben werden.
2. Bestätigen Sie, dass die Ausstellung einen Titel, einen Wandtext mit 100-140 Wörtern und drei
   Besucherfragen hat.
3. Prüfen Sie die Validierungszusammenfassung und den Fundierungshinweis.
4. Lehnen Sie Recherche ab und bestätigen Sie, dass das einzige Tool-Ereignis `approved_fact_lookup` ist.
5. Aktivieren Sie Recherche und bestätigen Sie, dass beide lokalen Lookup-Ereignisse vor der
   Generierung erscheinen und Quellen nach der Ausstellung ausgegeben werden, nicht darin.
6. Aktivieren Sie `exhibit.html` und bestätigen Sie, dass nur diese Datei geschrieben wird.

Dies ist die Anwendung, mit der Lernende nach den Museum-Lektionen am Ende arbeiten, keine separate
Referenzarchitektur. Der Einstiegspunkt behält einen kleinen Sitzungsrunner, der den Client startet,
die Sitzung erstellt, den Timeout durchsetzt, leere Ausgabe ablehnt und in jedem Ablaufpfad
aufräumt; die Recherche-, Generierungs- und optionalen HTML-Schritte verwenden ihn mit
unterschiedlichen Sitzungskonfigurationen wieder. Folgen Sie dem Track ab
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
