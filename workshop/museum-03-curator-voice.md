# Step 3: Give the curator a voice

> **Time:** 10 minutes

## What you'll build

The same prompt, the same streaming call — but the answer now sounds like a museum instead of a
chatbot. You give the session one
[system message](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)
and switch it into replace mode.

This is the first piece of **application-owned policy**. The prompt is task data that changes every
run. The system message is a durable statement of who this agent is, what it may talk about, and
what shape its output takes.

## Replace mode, and what a system message can and cannot do

Most SDK sessions start with a general-purpose coding assistant persona. `replace` mode discards it
and installs yours, so the curator is not a coding assistant wearing a museum hat. Use `append`
when you want to extend the default persona; use `replace` when the default persona is wrong for
the job. For a museum curator it is wrong.

There is a third mode. `customize` overrides individual sections of the SDK-managed prompt — tone,
guidelines, code change rules, and others — while preserving the rest, so you can change specific
parts without restating the whole thing. Reach for it when the default prompt is mostly right and
only a few sections are not. In the default `append` mode the SDK auto-injects environment context,
tool instructions, and security guardrails, and the CLI persona stays; `replace` hands you full
control and gives those sections up, which is why the message you are about to use states its
own scope and limits explicitly.

A system message is **guidance, not enforcement**. It shapes tone, scope, and structure, and it
strongly discourages the model from wandering. It cannot stop a tool call, cap a runtime, or prove
a claim is true. Those need the allowlist, a timeout, and validation — Steps 4 and 5.

## What the curator system message says

The runtime sends the system message ahead of every prompt in the session. A prompt is one request;
the system message is the standing instruction every request is answered under. This is the one the
curator runs under from this step on:

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.
Use only facts supplied by this application. Call the approved fact tool the
application provides and treat what it returns as the complete source of truth
for the current exhibit. Do not add facts from memory or outside knowledge.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

Each paragraph does one job:

- **Role.** The first line makes the model a curator. In replace mode it is the only persona left.
- **Voice and sources.** The second paragraph sets the audience and tone, then limits the curator
  to facts this application supplies through a tool. That tool does not exist yet — you register it
  in Step 4. Until then the curator is told to use a source it cannot reach, which is exactly the
  gap Step 4 closes.
- **Scope.** The third paragraph rules out software topics and talk about its own instructions, and
  tells the curator not to claim access it does not have.
- **Output.** The last paragraph makes the curator follow whatever structure a prompt asks for and
  return nothing around it.

## Give the session the curator system message

The message is long, and it is text the application owns rather than code you need to type, so it
ships in a pre-built helper file with the other system messages. Your work in this step is the
configuration: one setting that installs the message in replace mode.

:::language dotnet
Open `Program.cs`. One region changes in this step.

The message above is already written for you as `CuratorSystemMessages.Curator` in
`Helpers/CuratorSystemMessages.cs`.

**REPLACE** region `generate` in `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true,
        SystemMessage = new SystemMessageConfig
        {
            Mode = SystemMessageMode.Replace,
            Content = CuratorSystemMessages.Curator
        }
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

One change in `generate`: the session config gains a `SystemMessage` in replace mode, with the
pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `Helpers/CuratorSystemMessages.cs` holds every system message this application
uses, so the long text stays out of `Program.cs`. `Curator` is the one you just passed to the
session. `CuratorWithResearch` and `Research` are there for Step 6. The streaming call and its
120-second default both come from `Helpers/CuratorStreamer.cs`, where `GenerationTimeout` and
`ResearchTimeout` are declared.
:::

:::language nodejs
Open `src/index.ts`. Two regions change in this step.

The message above is already written for you as `curatorSystemMessage` in
`src/system-messages.ts`.

**REPLACE** region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

One new line: the import from `./system-messages.js`.

**REPLACE** region `generate` in `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
      systemMessage: { mode: "replace", content: curatorSystemMessage },
    });

    await streamExhibit(
      session,
      "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

One change in `generate`: the session config gains a `systemMessage` in replace mode, with the
pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `src/system-messages.ts` holds every system message this application uses, so the
long text stays out of `src/index.ts`. `curatorSystemMessage` is the one you just passed to the
session. `curatorWithResearchSystemMessage` and `researchSystemMessage` are there for Step 6.
`streamExhibit` and its 120-second default, `generationTimeoutMs`, are both declared in
`src/curator.ts`, alongside the 90-second `researchTimeoutMs` that Step 6 uses.
:::

:::language python
Open `main.py`. Two regions change in this step.

The message above is already written for you as `CURATOR_SYSTEM_MESSAGE` in `system_messages.py`.

**REPLACE** region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

One new line: the import from `system_messages`.

**REPLACE** region `generate` in `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
                system_message={"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
            ) as session:
                await stream_exhibit(
                    session,
                    "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

One change in `generate`: the session config gains a `system_message` in replace mode, with the
pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `system_messages.py` holds every system message this application uses, so the
long text stays out of `main.py`. `CURATOR_SYSTEM_MESSAGE` is the one you just passed to the
session. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` and `RESEARCH_SYSTEM_MESSAGE` are there for Step 6.
`stream_exhibit` and its 120-second default, `GENERATION_TIMEOUT_SECONDS`, are both declared in
`curator.py`, alongside the 90-second `RESEARCH_TIMEOUT_SECONDS` that Step 6 uses.
:::

:::language go
Open `main.go`. One region changes in this step.

The message above is already written for you as `CuratorSystemMessage` in `system_messages.go`,
which is in the same `main` package.

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
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
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

One change in `generate`: the session config gains a `SystemMessage` in replace mode, with the
pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `system_messages.go` holds every system message this application uses, so the
long text stays out of `main.go`. `CuratorSystemMessage` is the one you just passed to the session.
`CuratorWithResearchSystemMessage` and `ResearchSystemMessage` are there for Step 6.
`GenerationTimeout` is the 120-second constant declared beside `StreamExhibit` in `curator.go`,
alongside the 90-second `ResearchTimeout` that Step 6 uses.
:::

:::language rust
Open `src/main.rs`. Two regions change in this step.

The message above is already written for you as `CURATOR_SYSTEM_MESSAGE` in
`src/system_messages.rs`, which the `museum_exhibit_studio` crate re-exports.

**REPLACE** region `imports` in `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

**REPLACE** region `generate` in `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
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

Two new names in `imports`: `SystemMessageConfig` from the SDK and `CURATOR_SYSTEM_MESSAGE` from
the crate. One change in `generate`: the session config gains a `system_message` in replace mode,
with the pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `src/system_messages.rs` holds every system message this application uses, so the
long text stays out of `src/main.rs`. `CURATOR_SYSTEM_MESSAGE` is the one you just passed to the
session. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` and `RESEARCH_SYSTEM_MESSAGE` are there for Step 6.
`GENERATION_TIMEOUT` is the 120-second constant declared beside `stream_exhibit`
in `src/lib.rs`, alongside the 90-second `RESEARCH_TIMEOUT` that Step 6 uses.
:::

:::language java
Open `src/main/java/workshop/MuseumExhibitStudio.java`. Two regions change in this step.

The message above is already written for you as `CuratorSystemMessages.CURATOR` in `CuratorSystemMessages.java`, beside your file.

**REPLACE** region `imports` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

**REPLACE** region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)
                        .setSystemMessage(new SystemMessageConfig()
                                .setMode(SystemMessageMode.REPLACE)
                                .setContent(CuratorSystemMessages.CURATOR))).get();

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

Two new imports: `SystemMessageMode` and `SystemMessageConfig`. One change in `generate`: the session config gains a system message in `replace` mode, with the pre-built message as its content. Everything else in the region is what Step 2 left there.

**Look inside:** `CuratorSystemMessages.java` holds every system message this application uses, so the long text stays out of your entrypoint. `CURATOR` is the one you just passed to the session. `CURATOR_WITH_RESEARCH` and `RESEARCH` are there for Step 6. The two-argument `CuratorStreamer.streamExhibit` you are calling applies `GENERATION_TIMEOUT`, the 120-second constant declared in `CuratorStreamer.java` alongside the 90-second `RESEARCH_TIMEOUT` that Step 6 uses.
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

The tone changes visibly. Compare a Step 2 answer with a Step 3 answer:

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath.
```

The preface disappears, the register lifts, and the answer stops offering to help further.

## Change the prompt

Now test the scope paragraph with a question the default coding assistant would happily answer.
In your `generate` region, change the prompt text to:

```text
Tell me about how git worktrees work.
```

Run it again. Your exact wording will vary, but the curator declines and steers back to exhibit
work instead of explaining git. The system message told it not to discuss software engineering,
coding, terminals, or repositories, and in replace mode there is no coding persona left to answer.

Nothing in the runtime enforced that refusal. The model followed guidance, and guidance shapes
behavior without authorizing or forbidding anything. Keep that distinction in mind for Step 4, then
set the prompt back to the Apollo 11 text.

## Check your understanding

- Why `replace` rather than `append` for this agent?
- Name one thing the system message reliably improves and one thing it cannot guarantee.
- The system message says "use only facts supplied by this application", but the application has
  not supplied any facts yet and there is no tool to fetch them. Where is the model getting Apollo
  11 details right now, and why is that a problem for a museum?

## Learn more

- [SDK and CLI compatibility](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  confirms that `systemMessage` supports both append and replace, and what else each SDK exposes.
- [Custom agents](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md):
  giving a named agent its own system prompt and its own scoped tools.
- [Custom skills](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  packaging durable instructions as reusable modules instead of one long message.

Continue to [Ground it in approved facts](museum-04-approved-facts.md).
