# Live-Demo zu The GitHub Podcast: Java

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Rechner noch nicht authentifiziert ist.
2. Kompilieren Sie Abhängigkeiten im enthaltenen Starterprojekt vor der zeitlich begrenzten Sitzung:

```powershell
cd start-intro/java
./mvnw compile
```

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Beginnen Sie mit `src\main\java\demo\CopilotSdkLiveDemo.java`. Die Datei hat absichtlich benannte Platzhalter für `client`, `isAuthenticated` und `session`.

### 1. Client starten

Ersetzen Sie `CopilotClient client;` durch:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

Dieser Ressourcenblock bleibt geöffnet, bis Schritt 4 seine schließende geschweifte Klammer
hinzufügt. Schließen Sie alle vier Bearbeitungen ab, bevor Sie die Anwendung ausführen.

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `boolean isAuthenticated = false;` durch:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Sitzung erstellen

Ersetzen Sie den Sitzungsplatzhalter durch:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

Fügen Sie diese Importe hinzu:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

Ersetzen Sie die Kommentare unter `// Step 4: Stream events from the assistant.` durch:

```java
session.on(AssistantMessageDeltaEvent.class, event -> {
    String delta = event.getData().deltaContent();
    if (delta != null) {
        System.out.print(delta);
    }
});
session.on(ToolExecutionStartEvent.class, event ->
        System.out.println("\n[Tool call started] " + event.getData().toolName()));
session.on(ToolExecutionCompleteEvent.class, event ->
        System.out.println("\n[Tool call complete]"));
```

Dies stellt den Streaming-Handler an der Stelle bereit, an der das Starterprojekt ihn markiert hat.
Der Sitzungsressourcenblock bleibt ebenfalls bis Schritt 4 geöffnet.

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt und Streaming aktiviert.“

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Entfernen Sie unter `// Step 5: Send the first message.` den Platzhalter `var config` und die
zugehörige `if (session != null)`-Schutzabfrage. Ersetzen Sie beides durch:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

Die beiden schließenden geschweiften Klammern beenden die Sitzungs- und Client-Ressourcenblöcke aus
den Schritten 3 und 1. Behalten Sie die vorhandenen schließenden Klammern für Methode und Klasse
bei.

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, auf Ereignisse lauschen und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Führen Sie diesen Hello World-Checkpoint jetzt aus dem Ordner `java` aus:

```powershell
./mvnw compile exec:java
```

Erwartete Ausgabe: eine gestreamte Antwort in einem Satz. `sendAndWait` wartet auf den Abschluss und
gibt Fehler weiter; die Ressourcenblöcke schließen beide SDK-Ressourcen.

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Verwenden Sie nach Hello World die vorab geschriebenen Hilfsklassen, um dieselbe Sitzung in einen auf Fakten gestützten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Fügen Sie Importe für `com.github.copilot.rpc.SystemMessageConfig` und
`com.github.copilot.SystemMessageMode` hinzu. Behalten Sie `java.util.List` aus dem Ersten Akt bei.
Der Import `PermissionHandler` wird nicht mehr verwendet, sobald `PermissionPrompt` ihn unten
ersetzt.

Fügen Sie innerhalb des Client-Ressourcenblocks nach der Authentifizierung und vor `var config` Folgendes ein:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Erstellen Sie die Tools:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

Ersetzen Sie `var config` und die zugehörige Builder-Kette, behalten Sie aber den vorhandenen
`try (var session = client.createSession(config).get())`-Block bei:

```java
var config = new SessionConfig()
        .setModel(selectedModel)
        .setStreaming(true)
        .setTools(List.of(episodeTool, latestEpisodesTool))
        .setAvailableTools(List.of("get_github_podcast_episode", "get_latest_github_podcast_episodes"))
        .setOnPermissionRequest(PermissionPrompt.HANDLER)
        .setSystemMessage(new SystemMessageConfig()
                .setMode(SystemMessageMode.REPLACE)
                .setContent("You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."));
```

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng gefasste, typisierte Fähigkeiten, setze sie anhand ihres Namens auf die Zulassungsliste und tausche den Handler, der in Hello World alles genehmigt, gegen `PermissionPrompt` aus; dieser lehnt alles ab, was keines dieser Tools ist, und fragt mich über stdin, bevor eines ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet REPLACE, nicht APPEND. Meine Anwendung liefert die vollständige Agent-Identität und die Grounding-Regel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Ersetzen Sie nur das Argument von `.setPrompt(...)` im vorhandenen begrenzten Sendevorgang:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

Aktualisieren Sie die Modellstatuszeile, sodass sie `selectedModel` ausgibt. Behalten Sie die
Abonnements, die Wartezeit von 60 Sekunden und beide Ressourcenblöcke unverändert bei.

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Führen Sie den fertigen Podcast-Agenten jetzt aus dem Ordner `java` aus:

```powershell
./mvnw compile exec:java
```

Erwartete Meilensteine: Modellauswahl, Auswahl von zehn Episoden, Tool-Ausführung, Genehmigungs-Prompt, dann auf Fakten gestützter Launch-Text.
