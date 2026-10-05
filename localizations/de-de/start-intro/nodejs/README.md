# SDK 101-Starterprojekt: Node.js

Erfordert [Node.js 22.12 oder neuer](https://nodejs.org/) und authentifizierten Copilot-Zugriff.

Aus dem Stamm des Workshop-Repositorys:

```shell
cd start-intro/nodejs
npm ci
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie `src/index.ts`, indem Sie den
vier nummerierten Änderungen im Ersten Akt von [LIVE_DEMO.md](LIVE_DEMO.md) folgen. Führen Sie dann
aus:

```shell
npm start
```

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem Zweiten Akt für den Podcast-Agenten fort. Verwenden Sie
`src/github-podcast-tools.ts`, `src/model-selector.ts` und `src/permission-prompt.ts` wieder, ohne
sie zu bearbeiten.

Führen Sie `npm run build` aus, um die Typprüfung auszuführen, ohne einen Copilot-Prompt zu senden.
Führen Sie `npm test` für Regressionen beim RSS-Parsing mit simulierten Feed-Antworten aus, ohne
Copilot-Authentifizierung oder Netzwerkanfragen. Informationen zu Zugriffsprüfungen und
Problembehebung finden Sie unter [Vorbereitung](../../workshop/intro-00-preflight.md), die
[offizielle Node.js-SDK-API](https://github.com/github/copilot-sdk/tree/main/nodejs) dient als
Referenz.
