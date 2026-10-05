# Die GitHub Podcast-Live-Demo: Node.js

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Computer noch nicht authentifiziert ist.
2. Installieren Sie vor der zeitlich begrenzten Sitzung die Abhängigkeiten im enthaltenen Starterprojekt:

```powershell
cd start-intro/nodejs
npm ci
```

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Öffnen Sie `src\index.ts`. Die Datei enthält Platzhalter für `client`, die Authentifizierung, `session` und den ersten Prompt.

### 1. Den Client starten

Ersetzen Sie `let client: CopilotClient;` durch:

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

Der `try`-Block bleibt geöffnet, bis Schritt 4 seinen `finally`-Block hinzufügt. Schließen Sie alle
vier Änderungen ab, bevor Sie den Code ausführen.

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `const isAuthenticated = false;` und den folgenden `if`-Block durch:

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Eine Streaming-Sitzung erstellen

Ersetzen Sie `let session: CopilotSession;` durch:

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

Fügen Sie `approveAll` oben in der Datei zum SDK-Import hinzu:

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt, Streaming aktiviert, und der Ereignishandler unten gibt bereits jedes Textfragment aus, sobald es ankommt.“

Der `try`-Block der Sitzung bleibt ebenfalls bis Schritt 4 geöffnet. Lassen Sie den vorhandenen
Streaming-Handler unverändert.

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Geben Sie unter `// Step 5: Send the first message.` Folgendes ein:

```typescript
await session.sendAndWait({
    prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Node.js app do.",
}, 60_000);
console.log();
} finally {
  await session.disconnect();
}
} finally {
  await client.stop();
}
```

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, auf Ereignisse lauschen und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Führen Sie diesen Hello World-Checkpoint jetzt aus dem Ordner `nodejs` aus:

```powershell
npm start
```

Erwartete Ausgabe: eine gestreamte Antwort in einem Satz, gefolgt davon, dass `sendAndWait` den Turn
abschließt. Der Aufruf gibt Sitzungsfehler weiter und begrenzt die Wartezeit auf 60 Sekunden. Die
beiden `finally`-Blöcke schließen Sitzung und Client.

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Verwenden Sie nach Hello World die vorab geschriebenen Hilfsdateien in `src`, um dieselbe Sitzung in einen auf Fakten gestützten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Fügen Sie Importe hinzu:

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

Entfernen Sie `approveAll` aus dem SDK-Import, da `permissionPrompt` es unten ersetzt:

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

Fügen Sie im `try`-Block des Clients nach der Authentifizierung und vor der Sitzungserstellung Folgendes hinzu:

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Ersetzen Sie die Sitzungskonfiguration durch:

```typescript
const session = await client.createSession({
  model: selectedModel,
  streaming: true,
  tools: [episodeTool, latestEpisodesTool],
  availableTools: ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
  onPermissionRequest: permissionPrompt,
  systemMessage: {
    mode: "replace",
    content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
  },
});
```

Behalten Sie den `try`-Block der Sitzung nach dieser Konfiguration bei.

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng begrenzte, typisierte Fähigkeiten, nehme sie nach Namen in die Zulassungsliste auf und tausche den Alles-genehmigen-Handler von Hello World gegen einen aus, der mich auffordert, damit ich der Genehmigungspunkt bleibe, bevor ein Tool ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet replace, nicht append. Meine Anwendung liefert die vollständige Agentenidentität und die Fundierungsregel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Ersetzen Sie im vorhandenen `sendAndWait`-Aufruf nur den Prompt durch:

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Führen Sie den fertigen Podcast-Agenten jetzt aus dem Ordner `nodejs` aus:

```powershell
npm start
```

Erwartete Meilensteine: Modellauswahl, Auswahl aus zehn Episoden, `[Tool call started]`, Genehmigungs-Prompt, `[Tool call complete]`, danach gestreamter Launch-Text.

Aktualisieren Sie die Modellstatuszeile, sodass sie `selectedModel` verwendet. Behalten Sie den
Ereignishandler, das Timeout von 60 Sekunden und beide `finally`-Blöcke bei.
