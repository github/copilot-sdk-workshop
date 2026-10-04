# 박물관 전시 스튜디오

이 Rust 샘플은 GitHub Copilot SDK를 소프트웨어 엔지니어링이 아닌 작업에 집중된 에이전트
하니스로 사용합니다. 미리 빌드된 헬퍼는 `src/lib.rs`에 있고, 학습자가 작성하는
오케스트레이션은 `src/main.rs`에 있습니다.

## 샘플 실행

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

생성 모델을 선택하려면 `COPILOT_MODEL`을 설정합니다. 이 샘플은 인증된 GitHub Copilot
CLI가 필요합니다.

모델에 연결하지 않고 검사하려면 다음 명령을 실행합니다.

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## 이 샘플에서 배울 내용

생성 세션은 replace 방식 큐레이터 시스템 메시지를 사용하고, 승인된 사실을 검증하고,
120초 시간 제한으로 스트리밍하고, `approved_fact_lookup`를 항상 등록하고 허용 목록에
추가하며, 빈 출력을 거부하고, 결정론적 구조 유효성 검사 결과를 출력합니다. 사용할 수
있는 인용된 조사 결과가 있으면 읽기 전용 로컬 `approved_wikipedia_fact_lookup`도
등록하고 허용 목록에 추가하며, 내러티브와 방문자 질문을 작성하기 전에 두 도구를 모두
호출하도록 요청합니다.

선택적 Wikipedia 조사는 별도로 수행됩니다. 범위가 제한된 `search` 및 `readArticle`
MCP 도구만 노출하고, 기본 거부 방식 권한 처리기를 사용하며, 요약과 인용된 출처를
생성합니다. 새 로컬 조회는 실시간 Wikipedia 접근 없이 해당 본문과 인용의 스냅샷을
반환하며, 조사 내용을 교육자가 승인한 사실과 병합하지 않습니다. 승인된 사실이
우선합니다. "Approved" 조사란 사람이 검증한 사실이나 지침이 아니라 애플리케이션이
수용한 보충 데이터라는 뜻입니다. 조사를 거부하면 단일 도구 경로가 유지됩니다. 조사가
실패하거나 인용이 있는 요약을 사용할 수 없으면 경고를 출력하고 동일한 대체 경로를
따릅니다. 출처는 전시 뒤에 출력되며, 조사가 성공한 경우 생성 전에 두 로컬 조회 이벤트가
모두 표시되어야 합니다. 구조 검사는 사실적 근거를 증명하지 않으므로, 게시 전에 조사된
주장을 검토해야 합니다.

선택적 HTML 생성은 `builtin:apply_patch` 또는 `builtin:create`와 함께 단일 파일 권한
처리기를 사용하며, 애플리케이션 작업 디렉터리의 `exhibit.html` 하나에만 쓸 수 있습니다.

이 애플리케이션은 학습자가 박물관 단원을 마친 뒤 최종적으로 갖게 되는 결과물이며, 별도의
참조 아키텍처가 아닙니다. 엔트리포인트는 클라이언트를 시작하고, 세션을 만들고, 시간
제한을 적용하고, 빈 출력을 거부하고, 모든 경로에서 정리하는 작은 세션 실행기 하나를
유지합니다. 조사, 생성, 선택적 HTML 단계는 서로 다른 세션 구성을 사용하면서 이 실행기를
재사용합니다. 다음 트랙을 따라가십시오.
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
