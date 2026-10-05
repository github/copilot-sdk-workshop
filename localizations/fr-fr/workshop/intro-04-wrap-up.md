# Étape 4 : Récapitulatif et prochaines étapes

> **Durée :** 3 minutes

## Ce que vous avez créé

En 30 minutes de travail guidé, vous avez connecté une application à Copilot, diffusé une réponse en
streaming et donné à la session une identité ciblée et des outils de podcast en lecture seule.
L'installation et l'authentification ont eu lieu séparément pendant la préparation.

## Vérifiez votre compréhension

Expliquez l'application dans cet ordre :

1. Le **client** démarre la connexion et vérifie l'authentification.
2. La **session** contient la conversation et sa configuration.
3. Le **prompt** attribue la tâche de cet épisode.
4. Un **outil** fournit des faits RSS lorsqu'il est demandé et approuvé.
5. Les **événements** affichent la réponse et montrent l'activité des outils.
6. L'application attend la fin, signale les échecs et ferme les ressources.

## Montrez votre résultat

Montrez l'épisode sélectionné, le jalon d'appel d'outil, ainsi que le titre et la publication
obtenus. Vérifiez qu'aucun invité, sujet, sponsor ou lien n'a été inventé. Vérifiez manuellement la
longueur demandée de la publication.

Montrez ensuite la liste d'autorisation d'outils et le gestionnaire d'autorisations. Expliquez
pourquoi un message système ne remplace ni l'un ni l'autre. Vous avez créé une démonstration
d'introduction, pas prouvé que son texte généré peut être publié automatiquement en toute sécurité.

:::language dotnet
Votre travail se trouve dans `start-intro/dotnet/Program.cs`. Consultez les leçons
[Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ .NET](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md).
:::
:::language nodejs
Votre travail se trouve dans `start-intro/nodejs/src/index.ts`. Consultez les leçons
[Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ Node.js](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::
:::language python
Votre travail se trouve dans `start-intro/python/main.py`. Consultez les leçons
[Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ Python](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::
:::language go
Votre travail se trouve dans `start-intro/go/main.go`. Consultez les leçons
[Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ Go](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::
:::language java
Votre travail se trouve dans `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
Consultez les leçons [Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ Java](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::
:::language rust
Votre travail se trouve dans `start-intro/rust/src/main.rs`. Consultez les leçons
[Hello World en streaming](intro-02-hello-world.md) et
[Créez l'agent de podcast](intro-03-podcast-agent.md), ainsi que les
[notes du projet de départ Rust](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Choisissez un atelier plus approfondi

Utilisez **Hub** ci-dessus pour revenir au sélecteur d'atelier ; il conserve votre sélection de
langage. Choisissez :

- **Accessibility Reviewer (115 minutes) :** inspectez une page, combinez les conseils locaux
  avec Playwright MCP et produisez un rapport fondé sur des preuves.
- **Museum Exhibit Studio (90 minutes) :** créez un persona de conservateur, utilisez des faits approuvés,
  vérifiez la structure et ajoutez des recherches Wikipedia limitées au périmètre.

Chaque atelier plus long a sa propre préparation et son propre projet de départ. Ce sont des étapes
suivantes, pas des exigences supplémentaires pour terminer ce parcours de 30 minutes.

## En savoir plus

- [Copilot SDK officiel](https://github.com/github/copilot-sdk)
- [SDK cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Projets de départ d'introduction inclus](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
