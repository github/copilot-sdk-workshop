# Step 4: Ground it in approved facts

> **Time:** 15 minutes

## What you'll build

Until now the curator has been writing from model memory. That is unacceptable for a museum: an
exhibit label is an institutional claim, and "the model knew it" is not a source.

In this step the educator supplies the facts and the **application** hands them to the curator
through a tool it owns. You register the pre-built `approved_fact_lookup` tool, make it the one
tool the model may call, and write a prompt that orders the curator to call it before writing a
word. You also call the pre-built chooser that lets the educator pick one of three approved fact
sets or type their own, and put the session lifecycle in one small runner that later steps reuse.

## Why the facts belong behind a tool, not inside the prompt

You could paste the fact list into the prompt text. Many applications do. But then the facts are
just more words in a request the model is free to read loosely, and every run carries the whole
catalog whether the model needs it or not.

A [**local tool**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
is different. It runs inside your process, your code decides what it returns, and the transcript
records the moment the model asked for it. `approved_fact_lookup` is that tool. It takes no
arguments and returns the bounded approved fact list, so two runs on the same fact set ask the same
question and get the same answer — grounding stays deterministic.

The helpers already own the tool and the bounds. `boundFacts` trims every fact, drops blanks, and
rejects the batch when it is empty, longer than 20 facts, or contains a fact over 500 characters.
The tool factory applies those bounds to whatever it is given, so the model can never be handed an
unbounded list. Bounds are not politeness: an unbounded fact list is unpredictable cost, latency,
and attack surface.

`skip permission` is set on this tool because it only reads application-owned data that the
educator just approved on screen. The external Wikipedia process in Step 6 gets a permission
boundary instead.

This is the museum equivalent of `accessibility_rule_lookup` in the accessibility track: one
zero-argument, application-owned local tool that hands the model curated data it cannot otherwise
reach.

## Two lists, two different jobs

Registering a tool takes two settings, and confusing them is the most common mistake in this
workshop:

- **`tools`** carries the *implementation*. This is where the runtime learns that a function called
  `approved_fact_lookup` exists and how to execute it.
- **`availableTools`** is the *allowlist*. It names which tools the model is permitted to call in
  this session. A tool that is registered but not allowlisted cannot be called.

You need both. Naming only `approved_fact_lookup` also excludes every other tool: this session
offers no file reader, shell, or browser.

The prompt is the third piece, and it is the weakest one: it *asks* the model to call the tool. It
does not make the call happen, and it cannot stop a call. Keep the explicit "call
`approved_fact_lookup` first" instruction — at this stage you want the tool call to be reliable so
you can see it.

**Keep the run bounded:** pass the helper's existing **120-second generation timeout** explicitly
to the session runner. The runner returns the exhibit text for later validation, rejects blank
output, and cleans up the session and client even if the stream fails. These are application
controls, not instructions for the model.

## Register the tool and build the prompt

:::language dotnet
Open `Program.cs`. Five regions change in this step. The `imports` region already has everything
this step needs.

**INSERT** region `choose-facts` in `Program.cs`:

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

**REPLACE** region `generate` in `Program.cs`:

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration
builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `Program.cs`:

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

**INSERT** region `generation-config` in `Program.cs`:

```csharp
SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = CuratorStreamer.SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = CuratorSystemMessages.Curator
    }
};
```

**INSERT** region `session-runner` in `Program.cs`:

```csharp
static async Task<string> RunSessionAsync(SessionConfig config, string prompt, TimeSpan timeout)
{
    await using var client = new CopilotClient();
    try
    {
        await client.StartAsync();
        await using var session = await client.CreateSessionAsync(config);
        var content = await CuratorStreamer.StreamExhibitAsync(session, prompt, timeout);
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("The curator returned no exhibit content.");
        }

        return content;
    }
    finally
    {
        await client.StopAsync();
    }
}
```

`RunSessionAsync` uses `CuratorStreamer.GenerationTimeout` from `Helpers/CuratorStreamer.cs` and
disposes the session before stopping the client in `finally`. `BuildExhibitPrompt` takes no facts
at all now — it names the tool instead. `CreateApprovedFactLookup` calls `BoundFacts` internally,
so the bound holds no matter who builds the tool.

Three helper calls keep this step short. `CuratorTerminal.ChooseApprovedFacts` lists the three fact
sets, reads the choice, prints the facts, and returns the bounded list once the educator confirms
them or types their own. `CuratorPrompts.ExhibitStructure` is the fixed title, narrative, and
questions layout; it lives in `Helpers/CuratorPrompts.cs` because Step 5 checks that same layout.
`CuratorStreamer.SelectedModel` reads the optional `COPILOT_MODEL` environment variable.

**Look inside:** `Helpers/CuratorFacts.cs` holds the tool, and it is worth reading because it is
a real tool definition rather than plumbing. `CreateApprovedFactLookup` closes over the bounded
list the educator just approved and registers it through `CopilotTool.DefineTool` under the name
`approved_fact_lookup`. The handler takes no parameters, so the model cannot steer what comes back
— it asks, and it receives exactly that list. `SkipPermission = true` is set right there because
the data is application-owned. The three fact sets and the `MaximumFactCount` (20) and
`MaximumFactLength` (500) bounds enforced by `BoundFacts` are in the same file.
:::

:::language nodejs
Open `src/index.ts`. Six regions change in this step, starting with the imports the new helpers need.

**REPLACE** region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  chooseApprovedFacts,
  closeTerminal,
  createApprovedFactLookup,
  describeFailure,
  exhibitStructure,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

**INSERT** region `choose-facts` in `src/index.ts`:

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

**REPLACE** region `generate` in `src/index.ts`:

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration
builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `src/index.ts`:

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

**INSERT** region `generation-config` in `src/index.ts`:

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: selectedModel(),
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: curatorSystemMessage },
  };
}
```

**INSERT** region `session-runner` in `src/index.ts`:

```typescript
async function runSession(
  config: SessionConfig,
  prompt: string,
  timeout: number,
): Promise<string> {
  const client = new CopilotClient();
  try {
    await client.start();
    const session = await client.createSession(config);
    try {
      const content = await streamExhibit(session, prompt, timeout);
      if (!content.trim()) throw new Error("The curator returned no exhibit content.");
      return content;
    } finally {
      await session.disconnect();
    }
  } finally {
    await client.stop();
  }
}
```

`runSession` passes `generationTimeoutMs` from `src/curator.ts` to the streamer; its nested
`finally` blocks disconnect the session and stop the client. `buildExhibitPrompt` takes no facts at
all now — it names the tool instead. `createApprovedFactLookup` calls `boundFacts` internally, so
the bound holds no matter who builds the tool.

Three helper calls keep this step short. `chooseApprovedFacts` lists the three fact sets, reads the
choice, prints the facts, and returns the bounded list once the educator confirms them or types
their own. `exhibitStructure` is the fixed title, narrative, and questions layout; it lives in
`src/curator.ts` because Step 5 checks that same layout. `selectedModel` reads the optional
`COPILOT_MODEL` environment variable.

**Look inside:** `src/curator.ts` holds the tool, and it is worth reading because it is a real
`defineTool` definition rather than plumbing. `createApprovedFactLookup` closes over the bounded
list the educator just approved and defines `approved_fact_lookup` with
`parameters: { type: "object", properties: {}, additionalProperties: false }`, so the model cannot
steer what comes back — it asks, and it receives exactly that list. `skipPermission: true` is set
right there because the data is application-owned. The three fact sets and the `maximumFactCount`
(20) and `maximumFactLength` (500) bounds enforced by `boundFacts` are in the same file.
:::

:::language python
Open `main.py`. Six regions change in this step.

**REPLACE** region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys
from collections.abc import Iterable
from typing import Any

from copilot import CopilotClient, PermissionHandler

from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    EXHIBIT_STRUCTURE,
    GENERATION_TIMEOUT_SECONDS,
    choose_approved_facts,
    create_approved_fact_lookup,
    describe_failure,
    selected_model,
    stream_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

**INSERT** region `choose-facts` in `main.py`:

```python
        facts = choose_approved_facts()
```

**REPLACE** region `generate` in `main.py`:

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration
builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `main.py`:

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

**INSERT** region `generation-config` in `main.py`:

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    return {
        "client_name": "museum-exhibit-studio",
        "model": selected_model(),
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
    }
```

**INSERT** region `session-runner` in `main.py`:

```python
async def run_session(config: dict[str, Any], prompt: str, timeout: float) -> str:
    client = CopilotClient()
    try:
        await client.start()
        session = await client.create_session(**config)
        try:
            content = await stream_exhibit(session, prompt, timeout)
            if not content.strip():
                raise RuntimeError("The curator returned no exhibit content.")
            return content
        finally:
            await session.disconnect()
    finally:
        await client.stop()
```

`run_session` passes `GENERATION_TIMEOUT_SECONDS` from `curator.py` to the streamer; its `finally`
blocks disconnect the session and stop the client. `build_exhibit_prompt` takes no facts at all
now — it names the tool instead. `create_approved_fact_lookup` calls `bound_facts` internally, so
the bound holds no matter who builds the tool.

Three helper calls keep this step short. `choose_approved_facts` lists the three fact sets, reads
the choice, prints the facts, and returns the bounded list once the educator confirms them or types
their own. `EXHIBIT_STRUCTURE` is the fixed title, narrative, and questions layout; it lives in
`curator.py` because Step 5 checks that same layout. `selected_model` reads the optional
`COPILOT_MODEL` environment variable; this SDK accepts `model=None`, so the config can leave model
selection to the runtime.

**Look inside:** `curator.py` holds the tool, and it is worth reading because it is a real
`@define_tool` definition rather than plumbing. `create_approved_fact_lookup` closes over the
bounded list the educator just approved and decorates a nested `approved_fact_lookup()` that takes
no arguments, so the model cannot steer what comes back — it asks, and it receives exactly that
list. `skip_permission=True` is set right there because the data is application-owned. The three
fact sets and the `MAXIMUM_FACT_COUNT` (20) and `MAXIMUM_FACT_LENGTH` (500) bounds enforced by
`bound_facts` are in the same file.
:::

:::language go
Open `main.go`. Six regions change in this step.

**REPLACE** region `imports` in `main.go`:

```go
import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	copilot "github.com/github/copilot-sdk/go"
)

```

**INSERT** region `choose-facts` in `main.go`:

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

**REPLACE** region `generate` in `main.go`:

```go
	ctx := context.Background()
	workingDirectory, err := os.Getwd()
	if err != nil {
		return err
	}

	exhibitConfig, err := generationConfig(workingDirectory, facts)
	if err != nil {
		return err
	}

	fmt.Println()
	if _, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout); err != nil {
		return err
	}
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration
builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `main.go`:

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

**INSERT** region `generation-config` in `main.go`:

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               SelectedModel(),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

```

**INSERT** region `session-runner` in `main.go`:

```go
func runSession(
	ctx context.Context,
	config *copilot.SessionConfig,
	prompt string,
	timeout time.Duration,
) (string, error) {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return "", err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, config)
	if err != nil {
		return "", err
	}
	defer func() { _ = session.Disconnect() }()

	content, err := StreamExhibit(session, prompt, timeout)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(content) == "" {
		return "", errors.New("The curator returned no exhibit content.")
	}
	return content, nil
}

```

`runSession` passes `GenerationTimeout` from `curator.go` to the streamer and uses `defer` to
disconnect the session before stopping the client. `buildExhibitPrompt` takes no facts at all now —
it names the tool instead. `ApprovedFactLookup` calls `BoundFacts` internally, so the bound holds
no matter who builds the tool.

Three helper calls keep this step short. `ChooseApprovedFacts` in `curator.go` lists the three fact
sets, reads the choice, prints the facts, and returns the bounded list once the educator confirms
them or types their own. `ExhibitStructure` is the fixed title, narrative, and questions layout;
it lives in `curator.go` because Step 5 checks that same layout. `SelectedModel` reads the optional
`COPILOT_MODEL` environment variable.

**Look inside:** `curator.go` holds the tool, and it is worth reading because it is a real
`copilot.DefineTool` definition rather than plumbing. `ApprovedFactLookup` closes over the bounded
list the educator just approved and defines a handler whose argument type is `struct{}`, so the
model cannot steer what comes back — it asks, and it receives exactly that list.
`lookup.SkipPermission = true` is set right there because the data is application-owned. The three
fact sets and the `MaximumFactCount` (20) and `MaximumFactLength` (500) bounds enforced by
`BoundFacts` are in the same file.
:::

:::language rust
Open `src/main.rs`. Six regions change in this step.

**REPLACE** region `imports` in `src/main.rs`:

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, selected_model,
    stream_exhibit,
};
```

**INSERT** region `choose-facts` in `src/main.rs`:

```rust
    let facts = choose_approved_facts()?;
```

**REPLACE** region `generate` in `src/main.rs`:

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration
builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `src/main.rs`:

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"#
    )
}
```

**INSERT** region `generation-config` in `src/main.rs`:

```rust
fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, RuntimeError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    Ok(config)
}
```

**INSERT** region `session-runner` in `src/main.rs`:

```rust
async fn run_session(
    config: SessionConfig,
    prompt: String,
    timeout: Duration,
) -> Result<String, RuntimeError> {
    let client = Client::start(ClientOptions::default()).await?;
    let session_result = async {
        let session = client.create_session(config).await?;
        let stream_result = stream_exhibit(&session, prompt, timeout).await;
        let disconnect_result = session.disconnect().await;
        match (stream_result, disconnect_result) {
            (Ok(content), Ok(())) => Ok(content),
            (Err(error), _) => Err(error),
            (Ok(_), Err(error)) => Err(Box::new(error) as RuntimeError),
        }
    }
    .await;
    let stop_result = client.stop().await;
    let content = match (session_result, stop_result) {
        (Ok(content), Ok(())) => content,
        (Err(error), _) => return Err(error),
        (Ok(_), Err(error)) => return Err(Box::new(error) as RuntimeError),
    };
    if content.trim().is_empty() {
        return Err("The curator returned no exhibit content.".into());
    }
    Ok(content)
}
```

`run_session` passes `GENERATION_TIMEOUT` from `src/lib.rs` to the streamer and disconnects the
session and stops the client before propagating errors. `build_exhibit_prompt` takes no facts at all
now — it names the tool instead. `approved_fact_lookup` calls `bound_facts` internally, so the
bound holds no matter who builds the tool.

Three helper calls keep this step short. `choose_approved_facts` lists the three fact sets, reads
the choice, prints the facts, and returns the bounded list once the educator confirms them or types
their own. `EXHIBIT_STRUCTURE` is the fixed title, narrative, and questions layout; it lives in
`src/lib.rs` because Step 5 checks that same layout. `selected_model` reads the optional
`COPILOT_MODEL` environment variable.

**Look inside:** `src/lib.rs` holds all of this, and it is worth reading because it is a real tool
definition rather than plumbing. `approved_fact_lookup` closes over the bounded list the educator
just approved and builds a `Tool` whose parameter schema is
`{"type": "object", "properties": {}, "additionalProperties": false}`, so the model cannot steer
what comes back — it asks, and it receives exactly that list. `.with_skip_permission(true)` is set
right there because the data is application-owned. The three fact sets and the
`MAXIMUM_FACT_COUNT` (20) and `MAXIMUM_FACT_LENGTH` (500) bounds enforced by `bound_facts` are in
the same file.
:::

:::language java
Open `src/main/java/workshop/MuseumExhibitStudio.java`. Six regions change in this step.

**REPLACE** region `imports` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;

import java.time.Duration;
import java.util.List;
```

**INSERT** region `choose-facts` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

**REPLACE** region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

The inline client and session from Steps 1–3 leave `generate`. They move into the configuration builder and the session runner below, so later steps can reuse them.

**INSERT** region `exhibit-prompt` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

**INSERT** region `generation-config` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    private static SessionConfig generationConfig(Iterable<String> approvedFacts) {
        SessionConfig config = new SessionConfig()
                .setClientName("museum-exhibit-studio")
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                .setTools(List.of(CuratorFacts.approvedFactLookup(approvedFacts)))
                .setAvailableTools(List.of(CuratorFacts.APPROVED_FACT_LOOKUP_NAME))
                .setStreaming(true)
                .setSystemMessage(new SystemMessageConfig()
                        .setMode(SystemMessageMode.REPLACE)
                        .setContent(CuratorSystemMessages.CURATOR));
        return CuratorStreamer.withSelectedModel(config);
    }
```

**INSERT** region `session-runner` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    private static String runSession(SessionConfig config, String prompt, Duration timeout) throws Exception {
        try (var client = new CopilotClient()) {
            CopilotSession session = null;
            try {
                client.start().get();
                session = client.createSession(config).get();
                String content = CuratorStreamer.streamExhibit(session, prompt, timeout);
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("The curator returned no exhibit content.");
                }
                return content;
            } finally {
                try {
                    if (session != null) {
                        session.close();
                    }
                } finally {
                    client.stop().get();
                }
            }
        }
    }
```

`runSession` uses `CuratorStreamer.GENERATION_TIMEOUT` from `CuratorStreamer.java` and closes the session before stopping the client in `finally`. `buildExhibitPrompt` takes no facts at all now — it names the tool instead. `approvedFactLookup` calls `boundFacts` internally, so the bound holds no matter who builds the tool.

Three helper calls keep this step short. `CuratorTerminal.chooseApprovedFacts` lists the three fact sets, reads the choice, prints the facts, and returns the bounded list once the educator confirms them or types their own. `CuratorPrompts.EXHIBIT_STRUCTURE` is the fixed title, narrative, and questions layout; it lives in `CuratorPrompts.java` because Step 5 checks that same layout. `CuratorStreamer.withSelectedModel` reads the optional `COPILOT_MODEL` environment variable and applies it to the session config.

**Look inside:** `CuratorFacts.java` holds the tool, and it is worth reading because it is a real `ToolDefinition` rather than plumbing. `approvedFactLookup` builds a private `ApprovedFactReader` over the bounded list the educator just approved and binds its no-argument `read` method, so the model cannot steer what comes back — it asks, and it receives exactly that list. `.skipPermission(true)` is set right there because the data is application-owned. The three fact sets and the `MAXIMUM_FACT_COUNT` (20) and `MAXIMUM_FACT_LENGTH` (500) bounds enforced by `boundFacts` are in the same file.
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

The application now interviews you before it writes anything, and the curator visibly fetches its
facts before it writes a word:

```text
=== Museum Exhibit Studio ===

Approved fact sets:
1. Apollo 11
2. Great Barrier Reef
3. Terracotta Army

Choose a fact set [1-3, default 1]: 2
1. The Great Barrier Reef lies off the coast of Queensland, Australia.
2. It stretches for about 2,300 kilometres.
3. It is made up of more than 2,900 individual reefs.
4. It was added to the UNESCO World Heritage List in 1981.
5. Rising sea temperatures have caused repeated coral bleaching events.

Use these facts? [Y/n]: y

[tool:start] approved_fact_lookup
[tool:done] success=true

# A Reef the Size of a Country
## Narrative
Off the Queensland coast, more than two thousand nine hundred reefs...
## Visitor questions
1. ...
```

The `[tool:start] approved_fact_lookup` line is the whole point of this step. The curator did not
recall the reef — it asked your application for the facts, and your application answered.

## Prove the tool is doing the work

Run it again and choose set 1 or 3. The exhibit changes subject completely, and the tool event
appears again each time. Nothing in the prompt changed between those runs: the same prompt text
produced a Terracotta Army exhibit because the tool returned different data. That is the difference
between a prompt that carries data and an application that owns it.

Then answer `n` at the confirmation, type two or three facts of your own, and submit a blank line.
The curator writes about your subject instead — your typed facts went into the tool, and the tool
handed them back to the model.

Try the failure case too. Answer `n` and immediately submit a blank line without typing any facts.
The run stops with:

```text
Could not generate the exhibit: Provide at least one approved fact.
```

The fact chooser bounds whatever the educator types, and the bounds reject an empty list, so no
session was ever created and no request was sent. The error handler that shipped with the starter
prints the message and exits with status 1.

A run that exceeds its timeout stops the same way instead of leaving you waiting indefinitely:

```text
The curator did not respond in time. Try again.
```

The normal timeout is 120 seconds; it does not change which facts or tools the curator may use.

## Check your understanding

- You registered the tool in two places. What would happen if you put `approved_fact_lookup` in the
  tool list but left it out of the allowlist?
- The prompt says "Call `approved_fact_lookup` first." Does that sentence guarantee the call
  happens? What in this step made the tool *available* to be called at all?
- The tool takes no arguments and always returns the same bounded list for a given fact set. What
  would you lose if it took a free-text query argument instead?
- The output structure is requested in the prompt. What has actually verified that the model
  followed it so far?

## Learn more

- [Working with hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  callbacks the runtime invokes around each tool call, for auditing or policy your code owns.
- [Post-tool-use hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspecting or rewriting what a tool returned before the model reads it.
- [Context clearing and terminal tools](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  what a tool can do to the conversation itself, and why most tools should not.

Continue to [Prove the structure](museum-06-prove-the-structure.md).
