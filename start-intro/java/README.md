# SDK 101 starter: Java

Requires [Java 17 or newer](https://adoptium.net/),
[Maven 3.9 or newer](https://maven.apache.org/install.html), and authenticated
Copilot access. This starter uses Maven itself, not a Maven wrapper.

From the workshop repository root:

```shell
cd start-intro/java
mvn dependency:go-offline
```

Open this folder in your editor (`code .`) and edit
`src/main/java/demo/CopilotSdkLiveDemo.java` by following the
four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One. Then run:

```shell
mvn compile exec:java
```

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse
the tool, model-selection, and permission helper classes in the `demo` package.

Run `mvn compile` to compile without sending a Copilot prompt.
See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official Java SDK API](https://github.com/github/copilot-sdk/tree/main/java)
for reference.
