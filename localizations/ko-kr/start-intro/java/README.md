# SDK 101 시작 프로젝트: Java

[Java 17 이상](https://adoptium.net/)과 인증된 Copilot 액세스가
필요합니다. Maven Wrapper(`./mvnw`)가 포함되어 있으므로 Maven을 별도로 설치할
필요가 없습니다. Windows에서는 `./mvnw` 대신 `mvnw.cmd`를 실행합니다.

워크숍 리포지토리 루트에서 다음을 실행합니다.

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

이 폴더를 편집기에서 열고(`code .`)
[LIVE_DEMO.md](../../../../start-intro/java/LIVE_DEMO.md)의 1막에 나오는
네 가지 번호가 매겨진 수정 단계를 따라 `src/main/java/demo/CopilotSdkLiveDemo.java`를
편집합니다. 그런 다음 다음을 실행합니다.

```shell
./mvnw compile exec:java
```

수정하지 않은 엔트리 포인트(Entrypoint)는 의도적으로 완성되지 않은 상태이며, 작동하는 hello world가 아닙니다.
팟캐스트 에이전트를 만들려면 같은 가이드의 2막을 계속 진행합니다. `demo` 패키지에 있는
도구, 모델 선택 및 권한 헬퍼(Helper) 클래스를 재사용합니다.

Copilot 프롬프트를 보내지 않고 컴파일하려면 `./mvnw compile`을 실행합니다.
액세스 확인 및 문제 해결 방법은 [사전 점검](../../../../workshop/intro-00-preflight.md)을 참조하고,
API는 [공식 Java SDK API](https://github.com/github/copilot-sdk/tree/main/java)를 참조합니다.
