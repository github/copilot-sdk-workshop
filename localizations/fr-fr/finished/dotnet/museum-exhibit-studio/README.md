# Museum Exhibit Studio

Cet exemple .NET terminé utilise le GitHub Copilot SDK pour générer une petite exposition de musée à
partir de faits approuvés. Les fichiers prêts à l'emploi `Helpers/Curator*.cs` fournissent les
ensembles de faits et le menu de sélection des faits, la vérification des limites, le streaming, la
validation déterministe, les autorisations Wikipedia à périmètre restreint, l'autorisation
d'écriture à périmètre restreint de `exhibit.html`, le texte de prompt fixe et le message d'échec,
et `Helpers/CuratorSystemMessages.cs` contient les messages système du conservateur et de recherche.
`Program.cs` reste écrit par l'apprenant : il écrit les instructions dans les prompts de
l'exposition et de la page, crée les trois configurations de session et exécute chacune d'elles avec
un même exécuteur de session.

Les commentaires `>>> BEGIN` / `<<< END` dans `Program.cs` sont les régions nommées que les leçons
remplissent. Chaque ligne `BEGIN` liste les étapes qui insèrent ou remplacent cette région ; le
fichier indique ainsi quelle étape a produit chaque élément.

## Exécutez l'exemple

Depuis la racine du dépôt :

```bash
dotnet run --project finished/dotnet/museum-exhibit-studio
```

Définissez `COPILOT_MODEL` avant l'exécution pour sélectionner un modèle. Sinon, le runtime Copilot
choisit sa valeur par défaut. L'exemple nécessite une GitHub Copilot CLI authentifiée.

Compilez sans contacter de modèle :

```bash
dotnet build finished/dotnet/museum-exhibit-studio
```

## Ce que l'exemple enseigne

La session de génération inscrit et place toujours dans la liste d'autorisation l'outil propre à
l'application `approved_fact_lookup`. Lorsqu'il existe des recherches citées utilisables, elle
inscrit et place aussi dans la liste d'autorisation `approved_wikipedia_fact_lookup`, et le prompt
demande les deux appels avant de rédiger le récit et les questions des visiteurs. Un message système
en mode remplacement donne la priorité aux faits approuvés et traite les résultats d'outil comme des
données, pas comme des instructions. `CuratorFacts.CreateApprovedFactLookup` limite ces faits avant
même que le modèle puisse les voir, `CuratorFacts.BoundFacts` tronque et valide les faits avant
chaque envoi de génération ou de recherche, et `CuratorStreamer.StreamExhibitAsync` diffuse en
streaming la sortie du modèle avec des délais d'expiration explicites.

La recherche Wikipedia facultative est volontairement légère : une session séparée expose uniquement
les outils MCP `search` et `readArticle` à périmètre restreint via
`CuratorSafety.WikipediaPermissionHandler`. Le modèle écrit des notes en prose et une liste finale
`## Sources`. L'application extrait les titres et URL des sources citées et conserve le corps du
résumé. `CuratorFacts.CreateApprovedWikipediaFactLookup` renvoie un instantané capturé de ce corps
et des citations sans accès réseau. La recherche est complémentaire et n'est jamais fusionnée avec
les faits approuvés par les enseignants ; « approved » signifie accepté par l'application, et non
vérifié par un humain. Une recherche refusée conserve le chemin à un seul outil. Une recherche
échouée ou un résumé sans citations affiche un avertissement et utilise le même repli. Les sources
s'affichent tout de même après l'exposition.

Après la génération, la validation déterministe vérifie le titre, `## Narrative`, la longueur du
récit de 100 à 140 mots, `## Visitor questions`, exactement trois questions numérotées, les points
d'interrogation et le vocabulaire interdit. Ces contrôles structurels ne prouvent pas l'ancrage
factuel ; une vérification humaine reste donc nécessaire.

L'étape finale facultative crée `exhibit.html` avec `builtin:apply_patch` ou `builtin:create`.
`CuratorSafety.ExhibitWritePermission` n'autorise que ce fichier unique dans le répertoire de
travail de l'application et rejette toute autre écriture, requête shell ou requête MCP.

## Vérification manuelle

1. Exécutez l'exemple et acceptez l'un des ensembles de faits intégrés.
2. Activez la recherche et confirmez que les deux événements de recherche locale apparaissent avant l'exposition et que les sources
   s'affichent après celle-ci. Refusez la recherche et confirmez que seul `approved_fact_lookup` est appelé.
3. Confirmez que l'exposition contient un titre, un récit de 100 à 140 mots et trois questions.
4. Confirmez que le résumé de validation et la mise en garde sur la vérification humaine sont affichés.
5. Générez éventuellement `exhibit.html` et examinez la page interactive autonome dans un navigateur.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
