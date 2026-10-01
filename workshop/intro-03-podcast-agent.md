# Step 3: Build the podcast agent

> **Time:** 12 minutes

## Continue the same demo

Keep the hello-world application you just completed. Follow **Act Two: Turn
It Into A Podcast Agent** in the same **`LIVE_DEMO.md`**. This lesson displays
that act directly.

Make the guide's three changes: choose a model and real episode, give the session
its capabilities and identity, then replace the prompt. Reuse the prebuilt
helpers instead of writing a feed parser or starting a different project.

:::language dotnet
Continue in `start-intro/dotnet/Program.cs`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
Continue in `start-intro/nodejs/src/index.ts`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
Continue in `start-intro/python/main.py`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
Continue in `start-intro/go/main.go`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
Continue in `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
Continue in `start-intro/rust/src/main.rs`.
[Act Two in your demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## Act Two: Turn It Into A Podcast Agent

<!-- LIVE_DEMO -->

## Run it

Use the same folder and run command as hello world. Select a model and one of
the real episodes. Read the requested tool name before approving it with `y`.
Pressing Enter rejects the request; rejection is not a successful lookup.

Expect model selection, episode selection, a tool-start event, an approval
prompt, a tool-complete event, and then streamed launch copy.

The application fetches the episode list before a model-requested tool call.
The permission handler governs model-requested tools, not every network request
made by your application. Keep the existing event handling and cleanup.

## Check your understanding

Find the two tool registrations, their allowlist, the permission handler,
and the system message. Explain what changed from hello world.

Compare the result against the selected episode's RSS metadata. Asking for a
post under 280 characters **does not enforce the limit in code**. A system
message does not prove factual accuracy or sponsor safety. Review claims and
length **before publishing**; do not post anything during this workshop.

## Troubleshooting this run

- **No episode list:** check access to the official RSS feed; do not substitute
  invented facts for a failed lookup.
- **No approval prompt:** check both tool names, their allowlist, and the
  replacement permission handler.
- **Waiting for input:** use an interactive terminal and answer its prompt.
- **Denied lookup:** rerun and approve the expected read-only tool if appropriate.
  Do not remove the handler to bypass a rejection.

Continue to [Recap and next steps](intro-04-wrap-up.md).

## Learn more

- [Copilot SDK and tool APIs](https://github.com/github/copilot-sdk)
- [Included starters and demo guides](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
