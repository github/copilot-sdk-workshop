# Step 1: SDK basics

> **Time:** 5 minutes

## The SDK in one sentence

The GitHub Copilot SDK lets your application start a Copilot conversation, stream
its responses, and expose specific application functions as tools.

The SDK is not a model you host yourself. Your application connects to the
**Copilot runtime**, which coordinates model requests and tool calls.

| Term | What it does in this workshop |
| --- | --- |
| Client | Starts and connects to the runtime; checks authentication. |
| Session | Holds one conversation, its configuration, messages, and tool results. |
| Prompt | Assigns a task for this turn, such as writing one sentence. |
| Event | Reports a text fragment, tool activity, error, or completed turn. |
| Tool | A named application function the model can request, such as an RSS lookup. |

The basic loop is:

```text
Your app -> client -> session -> prompt
                              <- response events
Your app <- permission request <- tool request
Your app -> tool result        -> next model response
```

One client can serve multiple sessions. For this introduction, create one client
and one session per program run, then close both. You do not need a web server,
an agent framework, or a database.

## Open the application

Open **`LIVE_DEMO.md`** alongside the entrypoint below. Its **Act One** is the
hands-on sequence for this workshop:

1. Start the client.
2. Check authentication.
3. Create the session.
4. Send hello world.

The starter's `Step 4` comment marks event handling, which is supplied or shown
in the guide; sending is marked `Step 5` in the code. These are locations in the
scaffold, not additional exercises beyond the guide's four edits.

:::language dotnet
In your `start-intro/dotnet` folder, open `Program.cs`.
Find the client, authentication, and session placeholders. The event handler
already prints streamed text and tracks turn completion.
:::
:::language nodejs
In your `start-intro/nodejs` folder, open `src/index.ts`.
Find the client, authentication, and session placeholders. The event handler
already shows which events the application can observe.
:::
:::language python
In your `start-intro/python` folder, open `main.py`.
Find the client, authentication, and session placeholders. The event handler
already prints streamed text and signals when the turn finishes.
:::
:::language go
In your `start-intro/go` folder, open `main.go`.
Find the client, authentication, and session placeholders. The event handler
already prints streamed text and tool activity.
:::
:::language java
In your `start-intro/java` folder, open
`src/main/java/demo/CopilotSdkLiveDemo.java`.
Find the client, authentication, and session placeholders. The next lesson
shows where to add the missing subscriptions while following the demo guide.
:::
:::language rust
In your `start-intro/rust` folder, open `src/main.rs`.
Find the client, authentication, and session placeholders. The next lesson
shows where to add the missing subscription while following the demo guide.
:::

## What you control

The **application** chooses the model, session identity, exposed tools, and
permission policy. The **model** proposes text and tool calls within that setup.
The permission handler answers whether a requested capability may run.

Streaming changes how you display a response, not its trustworthiness. A system
message guides behavior; it is not an access-control mechanism or a proof of
factual accuracy. A tool lets the application supply real source data, but you
still review the resulting text.

In the first run, the task is just a one-sentence hello world. In the second run,
the application grants two prebuilt, read-only RSS tools and asks you to approve
their use. We will not write a feed parser or configure MCP in this track.

## Check your understanding

Point to where the client will start and where the session will be created.
Explain the difference in one sentence: the client connects to the runtime;
the session is the conversation.

Continue to [Streaming hello world](intro-02-hello-world.md).

## Learn more

- [Copilot SDK overview and language APIs](https://github.com/github/copilot-sdk)
- [The runtime's agent loop](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
