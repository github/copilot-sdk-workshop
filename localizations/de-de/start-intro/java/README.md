# SDK 101-Starterprojekt: Java

Erfordert [Java 17 oder neuer](https://adoptium.net/) und authentifizierten Copilot-Zugriff. Der
Maven Wrapper (`./mvnw`) ist enthalten, daher ist keine separate Maven-Installation erforderlich.
Führen Sie unter Windows `mvnw.cmd` statt `./mvnw` aus.

Aus dem Stamm des Workshop-Repositorys:

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie
`src/main/java/demo/CopilotSdkLiveDemo.java`, indem Sie den vier nummerierten Änderungen im Ersten
Akt von [LIVE_DEMO.md](LIVE_DEMO.md) folgen. Führen Sie dann aus:

```shell
./mvnw compile exec:java
```

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem Zweiten Akt für den Podcast-Agenten fort. Verwenden Sie die
Hilfsklassen für Tool, Modellauswahl und Berechtigungen im Paket `demo` wieder.

Führen Sie `./mvnw compile` aus, um zu kompilieren, ohne einen Copilot-Prompt zu senden.
Informationen zu Zugriffsprüfungen und Problembehebung finden Sie unter
[Vorbereitung](../../workshop/intro-00-preflight.md), die
[offizielle Java-SDK-API](https://github.com/github/copilot-sdk/tree/main/java) dient als Referenz.
