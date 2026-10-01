# The GitHub Podcast Live Demo: Python

## Before The Session

1. Run `copilot auth login` if this machine is not already authenticated.
2. Create an environment in the included starter before the timed session:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

On macOS/Linux, use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

## Demo Pitch

Say: "We are building a Podcast Agent for The GitHub Podcast. It will let us choose a real episode, retrieve verified metadata from the official RSS feed, and turn those facts into sponsor-safe social copy."

Say: "We will begin with the smallest possible Copilot SDK conversation, then give it a purpose, an identity, and application-owned tools."

## Act One: Hello World

Start with `main.py`. It deliberately has named placeholders for `client`, `is_authenticated`, and `session`. Leave the streaming event handler and completion wait in place.

### 1. Start The Client

Replace `client: CopilotClient` with:

```python
client = CopilotClient()
await client.start()
```

Say: "The client is my connection to the Copilot runtime. I start it explicitly, so the application owns its lifecycle."

### 2. Check Authentication

Replace `is_authenticated = False` and its `if` block with:

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

Say: "Before creating a session, I can ask the runtime whether this machine is signed in."

### 3. Create The Session

Replace `session = None` with:

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

Widen the SDK import at the top of the file:

```python
from copilot import CopilotClient, PermissionHandler
```

Say: "The session is the conversation. I chose the model, enabled streaming, and the event handler below already prints each text fragment as it arrives."

Say: "The handler answers permission requests. The empty tool allowlist removes tool capabilities for this exercise; approve-all alone is not a safety boundary."

### 4. Send Hello World

Replace everything from `# Step 5: Send the first message.` to the end of
`main()` with this indented block. Keep the module's
`if __name__ == "__main__":` block:

```python
    try:
        await session.send(
            "Hello world! In one sentence, say what the Copilot SDK helps a Python app do."
        )
        await asyncio.wait_for(done.wait(), timeout=60)
        if error is not None:
            raise error
        print()
    finally:
        await session.disconnect()
        await client.stop()
```

Say: "That is the basic shape: start a client, create a session, listen for events, and send a message. Once this loop works, we can evolve it into our Podcast Agent."

Run this Hello World checkpoint from `start-intro/python`:

```powershell
.\.venv\Scripts\python.exe main.py
```

On macOS/Linux:

```bash
.venv/bin/python main.py
```

Expected output: a streamed one-sentence answer, followed by `SessionIdleData` completing the program.

## Act Two: Turn It Into A Podcast Agent

After Hello World, use the prewritten helpers to turn the same session into a grounded podcast workflow.

Say: "The conversation works. Now we will turn it into our Podcast Agent: a focused assistant that can research a selected GitHub Podcast episode and prepare launch copy without inventing facts."

### 1. Let The Presenter Choose

Add imports:

```python
from github_podcast_tools import (
    get_latest,
    get_latest_github_podcast_episodes,
    get_github_podcast_episode,
    pick_episode,
)
from model_selector import select_model
from permission_prompt import permission_prompt
```

Narrow the SDK import back, since `permission_prompt` replaces `PermissionHandler` below:

```python
from copilot import CopilotClient
```

After the auth check:

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

Say: "This keeps the demo live. I can choose a model in the room, then choose from the real ten newest GitHub Podcast episodes. That selection becomes the Podcast Agent's assignment."

### 2. Give The Session Capabilities

Create the session with tools:

```python
session = await client.create_session(
    model=model,
    streaming=True,
    tools=[get_github_podcast_episode, get_latest_github_podcast_episodes],
    available_tools=["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
    on_permission_request=permission_prompt,
    system_message={
        "mode": "replace",
        "content": "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
    },
)
```

Say: "The model does not get arbitrary access to my application. I grant two narrow, typed capabilities, allowlist them by name, and swap Hello World's approve-all handler for one that prompts me, so I remain the approval point before a tool executes."

Say: "These tools are what make this an agent rather than a generic chatbot: it can take action against a trusted data source that my application controls."

Say: "The system message uses replace, not append. My application supplies the complete agent identity and grounding rule for this session instead of inheriting the default prompt."

### 3. Replace The Prompt

Replace the prompt with:

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

Say: "The agent decides to call the episode tool, I approve the read-only lookup, and its response is grounded in the official feed rather than invented details."

Keep the event handler, completion wait, and cleanup unchanged. Replace only
the `session.send(...)` call inside the existing `try` block. Update the
model-status line to print the selected `model`.

Run the completed Podcast Agent from the same folder:

```powershell
.\.venv\Scripts\python.exe main.py
```

On macOS/Linux:

```bash
.venv/bin/python main.py
```

Expected milestones: model selection, ten-episode selection, `[Tool call started]`, approval prompt, `[Tool call complete]`, then streamed launch copy.
