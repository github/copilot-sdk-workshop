# Step 2: Streaming hello world

> **Time:** 10 minutes

## Start with the starter

Edit the entrypoint in the `start-intro` folder you opened during preflight.
Open its **`LIVE_DEMO.md`** alongside the code. This lesson displays
**Act One: Hello World** from that same file, not a separate implementation.

Follow its four numbered edits in order: **start the client, check
authentication, create the session, and send hello world**. Keep the starter's
supplied event handling; Java and Rust include the missing subscription at the
marked location. Complete all four edits before running.

:::language dotnet
Work in `start-intro/dotnet`, editing `Program.cs`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
Work in `start-intro/nodejs`, editing `src/index.ts`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
Work in `start-intro/python`, editing `main.py`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
Work in `start-intro/go`, editing `main.go`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
Work in `start-intro/java`, editing `src/main/java/demo/CopilotSdkLiveDemo.java`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
Work in `start-intro/rust`, editing `src/main.rs`.
[Open the local demo guide](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## Act One: Hello World

<!-- LIVE_DEMO -->

## Run it

Use the checkpoint command in your demo guide, from the selected language folder.
Expect a real, streamed one-sentence answer, then program exit. The starter's
banner or an authentication message alone is not a successful hello world.

The session uses an **empty tool allowlist** with a permission handler.
Approve-all is not itself a safety boundary; the empty allowlist removes tool
capabilities for this first exercise. The next act replaces both settings.

## Check your understanding

Point to the four edits you made. Explain why the client and session are
different, and which event reports that the turn is complete.

## Troubleshooting this run

- **No real response:** save the entrypoint and finish all four guide steps.
- **Authentication error:** run `copilot auth login` in the same environment.
- **Model unavailable:** change the starter's preferred model to an ID available
  to your account. The next act introduces the model picker.
- **Turn stalls:** keep the permission handler and empty allowlist; verify CLI
  connectivity and the completion wait.

Continue to [Build the podcast agent](intro-03-podcast-agent.md).

## Learn more

- [Copilot SDK language APIs](https://github.com/github/copilot-sdk)
- [Included starters and demo guides](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
