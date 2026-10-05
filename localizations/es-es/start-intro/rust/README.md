# Proyecto inicial de SDK 101: Rust

Requiere [Rust 1.94 o una versión posterior](https://rustup.rs/) y acceso autenticado a Copilot. En
Windows, la cadena de herramientas MSVC predeterminada también necesita las herramientas de
compilación de C++ y el SDK de Windows; completa los
[pasos de instalación de Rust](https://doc.rust-lang.org/book/ch01-01-installation.html) antes de la
sesión.

Desde la raíz del repositorio del taller:

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Abre esta carpeta en tu editor (`code .`) y edita `src/main.rs` siguiendo las cuatro ediciones
numeradas de [LIVE_DEMO.md](LIVE_DEMO.md), Primer acto. Después ejecuta:

```shell
cargo run --locked
```

El punto de entrada sin modificar está incompleto deliberadamente; no es un Hello World funcional.
Continúa con el Segundo acto de la misma guía para el agente de pódcast. Reutiliza `src/workshop.rs`
sin editarlo.

Consulta la [preparación](../../workshop/intro-00-preflight.md) para las comprobaciones de acceso y
la solución de problemas, y la
[API oficial del SDK de Rust](https://github.com/github/copilot-sdk/tree/main/rust) como referencia.
