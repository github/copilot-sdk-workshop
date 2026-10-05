# Projeto inicial do SDK 101: Rust

Requer [Rust 1.94 ou mais recente](https://rustup.rs/) e acesso autenticado ao Copilot. No Windows,
a cadeia de ferramentas MSVC padrão também precisa de ferramentas de build C++ e do Windows SDK;
conclua as [etapas de instalação do Rust](https://doc.rust-lang.org/book/ch01-01-installation.html)
antes da sessão.

A partir da raiz do repositório do workshop:

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Abra esta pasta no seu editor (`code .`) e edite `src/main.rs` seguindo as quatro edições numeradas
em [LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Em seguida, execute:

```shell
cargo run --locked
```

O ponto de entrada intacto está deliberadamente incompleto, não é um Hello World funcional. Continue
com o Ato dois no mesmo guia para o agente de podcast. Reutilize `src/workshop.rs` sem editá-lo.

Consulte a [preparação](../../workshop/intro-00-preflight.md) para verificações de acesso e solução
de problemas, e a [API oficial do SDK Rust](https://github.com/github/copilot-sdk/tree/main/rust)
para referência.
