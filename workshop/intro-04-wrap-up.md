# Step 4: Recap and next steps

> **Time:** 3 minutes

## What you built

In 30 minutes of guided work, you connected an application to Copilot, streamed
a response, and gave the session a focused identity and read-only podcast tools.
Installation and authentication happened separately in preflight.

## Check your understanding

Explain the application in this order:

1. The **client** starts the connection and checks authentication.
2. The **session** holds the conversation and its configuration.
3. The **prompt** assigns this episode's task.
4. A **tool** supplies RSS facts when requested and approved.
5. **Events** print the response and show tool activity.
6. The application waits for completion, surfaces failures, and closes resources.

## Show your result

Point to the selected episode, the tool-call milestone, and the resulting
headline and post. Check that a guest, topic, sponsor, or link was not invented.
Check the post's requested length manually.

Then point to the tool allowlist and permission handler. Explain why a
system message is not a substitute for either. You have built an introductory
demo, not proven that its generated copy is safe to publish automatically.

:::language dotnet
Your work is in `start-intro/dotnet/Program.cs`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[.NET starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md).
:::
:::language nodejs
Your work is in `start-intro/nodejs/src/index.ts`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[Node.js starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::
:::language python
Your work is in `start-intro/python/main.py`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[Python starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::
:::language go
Your work is in `start-intro/go/main.go`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[Go starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::
:::language java
Your work is in `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[Java starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::
:::language rust
Your work is in `start-intro/rust/src/main.rs`.
Review the [hello-world](intro-02-hello-world.md) and
[podcast-agent](intro-03-podcast-agent.md) lessons, and the
[Rust starter notes](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Choose a deeper workshop

Use **Hub** above to return to the workshop picker; it keeps your language
selection. Choose:

- **Accessibility Reviewer (90 minutes):** inspect a page, combine local
  guidance with Playwright MCP, and produce an evidence-based report.
- **Museum Exhibit Studio (75 minutes):** build a curator persona, use approved
  facts, check structure, and add scoped Wikipedia research.

Each longer workshop has its own preflight and starter. They are next steps,
not additional requirements for completing this 30-minute track.

## Learn more

- [Official Copilot SDK](https://github.com/github/copilot-sdk)
- [SDK cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Included intro starters](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
