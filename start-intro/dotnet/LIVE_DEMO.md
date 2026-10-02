# The GitHub Podcast Live Demo

## Before The Session

1. Run `copilot auth login` if this machine is not already authenticated.
2. Work in the included starter and restore dependencies before the timed session:

```powershell
cd start-intro/dotnet
dotnet restore
```

## Demo Pitch

Say: "We are building a Podcast Agent for The GitHub Podcast. It will let us choose a real episode, retrieve verified metadata from the official RSS feed, and turn those facts into sponsor-safe social copy."

Say: "We will begin with the smallest possible Copilot SDK conversation, then give it a purpose, an identity, and application-owned tools."

## Act One: Hello World

Start with `Program.cs`. It deliberately has named placeholders for `client`, `isAuthenticated`, and `session`. Leave the streaming event handler and completion wait in place.

### 1. Start The Client

Replace `CopilotClient client;` with:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

Say: "The client is my connection to the Copilot runtime. I start it explicitly, so the application owns its lifecycle."

### 2. Check Authentication

Replace `var isAuthenticated = false;` with:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

Say: "Before creating a session, I can ask the runtime whether this machine is signed in."

### 3. Create The Session

Add `using GitHub.Copilot.Rpc;` at the top. Replace
`CopilotSession session = null!;` with:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

Say: "The session is the conversation. I chose the model, enabled streaming, and the event handler below already prints each text fragment as it arrives."

Say: "The handler answers permission requests. The empty tool allowlist removes tool capabilities for this exercise; approve-all alone is not a safety boundary."

### 4. Send Hello World

Under `// Step 5: Send the first message.`, type:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

Replace the final `await complete.Task;` with:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

The existing event handler is already supplied; it is not a fifth editing
exercise. It prints deltas, surfaces session errors, and finishes on idle.
`await using` closes the client and session after the run.

Say: "That is the basic shape: start a client, create a session, listen for events, and send a message. Once this loop works, we can evolve it into our Podcast Agent."

Expected output: a streamed one-sentence answer, followed by the existing `SessionIdleEvent` completing the program.

Run this Hello World checkpoint from `start-intro/dotnet`:

```powershell
dotnet run
```

## Act Two: Turn It Into A Podcast Agent

After Hello World, add the prewritten helpers in `Helpers` and `Tools` to turn the same session into a grounded podcast workflow.

Say: "The conversation works. Now we will turn it into our Podcast Agent: a focused assistant that can research a selected GitHub Podcast episode and prepare launch copy without inventing facts."

### 1. Let The Presenter Choose

Add usings for the prewritten helpers:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

After authentication, before the completion signal and session, add a picker
and select one of the ten newest episodes:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

Say: "This keeps the demo live. I can choose a model in the room, then choose from the real ten newest GitHub Podcast episodes. That selection becomes the Podcast Agent's assignment."

### 2. Give The Session Capabilities

Create the application-owned tools:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Replace the hello-world `SessionConfig` fields with these, keeping
`await using var session = await client.CreateSessionAsync(...)`:

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

Say: "The model does not get arbitrary access to my application. I grant two narrow, typed capabilities, allowlist them by name, and swap Hello World's approve-all handler for one that prompts me, so I remain the approval point before a tool executes."

Say: "These tools are what make this an agent rather than a generic chatbot: it can take action against a trusted data source that my application controls."

Say: "The system message uses Replace, not Append. My application supplies the complete agent identity and grounding rule for this session instead of inheriting the default prompt."

### 3. Replace The Prompt

Replace Hello World with the selected, grounded episode request:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

Say: "The agent decides to call the episode tool, I approve the read-only lookup, and its response is grounded in the official feed rather than invented details."

Expected milestones: model selection, ten-episode selection, `[Tool call started]`, approval prompt, `[Tool call complete]`, then streamed launch copy.

Update the model-status line to use the selected `model`, not `Model`.
Keep the event handler, bounded completion wait, and `await using` declarations.

Run the completed Podcast Agent from the same folder:

```powershell
dotnet run
```
