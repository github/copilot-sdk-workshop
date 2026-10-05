# Projet de départ SDK 101 : Java

Nécessite [Java 17 ou version ultérieure](https://adoptium.net/) et un accès Copilot authentifié. Le
Maven Wrapper (`./mvnw`) est inclus, aucune installation séparée de Maven n'est donc nécessaire.
Sous Windows, exécutez `mvnw.cmd` au lieu de `./mvnw`.

Depuis la racine du dépôt de l'atelier :

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez
`src/main/java/demo/CopilotSdkLiveDemo.java` en suivant les quatre modifications numérotées dans
[LIVE_DEMO.md](LIVE_DEMO.md), Acte un. Exécutez ensuite :

```shell
./mvnw compile exec:java
```

Le point d'entrée non modifié est délibérément incomplet : ce n'est pas un Hello World fonctionnel.
Poursuivez avec l'Acte deux dans le même guide pour l'agent de podcast. Réutilisez les classes
utilitaires d'outil, de sélection de modèle et d'autorisation du package `demo`.

Exécutez `./mvnw compile` pour compiler sans envoyer de prompt Copilot. Consultez la
[préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et le dépannage,
ainsi que la [documentation officielle de l'API du SDK Java](https://github.com/github/copilot-sdk/tree/main/java)
comme référence.
