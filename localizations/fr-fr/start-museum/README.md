# Projets de départ Museum Exhibit Studio

Choisissez le répertoire correspondant au langage de votre atelier et travaillez directement dedans.
Après y être entré, ouvrez ce même dossier dans votre éditeur (`code .` depuis ce dossier, ou avec
la commande d'ouverture de dossier de tout autre éditeur) et gardez votre terminal à cet
emplacement. Ces projets de départ contiennent des dépendances épinglées, un point d'entrée organisé
en régions nommées, un module utilitaire de conservateur fourni et un fichier fourni contenant les
messages système. Les utilitaires contiennent toute l'infrastructure que vous n'avez jamais à
écrire : les ensembles de faits approuvés, leurs limites, et le menu qui permet à un enseignant de
les choisir ou de les saisir, l'outil local `approved_fact_lookup` fourni qui transmet ces faits au
conservateur, l'outil local `approved_wikipedia_fact_lookup` fourni qui renvoie les recherches
capturées et les citations lorsqu'une recherche utilisable existe, un afficheur de streaming, une
validation déterministe de l'exposition, le serveur MCP Wikipedia limité à sa portée et son
gestionnaire d'autorisations avec refus par défaut, l'autorisation d'écriture limitée au fichier
unique `exhibit.html`, le texte de prompt fixe (structure de l'exposition, demande de recherche et
exigences de page), la consultation de `COPILOT_MODEL`, et le message d'échec. Le fichier de
messages système contient les trois longs messages sous lesquels les sessions s'exécutent : celui du
conservateur, celui du conservateur une fois la recherche disponible, et celui de l'assistant de
recherche. Vous ne modifiez jamais les utilitaires.

Les projets de départ n'incluent **pas** les instructions du prompt de l'exposition, la
configuration de session, l'enregistrement des outils ni l'exécuteur de session. Vous les écrivez
pendant les leçons : une session, puis le streaming, puis la voix du conservateur (en installant le
message système fourni), l'enregistrement de l'outil de faits et son prompt avec un exécuteur de
session bornée, le rapport de validation, la recherche Wikipedia limitée à sa portée, et une page
`exhibit.html` interactive. Commencez par
[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md).

## Comment le point d'entrée est organisé

Le point d'entrée du projet de départ fournit la forme fixe du programme (fonction d'entrée,
gestionnaire d'erreurs, nettoyage) et un ensemble de régions nommées vides. Une région correspond à
deux commentaires de marqueur, et sa ligne `BEGIN` répertorie chaque étape qui la modifie :

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Chaque bloc de code de leçon nomme sa région et l'une des deux actions. **INSERT** signifie que la
région est vide : collez le bloc entre les lignes de marqueur. **REPLACE** signifie que la région
contient du code d'une étape précédente : supprimez tout ce qui se trouve entre les lignes de
marqueur, puis collez le bloc. Un bloc est toujours le contenu complet de sa région. Ne modifiez
jamais une ligne de marqueur ni le code en dehors des régions.

| Région | Contient | Étapes |
|---|---|---|
| `imports` | Imports | 1, puis chaque fois qu'une étape a besoin de nouveaux noms |
| `banner` | Bannière du programme | 1 |
| `choose-facts` | Appel de sélection des faits | 4 |
| `research` | Passe de recherche Wikipedia facultative | 6 |
| `generate` | Appel de génération de l'exposition | 1 à 6 |
| `validate` | Rapport de validation | 5 |
| `sources` | Sources consultées | 6 |
| `exhibit-page` | Session `exhibit.html` facultative | 7 |
| `exhibit-prompt` | Constructeur du prompt d'exposition | 4, 6 |
| `html-prompt` | Constructeur du prompt de page | 7 |
| `generation-config` | Configuration de la session de génération | 4, 6 |
| `research-config` | Configuration de la session de recherche | 6 |
| `html-config` | Configuration de la session de page | 7 |
| `session-runner` | Exécuteur de session | 4 |

L'étape 6 enregistre conditionnellement la recherche Wikipedia avec la recherche de faits approuvés
et demande au conservateur d'appeler les deux avant d'écrire le récit et les questions des
visiteurs. La recherche reste complémentaire, non vérifiée par l'enseignant ; les faits approuvés
sont prioritaires. Refuser la recherche ou ne recevoir aucun résumé cité utilisable laisse la
génération avec seulement `approved_fact_lookup`.

| Langage | Module utilitaire | Messages système | Changez de dossier, compilez et exécutez |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

L'exécution du projet de départ affiche son identité et ne démarre pas Copilot ni ne nécessite
d'authentification. Comme vous modifiez ces fichiers sur place, votre travail apparaît dans
`git status`. C'est normal. Exécutez `git checkout -- .` depuis la racine du dépôt pour restaurer un
projet de départ propre.

Chaque projet de départ épingle déjà les dépendances nécessaires à l'application terminée ; vous ne
modifiez donc jamais un manifeste de projet pendant l'atelier. Le projet de départ Rust compile le
crate de bibliothèque `museum_exhibit_studio` depuis `src/lib.rs` ; importez-en les utilitaires dans
`src/main.rs`.
