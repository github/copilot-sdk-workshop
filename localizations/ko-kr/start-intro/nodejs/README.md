# SDK 101 시작 프로젝트: Node.js

[Node.js 22.12 이상](https://nodejs.org/)과 인증된 Copilot 액세스가 필요합니다.

워크숍 리포지토리 루트에서 다음을 실행합니다.

```shell
cd start-intro/nodejs
npm ci
```

이 폴더를 편집기에서 열고(`code .`) [LIVE_DEMO.md](../../../../start-intro/nodejs/LIVE_DEMO.md)의 1막에 나오는
네 가지 번호가 매겨진 수정 단계를 따라 `src/index.ts`를 편집합니다. 그런 다음 다음을 실행합니다.

```shell
npm start
```

수정하지 않은 엔트리 포인트(Entrypoint)는 의도적으로 완성되지 않은 상태이며, 작동하는 hello world가 아닙니다.
팟캐스트 에이전트를 만들려면 같은 가이드의 2막을 계속 진행합니다.
`src/github-podcast-tools.ts`, `src/model-selector.ts`,
`src/permission-prompt.ts`는 편집하지 않고 재사용합니다.

Copilot 프롬프트를 보내지 않고 타입 검사를 수행하려면 `npm run build`를 실행합니다.
Copilot 인증이나 네트워크 요청 없이 모의 피드 응답을 사용해 RSS 구문 분석의 회귀를
검사하려면 `npm test`를 실행합니다.
액세스 확인 및 문제 해결 방법은 [사전 점검](../../../../workshop/intro-00-preflight.md)을 참조하고,
API는 [공식 Node.js SDK API](https://github.com/github/copilot-sdk/tree/main/nodejs)를 참조합니다.
