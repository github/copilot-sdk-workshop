# SDK 101 starter: Rust

Requires [Rust 1.94 or newer](https://rustup.rs/) and authenticated Copilot access.
On Windows, the default MSVC toolchain also needs C++ build tools and the Windows
SDK; complete the [Rust installation steps](https://doc.rust-lang.org/book/ch01-01-installation.html)
before the session.

From the workshop repository root:

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Open this folder in your editor (`code .`) and edit `src/main.rs` by following
the four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One. Then run:

```shell
cargo run --locked
```

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse
`src/workshop.rs` without editing it.

See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official Rust SDK API](https://github.com/github/copilot-sdk/tree/main/rust)
for reference.
