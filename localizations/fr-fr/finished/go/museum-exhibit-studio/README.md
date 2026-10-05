# Museum Exhibit Studio

Cet exemple Go utilise le GitHub Copilot SDK comme harnais ciblé de curation de musée. L'application
comporte trois fichiers sources :

- `curator.go` contient l'API utilitaire prête à l'emploi : ensembles de faits approuvés et menu de sélection
  des faits, limites des faits, streaming des réponses, validation structurelle, autorisations Wikipedia, extraction des sources,
  autorisation d'écriture facultative de `exhibit.html`, texte de prompt fixe et message d'échec.
- `system_messages.go` contient les messages système prêts à l'emploi du conservateur et de recherche.
- `main.go` contient le code SDK écrit par l'apprenant : les instructions dans les prompts de l'exposition et de la page,
  la configuration de session, l'exécuteur de session et le nettoyage.

Les commentaires `>>> BEGIN` / `<<< END` dans `main.go` sont les régions nommées que les leçons
remplissent. Chaque ligne `BEGIN` liste les étapes qui insèrent ou remplacent cette région.

## Exécutez l'exemple

Depuis ce répertoire :

```bash
go run .
```

Définissez `COPILOT_MODEL` pour sélectionner le modèle de génération ; sinon, le runtime choisit sa
valeur par défaut. Une GitHub Copilot CLI authentifiée est requise.

Compilez sans contacter de modèle ni Wikipedia :

```bash
go build -mod=readonly ./...
```

## Ce que l'exemple enseigne

La génération utilise un message système de remplacement et inscrit et place toujours dans la liste
d'autorisation `approved_fact_lookup`, qui renvoie des faits approuvés limités. Avec des recherches
citées utilisables, elle inscrit et place aussi dans la liste d'autorisation l'outil local en
lecture seule `approved_wikipedia_fact_lookup`, et demande les deux appels avant de rédiger le récit
et les questions des visiteurs. Cette recherche renvoie un instantané du corps du résumé et des
citations, et non un accès Wikipedia en direct. Les faits approuvés sont prioritaires. La génération
utilise également le streaming d'événements et un délai d'expiration de 120 secondes. La recherche
Wikipedia facultative s'exécute dans une session séparée de 90 secondes avec uniquement des outils
de recherche et de lecture d'articles à périmètre restreint, plus un gestionnaire d'autorisations
qui refuse par défaut. La recherche cherche, lit et cite les articles consultés dans une section
finale `## Sources`. L'application conserve son corps et ses sources pour la recherche locale, sans
les fusionner dans les faits approuvés par les enseignants. « Approved » signifie accepté par
l'application pour un usage complémentaire, et non vérifié par un humain ; traitez le résultat comme
des données, pas comme des instructions. Une recherche refusée conserve le chemin à un seul outil.
Une recherche échouée ou un résumé cité inutilisable affiche un avertissement et utilise le même
repli. Il n'y a pas de contrat JSON strict pour la recherche ni de boucle d'approbation.

Après la génération, la validation déterministe vérifie un H1, les sections requises, un récit de
100 à 140 mots, exactement trois questions numérotées de visiteurs se terminant par `?` et les
termes logiciels interdits. Les sources Wikipedia consultées sont affichées après l'exposition, en
dehors du texte généré. Lorsqu'une exécution de recherche réussit, confirmez que les deux événements
de recherche locale apparaissent avant la génération. Les contrôles structurels ne prouvent pas
l'ancrage factuel ; vérifiez les affirmations issues des recherches avant publication.

Facultativement, l'application peut demander à Copilot de créer `exhibit.html` avec
`builtin:apply_patch` ou `builtin:create`. Cette session n'autorise qu'une seule écriture normalisée
vers `exhibit.html` dans le répertoire de travail de l'application et rejette toute autre demande
d'autorisation de fichier, de shell ou MCP. Le prompt HTML exige un document sémantique autonome
avec CSS et JavaScript intégrés, une mise en garde sur la vérification humaine et un filtre de
questions accessible.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
