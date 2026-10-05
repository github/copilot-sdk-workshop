# SDK 101-Starterprojekt: Rust

Erfordert [Rust 1.94 oder neuer](https://rustup.rs/) und authentifizierten Copilot-Zugriff. Unter
Windows benötigt die standardmäßige MSVC-Toolchain außerdem C++-Buildtools und das Windows SDK;
schließen Sie vor der Sitzung die
[Rust-Installationsschritte](https://doc.rust-lang.org/book/ch01-01-installation.html) ab.

Aus dem Stamm des Workshop-Repositorys:

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie `src/main.rs`, indem Sie den
vier nummerierten Änderungen im Ersten Akt von [LIVE_DEMO.md](LIVE_DEMO.md) folgen. Führen Sie dann
aus:

```shell
cargo run --locked
```

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem Zweiten Akt für den Podcast-Agenten fort. Verwenden Sie
`src/workshop.rs` wieder, ohne die Datei zu bearbeiten.

Informationen zu Zugriffsprüfungen und Problembehebung finden Sie unter
[Vorbereitung](../../workshop/intro-00-preflight.md), die
[offizielle Rust-SDK-API](https://github.com/github/copilot-sdk/tree/main/rust) dient als Referenz.
