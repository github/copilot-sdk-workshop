# Étape 4 : Connectez un outil externe en toute sécurité

> **Durée :** 20 minutes

## Ce que vous allez connecter

Vous allez démarrer Playwright via MCP, limiter la navigation à la cible de l'atelier que vous
fournissez, inspecter son arbre d'accessibilité et signaler le titre de la page.

## Découvrez MCP et sa frontière de confiance

Le [**Model Context Protocol (MCP)**](https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md)
est une méthode standard pour connecter un agent à des capacités réutilisables implémentées en
dehors de votre application. Dans cet atelier, le SDK démarre le serveur MCP Playwright comme un
processus `npx` séparé. Playwright gère l'automatisation du navigateur, tandis que votre application
configure la connexion.

La frontière de processus est aussi une **frontière de confiance**. Un
[gestionnaire d'autorisations](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
est un callback que le runtime invoque avant l'exécution d'une action demandée, et il décide si
chaque action externe peut continuer.

| Question | Outil WCAG local | Playwright MCP |
|---|---|---|
| Qui l'implémente ? | Cette application | Package Playwright externe |
| Où s'exécute-t-il ? | Même processus d'application | Processus Node.js séparé |
| Pour quoi est-il le mieux adapté ? | Données détenues par l'application et logique déterministe | Capacité de navigateur réutilisable |
| Comment la confiance est-elle gérée ici ? | L'outil en lecture seule ignore l'autorisation | La liste d'outils et le gestionnaire personnalisé restreignent l'accès |

La recherche WCAG et le lecteur d'instantanés limité restent dans le processus.
`CopilotSession -> Playwright MCP -> browser` franchit une frontière de processus.

## Placez Playwright derrière des garde-fous

L'argument de navigateur utilise Microsoft Edge, la valeur par défaut de l'atelier. Si vous avez
préparé Google Chrome à la place, utilisez `--browser=chrome`.

La liste d'autorisation d'outils de la session exclut les outils de runtime sans rapport. La liste
d'outils du serveur MCP expose uniquement la navigation. Dans Playwright MCP 0.0.78, la navigation
écrit son arbre d'accessibilité automatique dans `.playwright-mcp/`. Le lecteur d'instantanés de
l'application n'accepte aucun argument et lit uniquement le plus récent instantané Playwright créé
après le démarrage de la session.

`browser_snapshot` reste absent des deux listes d'autorisation parce que son argument facultatif
`filename` peut écrire un fichier. Le runtime peut autoriser automatiquement les outils MCP annotés
comme étant en lecture seule sans appeler votre délégué d'autorisation ; un gestionnaire ne peut
donc pas nettoyer cet argument de façon fiable. Supprimer l'outil retire la capacité au lieu de
s'appuyer sur un prompt.

Le lecteur n'accepte aucun chemin. Il ignore les fichiers préexistants, les fichiers imbriqués, les
liens symboliques, les fichiers vides et les instantanés de plus de 1 MB. La navigation est
approuvée uniquement lorsque l'URL canonique complète correspond à la cible fournie au démarrage. Le
schéma et l'hôte utilisent une comparaison insensible à la casse conforme au standard des URL. Le
chemin, la requête et le fragment doivent correspondre en respectant la casse.

Le gestionnaire renvoie exactement une décision par requête, et celle-ci a besoin de deux des types
disponibles. `approve-once` autorise cette seule requête. `reject` la refuse et peut transmettre un
message de retour au modèle ; ainsi, un appel refusé revient avec une raison au lieu d'un échec
silencieux. Deux autres types existent pour des situations que cet atelier n'atteint pas :
`user-not-available` refuse parce qu'aucun utilisateur n'est présent pour confirmer, et `no-result`
décline toute réponse afin qu'un autre client connecté puisse répondre à la requête à la place. Les
portées d'approbation plus larges — `approve-for-session`, `approve-for-location` et
`approve-permanently` — mémorisent une décision au-delà de ce seul appel. Chaque SDK écrit toutes
ces valeurs selon sa propre convention de nommage.

:::language dotnet
## Configurez l'accès Playwright limité en C#

### 1. Acceptez une seule cible contrôlée

En haut de `Program.cs`, après les instructions `using` et avant la bannière, insérez :

```csharp
if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}
```

### 2. Inspectez le gestionnaire d'autorisations fourni

Ouvrez `Helpers/WorkshopPermissionHandler.cs`. Le gestionnaire fourni renvoie une approbation
ponctuelle uniquement pour la navigation vers la cible exacte. Toute autre requête externe est
rejetée.

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows Playwright to navigate only to the exact requested target.")
        };

        return Task.FromResult(decision);
    };
}
```

Le SDK .NET préfixe actuellement les noms d'outils d'autorisation MCP avec le nom du serveur (par
exemple, `playwright-browser_navigate`), tandis que la configuration MCP utilise `browser_navigate`.
`IsPlaywrightTool` accepte ces deux formes exactes plutôt que d'utiliser un caractère générique
large.

> **Note du SDK :** la version 1.0.7 inclut `PermissionHandler.ApproveAll`, mais aucun gestionnaire limité intégré.
> Le projet de départ inclut donc un délégué écrit à la main. `PermissionDecision` est actuellement marqué
> comme réservé à l'évaluation ; cet utilitaire contient donc une suppression `GHCP001` localisée.

### 3. Inspectez la limite du lecteur d'instantanés fourni

Ouvrez `Helpers/PlaywrightSnapshotReader.cs`. Le lecteur capture les instantanés existants lorsque
l'outil est créé, n'accepte aucun argument fourni par le modèle, sélectionne uniquement un nouvel
enfant direct nommé `page-*.yml`, rejette les liens symboliques et les fichiers trop volumineux,
puis renvoie le texte.

```csharp
public static AIFunction CreateTool(string workingDirectory)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(workingDirectory);

    var outputDirectory = Path.GetFullPath(Path.Combine(workingDirectory, ".playwright-mcp"));
    var existingSnapshots = Directory.Exists(outputDirectory)
        ? Directory.EnumerateFiles(outputDirectory, "page-*.yml", SearchOption.TopDirectoryOnly)
            .Select(Path.GetFullPath)
            .ToHashSet(PathComparer)
        : new HashSet<string>(PathComparer);

    return CopilotTool.DefineTool(
        () => Task.FromResult(ReadLatestSnapshot(outputDirectory, existingSnapshots)),
        toolOptions: new CopilotToolOptions { SkipPermission = true },
        factoryOptions: new AIFunctionFactoryOptions
        {
            Name = "read_latest_accessibility_snapshot",
            Description = "Reads the newest Playwright accessibility snapshot created during this run."
        });
}
```

L'adaptateur ignore l'autorisation parce qu'il est en lecture seule, utilise un stockage sélectionné
par l'application et est implémenté par l'application. C'est une capacité plus restreinte qu'un
lecteur de fichiers général.

### 4. Ajoutez Playwright MCP et des autorisations limitées

Remplacez la configuration de session par :

```csharp
var workingDirectory = Directory.GetCurrentDirectory();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri),
    Tools =
    [
        AccessibilityRuleCatalog.CreateLookupTool(),
        PlaywrightSnapshotReader.CreateTool(workingDirectory)
    ],
    AvailableTools =
    [
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate"
    ],
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["playwright"] = new McpStdioServerConfig
        {
            Command = "npx",
            Args = ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
            WorkingDirectory = workingDirectory,
            Tools = ["browser_navigate"]
        }
    }
});
```

### 5. Demandez des preuves du navigateur

Remplacez l'appel d'envoi final :

```csharp
Console.WriteLine($"\nInspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and report the page title
    plus one sentence describing its main content.
    """);
```

## Exécutez-le

```bash
dotnet run -- "{{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright.

Recherchez :

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True

Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Utilisez l'URL cible exacte ci-dessus. Le gestionnaire refuse intentionnellement les autres URL et outils. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| Le compilateur ne trouve pas l'utilitaire d'autorisations | Vérifiez que `using HelloCopilotSDK.Helpers;` est présent et que le fichier utilitaire est dans le projet. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}

Console.WriteLine("=== Scoped Playwright MCP access ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

var workingDirectory = Directory.GetCurrentDirectory();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri),
    Tools =
    [
        AccessibilityRuleCatalog.CreateLookupTool(),
        PlaywrightSnapshotReader.CreateTool(workingDirectory)
    ],
    AvailableTools =
    [
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate"
    ],
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["playwright"] = new McpStdioServerConfig
        {
            Command = "npx",
            Args = ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
            WorkingDirectory = workingDirectory,
            Tools = ["browser_navigate"]
        }
    }
});

Console.WriteLine($"Inspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and return the page title
    plus one sentence describing its main content.
    """);
```

</details>
:::

:::language nodejs
## Configurez l'accès Playwright à portée limitée en TypeScript

### 1. Acceptez une seule cible contrôlée

En haut de `src/index.ts`, remplacez la configuration du point d'entrée par :

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import {
  accessibilityRuleLookup,
  createSnapshotReader,
  permissionForTarget,
  streamResponse,
} from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("Enter an absolute HTTP or HTTPS URL.");
}
```

### 2. Inspectez le gestionnaire d'autorisations fourni

Ouvrez `src/workshop.ts`. Le gestionnaire fourni approuve uniquement la navigation Playwright vers la cible exacte :

```typescript
export function permissionForTarget(target: URL): PermissionHandler {
  return (request) => {
    if (
      request.kind === "mcp" &&
      request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" ||
        request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" &&
      sameUrl(request.args.url, target)
    ) {
      return { kind: "approve-once" };
    }
    return {
      kind: "reject",
      feedback:
        "This workshop allows Playwright to navigate only to the exact requested target.",
    };
  };
}

function sameUrl(requested: string, allowed: URL): boolean {
  try {
    const parsed = new URL(requested);
    return (
      parsed.protocol.toLowerCase() === allowed.protocol.toLowerCase() &&
      parsed.hostname.toLowerCase() === allowed.hostname.toLowerCase() &&
      parsed.port === allowed.port &&
      parsed.username === allowed.username &&
      parsed.password === allowed.password &&
      parsed.pathname === allowed.pathname &&
      parsed.search === allowed.search &&
      parsed.hash === allowed.hash
    );
  } catch {
    return false;
  }
}
```

Acceptez à la fois `browser_navigate` et `playwright-browser_navigate`, car le runtime peut préfixer
le nom du serveur dans les demandes d'autorisation.

### 3. Inspectez la limite du lecteur d'instantanés fourni

Toujours dans `src/workshop.ts`, le lecteur d'instantané capture les fichiers existants au moment de
sa création et n'accepte aucun chemin fourni par le modèle :

```typescript
export function createSnapshotReader(workingDirectory: string) {
  const outputDirectory = resolve(workingDirectory, ".playwright-mcp");
  const existingSnapshots = safeSnapshotNames(outputDirectory).then(
    (names) => new Set(names.map((name) => resolve(outputDirectory, name))),
  );
  return defineTool("read_latest_accessibility_snapshot", {
    description:
      "Reads the newest Playwright accessibility snapshot created during this run.",
    parameters: z.object({}),
    skipPermission: true,
    handler: async () => {
      const baseline = await existingSnapshots;
      const candidates = await Promise.all(
        (await safeSnapshotNames(outputDirectory)).map(async (name) => {
          const path = resolve(outputDirectory, name);
          const details = await lstat(path);
          return { path, details };
        }),
      );
      const snapshot = candidates
        .filter(
          ({ path, details }) =>
            !baseline.has(path) &&
            !details.isSymbolicLink() &&
            details.isFile() &&
            details.size > 0 &&
            details.size <= maxSnapshotBytes,
        )
        .sort((left, right) => right.details.mtimeMs - left.details.mtimeMs)[0];
      if (!snapshot) {
        throw new Error(
          "No current-run Playwright snapshot is available. Call browser_navigate first.",
        );
      }
      return readFile(snapshot.path, "utf8");
    },
  });
}
```

### 4. Ajoutez Playwright MCP et des autorisations limitées

Dans `src/index.ts`, créez la session avec la liste d'autorisation à trois outils et Playwright MCP :

```typescript
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: [
      "accessibility_rule_lookup",
      "read_latest_accessibility_snapshot",
      "playwright-browser_navigate",
    ],
    mcpServers: {
      playwright: {
        command: "npx",
        args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
        workingDirectory: process.cwd(),
        tools: ["browser_navigate"],
      },
    },
  });
  try {
    await streamResponse(
      session,
      `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`,
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`availableTools` utilise le nom MCP préfixé par le runtime `playwright-browser_navigate`, tandis que
la configuration du serveur MCP indique toujours `browser_navigate` sans préfixe.

## Exécutez-le

```bash
npm start -- "{{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright.

Recherchez :

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true

Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Utilisez l'URL cible exacte ci-dessus. Le gestionnaire refuse intentionnellement les autres URL et outils. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| TypeScript ne peut pas résoudre les utilitaires | Vérifiez que le chemin d'importation se termine par `.js` et exécutez `npm install` dans le dossier du projet de départ. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try {
    await streamResponse(session, `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

</details>
:::

:::language python
## Configurez l'accès Playwright à portée limitée en Python

### 1. Acceptez une seule cible contrôlée

Au début de `main.py`, validez l'URL de démarrage :

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
)

from workshop import (
    accessibility_rule_lookup,
    create_snapshot_reader,
    permission_for_target,
)


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
```

### 2. Inspectez le gestionnaire d'autorisations fourni

Ouvrez `workshop.py`. Le gestionnaire fourni approuve uniquement la navigation Playwright vers la cible exacte :

```python
def permission_for_target(target: str):
    def handler(request, _invocation):
        if (
            getattr(request, "kind", None) == "mcp"
            and request.server_name == "playwright"
            and request.tool_name
            in {"browser_navigate", "playwright-browser_navigate"}
            and isinstance(request.args, dict)
            and isinstance(request.args.get("url"), str)
            and _same_url(request.args["url"], target)
        ):
            return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback=(
                "This workshop allows Playwright to navigate only to the exact requested target."
            )
        )

    return handler


def _same_url(requested: str, allowed: str) -> bool:
    try:
        left, right = urlsplit(requested), urlsplit(allowed)
        return (
            left.scheme.lower(),
            left.hostname.lower() if left.hostname else "",
            left.port,
            left.username,
            left.password,
            left.path,
            left.query,
            left.fragment,
        ) == (
            right.scheme.lower(),
            right.hostname.lower() if right.hostname else "",
            right.port,
            right.username,
            right.password,
            right.path,
            right.query,
            right.fragment,
        )
    except ValueError:
        return False
```

### 3. Inspectez la limite du lecteur d'instantanés fourni

Toujours dans `workshop.py`, le lecteur d'instantané capture les fichiers existants au moment de sa
création et n'accepte aucun chemin fourni par le modèle :

```python
def create_snapshot_reader(working_directory: str):
    output_directory = Path(working_directory, ".playwright-mcp").resolve()
    existing = (
        {path.resolve() for path in output_directory.glob("page-*.yml")}
        if output_directory.is_dir()
        else set()
    )

    @define_tool(
        name="read_latest_accessibility_snapshot",
        description=(
            "Reads the newest Playwright accessibility snapshot created during this run."
        ),
        skip_permission=True,
    )
    def read_latest_accessibility_snapshot() -> str:
        candidates = [
            path
            for path in output_directory.glob("page-*.yml")
            if path.resolve() not in existing
            and not path.is_symlink()
            and path.is_file()
            and 0 < path.stat().st_size <= MAX_SNAPSHOT_BYTES
        ]
        if not candidates:
            raise FileNotFoundError(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
            )
        return max(candidates, key=lambda path: path.stat().st_mtime).read_text(
            encoding="utf-8"
        )

    return read_latest_accessibility_snapshot
```

### 4. Ajoutez Playwright MCP et des autorisations limitées

Remplacez le bloc de création de session dans `main.py` :

```python
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=[
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate",
            ],
            mcp_servers={
                "playwright": {
                    "command": "npx",
                    "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
                    "working_directory": ".",
                    "tools": ["browser_navigate"],
                }
            },
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(
                f"Use browser_navigate to open {target}, then "
                "read_latest_accessibility_snapshot and report the page title."
            )
            await done.wait()
            if error is not None:
                raise error
```

`available_tools` utilise le nom MCP préfixé par le runtime `playwright-browser_navigate`, tandis
que la configuration du serveur MCP indique toujours `browser_navigate` sans préfixe.

## Exécutez-le

```bash
python main.py "{{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright.

Cherchez l'activité de navigation et d'instantané, puis un titre de page tel que :

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Utilisez l'URL cible exacte ci-dessus. Le gestionnaire refuse intentionnellement les autres URL et outils. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| Erreurs d'importation pour les utilitaires de l'atelier | Activez l'environnement virtuel de préparation et vérifiez que `workshop.py` se trouve à côté de `main.py`. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

`main.py`:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
            mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}},
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(f"Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Configurez l'accès Playwright à portée limitée en Go

### 1. Acceptez une seule cible contrôlée

Au début de `main` dans `main.go`, validez l'URL de démarrage :

```go
if len(os.Args) != 2 {
	fmt.Fprintln(os.Stderr, "Usage: go run . <http-or-https-url>")
	return
}
target := os.Args[1]
if !strings.Contains(target, "://") {
	target = "https://" + target
}
parsed, err := url.ParseRequestURI(target)
if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
	fmt.Fprintln(os.Stderr, "Enter an absolute HTTP or HTTPS URL.")
	return
}
```

### 2. Ajoutez le gestionnaire d'autorisations

Avant `main`, ajoutez la correspondance d'URL exacte et le gestionnaire d'autorisations :

```go
func sameURL(requested, allowed string) bool {
	left, leftErr := url.Parse(requested)
	right, rightErr := url.Parse(allowed)
	userInfo := func(value *url.Userinfo) string {
		if value == nil {
			return ""
		}
		return value.String()
	}
	return leftErr == nil && rightErr == nil &&
		strings.EqualFold(left.Scheme, right.Scheme) &&
		strings.EqualFold(left.Hostname(), right.Hostname()) &&
		left.Port() == right.Port() &&
		userInfo(left.User) == userInfo(right.User) &&
		left.EscapedPath() == right.EscapedPath() &&
		left.RawQuery == right.RawQuery &&
		left.Fragment == right.Fragment
}

func permissionForTarget(target string) copilot.PermissionHandlerFunc {
	return func(request copilot.PermissionRequest, _ copilot.PermissionInvocation) (rpc.PermissionDecision, error) {
		raw, _ := json.Marshal(request)
		var value map[string]any
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "mcp" && value["serverName"] == "playwright" {
			toolName, _ := value["toolName"].(string)
			args, _ := value["args"].(map[string]any)
			requested, _ := args["url"].(string)
			if (toolName == "browser_navigate" || toolName == "playwright-browser_navigate") && sameURL(requested, target) {
				return &rpc.PermissionDecisionApproveOnce{}, nil
			}
		}
		feedback := "This workshop allows Playwright to navigate only to the exact requested target."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

Acceptez les noms d'outils Playwright avec et sans préfixe dans le chemin d'autorisation.

### 3. Ajoutez la limite du lecteur d'instantané

Toujours avant `main`, ajoutez le lecteur d'instantané sans argument :

```go
const maxSnapshotBytes = 1_000_000

func snapshotReader(workingDirectory string) func(struct{}, copilot.ToolInvocation) (string, error) {
	outputDirectory := filepath.Join(workingDirectory, ".playwright-mcp")
	existing := map[string]struct{}{}
	if entries, err := os.ReadDir(outputDirectory); err == nil {
		for _, entry := range entries {
			if strings.HasPrefix(entry.Name(), "page-") && strings.HasSuffix(entry.Name(), ".yml") {
				existing[filepath.Join(outputDirectory, entry.Name())] = struct{}{}
			}
		}
	}

	return func(_ struct{}, _ copilot.ToolInvocation) (string, error) {
		entries, err := os.ReadDir(outputDirectory)
		if err != nil {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		type candidate struct {
			path string
			mod  time.Time
		}
		var candidates []candidate
		for _, entry := range entries {
			path := filepath.Join(outputDirectory, entry.Name())
			info, err := entry.Info()
			if _, existed := existing[path]; existed || err != nil || entry.IsDir() ||
				entry.Type()&os.ModeSymlink != 0 || !info.Mode().IsRegular() ||
				info.Size() == 0 || info.Size() > maxSnapshotBytes ||
				!strings.HasPrefix(entry.Name(), "page-") || !strings.HasSuffix(entry.Name(), ".yml") {
				continue
			}
			candidates = append(candidates, candidate{path, info.ModTime()})
		}
		if len(candidates) == 0 {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		sort.Slice(candidates, func(i, j int) bool { return candidates[i].mod.Before(candidates[j].mod) })
		contents, err := os.ReadFile(candidates[len(candidates)-1].path)
		return string(contents), err
	}
}
```

### 4. Ajoutez Playwright MCP et des autorisations limitées

Dans `main`, définissez les deux outils locaux et remplacez la configuration de session :

```go
workingDirectory, err := os.Getwd()
if err != nil {
	panic(err)
}
lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
lookup.SkipPermission = true
readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
readSnapshot.SkipPermission = true

client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{lookup, readSnapshot},
	AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"},
	OnPermissionRequest: permissionForTarget(target),
	MCPServers: map[string]copilot.MCPServerConfig{
		"playwright": copilot.MCPStdioServerConfig{
			Command:          "npx",
			Args:             []string{"-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"},
			WorkingDirectory: workingDirectory,
			Tools:            []string{"browser_navigate"},
		},
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

Ajoutez les imports utilisés par les nouveaux utilitaires : `encoding/json`, `net/url`,
`path/filepath`, `sort`, `time` et `"github.com/github/copilot-sdk/go/rpc"`.

## Exécutez-le

```bash
go run . "{{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright.

Cherchez un titre de page tel que :

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Utilisez l'URL cible exacte ci-dessus. Le gestionnaire refuse intentionnellement les autres URL et outils. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| Imports manquants | Ajoutez `encoding/json`, `net/url`, `path/filepath`, `sort`, `time` et le package `rpc`. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

Câblage de session de `main.go` :

```go
workingDirectory, err := os.Getwd()
if err != nil {
	panic(err)
}
lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
lookup.SkipPermission = true
readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
readSnapshot.SkipPermission = true

client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{lookup, readSnapshot},
	AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"},
	OnPermissionRequest: permissionForTarget(target),
	MCPServers: map[string]copilot.MCPServerConfig{
		"playwright": copilot.MCPStdioServerConfig{
			Command:          "npx",
			Args:             []string{"-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"},
			WorkingDirectory: workingDirectory,
			Tools:            []string{"browser_navigate"},
		},
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

</details>
:::

:::language rust
## Configurez l'accès Playwright à portée limitée en Rust

### 1. Acceptez une seule cible contrôlée

Au début de `main` dans `src/main.rs`, validez l'URL de démarrage :

```rust
let argument = std::env::args()
    .nth(1)
    .ok_or("Usage: cargo run -- <http-or-https-url>")?;
let target_text = if argument.contains("://") {
    argument
} else {
    format!("https://{argument}")
};
let target = Url::parse(&target_text)?;
if !matches!(target.scheme(), "http" | "https") || target.host_str().is_none() {
    return Err("Enter an absolute HTTP or HTTPS URL.".into());
}
```

### 2. Ajoutez le gestionnaire d'autorisations

Ajoutez le gestionnaire d'autorisations à cible exacte avant `main` :

```rust
struct ScopedPermissions {
    target: Url,
}

fn permission_payload(
    extra: &serde_json::Value,
) -> Option<&serde_json::Map<String, serde_json::Value>> {
    match extra.get("permissionRequest") {
        Some(request) => request.as_object(),
        None => extra.as_object(),
    }
}

#[async_trait]
impl PermissionHandler for ScopedPermissions {
    async fn handle(
        &self,
        _session_id: SessionId,
        _request_id: RequestId,
        request: PermissionRequestData,
    ) -> PermissionResult {
        let payload = permission_payload(&request.extra);
        let server = payload
            .and_then(|payload| payload.get("serverName"))
            .and_then(serde_json::Value::as_str);
        let tool = payload
            .and_then(|payload| payload.get("toolName"))
            .and_then(serde_json::Value::as_str);
        let requested = payload
            .and_then(|payload| payload.get("args"))
            .and_then(|args| args.get("url"))
            .and_then(serde_json::Value::as_str)
            .and_then(|value| Url::parse(value).ok());
        if server == Some("playwright")
            && matches!(
                tool,
                Some("browser_navigate" | "playwright-browser_navigate")
            )
            && requested
                .as_ref()
                .is_some_and(|url| same_url(url, &self.target))
        {
            PermissionResult::approve_once()
        } else {
            PermissionResult::reject(Some(
                "This workshop allows Playwright to navigate only to the exact requested target."
                    .to_owned(),
            ))
        }
    }
}

fn same_url(left: &Url, right: &Url) -> bool {
    left.scheme().eq_ignore_ascii_case(right.scheme())
        && left
            .host_str()
            .unwrap_or_default()
            .eq_ignore_ascii_case(right.host_str().unwrap_or_default())
        && left.port() == right.port()
        && left.username() == right.username()
        && left.password() == right.password()
        && left.path() == right.path()
        && left.query() == right.query()
        && left.fragment() == right.fragment()
}
```

### 3. Ajoutez la limite du lecteur d'instantané

Ajoutez le lecteur d'instantané sans argument avant `main` :

```rust
const MAX_SNAPSHOT_BYTES: u64 = 1_000_000;

struct SnapshotReader {
    output_directory: PathBuf,
    existing: HashSet<PathBuf>,
}

impl SnapshotReader {
    fn new(working_directory: &Path) -> Self {
        let output_directory = working_directory.join(".playwright-mcp");
        let existing = std::fs::read_dir(&output_directory)
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let name = entry.file_name();
                let name = name.to_string_lossy();
                (name.starts_with("page-") && name.ends_with(".yml")).then(|| entry.path())
            })
            .collect();
        Self {
            output_directory,
            existing,
        }
    }
}

#[async_trait]
impl ToolHandler for SnapshotReader {
    async fn call(&self, _invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let entries =
            match std::fs::read_dir(&self.output_directory) {
                Ok(entries) => entries,
                Err(_) => return Ok(ToolResult::Text(
                    "No current-run Playwright snapshot is available. Call browser_navigate first."
                        .to_owned(),
                )),
            };
        let newest = entries
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                let name = entry.file_name();
                let name = name.to_string_lossy();
                let metadata = std::fs::symlink_metadata(&path).ok()?;
                (!self.existing.contains(&path)
                    && name.starts_with("page-")
                    && name.ends_with(".yml")
                    && !metadata.file_type().is_symlink()
                    && metadata.is_file()
                    && metadata.len() > 0
                    && metadata.len() <= MAX_SNAPSHOT_BYTES)
                    .then_some((metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH), path))
            })
            .max_by_key(|(modified, _)| *modified);
        let Some((_, path)) = newest else {
            return Ok(ToolResult::Text(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
                    .to_owned(),
            ));
        };
        match std::fs::read_to_string(path) {
            Ok(contents) => Ok(ToolResult::Text(contents)),
            Err(_) => Ok(ToolResult::Text(
                "The current-run Playwright snapshot could not be read.".to_owned(),
            )),
        }
    }
}
```

### 4. Ajoutez Playwright MCP et des autorisations limitées

Dans `main`, définissez les deux outils locaux, configurez MCP et installez le gestionnaire d'autorisations :

```rust
let working_directory = std::env::current_dir()?;
let lookup = Tool::new("accessibility_rule_lookup")
    .with_description("Looks up read-only WCAG guidance maintained by this application.")
    .with_parameters(schema_for::<LookupParams>())
    .with_skip_permission(true)
    .with_handler(Arc::new(AccessibilityRuleLookup));
let reader = Tool::new("read_latest_accessibility_snapshot")
    .with_description(
        "Reads the newest Playwright accessibility snapshot created during this run.",
    )
    .with_parameters(
        serde_json::json!({"type": "object", "properties": {}, "additionalProperties": false}),
    )
    .with_skip_permission(true)
    .with_handler(Arc::new(SnapshotReader::new(&working_directory)));

let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup, reader]);
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
]);
config.mcp_servers = Some(IndexMap::from([(
    "playwright".to_owned(),
    McpServerConfig::Stdio(McpStdioServerConfig {
        command: "npx".to_owned(),
        args: vec![
            "-y".to_owned(),
            "@playwright/mcp@0.0.78".to_owned(),
            "--browser=msedge".to_owned(),
            "--output-dir".to_owned(),
            ".playwright-mcp".to_owned(),
            "--output-mode".to_owned(),
            "file".to_owned(),
        ],
        tools: Some(vec!["browser_navigate".to_owned()]),
        working_directory: Some(working_directory.display().to_string()),
        ..Default::default()
    }),
)]));
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
}));

let client = Client::start(ClientOptions::default()).await?;
let session = client.create_session(config).await?;
stream_response!(
    session,
    format!(
        "Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title."
    )
);
session.disconnect().await?;
client.stop().await?;
```

Ajoutez les imports utilisés par les nouveaux utilitaires, notamment
`github_copilot_sdk::handler::{PermissionHandler, PermissionResult}`, `McpServerConfig`,
`McpStdioServerConfig`, `PermissionRequestData`, `PermissionRequestKind`, `RequestId`, `SessionId`,
`indexmap::IndexMap` et `url::Url`.

## Exécutez-le

```bash
cargo run -- "{{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright.

Cherchez un titre de page tel que :

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Utilisez l'URL cible exacte ci-dessus. Le gestionnaire refuse intentionnellement les autres URL et outils. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| Trait ou type non résolu | Conservez les imports d'autorisations, MCP, `IndexMap` et `Url` indiqués ci-dessus. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

Câblage de session depuis `src/main.rs` :

```rust
let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup, reader]);
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
]);
config.mcp_servers = Some(IndexMap::from([(
    "playwright".to_owned(),
    McpServerConfig::Stdio(McpStdioServerConfig {
        command: "npx".to_owned(),
        args: vec![
            "-y".to_owned(),
            "@playwright/mcp@0.0.78".to_owned(),
            "--browser=msedge".to_owned(),
            "--output-dir".to_owned(),
            ".playwright-mcp".to_owned(),
            "--output-mode".to_owned(),
            "file".to_owned(),
        ],
        tools: Some(vec!["browser_navigate".to_owned()]),
        working_directory: Some(working_directory.display().to_string()),
        ..Default::default()
    }),
)]));
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
}));

let client = Client::start(ClientOptions::default()).await?;
let session = client.create_session(config).await?;
stream_response!(session, mcp_safety_prompt(&target));
```

</details>
:::

:::language java
## Configurez l'accès Playwright à portée limitée en Java

### 1. Acceptez une seule cible contrôlée

Au début de `main` dans `src/main/java/workshop/AccessibilityReport.java`, validez l'URL de
démarrage :

```java
RunOptions options = parseRunOptions(args);
URI target = options.target();
Path workingDirectory = Path.of("").toAbsolutePath().normalize();
if (options.allowLocalDemoMcp()) {
    System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
            + "so this run approves only the mcp permission kind, not an exact target. "
            + "Use only with the controlled workshop target.");
}
```

Ajoutez l'utilitaire d'analyse :

```java
private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme())
                    || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}
```

### 2. Ajoutez le gestionnaire d'autorisations

Approuvez uniquement la navigation Playwright vers la cible exacte dans la configuration de session :

```java
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    // SDK issue #2273 currently prevents inspecting MCP request fields for the exact check.
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows Playwright to navigate only to the exact requested target. "
                            + "MCP requests without target data remain denied unless the explicit "
                            + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
})
```

> **Limitation temporaire du SDK Java et solution de secours pour la démonstration locale :** Par défaut, le comportement refuse en cas d'échec : il
> approuve uniquement une demande `mcp` dont la charge utile prouve que la navigation Playwright configurée est
> l'URL saisie exacte. Les versions actuelles du SDK Java n'exposent pas ces champs de demande MCP
> ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)), donc le
> chemin par défaut rejette cette demande plutôt que de deviner. Pour la cible contrôlée de l'atelier uniquement,
> passez `--allow-local-demo-mcp`. Cet indicateur explicite approuve une demande `mcp` à la fois ; il n'utilise
> **pas** `APPROVE_ALL`, et la configuration MCP expose toujours uniquement Playwright
> `browser_navigate`. Il ne peut pas faire respecter l'URL exacte tant que la charge utile du SDK n'est pas disponible. Ne
> l'activez jamais pour une cible de production, partagée ou non fiable.

Ajoutez cet analyseur d'option à côté de `parseTarget` :

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
        } else if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp);
}

private static String usage() {
    return "Usage: ./mvnw compile exec:java -Dexec.args=\"["
            + LOCAL_DEMO_MCP_FLAG + "] <http-or-https-url>\"";
}

private record RunOptions(URI target, boolean allowLocalDemoMcp) {
}
```

Ajoutez les utilitaires de correspondance d'URL :

```java
private static boolean isExactNavigation(Map<String, Object> request, URI target) {
    if (request == null
            || !"playwright".equals(request.get("serverName"))
            || !(request.get("toolName") instanceof String toolName)
            || !("browser_navigate".equals(toolName)
                    || "playwright-browser_navigate".equals(toolName))
            || !(request.get("args") instanceof Map<?, ?> args)
            || !(args.get("url") instanceof String requested)) {
        return false;
    }
    try {
        return sameUrl(new URI(requested), target);
    } catch (URISyntaxException ignored) {
        return false;
    }
}

private static boolean sameUrl(URI requested, URI allowed) {
    return equalsIgnoreCase(requested.getScheme(), allowed.getScheme())
            && equalsIgnoreCase(requested.getHost(), allowed.getHost())
            && requested.getPort() == allowed.getPort()
            && java.util.Objects.equals(requested.getRawUserInfo(), allowed.getRawUserInfo())
            && java.util.Objects.equals(requested.getRawPath(), allowed.getRawPath())
            && java.util.Objects.equals(requested.getRawQuery(), allowed.getRawQuery())
            && java.util.Objects.equals(requested.getRawFragment(), allowed.getRawFragment());
}

private static boolean equalsIgnoreCase(String left, String right) {
    return left == null ? right == null : right != null && left.equalsIgnoreCase(right);
}
```

### 3. Ajoutez la limite du lecteur d'instantané

Enregistrez un lecteur d'instantané sans argument qui renvoie uniquement les fichiers Playwright de l'exécution en cours :

```java
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);
```

Ajoutez la classe de lecteur imbriquée :

```java
private static final class SnapshotReader {
    private final Path outputDirectory;
    private final Set<Path> existing;

    private SnapshotReader(Path workingDirectory) throws IOException {
        outputDirectory = workingDirectory.resolve(".playwright-mcp").normalize();
        existing = new HashSet<>();
        if (Files.isDirectory(outputDirectory, LinkOption.NOFOLLOW_LINKS)) {
            try (Stream<Path> paths = Files.list(outputDirectory)) {
                paths.filter(SnapshotReader::isSnapshotName).forEach(existing::add);
            }
        }
    }

    private String read() {
        try (Stream<Path> paths = Files.list(outputDirectory)) {
            Path newest = paths
                    .filter(path -> !existing.contains(path))
                    .filter(SnapshotReader::isSnapshotName)
                    .filter(path -> !Files.isSymbolicLink(path))
                    .filter(SnapshotReader::isSafeSnapshot)
                    .max(Comparator.comparing(this::modifiedTime))
                    .orElseThrow(() -> new IllegalStateException(
                            "No current-run Playwright snapshot is available. Call browser_navigate first."));
            return Files.readString(newest, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No current-run Playwright snapshot is available. Call browser_navigate first.",
                    exception);
        }
    }

    private static boolean isSnapshotName(Path path) {
        String name = path.getFileName().toString();
        return name.startsWith("page-") && name.endsWith(".yml");
    }

    private static boolean isSafeSnapshot(Path path) {
        try {
            BasicFileAttributes attributes = Files.readAttributes(
                    path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
            return attributes.isRegularFile()
                    && !attributes.isSymbolicLink()
                    && attributes.size() > 0
                    && attributes.size() <= MAX_SNAPSHOT_BYTES;
        } catch (IOException exception) {
            return false;
        }
    }

    private java.nio.file.attribute.FileTime modifiedTime(Path path) {
        try {
            return Files.getLastModifiedTime(path, LinkOption.NOFOLLOW_LINKS);
        } catch (IOException exception) {
            return java.nio.file.attribute.FileTime.fromMillis(0);
        }
    }
}
```

### 4. Ajoutez Playwright MCP et des autorisations limitées

Construisez la configuration de session complète et envoyez le prompt d'éléments probants du navigateur :

```java
var lookup = ToolDefinition.from(
        "accessibility_rule_lookup",
        "Looks up read-only WCAG guidance maintained by this application.",
        Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
        AccessibilityReport::lookupRule).skipPermission(true);
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);

var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup, readSnapshot))
        .setAvailableTools(List.of(
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate"))
        .setMcpServers(Map.of("playwright", new McpStdioServerConfig()
                .setCommand("npx")
                .setArgs(List.of("-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"))
                .setWorkingDirectory(workingDirectory.toString())
                .setTools(List.of("browser_navigate"))))
        .setOnPermissionRequest((request, ignored) -> {
            if ("mcp".equals(request.getKind())
                    && isExactNavigation(request.getExtensionData(), target)) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            return java.util.concurrent.CompletableFuture.completedFuture(
                    PermissionRequestResult.reject(
                            "This workshop allows Playwright to navigate only to the exact requested target. "
                                    + "MCP requests without target data remain denied unless the explicit "
                                    + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
        });

try (var client = new CopilotClient()) {
    client.start().get();
    var session = client.createSession(config).get();
    var response = session.sendAndWait(new MessageOptions().setPrompt(
            """
            Open %s with browser_navigate.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Return the observed page title only.

            The permission handler must approve only this exact Playwright navigation target."""
                    .formatted(target))).get();
    if (response == null) {
        throw new IllegalStateException("Copilot completed without an assistant message.");
    }
    System.out.println(response.getData().content());
}
```

Ajoutez les imports MCP et d'autorisations :

```java
import com.github.copilot.rpc.McpStdioServerConfig;
import com.github.copilot.rpc.PermissionRequestResult;
```

## Exécutez-le

```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

La première exécution peut prendre plus de temps pendant que `npx` démarre Playwright. Cette
commande active intentionnellement la solution de secours temporaire de démonstration locale
ci-dessus ; omettez l'indicateur pour conserver la stratégie stricte de fermeture en cas d'échec.

Cherchez un titre de page tel que :

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| `npx` ne peut pas démarrer | Réexécutez la commande MCP de préparation et vérifiez que Node.js est sur `PATH`. |
| Playwright ne trouve pas de navigateur | Installez Edge ou Chrome, ou configurez un navigateur installé comme décrit par Playwright MCP. |
| Une autorisation est rejetée | Le gestionnaire par défaut refuse intentionnellement les charges utiles de demande manquantes ou non exactes. Utilisez la cible exacte lorsque le SDK la fournit ; pour cette cible contrôlée uniquement, ajoutez `--allow-local-demo-mcp` jusqu'à ce que [#2273](https://github.com/github/copilot-sdk/issues/2273) soit corrigé. |
| Aucun instantané de l'exécution en cours n'est disponible | Conservez l'ordre du prompt : appelez `browser_navigate` avant `read_latest_accessibility_snapshot`. |
| Types MCP ou d'autorisation non résolus | Ajoutez les imports `McpStdioServerConfig` et `PermissionRequestResult`. |

</details>

<details>
<summary>Implémentation complète de l'étape 4</summary>

Comparez votre travail à cette implémentation complète de l'étape 4.

Câblage de session depuis `AccessibilityReport.java` :

```java
var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup, readSnapshot))
        .setAvailableTools(List.of(
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate"))
        .setMcpServers(Map.of("playwright", new McpStdioServerConfig()
                .setCommand("npx")
                .setArgs(List.of("-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"))
                .setWorkingDirectory(workingDirectory.toString())
                .setTools(List.of("browser_navigate"))))
        .setOnPermissionRequest((request, ignored) -> {
            if ("mcp".equals(request.getKind())
                    && isExactNavigation(request.getExtensionData(), target)) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            return java.util.concurrent.CompletableFuture.completedFuture(
                    PermissionRequestResult.reject(
                            "This workshop allows Playwright to navigate only to the exact requested target. "
                                    + "MCP requests without target data remain denied unless the explicit "
                                    + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
        });
```

</details>
:::

> **Vous pouvez combiner les outils quand :** le terminal affiche l'activité d'outils Playwright nommés et
> imprime le titre de la page cible.

## Vérifiez votre compréhension

Pourquoi Playwright est-il ici un serveur MCP plutôt qu'un autre callback propre à l'application ?

<details>
<summary>Vérifiez votre réponse</summary>

Playwright fournit une automatisation de navigateur réutilisable dans son propre processus, avec ses
propres dépendances. MCP le connecte sans déplacer la logique du navigateur dans le code du domaine
de l'application, et les autorisations protègent la limite du processus.

</details>

## En savoir plus

- [Model Context Protocol](https://modelcontextprotocol.io/) : la norme ouverte que le serveur Playwright
  implémente, et le vocabulaire d'où viennent les noms de ses outils.
- [Débogage MCP](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/mcp-debugging.md) :
  diagnostiquer un serveur qui ne démarre pas ou qui expose des outils différents de ceux attendus.
- [Gestion des erreurs des hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/error-handling.md) :
  décider ce qu'une session fait lorsqu'un appel d'outil ou un gestionnaire échoue.
- [Dossiers de plugins](https://github.com/github/copilot-sdk/blob/main/docs/features/plugin-directories.md) :
  regrouper des serveurs MCP, des skills et des hooks afin qu'une session les charge comme une seule unité.

Continuez vers [Étape 5 : Combinez des outils locaux et MCP](05-combine-tools.md).
