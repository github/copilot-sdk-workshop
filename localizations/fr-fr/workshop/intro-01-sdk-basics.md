# Étape 1 : Les bases du SDK

> **Durée :** 5 minutes

## Le SDK en une phrase

Le GitHub Copilot SDK permet à votre application de démarrer une conversation Copilot, de diffuser
ses réponses en streaming et d'exposer des fonctions d'application spécifiques comme outils.

Le SDK n'est pas un modèle que vous hébergez vous-même. Votre application se connecte au **runtime
Copilot**, qui coordonne les requêtes au modèle et les appels d'outils.

| Terme | Ce qu'il fait dans cet atelier |
| --- | --- |
| Client | Démarre le runtime et s'y connecte ; vérifie l'authentification. |
| Session | Contient une conversation, sa configuration, ses messages et les résultats d'outils. |
| Prompt | Attribue une tâche pour ce tour, par exemple écrire une phrase. |
| Événement | Signale un fragment de texte, l'activité d'un outil, une erreur ou un tour terminé. |
| Outil | Fonction nommée de l'application que le modèle peut demander, par exemple une recherche RSS. |

La boucle de base est :

```text
Your app -> client -> session -> prompt
                              <- response events
Your app <- permission request <- tool request
Your app -> tool result        -> next model response
```

Un client peut prendre en charge plusieurs sessions. Pour cette introduction, créez un client et une
session par exécution du programme, puis fermez les deux. Vous n'avez pas besoin d'un serveur web,
d'un framework d'agent ni d'une base de données.

## Ouvrez l'application

Ouvrez **`LIVE_DEMO.md`** à côté du point d'entrée ci-dessous. Son **Acte un** est la séquence
pratique de cet atelier :

1. Démarrez le client.
2. Vérifiez l'authentification.
3. Créez la session.
4. Envoyez Hello World.

Le commentaire `Step 4` du projet de départ marque la gestion des événements, qui est fournie ou
indiquée dans le guide ; l'envoi est marqué `Step 5` dans le code. Ce sont des emplacements dans le
squelette, pas des exercices supplémentaires au-delà des quatre modifications du guide.

:::language dotnet
Dans votre dossier `start-intro/dotnet`, ouvrez `Program.cs`. Repérez les espaces réservés du
client, de l'authentification et de la session. Le gestionnaire d'événements affiche déjà le texte
diffusé en streaming et suit la fin du tour.
:::
:::language nodejs
Dans votre dossier `start-intro/nodejs`, ouvrez `src/index.ts`. Repérez les espaces réservés du
client, de l'authentification et de la session. Le gestionnaire d'événements montre déjà les
événements que l'application peut observer.
:::
:::language python
Dans votre dossier `start-intro/python`, ouvrez `main.py`. Repérez les espaces réservés du client,
de l'authentification et de la session. Le gestionnaire d'événements affiche déjà le texte diffusé
en streaming et signale quand le tour se termine.
:::
:::language go
Dans votre dossier `start-intro/go`, ouvrez `main.go`. Repérez les espaces réservés du client, de
l'authentification et de la session. Le gestionnaire d'événements affiche déjà le texte diffusé en
streaming et l'activité des outils.
:::
:::language java
Dans votre dossier `start-intro/java`, ouvrez `src/main/java/demo/CopilotSdkLiveDemo.java`. Repérez
les espaces réservés du client, de l'authentification et de la session. La leçon suivante montre où
ajouter les abonnements manquants en suivant le guide de démonstration.
:::
:::language rust
Dans votre dossier `start-intro/rust`, ouvrez `src/main.rs`. Repérez les espaces réservés du client,
de l'authentification et de la session. La leçon suivante montre où ajouter l'abonnement manquant en
suivant le guide de démonstration.
:::

## Ce que vous contrôlez

L'**application** choisit le modèle, l'identité de session, les outils exposés et la stratégie
d'autorisations. Le **modèle** propose du texte et des appels d'outils dans cette configuration. Le
gestionnaire d'autorisations indique si une capacité demandée peut s'exécuter.

Le streaming change la façon dont vous affichez une réponse, pas sa fiabilité. Un message système
guide le comportement ; ce n'est pas un mécanisme de contrôle d'accès ni une preuve d'exactitude
factuelle. Un outil permet à l'application de fournir de vraies données sources, mais vous vérifiez
tout de même le texte obtenu.

Lors de la première exécution, la tâche est simplement un Hello World en une phrase. Lors de la
deuxième exécution, l'application accorde deux outils RSS fournis, en lecture seule, et vous demande
d'approuver leur utilisation. Nous n'écrirons pas d'analyseur de flux ni ne configurerons MCP dans
ce parcours.

## Vérifiez votre compréhension

Montrez où le client démarrera et où la session sera créée. Expliquez la différence en une phrase :
le client se connecte au runtime ; la session est la conversation.

Continuez avec [Hello World en streaming](intro-02-hello-world.md).

## En savoir plus

- [Vue d'ensemble de Copilot SDK et API par langage](https://github.com/github/copilot-sdk)
- [Boucle d'agent du runtime](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
