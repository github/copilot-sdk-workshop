# Step 2: Stream the curator

> **Time:** 10 minutes

## What you'll build

The same prompt, but the answer appears word by word instead of arriving after a silent pause.

You will not write an event loop. The starter already ships a streaming printer in the pre-built
curator helpers: it subscribes to
[session events](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md),
writes each delta to standard output, reports tool activity, fails on session errors, enforces a
timeout, unsubscribes on every path, and returns the full text it accumulated. Your job is to turn
streaming on and call it.

## Why streaming matters for a curator

Exhibit copy is prose a human has to read and judge. Watching it arrive tells you immediately
whether the tone is right, whether the model is padding, and whether it is drifting off the subject
— long before the run finishes. Streaming also gives you a place to notice tool calls, which
matters from Step 4 onward, when the curator has to call the application's fact tool before it can
write anything.

The helper returns the whole response as a string, so from here on you always have the finished
text to inspect after the stream ends.

## Swap the blocking call for the streamer

:::language dotnet
Open `Program.cs`. One region changes in this step.

**REPLACE** region `generate` in `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Two changes: `Streaming = true` on the session config, and `CuratorStreamer.StreamExhibitAsync`
in place of `SendAndWaitAsync` and the lines that printed its response. The Step 1 permission
handler stays exactly where it was. The helper lives in `Helpers/CuratorStreamer.cs` and you never
edit it.

**Look inside:** open `Helpers/CuratorStreamer.cs` and read `StreamExhibitAsync` once. It is the
SDK event loop, and this is the clearest place in the workshop to see how streaming actually works.
It subscribes with `session.On<SessionEvent>`, appends and writes each `AssistantMessageDeltaEvent`
chunk the moment it arrives, prints a `[tool:start]` line for every `ToolExecutionStartEvent` and a
`[tool:done]` line for every `ToolExecutionCompleteEvent`, completes on `SessionIdleEvent`, and
faults on `SessionErrorEvent`. A `Task.Delay` race turns the timeout into a `TimeoutException`, and
the subscription is disposed on every path.
:::

:::language nodejs
Open `src/index.ts`. Two regions change in this step.

**REPLACE** region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

**REPLACE** region `generate` in `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
    });

    await streamExhibit(
      session,
      "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Two changes in `generate`: `streaming: true` on the session config, and `streamExhibit` in place of
`sendAndWait` and the line that printed its response. The Step 1 permission handler stays exactly
where it was. The helper lives in `src/curator.ts` and you never edit it.

**Look inside:** open `src/curator.ts` and read `streamExhibit` once. It is the SDK event loop, and
this is the clearest place in the workshop to see how streaming actually works. It subscribes with
`session.on`, writes each `assistant.message_delta` chunk to standard output the moment it arrives,
prints a `[tool:start]` line for every `tool.execution_start` event and a `[tool:done]` line for
every `tool.execution_complete` event, resolves its promise on `session.idle`, and rejects on
`session.error`. A `setTimeout` rejects if neither ever arrives, and `finish` unsubscribes on every
path.
:::

:::language python
Open `main.py`. Two regions change in this step.

**REPLACE** region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

**REPLACE** region `generate` in `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
            ) as session:
                await stream_exhibit(
                    session,
                    "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

The whole event listener from Step 1 collapses into one call. `stream_exhibit` lives in
`curator.py`, already does the matching on `AssistantMessageDeltaData`, `SessionErrorData`, and
`SessionIdleData`, and you never edit it.

**Look inside:** open `curator.py` and read `stream_exhibit` once. It is the SDK event loop, and
this is the clearest place in the workshop to see how streaming actually works. It subscribes with
`session.on`, prints each `AssistantMessageDeltaData` chunk the moment it arrives, prints a
`[tool:start]` line for every `ToolExecutionStartData` and a `[tool:done]` line for every
`ToolExecutionCompleteData`, sets its `done` event on `SessionIdleData`, and re-raises
`SessionErrorData` as a `RuntimeError`. `asyncio.wait_for` applies the timeout, and a `finally`
block unsubscribes on every path.
:::

:::language go
Open `main.go`. One region changes in this step.

**REPLACE** region `generate` in `main.go`:

```go
	ctx := context.Background()
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Streaming:           copilot.Bool(true),
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write two sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Two changes: `Streaming: copilot.Bool(true)` on the session config, and `StreamExhibit` in place
of `SendAndWait` and the lines that printed its response. The Step 1 permission handler stays
exactly where it was. The helper lives in `curator.go` and you never edit it.

**Look inside:** open `curator.go` and read `StreamExhibit` once. It is the SDK event loop, and
this is the clearest place in the workshop to see how streaming actually works. It subscribes with
`session.On`, prints each `AssistantMessageDeltaData` chunk the moment it arrives, prints a
`[tool:start]` line for every `ToolExecutionStartData` and a `[tool:done]` line for every
`ToolExecutionCompleteData`, and records any `SessionErrorData` to return as an error. It then
waits on `session.SendAndWait` inside a `context.WithTimeout` built from the timeout you pass, and
a deferred `unsubscribe` runs on every path.
:::

:::language rust
Open `src/main.rs`. Two regions change in this step.

**REPLACE** region `imports` in `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

**REPLACE** region `generate` in `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Two changes in `generate`: `config.streaming = Some(true)`, and `stream_exhibit` in place of
`send_and_wait` and the lines that printed its response. The Step 1 permission handler stays
exactly where it was. Both `stream_exhibit` and `GENERATION_TIMEOUT` come from the
`museum_exhibit_studio` crate in `src/lib.rs`, and you never edit it.

**Look inside:** open `src/lib.rs` and read `stream_exhibit` once. It is the SDK event loop, and
this is the clearest place in the workshop to see how streaming actually works. It subscribes with
`session.subscribe`, prints and flushes each `assistant.message_delta` chunk the moment it arrives,
prints a `[tool:start]` line for every `tool.execution_start` event and a `[tool:done]` line for
every `tool.execution_complete` event, finishes on `session.idle`, and returns an error on
`session.error`. It polls the send future, the event stream, and a deadline together, so the
timeout you pass holds even if no event ever arrives.
:::

:::language java
Open `src/main/java/workshop/MuseumExhibitStudio.java`. One region changes in this step.

**REPLACE** region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)).get();

                CuratorStreamer.streamExhibit(session,
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Two changes: `setStreaming(true)` on the session config, and `CuratorStreamer.streamExhibit` in place of `sendAndWait` and the lines that printed its response. The Step 1 permission handler stays exactly where it was. The helper lives in `CuratorStreamer.java` beside your file, and you never edit it.

**Look inside:** open `CuratorStreamer.java` and read `streamExhibit` once. It is the SDK event loop, and this is the clearest place in the workshop to see how streaming actually works. It registers one listener per event type: `AssistantMessageDeltaEvent` prints and accumulates each chunk as it arrives, `ToolExecutionStartEvent` and `ToolExecutionCompleteEvent` print the `[tool:start]` and `[tool:done]` lines, `SessionIdleEvent` ends the line, and `SessionErrorEvent` is captured and rethrown. The timeout you pass goes to `session.sendAndWait` in milliseconds, and every subscription is closed in a `finally` block.
:::

## Run it

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start
```
:::
:::language python
```bash
.venv/bin/python main.py
```
:::
:::language go
```bash
go run .
```
:::
:::language rust
```bash
cargo run
```
:::
:::language java
```bash
./mvnw compile exec:java
```
:::

The same kind of answer appears, but this time you watch it being written:

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

The text grows in place instead of appearing all at once, and the program exits shortly after the
last word. If you see nothing until the very end, the session is not streaming — check that you set
the streaming flag on the session config.

## Check your understanding

- Streaming is switched on in two places conceptually: the session config and the code that reads
  events. Which one did you write, and which one did the helper already own?
- The helper returns the full response text even though it also printed it. Why will that return
  value matter in Step 5?
- If the model never becomes idle, what stops your program from waiting forever?

## Learn more

- [Steering and queueing](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  sending another message while a turn is still streaming, instead of waiting for it to finish.
- [Usage and billing metrics](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  reading token counts and cost from the same events the printer is already subscribed to.
- [Context clearing](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  replacing a conversation inside a session that you want to keep using.

Continue to [Give the curator a voice](museum-03-curator-voice.md).
