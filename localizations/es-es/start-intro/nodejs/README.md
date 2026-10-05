# Proyecto inicial de SDK 101: Node.js

Requiere [Node.js 22.12 o una versión posterior](https://nodejs.org/) y acceso autenticado a Copilot.

Desde la raíz del repositorio del taller:

```shell
cd start-intro/nodejs
npm ci
```

Abre esta carpeta en tu editor (`code .`) y edita `src/index.ts` siguiendo las cuatro ediciones
numeradas de [LIVE_DEMO.md](LIVE_DEMO.md), Primer acto. Después ejecuta:

```shell
npm start
```

El punto de entrada sin modificar está incompleto deliberadamente; no es un Hello World funcional.
Continúa con el Segundo acto de la misma guía para el agente de pódcast. Reutiliza
`src/github-podcast-tools.ts`, `src/model-selector.ts` y `src/permission-prompt.ts` sin editarlos.

Ejecuta `npm run build` para comprobar tipos sin enviar un prompt de Copilot. Ejecuta `npm test`
para regresiones del análisis de RSS usando respuestas de feed simuladas, sin autenticación de
Copilot ni solicitudes de red. Consulta la [preparación](../../workshop/intro-00-preflight.md) para
las comprobaciones de acceso y la solución de problemas, y la
[API oficial del SDK de Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs) como
referencia.
