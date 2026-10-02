# The GitHub Podcast Live Demo: Java

## Before The Session

1. Run `copilot auth login` if this machine is not already authenticated.
2. Compile dependencies in the included starter before the timed session:

```powershell
cd start-intro/java
mvn compile
```

## Demo Pitch

Say: "We are building a Podcast Agent for The GitHub Podcast. It will let us choose a real episode, retrieve verified metadata from the official RSS feed, and turn those facts into sponsor-safe social copy."

Say: "We will begin with the smallest possible Copilot SDK conversation, then give it a purpose, an identity, and application-owned tools."

## Act One: Hello World

Start with `src\main\java\demo\CopilotSdkLiveDemo.java`. It deliberately has named placeholders for `client`, `isAuthenticated`, and `session`.

### 1. Start The Client

Replace `CopilotClient client;` with:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

This resource block stays open until step 4 adds its closing brace.
Complete all four edits before running.

Say: "The client is my connection to the Copilot runtime. I start it explicitly, so the application owns its lifecycle."

### 2. Check Authentication

Replace `boolean isAuthenticated = false;` with:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

Say: "Before creating a session, I can ask the runtime whether this machine is signed in."

### 3. Create The Session

Replace the session placeholder with:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

Add these imports:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

Replace the comments under `// Step 4: Stream events from the assistant.` with:

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

This supplies the streaming handler where the starter marked it. The session
resource block also stays open until step 4.

Say: "The session is the conversation. I chose the model and enabled streaming."

Say: "The handler answers permission requests. The empty tool allowlist removes tool capabilities for this exercise; approve-all alone is not a safety boundary."

### 4. Send Hello World

Under `// Step 5: Send the first message.`, remove the placeholder `var config`
and its `if (session != null)` guard. Replace them with:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

The two closing braces finish the session and client resource blocks from
steps 3 and 1. Keep the existing method and class closing braces.

Say: "That is the basic shape: start a client, create a session, listen for events, and send a message. Once this loop works, we can evolve it into our Podcast Agent."

Run this Hello World checkpoint now from the `java` folder:

```powershell
mvn compile exec:java
```

Expected output: a streamed one-sentence answer. `sendAndWait` waits for
completion and propagates errors; the resource blocks close both SDK resources.

## Act Two: Turn It Into A Podcast Agent

After Hello World, use the prewritten helper classes to turn the same session into a grounded podcast workflow.

Say: "The conversation works. Now we will turn it into our Podcast Agent: a focused assistant that can research a selected GitHub Podcast episode and prepare launch copy without inventing facts."

### 1. Let The Presenter Choose

Add imports for `com.github.copilot.rpc.SystemMessageConfig` and
`com.github.copilot.SystemMessageMode`. Keep `java.util.List` from Act One.
The `PermissionHandler` import is no longer used once `PermissionPrompt` replaces it below.

Inside the client resource block, after authentication and before `var config`:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

Say: "This keeps the demo live. I can choose a model in the room, then choose from the real ten newest GitHub Podcast episodes. That selection becomes the Podcast Agent's assignment."

### 2. Give The Session Capabilities

Create the tools:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

Replace `var config` and its builder chain, keeping the existing
`try (var session = client.createSession(config).get())` block:

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

Say: "The model does not get arbitrary access to my application. I grant two narrow, typed capabilities, allowlist them by name, and swap Hello World's approve-all handler for `PermissionPrompt`, which denies anything that is not one of these tools and asks me on stdin before one runs."

Say: "These tools are what make this an agent rather than a generic chatbot: it can take action against a trusted data source that my application controls."

Say: "The system message uses REPLACE, not APPEND. My application supplies the complete agent identity and grounding rule for this session instead of inheriting the default prompt."

### 3. Replace The Prompt

Replace only the argument of `.setPrompt(...)` in the existing bounded send:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

Update the model-status line to print `selectedModel`. Keep the subscriptions,
60-second wait, and both resource blocks unchanged.

Say: "The agent decides to call the episode tool, I approve the read-only lookup, and its response is grounded in the official feed rather than invented details."

Run the completed Podcast Agent now from the `java` folder:

```powershell
mvn compile exec:java
```

Expected milestones: model selection, ten-episode selection, tool execution, approval prompt, then grounded launch copy.
