# Live-Demo zu The GitHub Podcast: Go

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Rechner noch nicht authentifiziert ist.
2. Laden Sie Abhängigkeiten im enthaltenen Starterprojekt vor der zeitlich begrenzten Sitzung herunter:

```powershell
cd start-intro/go
go mod download
go mod verify
```

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Beginnen Sie mit `main.go`. Die Datei hat absichtlich benannte Platzhalter für `client`, `isAuthenticated` und `session`. Lassen Sie den Ereignishandler unverändert.

### 1. Client starten

Ersetzen Sie `var client *copilot.Client` und das folgende `_ = client` durch:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `isAuthenticated := false` durch:

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Sitzung erstellen

Ersetzen Sie den Sitzungsplatzhalter durch:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               preferredModel,
	Streaming:           copilot.Bool(true),
	AvailableTools:      []string{},
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt, Streaming aktiviert, und der Ereignishandler unten gibt jedes Textfragment aus, sobald es ankommt.“

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Fügen Sie `"time"` zu den Imports hinzu. Ersetzen Sie unter `// Step 5: Send the first message.`
`_ = context.Background()` durch:

```go
ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
defer cancel()
if _, err := session.SendAndWait(ctx, copilot.MessageOptions{
	Prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Go app do.",
}); err != nil {
	panic(err)
}
fmt.Println()
```

Behalten Sie das vorhandene Ereignisabonnement bei. Rufen Sie nicht zusätzlich `streamResponse` auf;
diese Hilfsfunktion fügt ein zweites Abonnement hinzu und würde jedes Textfragment zweimal ausgeben.

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, auf Ereignisse lauschen und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Führen Sie diesen Hello World-Checkpoint jetzt aus dem Ordner `go` aus:

```powershell
go run .
```

Erwartete Ausgabe: eine gestreamte Antwort in einem Satz, gefolgt von `SendAndWait`, das den Turn abschließt.

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Verwenden Sie nach Hello World die vorab geschriebenen Hilfsfunktionen in `helpers.go` und `permission_prompt.go`, um dieselbe Sitzung in einen fundierten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Nach der Authentifizierung und vor dem Erstellen der Sitzung:

```go
selectedModel, err := selectModel(context.Background(), client, preferredModel)
if err != nil {
	panic(err)
}
latestEpisodes, err := getLatestEpisodes()
if err != nil {
	panic(err)
}
selectedEpisode, err := pickEpisode(latestEpisodes)
if err != nil {
	panic(err)
}
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Erstellen Sie die Tools:

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

Erstellen Sie die Sitzung:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{episodeTool, latestEpisodesTool},
	AvailableTools:      []string{"get_github_podcast_episode", "get_latest_github_podcast_episodes"},
	OnPermissionRequest: permissionPrompt,
	SystemMessage: &copilot.SystemMessageConfig{
		Mode:    "replace",
		Content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng begrenzte, typisierte Fähigkeiten, nehme sie nach Namen in die Zulassungsliste auf und tausche den Alles-genehmigen-Handler von Hello World gegen `permissionPrompt` in `permission_prompt.go` aus; dieser lehnt alles ab, was nicht eines dieser Tools ist, und fragt mich über stdin, bevor eines ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet replace, nicht append. Meine Anwendung liefert die vollständige Agentenidentität und die Fundierungsregel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Erstellen Sie den Prompt unmittelbar vor dem vorhandenen begrenzten Send-Aufruf:

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

Ändern Sie das Feld `MessageOptions` in `Prompt: prompt`. Aktualisieren Sie die Modellstatuszeile
so, dass `selectedModel` ausgegeben wird. Behalten Sie das vorhandene Abonnement, den begrenzten
Kontext, die Fehlerprüfung und die verzögerte Bereinigung bei; fügen Sie kein zweites Abonnement
hinzu.

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Führen Sie den fertigen Podcast-Agenten jetzt aus dem Ordner `go` aus:

```powershell
go run .
```

Erwartete Meilensteine: Modellauswahl, Auswahl aus zehn Episoden, `[Tool call started]`, Genehmigungs-Prompt, `[Tool call complete]`, danach gestreamter Launch-Text.
