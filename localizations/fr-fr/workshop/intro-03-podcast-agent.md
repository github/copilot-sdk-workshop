# Étape 3 : Créez l'agent de podcast

> **Durée :** 12 minutes

## Continuez la même démonstration

Conservez l'application Hello World que vous venez de terminer. Suivez **Acte deux : transformez-le
en agent de podcast** dans le même **`LIVE_DEMO.md`**. Cette leçon affiche cet acte directement.

Apportez les trois changements du guide : choisissez un modèle et un véritable épisode, donnez à la
session ses capacités et son identité, puis remplacez le prompt. Réutilisez les utilitaires fournis
au lieu d'écrire un analyseur de flux ou de démarrer un autre projet.

:::language dotnet
Continuez dans `start-intro/dotnet/Program.cs`. [Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
Continuez dans `start-intro/nodejs/src/index.ts`. [Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
Continuez dans `start-intro/python/main.py`. [Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
Continuez dans `start-intro/go/main.go`. [Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
Continuez dans `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
[Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
Continuez dans `start-intro/rust/src/main.rs`. [Acte deux dans votre guide de démonstration](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## Acte deux : transformez-le en agent de podcast

<!-- LIVE_DEMO -->

## Exécutez-le

Utilisez le même dossier et la même commande d'exécution que pour Hello World. Sélectionnez un
modèle et l'un des épisodes réels. Lisez le nom de l'outil demandé avant de l'approuver avec `y`.
Appuyer sur Entrée rejette la demande ; un rejet n'est pas une recherche réussie.

Attendez-vous à la sélection du modèle, à la sélection de l'épisode, à un événement de démarrage
d'outil, à une demande d'approbation, à un événement de fin d'outil, puis au texte de lancement
diffusé en streaming.

L'application récupère la liste des épisodes avant un appel d'outil demandé par le modèle. Le
gestionnaire d'autorisations régit les outils demandés par le modèle, pas chaque requête réseau
effectuée par votre application. Conservez la gestion des événements et le nettoyage existants.

## Vérifiez votre compréhension

Repérez les deux enregistrements d'outils, leur liste d'autorisation, le gestionnaire
d'autorisations et le message système. Expliquez ce qui a changé depuis Hello World.

Comparez le résultat aux métadonnées RSS de l'épisode sélectionné. Demander une publication de moins
de 280 caractères **n'applique pas la limite dans le code**. Un message système ne prouve pas
l'exactitude factuelle ni l'absence de risque concernant les sponsors. Vérifiez les affirmations et
la longueur **avant de publier** ; ne publiez rien pendant cet atelier.

## Dépannage de cette exécution

- **Aucune liste d'épisodes :** vérifiez l'accès au flux RSS officiel ; n'utilisez pas
  de faits inventés à la place d'une recherche qui a échoué.
- **Aucune demande d'approbation :** vérifiez les deux noms d'outils, leur liste d'autorisation et le
  gestionnaire d'autorisations de remplacement.
- **En attente d'une saisie :** utilisez un terminal interactif et répondez à son prompt.
- **Recherche refusée :** réexécutez et approuvez l'outil en lecture seule attendu si c'est approprié.
  Ne supprimez pas le gestionnaire pour contourner un rejet.

Continuez avec [Récapitulatif et prochaines étapes](intro-04-wrap-up.md).

## En savoir plus

- [Copilot SDK et API d'outils](https://github.com/github/copilot-sdk)
- [Projets de départ et guides de démonstration inclus](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
