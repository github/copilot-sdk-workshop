# Étape 2 : Hello World en streaming

> **Durée :** 10 minutes

## Commencez avec le projet de départ

Modifiez le point d'entrée dans le dossier `start-intro` que vous avez ouvert pendant la
préparation. Ouvrez son **`LIVE_DEMO.md`** à côté du code. Cette leçon affiche **Acte un : Hello
World** depuis ce même fichier, pas une implémentation distincte.

Suivez ses quatre modifications numérotées dans l'ordre : **démarrez le client, vérifiez
l'authentification, créez la session et envoyez Hello World**. Conservez la gestion des événements
fournie par le projet de départ ; Java et Rust incluent l'abonnement manquant à l'emplacement
marqué. Effectuez les quatre modifications avant d'exécuter le programme.

:::language dotnet
Travaillez dans `start-intro/dotnet`, en modifiant `Program.cs`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
Travaillez dans `start-intro/nodejs`, en modifiant `src/index.ts`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
Travaillez dans `start-intro/python`, en modifiant `main.py`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
Travaillez dans `start-intro/go`, en modifiant `main.go`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
Travaillez dans `start-intro/java`, en modifiant `src/main/java/demo/CopilotSdkLiveDemo.java`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
Travaillez dans `start-intro/rust`, en modifiant `src/main.rs`.
[Ouvrez le guide de démonstration local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## Acte un : Hello World

<!-- LIVE_DEMO -->

## Exécutez-le

Utilisez la commande de point de contrôle dans votre guide de démonstration, depuis le dossier du
langage sélectionné. Attendez-vous à une vraie réponse d'une phrase, diffusée en streaming, puis à
la sortie du programme. La bannière du projet de départ ou un message d'authentification seul ne
constitue pas un Hello World réussi.

La session utilise une **liste d'autorisation d'outils vide** avec un gestionnaire d'autorisations.
Tout approuver ne constitue pas en soi une barrière de sécurité ; la liste d'autorisation vide
supprime les capacités d'outils pour ce premier exercice. L'acte suivant remplace les deux
paramètres.

## Vérifiez votre compréhension

Montrez les quatre modifications que vous avez apportées. Expliquez pourquoi le client et la session
sont différents et quel événement indique que le tour est terminé.

## Dépannage de cette exécution

- **Aucune vraie réponse :** enregistrez le point d'entrée et terminez les quatre étapes du guide.
- **Erreur d'authentification :** exécutez `copilot auth login` dans le même environnement.
- **Modèle indisponible :** remplacez le modèle préféré du projet de départ par un ID disponible
  pour votre compte. L'acte suivant introduit le sélecteur de modèle.
- **Le tour se bloque :** conservez le gestionnaire d'autorisations et la liste d'autorisation vide ; vérifiez la connectivité du CLI
  et l'attente de fin de tour.

Continuez avec [Créez l'agent de podcast](intro-03-podcast-agent.md).

## En savoir plus

- [API par langage de Copilot SDK](https://github.com/github/copilot-sdk)
- [Projets de départ et guides de démonstration inclus](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
