# SDK 101 starter: Node.js

Requires [Node.js 22.12 or newer](https://nodejs.org/) and authenticated Copilot access.

From the workshop repository root:

```shell
cd start-intro/nodejs
npm ci
```

Open this folder in your editor (`code .`) and edit `src/index.ts` by following
the four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One. Then run:

```shell
npm start
```

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse
`src/github-podcast-tools.ts`, `src/model-selector.ts`, and
`src/permission-prompt.ts` without editing them.

Run `npm run build` to type-check without sending a Copilot prompt.
See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official Node.js SDK API](https://github.com/github/copilot-sdk/tree/main/nodejs)
for reference.
