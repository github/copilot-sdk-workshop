# Live-Demo zu The GitHub Podcast

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Rechner noch nicht authentifiziert ist.
2. Arbeiten Sie im enthaltenen Starterprojekt und stellen Sie Abhängigkeiten vor der zeitlich begrenzten Sitzung wieder her:

```powershell
cd start-intro/dotnet
dotnet restore
```

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Beginnen Sie mit `Program.cs`. Die Datei hat absichtlich benannte Platzhalter für `client`, `isAuthenticated` und `session`. Lassen Sie den Streaming-Ereignishandler und die Abschlusswartezeit unverändert.

### 1. Client starten

Ersetzen Sie `CopilotClient client;` durch:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `var isAuthenticated = false;` durch:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Sitzung erstellen

Fügen Sie oben `using GitHub.Copilot.Rpc;` hinzu. Ersetzen Sie `CopilotSession session = null!;`
durch:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt, Streaming aktiviert, und der Ereignishandler unten gibt bereits jedes Textfragment aus, sobald es ankommt.“

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Geben Sie unter `// Step 5: Send the first message.` Folgendes ein:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

Ersetzen Sie das abschließende `await complete.Task;` durch:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

Der vorhandene Ereignishandler ist bereits bereitgestellt; er ist keine fünfte Bearbeitungsübung. Er
gibt Deltas aus, macht Sitzungsfehler sichtbar und endet im Leerlauf. `await using` schließt den
Client und die Sitzung nach der Ausführung.

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, auf Ereignisse lauschen und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Erwartete Ausgabe: eine gestreamte Antwort in einem Satz, gefolgt vom vorhandenen `SessionIdleEvent`, der das Programm abschließt.

Führen Sie diesen Hello World-Checkpoint aus `start-intro/dotnet` aus:

```powershell
dotnet run
```

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Fügen Sie nach Hello World die vorab geschriebenen Hilfsfunktionen in `Helpers` und `Tools` hinzu, um dieselbe Sitzung in einen fundierten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Fügen Sie using-Direktiven für die vorab geschriebenen Hilfsfunktionen hinzu:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

Fügen Sie nach der Authentifizierung, vor dem Abschlusssignal und der Sitzung, einen Picker hinzu
und wählen Sie eine der zehn neuesten Episoden aus:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Erstellen Sie die anwendungseigenen Tools:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Ersetzen Sie die Hello-World-`SessionConfig`-Felder durch diese und behalten Sie
`await using var session = await client.CreateSessionAsync(...)` bei:

```csharp
Model = model,
Streaming = true,
Tools = [episodeTool, latestEpisodesTool],
AvailableTools = ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
OnPermissionRequest = PermissionPrompt.RequestAsync,
SystemMessage = new SystemMessageConfig
{
    Mode = SystemMessageMode.Replace,
    Content = "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."
}
```

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng begrenzte, typisierte Fähigkeiten, nehme sie nach Namen in die Zulassungsliste auf und tausche den Alles-genehmigen-Handler von Hello World gegen einen aus, der mich auffordert, damit ich der Genehmigungspunkt bleibe, bevor ein Tool ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet Replace, nicht Append. Meine Anwendung liefert die vollständige Agentenidentität und die Fundierungsregel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Ersetzen Sie Hello World durch die ausgewählte, fundierte Episodenanfrage:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Erwartete Meilensteine: Modellauswahl, Auswahl aus zehn Episoden, `[Tool call started]`, Genehmigungs-Prompt, `[Tool call complete]`, danach gestreamter Launch-Text.

Aktualisieren Sie die Modellstatuszeile so, dass sie das ausgewählte `model` verwendet, nicht
`Model`. Behalten Sie den Ereignishandler, die begrenzte Abschlusswartezeit und die
`await using`-Deklarationen bei.

Führen Sie den fertigen Podcast-Agenten aus demselben Ordner aus:

```powershell
dotnet run
```
