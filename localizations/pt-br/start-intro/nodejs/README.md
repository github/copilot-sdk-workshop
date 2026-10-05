# Projeto inicial do SDK 101: Node.js

Requer [Node.js 22.12 ou mais recente](https://nodejs.org/) e acesso autenticado ao Copilot.

A partir da raiz do repositório do workshop:

```shell
cd start-intro/nodejs
npm ci
```

Abra esta pasta no seu editor (`code .`) e edite `src/index.ts` seguindo as quatro edições numeradas
em [LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Em seguida, execute:

```shell
npm start
```

O ponto de entrada intacto está deliberadamente incompleto, não é um Hello World funcional. Continue
com o Ato dois no mesmo guia para o agente de podcast. Reutilize `src/github-podcast-tools.ts`,
`src/model-selector.ts` e `src/permission-prompt.ts` sem editá-los.

Execute `npm run build` para verificar tipos sem enviar um prompt do Copilot. Execute `npm test`
para regressões de análise de RSS usando respostas de feed simuladas, sem autenticação do Copilot
nem solicitações de rede. Consulte a [preparação](../../workshop/intro-00-preflight.md) para
verificações de acesso e solução de problemas, e a
[API oficial do SDK Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs) para
referência.
