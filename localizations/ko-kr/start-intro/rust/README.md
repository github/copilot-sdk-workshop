# SDK 101 시작 프로젝트: Rust

[Rust 1.94 이상](https://rustup.rs/)과 인증된 Copilot 액세스가 필요합니다.
Windows에서는 기본 MSVC 툴체인(Toolchain)에 C++ 빌드 도구와 Windows
SDK도 필요합니다. 세션을 시작하기 전에 [Rust 설치 단계](https://doc.rust-lang.org/book/ch01-01-installation.html)를
완료합니다.

워크숍 리포지토리 루트에서 다음을 실행합니다.

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

이 폴더를 편집기에서 열고(`code .`) [LIVE_DEMO.md](../../../../start-intro/rust/LIVE_DEMO.md)의 1막에 나오는
네 가지 번호가 매겨진 수정 단계를 따라 `src/main.rs`를 편집합니다. 그런 다음 다음을 실행합니다.

```shell
cargo run --locked
```

수정하지 않은 엔트리 포인트(Entrypoint)는 의도적으로 완성되지 않은 상태이며, 작동하는 hello world가 아닙니다.
팟캐스트 에이전트를 만들려면 같은 가이드의 2막을 계속 진행합니다.
`src/workshop.rs`는 편집하지 않고 재사용합니다.

액세스 확인 및 문제 해결 방법은 [사전 점검](../../../../workshop/intro-00-preflight.md)을 참조하고,
API는 [공식 Rust SDK API](https://github.com/github/copilot-sdk/tree/main/rust)를 참조합니다.
