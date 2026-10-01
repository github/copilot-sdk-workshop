# Step 4: Ground it in approved facts

> **Time:** 15 minutes

## What you'll build

Until now the curator has been writing from model memory. That is unacceptable for a museum: an
exhibit label is an institutional claim, and "the model knew it" is not a source.

In this step the educator supplies the facts and the **application** hands them to the curator
through a tool it owns. You register the pre-built `approved_fact_lookup` tool, make it the one
tool the model may call, and write a prompt that orders the curator to call it before writing a
word. You also let the educator pick one of three approved fact sets or type their own, and put
the session lifecycle in one small runner that later steps reuse.

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
Open `Program.cs`. Widen nothing at the top — you already have
`using MuseumExhibitStudio.Helpers;`. Replace everything from the first `Console.WriteLine` to the
end of the file:

```csharp
try
{
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
    Console.WriteLine("Approved fact sets:");
    for (var index = 0; index < CuratorFacts.FactSets.Count; index++)
    {
        Console.WriteLine($"{index + 1}. {CuratorFacts.FactSets[index].Label}");
    }

    Console.WriteLine();

    var selectedFactSet = ReadFactSetSelection();
    var approvedFacts = CuratorFacts.BoundFacts(selectedFactSet.Facts);
    for (var index = 0; index < approvedFacts.Length; index++)
    {
        Console.WriteLine($"{index + 1}. {approvedFacts[index]}");
    }

    Console.WriteLine();

    if (!CuratorTerminal.AskYesNo("Use these facts?", defaultYes: true))
    {
        approvedFacts = CuratorFacts.BoundFacts(CuratorTerminal.ReadFacts());
    }

    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);

    return 0;
}
catch (TimeoutException)
{
    Console.Error.WriteLine("The curator did not respond in time. Try again.");
    return 1;
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Could not generate the exhibit: {exception.Message}");
    return 1;
}
finally
{
    CuratorTerminal.CloseTerminal();
}

static string? SelectedModel()
{
    var model = Environment.GetEnvironmentVariable("COPILOT_MODEL");
    return string.IsNullOrWhiteSpace(model) ? null : model.Trim();
}

SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = SystemMessage
    }
};

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

CuratorFactSet ReadFactSetSelection()
{
    var input = CuratorTerminal.AskLine("Choose a fact set [1-3, default 1]: ");
    if (int.TryParse(input, out var selection) &&
        selection >= 1 &&
        selection <= CuratorFacts.FactSets.Count)
    {
        return CuratorFacts.FactSets[selection - 1];
    }

    return CuratorFacts.FactSets[0];
}

static string BuildExhibitPrompt()
{
    return $"""
        Create visitor-facing exhibit text about this application's approved subject.

        Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
        treat them as the complete source of truth for this exhibit.

        Return exactly this structure:

        # <an engaging exhibit title>
        ## Narrative
        <100-140 words, excluding the title and questions>
        ## Visitor questions
        1. <question>
        2. <question>
        3. <question>

        Write exactly three distinct visitor reflection questions. Do not add a preface,
        conclusion, software discussion, or facts the tool did not return.
        """;
}
```

Local functions come after the top-level statements. `RunSessionAsync` uses
`CuratorStreamer.GenerationTimeout` from `Helpers/CuratorStreamer.cs` and disposes the session
before stopping the client in `finally`. `BuildExhibitPrompt` takes no facts at all now
— it names the tool instead. `CreateApprovedFactLookup` calls `BoundFacts` internally, so the bound
holds no matter who builds the tool.

**Look inside:** `Helpers/CuratorFacts.cs` holds all of this, and it is worth reading because it is
a real tool definition rather than plumbing. `CreateApprovedFactLookup` closes over the bounded
list the educator just approved and registers it through `CopilotTool.DefineTool` under the name
`approved_fact_lookup`. The handler takes no parameters, so the model cannot steer what comes back
— it asks, and it receives exactly that list. `SkipPermission = true` is set right there because
the data is application-owned. The three fact sets and the `MaximumFactCount` (20) and
`MaximumFactLength` (500) bounds enforced by `BoundFacts` are in the same file.
:::

:::language nodejs
Open `src/index.ts`. Add the session config type to the SDK import and widen the helper import:

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  askLine,
  askYesNo,
  boundFacts,
  closeTerminal,
  createApprovedFactLookup,
  factSets,
  generationTimeoutMs,
  readFacts,
  streamExhibit,
} from "./curator.js";
```

Add the prompt builder and the fact-set chooser below the system message:

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the
complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return.`;
}

async function chooseFactSet(): Promise<(typeof factSets)[number]> {
  const answer = await askLine("Choose a fact set [1-3, default 1]: ");
  const choice = Number.parseInt(answer, 10);
  if (Number.isInteger(choice) && choice >= 1 && choice <= factSets.length) {
    return factSets[choice - 1] ?? factSets[0];
  }
  return factSets[0];
}
```

Add the configuration builder and reusable session runner above `main`, then replace `main`:

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: process.env.COPILOT_MODEL?.trim() || undefined,
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: systemMessage },
  };
}

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

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  try {
    console.log("=== Museum Exhibit Studio ===");
    console.log();
    console.log("Approved fact sets:");
    factSets.forEach((factSet, index) => console.log(`${index + 1}. ${factSet.label}`));
    console.log();

    const chosenSet = await chooseFactSet();
    let approvedFacts = boundFacts(chosenSet.facts);
    approvedFacts.forEach((fact, index) => console.log(`${index + 1}. ${fact}`));
    console.log();

    if (!(await askYesNo("Use these facts?", true))) {
      approvedFacts = boundFacts(await readFacts());
    }

    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
  } catch (error) {
    const message = describe(error);
    console.error(message.toLocaleLowerCase().includes("timeout")
      ? "The curator did not respond in time. Try again."
      : `Could not generate the exhibit: ${message}`);
    process.exitCode = 1;
  } finally {
    closeTerminal();
  }
}
```

Keep the `void main();` call. `runSession` passes `generationTimeoutMs` from `src/curator.ts`
to the streamer; its nested `finally` blocks disconnect the session and stop the client.
`buildExhibitPrompt` takes no facts at all now — it names the tool instead.
`createApprovedFactLookup` calls `boundFacts` internally, so the bound holds no matter who builds
the tool.

**Look inside:** `src/curator.ts` holds all of this, and it is worth reading because it is a real
`defineTool` definition rather than plumbing. `createApprovedFactLookup` closes over the bounded
list the educator just approved and defines `approved_fact_lookup` with
`parameters: { type: "object", properties: {}, additionalProperties: false }`, so the model cannot
steer what comes back — it asks, and it receives exactly that list. `skipPermission: true` is set
right there because the data is application-owned. The three fact sets and the `maximumFactCount`
(20) and `maximumFactLength` (500) bounds enforced by `boundFacts` are in the same file.
:::

:::language python
Open `main.py`. Add `import os`, `import sys`, `from collections.abc import Iterable`, and
`from typing import Any` at the top, and widen the helper import:

```python
from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    FACT_SETS,
    GENERATION_TIMEOUT_SECONDS,
    ask_line,
    ask_yes_no,
    bound_facts,
    create_approved_fact_lookup,
    read_facts,
    stream_exhibit,
)
```

Add the prompt builder below `SYSTEM_MESSAGE`:

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return."""
```

Add the configuration builder and session runner above `main`, then replace `main` and the
entrypoint below it:

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    config: dict[str, Any] = {
        "client_name": "museum-exhibit-studio",
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": SYSTEM_MESSAGE},
    }
    model = os.getenv("COPILOT_MODEL")
    if model and model.strip():
        config["model"] = model.strip()
    return config


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


async def main() -> int:
    try:
        print("=== Museum Exhibit Studio ===")
        print()
        print("Approved fact sets:")
        for index, fact_set in enumerate(FACT_SETS, start=1):
            print(f"{index}. {fact_set.label}")
        print()

        choice = ask_line("Choose a fact set [1-3, default 1]: ")
        selected_index = int(choice) - 1 if choice in {"1", "2", "3"} else 0
        facts = list(FACT_SETS[selected_index].facts)
        for index, fact in enumerate(facts, start=1):
            print(f"{index}. {fact}")
        print()

        if not ask_yes_no("Use these facts?", True):
            facts = read_facts()
        facts = bound_facts(facts)

        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
        return 0
    except TimeoutError:
        print("The curator did not respond in time. Try again.", file=sys.stderr)
        return 1
    except Exception as error:
        print(f"Could not generate the exhibit: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
```

`run_session` passes `GENERATION_TIMEOUT_SECONDS` from `curator.py` to the streamer; its
`finally` blocks disconnect the session and stop the client. `build_exhibit_prompt` takes no
facts at all now — it names the tool instead.
`create_approved_fact_lookup` calls `bound_facts` internally, so the bound holds no matter who
builds the tool.

**Look inside:** `curator.py` holds all of this, and it is worth reading because it is a real
`@define_tool` definition rather than plumbing. `create_approved_fact_lookup` closes over the
bounded list the educator just approved and decorates a nested `approved_fact_lookup()` that takes
no arguments, so the model cannot steer what comes back — it asks, and it receives exactly that
list. `skip_permission=True` is set right there because the data is application-owned. The three
fact sets and the `MAXIMUM_FACT_COUNT` (20) and `MAXIMUM_FACT_LENGTH` (500) bounds enforced by
`bound_facts` are in the same file.
:::

:::language go
Open `main.go`. Add `"errors"`, `"os"`, `"strconv"`, `"strings"`, and `"time"` to the import
block, then add the prompt builder below the system message:

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete
source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return.`, ApprovedFactLookupName)
}
```

Add the configuration builder and session runner, then replace `main` with a thin wrapper and
a `run` function:

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               strings.TrimSpace(os.Getenv("COPILOT_MODEL")),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: systemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

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

func isTimeout(err error) bool {
	return errors.Is(err, context.DeadlineExceeded) ||
		strings.Contains(strings.ToLower(err.Error()), "timeout")
}

func main() {
	if err := run(); err != nil {
		if isTimeout(err) {
			fmt.Fprintln(os.Stderr, "The curator did not respond in time. Try again.")
		} else {
			fmt.Fprintln(os.Stderr, err)
		}
		os.Exit(1)
	}
}

func run() error {
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
	fmt.Println("Approved fact sets:")
	for index, factSet := range FactSets {
		fmt.Printf("%d. %s\n", index+1, factSet.Label)
	}
	fmt.Println()

	choice := AskLine(fmt.Sprintf("Choose a fact set [1-%d, default 1]: ", len(FactSets)))
	selectedIndex := 0
	if parsed, err := strconv.Atoi(choice); err == nil && parsed >= 1 && parsed <= len(FactSets) {
		selectedIndex = parsed - 1
	}

	facts := append([]string(nil), FactSets[selectedIndex].Facts...)
	for index, fact := range facts {
		fmt.Printf("%d. %s\n", index+1, fact)
	}
	fmt.Println()

	if !AskYesNo("Use these facts?", true) {
		facts = ReadFacts()
	}
	facts, err := BoundFacts(facts)
	if err != nil {
		return err
	}

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
	return nil
}
```

`runSession` passes `GenerationTimeout` from `curator.go` to the streamer and uses `defer` to
disconnect the session and stop the client. `buildExhibitPrompt` takes no facts at all now — it
names the tool instead. `ApprovedFactLookup`
calls `BoundFacts` internally, so the bound holds no matter who builds the tool.

**Look inside:** `curator.go` holds all of this, and it is worth reading because it is a real
`copilot.DefineTool` definition rather than plumbing. `ApprovedFactLookup` closes over the bounded
list the educator just approved and defines a handler whose argument type is `struct{}`, so the
model cannot steer what comes back — it asks, and it receives exactly that list.
`lookup.SkipPermission = true` is set right there because the data is application-owned. The three
fact sets and the `MaximumFactCount` (20) and `MaximumFactLength` (500) bounds enforced by
`BoundFacts` are in the same file.
:::

:::language rust
Open `src/main.rs`. Add `use std::error::Error;` and `use std::time::Duration;`, and widen
the crate import:

```rust
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, FactBoundsError, GENERATION_TIMEOUT, RuntimeError,
    approved_fact_lookup, ask_line, ask_yes_no, bound_facts, fact_sets, read_facts, stream_exhibit,
};
```

Add the prompt builder below `SYSTEM_MESSAGE`:

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

Return exactly this structure:

# <an engaging exhibit title>
## Narrative
<100-140 words, excluding the title and questions>
## Visitor questions
1. <question>
2. <question>
3. <question>

Write exactly three distinct visitor reflection questions. Do not add a preface,
conclusion, software discussion, or facts the tool did not return."#
    )
}
```

Add the configuration builder and session runner, then replace `main` with a thin wrapper and
a `run` function:

```rust
fn selected_model() -> Option<String> {
    std::env::var("COPILOT_MODEL")
        .ok()
        .map(|model| model.trim().to_owned())
        .filter(|model| !model.is_empty())
}

fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, FactBoundsError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(SYSTEM_MESSAGE),
    );
    Ok(config)
}

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

fn is_timeout_error(error: &(dyn Error + 'static)) -> bool {
    let mut current = Some(error);
    while let Some(candidate) = current {
        let message = candidate.to_string().to_lowercase();
        if message.contains("timeout") || message.contains("timed out") {
            return true;
        }
        current = candidate.source();
    }
    false
}

#[tokio::main]
async fn main() {
    if let Err(error) = run().await {
        if is_timeout_error(error.as_ref()) {
            eprintln!("The curator did not respond in time. Try again.");
        } else {
            eprintln!("Could not complete Museum Exhibit Studio: {error}");
        }
        std::process::exit(1);
    }
}

async fn run() -> Result<(), RuntimeError> {
    println!("=== Museum Exhibit Studio ===");
    println!();
    println!("Approved fact sets:");
    for (index, fact_set) in fact_sets().iter().enumerate() {
        println!("{}. {}", index + 1, fact_set.label);
    }
    println!();

    let choice = ask_line("Choose a fact set [1-3, default 1]: ")?;
    let selected_index = choice
        .trim()
        .parse::<usize>()
        .ok()
        .filter(|index| (1..=fact_sets().len()).contains(index))
        .unwrap_or(1)
        - 1;
    let mut facts = fact_sets()[selected_index]
        .facts
        .iter()
        .map(|fact| (*fact).to_owned())
        .collect::<Vec<_>>();
    for (index, fact) in facts.iter().enumerate() {
        println!("{}. {fact}", index + 1);
    }
    println!();

    if !ask_yes_no("Use these facts?", true)? {
        facts = read_facts()?;
    }
    let facts = bound_facts(facts)?;

    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;

    Ok(())
}
```

`run_session` passes `GENERATION_TIMEOUT` from `src/lib.rs` to the streamer and disconnects
the session and stops the client before propagating errors. `build_exhibit_prompt` takes no
facts at all now — it names the tool instead.
`approved_fact_lookup` calls `bound_facts` internally, so the bound holds no matter who builds the
tool.

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
Open `src/main/java/workshop/MuseumExhibitStudio.java`. Add these imports, then add the prompt
builder and fact-set chooser to the class:

```java
import com.github.copilot.CopilotSession;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
```

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the
                complete source of truth for this exhibit.

                Return exactly this structure:

                # <an engaging exhibit title>
                ## Narrative
                <100-140 words, excluding the title and questions>
                ## Visitor questions
                1. <question>
                2. <question>
                3. <question>

                Write exactly three distinct visitor reflection questions. Do not add a preface,
                conclusion, software discussion, or facts the tool did not return.
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME);
    }

    private static CuratorFacts.FactSet selectFactSet(String input) {
        if (input != null && !input.isBlank()) {
            try {
                int selected = Integer.parseInt(input.trim());
                if (selected >= 1 && selected <= CuratorFacts.factSets.size()) {
                    return CuratorFacts.factSets.get(selected - 1);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return CuratorFacts.factSets.get(0);
    }
```

Add the configuration builder and session runner to the class, then replace `main`:

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
                        .setContent(SYSTEM_MESSAGE));
        String model = System.getenv("COPILOT_MODEL");
        if (model != null && !model.isBlank()) {
            config.setModel(model.trim());
        }
        return config;
    }

    private static String runSession(SessionConfig config, String prompt, Duration timeout)
            throws Exception {
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

    private static boolean isTimeout(Throwable error) {
        Throwable current = error;
        while (current != null) {
            if (current instanceof TimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static String rootMessage(Throwable error) {
        Throwable current = error;
        while (current instanceof ExecutionException && current.getCause() != null) {
            current = current.getCause();
        }
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String message = current.getMessage();
        return message == null || message.isBlank() ? current.getClass().getSimpleName() : message;
    }

    public static void main(String[] args) {
        int exitCode = 0;
        try {
            System.out.println("=== Museum Exhibit Studio ===");
            System.out.println();
            System.out.println("Approved fact sets:");
            for (int index = 0; index < CuratorFacts.factSets.size(); index++) {
                System.out.printf("%d. %s%n", index + 1, CuratorFacts.factSets.get(index).label());
            }
            System.out.println();

            CuratorFacts.FactSet selected =
                    selectFactSet(CuratorTerminal.askLine("Choose a fact set [1-3, default 1]: "));
            List<String> facts = selected.facts();
            for (int index = 0; index < facts.size(); index++) {
                System.out.printf("%d. %s%n", index + 1, facts.get(index));
            }
            System.out.println();

            if (!CuratorTerminal.askYesNo("Use these facts?", true)) {
                facts = CuratorTerminal.readFacts();
            }
            facts = CuratorFacts.boundFacts(facts);

            System.out.println();
            runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
        } catch (Exception exception) {
            exitCode = 1;
            if (isTimeout(exception)) {
                System.err.println("The curator did not respond in time. Try again.");
            } else {
                System.err.println("Could not complete the exhibit studio run: " + rootMessage(exception));
            }
        } finally {
            try {
                CuratorTerminal.close();
            } catch (Exception exception) {
                System.err.println("Could not close the terminal: " + rootMessage(exception));
                exitCode = 1;
            }
        }
        if (exitCode != 0) {
            System.exit(exitCode);
        }
    }
```

`runSession` passes `CuratorStreamer.GENERATION_TIMEOUT` from `CuratorStreamer.java` to the
streamer; its nested `finally` blocks close the session and stop the client. `buildExhibitPrompt`
takes no facts at all now — it names the tool instead. `approvedFactLookup`
calls `boundFacts` internally, so the bound holds no matter who builds the tool.

**Look inside:** `CuratorFacts.java` holds all of this, and it is worth reading because it is a
real `ToolDefinition` rather than plumbing. `approvedFactLookup` builds a private
`ApprovedFactReader` over the bounded list the educator just approved and binds its no-argument
`read` method, so the model cannot steer what comes back — it asks, and it receives exactly that
list. `.skipPermission(true)` is set right there because the data is application-owned. The three
fact sets and the `MAXIMUM_FACT_COUNT` (20) and `MAXIMUM_FACT_LENGTH` (500) bounds enforced by
`boundFacts` are in the same file.
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
The run stops with `Provide at least one approved fact.` — the tool factory refused to be built
around an empty list, so no request was ever sent. The error handler reports the failure and
exits with status 1.

The session runner also reports a timeout instead of leaving you waiting indefinitely:

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
