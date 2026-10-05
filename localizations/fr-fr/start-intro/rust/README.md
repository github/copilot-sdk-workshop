# Projet de départ SDK 101 : Rust

Nécessite [Rust 1.94 ou version ultérieure](https://rustup.rs/) et un accès Copilot authentifié.
Sous Windows, la chaîne d'outils MSVC par défaut nécessite aussi les outils de build C++ et le
Windows SDK ; terminez les
[étapes d'installation de Rust](https://doc.rust-lang.org/book/ch01-01-installation.html) avant la
session.

Depuis la racine du dépôt de l'atelier :

```shell
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez `src/main.rs` en suivant les quatre
modifications numérotées dans [LIVE_DEMO.md](LIVE_DEMO.md), Acte un. Exécutez ensuite :

```shell
cargo run --locked
```

Le point d'entrée non modifié est délibérément incomplet : ce n'est pas un Hello World fonctionnel.
Poursuivez avec l'Acte deux dans le même guide pour l'agent de podcast. Réutilisez `src/workshop.rs`
sans le modifier.

Consultez la [préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et
le dépannage, ainsi que la [documentation officielle de l'API du SDK Rust](https://github.com/github/copilot-sdk/tree/main/rust)
comme référence.
