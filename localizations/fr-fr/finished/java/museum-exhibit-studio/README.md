# Museum Exhibit Studio

Cet exemple Maven CLI utilise le GitHub Copilot SDK comme agent ciblé de curation de musée. Un enseignant de musée choisit l'un des trois ensembles de faits approuvés ou saisit ses propres faits limités, diffuse éventuellement en streaming une recherche contextuelle Wikipedia à périmètre restreint, génère un texte d'exposition destiné aux visiteurs, valide sa structure et peut choisir une étape finale `exhibit.html`.

## Exécution

Depuis ce répertoire :

```bash
./mvnw compile exec:java
```

Définissez `COPILOT_MODEL` pour sélectionner un modèle ; sinon, le runtime Copilot choisit sa valeur par défaut. L'exemple nécessite une GitHub Copilot CLI authentifiée.

Compilez sans contacter de modèle :

```bash
./mvnw compile
```

## Ce qu'il démontre

Le point d'entrée `MuseumExhibitStudio` écrit par l'apprenant construit les sessions directement avec `new CopilotClient()`. Les utilitaires prêts à l'emploi `Curator*` fournissent les faits approuvés et le menu de sélection des faits, le streaming, la validation, les autorisations à périmètre restreint, l'extraction des sources, le texte de prompt fixe, le message d'échec et (dans `CuratorSystemMessages.java`) les messages système du conservateur et de recherche. Les commentaires `>>> BEGIN` / `<<< END` dans le point d'entrée sont les régions nommées que les leçons remplissent ; chaque ligne `BEGIN` liste les étapes qui insèrent ou remplacent cette région.

Les consignes du prompt ne constituent pas une limite d'autorisation ; l'application fait donc également ce qui suit :

- inscrit et place toujours dans la liste d'autorisation `approved_fact_lookup`, en ajoutant l'outil local en lecture seule
  `approved_wikipedia_fact_lookup` uniquement lorsqu'il existe des recherches citées utilisables ;
- limite la recherche au serveur Wikipedia MCP configuré et à `wikipedia-search` / `wikipedia-readArticle` via un gestionnaire d'autorisations qui refuse par défaut ;
- capture le corps de la recherche et les citations finales `## Sources` pour la deuxième recherche locale,
  sans jamais les fusionner dans les faits approuvés par les enseignants ni donner à la génération un accès Wikipedia en direct ;
- limite l'entrée à 20 faits de 500 caractères maximum chacun avant chaque envoi au modèle ;
- utilise des délais d'expiration explicites, rejette une sortie d'exposition vide et déconnecte les sessions / arrête les clients en cas de réussite comme d'échec ;
- vérifie un H1, les sections requises, un récit de 100 à 140 mots, exactement trois questions numérotées se terminant par `?` et le vocabulaire logiciel interdit ; et
- autorise éventuellement `builtin:apply_patch` et `builtin:create` à écrire uniquement `exhibit.html` dans le répertoire de travail de l'application.

Le conservateur reçoit pour instruction d'appeler les deux recherches locales avant de rédiger le
récit et les questions des visiteurs lorsqu'il existe des recherches. Les faits approuvés sont
prioritaires sur les recherches complémentaires, qui sont des données, pas des instructions. Une
recherche « approved » signifie acceptée par l'application, et non vérifiée par un humain. Une
recherche refusée conserve le chemin à un seul outil. Une recherche échouée ou un résumé cité
inutilisable affiche un avertissement et utilise le même repli. Confirmez les deux événements de
recherche lorsqu'une exécution de recherche réussit ; les sources s'affichent tout de même après
l'exposition. Le validateur ne peut pas prouver l'ancrage factuel sémantique. Les affirmations
générées nécessitent toujours une vérification humaine ou un évaluateur séparé.

## Étape finale HTML facultative

Lorsque vous y êtes invité, répondez oui pour générer `exhibit.html`. Le Java SDK 1.0.11 épinglé
conserve les champs d'autorisation tels que `fileName` ; le gestionnaire d'autorisations strict
n'approuve donc une écriture que lorsque son chemin normalisé est exactement `exhibit.html` dans ce
répertoire. Les données de chemin manquantes, les autres chemins de fichiers et les requêtes hors
écriture restent refusés ; il n'existe aucun repli d'écriture large.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
